// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, deleteDoc , collection, getDocs } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCx4QCT2LlLFtZ-t3LcjhziptnUmZNCzAU",
  authDomain: "acksalerno.firebaseapp.com",
  projectId: "acksalerno",
  storageBucket: "acksalerno.appspot.com",
  messagingSenderId: "779328198585",
  appId: "1:779328198585:web:2cb15abd1f2442f9450868",
  measurementId: "G-B3QLZ6BCJP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Inizializza e ottieni l'istanza di Storage

export { app, auth, db, doc, deleteDoc,collection, getDocs, storage}; 