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
      text: 'Namaste! This assistant is currently a demonstration. Its replies are fixed examples and are not verified agricultural or scheme advice.',
      sources: [],
      isAbstention: false,
      time: '09:00 AM'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState('');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

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
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Voice recognition is not supported in this browser. You can type your question instead.');
      return;
    }
    setVoiceError('');
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => setInput(event.results[0][0].transcript);
    recognition.onerror = () => setVoiceError('Voice recognition could not complete. Check microphone permission or type your question.');
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsRecording(true);
    } catch {
      setVoiceError('Voice recognition could not start. Type your question instead.');
      setIsRecording(false);
    }
  };

  useEffect(() => () => recognitionRef.current?.stop(), []);

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
            <Badge variant="amber" size="sm">Demo assistant adapter</Badge>
          </div>
          <p className="text-xs text-slate-500">
            This local backend currently returns a fixed demo response; connect a verified knowledge retrieval service before relying on its advice.
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
            <span>Waiting for the demo assistant…</span>
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
            title="Use voice input"
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
      {voiceError && <p role="status" className="text-xs text-amber-800">{voiceError}</p>}
    </div>
  );
};
