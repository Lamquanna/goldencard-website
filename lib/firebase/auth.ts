// Firebase Authentication Service for ERP System
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import { auth, db } from './config';

export interface EmployeeProfile {
  uid: string;
  employeeCode: string;
  email: string;
  nameEn: string;
  nameVi: string;
  roleEn: string;
  roleVi: string;
  department: string;
  avatar?: string;
  category: 'leadership' | 'management' | 'engineering' | 'support';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Collection references
const USERS_COLLECTION = 'employees';

/**
 * Sign in with employee code and password
 * @param employeeCode - Employee code (e.g., GES001)
 * @param password - Password
 */
export async function signInEmployee(employeeCode: string, password: string) {
  if (!auth) throw new Error('Firebase Auth not initialized');
  
  // Convert employee code to email format
  const email = `${employeeCode.toLowerCase()}@goldenenergy.vn`;
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last login
    if (db) {
      await updateDoc(doc(db, USERS_COLLECTION, user.uid), {
        lastLogin: serverTimestamp(),
      });
    }
    
    return user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Sign out current user
 */
export async function signOutEmployee() {
  if (!auth) throw new Error('Firebase Auth not initialized');
  await signOut(auth);
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth?.currentUser || null;
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

/**
 * Get employee profile from Firestore
 */
export async function getEmployeeProfile(uid: string): Promise<EmployeeProfile | null> {
  if (!db) throw new Error('Firestore not initialized');
  
  const docRef = doc(db, USERS_COLLECTION, uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as EmployeeProfile;
  }
  
  return null;
}

/**
 * Create employee profile in Firestore
 */
export async function createEmployeeProfile(
  uid: string,
  data: Omit<EmployeeProfile, 'uid' | 'createdAt' | 'updatedAt' | 'isActive'>
) {
  if (!db) throw new Error('Firestore not initialized');
  
  const profile: EmployeeProfile = {
    ...data,
    uid,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await setDoc(doc(db, USERS_COLLECTION, uid), profile);
  return profile;
}

/**
 * Update employee profile
 */
export async function updateEmployeeProfile(uid: string, data: Partial<EmployeeProfile>) {
  if (!db) throw new Error('Firestore not initialized');
  
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get user-friendly error message
 */
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Mã nhân viên không tồn tại';
    case 'auth/wrong-password':
      return 'Mật khẩu không đúng';
    case 'auth/invalid-email':
      return 'Email không hợp lệ';
    case 'auth/user-disabled':
      return 'Tài khoản đã bị vô hiệu hóa';
    case 'auth/too-many-requests':
      return 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra internet';
    default:
      return 'Đăng nhập thất bại. Vui lòng thử lại';
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return auth?.currentUser !== null;
}

/**
 * Get current user email
 */
export function getCurrentUserEmail(): string | null {
  return auth?.currentUser?.email || null;
}

/**
 * Get employee code from email
 */
export function getEmployeeCodeFromEmail(email: string): string {
  return email.split('@')[0].toUpperCase();
}
