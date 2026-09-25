import React, { useState, useRef, useEffect } from 'react';
import { Product, ViewTab } from '../types';
import { getTranslation } from '../i18n/translations';
import { apiClient } from '../services/apiClient';
import { aiService, CatalogGenerationResult } from '../services/aiService';
import { SAMPLE_CRAFT_PRESETS } from '../data/demoProducts';
import { useHindiVoiceRecognition } from '../hooks/useHindiVoiceRecognition';
import confetti from 'canvas-confetti';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  IndianRupee,
  ShieldCheck,
  Award,
  Layers,
  Sliders,
  Play,
  Pause,
  Edit3,
  Globe,
  Tag,
  Clock,
  MapPin,
  Check,
  Eye,
  Keyboard
} from 'lucide-react';

interface AddProductWorkflowProps {
  currentLang: string;
  onPublishProduct: (product: Product) => void;
  onCancel: () => void;
  onNavigateTab: (tab: ViewTab) => void;
}

export const AddProductWorkflow: React.FC<AddProductWorkflowProps> = ({
  currentLang,
  onPublishProduct,
  onCancel,
  onNavigateTab,
}) => {
  // Current active step (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isRestoringDraft, setIsRestoringDraft] = useState<boolean>(true);

  // Step 1: Image Capture State
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [selectedImageMode, setSelectedImageMode] = useState<'enhanced' | 'original'>('enhanced');
  const [isEnhancingImage, setIsEnhancingImage] = useState<boolean>(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState<boolean>(true);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Step 3: Voice / Description State
  const [inputMode, setInputMode] = useState<'voice' | 'type'>('voice');
  const [audioTranscript, setAudioTranscript] = useState<string>('');
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Native Language-Aware Speech Recognition for Add Product Workflow
  const {
    isListening: isRecording,
    interimTranscript: liveTranscript,
    finalTranscript,
    voiceError,
    speakPromptLabel,
    listeningLabel,
    tryAgainLabel,
    typeInsteadLabel,
    stopLabel,
    startListening: startRecordingSession,
    stopListening: stopRecordingSession,
    toggleListening: toggleRecording,
    clearError: clearVoiceError,
    resetTranscript,
  } = useHindiVoiceRecognition({
    currentLang,
    onFinalResult: (transcript) => {
      setAudioTranscript(transcript);
    },
  });

  // Step 4 & 5: Extracted Catalog & Pricing Data
  const [catalogData, setCatalogData] = useState<CatalogGenerationResult>({
    name: 'Handwoven Natural Cane & Bamboo Fruit Basket',
    hindiName: 'प्राकृतिक बाँस एवं बेंत की हस्तनिर्मित टोकरी',
    category: 'Bamboo & Cane Craft',
    material: 'Organic Assam Cane, Golden Bamboo Ribs, Natural Beeswax Polish',
    craftType: 'Traditional Hexagonal Lattice Weaving (Japi Style)',
    colour: 'Natural Honey Amber',
    dimensions: '30 cm (Dia) x 18 cm (H)',
    weight: '380 grams',
    productionTime: '2.5 Days (18 Hours of Hand Weaving)',
    region: 'Barpeta, Assam',
    description:
      'Handcrafted from sustainably harvested indigenous Assam bamboo, this sturdy basket features interlocking weaves. Naturally treated with herbal smoke for moisture resistance. Perfect for dining tables and festive gifting.',
    hindiDescription:
      'असम के कुशल कारीगरों द्वारा प्राकृतिक बाँस से हस्तनिर्मित यह टोकरी अत्यंत टिकाऊ और पर्यावरण-अनुकूल है। इसमें पारंपरिक षट्कोणीय बुनाई दी गई है।',
    story:
      'Woven along the banks of the Brahmaputra River, this craft technique has been passed down for seven generations without synthetic nails or glue.',
    hindiStory:
      'ब्रह्मपुत्र नदी के किनारे सात पीढ़ियों से चली आ रही यह कला असम की सांस्कृतिक पहचान है। 3 वर्ष पुराने बाँस को बारीकी से छीलकर इसे बुना जाता है।',
    tags: ['Bamboo Craft', 'Eco Friendly', 'Assam Handloom', 'GI Tagged', 'Kitchenware'],
    recommendedPrice: 1850,
    priceRange: { min: 1600, max: 2100 },
    materialCost: 420,
    labourHours: 18,
    hourlyRate: 65,
    otherCost: 160,
    pricingRationale:
      'Calculated using GI-certified Assam cane benchmarks, 18 craftsmanship hours, and 35% artisan gross margin.',
  });

  // Step 5: Pricing Inputs
  const [materialCostInput, setMaterialCostInput] = useState<number>(420);
  const [labourHoursInput, setLabourHoursInput] = useState<number>(18);
  const [hourlyWageInput, setHourlyWageInput] = useState<number>(65);
  const [otherCostInput, setOtherCostInput] = useState<number>(160);

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const draft = await apiClient.getCurrentDraft();
        if (draft) {
          setCatalogData(prev => ({
            ...prev,
            name: draft.name || prev.name,
            hindiName: draft.hindiName || prev.hindiName,
            category: draft.category || prev.category,
            material: draft.material || prev.material,
            craftType: draft.craftType || prev.craftType,
            dimensions: draft.dimensions || prev.dimensions,
            weight: draft.weight || prev.weight,
            description: draft.description || prev.description,
            hindiDescription: draft.hindiDescription || prev.hindiDescription,
            story: draft.story || prev.story,
            hindiStory: draft.hindiStory || prev.hindiStory,
            tags: draft.tags || prev.tags,
            recommendedPrice: draft.price || prev.recommendedPrice,
          }));
          setOriginalImage(draft.image || null);
          setEnhancedImage(draft.enhancedImage || null);
          if (draft.name && draft.name !== 'Untitled Draft') {
            setCurrentStep(4);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsRestoringDraft(false);
      }
    };
    fetchDraft();
  }, []);

  useEffect(() => {
    if (isRestoringDraft) return;
    const timer = setTimeout(() => {
      apiClient.saveCurrentDraft({
        name: catalogData.name,
        hindiName: catalogData.hindiName,
        category: catalogData.category,
        material: catalogData.material,
        craftType: catalogData.craftType,
        dimensions: catalogData.dimensions,
        weight: catalogData.weight,
        description: catalogData.description,
        hindiDescription: catalogData.hindiDescription,
        story: catalogData.story,
        hindiStory: catalogData.hindiStory,
        tags: catalogData.tags,
        price: catalogData.recommendedPrice,
        image: originalImage || '',
        enhancedImage: enhancedImage || ''
      }).catch(console.error);
    }, 1500);
    return () => clearTimeout(timer);
  }, [catalogData, originalImage, enhancedImage, isRestoringDraft]);

  // Recalculate price when cost inputs change
  useEffect(() => {
    const { recommendedPrice, priceRange, pricingRationale } = aiService.calculateSmartPricing(
      materialCostInput,
      labourHoursInput,
      hourlyWageInput,
      otherCostInput,
      catalogData.category
    );

    setCatalogData((prev) => ({
      ...prev,
      recommendedPrice,
      priceRange,
      materialCost: materialCostInput,
      labourHours: labourHoursInput,
      hourlyRate: hourlyWageInput,
      otherCost: otherCostInput,
      pricingRationale,
    }));
  }, [materialCostInput, labourHoursInput, hourlyWageInput, otherCostInput, catalogData.category]);

  // Handle Camera Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  if (isRestoringDraft) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#E8DFC8] border-t-[#E07A5F] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle File Upload from Gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        setOriginalImage(result);
        stopCamera();
        processImageEnhancement(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Start Live Camera
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setIsCameraActive(false);
      // If camera access fails (e.g. iframe permission), gracefully use sample
      usePresetSample(SAMPLE_CRAFT_PRESETS[0]);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setOriginalImage(dataUrl);
        stopCamera();
        processImageEnhancement(dataUrl);
      }
    }
  };

  // Use Preset Sample Craft Photo
  const usePresetSample = (preset: typeof SAMPLE_CRAFT_PRESETS[0]) => {
    stopCamera();
    setOriginalImage(preset.image);
    setAudioTranscript(preset.voiceSample);
    setMaterialCostInput(preset.materialCost);
    setLabourHoursInput(preset.labourHours);
    processImageEnhancement(preset.image);
  };

  // AI Image Studio Enhancement
  const processImageEnhancement = async (imgSrc: string) => {
    setIsEnhancingImage(true);
    setCurrentStep(2); // Jump to AI Studio
    const enhanced = await aiService.enhanceImage(imgSrc);
    setEnhancedImage(enhanced);
    setIsEnhancingImage(false);
  };

  const retryRecordingSession = () => {
    setAudioTranscript('');
    resetTranscript();
    clearVoiceError();
    startRecordingSession();
  };

  const handleUseThisTranscript = () => {
    const textToUse = audioTranscript.trim() || finalTranscript.trim() || liveTranscript.trim();
    if (!textToUse) return;
    setAudioTranscript(textToUse);
    generateCatalogFromSpeech(textToUse);
  };

  // Process Voice to Catalog using AI Engine
  const generateCatalogFromSpeech = async (customText?: string) => {
    const textToProcess = customText || audioTranscript || finalTranscript;
    if (!textToProcess.trim()) return;
    setIsProcessingAI(true);
    try {
      const result = await aiService.generateCatalogFromVoice(textToProcess);
      setCatalogData(result);
      setMaterialCostInput(result.materialCost);
      setLabourHoursInput(result.labourHours);
      setHourlyWageInput(result.hourlyRate);
      setOtherCostInput(result.otherCost);
      setCurrentStep(4); // Move to AI Catalog review
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Playback speech synthesis
  const handleListenAloud = (text: string) => {
    setIsPlayingAudio(true);
    aiService.speakText(text, currentLang);
    setTimeout(() => setIsPlayingAudio(false), 3000);
  };

  // Final Product Publish
  const handlePublish = () => {
    // Launch festive confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E07A5F', '#81B29A', '#F4A261', '#3D405B'],
      });
    } catch {
      // Ignored if confetti fails
    }

    const finalProduct: Product = {
      id: `prod-${Date.now()}`,
      name: catalogData.name,
      hindiName: catalogData.hindiName,
      category: catalogData.category,
      material: catalogData.material,
      craftType: catalogData.craftType,
      colour: catalogData.colour,
      dimensions: catalogData.dimensions,
      weight: catalogData.weight,
      productionTime: catalogData.productionTime,
      region: catalogData.region,
      handmade: true,
      giTagged: true,
      shortDescription: catalogData.description.substring(0, 120) + '...',
      description: catalogData.description,
      hindiDescription: catalogData.hindiDescription,
      story: catalogData.story,
      hindiStory: catalogData.hindiStory,
      price: catalogData.recommendedPrice,
      priceRange: catalogData.priceRange,
      pricingBreakdown: {
        materialCost: materialCostInput,
        labourHours: labourHoursInput,
        hourlyRate: hourlyWageInput,
        otherCost: otherCostInput,
        recommendedMargin: 35,
      },
      pricingConfidence: 'High',
      pricingRationale: catalogData.pricingRationale,
      tags: catalogData.tags,
      status: 'Published',
      views: 1,
      enquiries: 0,
      image:
        selectedImageMode === 'enhanced' && enhancedImage
          ? enhancedImage
          : originalImage || SAMPLE_CRAFT_PRESETS[0].image,
      enhancedImage: enhancedImage || undefined,
      beforeAfterComparison: true,
      createdAt: new Date().toISOString().split('T')[0],
      stock: 5,
    };

    onPublishProduct(finalProduct);
  };

  const stepsList = [
    { num: 1, label: currentLang === 'hi' ? 'फोटो लें' : '1. Capture' },
    { num: 2, label: currentLang === 'hi' ? 'एआई स्टूडियो' : '2. AI Studio' },
    { num: 3, label: currentLang === 'hi' ? 'बोलकर बताएं' : '3. Speak' },
    { num: 4, label: currentLang === 'hi' ? 'कैटलॉग' : '4. Catalog' },
    { num: 5, label: currentLang === 'hi' ? 'उचित मूल्य' : '5. Pricing' },
    { num: 6, label: currentLang === 'hi' ? 'पूर्वावलोकन' : '6. Preview' },
  ];

  return (
    <div
      id="add-product-workflow-container"
      className="max-w-5xl mx-auto p-3 sm:p-6 pb-28 md:pb-12 space-y-6"
    >
      {/* Workflow Navigation Header with Breadcrumbs */}
      <div className="bg-white border border-[#E8DFC8] rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C241E] font-craft">
              {getTranslation(currentLang, 'addNewProduct')}
            </h2>
            <p className="text-xs text-[#7A6E65]">
              SIH26090 Voice-First Smart Assisted Onboarding
            </p>
          </div>

          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-xl border border-[#E8DFC8] hover:bg-[#F4EFEA] text-xs font-bold text-[#7A6E65] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Responsive Step Progress Bar - Visual Journey with Thread */}
        <div className="relative mt-4 px-2 sm:px-6 py-2">
           {/* Subtle Connecting Thread Background */}
           <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#E8DFC8]/60 -translate-y-1/2 border-t border-dashed border-[#D9C3B0]"></div>
           
           <div className="relative z-10 flex justify-between">
            {stepsList.map((st) => {
              const isCompleted = st.num < currentStep;
              const isCurrent = st.num === currentStep;

              return (
                <button
                  key={st.num}
                  onClick={() => {
                    if (st.num <= currentStep || (st.num === 2 && originalImage)) {
                      setCurrentStep(st.num);
                    }
                  }}
                  className="flex flex-col items-center gap-2 transition-all cursor-pointer group"
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all shadow-sm ${
                      isCurrent
                        ? 'bg-terracotta border-[#E07A5F] text-white ring-4 ring-[#E07A5F]/20'
                        : isCompleted
                        ? 'bg-[#81B29A] border-[#2D6A4F] text-white'
                        : 'bg-ivory border-[#D9C3B0] text-[#9C8E84]'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <span className="text-xs sm:text-sm font-bold font-craft">{st.num}</span>}
                  </div>
                  <span className={`text-[9px] sm:text-[11px] uppercase font-bold tracking-widest text-center transition-colors ${
                      isCurrent ? 'text-terracotta' : isCompleted ? 'text-[#2D6A4F]' : 'text-[#9C8E84]'
                  }`}>
                    {st.label}
                  </span>
                </button>
              );
            })}
           </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* STEP 1: CAPTURE PHOTO                                     */}
      {/* ========================================================= */}
      {currentStep === 1 && (
        <div className="bg-white border border-[#E8DFC8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#E07A5F]/15 text-[#E07A5F] flex items-center justify-center mx-auto mb-1">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#2C241E]">
              {getTranslation(currentLang, 'captureTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-brown">
              {getTranslation(currentLang, 'captureSubtitle')}
            </p>
          </div>

          {/* Camera Viewfinder or Photo Picker */}
          {isCameraActive ? (
            <div className="relative max-w-md mx-auto aspect-4/3 rounded-3xl overflow-hidden bg-black shadow-lg">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                <button
                  onClick={captureCameraSnapshot}
                  className="w-16 h-16 rounded-full bg-white text-[#E07A5F] flex items-center justify-center shadow-2xl ring-4 ring-white/50 cursor-pointer active:scale-90 transition-transform"
                >
                  <Camera className="w-8 h-8" />
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 rounded-xl bg-black/60 text-white text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {/* Option A: Take Live Camera Photo */}
              <button
                id="take-live-photo-btn"
                onClick={startCamera}
                className="p-6 rounded-3xl border-2 border-dashed border-[#E07A5F] bg-ivory hover:bg-[#E07A5F]/5 flex flex-col items-center justify-center text-center space-y-3 transition-all cursor-pointer group active:scale-98"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#E07A5F] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <span className="font-extrabold text-base text-[#2C241E] block">
                    {getTranslation(currentLang, 'takePhoto')}
                  </span>
                  <span className="text-xs text-[#7A6E65]">
                    Use phone or webcam
                  </span>
                </div>
              </button>

              {/* Option B: Choose from Gallery / File upload */}
              <button
                id="choose-gallery-btn"
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-3xl border-2 border-dashed border-[#81B29A] bg-ivory hover:bg-[#81B29A]/5 flex flex-col items-center justify-center text-center space-y-3 transition-all cursor-pointer group active:scale-98"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#81B29A] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <span className="font-extrabold text-base text-[#2C241E] block">
                    {getTranslation(currentLang, 'chooseGallery')}
                  </span>
                  <span className="text-xs text-[#7A6E65]">
                    Upload PNG or JPEG
                  </span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </button>
            </div>
          )}

          {/* Quick Sample Presets (For Hackathon Judges / One-Click Testing) */}
          <div className="pt-4 border-t border-[#E8DFC8]/60 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#7A6E65] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" />
                {currentLang === 'hi'
                  ? 'या इनमें से कोई एक नमूना शिल्प चुनें:'
                  : 'Or test instantly with a verified craft preset:'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E07A5F]/15 text-terracotta">
                One-Click Demo
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {SAMPLE_CRAFT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => usePresetSample(preset)}
                  className="p-2 rounded-2xl border border-[#E8DFC8] bg-white hover:border-[#E07A5F] hover:shadow-md transition-all text-left flex flex-col items-center text-center group cursor-pointer"
                >
                  <img
                    src={preset.image}
                    alt={preset.name}
                    className="w-14 h-14 rounded-xl object-cover mb-1.5 group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[11px] font-bold text-[#2C241E] line-clamp-1">
                    {currentLang === 'hi' ? preset.hindiName.split(' ')[0] : preset.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-[#7A6E65]">{preset.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 2: AI PRODUCT STUDIO (Before vs After Enhancement)    */}
      {/* ========================================================= */}
      {currentStep === 2 && (
        <div className="bg-white border border-[#E8DFC8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#81B29A]/15 text-[#2D6A4F] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#81B29A] animate-spin" />
              <span>AI Product Studio Active</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#2C241E]">
              {getTranslation(currentLang, 'aiProductStudio')}
            </h3>
            <p className="text-xs sm:text-sm text-brown">
              {getTranslation(currentLang, 'aiStudioSubtitle')}
            </p>
          </div>

          {/* AI Processing Banner / Indicator */}
          {isEnhancingImage ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E07A5F]/20 text-[#E07A5F] flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
              <h4 className="text-lg font-bold text-[#2C241E]">
                {currentLang === 'hi'
                  ? 'एआई आपकी तस्वीर को साफ और आकर्षक बना रहा है...'
                  : 'AI is removing background clutter and balancing lighting...'}
              </h4>
              <p className="text-xs text-[#7A6E65]">
                Calibrating white balance, studio edge shadows, and marketplace framing.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Before / After Split View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {/* 1. Original Photo */}
                <div
                  onClick={() => setSelectedImageMode('original')}
                  className={`rounded-3xl border-2 p-3 flex flex-col items-center transition-all cursor-pointer ${
                    selectedImageMode === 'original'
                      ? 'border-[#E07A5F] bg-[#E07A5F]/5 ring-2 ring-[#E07A5F]/20'
                      : 'border-[#E8DFC8] bg-ivory opacity-75'
                  }`}
                >
                  <div className="w-full aspect-4/3 rounded-2xl overflow-hidden bg-black/5 relative mb-3">
                    <img
                      src={originalImage || SAMPLE_CRAFT_PRESETS[0].image}
                      alt="Original Camera"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold">
                      {getTranslation(currentLang, 'before')}
                    </div>
                  </div>

                  <span className="text-xs font-bold text-brown">
                    Raw Camera Capture
                  </span>
                </div>

                {/* 2. AI Enhanced Photo */}
                <div
                  onClick={() => setSelectedImageMode('enhanced')}
                  className={`rounded-3xl border-2 p-3 flex flex-col items-center transition-all cursor-pointer relative ${
                    selectedImageMode === 'enhanced'
                      ? 'border-[#81B29A] bg-[#81B29A]/10 ring-4 ring-[#81B29A]/20 shadow-md'
                      : 'border-[#E8DFC8] bg-ivory'
                  }`}
                >
                  <div className="w-full aspect-4/3 rounded-2xl overflow-hidden bg-white relative mb-3 shadow-inner">
                    <img
                      src={
                        enhancedImage ||
                        originalImage ||
                        SAMPLE_CRAFT_PRESETS[0].image
                      }
                      alt="AI Enhanced Studio"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-[#2D6A4F] text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      {getTranslation(currentLang, 'after')}
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/90 text-[#2D6A4F] text-[9px] font-extrabold">
                      Studio Grade
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-extrabold text-[#2D6A4F]">
                    <CheckCircle2 className="w-4 h-4 text-[#81B29A]" />
                    <span>AI Lighting & Background Cleaned (Recommended)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 max-w-3xl mx-auto pt-4 border-t border-[#E8DFC8]">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-[#E8DFC8] text-xs font-bold text-[#7A6E65] hover:bg-ivory cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retake Photo</span>
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => {
                      setSelectedImageMode('original');
                      setCurrentStep(3);
                    }}
                    className="px-4 py-2.5 rounded-2xl border border-[#E8DFC8] hover:bg-ivory text-xs font-bold text-brown cursor-pointer"
                  >
                    {getTranslation(currentLang, 'keepOriginal')}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedImageMode('enhanced');
                      setCurrentStep(3);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E07A5F] to-terracotta hover:brightness-105 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{getTranslation(currentLang, 'useEnhanced')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 3: VOICE-FIRST DESCRIPTION                           */}
      {/* ========================================================= */}
      {currentStep === 3 && (
        <div className="bg-white border border-[#E8DFC8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#E07A5F]/15 text-[#E07A5F] flex items-center justify-center mx-auto mb-1">
              <Mic className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#2C241E]">
              {getTranslation(currentLang, 'tellUsTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-brown">
              {getTranslation(currentLang, 'tellUsSubtitle')}
            </p>
          </div>

          {/* Mode Switch: 🎙️ Speak vs ⌨️ Type */}
          <div className="flex items-center justify-center max-w-xs mx-auto p-1 rounded-2xl bg-ivory border border-[#E8DFC8]">
            <button
              onClick={() => setInputMode('voice')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                inputMode === 'voice'
                  ? 'bg-white text-[#E07A5F] shadow-xs'
                  : 'text-[#7A6E65] hover:text-[#2C241E]'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{getTranslation(currentLang, 'speakOption')}</span>
            </button>

            <button
              onClick={() => setInputMode('type')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                inputMode === 'type'
                  ? 'bg-white text-[#E07A5F] shadow-xs'
                  : 'text-[#7A6E65] hover:text-[#2C241E]'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>{getTranslation(currentLang, 'typeOption')}</span>
            </button>
          </div>

          {/* Voice Input Section */}
          {inputMode === 'voice' ? (
            <div className="max-w-xl mx-auto space-y-5">
              {/* Voice Error Alert if any */}
              {voiceError && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs animate-fadeIn">
                  <span className="font-semibold">{voiceError}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={retryRecordingSession}
                      className="px-3 py-1.5 rounded-lg bg-[#E07A5F] text-white text-xs font-bold hover:bg-terracotta flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{tryAgainLabel}</span>
                    </button>
                    <button
                      onClick={() => setInputMode('type')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#E8DFC8] text-brown text-xs font-bold hover:bg-ivory flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                    >
                      <Keyboard className="w-3.5 h-3.5" />
                      <span>{typeInsteadLabel}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Touch-Friendly Microphone Button */}
              <div className="flex flex-col items-center justify-center py-2">
                <button
                  id="main-voice-record-btn"
                  onClick={toggleRecording}
                  className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer active:scale-95 ${
                    isRecording
                      ? 'bg-red-500 text-white ring-8 ring-red-200 animate-pulse'
                      : 'bg-gradient-to-tr from-[#E07A5F] to-terracotta text-white hover:brightness-105 shadow-[#E07A5F]/40'
                  }`}
                  title={isRecording ? stopLabel : speakPromptLabel}
                >
                  {isRecording ? (
                    <MicOff className="w-10 h-10 sm:w-12 sm:h-12" />
                  ) : (
                    <Mic className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
                  )}
                </button>

                <div className="mt-3 text-center">
                  <span className="text-sm font-extrabold text-[#2C241E] block">
                    {isRecording ? (
                      <span className="text-red-600 flex items-center justify-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                        {listeningLabel}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1 text-[#E07A5F]">
                        {speakPromptLabel}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-[#7A6E65]">
                    {isRecording
                      ? (currentLang === 'hi' ? 'बोलना समाप्त करने के लिए माइक दोबारा दबाएं' : 'Tap microphone again to stop speaking')
                      : (currentLang === 'hi' ? 'माइक दबाकर अपने शिल्प और सामग्री का विवरण बोलें' : 'Tap microphone to describe your craft and materials')}
                  </span>
                </div>
              </div>

              {/* Dynamic Transcript Container */}
              <div className="p-4 rounded-3xl bg-ivory border border-[#E8DFC8] space-y-3">
                {/* Header State */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#7A6E65] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#E07A5F]" />
                    {isRecording ? (
                      <span className="text-[#E07A5F] font-extrabold">{listeningLabel}</span>
                    ) : (audioTranscript || finalTranscript) ? (
                      <span className="text-[#2D6A4F] font-extrabold">
                        {currentLang === 'hi' ? 'आपकी आवाज़ (Voice Transcript):' : 'Your Voice Transcript:'}
                      </span>
                    ) : (
                      <span>{currentLang === 'hi' ? 'शिल्प विवरण प्रतिलेख (Voice Transcript)' : 'Craft Voice Transcript'}</span>
                    )}
                  </span>

                  {(audioTranscript || finalTranscript) && !isRecording && (
                    <button
                      onClick={() => handleListenAloud(audioTranscript || finalTranscript)}
                      className="flex items-center gap-1 text-xs text-[#E07A5F] font-bold hover:underline cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{getTranslation(currentLang, 'playAudio')}</span>
                    </button>
                  )}
                </div>

                {/* Transcript Body */}
                <div className="min-h-[60px] bg-white rounded-2xl p-3 border border-[#E8DFC8]/70 text-sm text-[#2C241E] leading-relaxed">
                  {isRecording ? (
                    <p className="italic">
                      {liveTranscript ? (
                        <span className="text-[#2C241E] font-medium font-craft">{liveTranscript}</span>
                      ) : finalTranscript ? (
                        <span className="text-[#2C241E] font-medium font-craft">{finalTranscript}</span>
                      ) : (
                        <span className="text-[#9C8E84]">
                          ({speakPromptLabel}...)
                        </span>
                      )}
                    </p>
                  ) : (audioTranscript || finalTranscript) ? (
                    <p className="font-medium text-[#2C241E]">"{audioTranscript || finalTranscript}"</p>
                  ) : (
                    <p className="text-[#9C8E84] italic">
                      {currentLang === 'hi'
                        ? '(माइक दबाकर बोलें: यह उत्पाद किस चीज़ से बना है? इसे बनाने में कितने दिन लगे? इसका पारंपरिक उपयोग क्या है?)'
                        : '(Tap mic to describe: What material is it made of? How many days to craft? What is the story/use?)'}
                    </p>
                  )}
                </div>

                {/* Post-Recording Action Buttons */}
                {!isRecording && (audioTranscript || finalTranscript) && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={handleUseThisTranscript}
                      className="flex-1 py-2 px-3.5 rounded-xl bg-[#2D6A4F] hover:bg-[#23533e] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{currentLang === 'hi' ? '✓ इस विवरण का उपयोग करें' : '✓ Use this transcript'}</span>
                    </button>

                    <button
                      onClick={retryRecordingSession}
                      className="py-2 px-3 rounded-xl border border-[#E8DFC8] bg-white hover:bg-ivory text-brown text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{currentLang === 'hi' ? 'दोबारा बोलें' : 'Speak Again'}</span>
                    </button>

                    <button
                      onClick={() => setInputMode('type')}
                      className="py-2 px-3 rounded-xl border border-[#E8DFC8] bg-white hover:bg-ivory text-brown text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{typeInsteadLabel}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Sample Voice Demonstration Button for Fast Demo */}
              <button
                onClick={() => {
                  const sample =
                    currentLang === 'hi'
                      ? 'यह हाथ से बनाई गई प्राकृतिक बाँस की टोकरी है। इसे असम के कारीगरों ने 2 दिनों में बनाया है।'
                      : 'This is a handwoven organic bamboo and cane basket crafted by artisans in Assam taking 2.5 days.';
                  setAudioTranscript(sample);
                  clearVoiceError();
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-white border border-[#E8DFC8] hover:bg-ivory text-xs font-bold text-[#E07A5F] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {currentLang === 'hi'
                    ? 'उदाहरण विवरण लोड करें (Load Demo Speech)'
                    : 'Load Demo Craft Speech Transcript'}
                </span>
              </button>
            </div>
          ) : (
            /* Type Input Section */
            <div className="max-w-xl mx-auto space-y-3">
              <label className="text-xs font-bold text-[#7A6E65] block">
                Type your product description in any language:
              </label>
              <textarea
                rows={4}
                value={audioTranscript}
                onChange={(e) => setAudioTranscript(e.target.value)}
                placeholder="Example: Handwoven bamboo fruit basket made in Assam using organic cane. Takes 2 days to weave..."
                className="w-full p-4 rounded-2xl bg-ivory border border-[#E8DFC8] text-sm text-[#2C241E] focus:outline-none focus:border-[#E07A5F]"
              />
            </div>
          )}

          {/* Navigation Bottom Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E8DFC8]">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-[#E8DFC8] text-xs font-bold text-[#7A6E65] hover:bg-ivory cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              id="generate-ai-catalog-btn"
              onClick={generateCatalogFromSpeech}
              disabled={!audioTranscript.trim() || isProcessingAI}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E07A5F] to-terracotta hover:brightness-105 disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer ml-auto"
            >
              {isProcessingAI ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>
                    {currentLang === 'hi'
                      ? 'कैटलॉग तैयार हो रहा है...'
                      : 'AI is Structuring Catalog...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {currentLang === 'hi'
                      ? 'एआई कैटलॉग बनाएं'
                      : 'Generate AI Catalog'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 4: AI AUTO-CATALOGER SPECIFICATIONS                  */}
      {/* ========================================================= */}
      {currentStep === 4 && (
        <div className="bg-white border border-[#E8DFC8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DFC8] pb-4">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#81B29A] mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Extracted Automatically from Voice & Photo</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#2C241E]">
                {getTranslation(currentLang, 'aiCatalogTitle')}
              </h3>
            </div>

            <button
              onClick={() => handleListenAloud(catalogData.description)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#E07A5F]/10 hover:bg-[#E07A5F]/20 text-terracotta text-xs font-bold transition-colors cursor-pointer self-start"
            >
              <Volume2 className="w-4 h-4" />
              <span>{getTranslation(currentLang, 'listenAloud')}</span>
            </button>
          </div>

          {/* Editable Grid of Extracted Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* English Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#7A6E65]">
                {getTranslation(currentLang, 'productName')} (English)
              </label>
              <input
                type="text"
                value={catalogData.name}
                onChange={(e) =>
                  setCatalogData({ ...catalogData, name: e.target.value })
                }
                className="w-full p-3 rounded-2xl bg-ivory border border-[#E8DFC8] text-sm font-semibold text-[#2C241E] focus:outline-none focus:border-[#E07A5F]"
              />
            </div>

            {/* Hindi / Regional Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#7A6E65]">
                {getTranslation(currentLang, 'hindiName')}
              </label>
              <input
                type="text"
                value={catalogData.hindiName}
                onChange={(e) =>
                  setCatalogData({ ...catalogData, hindiName: e.target.value })
                }
                className="w-full p-3 rounded-2xl bg-ivory border border-[#E8DFC8] text-sm font-semibold text-[#2C241E] focus:outline-none focus:border-[#E07A5F]"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#7A6E65]">
                {getTranslation(currentLang, 'category')}
              </label>
              <input
                type="text"
                value={catalogData.category}
                onChange={(e) =>
                  setCatalogData({ ...catalogData, category: e.target.value })
                }
                className="w-full p-3 rounded-2xl bg-ivory border border-[#E8DFC8] text-sm text-[#2C241E] focus:outline-none focus:border-[#E07A5F]"
              />
            </div>

            {/* Craft Technique */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#7A6E65]">
                {getTranslation(currentLang, 'craftType')}
              </label>
              <input
                type="text"
                value={catalogData.craftType}
                onChange={(e) =>
                  setCatalogData({ ...catalogData, craftType: e.target.value })
                }
                className="w-full p-3 rounded-2xl bg-ivory border border-[#E8DFC8] text-sm text-[#2C241E] focus:outline-none focus:border-[#E07A5F]"
              />
            </div>

            {/* Raw Material */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#7A6E65]">
                {getTranslation(currentLang, 'material')}
              </label>
              <input
                type="text"
                value={catalogData.material}
                onChange={(e) =>
                  setCatalogData({ ...catalogData, material: e.target.value })
                }
                className="w-full p-3 rounded-2xl bg-ivory border border-[#E8DFC8] text-sm text-[#2C241E] focus:outline-none focus:border-[#E07A5F]"
              />
            </div>

            {/* Dimensions & Weight */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#7A6E65]">
                  {getTranslation(currentLang, 'dimensions')}
                </label>
                <input
                  type="text"
                  value={catalogData.dimensions}
                  onChange={(e) =>
                    setCatalogData({ ...catalogData, dimensions: e.target.value })
                  }
                  className="w-full p-3 rounded-2xl bg-ivory border border-[#E8DFC8] text-sm text-[#2C241E] focus:outline-none focus:border-[#E07A5F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#7A6E65]">
                  {getTranslation(currentLang, 'weight')}
                </label>
                <input
                  type="text"
                  value={catalogData.weight}
                  onChange={(e) =>
                    setCatalogData({ ...catalogData, weight: e.target.value })
                  }
                  className="w-full p-3 rounded-2xl bg-ivory border border-[#E8DFC8] text-sm text-[#2C241E] focus:outline-none focus:border-[#E07A5F]"
                />
              </div>
            </div>
          </div>

          {/* Description Block */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#7A6E65]">
              {getTranslation(currentLang, 'description')} (English)
            </label>
            <textarea
              rows={3}
              value={catalogData.description}
              onChange={(e) =>
                setCatalogData({ ...catalogData, description: e.target.value })
              }
              className="w-full p-3.5 rounded-2xl bg-ivory border border-[#E8DFC8] text-sm text-[#2C241E] focus:outline-none focus:border-[#E07A5F] leading-relaxed"
            />
          </div>

          {/* Hindi Description Block */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#7A6E65]">
              {getTranslation(currentLang, 'description')} (हिन्दी)
            </label>
            <textarea
              rows={2}
              value={catalogData.hindiDescription}
              onChange={(e) =>
                setCatalogData({ ...catalogData, hindiDescription: e.target.value })
              }
              className="w-full p-3.5 rounded-2xl bg-ivory border border-[#E8DFC8] text-sm text-[#2C241E] focus:outline-none focus:border-[#E07A5F] leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#7A6E65]">
              {getTranslation(currentLang, 'tags')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {catalogData.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-ivory border border-[#E8DFC8] text-xs font-semibold text-brown flex items-center gap-1"
                >
                  <Tag className="w-3 h-3 text-[#E07A5F]" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E8DFC8]">
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-[#E8DFC8] text-xs font-bold text-[#7A6E65] hover:bg-ivory cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={() => setCurrentStep(5)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E07A5F] to-terracotta hover:brightness-105 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer ml-auto"
            >
              <span>{getTranslation(currentLang, 'smartPricingTitle')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 5: CULTURAL STORYTELLING & SMART FAIR-PRICING        */}
      {/* ========================================================= */}
      {currentStep === 5 && (
        <div className="space-y-6">
          {/* Section 1: The Story Behind the Craft */}
          <div className="bg-white border border-[#E8DFC8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#E07A5F]/15 text-[#E07A5F]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#2C241E] font-craft">
                    {getTranslation(currentLang, 'craftStory')}
                  </h3>
                  <p className="text-xs text-[#7A6E65]">
                    Preserving cultural heritage and indigenous artisan lineage
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleListenAloud(catalogData.story)}
                className="flex items-center gap-1 text-xs font-bold text-[#E07A5F] hover:underline cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={catalogData.story}
              onChange={(e) =>
                setCatalogData({ ...catalogData, story: e.target.value })
              }
              className="w-full p-4 rounded-2xl bg-ivory border border-[#E8DFC8] text-sm text-[#2C241E] leading-relaxed focus:outline-none focus:border-[#E07A5F]"
            />
          </div>

          {/* Section 2: Smart Fair-Pricing Engine */}
          <div className="bg-white border border-[#E8DFC8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="text-center max-w-lg mx-auto space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4A261]/15 text-[#D97706] text-xs font-bold mb-1">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>AI Fair-Livelihood Algorithm</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#2C241E]">
                {getTranslation(currentLang, 'smartPricingTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-brown">
                {getTranslation(currentLang, 'smartPricingSubtitle')}
              </p>
            </div>

            {/* Price Recommendation Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-ivory via-white to-[#F4EFEA] border-2 border-[#E07A5F]/40 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 max-w-3xl mx-auto">
              {/* Big Price Display */}
              <div className="text-center md:text-left space-y-1">
                <span className="text-xs font-bold text-[#7A6E65] uppercase tracking-wider block">
                  {getTranslation(currentLang, 'recommendedPrice')}
                </span>
                <div className="flex items-baseline justify-center md:justify-start gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-terracotta font-craft">
                    ₹{catalogData.recommendedPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2D6A4F] bg-[#81B29A]/15 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {getTranslation(currentLang, 'highConfidence')}
                </span>
              </div>

              {/* Fair Market Range */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8DFC8] text-center md:text-right space-y-1 shadow-xs">
                <span className="text-xs font-bold text-[#7A6E65] block">
                  {getTranslation(currentLang, 'suggestedRange')}
                </span>
                <span className="text-lg font-extrabold text-[#2C241E]">
                  ₹{catalogData.priceRange.min.toLocaleString('en-IN')} — ₹
                  {catalogData.priceRange.max.toLocaleString('en-IN')}
                </span>
                <p className="text-[11px] text-[#81B29A] font-semibold">
                  Guarantees 35% artisan profit margin
                </p>
              </div>
            </div>

            {/* Transparent Cost Breakdown Calculator */}
            <div className="max-w-3xl mx-auto space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[#7A6E65] uppercase tracking-wider">
                Adjust Artisan Cost Inputs:
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Material Cost */}
                <div className="p-3 rounded-2xl bg-ivory border border-[#E8DFC8]">
                  <label className="text-[11px] font-bold text-[#7A6E65] block mb-1">
                    {getTranslation(currentLang, 'materialCost')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A6E65]">₹</span>
                    <input
                      type="number"
                      value={materialCostInput}
                      onChange={(e) => setMaterialCostInput(Number(e.target.value) || 0)}
                      className="w-full pl-6 pr-2 py-1.5 text-sm font-bold bg-white rounded-xl border border-[#E8DFC8] text-[#2C241E]"
                    />
                  </div>
                </div>

                {/* Crafting Hours */}
                <div className="p-3 rounded-2xl bg-ivory border border-[#E8DFC8]">
                  <label className="text-[11px] font-bold text-[#7A6E65] block mb-1">
                    {getTranslation(currentLang, 'labourHours')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={labourHoursInput}
                      onChange={(e) => setLabourHoursInput(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-sm font-bold bg-white rounded-xl border border-[#E8DFC8] text-[#2C241E]"
                    />
                  </div>
                </div>

                {/* Fair Hourly Wage */}
                <div className="p-3 rounded-2xl bg-ivory border border-[#E8DFC8]">
                  <label className="text-[11px] font-bold text-[#7A6E65] block mb-1">
                    {getTranslation(currentLang, 'hourlyWage')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A6E65]">₹</span>
                    <input
                      type="number"
                      value={hourlyWageInput}
                      onChange={(e) => setHourlyWageInput(Number(e.target.value) || 0)}
                      className="w-full pl-6 pr-2 py-1.5 text-sm font-bold bg-white rounded-xl border border-[#E8DFC8] text-[#2C241E]"
                    />
                  </div>
                </div>

                {/* Packaging & Transport */}
                <div className="p-3 rounded-2xl bg-ivory border border-[#E8DFC8]">
                  <label className="text-[11px] font-bold text-[#7A6E65] block mb-1">
                    {getTranslation(currentLang, 'otherCost')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A6E65]">₹</span>
                    <input
                      type="number"
                      value={otherCostInput}
                      onChange={(e) => setOtherCostInput(Number(e.target.value) || 0)}
                      className="w-full pl-6 pr-2 py-1.5 text-sm font-bold bg-white rounded-xl border border-[#E8DFC8] text-[#2C241E]"
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-brown italic pt-1">
                {catalogData.pricingRationale}
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E8DFC8]">
              <button
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-[#E8DFC8] text-xs font-bold text-[#7A6E65] hover:bg-ivory cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setCurrentStep(6)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E07A5F] to-terracotta hover:brightness-105 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer ml-auto"
              >
                <span>{getTranslation(currentLang, 'listingPreviewTitle')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 6: MARKETPLACE LISTING PREVIEW & PUBLISH             */}
      {/* ========================================================= */}
      {currentStep === 6 && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E8DFC8] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DFC8] pb-4">
              <div>
                <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-wider">
                  Final Step
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#2C241E] font-craft">
                  {getTranslation(currentLang, 'listingPreviewTitle')}
                </h3>
                <p className="text-xs text-[#7A6E65]">
                  {getTranslation(currentLang, 'listingPreviewSubtitle')}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-2xl border border-[#E8DFC8] hover:bg-ivory text-xs font-bold text-brown cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{getTranslation(currentLang, 'editDetails')}</span>
                </button>
              </div>
            </div>

            {/* Professional E-Commerce Preview Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-ivory p-5 sm:p-6 rounded-3xl border border-[#E8DFC8]">
              {/* Product Photo Showcase */}
              <div className="md:col-span-5 space-y-3">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-[#E8DFC8] shadow-sm">
                  <img
                    src={
                      selectedImageMode === 'enhanced' && enhancedImage
                        ? enhancedImage
                        : originalImage || SAMPLE_CRAFT_PRESETS[0].image
                    }
                    alt={catalogData.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-ivory/90 backdrop-blur-xs text-[#2C241E] border border-[#E8DFC8]">
                    {catalogData.category}
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#81B29A] text-white flex items-center gap-0.5 shadow-sm">
                    <ShieldCheck className="w-3 h-3" /> GI Protected
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#E8DFC8] flex items-center justify-between text-xs">
                  <span className="font-bold text-brown">Craft Tradition:</span>
                  <span className="font-extrabold text-[#2C241E]">{catalogData.region}</span>
                </div>
              </div>

              {/* Product Metadata & Specifications */}
              <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C241E] leading-snug">
                      {catalogData.name}
                    </h2>
                    {catalogData.hindiName && (
                      <p className="text-sm font-semibold text-[#E07A5F] mt-0.5 font-devanagari">
                        {catalogData.hindiName}
                      </p>
                    )}
                  </div>

                  {/* Price Banner */}
                  <div className="flex items-baseline gap-2 py-2 border-y border-[#E8DFC8]/60">
                    <span className="text-3xl font-extrabold text-terracotta font-craft">
                      ₹{catalogData.recommendedPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-[#7A6E65]">
                      (Fair Artisan Price • Free Shipping Eligible)
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-brown leading-relaxed">
                    {catalogData.description}
                  </p>

                  {/* Key Specifications Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-[#E8DFC8]">
                      <span className="text-[10px] text-[#7A6E65] block">Material</span>
                      <span className="font-bold text-[#2C241E] line-clamp-1">{catalogData.material}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E8DFC8]">
                      <span className="text-[10px] text-[#7A6E65] block">Craft Technique</span>
                      <span className="font-bold text-[#2C241E] line-clamp-1">{catalogData.craftType}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E8DFC8]">
                      <span className="text-[10px] text-[#7A6E65] block">Dimensions</span>
                      <span className="font-bold text-[#2C241E]">{catalogData.dimensions}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E8DFC8]">
                      <span className="text-[10px] text-[#7A6E65] block">Production Time</span>
                      <span className="font-bold text-[#2C241E]">{catalogData.productionTime}</span>
                    </div>
                  </div>

                  {/* Cultural Story Excerpt */}
                  <div className="p-3 rounded-2xl bg-[#E07A5F]/10 border border-[#E07A5F]/20 text-xs">
                    <span className="font-bold text-terracotta block mb-0.5">
                      Story Behind the Craft:
                    </span>
                    <p className="text-brown leading-relaxed line-clamp-2">
                      {catalogData.story}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Publishing CTAs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E8DFC8]">
              <button
                onClick={() => setCurrentStep(5)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-[#E8DFC8] text-xs font-bold text-[#7A6E65] hover:bg-ivory cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => {
                    const draft: Product = {
                      id: `draft-${Date.now()}`,
                      name: catalogData.name,
                      hindiName: catalogData.hindiName,
                      category: catalogData.category,
                      material: catalogData.material,
                      craftType: catalogData.craftType,
                      colour: catalogData.colour,
                      dimensions: catalogData.dimensions,
                      weight: catalogData.weight,
                      productionTime: catalogData.productionTime,
                      region: catalogData.region,
                      handmade: true,
                      giTagged: true,
                      shortDescription: catalogData.description.substring(0, 100) + '...',
                      description: catalogData.description,
                      hindiDescription: catalogData.hindiDescription,
                      story: catalogData.story,
                      hindiStory: catalogData.hindiStory,
                      price: catalogData.recommendedPrice,
                      priceRange: catalogData.priceRange,
                      pricingBreakdown: {
                        materialCost: materialCostInput,
                        labourHours: labourHoursInput,
                        hourlyRate: hourlyWageInput,
                        otherCost: otherCostInput,
                        recommendedMargin: 35,
                      },
                      pricingConfidence: 'High',
                      pricingRationale: catalogData.pricingRationale,
                      tags: catalogData.tags,
                      status: 'Draft',
                      views: 0,
                      enquiries: 0,
                      image: originalImage || SAMPLE_CRAFT_PRESETS[0].image,
                      createdAt: new Date().toISOString().split('T')[0],
                      stock: 1,
                    };
                    onPublishProduct(draft);
                  }}
                  className="px-4 py-3 rounded-2xl border border-[#E8DFC8] hover:bg-ivory text-xs sm:text-sm font-bold text-brown cursor-pointer"
                >
                  {getTranslation(currentLang, 'saveDraft')}
                </button>

                <button
                  id="final-publish-product-btn"
                  onClick={handlePublish}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#E07A5F] via-terracotta to-[#3D405B] hover:brightness-110 text-white font-extrabold text-sm shadow-xl shadow-[#E07A5F]/30 transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{getTranslation(currentLang, 'publishProduct')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
