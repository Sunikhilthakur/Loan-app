// firebase-config.js

// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClKsywredHjPx7NKOEgRSvgPw3SQt5lGQ",
  authDomain: "loan-app-c4d0c.firebaseapp.com",
  databaseURL: "https://loan-app-c4d0c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "loan-app-c4d0c",
  storageBucket: "loan-app-c4d0c.firebasestorage.app",
  messagingSenderId: "533607623059",
  appId: "1:533607623059:web:076d6678176de308e4a066",
  measurementId: "G-3DDLHCYB6F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export to use in other modules
export { auth, db };
