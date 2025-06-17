import React from 'react';
import { MODEL_OPTIONS } from '../constants';

interface ModelSelectorProps {
  selectedModel: string;
  onChangeModel: (modelId: string) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onChangeModel, disabled }) => {
  const showDropdownArrow = MODEL_OPTIONS.length > 1;

  return (
    <div className="relative min-w-[150px]"> {/* Минимальная ширина для селектора */}
      <label htmlFor="model-select" className="sr-only">Выберите модель ИИ</label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={(e) => onChangeModel(e.target.value)}
        disabled={disabled || MODEL_OPTIONS.length <= 1} // Блокируем, если одна опция или явно указано
        className={`block appearance-none w-full bg-white border border-gray-300 px-3 py-1.5 rounded-md shadow-sm 
                    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                    text-sm text-gray-700 transition-colors
                    ${disabled || MODEL_OPTIONS.length <= 1 ? 'cursor-not-allowed opacity-70' : 'hover:border-gray-400'}`}
        aria-label="Выбор модели искусственного интеллекта"
      >
        {MODEL_OPTIONS.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {showDropdownArrow && (
         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.043-.48 1.576 0L10 10.405l2.908-2.857c.533-.48 1.14-.446 1.576 0 .436.445.408 1.197 0 1.615l-3.72 3.707c-.49.49-1.207.49-1.697 0L5.516 9.163c-.408-.418-.436-1.17 0-1.615z"/></svg>
         </div>
      )}
      {/* Сообщение, если доступна только одна модель (и она единственная) */}
      {MODEL_OPTIONS.length === 1 && !disabled && (
        <p className="text-xs text-gray-500 mt-1 absolute -bottom-4 right-0 whitespace-nowrap">
          (Только 1 модель доступна)
        </p>
      )}
    </div>
  );
};