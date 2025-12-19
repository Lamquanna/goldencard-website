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
  mustChangePassword?: boolean;
  passwordChangedAt?: Date;
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
  // Check if Firebase is initialized
  if (!auth) {
    console.error('Firebase Auth not initialized');
    throw new Error('Hệ thống xác thực chưa được khởi tạo. Vui lòng liên hệ IT để kiểm tra cấu hình Firebase.');
  }
  
  // Validate inputs
  if (!employeeCode || !password) {
    throw new Error('Vui lòng nhập đầy đủ mã nhân viên và mật khẩu.');
  }
  
  // Convert employee code to email format
  const email = `${employeeCode.toLowerCase().trim()}@goldenenergy.vn`;
  
  console.log('Attempting to sign in with email:', email);
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('Sign in successful, user ID:', user.uid);
    
    // Update last login
    if (db) {
      try {
        await updateDoc(doc(db, USERS_COLLECTION, user.uid), {
          lastLogin: serverTimestamp(),
        });
        console.log('Last login updated successfully');
      } catch (updateError) {
        console.warn('Failed to update last login:', updateError);
        // Don't throw - login was successful, just logging failed
      }
    } else {
      console.warn('Firestore not initialized, skipping last login update');
    }
    
    return user;
  } catch (error: any) {
    console.error('Sign in error details:', {
      code: error.code,
      message: error.message,
      email: email,
    });
    
    // Handle specific error cases
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.');
    }
    
    if (error.code === 'auth/invalid-api-key') {
      throw new Error('Cấu hình Firebase không hợp lệ. Vui lòng liên hệ IT.');
    }
    
    if (error.code === 'auth/app-deleted') {
      throw new Error('Firebase app đã bị xóa. Vui lòng liên hệ IT.');
    }
    
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
  if (!auth) {
    // If auth not initialized, immediately call callback with null user
    console.warn('Firebase Auth not initialized, calling callback with null user');
    setTimeout(() => callback(null), 0);
    return () => {};
  }
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
