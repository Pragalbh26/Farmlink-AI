import React from 'react';
import { Sparkles } from 'lucide-react';

export const SuggestionChips = ({ onSelectPrompt }) => {
  const suggestions = [
    { label: '🌾 Am I eligible for PM-KISAN?', query: 'am i eligible for pm kisan?' },
    { label: '🍅 Why are tomato prices falling in Pune?', query: 'why are tomato prices fluctuating in pune?' },
    { label: '🍃 How to prevent leaf curl in chili?', query: 'how to prevent leaf curl in chili?' },
    { label: '🧪 Subsidy on helicopter farming (Abstention test)', query: 'what is the subsidy on helicopter farming in rajasthan?' },
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
