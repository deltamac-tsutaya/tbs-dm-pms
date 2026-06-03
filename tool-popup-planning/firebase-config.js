/**
 * Firebase 設定檔
 * 
 * Firestore 安全規則（請在 Firebase Console → Firestore → 規則 貼上並發佈）：
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     function isAuthenticated() {
 *       return request.auth != null;
 *     }
 *     
 *     match /popup_applications/{docId} {
 *       allow read, write: if isAuthenticated();
 *     }
 *     
 *     match /popup_spaces/{docId} {
 *       allow read: if isAuthenticated();
 *       allow write: if isAuthenticated();
 *     }
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
