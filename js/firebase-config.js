// firebase-config.js
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyClKsywredHjPx7NKOEgRSvgPw3SQt5lGQ",
  authDomain: "loan-app-c4d0c.firebaseapp.com",
  databaseURL: "https://loan-app-c4d0c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "loan-app-c4d0c",
  storageBucket: "loan-app-c4d0c.appspot.com",
  messagingSenderId: "533607623059",
  appId: "1:533607623059:web:076d6678176de308e4a066",
  measurementId: "G-3DDLHCYB6F"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };