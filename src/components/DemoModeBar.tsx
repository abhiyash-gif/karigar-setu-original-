import React from 'react';
import { Sparkles, Play, Award, Zap, CheckCircle2, RefreshCw, MessageSquare, Plus } from 'lucide-react';
import { getTranslation } from '../i18n/translations';

interface DemoModeBarProps {
  currentLang: string;
  onTriggerGuidedDemo?: () => void;
  onTriggerDemoFlow?: () => void;
  onOpenVoiceAssistant?: () => void;
  onOpenOnboarding?: () => void;
  onResetData?: () => void;
  onResetDemo?: () => void;
  isSimulatingDemo?: boolean;
}

export const DemoModeBar: React.FC<DemoModeBarProps> = ({
  currentLang,
  onTriggerGuidedDemo,
  onTriggerDemoFlow,
  onOpenVoiceAssistant,
  onOpenOnboarding,
  onResetData,
  onResetDemo,
  isSimulatingDemo = false,
}) => {
  const handleTriggerDemo = () => {
    if (onTriggerGuidedDemo) onTriggerGuidedDemo();
    else if (onTriggerDemoFlow) onTriggerDemoFlow();
  };

  const handleReset = () => {
    if (onResetData) onResetData();
    else if (onResetDemo) onResetDemo();
  };

  return (
    <div
      id="hackathon-demo-banner"
      className="bg-gradient-to-r from-[#3D405B] via-[#4A4E69] to-[#2C241E] text-white px-3 sm:px-6 py-2 border-b border-[#E8DFC8]/20 shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Hackathon badge and problem statement */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E07A5F] text-white font-bold text-[10px] tracking-wide uppercase shadow-xs">
            <Award className="w-3 h-3" /> SIH 2026
          </span>
          <span className="font-semibold text-ivory hidden md:inline">
            SIH26090: AI-Driven Market Linkage & Smart Cataloging Mobile App for Artisans
          </span>
          <span className="font-semibold text-ivory md:hidden">
            SIH26090 Prototype
          </span>
        </div>

        {/* Right: Interactive Demo Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Quick Voice Assistant"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#E07A5F]" />
              <span>Saathi AI</span>
            </button>
          )}

          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Show Problem Statement Overview"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#81B29A]" />
              <span>SIH Mission</span>
            </button>
          )}

          <button
            id="trigger-guided-demo-btn"
            onClick={handleTriggerDemo}
            disabled={isSimulatingDemo}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isSimulatingDemo
                ? 'bg-[#81B29A] text-white animate-pulse'
                : 'bg-gradient-to-r from-[#E07A5F] to-terracotta hover:brightness-110 text-white active:scale-95'
            }`}
          >
            {isSimulatingDemo ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Running Tour...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{getTranslation(currentLang, 'quickDemoTour')}</span>
              </>
            )}
          </button>

          <button
            id="reset-demo-data-btn"
            onClick={handleReset}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Reset to Initial Sample Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
