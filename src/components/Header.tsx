import React, { useState, useRef, useEffect } from 'react';
import { INDIAN_LANGUAGES } from '../i18n/languages';
import { getTranslation } from '../i18n/translations';
import { LanguageInfo, ArtisanProfile, NotificationItem } from '../types';
import { 
  Globe, 
  Bell, 
  Mic, 
  Sparkles, 
  Search, 
  Check, 
  Award,
  ChevronDown,
  Volume2
} from 'lucide-react';

interface HeaderProps {
  currentLang: string;
  onLanguageChange: (code: string) => void;
  onOpenVoiceAssistant: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onGoHome?: () => void;
  unreadNotificationsCount: number;
  profile: ArtisanProfile;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  onOpenVoiceAssistant,
  onOpenNotifications,
  onOpenProfile,
  onGoHome,
  unreadNotificationsCount,
  profile,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedLangInfo =
    INDIAN_LANGUAGES.find((l) => l.code === currentLang) || INDIAN_LANGUAGES[0];

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md border-b border-[#E8DFC8] px-3 sm:px-6 py-2.5 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Logo (Clickable to return Home) */}
        <div
          id="header-brand-logo-btn"
          onClick={onGoHome}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          title="Return to Home Dashboard"
        >
          {/* Logo Mark: Setu Bridge + Handloom Craft Lotus */}
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#E07A5F] via-terracotta to-[#3D405B] text-white shadow-md shadow-[#E07A5F]/20 p-2 group-hover:scale-105 transition-transform">
            {/* SVG Craft Motif */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full text-ivory"
            >
              {/* Arch Bridge + Sun Motif */}
              <path d="M3 19c0-5 4-9 9-9s9 4 9 9" />
              <path d="M7 19v-4" />
              <path d="M12 19v-6" />
              <path d="M17 19v-4" />
              <circle cx="12" cy="6" r="3" />
              <path d="M12 2v1" />
              <path d="M15 3l-.7.7" />
              <path d="M9 3l.7.7" />
            </svg>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#81B29A] rounded-full border-2 border-ivory" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#2C241E] font-craft group-hover:text-[#E07A5F] transition-colors">
                {getTranslation(currentLang, 'appName')}
              </h1>
              <span className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8DFC8]/60 text-[#8D5B4C] border border-[#D9C3B0]">
                <Award className="w-3 h-3 text-[#E07A5F]" /> SIH26090
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#7A6E65] font-medium hidden sm:block">
              {currentLang === 'hi'
                ? 'कारीगर से बाज़ार तक'
                : getTranslation(currentLang, 'tagline')}
            </p>
            <div className="text-[7px] sm:text-[9px] text-[#8D5B4C] font-bold uppercase tracking-wider mt-0.5 leading-tight">
              Ministry of Social Justice and Empowerment<br />
              Department of Social Justice and Empowerment
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Quick Voice Assistant Pill */}
          <button
            id="header-voice-assistant-btn"
            onClick={onOpenVoiceAssistant}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-[#E07A5F] hover:bg-terracotta text-white text-xs sm:text-sm font-semibold shadow-sm transition-transform active:scale-95 cursor-pointer"
            title="Ask Karigar Saathi (Voice Assistant)"
          >
            <Mic className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">
              {currentLang === 'hi' ? 'साथी से पूछें' : 'Saathi AI'}
            </span>
          </button>

          {/* 26-Language Selector Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              id="language-selector-button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-[#F4EFEA] border border-[#E8DFC8] text-xs sm:text-sm font-medium text-[#2C241E] transition-all shadow-xs cursor-pointer"
              aria-label="Select Language"
            >
              <Globe className="w-4 h-4 text-[#E07A5F]" />
              <span className="font-semibold">{selectedLangInfo.nativeName}</span>
              <span className="text-[11px] text-[#7A6E65] hidden lg:inline">
                ({selectedLangInfo.name})
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#7A6E65]" />
            </button>

            {langMenuOpen && (
              <div
                id="language-dropdown-menu"
                className="absolute right-0 mt-2 w-72 sm:w-80 max-h-[420px] bg-white rounded-2xl shadow-xl border border-[#E8DFC8] p-2 z-50 flex flex-col animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Search Bar inside Language Menu */}
                <div className="p-2 border-b border-[#F4EFEA]">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8E84]" />
                    <input
                      type="text"
                      placeholder="Search 26 Indian languages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-ivory border border-[#E8DFC8] focus:outline-none focus:border-[#E07A5F]"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-[#7A6E65]">
                    <span>26 Regional Languages</span>
                    <span className="font-semibold text-[#E07A5F]">SIH Special</span>
                  </div>
                </div>

                {/* Language Items Grid / List */}
                <div className="overflow-y-auto flex-1 p-1 space-y-1">
                  {filteredLanguages.map((lang) => {
                    const isSelected = lang.code === currentLang;
                    return (
                      <button
                        key={lang.code}
                        id={`lang-option-${lang.code}`}
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors text-xs sm:text-sm cursor-pointer ${
                          isSelected
                            ? 'bg-[#E07A5F]/10 text-terracotta font-bold border border-[#E07A5F]/30'
                            : 'hover:bg-ivory text-[#2C241E]'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">{lang.nativeName}</span>
                          <span className="text-[11px] text-[#7A6E65]">
                            {lang.name} • {lang.region}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#E07A5F]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <button
            id="notifications-button"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-white hover:bg-[#F4EFEA] border border-[#E8DFC8] text-[#2C241E] transition-all shadow-xs cursor-pointer"
            aria-label="View Notifications"
          >
            <Bell className="w-4 h-4 text-[#4A3E37]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#E07A5F] text-white text-[10px] font-bold rounded-full border-2 border-white animate-bounce">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Artisan Profile Avatar */}
          <button
            id="header-profile-avatar-btn"
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1 pl-1.5 sm:pr-2.5 rounded-full bg-white hover:bg-[#F4EFEA] border border-[#E8DFC8] transition-all shadow-xs cursor-pointer"
            title="Artisan Profile"
          >
            <img
              src={profile.profilePhoto}
              alt={profile.name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#E07A5F]/40"
            />
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-[#2C241E] truncate max-w-[110px]">
                {profile.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-[#81B29A] font-semibold flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#81B29A]" /> Verified
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
