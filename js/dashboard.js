import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore, collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const userEmailSpan = document.getElementById("userEmail");
const authButtons = document.getElementById("authButtons");
const userDetails = document.getElementById("userDetails");
const adminLink = document.getElementById("adminLink");
const loanStatusContainer = document.querySelector(".loan-status-container tbody");
const totalApplicationsSpan = document.getElementById("totalApplications");
const pendingApplicationsSpan = document.getElementById("pendingApplications");
const approvedLoansSpan = document.getElementById("approvedLoans");
const rejectedLoansSpan = document.getElementById("rejectedLoans");

// Auth State Listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    userEmailSpan.textContent = user.email;
    authButtons.style.display = "none";
    userDetails.style.display = "flex";

    // Check admin role
    const userDocRef = collection(db, "users");
    const adminQuery = query(userDocRef, where("email", "==", user.email));
    const snapshot = await getDocs(adminQuery);
    const isAdmin = !snapshot.empty && snapshot.docs[0].data().role === "admin";

    if (isAdmin) {
      adminLink.style.display = "inline";
      document.getElementById("adminControls").style.display = "block";
    }

    loadUserApplications(user.email);
  } else {
    window.location.href = "login.html";
  }
});

// Load Only Approved or Rejected Applications
async function loadUserApplications(email) {
  const loansRef = collection(db, "loanApplications");
  const q = query(loansRef, where("email", "==", email));
  const snapshot = await getDocs(q);

  let total = 0, approved = 0, rejected = 0;
  loanStatusContainer.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();

    // Only show Approved or Rejected
    if (data.status === "Approved" || data.status === "Rejected") {
      total++;

      if (data.status === "Approved") approved++;
      else if (data.status === "Rejected") rejected++;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${doc.id}</td>
        <td>${data.name}</td>
        <td>${data.email}</td>
        <td>${data.purpose}</td>
        <td>${data.amount}</td>
        <td>${data.monthlyIncome}</td>
        <td>${data.status}</td>
        <td>${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : '-'}</td>
      `;
      loanStatusContainer.appendChild(row);
    }
  });

  totalApplicationsSpan.textContent = total;
  approvedLoansSpan.textContent = approved;
  rejectedLoansSpan.textContent = rejected;
  if (pendingApplicationsSpan) pendingApplicationsSpan.textContent = "0";
}

// Logout Function
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  }).catch((error) => {
    console.error("Logout Error:", error);
  });
};
