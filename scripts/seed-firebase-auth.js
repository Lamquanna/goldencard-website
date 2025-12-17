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

// Employee data from team-data.ts
const employees = [
  {
    employeeCode: 'GES001',
    nameEn: 'Jimmy Ha',
    nameVi: 'Hà Nhật Anh',
    roleEn: 'CEO & Founder',
    roleVi: 'Giám Đốc Điều Hành & Sáng Lập',
    email: 'jimmy.ha@goldenenergy.vn',
    department: 'Leadership',
    category: 'leadership',
  },
  {
    employeeCode: 'GES002',
    nameEn: 'Rita Kim Anh',
    nameVi: 'Rita Kim Anh',
    roleEn: 'CFO',
    roleVi: 'Giám Đốc Tài Chính',
    email: 'rita.kimanh@goldenenergy.vn',
    department: 'Finance',
    category: 'leadership',
  },
  {
    employeeCode: 'GES003',
    nameEn: 'Tuan Ha',
    nameVi: 'Hà Anh Tuấn',
    roleEn: 'COO',
    roleVi: 'Giám Đốc Vận Hành',
    email: 'tuan.ha@goldenenergy.vn',
    department: 'Operations',
    category: 'management',
  },
  {
    employeeCode: 'GES004',
    nameEn: 'Tan Ho',
    nameVi: 'Hồ Anh Tân',
    roleEn: 'Head of Sales',
    roleVi: 'Trưởng Phòng Kinh Doanh',
    email: 'tan.ho@goldenenergy.vn',
    department: 'Sales',
    category: 'management',
  },
  {
    employeeCode: 'GES005',
    nameEn: 'Anh Le',
    nameVi: 'Lê Thị Ánh',
    roleEn: 'Head of Marketing',
    roleVi: 'Trưởng Phòng Marketing',
    email: 'anh.le@goldenenergy.vn',
    department: 'Marketing',
    category: 'management',
  },
  {
    employeeCode: 'GES006',
    nameEn: 'Minh Nguyen',
    nameVi: 'Nguyễn Văn Minh',
    roleEn: 'Technical Director',
    roleVi: 'Giám Đốc Kỹ Thuật',
    email: 'minh.nguyen@goldenenergy.vn',
    department: 'Engineering',
    category: 'engineering',
  },
  {
    employeeCode: 'GES007',
    nameEn: 'Thao Pham',
    nameVi: 'Phạm Thị Thảo',
    roleEn: 'Project Manager',
    roleVi: 'Quản Lý Dự Án',
    email: 'thao.pham@goldenenergy.vn',
    department: 'Projects',
    category: 'engineering',
  },
  {
    employeeCode: 'GES008',
    nameEn: 'Duc Tran',
    nameVi: 'Trần Minh Đức',
    roleEn: 'Senior Engineer',
    roleVi: 'Kỹ Sư Trưởng',
    email: 'duc.tran@goldenenergy.vn',
    department: 'Engineering',
    category: 'engineering',
  },
  {
    employeeCode: 'GES009',
    nameEn: 'Linh Vo',
    nameVi: 'Võ Thị Linh',
    roleEn: 'HR Manager',
    roleVi: 'Quản Lý Nhân Sự',
    email: 'linh.vo@goldenenergy.vn',
    department: 'Human Resources',
    category: 'support',
  },
  {
    employeeCode: 'GES010',
    nameEn: 'Khoa Dang',
    nameVi: 'Đặng Minh Khoa',
    roleEn: 'Quality Assurance',
    roleVi: 'Kiểm Soát Chất Lượng',
    email: 'khoa.dang@goldenenergy.vn',
    department: 'QA',
    category: 'engineering',
  },
  {
    employeeCode: 'GES011',
    nameEn: 'Huong Nguyen',
    nameVi: 'Nguyễn Thị Hương',
    roleEn: 'Customer Success',
    roleVi: 'Chăm Sóc Khách Hàng',
    email: 'huong.nguyen@goldenenergy.vn',
    department: 'Customer Service',
    category: 'support',
  },
  {
    employeeCode: 'GES012',
    nameEn: 'Long Pham',
    nameVi: 'Phạm Thành Long',
    roleEn: 'Operations Specialist',
    roleVi: 'Chuyên Viên Vận Hành',
    email: 'long.pham@goldenenergy.vn',
    department: 'Operations',
    category: 'support',
  },
];

// Default password for all accounts
const DEFAULT_PASSWORD = 'Golden@2024';

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
