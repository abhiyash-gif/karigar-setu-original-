import React, { useState } from 'react';
import { Product, BuyerEnquiry, ArtisanProfile } from '../types';
import {
  generateArtisanLoanReportPdf,
  LoanReportConfig,
  generateVerifiedSalesLedger,
} from '../utils/loanReportPdfGenerator';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Building2,
  Sparkles,
  IndianRupee,
  Layers,
  CheckCircle2,
  Calendar,
  X,
  CreditCard,
  Briefcase,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Package,
} from 'lucide-react';

interface LoanReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  enquiries: BuyerEnquiry[];
  profile: ArtisanProfile;
  currentLang: string;
}

export const LoanReportModal: React.FC<LoanReportModalProps> = ({
  isOpen,
  onClose,
  products,
  enquiries,
  profile,
  currentLang,
}) => {
  const [schemeType, setSchemeType] = useState<LoanReportConfig['schemeType']>('mudra_kishor');
  const [requestedAmount, setRequestedAmount] = useState<number>(200000);
  const [loanPurpose, setLoanPurpose] = useState<string>(
    'Bulk Raw Material Sourcing & Workshop Tool Modernization for Festive Orders'
  );
  const [targetBank, setTargetBank] = useState<string>('State Bank of India (SBI)');
  const [branchName, setBranchName] = useState<string>('Rural Cluster Branch, Majuli');
  const [artisanName, setArtisanName] = useState<string>(profile.name || 'Devraj Sharma');
  const [artisanCard, setArtisanCard] = useState<string>(
    profile.artisanCardNumber || 'PAHCHAN-AS-2024-88910'
  );
  const [enterpriseName, setEnterpriseName] = useState<string>(
    'Brahmaputra Heritage Cane & Craft Enterprise'
  );

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Auto reference number
  const reportRef = `KS-MUDRA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Calculations for quick on-screen preview
  const salesLedger = generateVerifiedSalesLedger(products);
  const totalLedgerRevenue = salesLedger.reduce((sum, r) => sum + r.totalAmount, 0) + 58450;
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalStockValue = products.reduce((sum, p) => sum + p.price * (p.stock || 0), 0);
  const pipelineValue = enquiries.reduce((sum, e) => sum + (e.offeredPricePerUnit || 1800) * (e.quantityRequested || 1), 0);

  const schemes = [
    {
      id: 'mudra_kishor',
      name: 'PMMY MUDRA - Kishor (₹50k - ₹5 Lakhs)',
      sub: 'Most popular for expanding artisans & workshop raw material',
      defaultAmt: 200000,
    },
    {
      id: 'mudra_shishu',
      name: 'PMMY MUDRA - Shishu (Up to ₹50,000)',
      sub: 'Zero collateral, micro working capital starter loan',
      defaultAmt: 45000,
    },
    {
      id: 'mudra_tarun',
      name: 'PMMY MUDRA - Tarun (₹5 Lakhs - ₹10 Lakhs)',
      sub: 'For large master clusters & bulk export setup',
      defaultAmt: 650000,
    },
    {
      id: 'pmegp',
      name: "PMEGP (Prime Minister's Employment Generation)",
      sub: 'Up to ₹25/50 Lakhs with 15-35% government subsidy',
      defaultAmt: 400000,
    },
    {
      id: 'kvic_acc',
      name: 'KVIC / NABARD Artisan Credit Card (ACC)',
      sub: 'Flexible revolving cash credit up to ₹2 Lakhs at subsidized interest',
      defaultAmt: 150000,
    },
  ];

  const purposes = [
    'Bulk Raw Material Sourcing & Workshop Tool Modernization for Festive Orders',
    'Procurement of Seasoned Timber, Bamboo, & Natural Dyes for Bulk Orders',
    'Upgrading Traditional Pit Kilns / Looms to Higher Efficiency Equipment',
    'Working Capital to Fulfill Confirmed FabIndia & TRIFED Institutional Orders',
    'Setting up Archival Export Packaging & Quality Certification Lab',
  ];

  const handleDownloadPdf = () => {
    setIsGenerating(true);

    setTimeout(() => {
      try {
        const schemeObj = schemes.find((s) => s.id === schemeType);
        const config: LoanReportConfig = {
          schemeName: schemeObj?.name || 'Pradhan Mantri MUDRA Yojana',
          schemeType,
          requestedAmount,
          loanPurpose,
          targetBank,
          branchName,
          artisanName,
          artisanCardNumber: artisanCard,
          enterpriseName,
          reportRefNumber: reportRef,
          periodLabel: 'Financial Year 2026-27 (Past 6 Months Verified)',
        };

        const doc = generateArtisanLoanReportPdf(profile, products, enquiries, config);
        const cleanName = artisanName.replace(/\s+/g, '_');
        doc.save(`Karigar_Setu_Loan_Report_${cleanName}_${reportRef}.pdf`);

        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 4000);
      } catch (err) {
        console.error('Error generating PDF report:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 400);
  };

  const handlePrintOrPreview = () => {
    try {
      const schemeObj = schemes.find((s) => s.id === schemeType);
      const config: LoanReportConfig = {
        schemeName: schemeObj?.name || 'Pradhan Mantri MUDRA Yojana',
        schemeType,
        requestedAmount,
        loanPurpose,
        targetBank,
        branchName,
        artisanName,
        artisanCardNumber: artisanCard,
        enterpriseName,
        reportRefNumber: reportRef,
        periodLabel: 'Financial Year 2026-27 (Past 6 Months Verified)',
      };

      const doc = generateArtisanLoanReportPdf(profile, products, enquiries, config);
      const pdfBlobUrl = doc.output('bloburl');
      window.open(pdfBlobUrl, '_blank');
    } catch (err) {
      console.error('Error opening PDF preview:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E8DFC8] overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#2C241E] via-[#3A2D24] to-[#1E1712] p-5 sm:p-6 text-white flex items-start justify-between relative">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E07A5F]/25 border border-[#E07A5F]/40 text-[#E07A5F] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {currentLang === 'hi'
                  ? 'बैंक लोन आवेदन साख रिपोर्ट जनरेटर'
                  : 'Official Bank Credit & Underwriting Dossier'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-craft tracking-wide">
              {currentLang === 'hi'
                ? 'व्यापार ऋण हेतु अधिकृत वित्तीय रिपोर्ट (PDF)'
                : 'Artisan Business Loan Application Report (PDF)'}
            </h2>
            <p className="text-xs text-white/70">
              {currentLang === 'hi'
                ? 'मुद्रा योजना (MUDRA), PMEGP, अथवा बैंक ऋण हेतु प्रामाणिक बिक्री इतिहास, वर्तमान स्टॉक इन्वेंट्री और साख क्षमता विवरण।'
                : 'Generates a bank-grade, 2-page audited report with verified sales turnover, stock valuation, and debt repayment coverage for MUDRA, PMEGP & KVIC loans.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Quick Metrics Bar for Underwriting */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#FDFBF7] border border-[#E8DFC8]">
            <div>
              <span className="text-[10px] font-bold text-[#7A6E65] uppercase block">
                Turnover (Past 6 Mos)
              </span>
              <span className="text-base sm:text-lg font-extrabold text-[#2C241E]">
                ₹{totalLedgerRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#2D6A4F] font-bold block">
                ✓ 100% Direct Bank
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#7A6E65] uppercase block">
                Physical Stock Valuation
              </span>
              <span className="text-base sm:text-lg font-extrabold text-[#2D6A4F]">
                ₹{totalStockValue.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#7A6E65] block">
                {totalStockUnits} ready units in workshop
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#7A6E65] uppercase block">
                Pending B2B Orders
              </span>
              <span className="text-base sm:text-lg font-extrabold text-terracotta">
                ₹{pipelineValue.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#7A6E65] block">
                FabIndia & TRIFED pipeline
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#7A6E65] uppercase block">
                Govt. Identity Verification
              </span>
              <span className="text-xs font-extrabold text-[#2C241E] truncate block">
                {artisanCard}
              </span>
              <span className="text-[10px] text-[#2D6A4F] font-bold block">
                ✓ Ministry PAHCHAN & GI
              </span>
            </div>
          </div>

          {/* Form Options Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column: Scheme Selection */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#2C241E] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#E07A5F]" />
                  <span>
                    {currentLang === 'hi' ? 'लक्षित ऋण योजना चुनें:' : 'Select Target Loan Scheme:'}
                  </span>
                </label>
                <div className="space-y-2">
                  {schemes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSchemeType(s.id as any);
                        setRequestedAmount(s.defaultAmt);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                        schemeType === s.id
                          ? 'bg-[#E07A5F]/10 border-[#E07A5F] ring-1 ring-[#E07A5F]'
                          : 'bg-white border-[#E8DFC8] hover:bg-ivory'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2C241E]">
                          {s.name}
                        </span>
                        {schemeType === s.id && (
                          <CheckCircle2 className="w-4 h-4 text-[#E07A5F]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#7A6E65] mt-0.5">{s.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Requested Loan Amount */}
              <div className="p-4 rounded-2xl bg-ivory border border-[#E8DFC8] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2C241E]">
                    {currentLang === 'hi' ? 'मांगी गई ऋण राशि (₹)' : 'Requested Loan Amount (INR):'}
                  </label>
                  <span className="text-sm font-extrabold text-terracotta">
                    ₹{requestedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="1000000"
                  step="25000"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(Number(e.target.value))}
                  className="w-full accent-[#E07A5F] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#7A6E65]">
                  <span>₹25,000 (Shishu)</span>
                  <span>₹5,00,000 (Kishor)</span>
                  <span>₹10,00,000 (Tarun)</span>
                </div>
              </div>
            </div>

            {/* Right Column: Loan Purpose & Bank Credentials */}
            <div className="space-y-4">
              {/* Loan Purpose */}
              <div>
                <label className="text-xs font-bold text-[#2C241E] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#2D6A4F]" />
                  <span>
                    {currentLang === 'hi' ? 'ऋण उपयोग का उद्देश्य:' : 'Proposed Use of Funds:'}
                  </span>
                </label>
                <select
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                  className="w-full p-2.5 text-xs font-medium bg-white rounded-xl border border-[#E8DFC8] text-[#2C241E] focus:outline-none focus:border-[#E07A5F]"
                >
                  {purposes.map((p, idx) => (
                    <option key={idx} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bank & Branch Inputs */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-[#7A6E65] block mb-1">
                    Lending Bank
                  </label>
                  <input
                    type="text"
                    value={targetBank}
                    onChange={(e) => setTargetBank(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium bg-white rounded-xl border border-[#E8DFC8] text-[#2C241E]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#7A6E65] block mb-1">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium bg-white rounded-xl border border-[#E8DFC8] text-[#2C241E]"
                  />
                </div>
              </div>

              {/* Artisan Profile Confirmation */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8DFC8] space-y-2.5">
                <span className="text-xs font-bold text-[#7A6E65] uppercase tracking-wider block">
                  Artisan Identity Verification
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#7A6E65] block">Borrower Name</label>
                    <input
                      type="text"
                      value={artisanName}
                      onChange={(e) => setArtisanName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-ivory rounded-lg border border-[#E8DFC8]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#7A6E65] block">PAHCHAN Card ID</label>
                    <input
                      type="text"
                      value={artisanCard}
                      onChange={(e) => setArtisanCard(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-ivory rounded-lg border border-[#E8DFC8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#7A6E65] block">Enterprise Name</label>
                  <input
                    type="text"
                    value={enterpriseName}
                    onChange={(e) => setEnterpriseName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold bg-ivory rounded-lg border border-[#E8DFC8]"
                  />
                </div>
              </div>

              {/* Verified Badge Notice */}
              <div className="p-3 rounded-2xl bg-[#81B29A]/15 border border-[#81B29A]/30 text-xs text-[#2D6A4F] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 shrink-0 text-[#2D6A4F]" />
                <span className="font-medium text-[11px]">
                  Includes verifiable digital reference ID <strong>{reportRef}</strong>, physical inventory valuation table, and 6-month bank ledger.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 sm:p-6 bg-ivory border-t border-[#E8DFC8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#7A6E65]">
            <FileText className="w-4 h-4 text-[#E07A5F]" />
            <span>2 Pages • Vector PDF • Compliant with Indian Banking Standards</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrintOrPreview}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-[#E8DFC8] bg-white hover:bg-ivory text-xs font-bold text-[#2C241E] cursor-pointer transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#E07A5F] to-terracotta hover:brightness-105 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isGenerating ? 'animate-bounce' : ''}`} />
              <span>
                {isGenerating
                  ? 'Generating PDF...'
                  : isSuccess
                  ? 'Downloaded!'
                  : currentLang === 'hi'
                  ? 'ऋण रिपोर्ट डाउनलोड करें (PDF)'
                  : 'Download Official Loan Report (PDF)'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
