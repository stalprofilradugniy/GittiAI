
import React from 'react';
import { ChatMessage } from '../types';
import { GuitarIcon } from './Icons'; // Assuming Gitty is the assistant

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

  // Basic markdown-like link detection: [text](url)
  const formatContent = (content: string): React.ReactNode => {
    // Preserve line breaks and spaces by splitting and mapping
    return content.split(/(\\n)/).map((part, index) => {
      if (part === '\\n') {
        return <br key={`br-${index}`} />;
      }
      // This regex can be improved for more complex markdown, but keeps it simple for now
      // It looks for [text](url) and replaces it with an <a> tag
      const linkRegex = /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g;
      let lastIndex = 0;
      const elements: React.ReactNode[] = [];
      let match;

      while ((match = linkRegex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          elements.push(part.substring(lastIndex, match.index));
        }
        elements.push(
          <a
            key={`link-${index}-${lastIndex}`}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            {match[1]}
          </a>
        );
        lastIndex = linkRegex.lastIndex;
      }
      if (lastIndex < part.length) {
        elements.push(part.substring(lastIndex));
      }
      
      return <span key={`part-${index}`}>{elements}</span>;
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
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{formatContent(message.content)}</p>
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

// Add a simple fadeIn animation to tailwind.config.js or here as a style if needed.
// For now, it's a conceptual class name 'animate-fadeIn'.
// In a real Tailwind setup, you'd define this in tailwind.config.js:
// theme: {
//   extend: {
//     keyframes: {
//       fadeIn: {
//         '0%': { opacity: '0', transform: 'translateY(10px)' },
//         '100%': { opacity: '1', transform: 'translateY(0)' },
//       },
//     },
//     animation: {
//       fadeIn: 'fadeIn 0.3s ease-out forwards',
//     },
//   },
// },
// Since we can't modify tailwind.config.js here, the animation might not work out of the box.
// It's a visual enhancement.