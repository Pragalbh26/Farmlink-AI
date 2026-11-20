import React from 'react';
import { Sparkles } from 'lucide-react';

export const SuggestionChips = ({ onSelectPrompt }) => {
  const suggestions = [
    { label: 'Am I eligible for PM-KISAN?', query: 'Am I eligible for PM-KISAN?' },
    { label: 'Tomato price outlook this week', query: 'What is the tomato price outlook this week?' },
    { label: 'How to prevent leaf curl in chili?', query: 'How to prevent leaf curl in chili?' },
    { label: 'Documents needed for Kisan Credit Card', query: 'What documents are needed for Kisan Credit Card?' },
  ];

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {suggestions.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onSelectPrompt(item.query)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-200/80 text-xs font-semibold transition cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};
