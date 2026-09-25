import React from 'react';
import { Product, BuyerEnquiry, ArtisanProfile, ViewTab } from '../types';
import { getTranslation } from '../i18n/translations';
import {
  Plus,
  Mic,
  Package,
  Eye,
  ShoppingBag,
  IndianRupee,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Building2,
  Award,
  Volume2
} from 'lucide-react';
import { aiService } from '../services/aiService';

interface HomeViewProps {
  products: Product[];
  enquiries: BuyerEnquiry[];
  profile: ArtisanProfile;
  currentLang: string;
  onNavigateTab: (tab: ViewTab) => void;
  onStartAddProduct: () => void;
  onOpenVoiceAssistant: () => void;
  onViewProductDetail: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  enquiries,
  profile,
  currentLang,
  onNavigateTab,
  onStartAddProduct,
  onOpenVoiceAssistant,
  onViewProductDetail,
}) => {
  // Aggregate stats
  const publishedProducts = products.filter((p) => p.status === 'Published');
  const totalViews = products.reduce((sum, p) => sum + p.views, 0);
  const totalEnquiries = enquiries.length;
  const estimatedEarnings = products
    .filter((p) => p.status === 'Published')
    .reduce((sum, p) => sum + p.price * (p.stock > 0 ? 3 : 1), 0);

  const draftProduct = products.find((p) => p.status === 'Draft') || products[0];

  return (
    <div id="home-dashboard-view" className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-24 md:pb-12">
      {/* 1. HERO SECTION: "Turn your craft into a digital business" */}
      <section
        id="hero-banner-section"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E07A5F] via-terracotta to-[#3D405B] text-white p-6 sm:p-10 shadow-craft-lg"
      >
        {/* Background Craft Motifs - Subtle Handloom & Mandala */}
        <div className="absolute inset-0 opacity-10 bg-craft-pattern pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none flex items-center justify-end pr-6">
          <svg viewBox="0 0 200 200" className="w-[400px] h-[400px] text-white fill-current">
            <path d="M100,10 A90,90 0 1,0 100,190 A90,90 0 1,0 100,10 Z M100,30 A70,70 0 1,1 100,170 A70,70 0 1,1 100,30 Z" />
            <circle cx="100" cy="100" r="40" />
            <path d="M20,100 L180,100 M100,20 L100,180" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" fill="none" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold border border-white/20 uppercase tracking-widest">
            <Award className="w-3.5 h-3.5 text-[#F2CC8F]" />
            <span>
              {currentLang === 'hi' ? 'कारीगर सेतु — शिल्प से बाजार तक' : 'Karigar Setu — From Craft to Market'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight font-craft drop-shadow-md">
            {getTranslation(currentLang, 'heroTitle')}
          </h2>

          <p className="text-sm sm:text-lg text-white/90 leading-relaxed font-medium max-w-2xl">
            {getTranslation(currentLang, 'heroSubtitle')}
          </p>
          
          {/* Visual Story: Craft -> AI -> Market */}
          <div className="flex items-center gap-2 sm:gap-4 py-4 opacity-90">
             <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full border border-white/30 bg-white/10 flex items-center justify-center backdrop-blur-sm">
                   <span className="text-xl">🧵</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider">Craft</span>
             </div>
             
             {/* Connecting Thread */}
             <div className="h-0.5 flex-1 max-w-[40px] border-t border-dashed border-white/50"></div>
             
             <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full border border-white/30 bg-white/10 flex items-center justify-center backdrop-blur-sm">
                   <span className="text-xl">✨</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider">AI</span>
             </div>
             
             {/* Connecting Thread */}
             <div className="h-0.5 flex-1 max-w-[40px] border-t border-dashed border-white/50"></div>
             
             <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full border border-white/30 bg-white/10 flex items-center justify-center backdrop-blur-sm">
                   <span className="text-xl">🛍️</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider">Market</span>
             </div>
          </div>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-add-product-primary-cta"
              onClick={onStartAddProduct}
              className="w-full sm:w-auto justify-center flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-ivory text-terracotta font-extrabold text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>{getTranslation(currentLang, 'addNewProduct')}</span>
            </button>

            <button
              id="hero-talk-to-saathi-cta"
              onClick={onOpenVoiceAssistant}
              className="w-full sm:w-auto justify-center flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-sm border border-white/30 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <Mic className="w-5 h-5 text-ivory animate-pulse" />
              <span>{getTranslation(currentLang, 'talkToAssistant')}</span>
            </button>
            
            <button
              onClick={() => onNavigateTab('buyers')}
              className="w-full sm:w-auto justify-center flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-transparent hover:bg-white/10 text-white font-bold text-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-ivory" />
              <span>Sell Direct</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. STATS GRID: Simple, High-Legibility Artisan Metrics */}
      <section id="artisan-statistics-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Products Listed */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E8DFC8] shadow-xs hover:border-[#E07A5F]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#7A6E65]">
              {getTranslation(currentLang, 'productsListed')}
            </span>
            <div className="p-2 rounded-xl bg-[#E07A5F]/10 text-[#E07A5F]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2C241E]">
              {publishedProducts.length}
            </span>
            <span className="text-xs font-semibold text-[#81B29A]">
              ({products.length} total)
            </span>
          </div>
        </div>

        {/* Total Views */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E8DFC8] shadow-xs hover:border-[#E07A5F]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#7A6E65]">
              {getTranslation(currentLang, 'productViews')}
            </span>
            <div className="p-2 rounded-xl bg-[#81B29A]/15 text-[#2D6A4F]">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2C241E]">
              {totalViews.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-semibold text-[#2D6A4F] flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +28%
            </span>
          </div>
        </div>

        {/* Buyer Enquiries */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E8DFC8] shadow-xs hover:border-[#E07A5F]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#7A6E65]">
              {getTranslation(currentLang, 'buyerEnquiries')}
            </span>
            <div className="p-2 rounded-xl bg-[#3D405B]/10 text-[#3D405B]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2C241E]">
              {totalEnquiries}
            </span>
            <span className="text-xs font-semibold text-[#E07A5F]">
              {enquiries.filter((e) => e.status === 'Pending').length} new
            </span>
          </div>
        </div>

        {/* Estimated Earnings */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E8DFC8] shadow-xs hover:border-[#E07A5F]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#7A6E65]">
              {getTranslation(currentLang, 'estimatedEarnings')}
            </span>
            <div className="p-2 rounded-xl bg-[#F4A261]/15 text-[#D97706]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2C241E]">
              ₹{estimatedEarnings.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </section>

      {/* 3. "CONTINUE WHERE YOU LEFT OFF" SECTION */}
      <section
        id="continue-where-left-off"
        className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-ivory to-white border border-[#E8DFC8] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-[#E8DFC8]">
            <img
              src={draftProduct.image}
              alt={draftProduct.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-[#3D405B] text-white text-[9px] font-bold">
              80%
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-wider">
                {getTranslation(currentLang, 'continueListing')}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F]" />
              <span className="text-xs text-[#7A6E65]">Step 5 of 6 Ready</span>
            </div>

            <h3 className="text-base font-bold text-[#2C241E] line-clamp-1">
              {currentLang === 'hi' && draftProduct.hindiName
                ? draftProduct.hindiName
                : draftProduct.name}
            </h3>

            {/* Progress Bar */}
            <div className="w-48 sm:w-64 h-2 bg-[#E8DFC8] rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-gradient-to-r from-[#E07A5F] to-[#81B29A] rounded-full w-4/5" />
            </div>
          </div>
        </div>

        <button
          onClick={onStartAddProduct}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#E07A5F] hover:bg-terracotta text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <span>{getTranslation(currentLang, 'resumeButton')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* 4. MARKET LINKAGE OPPORTUNITIES ROW */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#2C241E] font-craft">
              {getTranslation(currentLang, 'reachMoreBuyers')}
            </h3>
            <p className="text-xs text-[#7A6E65]">
              Direct connections with government emporiums, retail chains & export houses
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('buyers')}
            className="text-xs font-bold text-[#E07A5F] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {enquiries.slice(0, 3).map((enq) => (
            <div
              key={enq.id}
              onClick={() => onNavigateTab('buyers')}
              className="p-4 rounded-3xl bg-white border border-[#E8DFC8] shadow-xs hover:border-[#E07A5F] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E07A5F]/15 text-terracotta">
                    {enq.buyerType}
                  </span>
                  <span className="text-[11px] text-[#7A6E65]">{enq.date}</span>
                </div>

                <h4 className="font-bold text-sm text-[#2C241E] line-clamp-1">
                  {enq.buyerName}
                </h4>
                <p className="text-xs text-brown line-clamp-2 mt-1">
                  "{enq.message}"
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-[#F4EFEA] flex items-center justify-between text-xs">
                <span className="font-bold text-[#2C241E]">
                  Qty: {enq.quantityRequested} units
                </span>
                <span className="font-bold text-[#E07A5F] flex items-center gap-0.5">
                  Respond <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. POPULAR CRAFT CATALOG SHOWCASE */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-extrabold text-[#2C241E] font-craft">
            {getTranslation(currentLang, 'products')}
          </h3>
          <button
            onClick={() => onNavigateTab('products')}
            className="text-xs font-bold text-[#E07A5F] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>See All Products</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.slice(0, 3).map((prod) => (
              <div
              key={prod.id}
              onClick={() => onViewProductDetail(prod)}
              className="group rounded-2xl bg-white border border-[#D9C3B0] overflow-hidden craft-shadow-sm hover:craft-shadow-md hover:border-terracotta/60 transition-all cursor-pointer flex flex-col"
            >
              {/* Product Image */}
              <div className="relative aspect-square sm:aspect-4/3 w-full bg-[#F4EFEA] overflow-hidden">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-sm text-[10px] font-bold bg-ivory/95 backdrop-blur-xs text-brown border border-[#D9C3B0] shadow-sm uppercase tracking-widest">
                  {prod.category}
                </div>
                
                {/* Handmade Indicator */}
                <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-sm text-[9px] font-bold bg-[#2C241E]/80 backdrop-blur-xs text-ivory uppercase tracking-widest flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5 text-[#F2CC8F]" /> 100% Handmade
                </div>

                {prod.giTagged && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-[#2D6A4F] text-white flex items-center gap-0.5 shadow-sm uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" /> GI Tagged
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-craft-mandala">
                <div>
                  <h4 className="font-craft text-base sm:text-lg font-bold text-[#2C241E] group-hover:text-terracotta transition-colors line-clamp-1">
                    {currentLang === 'hi' && prod.hindiName
                      ? prod.hindiName
                      : prod.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1 opacity-80">
                     <div className="w-4 h-4 rounded-full bg-[#E07A5F]/20 border border-[#E07A5F]/40 flex items-center justify-center overflow-hidden">
                        <img src={profile.profilePhoto} alt={profile.name} className="w-full h-full object-cover" />
                     </div>
                     <span className="text-[10px] text-brown uppercase tracking-wider font-semibold">
                        By {profile.name}
                     </span>
                  </div>
                  <p className="text-xs text-[#7A6E65] mt-2 line-clamp-2">
                    {currentLang === 'hi' && prod.hindiDescription
                      ? prod.hindiDescription
                      : prod.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8DFC8]/60 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#7A6E65] block">
                      Market Value
                    </span>
                    <span className="text-lg font-extrabold text-terracotta">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="flex items-center justify-center w-8 h-8 rounded-full bg-ivory text-terracotta border border-[#D9C3B0] group-hover:bg-terracotta group-hover:text-white transition-colors">
                       <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
