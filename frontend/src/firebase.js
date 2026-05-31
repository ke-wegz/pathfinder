import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUJ9q_dnKYWX0bE0-M9LMS91fKRdAUc0o",
  authDomain: "pathfinder-573f7.firebaseapp.com",
  projectId: "pathfinder-573f7",
  storageBucket: "pathfinder-573f7.firebasestorage.app",
  messagingSenderId: "798596591454",
  appId: "1:798596591454:web:cc2d57d3b67dfce45ae9cf",
  measurementId: "G-KZWYPD8MMX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
