import React, { useState } from 'react';
import { BuyerEnquiry, ViewTab } from '../types';
import { getTranslation } from '../i18n/translations';
import {
  Building2,
  Landmark,
  ShoppingBag,
  Gift,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  Send,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Award,
  IndianRupee,
  MapPin,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MarketLinkageViewProps {
  enquiries: BuyerEnquiry[];
  currentLang: string;
  onUpdateEnquiryStatus: (id: string, newStatus: BuyerEnquiry['status']) => void;
  onNavigateTab: (tab: ViewTab) => void;
}

export const MarketLinkageView: React.FC<MarketLinkageViewProps> = ({
  enquiries,
  currentLang,
  onUpdateEnquiryStatus,
  onNavigateTab,
}) => {
  const [selectedEnquiry, setSelectedEnquiry] = useState<BuyerEnquiry | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [activeChannelTab, setActiveChannelTab] = useState<'All' | 'B2B' | 'Government' | 'Retail'>('All');

  const channelCards = [
    {
      id: 'b2b',
      title: getTranslation(currentLang, 'b2bBuyers'),
      desc: getTranslation(currentLang, 'b2bDesc'),
      icon: Building2,
      partners: 'FabIndia, Jaypore, Good Earth, Dastkar Retail',
      badge: 'High Volume Demand',
      color: 'from-[#E07A5F] to-terracotta',
    },
    {
      id: 'gov',
      title: getTranslation(currentLang, 'govMarketplace'),
      desc: getTranslation(currentLang, 'govDesc'),
      icon: Landmark,
      partners: 'GeM Portal, Ministry of Tribal Affairs, TRIFED',
      badge: 'Zero Middleman Commission',
      color: 'from-[#81B29A] to-[#2D6A4F]',
    },
    {
      id: 'retail',
      title: getTranslation(currentLang, 'retailBuyers'),
      desc: getTranslation(currentLang, 'retailDesc'),
      icon: ShoppingBag,
      partners: 'Direct Urban & NRI Craft Connoisseurs',
      badge: 'Highest Margin',
      color: 'from-[#3D405B] to-[#2C241E]',
    },
    {
      id: 'bulk',
      title: getTranslation(currentLang, 'bulkOrders'),
      desc: getTranslation(currentLang, 'bulkDesc'),
      icon: Gift,
      partners: 'Tata, Infosys Festive Hampers, Luxury Resorts',
      badge: 'Advance 50% Payment',
      color: 'from-[#F4A261] to-[#E76F51]',
    },
    {
      id: 'exhibitions',
      title: getTranslation(currentLang, 'exhibitionOpp'),
      desc: getTranslation(currentLang, 'exhibitionDesc'),
      icon: Calendar,
      partners: 'Surajkund Crafts Mela, Shilpgram, Delhi Haat',
      badge: 'Stall Subsidies Available',
      color: 'from-[#8D5B4C] to-[#5A3825]',
    },
  ];

  const handleOpenRespond = (enq: BuyerEnquiry) => {
    setSelectedEnquiry(enq);
    setCounterPrice(enq.offeredPricePerUnit || 1800);
    setResponseMessage(
      currentLang === 'hi'
        ? `नमस्ते! हम ${enq.quantityRequested} यूनिट्स का ऑर्डर समय पर तैयार कर सकते हैं। कृपया डिलीवरी विवरण साझा करें।`
        : `Thank you for your interest! We can craft and dispatch the batch of ${enq.quantityRequested} units within 14 days.`
    );
  };

  const handleSendResponse = () => {
    if (selectedEnquiry) {
      onUpdateEnquiryStatus(selectedEnquiry.id, 'Responded');
      setSelectedEnquiry(null);
    }
  };

  const handleAcceptOrder = (enquiryId: string) => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
    onUpdateEnquiryStatus(enquiryId, 'Accepted');
    setSelectedEnquiry(null);
  };

  return (
    <div id="market-linkage-view" className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 pb-24 md:pb-12">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#3D405B] via-[#4A4E69] to-[#2C241E] text-white p-6 sm:p-10 rounded-3xl shadow-craft-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 opacity-10 bg-craft-pattern pointer-events-none"></div>
        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-widest border border-white/20">
            <Landmark className="w-3.5 h-3.5 text-[#81B29A]" />
            <span>SIH26090 Direct Institutional Linkage</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-craft">
            {getTranslation(currentLang, 'reachMoreBuyers')}
          </h2>

          <p className="text-sm text-white/80 max-w-md leading-relaxed font-medium">
            {getTranslation(currentLang, 'reachMoreBuyersSubtitle')}
          </p>
        </div>
        
        {/* Visual Linkage Illustration */}
        <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-4 w-full md:w-auto bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
           <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#E07A5F] border-2 border-white/20 flex items-center justify-center shadow-lg">
                 <span className="text-2xl">👩🏽‍🎨</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-ivory">Karigar</span>
           </div>
           
           <div className="flex flex-col items-center justify-center w-16 sm:w-24 border-t-2 border-dashed border-[#F2CC8F]/50 pt-2">
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#F2CC8F]">Karigar Setu</span>
           </div>
           
           <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#81B29A] border-2 border-white/20 flex items-center justify-center shadow-lg">
                 <span className="text-2xl">🏢</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-ivory">Buyer</span>
           </div>
        </div>
      </div>

      {/* 2. Institutional Market Channels */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[#2C241E] font-craft">
            Connected Marketplace Channels
          </h3>
          <p className="text-xs text-[#7A6E65]">
            Verified pipelines integrated with Karigar Setu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {channelCards.map((ch) => {
            const Icon = ch.icon;
            return (
              <div
                key={ch.id}
                className="p-5 rounded-3xl bg-white border border-[#E8DFC8] shadow-xs hover:shadow-lg hover:border-[#E07A5F]/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${ch.color} text-white flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#81B29A]/15 text-[#2D6A4F] border border-[#81B29A]/30">
                      {ch.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-[#2C241E]">
                      {ch.title}
                    </h4>
                    <p className="text-xs text-brown mt-1 leading-relaxed">
                      {ch.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F4EFEA] text-[11px] text-[#7A6E65]">
                  <span className="font-bold text-[#2C241E] block mb-0.5">
                    Key Buyers:
                  </span>
                  <span>{ch.partners}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Live Buyer Enquiries Inbox */}
      <div className="bg-white border border-[#E8DFC8] rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DFC8] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-[#2C241E] font-craft">
                Active Buyer Enquiries & Bulk Orders
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#E07A5F] text-white text-[10px] font-extrabold">
                {enquiries.length} Orders
              </span>
            </div>
            <p className="text-xs text-[#7A6E65]">
              Communicate directly with verified institutional sourcing leads.
            </p>
          </div>
        </div>

        {/* Enquiries List */}
        <div className="space-y-3.5">
          {enquiries.map((enq) => {
            const isPending = enq.status === 'Pending';
            const isAccepted = enq.status === 'Accepted';

            return (
              <div
                key={enq.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isPending
                    ? 'bg-ivory border-[#E07A5F]/40 shadow-xs'
                    : isAccepted
                    ? 'bg-[#81B29A]/5 border-[#81B29A]/40'
                    : 'bg-white border-[#E8DFC8]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Buyer & Order Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D405B] text-white">
                        {enq.buyerType}
                      </span>
                      {enq.verifiedBadge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#81B29A]/20 text-[#2D6A4F] flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          {getTranslation(currentLang, 'verifiedBuyer')}
                        </span>
                      )}
                      <span className="text-[11px] text-[#9C8E84] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {enq.date}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base text-[#2C241E]">
                        {enq.buyerName}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-[#7A6E65] mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#E07A5F]" />
                          {enq.buyerLocation}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-terracotta">
                          Product: {enq.productName}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-brown leading-relaxed italic bg-white/80 p-3 rounded-xl border border-[#E8DFC8]/60">
                      "{enq.message}"
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-1">
                      <span className="text-[#2C241E]">
                        Quantity Requested:{' '}
                        <strong className="text-[#E07A5F]">
                          {enq.quantityRequested} units
                        </strong>
                      </span>
                      {enq.offeredPricePerUnit && (
                        <span className="text-[#2C241E]">
                          Offered Price:{' '}
                          <strong className="text-[#2D6A4F]">
                            ₹{enq.offeredPricePerUnit}/unit
                          </strong>{' '}
                          (Total: ₹
                          {(
                            enq.offeredPricePerUnit * enq.quantityRequested
                          ).toLocaleString('en-IN')}
                          )
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions for this Enquiry */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleAcceptOrder(enq.id)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#81B29A] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{getTranslation(currentLang, 'acceptOffer')}</span>
                        </button>
                        <button
                          onClick={() => handleOpenRespond(enq)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#E07A5F] hover:bg-terracotta text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{getTranslation(currentLang, 'respondEnquiry')}</span>
                        </button>
                      </>
                    ) : isAccepted ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-[#81B29A]/20 text-[#2D6A4F] text-xs font-extrabold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Order Confirmed
                      </span>
                    ) : (
                      <span className="px-3.5 py-1.5 rounded-xl bg-ivory border border-[#E8DFC8] text-[#7A6E65] text-xs font-bold">
                        Response Sent
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RESPOND / NEGOTIATE MODAL */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-ivory border border-[#E8DFC8] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-white border-b border-[#E8DFC8] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-[#2C241E]">
                  Respond to {selectedEnquiry.buyerName}
                </h3>
                <span className="text-xs text-[#7A6E65]">
                  Order for {selectedEnquiry.quantityRequested} units of {selectedEnquiry.productName}
                </span>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1 rounded-full hover:bg-[#F4EFEA] text-[#7A6E65] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#7A6E65]">
                  Your Counter Offer (₹ per unit):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#7A6E65]">₹</span>
                  <input
                    type="number"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(Number(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-white border border-[#E8DFC8] text-sm font-bold text-[#2C241E]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#7A6E65]">
                  Message to Buyer:
                </label>
                <textarea
                  rows={3}
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-white border border-[#E8DFC8] text-sm text-[#2C241E]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#E07A5F]/10 border border-[#E07A5F]/20 text-xs text-terracotta">
                Karigar Setu handles secure Escrow advance payments and dispatch tracking.
              </div>
            </div>

            <div className="p-4 bg-white border-t border-[#E8DFC8] flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#7A6E65] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendResponse}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#E07A5F] hover:bg-terracotta text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send Response</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
