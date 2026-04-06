import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, Mic, Sprout, User, Zap, Leaf, Droplets,
  CloudSun, FlaskConical, ChevronRight, Volume2,
  RotateCcw, Sparkles, Loader, AlertTriangle
} from 'lucide-react';
import Layout from '../components/Layout';
import api from '../services/api';

/* ── Helper Functions ──────────────────────────────── */
function generateQuickSuggestions(farmData) {
  const suggestions = [
    { text: 'How is my soil health?', icon: FlaskConical },
    { text: 'Tomorrow\'s weather outlook', icon: CloudSun },
    { text: 'Irrigation schedule', icon: Droplets },
  ];

  // Add context-specific suggestions based on farm data
  if (farmData?.soil?.pH < 6.0) {
    suggestions.unshift({ text: 'How to improve soil pH?', icon: Leaf });
  } else if (farmData?.soil?.N < 150) {
    suggestions.unshift({ text: 'Best nitrogen fertilizers?', icon: Zap });
  } else {
    suggestions.unshift({ text: 'Best crops for this season?', icon: Leaf });
  }

  return suggestions;
}

async function callChatAPI(message, sessionId = null) {
  try {
    const response = await api.post('/chat/message', {
      message,
      sessionId,
      language: 'en',
      streaming: false
    });
    
    return {
      response: response.data.response,
      sessionId: response.data.sessionId,
      messageId: response.data.messageId,
      sources: response.data.ragSources || []
    };
  } catch (error) {
    console.error('Chat API error:', error);
    throw new Error(error.response?.data?.error || 'Failed to get AI response');
  }
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-end gap-2 mb-4"
    >
      <div className="w-7 h-7 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center flex-shrink-0">
        <Sprout className="w-3.5 h-3.5 text-brand" />
      </div>
      <div className="glass-light rounded-2xl rounded-bl-sm px-4 py-3 border border-brand/10">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-brand rounded-full typing-dot" />
          <div className="w-1.5 h-1.5 bg-brand rounded-full typing-dot" />
          <div className="w-1.5 h-1.5 bg-brand rounded-full typing-dot" />
        </div>
      </div>
    </motion.div>
  );
}

