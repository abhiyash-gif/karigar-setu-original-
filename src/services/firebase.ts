import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, BuyerEnquiry, ArtisanProfile, NotificationItem } from '../types';

// 1. Initialize Firebase App, Auth & Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// 2. Validate Connection to Firestore on Boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// 3. Error Handling conforming to Firebase Skill specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 4. Firebase Authentication Helpers
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Save/update user profile in /users/{uid}
    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Artisan',
        photoURL: user.photoURL || '',
        role: 'artisan',
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
    }

    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// 5. Firestore Persistence APIs

// --- Products ---
export async function getFirestoreProducts(userId?: string): Promise<Product[]> {
  try {
    let q;
    if (userId) {
      q = query(collection(db, 'products'), where('userId', '==', userId));
    } else {
      q = collection(db, 'products');
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as Product);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'products');
    return [];
  }
}

export async function saveFirestoreProduct(product: Product, userId: string): Promise<void> {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), {
      ...product,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteFirestoreProduct(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Buyer Enquiries ---
export async function getFirestoreEnquiries(userId: string): Promise<BuyerEnquiry[]> {
  const path = 'buyerEnquiries';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as BuyerEnquiry);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveFirestoreEnquiry(enquiry: BuyerEnquiry, userId: string): Promise<void> {
  const path = `buyerEnquiries/${enquiry.id}`;
  try {
    await setDoc(doc(db, 'buyerEnquiries', enquiry.id), {
      ...enquiry,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateFirestoreEnquiryStatus(enquiryId: string, status: BuyerEnquiry['status']): Promise<void> {
  const path = `buyerEnquiries/${enquiryId}`;
  try {
    await updateDoc(doc(db, 'buyerEnquiries', enquiryId), {
      status,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// --- Notifications ---
export async function getFirestoreNotifications(userId: string): Promise<NotificationItem[]> {
  const path = 'notifications';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as NotificationItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveFirestoreNotification(notification: NotificationItem, userId: string): Promise<void> {
  const path = `notifications/${notification.id}`;
  try {
    await setDoc(doc(db, 'notifications', notification.id), {
      ...notification,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function markAllFirestoreNotificationsRead(userId: string, notifs: NotificationItem[]): Promise<void> {
  try {
    await Promise.all(
      notifs.map((n) =>
        updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(() => {})
      )
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'notifications');
  }
}

// --- Artisan Profile ---
export async function getFirestoreArtisanProfile(userId: string): Promise<ArtisanProfile | null> {
  const path = `artisanProfiles/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'artisanProfiles', userId));
    if (snap.exists()) {
      return snap.data() as ArtisanProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveFirestoreArtisanProfile(profile: ArtisanProfile, userId: string): Promise<void> {
  const path = `artisanProfiles/${userId}`;
  try {
    await setDoc(doc(db, 'artisanProfiles', userId), {
      ...profile,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
