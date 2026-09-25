import React, { useState } from 'react';
import { INDIAN_LANGUAGES } from '../i18n/languages';
import { getTranslation } from '../i18n/translations';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  Mic, 
  Camera, 
  Award,
  ShieldCheck
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
  onLanguageChange: (code: string) => void;
  onStartAddProduct: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onLanguageChange,
  onStartAddProduct,
}) => {
  const [step, setStep] = useState(1);
  const [userGoal, setUserGoal] = useState<'sell' | 'buyers' | 'manage'>('sell');

  if (!isOpen) return null;

  const popularLanguages = INDIAN_LANGUAGES.slice(0, 8); // Hindi, English, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada

  return (
    <div
      id="onboarding-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="onboarding-modal-card"
        className="bg-ivory border border-[#E8DFC8] w-full max-w-lg rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col"
      >
        {/* Step Progress Header */}
        <div className="bg-[#E8DFC8]/40 px-6 py-3 border-b border-[#E8DFC8] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step
                    ? 'w-8 bg-[#E07A5F]'
                    : s < step
                    ? 'w-4 bg-[#81B29A]'
                    : 'w-4 bg-[#D9C3B0]'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-[#7A6E65]">
            Step {step} of 4
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col">
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#E07A5F] to-terracotta text-white flex items-center justify-center shadow-lg shadow-[#E07A5F]/30 p-3">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-full h-full text-white"
                >
                  <path d="M3 19c0-5 4-9 9-9s9 4 9 9" />
                  <path d="M7 19v-4" />
                  <path d="M12 19v-6" />
                  <path d="M17 19v-4" />
                  <circle cx="12" cy="6" r="3" />
                </svg>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2C241E] font-craft">
                  {getTranslation(currentLang, 'appName')}
                </h2>
                <p className="text-sm font-semibold text-[#E07A5F] mt-1 font-devanagari">
                  {currentLang === 'hi' ? 'कारीगर से बाज़ार तक' : 'From Craft to Market'}
                </p>
              </div>

              <p className="text-sm text-brown leading-relaxed max-w-sm">
                {currentLang === 'hi'
                  ? 'भारतीय कारीगरों के लिए स्मार्ट एआई प्लेटफॉर्म। बिना किसी तकनीकी ज्ञान के फोटो लें, बोलकर बताएं और देशभर के खरीदारों तक पहुंचें।'
                  : 'Empowering marginalized artisans across India. Turn handmade crafts into professional e-commerce listings with voice & AI assistance.'}
              </p>

              <div className="grid grid-cols-3 gap-2 w-full pt-2">
                <div className="p-2.5 rounded-2xl bg-white border border-[#E8DFC8] text-center">
                  <Camera className="w-5 h-5 mx-auto text-[#E07A5F] mb-1" />
                  <span className="text-[11px] font-bold text-[#2C241E] block">AI Studio</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white border border-[#E8DFC8] text-center">
                  <Mic className="w-5 h-5 mx-auto text-[#81B29A] mb-1" />
                  <span className="text-[11px] font-bold text-[#2C241E] block">Voice Catalog</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white border border-[#E8DFC8] text-center">
                  <ShoppingBag className="w-5 h-5 mx-auto text-[#3D405B] mb-1" />
                  <span className="text-[11px] font-bold text-[#2C241E] block">Bulk Buyers</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE LANGUAGE (26 LANGUAGES) */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#E07A5F]/15 text-terracotta flex items-center justify-center mx-auto mb-2">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#2C241E]">
                  अपनी भाषा चुनें / Choose Your Language
                </h3>
                <p className="text-xs text-[#7A6E65] mt-0.5">
                  Available in 26 Indian Regional Languages
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1">
                {popularLanguages.map((lang) => {
                  const isSelected = lang.code === currentLang;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => onLanguageChange(lang.code)}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E07A5F] text-white border-terracotta shadow-sm'
                          : 'bg-white hover:bg-[#F4EFEA] text-[#2C241E] border-[#E8DFC8]'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-sm block">{lang.nativeName}</span>
                        <span className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-[#7A6E65]'}`}>
                          {lang.name}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: GOAL SELECTION */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-[#2C241E]">
                  {currentLang === 'hi'
                    ? 'आप कारीगर सेतु का उपयोग कैसे करना चाहते हैं?'
                    : 'How would you like to use Karigar Setu?'}
                </h3>
                <p className="text-xs text-[#7A6E65] mt-1">
                  We customize your dashboard based on your priority.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'sell',
                    icon: ShoppingBag,
                    title: currentLang === 'hi' ? 'हस्तशिल्प बेचना' : 'Sell My Handmade Products',
                    desc: currentLang === 'hi' ? 'आसानी से उत्पाद लिस्ट करें और ऑनलाइन बेचें' : 'Take photos, speak details, and publish in minutes',
                  },
                  {
                    id: 'buyers',
                    icon: TrendingUp,
                    title: currentLang === 'hi' ? 'थोक खरीदार खोजना' : 'Connect with Bulk B2B & Govt Buyers',
                    desc: currentLang === 'hi' ? 'फेबइंडिया, ट्राइफेड और सरकारी GeM ऑर्डर पाएं' : 'Direct linkage to corporate gifting & emporiums',
                  },
                  {
                    id: 'manage',
                    icon: Package,
                    title: currentLang === 'hi' ? 'दुकान व मूल्य प्रबंधन' : 'Smart Pricing & Catalog Management',
                    desc: currentLang === 'hi' ? 'एआई द्वारा उचित मूल्य और इन्वेंटरी संभालें' : 'AI calculates fair market pricing with margin guarantee',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = userGoal === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setUserGoal(item.id as any)}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E07A5F]/10 border-[#E07A5F] text-[#2C241E] shadow-xs'
                          : 'bg-white hover:bg-[#F4EFEA] border-[#E8DFC8] text-brown'
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl ${
                          isSelected ? 'bg-[#E07A5F] text-white' : 'bg-ivory text-[#7A6E65]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-sm block text-[#2C241E]">{item.title}</span>
                        <span className="text-xs text-[#7A6E65]">{item.desc}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-[#E07A5F]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: READY TO LAUNCH */}
          {step === 4 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#81B29A]/20 text-[#2D6A4F] flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-[#2C241E]">
                  {currentLang === 'hi'
                    ? 'चलिए अपना पहला उत्पाद जोड़ें!'
                    : "Let's Add Your First Craft!"}
                </h3>
                <p className="text-sm text-brown mt-1.5 leading-relaxed">
                  {currentLang === 'hi'
                    ? 'बस एक फोटो खींचें या गैलरी से चुनें। बाकी सारा काम हमारा एआई करेगा।'
                    : 'The journey from Craft to Market begins with a single tap. Just take a photo and speak.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E8DFC8] text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2C241E]">
                  <span className="w-5 h-5 rounded-full bg-[#E07A5F] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Capture Photo → AI Studio Cleans Background</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#2C241E]">
                  <span className="w-5 h-5 rounded-full bg-[#81B29A] text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Speak in Your Mother Tongue → AI Writes Catalog</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#2C241E]">
                  <span className="w-5 h-5 rounded-full bg-[#3D405B] text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Review Fair Price → 1-Click Publish to 1200+ Buyers</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-auto pt-6 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-[#7A6E65] hover:bg-[#E8DFC8]/40 transition-colors cursor-pointer"
              >
                Back
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-[#7A6E65] hover:bg-[#E8DFC8]/40 transition-colors cursor-pointer"
              >
                Skip Tour
              </button>
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#E07A5F] hover:bg-terracotta text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer ml-auto"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onStartAddProduct();
                }}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E07A5F] to-terracotta hover:brightness-105 text-white font-extrabold text-sm shadow-lg shadow-[#E07A5F]/30 transition-all active:scale-95 cursor-pointer ml-auto"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {currentLang === 'hi' ? 'पहला उत्पाद जोड़ें' : 'Start Adding First Product'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
