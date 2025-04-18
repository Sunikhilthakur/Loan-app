import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Configuration
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

// Login function to redirect user to the login page
export function login() {
  window.location.href = "login.html";
}

// Signup function to redirect user to the signup page
export function signup() {
  window.location.href = "signup.html";
}

// Logout function to sign out the user and redirect to the home page
export async function logout() {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout failed:", error);
    alert("Logout failed: " + error.message);
  }
}

// Initialize authentication state and check if user is logged in
export function initializeAuthState() {
  onAuthStateChanged(auth, (user) => {
    const authButtons = document.getElementById("authButtons");
    const userDetails = document.getElementById("userDetails");
    const adminLink = document.getElementById("adminLink");
    
    if (user) {
      if (authButtons) authButtons.style.display = "none";
      if (userDetails) {
        userDetails.style.display = "flex";
        document.getElementById("userEmail").textContent = user.email;
      }
      
      // Check if the logged-in user is an admin
      getDoc(doc(db, "users", user.uid)).then((docSnap) => {
        if (docSnap.exists() && docSnap.data().isAdmin) {
          if (adminLink) adminLink.style.display = "block"; // Show admin link
        }
      });
    } else {
      if (authButtons) authButtons.style.display = "flex"; // Show login/signup buttons
      if (userDetails) userDetails.style.display = "none"; // Hide user details
      if (adminLink) adminLink.style.display = "none"; // Hide admin link
    }
  });
}

// Call initializeAuthState when the document is loaded
document.addEventListener("DOMContentLoaded", initializeAuthState);
