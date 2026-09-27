import React, { useState, useEffect, useRef } from 'react';
import { ViewTab, Product, BuyerEnquiry, ArtisanProfile, NotificationItem } from './types';
import { INITIAL_PROFILE, INITIAL_NOTIFICATIONS, INITIAL_PRODUCTS, INITIAL_BUYER_ENQUIRIES } from './data/demoProducts';
import { apiClient } from './services/apiClient';
import { 
  auth, 
  signInWithGoogle, 
  logOut, 
  subscribeToAuth,
  getFirestoreProducts,
  saveFirestoreProduct,
  deleteFirestoreProduct,
  getFirestoreEnquiries,
  saveFirestoreEnquiry,
  updateFirestoreEnquiryStatus,
  getFirestoreNotifications,
  saveFirestoreNotification,
  markAllFirestoreNotificationsRead,
  getFirestoreArtisanProfile,
  saveFirestoreArtisanProfile
} from './services/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DemoModeBar } from './components/DemoModeBar';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { OnboardingModal } from './components/OnboardingModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { HomeView } from './views/HomeView';
import { AddProductWorkflow } from './views/AddProductWorkflow';
import { MyProductsView } from './views/MyProductsView';
import { MarketLinkageView } from './views/MarketLinkageView';
import { AssistantView } from './views/AssistantView';
import { AnalyticsView } from './views/AnalyticsView';
import { ProfileView } from './views/ProfileView';

// Low-stock threshold definition
export const LOW_STOCK_THRESHOLD = 5;

