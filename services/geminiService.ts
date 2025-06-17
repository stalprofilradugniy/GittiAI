
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.error("API_KEY для Gemini не установлен в переменных окружения. Приложение покажет сообщение об ошибке.");
}

let chat: Chat | null = null;

function initializeChat(): Chat | null {
  if (!ai) return null;
  return ai.chats.create({
    model: 'gemini-2.5-flash-preview-04-17',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7, 
    },
  });
}

// Ensure chat is initialized before first use, or re-initialized if needed.
const ensureChatInitialized = <T,>(operation: () => Promise<T>, fallbackValue: T): Promise<T> => {
  if (!API_KEY || !ai) {
    console.error("API ключ Gemini не настроен.");
    return Promise.resolve(fallbackValue);
  }
  if (!chat) {
    chat = initializeChat();
    if (!chat) {
      // Still couldn't initialize, possibly due to AI client issue
       return Promise.resolve(fallbackValue);
    }
  }
  return operation();
};


export const getGuitarLessonResponse = async (prompt: string): Promise<string> => {
  return ensureChatInitialized(async () => {
    if(!chat) return "Гитти сейчас недоступен, так как сервис ИИ не настроен. Пожалуйста, скажите взрослому, чтобы он проверил API ключ!";
    try {
      const result: GenerateContentResponse = await chat.sendMessage({ message: prompt });
      return result.text;
    } catch (error) {
      console.error("Ошибка при вызове Gemini API (getGuitarLessonResponse):", error);
      if (error instanceof Error && (error.message.includes('Chat session not found') || error.message.includes('invalid_argument'))) {
          chat = initializeChat(); // Re-initialize chat
          if (!chat) return "У Гитти произошел сбой, и он не смог перезапуститься. Может, попробовать позже?";
          // Optionally, retry the message or inform the user
          return "Извините, у Гитти произошел небольшой сбой, и он потерял нашу беседу! Не могли бы вы спросить еще раз? Я весь во внимании! 👂";
      }
      return "Ой! Гитти слишком усердно думал и немного застрял. Попробуйте спросить что-нибудь другое или повторите попытку через мгновение! 🎸";
    }
  }, "Гитти сейчас недоступен, так как сервис ИИ не настроен. Пожалуйста, скажите взрослому, чтобы он проверил API ключ!");
};

export const startNewTopic = async (initialPrompt: string): Promise<string> => {
   if (!API_KEY || !ai) {
    return "Гитти сейчас недоступен, так как сервис ИИ не настроен. Пожалуйста, скажите взрослому, чтобы он проверил API ключ!";
  }
  // Create a new chat session for the new topic
  chat = initializeChat();
  if (!chat) {
    return "У Гитти возникли проблемы с началом новой темы. Пожалуйста, попробуйте еще раз позже!";
  }
  // Now send the initial prompt for this new topic using the existing getGuitarLessonResponse logic
  // This effectively uses the new 'chat' instance.
  return getGuitarLessonResponse(initialPrompt);
};