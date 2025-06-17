
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { PREDEFINED_TOPICS } from './constants';
import { ChatMessage } from './types';
import { getGuitarLessonResponse, startNewTopic } from './services/geminiService';
import { GuitarIcon, SparklesIcon, MenuIcon } from './components/Icons';

const App: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(window.innerWidth >= 768); // Open by default on larger screens

  const addMessageToList = useCallback((role: 'user' | 'assistant' | 'system', content: string) => {
    setChatMessages(prevMessages => [
      ...prevMessages,
      { id: Date.now().toString() + Math.random().toString(), role, content, timestamp: new Date() },
    ]);
  },[]);

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim()) return;
    addMessageToList('user', userInput);
    setIsLoading(true);
    setError(null);
    try {
      const aiResponse = await getGuitarLessonResponse(userInput);
      addMessageToList('assistant', aiResponse);
    } catch (e) {
      console.error("Ошибка в handleSendMessage:", e);
      const errorMessage = e instanceof Error ? e.message : 'Произошла неизвестная ошибка при отправке вашего сообщения.';
      setError(`У Гитти возникла проблема: ${errorMessage}`);
      addMessageToList('assistant', `Ой! У меня небольшие проблемы с подключением. Пожалуйста, попробуйте еще раз чуть позже! 🛠️`);
    } finally {
      setIsLoading(false);
    }
  }, [addMessageToList]);


  const handleSelectTopic = useCallback(async (topicPrompt: string, topicTitle: string, isInitialSetup: boolean = false) => {
    setIsLoading(true);
    setError(null);

    if (!isInitialSetup) {
      setChatMessages([]); // Clear previous messages for a new topic
      addMessageToList('assistant', `Хорошо, давай узнаем о "${topicTitle}"! Гитти уже готовит это... 🎸✨`);
    } else {
      setChatMessages([]); // Clear for initial setup too
    }

    try {
      const aiResponse = await startNewTopic(topicPrompt);
      
      // If it was an explicit topic selection, remove the placeholder before adding the actual response
      if (!isInitialSetup) {
        setChatMessages(prev => prev.filter(m => !m.content.includes(`"${topicTitle}"! Гитти уже готовит это...`)));
      }
      addMessageToList('assistant', aiResponse);

    } catch (e) {
      console.error(`Ошибка в handleSelectTopic для "${topicTitle}":`, e);
      const errorMessage = e instanceof Error ? e.message : 'Произошла неизвестная ошибка при начале темы.';
      setError(`У Гитти возникла проблема с началом темы "${topicTitle}": ${errorMessage}`);
      addMessageToList('assistant', `Хм, я немного застрял(а) на теме "${topicTitle}". Может, попробуем другую или зададим вопрос? 🤔`);
    } finally {
      setIsLoading(false);
    }
  }, [addMessageToList]);
  
  // Initial welcome message
  useEffect(() => {
    const initialTopic = PREDEFINED_TOPICS.find(topic => topic.id === 'intro');
    if (initialTopic) {
      handleSelectTopic(initialTopic.prompt, initialTopic.title, true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // handleSelectTopic is memoized and doesn't need to be in deps if it doesn't change

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        // setIsSidebarOpen(false); // Only close if it was explicitly opened by user on small screen? Or always close. Current behavior: always close.
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <div className="flex h-screen max-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-amber-200 font-sans antialiased overflow-hidden">
      <Sidebar
        topics={PREDEFINED_TOPICS}
        onSelectTopic={handleSelectTopic}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <div className="flex flex-col flex-1 h-screen max-h-screen overflow-hidden">
        <header className="bg-white/90 backdrop-blur-md shadow-sm p-3 md:p-4 flex items-center justify-between border-b border-orange-200 flex-shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-400 mr-2 text-orange-600"
              aria-label={isSidebarOpen ? "Закрыть боковое меню" : "Открыть боковое меню"}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <GuitarIcon className="w-7 h-7 md:w-8 md:h-8 text-orange-500 mr-2" />
            <h1 className="text-xl md:text-2xl font-bold text-orange-600">Гитти - AI Учитель Гитары</h1>
            <SparklesIcon className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 ml-1.5 md:ml-2" />
          </div>
        </header>

        <ChatWindow messages={chatMessages} isLoading={isLoading} />

        {error && (
          <div className="p-2 md:p-3 bg-red-100 text-red-700 text-xs md:text-sm border-t border-red-200 flex-shrink-0">
            <strong>Ошибка:</strong> {error}
          </div>
        )}

        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default App;