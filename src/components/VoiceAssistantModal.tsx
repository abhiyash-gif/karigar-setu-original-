import React, { useState, useEffect, useRef } from 'react';
import { getTranslation } from '../i18n/translations';
import { aiService } from '../services/aiService';
import { useHindiVoiceRecognition } from '../hooks/useHindiVoiceRecognition';
import {
  Mic,
  MicOff,
  Send,
  X,
  Volume2,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Bot,
  User,
  CheckCircle,
  ChevronRight,
  Keyboard
} from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
  onNavigateTab: (tab: any) => void;
}

interface Message {
  id: string;
  sender: 'saathi' | 'artisan';
  text: string;
  actionText?: string;
  actionTab?: string;
  timestamp: string;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'saathi',
      text:
        currentLang === 'hi'
          ? 'नमस्ते! मैं आपका डिजिटल सहायक "कारीगर साथी" हूँ। आप बोलकर या लिखकर कुछ भी पूछ सकते हैं — जैसे नया उत्पाद कैसे जोड़ें, सही मूल्य क्या रखें, या खरीदारों से कैसे जुड़ें।'
          : 'Namaste! I am your Karigar Saathi assistant. How can I help your craft business today? You can ask me how to list crafts, set fair prices, or connect with buyers.',
      timestamp: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Native Language-Aware Speech Recognition for the modal
  const {
    isListening,
    interimTranscript,
    finalTranscript,
    voiceError,
    speakPromptLabel,
    listeningLabel,
    tryAgainLabel,
    typeInsteadLabel,
    stopLabel,
    startListening,
    stopListening,
    toggleListening,
    clearError,
  } = useHindiVoiceRecognition({
    currentLang,
    onFinalResult: (transcript) => {
      setInputQuery(transcript);
    },
  });

  // Suggested quick questions
  const promptSuggestions = [
    getTranslation(currentLang, 'qaAddProduct'),
    getTranslation(currentLang, 'qaCreateDescription'),
    getTranslation(currentLang, 'qaCheckPrice'),
    getTranslation(currentLang, 'qaMyOrders'),
  ];

