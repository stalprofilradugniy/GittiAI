
import React, { useState } from 'react';
import { PaperAirplaneIcon } from './Icons';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean; // isLoading also implies API status (true if API not configured or general loading)
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 md:p-4 bg-white border-t border-orange-200 shadow- ऊपर-md">
      <div className="flex items-center space-x-2 md:space-x-3 bg-gray-100 rounded-full p-1 border border-gray-300 focus-within:ring-2 focus-within:ring-orange-400 transition-all">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isLoading ? "Гитти занят..." : "Спросите Гитти или напишите здесь..."}
          className="flex-grow p-2.5 md:p-3 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-500 text-sm md:text-base rounded-full"
          disabled={isLoading}
          aria-label="Поле для ввода сообщения"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className={`p-2.5 md:p-3 rounded-full text-white transition-colors duration-200
            ${isLoading || !inputValue.trim() 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-orange-500 hover:bg-orange-600 focus:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300'}`}
          aria-label="Отправить сообщение"
        >
          {isLoading && !inputValue.trim() ? ( // Show spinner only if genuinely loading and input is empty, otherwise it might be API not configured
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <PaperAirplaneIcon className="w-5 h-5 md:w-6 md:h-6" />
          )}
        </button>
      </div>
    </form>
  );
};