export interface Product {
  id: string;
  name: string;
  hindiName?: string;
  category: string;
  material: string;
  craftType: string;
  colour: string;
  dimensions: string;
  weight: string;
  productionTime: string;
  region: string;
  handmade: boolean;
  giTagged?: boolean;
  shortDescription: string;
  description: string;
  hindiDescription?: string;
  story: string;
  hindiStory?: string;
  artisanNote?: string;
  price: number;
  priceRange: {
    min: number;
    max: number;
  };
  pricingBreakdown: {
    materialCost: number;
    labourHours: number;
    hourlyRate: number;
    otherCost: number;
    recommendedMargin: number;
  };
  pricingConfidence: 'High' | 'Medium' | 'Moderate';
  pricingRationale: string;
  tags: string[];
  status: 'Published' | 'Draft' | 'Under Review';
  views: number;
  enquiries: number;
  image: string;
  enhancedImage?: string;
  beforeAfterComparison?: boolean;
  createdAt: string;
  stock: number;
}

export interface BuyerEnquiry {
  id: string;
  productId: string;
  productName: string;
  buyerName: string;
  buyerType: 'Retail Buyer' | 'B2B Wholesale' | 'Government / TRIFED' | 'Exhibition Curator' | 'Export House';
  buyerLocation: string;
  quantityRequested: number;
  offeredPricePerUnit?: number;
  message: string;
  date: string;
  status: 'Pending' | 'Responded' | 'Accepted' | 'Declined';
  phone?: string;
  verifiedBadge: boolean;
}

export interface ArtisanProfile {
  name: string;
  hindiName: string;
  craftCategory: string;
  region: string;
  district: string;
  state: string;
  languages: string[];
  experienceYears: number;
  artisanCardNumber: string;
  giRecognition: boolean;
  about: string;
  phone: string;
  profilePhoto: string;
  bankAccountLinked: boolean;
  totalProductsSold: number;
  rating: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  hindiTitle?: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'enquiry' | 'listing' | 'tip' | 'pricing';
  actionUrl?: string;
}

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  region: string;
}

export type ViewTab = 'home' | 'products' | 'add' | 'buyers' | 'analytics' | 'assistant' | 'profile';
