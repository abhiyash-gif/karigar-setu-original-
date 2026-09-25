import React from 'react';
import { Product, BuyerEnquiry } from '../types';
import { getTranslation } from '../i18n/translations';
import {
  TrendingUp,
  Eye,
  ShoppingBag,
  IndianRupee,
  Award,
  Sparkles,
  Lightbulb,
  ArrowUpRight,
  ShieldCheck,
  Package
} from 'lucide-react';

interface AnalyticsViewProps {
  products: Product[];
  enquiries: BuyerEnquiry[];
  currentLang: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  products,
  enquiries,
  currentLang,
}) => {
  const totalViews = products.reduce((sum, p) => sum + p.views, 0);
  const totalOrders = 14;
  const totalRevenue = 58450;

  const monthlyViewsData = [
    { month: 'Apr', views: 420 },
    { month: 'May', views: 680 },
    { month: 'Jun', views: 890 },
    { month: 'Jul', views: 1240 },
    { month: 'Aug', views: 1890 },
    { month: 'Sep (Now)', views: 2480 },
  ];

  const maxViews = Math.max(...monthlyViewsData.map((d) => d.views));

  return (
    <div id="analytics-view" className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-[#E8DFC8] shadow-xs">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C241E] font-craft">
          {getTranslation(currentLang, 'analytics')}
        </h2>
        <p className="text-xs text-[#7A6E65]">
          Clear, simple numbers showing how your handcrafted products are reaching buyers.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#E8DFC8] shadow-xs">
          <span className="text-xs font-bold text-[#7A6E65] block mb-1">
            Product Views This Month
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2C241E]">
              {totalViews.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-[#2D6A4F] flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +34%
            </span>
          </div>
          <p className="text-[11px] text-[#7A6E65] mt-1">
            Across 14 major Indian cities
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E8DFC8] shadow-xs">
          <span className="text-xs font-bold text-[#7A6E65] block mb-1">
            Buyer Inquiries
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2C241E]">
              {enquiries.length}
            </span>
            <span className="text-xs font-bold text-[#E07A5F]">
              4 Bulk B2B
            </span>
          </div>
          <p className="text-[11px] text-[#7A6E65] mt-1">
            Avg. conversion rate 68%
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E8DFC8] shadow-xs">
          <span className="text-xs font-bold text-[#7A6E65] block mb-1">
            Craft Units Sold
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2C241E]">
              {totalOrders}
            </span>
            <span className="text-xs font-bold text-[#81B29A]">
              100% On-Time
            </span>
          </div>
          <p className="text-[11px] text-[#7A6E65] mt-1">
            Zero customer returns
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E8DFC8] shadow-xs">
          <span className="text-xs font-bold text-[#7A6E65] block mb-1">
            Artisan Net Revenue
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-terracotta">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-[#2D6A4F] font-semibold mt-1">
            Direct to bank via UPI / NEFT
          </p>
        </div>
      </div>

      {/* Visual Growth Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Views Visual Bar Chart - Bahi-Khata Style */}
        <div className="lg:col-span-8 bg-[#FDFBF7] border-2 border-terracotta rounded-xl p-5 sm:p-6 shadow-craft-md space-y-4 relative overflow-hidden">
          {/* subtle paper texture / ledger lines */}
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(transparent 95%, var(--color-terracotta) 95%)', backgroundSize: '100% 28px' }}></div>
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-terracotta opacity-40"></div>
          
          <div className="relative z-10 pl-6 sm:pl-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#991B1B] font-craft">
                  मासिक विवरण (Monthly Ledger)
                </h3>
                <p className="text-xs text-[#7A6E65] font-bold">
                  Buyer Interest & Views Tracked in Bahi-Khata format
                </p>
              </div>
            </div>

            {/* Simple Accessible Bar Chart */}
            <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b-2 border-[#991B1B]">
              {monthlyViewsData.map((item, index) => {
                const heightPercentage = Math.round((item.views / maxViews) * 100);
                const isCurrent = index === monthlyViewsData.length - 1;

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-bold text-[#991B1B]">
                      {item.views}
                    </span>
                    <div
                      style={{ height: `${heightPercentage}%` }}
                      className={`w-full max-w-[32px] transition-all shadow-sm ${
                        isCurrent
                          ? 'bg-[#991B1B] border-t-4 border-[#7F1D1D]'
                          : 'bg-terracotta/60 hover:bg-terracotta'
                      }`}
                    />
                    <span className="text-[11px] font-bold text-brown truncate w-full text-center">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Business Tips for Artisans */}
        <div className="lg:col-span-4 bg-gradient-to-br from-ivory to-[#F4EFEA] border border-[#E8DFC8] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#F4A261]/20 text-[#D97706]">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-[#2C241E]">
                Smart Business Tips
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-brown">
              <div className="p-3 rounded-2xl bg-white border border-[#E8DFC8] shadow-xs space-y-1">
                <span className="font-bold text-[#2C241E] block">
                  🪔 Festive Demand Surge
                </span>
                <p>
                  Diwali bulk gift inquiries peak in September. Consider listing 5 extra bamboo baskets in advance.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#E8DFC8] shadow-xs space-y-1">
                <span className="font-bold text-[#2C241E] block">
                  📸 Video Stories
                </span>
                <p>
                  Products with cultural artisan stories receive <strong>40% higher buyer confidence</strong> on export channels.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#81B29A]/15 border border-[#81B29A]/30 text-xs text-[#2D6A4F] font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Govt. Subsidies: You qualify for Mudra loan support</span>
          </div>
        </div>
      </div>
    </div>
  );
};
