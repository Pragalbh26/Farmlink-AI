import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Mic, MicOff, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ChatMessage } from '../components/chat/ChatMessage';
import { SuggestionChips } from '../components/chat/SuggestionChips';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/client';

export const Chatbot = () => {
  const { t } = useLanguage();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Namaste! I am your **AgriConnect Grounded Assistant**. Ask me about government scheme eligibility, AGMARKNET mandi trends, ICAR pest/disease management, or input subsidies.',
      sources: [
        { title: 'myScheme National Knowledge Portal', url: 'https://myscheme.gov.in', verifiedAt: '2026-08-01' },
        { title: 'ICAR Agronomic Guidelines', url: 'https://icar.gov.in', verifiedAt: '2026-07-20' }
      ],
      isAbstention: false,
      time: '09:00 AM'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.request('/chat', {
        method: 'POST',
        body: { message: textToSend }
      });

      if (res.success) {
        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: res.data.answer,
          sources: res.data.sources,
          isAbstention: res.data.isAbstention,
          routeIntent: res.data.routeIntent,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Sorry, I am temporarily unable to retrieve authoritative evidence from the knowledge base. Please retry shortly.',
        sources: [],
        isAbstention: true,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate voice input recognition
      setTimeout(() => {
        setInput('am i eligible for pm kisan?');
        setIsRecording(false);
      }, 1800);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Chat Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Bot className="w-6 h-6 text-emerald-700" />
              <span>{t('chat')}</span>
            </h1>
            <Badge variant="green" size="sm">RAG Grounded</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Answers strictly retrieved from official portals & agronomic publications with zero hallucinated claims.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessages([messages[0]])}
          icon={RefreshCw}
        >
          Clear Thread
        </Button>
      </div>

      {/* Chat Messages Log Area */}
      <Card padding="p-4 sm:p-6" className="flex-1 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 animate-pulse">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Bot className="w-4 h-4" />
            </div>
            <span>Retrieving verified documentation & generating grounded answer...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </Card>

      {/* Suggestion Chips */}
      <SuggestionChips onSelectPrompt={(q) => handleSend(q)} />

      {/* Input Box & Voice Button */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-1"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything (e.g., 'PM-KISAN eligibility rules', 'Tomato price outlook')..."
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 pr-12 text-slate-900 text-sm sm:text-base min-h-[48px] focus:border-emerald-600 focus:outline-none shadow-xs"
          />
          <button
            type="button"
            onClick={toggleMic}
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition cursor-pointer ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-100'
            }`}
            title="Simulate Voice Input"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!input.trim() || loading}
          icon={Send}
        >
          Send
        </Button>
      </form>
    </div>
  );
};
