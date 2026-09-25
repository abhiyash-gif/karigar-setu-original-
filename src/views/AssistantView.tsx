import React, { useState, useEffect, useRef } from 'react';
import { ViewTab, ArtisanProfile } from '../types';
import { getTranslation } from '../i18n/translations';
import { aiService } from '../services/aiService';
import { useHindiVoiceRecognition } from '../hooks/useHindiVoiceRecognition';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  ArrowLeft,
  PlusCircle,
  Package,
  Users,
  BarChart3,
  CheckCircle2,
  Bot,
  User,
  RotateCcw,
  Lightbulb,
  HelpCircle,
  ShieldCheck,
  Award,
  Keyboard
} from 'lucide-react';

interface AssistantViewProps {
  currentLang: string;
  profile: ArtisanProfile;
  onNavigateTab: (tab: ViewTab) => void;
}

interface Message {
  id: string;
  sender: 'saathi' | 'artisan';
  text: string;
  hindiText?: string;
  actionText?: string;
  actionTab?: ViewTab;
  timestamp: string;
}

export const AssistantView: React.FC<AssistantViewProps> = ({
  currentLang,
  profile,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'saathi',
      text:
        currentLang === 'hi'
          ? `नमस्ते ${profile.name.split(' ')[0]} जी! मैं आपका "कारीगर साथी" (AI Assistant) हूँ। आप बोलकर या लिखकर कुछ भी पूछ सकते हैं — जैसे नया शिल्प कैसे सूचीबद्ध करें, सही मूल्य कैसे तय करें, या सरकारी बाज़ार (GeM/TRIFED) से कैसे जुड़ें।`
          : `Namaste ${profile.name.split(' ')[0]}! I am your Karigar Saathi AI Assistant. Ask me anything by speaking or typing — how to list handmade crafts, calculate fair pricing, or connect with institutional buyers.`,
      timestamp: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hook for native browser SpeechRecognition in selected language
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
    onInterimResult: (_interim) => {
      // Show interim feedback in real time
    },
    onAutoSubmit: (transcript) => {
      if (transcript.trim()) {
        setInputQuery(transcript);
      }
    },
  });

  // Update initial greeting when language changes if no conversation history yet
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
  }, [currentLang, profile.name]);

  // Suggested quick artisan questions
  const promptSuggestions = [
    { text: getTranslation(currentLang, 'qaAddProduct'), tab: 'add' as ViewTab },
    { text: getTranslation(currentLang, 'qaCreateDescription'), tab: 'add' as ViewTab },
    { text: getTranslation(currentLang, 'qaCheckPrice'), tab: 'analytics' as ViewTab },
    { text: getTranslation(currentLang, 'qaMyOrders'), tab: 'buyers' as ViewTab },
    { text: getTranslation(currentLang, 'qaSellDirect'), tab: 'products' as ViewTab },
    { text: getTranslation(currentLang, 'qaHowItWorks'), tab: 'home' as ViewTab },
  ];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, isListening]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'artisan',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    // AI Response generation logic
    setTimeout(() => {
      let replyText = '';
      let actionText: string | undefined;
      let actionTab: ViewTab | undefined;

      const lower = query.toLowerCase();

      if (lower.includes('hello') || lower.includes('hi') || lower.includes('namaste') || lower.includes('नमस्ते') || lower.includes('हाय')) {
        replyText = getTranslation(currentLang, 'saathiGreeting');
      } else if (lower.includes('add') || lower.includes('नया') || lower.includes('जोड़') || lower.includes('photo') || lower.includes('फोटो') || lower.includes('list')) {
        replyText = getTranslation(currentLang, 'saathiAddProduct');
        actionText = getTranslation(currentLang, 'qaAddProduct');
        actionTab = 'add';
      } else if (lower.includes('describe') || lower.includes('description') || lower.includes('विवरण')) {
        replyText = getTranslation(currentLang, 'saathiDescription');
        actionText = getTranslation(currentLang, 'qaCreateDescription');
        actionTab = 'add';
      } else if (lower.includes('price') || lower.includes('pricing') || lower.includes('cost') || lower.includes('मूल्य') || lower.includes('कीमत') || lower.includes('दाम')) {
        replyText = getTranslation(currentLang, 'saathiPricing');
        actionText = getTranslation(currentLang, 'qaCheckPrice');
        actionTab = 'analytics';
      } else if (lower.includes('sell direct') || lower.includes('सीधे बेचें')) {
        replyText = getTranslation(currentLang, 'saathiSellDirect');
        actionText = getTranslation(currentLang, 'qaSellDirect');
        actionTab = 'products';
      } else if (lower.includes('sell') || lower.includes('selling') || lower.includes('बेच')) {
        replyText = getTranslation(currentLang, 'saathiSelling');
        actionText = getTranslation(currentLang, 'qaSellDirect');
        actionTab = 'products';
      } else if (lower.includes('order') || lower.includes('orders') || lower.includes('ऑर्डर')) {
        replyText = getTranslation(currentLang, 'saathiOrders');
        actionText = getTranslation(currentLang, 'qaMyOrders');
        actionTab = 'buyers';
      } else if (lower.includes('market') || lower.includes('customers') || lower.includes('linkage') || lower.includes('ग्राहक') || lower.includes('बाज़ार')) {
        replyText = getTranslation(currentLang, 'saathiMarketLinkage');
        actionTab = 'buyers';
      } else if (lower.includes('help') || lower.includes('what can you do') || lower.includes('मदद')) {
        replyText = getTranslation(currentLang, 'saathiHelpAction');
        actionText = getTranslation(currentLang, 'qaHowItWorks');
        actionTab = 'home';
      } else if (lower.includes('thank') || lower.includes('thanks') || lower.includes('धन्यवाद') || lower.includes('शुक्रिया')) {
        replyText = getTranslation(currentLang, 'saathiThankYou');
      } else {
        replyText = getTranslation(currentLang, 'saathiUnknown');
      }

      const saathiMsg: Message = {
        id: `saathi-${Date.now()}`,
        sender: 'saathi',
        text: replyText,
        actionText,
        actionTab,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, saathiMsg]);
      setIsProcessing(false);
    }, 900);
  };

  const handleSpeakAloud = (msg: Message) => {
    setActiveSpeechId(msg.id);
    aiService.speakText(msg.text, currentLang);
    setTimeout(() => {
      setActiveSpeechId(null);
    }, 4000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `m-init-${Date.now()}`,
        sender: 'saathi',
        text:
          currentLang === 'hi'
            ? 'वार्तालाप रीसेट कर दिया गया है। आप अपने हस्तशिल्प, मूल्य निर्धारण या खरीदारों से जुड़ा कोई भी प्रश्न पूछें!'
            : 'Conversation refreshed. How can I assist your craft business right now?',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div id="ai-assistant-screen" className="max-w-4xl mx-auto p-3 sm:p-6 pb-28 md:pb-12 space-y-4">
      {/* Top Header */}
      <div className="bg-white border border-[#E8DFC8] rounded-3xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('home')}
            className="p-2 rounded-2xl hover:bg-ivory text-brown border border-[#E8DFC8] cursor-pointer transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl bg-craft-mandala bg-ivory border border-[#E07A5F] flex items-center justify-center text-[#E07A5F] shadow-sm overflow-hidden">
              {/* Custom SVG combining Speech Bubble + Thread/Bridge concept */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                {/* Bridge / Thread arch */}
                <path d="M8 10c2-3 6-3 8 0" stroke="#81B29A" strokeWidth="2.5"></path>
                {/* Dots / Stitches */}
                <circle cx="12" cy="12" r="0.5" fill="currentColor"></circle>
              </svg>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#81B29A] border-[2.5px] border-white flex items-center justify-center">
                 <Sparkles className="w-2 h-2 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-[#2C241E] font-craft">
                  {getTranslation(currentLang, 'assistant')}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#81B29A]/15 text-[#2D6A4F] text-[10px] font-extrabold border border-[#81B29A]/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> SIH26090 AI
                </span>
              </div>
              <p className="text-xs text-[#7A6E65]">
                {currentLang === 'hi'
                  ? 'बोलकर या लिखकर पूछें — 26 भारतीय भाषाओं में उपलब्ध'
                  : 'Multilingual Voice & Chat AI for Indian Master Artisans'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="p-2 rounded-2xl bg-ivory hover:bg-[#E8DFC8] text-brown text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#E8DFC8]"
          title="Reset Conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Suggested Quick Questions */}
      <div className="bg-white border border-[#E8DFC8] rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#E07A5F] mb-2 px-1">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{currentLang === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न:' : 'Suggested Inquiries:'}</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {promptSuggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sug.text)}
              className="px-3 py-1.5 rounded-xl bg-ivory hover:bg-[#E07A5F]/10 hover:text-terracotta border border-[#E8DFC8] text-xs font-medium text-brown transition-all whitespace-nowrap cursor-pointer shrink-0"
            >
              {sug.text}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Conversation Container */}
      <div className="bg-white border border-[#E8DFC8] rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col h-[480px] sm:h-[540px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => {
            const isSaathi = msg.sender === 'saathi';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isSaathi ? 'items-start' : 'items-end justify-end'}`}
              >
                {isSaathi && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-ivory border border-[#E07A5F]/30 text-[#E07A5F] flex items-center justify-center shrink-0 shadow-sm mt-1 overflow-hidden">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      <path d="M8 10c2-3 6-3 8 0" stroke="#81B29A" strokeWidth="2.5"></path>
                    </svg>
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 space-y-2.5 shadow-craft-sm ${
                    isSaathi
                      ? 'bg-white text-[#2C241E] border border-[#E8DFC8] rounded-tl-sm'
                      : 'bg-gradient-to-r from-[#E07A5F] to-terracotta text-white rounded-tr-sm'
                  }`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>

                  {/* Action Link Button if provided */}
                  {msg.actionText && msg.actionTab && (
                    <div className="pt-1">
                      <button
                        onClick={() => onNavigateTab(msg.actionTab!)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-ivory text-terracotta text-xs font-extrabold shadow-xs transition-transform active:scale-95 cursor-pointer border border-[#E8DFC8]"
                      >
                        <span>{msg.actionText}</span>
                      </button>
                    </div>
                  )}

                  {/* Message Footer */}
                  <div
                    className={`flex items-center justify-between text-[10px] pt-1 ${
                      isSaathi ? 'text-[#9C8E84]' : 'text-white/80'
                    }`}
                  >
                    <span>{msg.timestamp}</span>

                    {isSaathi && (
                      <button
                        onClick={() => handleSpeakAloud(msg)}
                        className={`p-1 rounded-md hover:bg-black/5 flex items-center gap-1 transition-colors cursor-pointer ${
                          activeSpeechId === msg.id ? 'text-[#E07A5F] font-bold' : ''
                        }`}
                        title="Read message aloud"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${activeSpeechId === msg.id ? 'animate-bounce' : ''}`} />
                        <span>{activeSpeechId === msg.id ? 'Speaking...' : 'Listen'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {!isSaathi && (
                  <div className="w-8 h-8 rounded-xl bg-[#3D405B] text-white flex items-center justify-center shrink-0 shadow-xs mb-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#E07A5F] text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-ivory border border-[#E8DFC8] rounded-2xl px-4 py-2.5 text-xs text-[#7A6E65] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E07A5F] animate-ping" />
                <span>{currentLang === 'hi' ? 'कारीगर साथी सोच रहा है...' : 'Karigar Saathi is thinking...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Large Voice Button */}
        <div className="pt-3 border-t border-[#E8DFC8] space-y-2">
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

          {/* Live Recording Banner */}
          {isListening && (
            <div className="p-3 rounded-2xl bg-ivory border border-[#E07A5F]/50 space-y-1.5 shadow-sm animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold text-[#E07A5F]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  {listeningLabel}
                </span>
                <button
                  onClick={stopListening}
                  className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-[11px] font-bold hover:bg-red-600 cursor-pointer shadow-xs"
                >
                  {stopLabel}
                </button>
              </div>
              <p className="text-xs text-[#2C241E] font-medium italic bg-white p-2.5 rounded-xl border border-[#E8DFC8] min-h-[36px]">
                {interimTranscript ? (
                  `"${interimTranscript}"`
                ) : finalTranscript ? (
                  `"${finalTranscript}"`
                ) : (
                  <span className="text-[#9C8E84] font-normal">
                    ({speakPromptLabel}...)
                  </span>
                )}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Big Mic Button */}
            <button
              onClick={toggleListening}
              className={`p-4 sm:p-5 rounded-full flex items-center justify-center text-white transition-all shadow-craft-md active:scale-95 cursor-pointer ${
                isListening
                  ? 'bg-red-500 ring-4 ring-red-300 animate-pulse'
                  : 'bg-gradient-to-tr from-[#E07A5F] to-terracotta hover:brightness-110 ring-4 ring-[#E07A5F]/20'
              }`}
              title={isListening ? stopLabel : speakPromptLabel}
            >
              {isListening ? <MicOff className="w-6 h-6 sm:w-7 sm:h-7" /> : <Mic className="w-6 h-6 sm:w-7 sm:h-7" />}
            </button>

            {/* Query Input Field */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder={
                  currentLang === 'hi'
                    ? 'यहाँ प्रश्न लिखें या माइक दबाकर बोलें...'
                    : `Type question or tap mic to ${speakPromptLabel.replace('🎙️ ', '')}...`
                }
                className="w-full pl-4 pr-10 py-3 rounded-2xl bg-ivory border border-[#E8DFC8] text-xs sm:text-sm text-[#2C241E] focus:outline-none focus:border-[#E07A5F] focus:bg-white transition-all"
              />

              {inputQuery && (
                <button
                  onClick={() => setInputQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7A6E65] hover:text-[#2C241E]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || isProcessing}
              className="p-3.5 rounded-2xl bg-[#3D405B] hover:bg-[#2C241E] disabled:opacity-40 text-white transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Send Message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
