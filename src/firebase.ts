// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyBnd4rTs_c7hKjWVIqSuiO5wNW6X_0q5IQ",
  authDomain: "car-editz.firebaseapp.com",
  databaseURL: "https://car-editz-default-rtdb.firebaseio.com",
  projectId: "car-editz",
  storageBucket: "car-editz.firebasestorage.app",
  messagingSenderId: "1083794861989",
  appId: "1:1083794861989:web:befab8b0b6ba0180a0024c",
  measurementId: "G-7CX8M8VZZC"
};

// Initialize Firebase
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Realtime Database (car-editz-default-rtdb)
export const rtdb = getDatabase(app);

// Initialize Analytics
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics fallback for iframe/restricted sandbox environments
    });
}
