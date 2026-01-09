/**
 * Script to seed Firebase Authentication with employee accounts
 * Run this script once to create accounts for all employees in team-data.ts
 * 
 * Usage: node scripts/seed-firebase-auth.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
// You need to download service account key from Firebase Console
// and save it as firebase-admin-key.json in the project root
const serviceAccountPath = path.join(__dirname, '..', 'firebase-admin-key.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Firebase service account key not found!');
  console.log('📝 Please download it from Firebase Console:');
  console.log('   1. Go to Project Settings > Service Accounts');
  console.log('   2. Click "Generate New Private Key"');
  console.log('   3. Save as firebase-admin-key.json in project root');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Employee data from team-data.ts - DANH SÁCH NHÂN VIÊN THẬT
const employees = [
  // Leadership Team
  {
    employeeCode: 'GES001',
    nameEn: 'Jimmy Ha',
    nameVi: 'Hà Hoàng Hà',
    roleEn: 'Founder & CEO',
    roleVi: 'Nhà sáng lập & Tổng Giám đốc',
    email: 'jimmy.ha@goldenenergy.vn',
    department: 'Ban Giám đốc',
    category: 'leadership',
  },
  {
    employeeCode: 'GES002',
    nameEn: 'Rita Kim Anh',
    nameVi: 'Trương Kim Anh',
    roleEn: 'CFO & Vice-CEO',
    roleVi: 'Giám đốc Tài chính & Phó Tổng Giám đốc',
    email: 'rita.anh@goldenenergy.vn',
    department: 'Ban Giám đốc',
    category: 'leadership',
  },

  // Management Team
  {
    employeeCode: 'GES003',
    nameEn: 'Tuan Ha',
    nameVi: 'Hà Huy Tuấn',
    roleEn: 'Project Supervision Manager',
    roleVi: 'Trưởng phòng Giám sát Dự án',
    email: 'tuan.ha@goldenenergy.vn',
    department: 'Phòng Dự án',
    category: 'management',
  },
  {
    employeeCode: 'GES004',
    nameEn: 'Tan Ho',
    nameVi: 'Hồ Minh Tân',
    roleEn: 'Chief Technical Officer',
    roleVi: 'Trưởng phòng Kỹ thuật & Kỹ sư trưởng',
    email: 'tan.ho@goldenenergy.vn',
    department: 'Phòng Kỹ thuật',
    category: 'management',
  },
  {
    employeeCode: 'GES005',
    nameEn: 'Anh Le',
    nameVi: 'Lê Quang Anh',
    roleEn: 'CTO & Head of Project Development',
    roleVi: 'CTO & Trưởng phòng Phát triển Dự án',
    email: 'anh.le@goldenenergy.vn',
    department: 'Phòng Phát triển Dự án',
    category: 'management',
  },
  {
    employeeCode: 'GES006',
    nameEn: 'Thu Nguyen',
    nameVi: 'Nguyễn Thị Thu',
    roleEn: 'Chief Accountant',
    roleVi: 'Trưởng phòng Kế toán',
    email: 'thu.nguyen@goldenenergy.vn',
    department: 'Phòng Kế toán',
    category: 'management',
  },
  {
    employeeCode: 'GES007',
    nameEn: 'Le Pham',
    nameVi: 'Phạm Tấn Lễ',
    roleEn: 'Transportation Manager',
    roleVi: 'Trưởng bộ phận Vận chuyển',
    email: 'le.pham@goldenenergy.vn',
    department: 'Bộ phận Vận chuyển',
    category: 'management',
  },
  {
    employeeCode: 'GES008',
    nameEn: 'Nguyet Nguyen',
    nameVi: 'Nguyễn Minh Nguyệt',
    roleEn: 'Sales Manager',
    roleVi: 'Trưởng phòng Kinh doanh',
    email: 'nguyet.nguyen@goldenenergy.vn',
    department: 'Phòng Kinh doanh',
    category: 'management',
  },
  {
    employeeCode: 'GES009',
    nameEn: 'Cristina Lu',
    nameVi: 'Lưu Thị Duyên',
    roleEn: 'Marketing Manager',
    roleVi: 'Trưởng bộ phận Marketing',
    email: 'cristina.lu@goldenenergy.vn',
    department: 'Bộ phận Marketing',
    category: 'management',
  },

  // Engineering Team
  {
    employeeCode: 'GES010',
    nameEn: 'Giau Dao',
    nameVi: 'Đào Hữu Giàu',
    roleEn: 'Solar Engineer',
    roleVi: 'Kỹ sư',
    email: 'giau.dao@goldenenergy.vn',
    department: 'Phòng Kỹ thuật',
    category: 'engineering',
  },
  {
    employeeCode: 'GES011',
    nameEn: 'Son Tran',
    nameVi: 'Trần Văn Son',
    roleEn: 'Solar Engineer',
    roleVi: 'Kỹ sư',
    email: 'son.tran@goldenenergy.vn',
    department: 'Phòng Kỹ thuật',
    category: 'engineering',
  },
  {
    employeeCode: 'GES012',
    nameEn: 'Duy Nguyen',
    nameVi: 'Nguyễn Minh Duy',
    roleEn: 'Solar Engineer',
    roleVi: 'Kỹ sư',
    email: 'duy.nguyen@goldenenergy.vn',
    department: 'Phòng Kỹ thuật',
    category: 'engineering',
  },
];

// Default password for all accounts
const DEFAULT_PASSWORD = '1';

async function createEmployeeAccount(employee) {
  const email = `${employee.employeeCode.toLowerCase()}@goldenenergy.vn`;
  
  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password: DEFAULT_PASSWORD,
      displayName: employee.nameEn,
      emailVerified: true, // Auto-verify internal accounts
    });

    // Create user profile in Firestore
    await admin.firestore().collection('employees').doc(userRecord.uid).set({
      uid: userRecord.uid,
      employeeCode: employee.employeeCode,
      email,
      nameEn: employee.nameEn,
      nameVi: employee.nameVi,
      roleEn: employee.roleEn,
      roleVi: employee.roleVi,
      department: employee.department,
      category: employee.category,
      isActive: true,
      mustChangePassword: true, // Require password change on first login
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Created account: ${email} (${employee.nameEn})`);
    return { success: true, email };
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`⚠️  Account already exists: ${email}`);
      return { success: true, email, existed: true };
    }
    console.error(`❌ Failed to create ${email}:`, error.message);
    return { success: false, email, error: error.message };
  }
}

async function seedFirebaseAuth() {
  console.log('🚀 Starting Firebase Auth seeding...\n');
  console.log(`📊 Total employees to process: ${employees.length}\n`);

  const results = {
    created: 0,
    existed: 0,
    failed: 0,
  };

  for (const employee of employees) {
    const result = await createEmployeeAccount(employee);
    if (result.success) {
      if (result.existed) {
        results.existed++;
      } else {
        results.created++;
      }
    } else {
      results.failed++;
    }
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📈 Seeding Summary:');
  console.log('='.repeat(50));
  console.log(`✅ Created: ${results.created}`);
  console.log(`⚠️  Already existed: ${results.existed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log('='.repeat(50));
  console.log('\n🔐 Default Password for all accounts:', DEFAULT_PASSWORD);
  console.log('\n✨ Seeding completed!');
}

// Run the seeding process
seedFirebaseAuth()
  .then(() => {
    console.log('\n✅ Process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Process failed:', error);
    process.exit(1);
  });
