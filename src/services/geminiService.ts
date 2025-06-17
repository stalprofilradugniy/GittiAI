import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
const activeChats = new Map<string, Chat>(); // Store active chats by model name

if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.error("Ошибка при инициализации GoogleGenAI:", error);
    ai = null; // Ensure ai is null if initialization fails
  }
} else {
  console.warn("API_KEY для Gemini не установлен. AI функциональность будет недоступна.");
}

export const isApiKeyConfigured = (): boolean => {
  return !!API_KEY && !!ai;
};

const getErrorMessageForChatFailure = (isRetry: boolean = false): string => {
  if (!isApiKeyConfigured()) {
    return "Гитти не может ответить, так как Ключ Gemini API не настроен. Пожалуйста, скажите взрослому. 🛠️";
  }
  if (isRetry) {
    return "Извините, у Гитти произошел небольшой сбой, и он потерял нашу беседу! Не могли бы вы спросить еще раз? Я весь во внимании! 👂 Если ошибка повторится, возможно, проблема с API ключом или сервисом Gemini.";
  }
  return "Ой! Гитти слишком усердно думал и немного застрял. Попробуйте спросить что-нибудь другое или повторите попытку через мгновение! 🎸";
};

const initializeChatForModel = (modelName: string): Chat | null => {
  if (!ai) return null;
  console.log(`Инициализация нового чата для модели: ${modelName}`);
  try {
    const chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        // Можно добавить другие параметры конфигурации, если необходимо
      },
    });
    activeChats.set(modelName, chat);
    return chat;
  } catch (error) {
    console.error(`Ошибка при создании чата для модели ${modelName}:`, error);
    return null;
  }
};

const getChatForModel = (modelName: string): Chat | null => {
  if (!activeChats.has(modelName)) {
    return initializeChatForModel(modelName);
  }
  return activeChats.get(modelName) || null;
};

export const getGuitarLessonResponse = async (prompt: string, modelName: string): Promise<string> => {
  if (!isApiKeyConfigured()) {
    return getErrorMessageForChatFailure();
  }

  let chat = getChatForModel(modelName);
  if (!chat) {
    return "Не удалось инициализировать чат с Гитти для выбранной модели. Попробуйте еще раз.";
  }

  try {
    const result: GenerateContentResponse = await chat.sendMessage({ message: prompt });
    return result.text;
  } catch (error) {
    console.error(`Ошибка при вызове Gemini API (getGuitarLessonResponse) для модели ${modelName}:`, error);
    // Попытка переинициализировать чат при определенных ошибках
    if (error instanceof Error && (error.message.includes('Chat session not found') || error.message.includes('invalid_argument') || error.message.includes('400'))) {
      console.warn(`Попытка переинициализации чата для модели ${modelName} из-за ошибки: ${error.message}`);
      chat = initializeChatForModel(modelName); // Переинициализация для конкретной модели
      if (!chat) {
        return getErrorMessageForChatFailure(true); // Сообщение о сбое перезапуска
      }
      // После успешной переинициализации можно попытаться отправить сообщение еще раз или просто сообщить пользователю
      // Для простоты, пока просто сообщим пользователю о необходимости повторить запрос
      return getErrorMessageForChatFailure(true);
    }
    return getErrorMessageForChatFailure();
  }
};

export const startNewTopic = async (initialPrompt: string, modelName: string): Promise<string> => {
  if (!isApiKeyConfigured()) {
    return getErrorMessageForChatFailure();
  }
  
  // Принудительно создаем новую сессию чата для новой темы для указанной модели
  const chat = initializeChatForModel(modelName);
  if (!chat) {
    return "У Гитти возникли проблемы с началом новой темы. Пожалуйста, попробуйте еще раз позже!";
  }
  // Отправляем начальный промпт для этой новой темы
  return getGuitarLessonResponse(initialPrompt, modelName);
};