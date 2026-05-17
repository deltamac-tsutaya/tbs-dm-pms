/**
 * Firebase 設定檔
 *
 * Firestore 安全規則（請在 Firebase Console → Firestore → 規則 貼上並發佈）：
 *
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *
 *     // request.auth.token.name = Firebase Auth displayName = empId（員工工號）
 *     function isAuthenticated() {
 *       return request.auth != null;
 *     }
 *
 *     function isAdmin() {
 *       return isAuthenticated()
 *         && exists(/databases/$(database)/documents/employees/$(request.auth.token.name))
 *         && get(/databases/$(database)/documents/employees/$(request.auth.token.name)).data.role == 'admin';
 *     }
 *
 *     function isSelf(empId) {
 *       return isAuthenticated() && request.auth.token.name == empId;
 *     }
 *
 *     match /schedules/{document=**} {
 *       allow read: if isAuthenticated();
 *       allow write: if isAdmin();
 *     }
 *
 *     match /employees/{empId} {
 *       allow read: if isAuthenticated();
 *       allow write: if isAdmin() || isSelf(empId);
 *     }
 *
 *   }
 * }
 */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCFw5VwxRvdDINnOIwIaUxwvyAav447Vwg",
  authDomain: "schedule-app-19839.firebaseapp.com",
  projectId: "schedule-app-19839",
  storageBucket: "schedule-app-19839.firebasestorage.app",
  messagingSenderId: "864199067684",
  appId: "1:864199067684:web:3f1923cc5b418e3e2770b1"
};
