// Initialize Cloud Firestore through Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9qaBOc4AEob7wJLmhcr4-Eu92cqLEtJc",
  authDomain: "taskless-b2520.firebaseapp.com",
  projectId: "taskless-b2520",
  storageBucket: "taskless-b2520.appspot.com",
  messagingSenderId: "494355248866",
  appId: "1:494355248866:web:bf47635a4af234e65f50bb",
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore();

export { firebaseApp as fb, db };