function MessageBubble({ msg }) {
  const isAI = msg.role === 'ai';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-end gap-2 mb-4 ${isAI ? '' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 ${
        isAI
          ? 'bg-brand/20 border border-brand/30'
          : 'bg-neutral-700 border border-white/10'
      }`}>
        {isAI
          ? <Sprout className="w-3.5 h-3.5 text-brand" />
          : <User className="w-3.5 h-3.5 text-neutral-300" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] md:max-w-[65%] ${isAI ? 'mr-8' : 'ml-8'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isAI
            ? msg.isError 
              ? 'bg-alert/10 border border-alert/20 text-alert rounded-bl-sm'
              : 'glass-light border border-brand/10 text-neutral-100 rounded-bl-sm'
            : 'bg-brand text-neutral-950 font-medium rounded-br-sm'
        }`}>
          {msg.text}
        </div>
        <div className={`mt-1 ${isAI ? 'text-left' : 'text-right'}`}>
          <p className="text-[10px] text-neutral-600">{msg.time}</p>
          {msg.sources && msg.sources.length > 0 && (
            <p className="text-[9px] text-neutral-700 mt-0.5">
              Sources: {msg.sources.join(', ')}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function AIChat() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [farmData, setFarmData] = useState(null);
  const [quickSuggestions, setQuickSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        
        // Fetch farm data for context
        const dashboardResponse = await api.get('/dashboard');
        setFarmData(dashboardResponse.data);
        
        // Generate suggestions based on farm data
        const suggestions = generateQuickSuggestions(dashboardResponse.data);
        setQuickSuggestions(suggestions);
        
        // Try to fetch chat sessions
        try {
          const sessionsResponse = await api.get('/chat/sessions');
          setChatSessions(sessionsResponse.data.sessions || []);
        } catch (sessionErr) {
          console.warn('Could not fetch chat sessions:', sessionErr);
          setChatSessions([]);
        }
        
        // Set initial greeting
        setMessages([{
          id: 1,
          role: 'ai',
          text: "Hello! I'm your AgriTech AI assistant. I have access to your farm data, soil analysis, and weather forecasts. How can I help you today?",
          time: 'Just now'
        }]);
        
      } catch (err) {
        console.error('Failed to initialize chat:', err);
        setError(err.response?.data?.error || 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="flex h-[calc(100dvh-4rem)] md:h-screen overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader className="w-8 h-8 text-brand animate-spin" />
              <p className="text-neutral-400">Loading AI assistant...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="flex h-[calc(100dvh-4rem)] md:h-screen overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="w-8 h-8 text-alert" />
              <p className="text-neutral-400">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-brand/10 border border-brand/20 rounded-xl text-brand hover:bg-brand/20 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const sendMessage = async (text) => {
    const txt = (text || input).trim();
    if (!txt) return;
    
    setInput('');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    const userMessage = { id: Date.now(), role: 'user', text: txt, time: now };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Call real API
      const result = await callChatAPI(txt, currentSessionId);
      
      // Update session ID if new
      if (!currentSessionId && result.sessionId) {
        setCurrentSessionId(result.sessionId);
      }
      
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        text: result.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: result.sources
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (err) {
      console.error('Failed to send message:', err);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        role: 'ai',
        text: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const startNewChat = () => {
    setMessages([{
      id: 1,
      role: 'ai',
      text: "Hello! I'm your AgriTech AI assistant. I have access to your farm data, soil analysis, and weather forecasts. How can I help you today?",
      time: 'Just now'
    }]);
    setCurrentSessionId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault(); 
      sendMessage(); 
    }
  };

  const spring = { type: 'spring', stiffness: 80, damping: 16 };

  return (
    <Layout>
      <div className="flex h-[calc(100dvh-4rem)] md:h-screen overflow-hidden">

        {/* ── Chat history sidebar (desktop only) ──── */}
        <div className="hidden lg:flex flex-col w-64 border-r border-white/[0.05] glass">
          <div className="p-4 border-b border-white/[0.05]">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Conversations</p>
          </div>
          {/* New chat */}
          <button
            onClick={startNewChat}
            className="flex items-center gap-2.5 mx-3 mt-3 p-3 rounded-2xl glass-light border border-brand/15 hover:border-brand/30 transition-colors group"
          >
            <div className="w-7 h-7 bg-brand/15 rounded-xl flex items-center justify-center group-hover:bg-brand/25 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
            </div>
            <span className="text-sm font-semibold text-brand">New Chat</span>
          </button>
          {/* History list */}
          <div className="flex-1 overflow-y-auto py-3 space-y-1 px-3">
            {chatSessions.map(({ _id, title, lastMessageAt, messageCount }) => (
              <button key={_id} className="w-full text-left p-3 rounded-xl hover:bg-white/[0.04] transition-colors group">
                <p className="text-xs font-semibold text-neutral-300 group-hover:text-neutral-100 transition-colors truncate">{title}</p>
                <p className="text-[10px] text-neutral-600 mt-0.5 truncate">{messageCount} messages</p>
                <p className="text-[10px] text-neutral-700 mt-1">{new Date(lastMessageAt).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
          {/* AI model info */}
          <div className="p-3 border-t border-white/[0.05]">
            <div className="flex items-center gap-2 p-2.5 bg-lavender/8 rounded-xl border border-lavender/15">
              <Zap className="w-3.5 h-3.5 text-lavender flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-lavender">AgriAI v2.1</p>
                <p className="text-[9px] text-neutral-600">Farm-trained model</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main chat area ────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05] glass flex-shrink-0">
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(34,197,94,0)', '0 0 16px rgba(34,197,94,0.5)', '0 0 0px rgba(34,197,94,0)'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
              className="w-9 h-9 bg-brand/20 border border-brand/30 rounded-xl flex items-center justify-center"
            >
              <Sprout className="w-4.5 h-4.5 text-brand" />
            </motion.div>
            <div>
              <p className="text-sm font-bold text-neutral-100">AgriTech AI</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
                <p className="text-[10px] text-brand font-medium">Online · Farm data synced</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={startNewChat}
                className="p-2 rounded-xl text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.06] transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-5">
            {/* AI capability chips */}
            {messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, ...spring }}
                className="flex flex-wrap gap-2 mb-6 justify-center"
              >
                {[
                  { label: 'Farm Analysis',      icon: Zap,       color: 'text-lavender bg-lavender/10 border-lavender/20' },
                  { label: 'Crop Intelligence',  icon: Leaf,      color: 'text-brand bg-brand/10 border-brand/20' },
                  { label: 'Weather Forecasts',  icon: CloudSun,  color: 'text-sky bg-sky/10 border-sky/20' },
                  { label: 'Soil Insights',      icon: FlaskConical, color: 'text-harvest bg-harvest/10 border-harvest/20' },
                ].map(({ label, icon: Icon, color }) => (
                  <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${color}`}>
                    <Icon className="w-3 h-3" />
                    {label}
                  </div>
                ))}
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
              {isTyping && <TypingIndicator key="typing" />}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions (shown after AI responds) */}
          {!isTyping && messages.length < 4 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 pb-3 flex flex-wrap gap-2"
            >
              {quickSuggestions.map(({ text, icon: Icon }) => (
                <button
                  key={text}
                  onClick={() => sendMessage(text)}
                  className="flex items-center gap-1.5 px-3 py-2 glass-light border border-brand/15 hover:border-brand/35 rounded-xl text-xs font-medium text-neutral-300 hover:text-neutral-100 transition-all"
                >
                  <Icon className="w-3 h-3 text-brand" />
                  {text}
                </button>
              ))}
            </motion.div>
          )}

          {/* Input bar */}
          <div className="px-4 pb-4 flex-shrink-0 border-t border-white/[0.05] pt-3">
            <div className="flex items-center gap-2 glass-light rounded-2xl border border-white/[0.08] hover:border-brand/20 focus-within:border-brand/30 transition-all p-1.5">
              <button className="p-2 rounded-xl text-neutral-500 hover:text-brand transition-colors">
                <Mic className="w-4 h-4" />
              </button>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your crops, soil, weather…"
                className="flex-1 bg-transparent text-sm text-neutral-100 placeholder:text-neutral-600 outline-none px-1"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className="p-2.5 bg-brand rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                <Send className="w-4 h-4 text-neutral-950" />
              </motion.button>
            </div>
            <p className="text-[10px] text-neutral-700 text-center mt-2">
              AI responses are informational. Always verify with local agronomists.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
