// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDs1Z7e3dsB1iTSpD40t4bumwjo_NBh4gg",
  authDomain: "experimental-1eff4.firebaseapp.com",
  projectId: "experimental-1eff4",
  storageBucket: "experimental-1eff4.firebasestorage.app",
  messagingSenderId: "252710686487",
  appId: "1:252710686487:web:221f3043bfbd6a61f9f152"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const signInWithGoogle = () => signInWithPopup(auth, provider);
