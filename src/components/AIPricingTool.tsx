import React, { useState, useEffect } from 'react';
import { AIPricingSuggestion, aiService } from '../services/aiService';
import { getTranslation } from '../i18n/translations';
import {
  Sparkles,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Check,
  Volume2,
  AlertCircle,
  HelpCircle,
  Layers,
  ShoppingBag,
  Building2,
  Globe2,
  Store,
  ArrowRight,
  Info,
  RefreshCw,
  Award
} from 'lucide-react';

interface AIPricingToolProps {
  currentLang: string;
  productName: string;
  category: string;
  material?: string;
  craftType?: string;
  dimensions?: string;
  weight?: string;
  productionTime?: string;
  region?: string;
  description?: string;
  currentMaterialCost: number;
  currentLabourHours: number;
  currentHourlyWage: number;
  currentOtherCost: number;
  onApplyPricing: (pricing: {
    recommendedPrice: number;
    priceRange: { min: number; max: number };
    materialCost: number;
    labourHours: number;
    hourlyWage: number;
    otherCost: number;
    rationale: string;
  }) => void;
}

export const AIPricingTool: React.FC<AIPricingToolProps> = ({
  currentLang,
  productName,
  category,
  material,
  craftType,
  dimensions,
  weight,
  productionTime,
  region,
  description,
  currentMaterialCost,
  currentLabourHours,
  currentHourlyWage,
  currentOtherCost,
  onApplyPricing,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestion, setSuggestion] = useState<AIPricingSuggestion | null>(null);
  const [selectedTier, setSelectedTier] = useState<'directConsumerFair' | 'wholesaleBulk' | 'premiumBoutique' | 'exportGlobal'>('directConsumerFair');
  
  // Local live adjustable values
  const [liveMatCost, setLiveMatCost] = useState<number>(currentMaterialCost || 240);
  const [liveHours, setLiveHours] = useState<number>(currentLabourHours || 14);
  const [liveWage, setLiveWage] = useState<number>(currentHourlyWage || 65);
  const [liveOther, setLiveOther] = useState<number>(currentOtherCost || 90);
  const [customPriceOverride, setCustomPriceOverride] = useState<number | null>(null);

  const [loadingStepText, setLoadingStepText] = useState<string>('Analyzing market trends...');
  const [appliedNotice, setAppliedNotice] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Sync inputs with props on initial mount or prop changes
  useEffect(() => {
    if (currentMaterialCost) setLiveMatCost(currentMaterialCost);
    if (currentLabourHours) setLiveHours(currentLabourHours);
    if (currentHourlyWage) setLiveWage(currentHourlyWage);
    if (currentOtherCost) setLiveOther(currentOtherCost);
  }, [currentMaterialCost, currentLabourHours, currentHourlyWage, currentOtherCost]);

  // Trigger AI pricing suggestion
  const handleAnalyzePricing = async () => {
    setIsLoading(true);
    setAppliedNotice(false);

    // Staged loading feedback steps
    const steps = [
      currentLang === 'hi'
        ? 'बाज़ार के मौजूदा रुझान और मांग का विश्लेषण जारी...'
        : 'Analyzing real-world market trends across 140+ craft clusters...',
      currentLang === 'hi'
        ? 'कच्चा माल खर्च और कारीगर श्रम लागत (कौशल भारत मानक) की गणना...'
        : 'Evaluating material cost benchmarks and fair artisan wage index...',
      currentLang === 'hi'
        ? 'फेबइंडिया, जेपोर, अमेज़न कारीगर व ONDC से प्रतिस्पर्धी तुलना...'
        : 'Comparing competitive benchmarks (FabIndia, Jaypore, ONDC, Amazon Karigar)...',
      currentLang === 'hi'
        ? 'कारीगर के लिए 35% शुद्ध मुनाफे का यथार्थवादी दाम तैयार!'
        : 'Calibrating realistic fair-trade price tiers and artisan margin...',
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setLoadingStepText(steps[stepIdx]);
      }
    }, 450);

    try {
      const result = await aiService.suggestAIPricing({
        name: productName,
        category: category,
        material: material,
        craftType: craftType,
        dimensions: dimensions,
        weight: weight,
        productionTime: productionTime,
        region: region,
        description: description,
        materialCost: liveMatCost,
        labourHours: liveHours,
        hourlyWage: liveWage,
        otherCost: liveOther,
        language: currentLang,
      });

      clearInterval(interval);
      setSuggestion(result);

      // Auto update live inputs to refined estimates if available
      if (result.costBreakdown) {
        setLiveMatCost(result.costBreakdown.estimatedMaterialCost);
        setLiveHours(result.costBreakdown.estimatedLaborHours);
        setLiveWage(result.costBreakdown.recommendedHourlyWage);
        setLiveOther(result.costBreakdown.packagingAndTransit);
      }
      setCustomPriceOverride(null);
    } catch (err) {
      clearInterval(interval);
      console.error('Pricing suggestion error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run automatically on first mount if not loaded yet
  useEffect(() => {
    if (!suggestion && productName) {
      handleAnalyzePricing();
    }
  }, []);

  // Compute live dynamic totals based on adjusted sliders
  const directLaborCost = Math.round(liveHours * liveWage);
  const totalPrimeCost = liveMatCost + directLaborCost + liveOther;

  // Active recommended price (either tier-selected or custom override)
  const baseRecommended = suggestion
    ? suggestion.marketTiers[selectedTier]
    : Math.round((totalPrimeCost * 1.45) / 50) * 50;

  const activePrice = customPriceOverride !== null ? customPriceOverride : baseRecommended;
  const netArtisanProfit = activePrice - totalPrimeCost;
  const profitMarginPct = activePrice > 0 ? Math.round((netArtisanProfit / activePrice) * 100) : 0;

  // Handle Apply button
  const handleApply = () => {
    const minP = suggestion ? suggestion.priceRange.min : Math.round(activePrice * 0.88);
    const maxP = suggestion ? suggestion.priceRange.max : Math.round(activePrice * 1.15);
    const rationale = suggestion
      ? suggestion.marketInsights.pricingStrategyAdvice
      : `Fair price calculated based on ₹${liveMatCost} raw material, ${liveHours} crafting hours at ₹${liveWage}/hr, and ₹${liveOther} transit allowance.`;

    onApplyPricing({
      recommendedPrice: activePrice,
      priceRange: { min: minP, max: maxP },
      materialCost: liveMatCost,
      labourHours: liveHours,
      hourlyWage: liveWage,
      otherCost: liveOther,
      rationale,
    });

    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 3500);
  };

  // Listen Aloud Speech
  const handleListenAdvice = () => {
    if (!suggestion) return;
    const textToSpeak = `${suggestion.marketInsights.marketTrend}. ${suggestion.marketInsights.pricingStrategyAdvice}. ${suggestion.traditionalVsDirectComparison.artisanBenefitMessage}`;
    setIsSpeaking(true);
    aiService.speakText(textToSpeak, currentLang);
    setTimeout(() => setIsSpeaking(false), 7000);
  };

  return (
    <div className="bg-gradient-to-b from-white via-ivory to-white border-2 border-[#E8DFC8] rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFC8] pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E07A5F]/15 text-[#E07A5F] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {currentLang === 'hi'
                ? 'एआई बाज़ार मूल्य विश्लेषक (AI Market Pricing Analyst)'
                : 'AI-Powered Market Pricing Analyst'}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#2C241E]">
            {currentLang === 'hi'
              ? 'सटीक एवं यथार्थवादी मूल्य निर्धारण'
              : 'Realistic & Competitive Fair-Pricing'}
          </h3>
          <p className="text-xs sm:text-sm text-brown max-w-xl">
            {currentLang === 'hi'
              ? 'बाज़ार के वास्तविक रुझान, प्रतिस्पर्धी दरों और कारीगर की आजीविका को ध्यान में रखकर तैयार किया गया सटीक दाम।'
              : 'Analyzes live craft benchmarks, material index, and living wage standards to ensure you earn fair profit while staying competitive.'}
          </p>
        </div>

        <button
          onClick={handleAnalyzePricing}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#E07A5F] to-terracotta hover:brightness-105 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>
            {isLoading
              ? currentLang === 'hi'
                ? 'विश्लेषण जारी...'
                : 'Analyzing...'
              : currentLang === 'hi'
              ? 'पुनः विश्लेषण करें'
              : 'Re-analyze Market'}
          </span>
        </button>
      </div>

      {/* Loading State Animation */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-ivory rounded-3xl border border-[#E8DFC8]">
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 rounded-full border-4 border-[#E07A5F]/20 border-t-[#E07A5F] animate-spin" />
            <IndianRupee className="w-6 h-6 text-[#E07A5F] absolute inset-0 m-auto" />
          </div>
          <div className="space-y-1">
            <span className="text-sm font-bold text-[#2C241E] block">
              {loadingStepText}
            </span>
            <span className="text-xs text-[#7A6E65]">
              {currentLang === 'hi'
                ? 'जैपोर, फेबइंडिया और राष्ट्रीय बाज़ार बेंचमार्क से मिलान हो रहा है...'
                : 'Querying Gemini 3.8 Flash & authentic Indian handicraft databases...'}
            </span>
          </div>
        </div>
      )}

      {/* Main Pricing Intelligence Body */}
      {!isLoading && suggestion && (
        <div className="space-y-6">
          {/* Main Price Card Hero */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-ivory via-white to-[#F4EFEA] border-2 border-[#E07A5F]/40 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
            {/* Big Suggested Price Display */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#7A6E65] uppercase tracking-wider">
                  {selectedTier === 'wholesaleBulk'
                    ? currentLang === 'hi'
                      ? 'थोक बल्क ऑर्डर इकाई मूल्य (Wholesale Price)'
                      : 'Wholesale Unit Price (50+ units)'
                    : selectedTier === 'premiumBoutique'
                    ? currentLang === 'hi'
                      ? 'शहरी बुटीक मूल्य (Metro Boutique Tier)'
                      : 'Metro Boutique Benchmark Price'
                    : selectedTier === 'exportGlobal'
                    ? currentLang === 'hi'
                      ? 'अंतर्राष्ट्रीय निर्यात मूल्य (Global Export Tier)'
                      : 'Global Export Value'
                    : currentLang === 'hi'
                    ? 'सुझाया गया उचित खुदरा मूल्य (Direct Fair Price)'
                    : 'Recommended Fair Direct Price'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#81B29A]/20 text-[#2D6A4F] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {suggestion.marketInsights.confidenceScore}% Confidence
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-terracotta font-craft">
                  ₹{activePrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#7A6E65] font-semibold">
                  / unit
                </span>
              </div>

              {/* Realistic Market Range */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="text-[#7A6E65]">
                  {currentLang === 'hi' ? 'उचित बाज़ार दायरा:' : 'Fair Market Range:'}
                </span>
                <span className="font-extrabold text-[#2C241E]">
                  ₹{suggestion.priceRange.min.toLocaleString('en-IN')} — ₹{suggestion.priceRange.max.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Quick Profit & Demand Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 self-center lg:self-auto w-full lg:w-auto">
              {/* Category Demand */}
              <div className="p-3 rounded-2xl bg-white border border-[#E8DFC8] text-center shadow-xs">
                <span className="text-[10px] font-bold text-[#7A6E65] uppercase block mb-1">
                  {currentLang === 'hi' ? 'मांग स्तर' : 'Market Demand'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#E07A5F] px-2 py-0.5 rounded-full bg-[#E07A5F]/10">
                  <TrendingUp className="w-3 h-3" />
                  {suggestion.marketInsights.categoryDemand} Demand
                </span>
              </div>

              {/* Artisan Net Margin */}
              <div className="p-3 rounded-2xl bg-white border border-[#E8DFC8] text-center shadow-xs">
                <span className="text-[10px] font-bold text-[#7A6E65] uppercase block mb-1">
                  {currentLang === 'hi' ? 'कारीगर मुनाफा' : 'Net Margin'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#2D6A4F] px-2 py-0.5 rounded-full bg-[#81B29A]/15">
                  +{profitMarginPct}% Profit
                </span>
              </div>

              {/* Net Rupees In Hand */}
              <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-white border border-[#E8DFC8] text-center shadow-xs">
                <span className="text-[10px] font-bold text-[#7A6E65] uppercase block mb-1">
                  {currentLang === 'hi' ? 'हाथ में शुद्ध कमाई' : 'Net in Hand'}
                </span>
                <span className="text-sm font-extrabold text-[#2C241E] block">
                  ₹{netArtisanProfit > 0 ? netArtisanProfit.toLocaleString('en-IN') : 0}
                </span>
              </div>
            </div>
          </div>

          {/* Realistic Sales Channel Tiers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7A6E65] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#E07A5F]" />
                {currentLang === 'hi' ? 'बिक्री चैनल अनुसार मूल्य विकल्प:' : 'Realistic Market Channel Pricing Tiers:'}
              </span>
              <span className="text-[11px] text-[#7A6E65]">
                {currentLang === 'hi' ? 'किसी भी विकल्प पर क्लिक करके लागू करें' : 'Click to select tier'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {/* Tier 1: Direct to Consumer (Fair Living) */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTier('directConsumerFair');
                  setCustomPriceOverride(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  selectedTier === 'directConsumerFair'
                    ? 'bg-white border-[#E07A5F] ring-2 ring-[#E07A5F]/30 shadow-md'
                    : 'bg-ivory border-[#E8DFC8] hover:border-[#D9C3B0]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <ShoppingBag className="w-4 h-4 text-[#E07A5F]" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E07A5F]/15 text-[#E07A5F]">
                    Recommended
                  </span>
                </div>
                <span className="text-xs font-extrabold text-[#2C241E] block">
                  {currentLang === 'hi' ? 'सीधे ग्राहक को' : 'Direct Consumer (D2C)'}
                </span>
                <span className="text-base font-extrabold text-terracotta">
                  ₹{suggestion.marketTiers.directConsumerFair.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-[#7A6E65] mt-1 line-clamp-1">
                  Fair 35-42% living margin
                </p>
              </button>

              {/* Tier 2: Wholesale / B2B */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTier('wholesaleBulk');
                  setCustomPriceOverride(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  selectedTier === 'wholesaleBulk'
                    ? 'bg-white border-[#E07A5F] ring-2 ring-[#E07A5F]/30 shadow-md'
                    : 'bg-ivory border-[#E8DFC8] hover:border-[#D9C3B0]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Building2 className="w-4 h-4 text-[#2D6A4F]" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#81B29A]/20 text-[#2D6A4F]">
                    Bulk 50+
                  </span>
                </div>
                <span className="text-xs font-extrabold text-[#2C241E] block">
                  {currentLang === 'hi' ? 'थोक / सरकारी GeM' : 'Wholesale / TRIFED'}
                </span>
                <span className="text-base font-extrabold text-[#2D6A4F]">
                  ₹{suggestion.marketTiers.wholesaleBulk.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-[#7A6E65] mt-1 line-clamp-1">
                  Volume discount, prompt pay
                </p>
              </button>

              {/* Tier 3: Metro Boutique Retail */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTier('premiumBoutique');
                  setCustomPriceOverride(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  selectedTier === 'premiumBoutique'
                    ? 'bg-white border-[#E07A5F] ring-2 ring-[#E07A5F]/30 shadow-md'
                    : 'bg-ivory border-[#E8DFC8] hover:border-[#D9C3B0]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Store className="w-4 h-4 text-[#8A5A36]" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#8A5A36]/15 text-[#8A5A36]">
                    Metro Store
                  </span>
                </div>
                <span className="text-xs font-extrabold text-[#2C241E] block">
                  {currentLang === 'hi' ? 'शहरी शोरूम' : 'Urban Boutique'}
                </span>
                <span className="text-base font-extrabold text-[#2C241E]">
                  ₹{suggestion.marketTiers.premiumBoutique.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-[#7A6E65] mt-1 line-clamp-1">
                  High-end metro showroom rate
                </p>
              </button>

              {/* Tier 4: Global Export */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTier('exportGlobal');
                  setCustomPriceOverride(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  selectedTier === 'exportGlobal'
                    ? 'bg-white border-[#E07A5F] ring-2 ring-[#E07A5F]/30 shadow-md'
                    : 'bg-ivory border-[#E8DFC8] hover:border-[#D9C3B0]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Globe2 className="w-4 h-4 text-[#3D5A80]" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#3D5A80]/15 text-[#3D5A80]">
                    Export
                  </span>
                </div>
                <span className="text-xs font-extrabold text-[#2C241E] block">
                  {currentLang === 'hi' ? 'वैश्विक निर्यात' : 'Global Export'}
                </span>
                <span className="text-base font-extrabold text-[#3D5A80]">
                  ₹{suggestion.marketTiers.exportGlobal.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-[#7A6E65] mt-1 line-clamp-1">
                  GI-tagged & archival packing
                </p>
              </button>
            </div>
          </div>

          {/* Interactive Cost Breakdown & Living Wage Inputs */}
          <div className="p-5 rounded-3xl bg-ivory border border-[#E8DFC8] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#7A6E65] uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#E07A5F]" />
                  {currentLang === 'hi'
                    ? 'लागत एवं कारीगरी श्रम कैलकुलेटर (पारदर्शी विवरण):'
                    : 'Artisan Cost Breakdown & Fair Labor Calculator:'}
                </h4>
                <p className="text-[11px] text-[#7A6E65]">
                  {currentLang === 'hi'
                    ? 'मान बदलते ही शुद्ध मुनाफा और प्रतिशत स्वतः अपडेट होगा'
                    : 'Adjusting values recalculates your net profit in real-time'}
                </p>
              </div>

              <span className="text-xs font-extrabold text-[#2C241E] bg-white px-3 py-1 rounded-xl border border-[#E8DFC8]">
                Prime Cost: ₹{totalPrimeCost.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Material Cost Input */}
              <div className="p-3 rounded-2xl bg-white border border-[#E8DFC8] space-y-1">
                <label className="text-[11px] font-bold text-[#7A6E65] block">
                  {currentLang === 'hi' ? 'कच्चा माल खर्च' : 'Raw Material (₹)'}
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A6E65]">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={liveMatCost}
                    onChange={(e) => setLiveMatCost(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full pl-6 pr-2 py-1.5 text-sm font-bold bg-ivory rounded-xl border border-[#E8DFC8] text-[#2C241E] focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>
              </div>

              {/* Crafting Labor Hours */}
              <div className="p-3 rounded-2xl bg-white border border-[#E8DFC8] space-y-1">
                <label className="text-[11px] font-bold text-[#7A6E65] block">
                  {currentLang === 'hi' ? 'श्रम समय (घंटे)' : 'Labor Time (Hours)'}
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={liveHours}
                  onChange={(e) => setLiveHours(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 text-sm font-bold bg-ivory rounded-xl border border-[#E8DFC8] text-[#2C241E] focus:outline-none focus:border-[#E07A5F]"
                />
              </div>

              {/* Fair Hourly Wage */}
              <div className="p-3 rounded-2xl bg-white border border-[#E8DFC8] space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#7A6E65] block">
                    {currentLang === 'hi' ? 'उचित मजदूरी दर' : 'Fair Hourly Wage'}
                  </label>
                  <span className="text-[9px] text-[#2D6A4F] font-bold">₹55-85 standard</span>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A6E65]">₹</span>
                  <input
                    type="number"
                    min="30"
                    step="5"
                    value={liveWage}
                    onChange={(e) => setLiveWage(Math.max(30, Number(e.target.value) || 30))}
                    className="w-full pl-6 pr-2 py-1.5 text-sm font-bold bg-ivory rounded-xl border border-[#E8DFC8] text-[#2C241E] focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>
              </div>

              {/* Packaging & Transit */}
              <div className="p-3 rounded-2xl bg-white border border-[#E8DFC8] space-y-1">
                <label className="text-[11px] font-bold text-[#7A6E65] block">
                  {currentLang === 'hi' ? 'पैकिंग व परिवहन' : 'Packing & Transit (₹)'}
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A6E65]">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={liveOther}
                    onChange={(e) => setLiveOther(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full pl-6 pr-2 py-1.5 text-sm font-bold bg-ivory rounded-xl border border-[#E8DFC8] text-[#2C241E] focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>
              </div>
            </div>

            {/* Sanity / Fair-trade Validation Badge */}
            <div className="pt-1">
              {profitMarginPct < 20 ? (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    {currentLang === 'hi'
                      ? 'सावधानी: इस दाम पर मुनाफा 20% से कम है। कृपया दाम थोड़ा बढ़ाएं ताकि आपकी मेहनत की पूरी कद्र हो।'
                      : 'Caution: Profit margin is below 20%. Consider raising the price slightly to safeguard your fair living livelihood.'}
                  </span>
                </div>
              ) : profitMarginPct > 55 ? (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs">
                  <Info className="w-4 h-4 shrink-0 text-blue-600" />
                  <span>
                    {currentLang === 'hi'
                      ? 'सुझाव: यह दाम बहुत प्रीमियम है। यदि उत्पाद विशिष्ट/कलात्मक है तो ठीक है, अन्यथा सामान्य खुदरा बिक्री धीमी हो सकती है।'
                      : 'Notice: This price is in the luxury tier. Best for intricate or limited-edition crafts; regular sales velocity may be slower.'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    {currentLang === 'hi'
                      ? 'उत्कृष्ट एवं यथार्थवादी दाम! यह कारीगर को सम्मानजनक आजीविका और खरीदार को उचित मूल्य देता है।'
                      : 'Realistic & Fair-Trade Calibrated! Ensures master artisan livelihood while remaining attractive to national online buyers.'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Market Insights & Competitor Benchmarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Market Trend & Advice */}
            <div className="p-5 rounded-3xl bg-white border border-[#E8DFC8] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {currentLang === 'hi' ? 'बाज़ार का ताजा रुझान' : 'Market Trend & Demand Insight'}
                </span>

                <button
                  type="button"
                  onClick={handleListenAdvice}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#E07A5F] hover:underline cursor-pointer"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                  <span>{isSpeaking ? 'Speaking...' : 'Listen'}</span>
                </button>
              </div>

              <p className="text-xs text-[#2C241E] leading-relaxed font-medium">
                {suggestion.marketInsights.marketTrend}
              </p>

              <div className="p-3.5 rounded-2xl bg-ivory border border-[#E8DFC8]/70 text-xs text-brown leading-relaxed">
                <strong className="text-[#2C241E] block mb-0.5">
                  {currentLang === 'hi' ? 'रणनीतिक सलाह:' : 'Pricing Strategy Advice:'}
                </strong>
                {suggestion.marketInsights.pricingStrategyAdvice}
              </div>
            </div>

            {/* Real Competitor Benchmarks */}
            <div className="p-5 rounded-3xl bg-white border border-[#E8DFC8] space-y-3 shadow-xs">
              <span className="text-xs font-bold text-[#7A6E65] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#2D6A4F]" />
                {currentLang === 'hi' ? 'प्रतिस्पर्धी बाज़ार तुलना (Benchmarks)' : 'Real Competitor Price Benchmarks'}
              </span>

              <div className="space-y-2">
                {suggestion.marketInsights.benchmarks.map((bm, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-ivory border border-[#E8DFC8] text-xs font-medium text-[#2C241E] flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#E07A5F] shrink-0" />
                    <span>{bm}</span>
                  </div>
                ))}
              </div>

              {/* Middleman vs Karigar Setu Contrast Card */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#2D6A4F]/10 to-[#81B29A]/15 border border-[#81B29A]/40 text-xs text-[#2D6A4F] font-semibold flex items-center gap-2">
                <IndianRupee className="w-4 h-4 shrink-0 text-[#2D6A4F]" />
                <span>
                  {suggestion.traditionalVsDirectComparison.artisanBenefitMessage}
                </span>
              </div>
            </div>
          </div>

          {/* Action Bar: Apply to Listing */}
          <div className="p-4 rounded-3xl bg-ivory border border-[#E8DFC8] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold text-[#2C241E] block">
                {currentLang === 'hi'
                  ? `₹${activePrice.toLocaleString('en-IN')} को अपने उत्पाद पर लागू करें?`
                  : `Apply ₹${activePrice.toLocaleString('en-IN')} to your product listing?`}
              </span>
              <span className="text-[11px] text-[#7A6E65]">
                {currentLang === 'hi'
                  ? 'यह मूल्य लिस्टिंग फॉर्म और खरीदार कैटलॉग में दर्ज हो जाएगा'
                  : 'Automatically populates product price, cost breakdown, and rationale'}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {appliedNotice && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2D6A4F] bg-white px-3 py-1.5 rounded-xl border border-[#81B29A]">
                  <Check className="w-3.5 h-3.5" />
                  {currentLang === 'hi' ? 'दाम लागू हुआ!' : 'Price Applied!'}
                </span>
              )}

              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E07A5F] to-terracotta hover:brightness-105 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>
                  {currentLang === 'hi' ? 'यह सुझाव लागू करें' : 'Apply AI Suggested Price'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
