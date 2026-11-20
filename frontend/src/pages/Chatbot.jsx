import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Mic, MicOff, RefreshCw } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ChatMessage } from '../components/chat/ChatMessage';
import { SuggestionChips } from '../components/chat/SuggestionChips';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/client';

export const Chatbot = () => {
  const { t, lang } = useLanguage();

  const buildWelcomeMessage = (currentLang) => ({
    id: 1,
    sender: 'bot',
    text:
      currentLang === 'hi'
        ? 'नमस्ते! मैं FarmLink AI हूँ। आप मुझसे खेती, मंडी भाव, फसल रोग, सरकारी योजनाओं या किसी भी सामान्य विषय के बारे में बात कर सकते हैं। आज मैं आपकी क्या मदद कर सकता हूँ?'
        : 'Namaste! I am FarmLink AI. Ask me anything—whether it is Indian farming, mandi prices, crop diseases, government schemes, or any general question. How can I help you today?',
    sources: [],
    isAbstention: false,
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  });

  const [messages, setMessages] = useState(() => [buildWelcomeMessage(lang)]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const textToSend = (queryText ?? input).trim();
    if (!textToSend || loading) return;

    const historyPayload = messages
      .filter((m) => m.id !== 1)
      .slice(-12)
      .map((m) => ({ sender: m.sender, text: m.text }));

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.request('/chat/', {
        method: 'POST',
        body: {
          message: textToSend,
          history: historyPayload,
          lang,
        },
      });

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.response || res.data?.response || res.data?.answer || 'No response received.',
        sources: res.sources || res.data?.sources || [],
        isAbstention: false,
        routeIntent: res.model_version || res.data?.model_version || 'gemini',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text:
            lang === 'hi'
              ? 'क्षमा करें, अभी FarmLink AI सर्वर से संपर्क नहीं हो पा रहा है। कृपया जांचें कि Django सर्वर चल रहा है।'
              : 'Sorry, I am temporarily unable to reach the FarmLink AI backend. Please verify that the Django server is running.',
          sources: [],
          isAbstention: false,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
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
      setVoiceError('Voice recognition is not supported in this browser.');
      return;
    }
    setVoiceError('');
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => setInput(event.results[0][0].transcript);
    recognition.onerror = () => setVoiceError('Voice recognition failed. Check microphone permissions.');
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  useEffect(() => () => recognitionRef.current?.stop(), []);

  return (
    <div className="space-y-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Bot className="w-6 h-6 text-emerald-700" />
              <span>{t('chat')}</span>
            </h1>
            <Badge variant="green" size="sm">Live Connected</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Powered by Google Gemini — Ask any farming or general question with full conversation memory.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessages([buildWelcomeMessage(lang)])}
          icon={RefreshCw}
        >
          Clear Thread
        </Button>
      </div>

      <Card padding="p-4 sm:p-6" className="flex-1 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {loading && (
          <div className="text-xs text-slate-500 italic px-2">
            {lang === 'hi' ? 'FarmLink AI उत्तर तैयार कर रहा है...' : 'FarmLink AI is thinking...'}
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card>

      <SuggestionChips onSelectPrompt={(q) => handleSend(q)} />

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
            placeholder="Ask anything (e.g., 'PM-KISAN rules', 'Tomato prices', or any general question)..."
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 pr-12 text-slate-900 min-h-[48px] focus:border-emerald-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={toggleMic}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
            title="Voice Input"
          >
            {isRecording ? (
              <MicOff className="w-4 h-4 text-rose-600" />
            ) : (
              <Mic className="w-4 h-4 text-slate-500" />
            )}
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
      {voiceError && <p className="text-xs text-amber-800">{voiceError}</p>}
    </div>
  );
};