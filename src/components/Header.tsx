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
  Volume2,
  LogIn,
  LogOut,
  CloudCheck,
  Cloud
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  currentLang: string;
  onLanguageChange: (code: string) => void;
  onOpenVoiceAssistant: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onGoHome?: () => void;
  unreadNotificationsCount: number;
  profile: ArtisanProfile;
  currentUser?: FirebaseUser | null;
  onSignInGoogle?: () => void;
  onSignOut?: () => void;
  isFirebaseConnected?: boolean;
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
  currentUser,
  onSignInGoogle,
  onSignOut,
  isFirebaseConnected = true,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const selectedLangInfo =
    INDIAN_LANGUAGES.find((l) => l.code === currentLang) || INDIAN_LANGUAGES[0];

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
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

          {/* Firebase Authentication / User Section */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                id="header-user-menu-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 p-1 pl-1.5 sm:pr-2.5 rounded-full bg-white hover:bg-[#F4EFEA] border border-[#E8DFC8] transition-all shadow-xs cursor-pointer"
                title={`Signed in as ${currentUser.displayName || currentUser.email}`}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#81B29A]"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#81B29A] text-white flex items-center justify-center font-bold text-xs">
                    {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#2C241E] truncate max-w-[110px]">
                    {currentUser.displayName?.split(' ')[0] || 'Artisan'}
                  </span>
                  <span className="text-[10px] text-[#81B29A] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#81B29A]" /> Firebase Active
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#7A6E65]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8DFC8] py-2 z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-2 border-b border-[#F4EFEA]">
                    <p className="text-xs font-bold text-[#2C241E] truncate">
                      {currentUser.displayName || 'Artisan'}
                    </p>
                    <p className="text-[11px] text-[#7A6E65] truncate">
                      {currentUser.email}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Cloud Firestore Connected
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[#2C241E] hover:bg-ivory flex items-center gap-2 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-[#E07A5F]" />
                    Artisan Pehchan Profile
                  </button>

                  {onSignOut && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-[#F4EFEA] mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      Sign Out
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              id="google-signin-btn"
              onClick={onSignInGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F4EFEA] border border-[#E8DFC8] text-[#2C241E] text-xs font-bold transition-all shadow-xs cursor-pointer group"
              title="Sign in with Google to sync Firestore data"
            >
              {/* Google G SVG */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in</span>
            </button>
          )}

          {/* Fallback Artisan Profile button if user not signed in */}
          {!currentUser && (
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
          )}
        </div>
      </div>
    </header>
  );
};
