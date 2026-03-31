import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from './firebase';

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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
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
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}

export interface NewsArticle {
  id?: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  imageUrl?: string;
  author?: string;
  authorId?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isBreaking?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'editor';
}

export interface SiteSettings {
  siteName: string;
  tickerSpeed: number;
  contactEmail: string;
}

export const newsService = {
  async getAll() {
    const path = 'news';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  subscribe(callback: (news: NewsArticle[]) => void) {
    const path = 'news';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async getById(id: string) {
    const path = `news/${id}`;
    try {
      const docSnap = await getDoc(doc(db, 'news', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as NewsArticle;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async create(article: Omit<NewsArticle, 'id' | 'createdAt'>) {
    const path = 'news';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...article,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async update(id: string, article: Partial<NewsArticle>) {
    const path = `news/${id}`;
    try {
      await updateDoc(doc(db, 'news', id), {
        ...article,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async delete(id: string) {
    const path = `news/${id}`;
    try {
      await deleteDoc(doc(db, 'news', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};

export const categoryService = {
  async getAll() {
    const path = 'categories';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  subscribe(callback: (categories: Category[]) => void) {
    const path = 'categories';
    return onSnapshot(collection(db, path), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async create(category: Omit<Category, 'id'>) {
    const path = 'categories';
    try {
      const docRef = await addDoc(collection(db, path), category);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async update(id: string, category: Partial<Category>) {
    const path = `categories/${id}`;
    try {
      await updateDoc(doc(db, 'categories', id), category);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async delete(id: string) {
    const path = `categories/${id}`;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};

export const userService = {
  async getAll() {
    const path = 'users';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  subscribe(callback: (users: UserProfile[]) => void) {
    const path = 'users';
    return onSnapshot(collection(db, path), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  subscribe(callback: (users: UserProfile[]) => void) {
    const path = 'users';
    return onSnapshot(collection(db, path), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async updateRole(uid: string, role: 'admin' | 'editor') {
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), { role });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};

export const settingsService = {
  async get() {
    const path = 'settings/site';
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'site'));
      if (docSnap.exists()) {
        return docSnap.data() as SiteSettings;
      }
      return {
        siteName: 'Aaj Tak Clone',
        tickerSpeed: 30,
        contactEmail: 'contact@aajtakclone.com'
      } as SiteSettings;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async update(settings: SiteSettings) {
    const path = 'settings/site';
    try {
      await updateDoc(doc(db, 'settings', 'site'), settings as any);
    } catch (error) {
      // If it doesn't exist, create it
      try {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'settings', 'site'), settings);
      } catch (innerError) {
        handleFirestoreError(innerError, OperationType.WRITE, path);
      }
    }
  }
};
