
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { ChatBubble } from './ChatBubble';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const LoadingIndicator: React.FC = () => (
  <div className="flex items-end mb-4 justify-start animate-fadeIn">
    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-orange-700 shadow-md mr-2 flex-shrink-0">
      <svg className="animate-spin h-5 w-5 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    <div className="max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl px-4 py-3 rounded-xl shadow-md bg-white text-gray-800 rounded-bl-none border border-orange-200">
      <p className="text-sm italic text-gray-500">Гитти думает... 🤔</p>
    </div>
  </div>
);

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  return (
    <div className="flex-grow p-4 md:p-6 overflow-y-auto bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-100">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
      {isLoading && <LoadingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};