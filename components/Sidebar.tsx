
import React from 'react';
import { PredefinedTopic } from '../types';
import { GuitarIcon, MenuIcon } from './Icons';

interface SidebarProps {
  topics: PredefinedTopic[];
  onSelectTopic: (prompt: string, title: string) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar: React.FC<SidebarProps> = ({ topics, onSelectTopic, isOpen, setIsOpen }) => {
  return (
    <aside className={`h-full bg-orange-500 text-white flex flex-col shadow-lg transition-all duration-300 ease-in-out ${isOpen ? 'w-72 md:w-80 p-4' : 'w-0 p-0'} overflow-hidden`}>
      {isOpen && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <GuitarIcon className="w-8 h-8 mr-2 text-yellow-300" />
              <h2 className="text-xl font-bold">Уроки Гитти</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 md:hidden"
              aria-label="Закрыть боковое меню"
            >
              <MenuIcon className="w-6 h-6 transform rotate-90" />
            </button>
          </div>
          <nav className="flex-grow overflow-y-auto pr-1">
            <ul>
              {topics.map((topic) => (
                <li key={topic.id} className="mb-2">
                  <button
                    onClick={() => {
                      onSelectTopic(topic.prompt, topic.title);
                      if (window.innerWidth < 768) setIsOpen(false); // Close sidebar on mobile after selection
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-orange-600 focus:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-colors duration-150 text-sm flex items-center group"
                  >
                    <span className="mr-2 text-yellow-300 group-hover:text-yellow-200 transition-colors duration-150">{topic.title.startsWith('👋') ? '👋' : topic.title.startsWith('🎸') ? '🎸' : topic.title.startsWith('🧑‍🎸') ? '🧑‍🎸' : topic.title.startsWith('🎧') ? '🎧' : topic.title.startsWith('🎶') ? '🎶' : topic.title.startsWith('🎵') ? '🎵' : topic.title.startsWith('✨') ? '✨' : topic.title.startsWith('☀️') ? '☀️' : topic.title.startsWith('🥁') ? '🥁' : topic.title.startsWith('🚀') ? '🚀' : topic.title.startsWith('🌟') ? '🌟' : topic.title.startsWith('🚌') ? '🚌' : '🎓'}</span>
                    {topic.title.substring(topic.title.indexOf(' ') + 1)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto pt-4 border-t border-orange-400">
            <p className="text-xs text-orange-200 text-center">
              &copy; {new Date().getFullYear()} Гитти - Веселая AI Гитара!
            </p>
          </div>
        </>
      )}
    </aside>
  );
};