// Helper to resolve route tab from URL hash/path
function getTabFromUrl(): ViewTab {
  try {
    const hash = window.location.hash.replace('#/', '').replace('#', '').toLowerCase();
    const pathname = window.location.pathname.replace(/^\//, '').toLowerCase();
    const route = hash || pathname;

    if (route === 'products' || route === 'my-products') return 'products';
    if (route === 'add' || route === 'add-product' || route === 'catalog') return 'add';
    if (route === 'buyers' || route === 'market' || route === 'market-linkage') return 'buyers';
    if (route === 'assistant' || route === 'saathi' || route === 'ai-assistant') return 'assistant';
    if (route === 'analytics' || route === 'reports') return 'analytics';
    if (route === 'profile' || route === 'artisan') return 'profile';
  } catch {
    // fallback
  }
  return 'home';
}

export function App() {
  // Navigation & Language State
  const [currentTab, setCurrentTab] = useState<ViewTab>(getTabFromUrl);
  const [currentLang, setCurrentLang] = useState<string>('en');

  // Firebase Authentication State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Application Data States (API / Firestore fetched)
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [enquiries, setEnquiries] = useState<BuyerEnquiry[]>([]);
  const [profile, setProfile] = useState<ArtisanProfile>(INITIAL_PROFILE);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Modals & Drawers State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [isSimulatingDemo, setIsSimulatingDemo] = useState<boolean>(false);

  // Track low stock notifications already triggered in this session to prevent spam
  const triggeredLowStockRef = useRef<Set<string>>(new Set());

  // Synchronize Tab with URL Hash & Browser History
  const navigateToTab = (tab: ViewTab) => {
    setCurrentTab(tab);
    try {
      const hashMap: Record<ViewTab, string> = {
        home: '#/',
        products: '#/products',
        add: '#/add-product',
        buyers: '#/market',
        assistant: '#/assistant',
        analytics: '#/analytics',
        profile: '#/profile',
      };
      if (window.location.hash !== hashMap[tab]) {
        window.history.pushState({ tab }, '', hashMap[tab]);
      }
    } catch {
      // Ignored in sandboxed iframes
    }
  };

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromUrl();
      setCurrentTab(tab);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Subscribe to Firebase Authentication
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Attempt to load user-specific data from Firestore
          const [fsProducts, fsEnquiries, fsNotifs, fsProfile] = await Promise.all([
            getFirestoreProducts(user.uid),
            getFirestoreEnquiries(user.uid),
            getFirestoreNotifications(user.uid),
            getFirestoreArtisanProfile(user.uid),
          ]);

          if (fsProducts.length > 0) {
            setProducts(fsProducts);
          } else {
            // Seed current products to Firestore for this newly signed-in artisan
            INITIAL_PRODUCTS.forEach((p) => saveFirestoreProduct(p, user.uid));
          }

          if (fsEnquiries.length > 0) {
            setEnquiries(fsEnquiries);
          } else {
            INITIAL_BUYER_ENQUIRIES.forEach((e) => saveFirestoreEnquiry(e, user.uid));
          }

          if (fsNotifs.length > 0) {
            setNotifications(fsNotifs);
          }

          if (fsProfile) {
            setProfile(fsProfile);
          } else if (user.displayName) {
            const updatedProfile: ArtisanProfile = {
              ...INITIAL_PROFILE,
              name: user.displayName,
              profilePhoto: user.photoURL || INITIAL_PROFILE.profilePhoto,
            };
            setProfile(updatedProfile);
            saveFirestoreArtisanProfile(updatedProfile, user.uid);
          }
        } catch (err) {
          console.error('Error fetching Firestore user data:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch initial data from backend (fallback / baseline)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [fetchedProducts, fetchedDrafts, fetchedOrders] = await Promise.all([
          apiClient.getProducts(),
          apiClient.getDrafts(),
          apiClient.getOrders(),
        ]);
        const combined = [...fetchedProducts, ...fetchedDrafts].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setProducts(combined);
        setEnquiries(fetchedOrders);
      } catch (err) {
        console.error('Error fetching data from backend API:', err);
      } finally {
        setIsInitialLoad(false);
      }
    };
    fetchInitialData();
  }, []);

  // Automated Low-Stock Notification System
  // Triggers a 'Restock Needed' alert in NotificationDrawer when a product's stock count drops below threshold
  useEffect(() => {
    if (products.length === 0) return;

    const newRestockAlerts: NotificationItem[] = [];

    products.forEach((prod) => {
      if (typeof prod.stock === 'number' && prod.stock <= LOW_STOCK_THRESHOLD) {
        const notifId = `restock-${prod.id}`;
        const alreadyInState = notifications.some((n) => n.id === notifId);

        if (!alreadyInState && !triggeredLowStockRef.current.has(notifId)) {
          triggeredLowStockRef.current.add(notifId);
          const alert: NotificationItem = {
            id: notifId,
            title: `Restock Needed: ${prod.name}`,
            hindiTitle: `पुनर्भरण आवश्यक: ${prod.hindiName || prod.name}`,
            message: `Stock for "${prod.name}" has dropped to ${prod.stock} ${prod.stock === 1 ? 'unit' : 'units'} (below threshold of ${LOW_STOCK_THRESHOLD}). Restock needed to fulfill incoming buyer enquiries.`,
            time: 'Just now',
            read: false,
            type: 'restock',
            actionUrl: 'products',
            productId: prod.id,
            stock: prod.stock,
          };
          newRestockAlerts.push(alert);

          // If signed in, sync notification to Firestore
          if (currentUser?.uid) {
            saveFirestoreNotification(alert, currentUser.uid);
          }
        }
      }
    });

    if (newRestockAlerts.length > 0) {
      setNotifications((prev) => [...newRestockAlerts, ...prev]);
    }
  }, [products, currentUser]);

  // Handlers
  const handlePublishNewProduct = async (newProduct: Product) => {
    try {
      const { id } = await apiClient.createProduct(newProduct);
      const createdProduct = { ...newProduct, id };
      setProducts((prev) => [createdProduct, ...prev]);

      // Sync to Firestore if user is authenticated
      if (currentUser?.uid) {
        await saveFirestoreProduct(createdProduct, currentUser.uid);
      }

      // Push celebratory notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Product Published Successfully!',
        hindiTitle: 'उत्पाद सफलतापूर्वक प्रकाशित हुआ!',
        message: `${newProduct.name} is now live and listed across all connected B2B & Retail buyer networks.`,
        time: 'Just now',
        read: false,
        type: 'listing',
        actionUrl: 'products',
      };
      setNotifications((prev) => [newNotif, ...prev]);

      if (currentUser?.uid) {
        saveFirestoreNotification(newNotif, currentUser.uid);
      }

      navigateToTab('products');
    } catch (e) {
      console.error('Failed to publish product:', e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const prod = products.find((p) => p.id === id);
      if (prod?.status === 'Draft') {
        await apiClient.deleteDraft(id);
      } else {
        await apiClient.deleteProduct(id);
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));

      if (currentUser?.uid) {
        await deleteFirestoreProduct(id);
      }
    } catch (e) {
      console.error('Failed to delete product:', e);
    }
  };

  const handleDuplicateProduct = async (prod: Product) => {
    try {
      const duplicated: Partial<Product> = {
        ...prod,
        name: `${prod.name} (Copy)`,
        hindiName: prod.hindiName ? `${prod.hindiName} (प्रतिलिपि)` : undefined,
        views: 0,
        enquiries: 0,
        status: 'Draft',
        createdAt: new Date().toISOString().split('T')[0],
      };

      const { id } = await apiClient.createDraft(duplicated);
      const fullDuplicated = { ...prod, ...duplicated, id } as Product;

      setProducts((prev) => [fullDuplicated, ...prev]);

      if (currentUser?.uid) {
        await saveFirestoreProduct(fullDuplicated, currentUser.uid);
      }

      navigateToTab('products');
    } catch (e) {
      console.error('Failed to duplicate product:', e);
    }
  };

  const handleUpdateEnquiryStatus = async (id: string, newStatus: BuyerEnquiry['status']) => {
    try {
      await apiClient.updateOrderStatus(id, newStatus);
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );

      if (currentUser?.uid) {
        await updateFirestoreEnquiryStatus(id, newStatus);
      }
    } catch (e) {
      console.error('Failed to update enquiry status:', e);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (currentUser?.uid) {
      await markAllFirestoreNotificationsRead(currentUser.uid, notifications);
    }
  };

  const handleResetDemo = async () => {
    setProducts(INITIAL_PRODUCTS);
    setEnquiries(INITIAL_BUYER_ENQUIRIES);
    setProfile(INITIAL_PROFILE);
    setNotifications(INITIAL_NOTIFICATIONS);
    triggeredLowStockRef.current.clear();
    navigateToTab('home');
  };

  const handleSignInGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google Sign In failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setCurrentUser(null);
    } catch (error) {
      console.error('Sign Out failed:', error);
    }
  };

  // Interactive Guided Tour
  const handleTriggerGuidedDemo = () => {
    setIsSimulatingDemo(true);
    navigateToTab('add');
    setTimeout(() => {
      setIsSimulatingDemo(false);
    }, 1500);
  };

  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center text-[#2C241E]">
        <div className="w-12 h-12 rounded-full border-4 border-[#E8DFC8] border-t-[#E07A5F] animate-spin mb-4" />
        <p className="font-bold text-sm">Loading Karigar Setu...</p>
      </div>
    );
  }

  return (
    <div
      id="karigar-setu-app"
      className="min-h-screen bg-ivory text-[#2C241E] flex flex-col font-sans selection:bg-[#E07A5F]/20 selection:text-terracotta"
    >
      {/* 1. Top Hackathon Presentation Bar */}
      <DemoModeBar
        currentLang={currentLang}
        onTriggerGuidedDemo={handleTriggerGuidedDemo}
        onOpenVoiceAssistant={() => navigateToTab('assistant')}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onResetData={handleResetDemo}
        isSimulatingDemo={isSimulatingDemo}
      />

      {/* 2. Global Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenVoiceAssistant={() => navigateToTab('assistant')}
        onOpenProfile={() => navigateToTab('profile')}
        onGoHome={() => navigateToTab('home')}
        profile={profile}
        currentUser={currentUser}
        onSignInGoogle={handleSignInGoogle}
        onSignOut={handleSignOut}
        isFirebaseConnected={true}
      />

      {/* 3. Main Responsive Layout with Navigation */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar Navigation */}
        <Navigation
          currentTab={currentTab}
          onSelectTab={navigateToTab}
          onTabChange={navigateToTab}
          currentLang={currentLang}
          enquiriesCount={enquiries.filter((e) => e.status === 'Pending').length}
          publishedCount={products.length}
          productsCount={products.length}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 w-full overflow-x-hidden">
          {currentTab === 'home' && (
            <HomeView
              products={products}
              enquiries={enquiries}
              profile={profile}
              currentLang={currentLang}
              onNavigateTab={navigateToTab}
              onStartAddProduct={() => navigateToTab('add')}
              onOpenVoiceAssistant={() => navigateToTab('assistant')}
              onViewProductDetail={() => navigateToTab('products')}
            />
          )}

          {currentTab === 'add' && (
            <AddProductWorkflow
              currentLang={currentLang}
              onPublishProduct={handlePublishNewProduct}
              onCancel={() => navigateToTab('home')}
              onNavigateTab={navigateToTab}
            />
          )}

          {currentTab === 'products' && (
            <MyProductsView
              products={products}
              currentLang={currentLang}
              onStartAddProduct={() => navigateToTab('add')}
              onDeleteProduct={handleDeleteProduct}
              onDuplicateProduct={handleDuplicateProduct}
            />
          )}

          {currentTab === 'buyers' && (
            <MarketLinkageView
              enquiries={enquiries}
              currentLang={currentLang}
              onUpdateEnquiryStatus={handleUpdateEnquiryStatus}
              onNavigateTab={navigateToTab}
            />
          )}

          {currentTab === 'assistant' && (
            <AssistantView
              currentLang={currentLang}
              profile={profile}
              onNavigateTab={navigateToTab}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              products={products}
              enquiries={enquiries}
              profile={profile}
              currentLang={currentLang}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              profile={profile}
              currentLang={currentLang}
              onUpdateProfile={setProfile}
              onNavigateTab={navigateToTab}
            />
          )}
        </main>
      </div>

      {/* 4. Global Footer */}
      <footer className="mt-auto pt-8 pb-24 md:pb-12 border-t border-[#D9C3B0] bg-ivory text-center z-10 relative">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center space-y-2 opacity-90">
          <p className="text-sm sm:text-base font-extrabold text-terracotta uppercase tracking-widest font-craft">Karigar Setu</p>
          <div className="h-0.5 w-12 bg-terracotta/30 rounded-full my-1"></div>
          <p className="text-[10px] sm:text-xs text-brown font-extrabold uppercase tracking-widest">
            Ministry of Social Justice and Empowerment
          </p>
          <p className="text-[10px] sm:text-xs text-[#7A6E65] font-bold uppercase tracking-widest">
            Department of Social Justice and Empowerment
          </p>
          <p className="text-[9px] text-[#9C8E84] mt-2">
            Government of India
          </p>
        </div>
      </footer>

      {/* 5. Modals & Side Drawers */}
      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        currentLang={currentLang}
        onNavigateTab={(tab) => {
          navigateToTab(tab);
          setIsVoiceAssistantOpen(false);
        }}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentLang={currentLang}
        onStartAddProduct={() => {
          setIsOnboardingOpen(false);
          navigateToTab('add');
        }}
        onOpenVoiceAssistant={() => {
          setIsOnboardingOpen(false);
          navigateToTab('assistant');
        }}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onNavigateTab={(tab) => {
          navigateToTab(tab);
          setIsNotificationDrawerOpen(false);
        }}
        currentLang={currentLang}
      />
    </div>
  );
}

export default App;
