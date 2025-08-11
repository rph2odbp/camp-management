// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoKUvHxDd5aL-8Tg5ehOx6sbUE3kR01AE",
  authDomain: "kateri-fbc.firebaseapp.com",
  projectId: "kateri-fbc",
  storageBucket: "kateri-fbc.firebasestorage.app",
  messagingSenderId: "735578066617",
  appId: "1:735578066617:web:039a3dd64ccb6f04331568"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services we will use
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
