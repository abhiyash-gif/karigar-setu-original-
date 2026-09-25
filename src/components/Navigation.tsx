import React from 'react';
import { ViewTab } from '../types';
import { getTranslation } from '../i18n/translations';
import {
  Home,
  Package,
  PlusCircle,
  Users,
  Sparkles,
  BarChart3,
  User,
  Plus,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface NavigationProps {
  currentTab: ViewTab;
  onSelectTab?: (tab: ViewTab) => void;
  onTabChange?: (tab: ViewTab) => void;
  currentLang: string;
  publishedCount?: number;
  productsCount?: number;
  enquiriesCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onTabChange,
  currentLang,
  publishedCount,
  productsCount,
  enquiriesCount = 0,
}) => {
  const handleTabChange = (tab: ViewTab) => {
    if (onSelectTab) onSelectTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const totalProducts = publishedCount ?? productsCount ?? 0;

  const navItems: {
    id: ViewTab;
    labelKey: string;
    icon: React.ElementType;
    badge?: number | string;
    isPrimaryAdd?: boolean;
  }[] = [
    { id: 'home', labelKey: 'home', icon: Home },
    { id: 'products', labelKey: 'products', icon: Package, badge: totalProducts },
    { id: 'add', labelKey: 'addProduct', icon: PlusCircle, isPrimaryAdd: true },
    { id: 'buyers', labelKey: 'marketLinkage', icon: Users, badge: enquiriesCount },
    { id: 'assistant', labelKey: 'assistant', icon: Sparkles },
    { id: 'analytics', labelKey: 'analytics', icon: BarChart3 },
    { id: 'profile', labelKey: 'profile', icon: User },
  ];

  return (
    <>
      {/* 1. DESKTOP / TABLET SIDEBAR */}
      <aside
        id="desktop-sidebar-nav"
        className="hidden md:flex flex-col w-64 lg:w-72 bg-ivory border-r border-[#E8DFC8] p-4 shrink-0 min-h-[calc(100vh-61px)]"
      >
        {/* Prominent "+ Add Product" Action Button */}
        <div className="mb-6">
          <button
            id="sidebar-add-product-cta"
            onClick={() => handleTabChange('add')}
            className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer ${
              currentTab === 'add'
                ? 'bg-terracotta text-white ring-4 ring-[#E07A5F]/20'
                : 'bg-gradient-to-r from-[#E07A5F] to-terracotta text-white hover:from-terracotta hover:to-[#B44B24] hover:shadow-lg active:scale-98'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-white stroke-[3]" />
            </div>
            <span>{getTranslation(currentLang, 'addNewProduct')}</span>
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            if (item.id === 'add') return null; // Already rendered as top CTA
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-medium text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#E8DFC8]/60 text-[#2C241E] font-bold shadow-xs border border-[#D9C3B0]'
                    : 'text-brown hover:bg-[#F2ECE4] hover:text-[#2C241E]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-[#E07A5F] text-white'
                        : 'bg-white text-brown border border-[#E8DFC8]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{getTranslation(currentLang, item.labelKey)}</span>
                </div>

                {item.badge !== undefined && Boolean(item.badge) && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? 'bg-[#2C241E] text-white'
                        : 'bg-[#E07A5F]/15 text-terracotta'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Handicrafts Trust Badge Box */}
        <div className="mt-auto pt-4 border-t border-[#E8DFC8]/70">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#81B29A]/15 to-[#3D405B]/10 border border-[#81B29A]/30 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
              <span className="text-xs font-bold text-[#2D6A4F]">
                Digital Artisan Shield
              </span>
            </div>
            <p className="text-[11px] text-brown leading-relaxed">
              SIH26090 verified linkage with National Handloom & Handicrafts Registry.
            </p>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        id="mobile-bottom-navbar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-ivory/95 backdrop-blur-lg border-t border-[#E8DFC8] px-2 py-1 shadow-lg"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {/* Home */}
          <button
            id="mobile-nav-home"
            onClick={() => handleTabChange('home')}
            className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-colors cursor-pointer min-w-[48px] ${
              currentTab === 'home' ? 'text-[#E07A5F] font-bold' : 'text-[#7A6E65]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 w-full text-center truncate">{getTranslation(currentLang, 'home')}</span>
          </button>

          {/* Products */}
          <button
            id="mobile-nav-products"
            onClick={() => handleTabChange('products')}
            className={`relative flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-colors cursor-pointer min-w-[48px] ${
              currentTab === 'products' ? 'text-[#E07A5F] font-bold' : 'text-[#7A6E65]'
            }`}
          >
            <Package className="w-5 h-5" />
            {totalProducts > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-[#E07A5F] text-white text-[9px] font-bold flex items-center justify-center">
                {totalProducts}
              </span>
            )}
            <span className="text-[10px] mt-0.5 w-full text-center truncate">{getTranslation(currentLang, 'products')}</span>
          </button>

          {/* Large Floating Center "+ Add" CTA */}
          <button
            id="mobile-nav-add"
            onClick={() => handleTabChange('add')}
            className="flex flex-col items-center justify-center -mt-5 group cursor-pointer"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 ${
                currentTab === 'add'
                  ? 'bg-terracotta text-white ring-4 ring-ivory'
                  : 'bg-gradient-to-tr from-[#E07A5F] to-terracotta text-white ring-4 ring-ivory shadow-[#E07A5F]/40'
              }`}
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <span className="text-[10px] font-bold text-[#E07A5F] mt-0.5">
              {getTranslation(currentLang, 'addProduct')}
            </span>
          </button>

          {/* Market Linkage */}
          <button
            id="mobile-nav-buyers"
            onClick={() => handleTabChange('buyers')}
            className={`relative flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-colors cursor-pointer min-w-[48px] ${
              currentTab === 'buyers' ? 'text-[#E07A5F] font-bold' : 'text-[#7A6E65]'
            }`}
          >
            <Users className="w-5 h-5" />
            {enquiriesCount > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-[#E07A5F] text-white text-[9px] font-bold flex items-center justify-center">
                {enquiriesCount}
              </span>
            )}
            <span className="text-[10px] mt-0.5 w-full text-center truncate">{getTranslation(currentLang, 'marketLinkage')}</span>
          </button>

          {/* Saathi AI Assistant */}
          <button
            id="mobile-nav-assistant"
            onClick={() => handleTabChange('assistant')}
            className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-colors cursor-pointer min-w-[48px] ${
              currentTab === 'assistant' ? 'text-[#E07A5F] font-bold' : 'text-[#7A6E65]'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 w-full text-center truncate">{getTranslation(currentLang, 'assistant')}</span>
          </button>

          {/* Profile */}
          <button
            id="mobile-nav-profile"
            onClick={() => handleTabChange('profile')}
            className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-colors cursor-pointer min-w-[48px] ${
              currentTab === 'profile' ? 'text-[#E07A5F] font-bold' : 'text-[#7A6E65]'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 w-full text-center truncate">{getTranslation(currentLang, 'profile')}</span>
          </button>
        </div>
      </nav>
    </>
  );
};
