// Test Firebase Client SDK connection
// Run: node scripts/test-firebase-client.js

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔥 Testing Firebase Client SDK Connection...\n');

// Check config
console.log('📋 Configuration Check:');
console.log('  API Key:', firebaseConfig.apiKey ? '✅ Present' : '❌ Missing');
console.log('  Auth Domain:', firebaseConfig.authDomain ? '✅ Present' : '❌ Missing');
console.log('  Project ID:', firebaseConfig.projectId ? '✅ Present' : '❌ Missing');
console.log('');

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration is incomplete. Check your .env.local file.');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testConnection() {
  try {
    console.log('🔐 Testing Authentication...');
    
    // Try to sign in with test account
    const testEmail = 'ges001@goldenenergy.vn';
    const testPassword = '1';
    
    console.log(`   Attempting login with: ${testEmail}`);
    
    const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('   ✅ Authentication: Success');
    console.log(`   User ID: ${userCredential.user.uid}`);
    console.log('');
    
    // Test Firestore
    console.log('💾 Testing Firestore...');
    const employeesRef = collection(db, 'employees');
    const q = query(employeesRef, limit(5));
    const snapshot = await getDocs(q);
    
    console.log(`   ✅ Firestore: Connected`);
    console.log(`   Found ${snapshot.size} employee documents`);
    
    if (snapshot.size > 0) {
      console.log('\n   Sample employee data:');
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   - ${data.fullName} (${data.employeeCode})`);
      });
    }
    
    console.log('\n✅ All tests passed! Firebase is working correctly.\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Connection Test Failed\n');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('');
    
    // Provide specific guidance based on error
    switch (error.code) {
      case 'auth/network-request-failed':
        console.log('💡 Troubleshooting:');
        console.log('   1. Check your internet connection');
        console.log('   2. Disable VPN if active');
        console.log('   3. Check firewall settings');
        console.log('   4. Try: ping firestore.googleapis.com');
        console.log('   5. Flush DNS: ipconfig /flushdns');
        break;
        
      case 'auth/user-not-found':
        console.log('💡 Troubleshooting:');
        console.log('   1. Run: node scripts/seed-firebase-auth.js');
        console.log('   2. Check Firebase Console → Authentication');
        console.log('   3. Verify user exists: ges001@goldenenergy.vn');
        break;
        
      case 'auth/wrong-password':
        console.log('💡 Troubleshooting:');
        console.log('   1. Default password should be: 1');
        console.log('   2. Check if password was changed');
        console.log('   3. Reset password in Firebase Console');
        break;
        
      case 'auth/invalid-api-key':
      case 'auth/api-key-not-valid':
        console.log('💡 Troubleshooting:');
        console.log('   1. Check .env.local file');
        console.log('   2. Verify API key in Firebase Console');
        console.log('   3. Ensure API key restrictions allow localhost');
        break;
        
      default:
        console.log('💡 Check Firebase Console:');
        console.log('   https://console.firebase.google.com/project/goldenenergy-bead9');
        console.log('');
        console.log('📚 See FIREBASE_TROUBLESHOOTING.md for detailed guide');
    }
    
    console.log('');
    process.exit(1);
  }
}

testConnection();
