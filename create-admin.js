/**
 * Create admin account in Firebase
 * Run: node create-admin.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  // 需要下載 Firebase 專案的服務帳戶 JSON
  // 步驟：Firebase Console → Project Settings → Service Accounts → Generate Private Key
  // 貼入下方：
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'schedule-app-19839'
});

const db = admin.firestore();
const auth = admin.auth();

// 建立管理員帳號的函式
async function createAdmin() {
  const email = 'admin@tsutaya.local';
  const password = '123456789';
  const empId = '999999'; // 行政工號
  const empName = '系統管理員';

  try {
    // 1. 在 Auth 中建立用戶
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: empId,
    });
    console.log('✓ 已在 Auth 中建立用戶:', userRecord.uid);

    // 2. 在 Firestore employees 中建立管理員記錄
    await db.collection('employees').doc(empId).set({
      empId: empId,
      empName: empName,
      email: email,
      role: 'admin',
      store: '信義店',
      dept: '行政',
      uid: userRecord.uid,
      needsSetup: false,
      createdAt: new Date()
    });
    console.log('✓ 已在 Firestore 中建立管理員記錄');

    console.log('\n【管理員帳號已建立】');
    console.log('電子郵件:', email);
    console.log('密碼:', password);
    console.log('工號:', empId);
    console.log('\n請到 admin.html 登入，管理班表與員工');

    process.exit(0);
  } catch (error) {
    console.error('❌ 建立失敗:', error.message);
    process.exit(1);
  }
}

createAdmin();
