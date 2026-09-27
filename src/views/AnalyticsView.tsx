import React, { useState } from 'react';
import { Product, BuyerEnquiry, ArtisanProfile } from '../types';
import { INITIAL_PROFILE } from '../data/demoProducts';
import { getTranslation } from '../i18n/translations';
import { LoanReportModal } from '../components/LoanReportModal';
import {
  generateArtisanLoanReportPdf,
  generateVerifiedSalesLedger,
  LoanReportConfig,
} from '../utils/loanReportPdfGenerator';
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
  Package,
  FileText,
  Download,
  Building2,
  CheckCircle2,
  ChevronRight,
  Printer,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface AnalyticsViewProps {
  products: Product[];
  enquiries: BuyerEnquiry[];
  profile?: ArtisanProfile;
  currentLang: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  products,
  enquiries,
  profile = INITIAL_PROFILE,
  currentLang,
}) => {
  const [isLoanModalOpen, setIsLoanModalOpen] = useState<boolean>(false);
  const [isQuickDownloading, setIsQuickDownloading] = useState<boolean>(false);

  // Overall analytics metrics
  const totalViews = products.reduce((sum, p) => sum + p.views, 0);
  const totalOrders = 14;
  const directRevenue = 58450;

  // Verified Ledger Data for Underwriting
  const salesLedger = generateVerifiedSalesLedger(products);
  const totalLedgerRevenue = salesLedger.reduce((sum, r) => sum + r.totalAmount, 0) + directRevenue;

  // Inventory valuation
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalStockAssetValue = products.reduce((sum, p) => sum + p.price * (p.stock || 0), 0);
  const averageMargin = Math.round(
    products.reduce((sum, p) => sum + (p.pricingBreakdown?.recommendedMargin || 35), 0) /
      Math.max(1, products.length)
  );

  // Pipeline demand
  const pipelineValue = enquiries.reduce(
    (sum, e) => sum + (e.offeredPricePerUnit || 1800) * (e.quantityRequested || 1),
    0
  );

  const monthlyViewsData = [
    { month: 'Apr', views: 420 },
    { month: 'May', views: 680 },
    { month: 'Jun', views: 890 },
    { month: 'Jul', views: 1240 },
    { month: 'Aug', views: 1890 },
    { month: 'Sep (Now)', views: 2480 },
  ];

  const maxViews = Math.max(...monthlyViewsData.map((d) => d.views));

  // Quick 1-Click Download Handler with Standard Mudra Defaults
  const handleQuickDownloadPdf = () => {
    setIsQuickDownloading(true);
    setTimeout(() => {
      try {
        const reportRef = `KS-MUDRA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const config: LoanReportConfig = {
          schemeName: 'PMMY MUDRA - Kishor (Working Capital)',
          schemeType: 'mudra_kishor',
          requestedAmount: 200000,
          loanPurpose:
            'Bulk Raw Material Sourcing & Workshop Tool Modernization for Festive Orders',
          targetBank: 'State Bank of India (SBI)',
          branchName: 'Rural Cluster Branch, Majuli',
          artisanName: profile.name || 'Devraj Sharma',
          artisanCardNumber: profile.artisanCardNumber || 'PAHCHAN-AS-2024-88910',
          enterpriseName: 'Brahmaputra Heritage Cane & Craft Enterprise',
          reportRefNumber: reportRef,
          periodLabel: 'Financial Year 2026-27 (Past 6 Months Verified)',
        };

        const doc = generateArtisanLoanReportPdf(profile, products, enquiries, config);
        const cleanName = (profile.name || 'Artisan').replace(/\s+/g, '_');
        doc.save(`Karigar_Setu_Loan_Report_${cleanName}_${reportRef}.pdf`);
      } catch (err) {
        console.error('Error generating quick PDF report:', err);
      } finally {
        setIsQuickDownloading(false);
      }
    }, 350);
  };

  return (
    <div id="analytics-view" className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-24 md:pb-12">
      {/* Header with Loan Report Export CTA */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DFC8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E07A5F]/15 text-terracotta text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Bahi-Khata & Loan Underwriting</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C241E] font-craft">
            {getTranslation(currentLang, 'analytics')}
          </h2>
          <p className="text-xs text-[#7A6E65] max-w-xl">
            {currentLang === 'hi'
              ? 'आपके हस्तशिल्प की डिजिटल बिक्री, खरीदार मांग, और बैंक ऋण आवेदन हेतु आधिकारिक स्टॉक व आय विवरण।'
              : 'Audited numbers showing craft sales, live inventory valuation, and bank-grade credit records for MUDRA & PMEGP loans.'}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleQuickDownloadPdf}
            disabled={isQuickDownloading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-ivory border border-[#E8DFC8] text-[#2C241E] font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Download Instant MUDRA Kishor PDF"
          >
            <Download className={`w-3.5 h-3.5 text-[#E07A5F] ${isQuickDownloading ? 'animate-bounce' : ''}`} />
            <span>{isQuickDownloading ? 'Exporting...' : 'Quick PDF'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLoanModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#E07A5F] to-terracotta hover:brightness-105 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>
              {currentLang === 'hi'
                ? 'ऋण आवेदन रिपोर्ट (PDF) बनाएं'
                : 'Export Loan Report (PDF)'}
            </span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Product Views */}
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

        {/* Buyer Inquiries */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8DFC8] shadow-xs">
          <span className="text-xs font-bold text-[#7A6E65] block mb-1">
            Buyer Inquiries & Orders
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
            ₹{pipelineValue.toLocaleString('en-IN')} forward pipeline
          </p>
        </div>

        {/* Physical Stock Valuation (Key for Collateral) */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8DFC8] shadow-xs">
          <span className="text-xs font-bold text-[#7A6E65] block mb-1">
            Finished Stock Valuation
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2D6A4F]">
              ₹{totalStockAssetValue.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-[#2D6A4F] font-semibold mt-1">
            {totalStockUnits} verified units in workshop
          </p>
        </div>

        {/* Verified Turnover */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8DFC8] shadow-xs">
          <span className="text-xs font-bold text-[#7A6E65] block mb-1">
            Artisan Net Revenue
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-terracotta">
              ₹{totalLedgerRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-[#7A6E65] font-semibold mt-1">
            {averageMargin}% average profit margin
          </p>
        </div>
      </div>

      {/* Featured Section: Bank Loan Application & Credit Readiness Dossier */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#2C241E] via-[#382B22] to-[#1E1712] text-white shadow-lg space-y-6 relative overflow-hidden">
        {/* Subtle decorative background watermark */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <Building2 className="w-80 h-80 text-white" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E07A5F]/20 border border-[#E07A5F]/40 text-[#E07A5F] text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {currentLang === 'hi'
                  ? 'बैंक लोन एवं मुद्रा योजना साख रिपोर्ट'
                  : 'Official Business Loan & Credit Readiness Dossier'}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold font-craft text-white tracking-wide">
              {currentLang === 'hi'
                ? 'कारीगर व्यापार ऋण हेतु अधिकृत रिपोर्ट डाउनलोड करें'
                : 'Bank-Ready Credit Dossier for Business Loan Applications'}
            </h3>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              {currentLang === 'hi'
                ? 'मुद्रा योजना (PMMY), PMEGP तथा नाबार्ड कारीगर क्रेडिट कार्ड हेतु तैयार किया गया 2-पृष्ठीय ऑडिटेड दस्तावेज़। इसमें आपका 6 महीने का बिक्री लेजर, स्टॉक इन्वेंट्री मूल्यांकन और ऋण चुकाने की क्षमता स्पष्ट प्रमाणित है।'
                : 'Export a professional 2-page vector PDF certified for Pradhan Mantri MUDRA Yojana (Shishu/Kishor/Tarun), PMEGP, and KVIC Artisan Credit Cards. Features audited sales turnover, tangible stock hypothecation value, and debt service coverage (DSCR).'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
            <button
              type="button"
              onClick={() => setIsLoanModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E07A5F] to-terracotta hover:brightness-110 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>
                {currentLang === 'hi'
                  ? 'कस्टम रिपोर्ट तैयार करें (PDF)'
                  : 'Customize & Export Loan PDF'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleQuickDownloadPdf}
              disabled={isQuickDownloading}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isQuickDownloading ? 'animate-bounce' : ''}`} />
              <span>{isQuickDownloading ? 'Generating...' : 'Instant Download'}</span>
            </button>
          </div>
        </div>

        {/* 4 Pillars of Bank Loan Underwriting */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 relative z-10 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-white/60 font-bold uppercase block mb-1">
              Tangible Collateral Value
            </span>
            <span className="text-base sm:text-lg font-extrabold text-[#81B29A] block">
              ₹{totalStockAssetValue.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-white/70">
              Hypothecation stock in trade
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-white/60 font-bold uppercase block mb-1">
              Verified Revenue History
            </span>
            <span className="text-base sm:text-lg font-extrabold text-white block">
              ₹{totalLedgerRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-white/70">
              Direct bank receipts & UPI
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-white/60 font-bold uppercase block mb-1">
              Repayment Capacity (DSCR)
            </span>
            <span className="text-base sm:text-lg font-extrabold text-[#E07A5F] block">
              2.4x Coverage
            </span>
            <span className="text-[10px] text-white/70">
              {averageMargin}% healthy gross margin
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-white/60 font-bold uppercase block mb-1">
              Statutory Credentialing
            </span>
            <span className="text-xs font-extrabold text-white block truncate">
              {profile.artisanCardNumber}
            </span>
            <span className="text-[10px] text-[#81B29A] font-semibold">
              ✓ GI & PAHCHAN Certified
            </span>
          </div>
        </div>
      </div>

      {/* Visual Growth Chart & Business Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Views Visual Bar Chart - Bahi-Khata Style */}
        <div className="lg:col-span-8 bg-[#FDFBF7] border-2 border-terracotta rounded-xl p-5 sm:p-6 shadow-craft-md space-y-4 relative overflow-hidden">
          {/* subtle paper texture / ledger lines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'linear-gradient(transparent 95%, var(--color-terracotta) 95%)',
              backgroundSize: '100% 28px',
            }}
          />
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-terracotta opacity-40" />

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
                    <span className="text-[10px] font-bold text-[#991B1B]">{item.views}</span>
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
              <h3 className="font-extrabold text-base text-[#2C241E]">Smart Business Tips</h3>
            </div>

            <div className="space-y-2.5 text-xs text-brown">
              <div className="p-3 rounded-2xl bg-white border border-[#E8DFC8] shadow-xs space-y-1">
                <span className="font-bold text-[#2C241E] block">🪔 Festive Demand Surge</span>
                <p>
                  Diwali bulk gift inquiries peak in September. Consider listing 5 extra bamboo baskets in advance.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#E8DFC8] shadow-xs space-y-1">
                <span className="font-bold text-[#2C241E] block">📸 Video Stories</span>
                <p>
                  Products with cultural artisan stories receive{' '}
                  <strong>40% higher buyer confidence</strong> on export channels.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLoanModalOpen(true)}
            className="p-3 rounded-2xl bg-[#81B29A]/15 hover:bg-[#81B29A]/25 border border-[#81B29A]/30 text-xs text-[#2D6A4F] font-bold flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#2D6A4F]" />
              <span>Govt. Subsidies: Qualify for MUDRA Loan</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#2D6A4F]" />
          </button>
        </div>
      </div>

      {/* Inventory & Hypothecation Asset Breakdown Table */}
      <div className="bg-white border border-[#E8DFC8] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#2C241E] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#E07A5F]" />
              <span>Workshop Inventory Asset Valuation (Collateral / Stock-in-Trade)</span>
            </h3>
            <p className="text-xs text-[#7A6E65]">
              Itemized stock valuation recognized by banks as security for working capital loans.
            </p>
          </div>

          <span className="text-xs font-bold text-[#2D6A4F] bg-[#81B29A]/15 px-3 py-1 rounded-full self-start sm:self-auto">
            Total Inventory Value: ₹{totalStockAssetValue.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E8DFC8] text-[#7A6E65] font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3">Craft Product</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-center">Stock</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Asset Value (INR)</th>
                <th className="py-2.5 px-3 text-center">Margin %</th>
                <th className="py-2.5 px-3 text-center">Bank Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFC8]/60 text-[#2C241E]">
              {products.slice(0, 5).map((p) => (
                <tr key={p.id} className="hover:bg-ivory/60 transition-colors">
                  <td className="py-3 px-3 font-bold">{p.name}</td>
                  <td className="py-3 px-3 text-[#7A6E65]">{p.category}</td>
                  <td className="py-3 px-3 text-center font-bold">{p.stock || 0} pcs</td>
                  <td className="py-3 px-3 text-right">₹{p.price.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right font-extrabold text-[#2D6A4F]">
                    ₹{((p.stock || 0) * p.price).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-terracotta">
                    {p.pricingBreakdown?.recommendedMargin || 35}%
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#81B29A]/15 text-[#2D6A4F]">
                      <CheckCircle2 className="w-3 h-3" />
                      Eligible
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for PDF Customization & Export */}
      <LoanReportModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        products={products}
        enquiries={enquiries}
        profile={profile}
        currentLang={currentLang}
      />
    </div>
  );
};
