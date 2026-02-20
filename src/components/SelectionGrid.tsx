import React from 'react';
import { OptionItem } from '../services/gemini';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface SelectionGridProps {
  title: string;
  items: OptionItem[];
  selectedIds: string[];
  onToggle: (item: OptionItem) => void;
  colorClass: string;
}

export const SelectionGrid: React.FC<SelectionGridProps> = ({ 
  title, 
  items, 
  selectedIds, 
  onToggle,
  colorClass
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4 px-2">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggle(item)}
              className={`
                relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 h-40
                ${isSelected 
                  ? `border-${colorClass}-500 bg-${colorClass}-50 shadow-md` 
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }
              `}
            >
              <div className="text-4xl mb-3">{item.emoji}</div>
              <div className="font-medium text-slate-900 text-center leading-tight">{item.name}</div>
              <div className="text-xs text-slate-500 text-center mt-1 line-clamp-2">{item.description}</div>
              
              {isSelected && (
                <div className={`absolute top-2 right-2 w-6 h-6 rounded-full bg-${colorClass}-500 text-white flex items-center justify-center`}>
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
