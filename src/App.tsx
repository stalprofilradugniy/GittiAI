import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { PREDEFINED_TOPICS, MODEL_OPTIONS, DEFAULT_MODEL_ID } from './constants';
import { ChatMessage } from './types';
import { getGuitarLessonResponse, startNewTopic, isApiKeyConfigured } from './services/geminiService';
import { GuitarIcon, SparklesIcon, MenuIcon } from './components/Icons';
import { ModelSelector } from './components/ModelSelector';

const App: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(window.innerWidth >= 768);
  const [apiConfigured, setApiConfigured] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL_ID);

  const addMessageToList = useCallback((role: 'user' | 'assistant' | 'system', content: string) => {
    setChatMessages(prevMessages => [
      ...prevMessages,
      { id: Date.now().toString() + Math.random().toString(), role, content, timestamp: new Date() },
    ]);
  },[]);

  // Инициализация и обработка смены модели
  useEffect(() => {
    const configured = isApiKeyConfigured();
    setApiConfigured(configured);

    const initialTopic = PREDEFINED_TOPICS.find(topic => topic.id === 'intro');
    if (initialTopic) {
      setChatMessages([]); 
      handleSelectTopic(initialTopic.prompt, initialTopic.title, true, initialTopic.id, selectedModel);

      if (!configured) {
        setError("Ключ Gemini API не настроен. Функциональность AI будет ограничена.");
      } else {
        setError(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel]); 


  const handleModelChange = (newModelId: string) => {
    if (newModelId !== selectedModel) {
      console.log(`Модель изменена на: ${newModelId}`);
      setSelectedModel(newModelId);
      // useEffect выше обработает перезагрузку чата с новой моделью и приветственным сообщением
    }
  };

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim()) return;
    if (!apiConfigured) {
        addMessageToList('assistant', "Гитти не может ответить, так как Ключ Gemini API не настроен. Пожалуйста, скажите взрослому. 🛠️");
        return;
    }
    addMessageToList('user', userInput);
    setIsLoading(true);
    setError(null);
    try {
      const aiResponse = await getGuitarLessonResponse(userInput, selectedModel);
      addMessageToList('assistant', aiResponse);
    } catch (e) {
      console.error("Ошибка в handleSendMessage:", e);
      const errorMessage = e instanceof Error ? e.message : 'Произошла неизвестная ошибка при отправке вашего сообщения.';
      setError(`У Гитти возникла проблема: ${errorMessage}`);
      addMessageToList('assistant', `Ой! У меня небольшие проблемы с подключением к AI (Gemini API). Пожалуйста, попробуйте еще раз чуть позже! 🛠️`);
    } finally {
      setIsLoading(false);
    }
  }, [addMessageToList, apiConfigured, selectedModel]);


  const handleSelectTopic = useCallback(async (
    topicPrompt: string, 
    topicTitle: string, 
    isInitialSetup: boolean = false, 
    topicId?: string, // Добавлен для большей гибкости, если понадобится
    modelToUse?: string
  ) => {
    const currentModel = modelToUse || selectedModel;

    // Проверяем конфигурацию API. Разрешаем "intro" для отображения ошибки, если ключ не настроен.
    if (!apiConfigured && topicId !== 'intro') { 
        addMessageToList('assistant', "Гитти не может загрузить эту тему, так как Ключ Gemini API не настроен. Пожалуйста, скажите взрослому. 🛠️");
        setIsLoading(false);
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setChatMessages([]); // Очищаем чат перед загрузкой новой темы или приветствия
    
    // Сообщение о подготовке темы (только если это не начальная настройка и API сконфигурирован)
    if (!isInitialSetup && apiConfigured) { 
        addMessageToList('assistant', `Хорошо, давай узнаем о "${topicTitle}"! Гитти уже готовит это... 🎸✨`);
    }

    try {
      // startNewTopic вернет сообщение об ошибке API ключа, если API не настроен (благодаря isApiKeyConfigured внутри сервиса)
      const aiResponse = await startNewTopic(topicPrompt, currentModel); 
      
      // Удаляем сообщение о подготовке, если оно было (и API сконфигурирован)
      if (!isInitialSetup && apiConfigured) { 
        setChatMessages(prev => prev.filter(m => !m.content.includes(`"${topicTitle}"! Гитти уже готовит это...`)));
      }
      addMessageToList('assistant', aiResponse);

    } catch (e) { 
      console.error(`Ошибка в handleSelectTopic для "${topicTitle}" с моделью ${currentModel}:`, e);
      const errorMessage = e instanceof Error ? e.message : 'Произошла неизвестная ошибка при начале темы.';
      setError(`У Гитти возникла проблема с началом темы "${topicTitle}": ${errorMessage}`);
      addMessageToList('assistant', `Хм, я немного застрял(а) на теме "${topicTitle}". Может, попробуем другую или зададим вопрос? 🤔`);
    } finally {
      setIsLoading(false);
    }
  }, [addMessageToList, apiConfigured, selectedModel]); // Добавляем selectedModel в зависимости, чтобы useCallback пересоздавался при его изменении

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
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
        onSelectTopic={(prompt, title, isInitial, id) => handleSelectTopic(prompt, title, isInitial, id, selectedModel)}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isApiConfigured={apiConfigured}
      />
      
      <div className="flex flex-col flex-1 h-screen max-h-screen overflow-hidden">
        <header className="bg-white/90 backdrop-blur-md shadow-sm p-3 md:p-4 flex items-center justify-between border-b border-orange-200 flex-shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-400 mr-2 text-orange-600"
              aria-label={isSidebarOpen ? "Закрыть боковое меню" : "Открыть боковое меню"}
              aria-expanded={isSidebarOpen}
              aria-controls="sidebar-nav" // Указывает на ID навигационного элемента в сайдбаре
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <GuitarIcon className="w-7 h-7 md:w-8 md:h-8 text-orange-500 mr-2" />
            <h1 className="text-xl md:text-2xl font-bold text-orange-600">Гитти - AI Учитель Гитары</h1>
            <SparklesIcon className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 ml-1.5 md:ml-2" />
          </div>
          <div className="ml-auto pl-4">
            <ModelSelector
              selectedModel={selectedModel}
              onChangeModel={handleModelChange}
              disabled={!apiConfigured && MODEL_OPTIONS.length <= 1} // Блокируем, если API не настроен ИЛИ если всего одна модель
            />
          </div>
        </header>

        <ChatWindow messages={chatMessages} isLoading={isLoading} />

        {error && !isLoading && ( 
          <div className="p-2 md:p-3 bg-red-100 text-red-700 text-xs md:text-sm border-t border-red-200 flex-shrink-0" role="alert">
            <strong>Ошибка:</strong> {error}
          </div>
        )}

        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading || !apiConfigured} />
      </div>
    </div>
  );
};

export default App;