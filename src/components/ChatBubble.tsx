
import React from 'react';
import { ChatMessage } from '../types';
import { GuitarIcon } from './Icons'; 

interface ChatBubbleProps {
  message: ChatMessage;
}

const UserAvatar: React.FC = () => (
  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
    Вы
  </div>
);

const AssistantAvatar: React.FC = () => (
  <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-orange-700 shadow-md">
    <GuitarIcon className="w-5 h-5" />
  </div>
);

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const formatContent = (content: string): React.ReactNode => {
    // 1. Escape HTML to prevent XSS from content that might resemble HTML tags
    const escapeHtml = (unsafe: string) => {
      return unsafe
           .replace(/&/g, "&amp;")
           .replace(/</g, "&lt;")
           .replace(/>/g, "&gt;")
           .replace(/"/g, "&quot;")
           .replace(/'/g, "&#039;");
    };

    const escapedContent = escapeHtml(content);
    
    // 2. Process newlines (both \n and literal \\n) and links
    // Split by any form of newline, then process links for each segment.
    // Using flatMap to handle <br /> elements correctly within the array.
    return escapedContent.split(/\\n|\n/).flatMap((line, lineIndex, linesArray) => {
      const linkRegex = /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g;
      const elements: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      // Find all markdown-style links in the current line
      while ((match = linkRegex.exec(line)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
          elements.push(line.substring(lastIndex, match.index));
        }
        // Add the link
        elements.push(
          <a
            key={`link-${lineIndex}-${lastIndex}`}
            href={match[2]} // URL (match[2]) is used directly as it's from a trusted regex pattern
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            {match[1]} {/* Link text (match[1]) is already HTML-escaped */}
          </a>
        );
        lastIndex = linkRegex.lastIndex;
      }
      // Add any remaining text after the last link
      if (lastIndex < line.length) {
        elements.push(line.substring(lastIndex));
      }
      
      // Add a <br /> tag if this is not the last line
      if (lineIndex < linesArray.length - 1) {
        elements.push(<br key={`br-${lineIndex}`} />);
      }
      return elements;
    });
  };

  return (
    <div className={`flex items-end mb-4 animate-fadeIn ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mr-2 flex-shrink-0">
          <AssistantAvatar />
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl px-4 py-3 rounded-xl shadow-md ${
          isUser 
            ? 'bg-orange-500 text-white rounded-br-none' 
            : 'bg-white text-gray-800 rounded-bl-none border border-orange-200'
        }`}
      >
        {/* Using a div for the content ensures block formatting for multiple <br> tags */}
        <div className="text-sm whitespace-pre-wrap leading-relaxed">{formatContent(message.content)}</div>
        <p className={`text-xs mt-1.5 ${isUser ? 'text-orange-200' : 'text-gray-400'} text-right`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && (
        <div className="ml-2 flex-shrink-0">
          <UserAvatar />
        </div>
      )}
    </div>
  );
};