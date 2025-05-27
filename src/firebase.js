// firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // ✅ Add this

const firebaseConfig = {
  apiKey: "AIzaSyARObFfgVZmPEqEiLtq3jG4z6MHPa-Tqxo",
  authDomain: "tellubackup.firebaseapp.com",
  projectId: "tellubackup",
  storageBucket: "tellubackup.firebasestorage.app",
  messagingSenderId: "77398107915",
  appId: "1:77398107915:web:cc96f245d6c007e08d640e",
  measurementId: "G-E71VGZH1G9"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // ✅ Initialize auth

// ✅ Export the things you need
export { app, auth, analytics };