  // Update initial greeting when language changes if no custom messages yet
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: 'm1',
            sender: 'saathi',
            text: getTranslation(currentLang, 'saathiGreeting'),
            timestamp: 'Just now',
          },
        ];
      }
      return prev;
    });
  }, [currentLang]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  if (!isOpen) return null;

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'artisan',
      text: textToSend,
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    try {
      const reply = await aiService.askKarigarSaathi(textToSend, currentLang);
      
      let actionTab: string | undefined;
      let actionText: string | undefined;

      const lower = textToSend.toLowerCase();
      if (lower.includes('add') || lower.includes('जोड़') || lower.includes('photo')) {
        actionTab = 'add';
        actionText = getTranslation(currentLang, 'qaAddProduct');
      } else if (lower.includes('buyer') || lower.includes('खरीदार') || lower.includes('order')) {
        actionTab = 'buyers';
        actionText = getTranslation(currentLang, 'qaMyOrders');
      } else if (lower.includes('price') || lower.includes('कीमत') || lower.includes('उत्पाद')) {
        actionTab = 'products';
        actionText = getTranslation(currentLang, 'qaCheckPrice');
      }

      const saathiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'saathi',
        text: reply,
        actionTab,
        actionText,
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, saathiMsg]);

      // Speak automatically for voice accessibility
      aiService.speakText(reply, currentLang);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'saathi',
          text: getTranslation(currentLang, 'saathiApiUnavailable'),
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="karigar-saathi-modal-overlay"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="karigar-saathi-modal-box"
        className="bg-ivory border border-[#E8DFC8] w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[640px] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E07A5F] via-terracotta to-[#3D405B] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shadow-inner">
              <Bot className="w-6 h-6 text-ivory" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight font-craft">
                  {currentLang === 'hi' ? 'कारीगर साथी' : 'Karigar Saathi'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                  Voice AI
                </span>
              </div>
              <p className="text-xs text-white/80">
                {currentLang === 'hi'
                  ? 'आपका वॉयस-फर्स्ट डिजिटल व्यापार सलाहकार'
                  : 'Your Voice-First Business Assistant'}
              </p>
            </div>
          </div>

          <button
            id="close-saathi-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Conversation Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-craft-pattern">
          {messages.map((msg) => {
            const isSaathi = msg.sender === 'saathi';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[88%] ${
                  isSaathi ? 'mr-auto' : 'ml-auto flex-row-reverse'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs ${
                    isSaathi
                      ? 'bg-[#E07A5F] text-white'
                      : 'bg-[#3D405B] text-white'
                  }`}
                >
                  {isSaathi ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className="flex flex-col">
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                      isSaathi
                        ? 'bg-white text-[#2C241E] border border-[#E8DFC8] rounded-tl-xs'
                        : 'bg-[#E07A5F] text-white rounded-tr-xs'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Action Button inside message if available */}
                    {msg.actionTab && (
                      <button
                        onClick={() => {
                          onNavigateTab(msg.actionTab);
                          onClose();
                        }}
                        className="mt-2.5 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E07A5F]/10 hover:bg-[#E07A5F]/20 text-terracotta text-xs font-bold transition-all cursor-pointer"
                      >
                        <span>{msg.actionText}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Read Aloud button for Saathi messages */}
                  {isSaathi && (
                    <button
                      onClick={() => aiService.speakText(msg.text, currentLang)}
                      className="self-start mt-1 flex items-center gap-1 text-[11px] text-[#7A6E65] hover:text-[#E07A5F] transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{getTranslation(currentLang, 'listenAloud')}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-[#7A6E65] italic p-2 bg-white/80 rounded-xl max-w-[200px] border border-[#E8DFC8]">
              <Sparkles className="w-4 h-4 animate-spin text-[#E07A5F]" />
              <span>{currentLang === 'hi' ? 'साथी सोच रहा है...' : 'Saathi is thinking...'}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="p-2.5 bg-ivory border-t border-[#E8DFC8]/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full bg-white hover:bg-[#F4EFEA] text-brown border border-[#E8DFC8] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Voice Recording / Input Control Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#E8DFC8] flex flex-col gap-2">
          {/* Voice Error Notice */}
          {voiceError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950 shadow-xs animate-fadeIn">
              <span className="font-semibold">{voiceError}</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={startListening}
                  className="px-3 py-1.5 rounded-lg bg-[#E07A5F] text-white text-xs font-bold hover:bg-terracotta flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{tryAgainLabel}</span>
                </button>
                <button
                  onClick={clearError}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E8DFC8] text-brown text-xs font-bold hover:bg-ivory flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>{typeInsteadLabel}</span>
                </button>
              </div>
            </div>
          )}

          {/* Live Listening Banner */}
          {isListening && (
            <div className="p-2.5 rounded-2xl bg-ivory border border-[#E07A5F]/40 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#E07A5F]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  {listeningLabel}
                </span>
                <button
                  onClick={stopListening}
                  className="px-2.5 py-0.5 rounded-lg bg-red-500 text-white text-[10px] font-bold hover:bg-red-600 cursor-pointer"
                >
                  {stopLabel}
                </button>
              </div>
              <p className="text-xs text-[#2C241E] italic bg-white p-2 rounded-xl border border-[#E8DFC8]">
                {interimTranscript ? `"${interimTranscript}"` : finalTranscript ? `"${finalTranscript}"` : `(${speakPromptLabel}...)`}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Big Touch-Friendly Mic Button */}
            <button
              id="saathi-mic-toggle-btn"
              onClick={toggleListening}
              className={`p-3 rounded-2xl font-bold transition-all flex items-center justify-center cursor-pointer shadow-md ${
                isListening
                  ? 'bg-red-600 text-white ring-4 ring-red-200 animate-pulse'
                  : 'bg-gradient-to-tr from-[#E07A5F] to-terracotta text-white hover:brightness-105 active:scale-95'
              }`}
              title={speakPromptLabel}
            >
              {isListening ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6 stroke-[2.5]" />
              )}
            </button>

            {/* Text Input for Typing Artisans */}
            <div className="relative flex-1">
              <input
                id="saathi-text-input"
                type="text"
                placeholder={getTranslation(currentLang, 'saathiPromptPlaceholder')}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="w-full pl-3.5 pr-10 py-3 rounded-2xl bg-ivory border border-[#E8DFC8] text-sm text-[#2C241E] focus:outline-none focus:border-[#E07A5F]"
              />
              <button
                id="saathi-send-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-[#E07A5F] hover:bg-[#E07A5F]/10 disabled:opacity-40 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
