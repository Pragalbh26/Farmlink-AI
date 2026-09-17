import React from 'react';
import { Bot, User, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

export const ChatMessage = ({ message }) => {
  const isBot = message.sender === 'bot';

  return (
    <div className={`flex gap-3 sm:gap-4 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm shrink-0 shadow-xs ${
          isBot
            ? 'bg-emerald-700 text-white shadow-emerald-900/20'
            : 'bg-slate-800 text-white'
        }`}
      >
        {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>

      {/* Message Content */}
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 space-y-3 ${
          isBot
            ? 'bg-white border border-slate-200/90 text-slate-800 shadow-xs'
            : 'bg-emerald-700 text-white'
        }`}
      >
        {/* Text body */}
        <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
          {message.text}
        </div>

        {/* Grounded Citation & Source Cards for Bot */}
        {isBot && message.sources && message.sources.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Grounded Knowledge Sources</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-xs font-semibold transition"
                >
                  <span className="truncate max-w-[200px]">{src.title}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Abstention Badge if verified info is unavailable */}
        {isBot && message.isAbstention && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Strict Abstention: No hallucinated facts generated without verified official source.</span>
          </div>
        )}

        {/* Timestamp & Route Intent */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
          <span>{message.time || 'Just now'}</span>
          {isBot && message.routeIntent && (
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              routed: {message.routeIntent}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
