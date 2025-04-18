import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Auth state management
function updateAuthUI(user) {
  const authButtons = document.getElementById("authButtons");
  const userDetails = document.getElementById("userDetails");
  const userEmail = document.getElementById("userEmail");
  const adminLink = document.getElementById("adminLink");

  if (user) {
    // User is logged in
    if (authButtons) authButtons.style.display = "none";
    if (userDetails) {
      userDetails.style.display = "flex";
      userEmail.textContent = user.displayName ? `Hi, ${user.displayName}` : `Hi, ${user.email.split('@')[0]}`;
    }

    // Check admin status
    checkAdminStatus(user.uid).then(isAdmin => {
      if (adminLink) adminLink.style.display = isAdmin ? "inline" : "none";
    });
  } else {
    // User is logged out
    if (authButtons) authButtons.style.display = "flex";
    if (userDetails) userDetails.style.display = "none";
    if (adminLink) adminLink.style.display = "none";
  }
}

async function checkAdminStatus(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() && userDoc.data().isAdmin;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// Auth functions
export function login() {
  window.location.href = "login.html";
}

export function signup() {
  window.location.href = "signup.html";
}

export async function logout() {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout failed:", error);
    alert("Logout failed: " + error.message);
  }
}

// Initialize auth state listener
export function initializeAuth() {
  onAuthStateChanged(auth, (user) => {
    updateAuthUI(user);
  });
}

// Make logout available globally
window.logout = logout;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeAuth);