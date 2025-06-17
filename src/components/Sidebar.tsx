
import React from 'react';
import { PredefinedTopic } from '../types';
import { GuitarIcon, MenuIcon } from './Icons';

interface SidebarProps {
  topics: PredefinedTopic[];
  onSelectTopic: (prompt: string, title: string, isInitialSetup?: boolean, topicId?: string) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isApiConfigured: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ topics, onSelectTopic, isOpen, setIsOpen, isApiConfigured }) => {
  const getTopicIcon = (title: string): string => {
    if (title.startsWith('👋')) return '👋';
    if (title.startsWith('🎸')) return '🎸';
    if (title.startsWith('🧑‍🎸')) return '🧑‍🎸';
    if (title.startsWith('🎧')) return '🎧';
    if (title.startsWith('🎶')) return '🎶';
    if (title.startsWith('🎵')) return '🎵';
    if (title.startsWith('✨')) return '✨';
    if (title.startsWith('☀️')) return '☀️';
    if (title.startsWith('🥁')) return '🥁';
    if (title.startsWith('🚀')) return '🚀';
    if (title.startsWith('🌟')) return '🌟';
    if (title.startsWith('🚌')) return '🚌';
    if (title.startsWith('🎂')) return '🎂';
    if (title.startsWith('🔔')) return '🔔';
    if (title.startsWith('🐑')) return '🐑';
    if (title.startsWith('🦗')) return '🦗';
    if (title.startsWith('🎁')) return '🎁';
    if (title.startsWith('🚂')) return '🚂';
    return '🎓'; // Default icon
  };

  return (
    <aside className={`h-full bg-orange-500 text-white flex flex-col shadow-lg transition-all duration-300 ease-in-out ${isOpen ? 'w-72 md:w-80 p-4' : 'w-0 p-0'} overflow-hidden`} aria-hidden={!isOpen}>
      {isOpen && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <GuitarIcon className="w-8 h-8 mr-2 text-yellow-300" />
              <h2 className="text-xl font-bold" id="sidebar-title">Уроки Гитти</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 md:hidden"
              aria-label="Закрыть боковое меню"
              aria-controls="sidebar-nav" // Points to the nav
            >
              <MenuIcon className="w-6 h-6 transform rotate-90" /> {/* Visually indicates close */}
            </button>
          </div>
          <nav id="sidebar-nav" className="flex-grow overflow-y-auto pr-1" aria-labelledby="sidebar-title">
            <ul>
              {topics.map((topic) => {
                // The 'intro' topic can always be selected, even if API is not configured,
                // as it's used to display the API key error message.
                const isDisabled = !isApiConfigured && topic.id !== 'intro';
                const topicIcon = getTopicIcon(topic.title);
                const displayTitle = topic.title.substring(topic.title.indexOf(' ') + 1);

                return (
                  <li key={topic.id} className="mb-2">
                    <button
                      onClick={() => {
                        if (!isDisabled) {
                          onSelectTopic(topic.prompt, topic.title, false, topic.id);
                          if (window.innerWidth < 768) setIsOpen(false); // Close sidebar on mobile after selection
                        }
                      }}
                      disabled={isDisabled}
                      aria-disabled={isDisabled}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-150 text-sm flex items-center group
                                  ${isDisabled 
                                    ? 'opacity-60 cursor-not-allowed'
                                    : 'hover:bg-orange-600 focus:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-yellow-300'
                                  }`}
                    >
                      <span className="mr-2 text-yellow-300 group-hover:text-yellow-200 transition-colors duration-150" aria-hidden="true">{topicIcon}</span>
                      {displayTitle}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          {!isApiConfigured && (
            <div className="mt-4 p-2.5 bg-yellow-300 text-orange-800 rounded-md text-xs text-center font-semibold" role="status">
              AI функции ограничены. Нужен API ключ.
            </div>
          )}
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