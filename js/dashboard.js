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
const applicationsTableBody = document.getElementById("applicationsTableBody");
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
    try {
      const userDocRef = collection(db, "users");
      const adminQuery = query(userDocRef, where("email", "==", user.email));
      const snapshot = await getDocs(adminQuery);
      
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        const isAdmin = userData.role === "admin";

        if (isAdmin) {
          adminLink.style.display = "inline";
          document.getElementById("adminControls").style.display = "block";
          loadAllApplications(); // Load all applications for admin
        } else {
          loadUserApplications(user.uid); // Load only user's applications
        }
      } else {
        loadUserApplications(user.uid); // Default to user applications if no role found
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      loadUserApplications(user.uid); // Fallback to user applications
    }
  } else {
    window.location.href = "login.html";
  }
});

// Load User's Applications
async function loadUserApplications(userId) {
  try {
    const loansRef = collection(db, "loanApplications");
    const q = query(loansRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    updateApplicationsTable(snapshot);
  } catch (error) {
    console.error("Error loading user applications:", error);
    alert("Error loading your applications. Please try again.");
  }
}

// Load All Applications (for admin)
async function loadAllApplications() {
  try {
    const loansRef = collection(db, "loanApplications");
    const snapshot = await getDocs(loansRef);

    updateApplicationsTable(snapshot);
  } catch (error) {
    console.error("Error loading all applications:", error);
    alert("Error loading applications. Please try again.");
  }
}

// Update Applications Table
function updateApplicationsTable(snapshot) {
  let total = 0, approved = 0, rejected = 0, pending = 0;
  applicationsTableBody.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();
    total++;

    // Normalize status for comparison
    const status = data.status.toLowerCase();
    if (status.includes("approved")) approved++;
    else if (status.includes("rejected")) rejected++;
    else pending++;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${doc.id}</td>
      <td>${data.name || '-'}</td>
      <td>${data.email || '-'}</td>
      <td>${data.loanPurpose || '-'}</td>
      <td>${data.loanAmount ? '$' + data.loanAmount : '-'}</td>
      <td>${data.monthlyIncome ? '$' + data.monthlyIncome : '-'}</td>
      <td class="status-${status.replace(' ', '-')}">${data.status || 'Under Review'}</td>
      <td>${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString() : '-'}</td>
    `;
    applicationsTableBody.appendChild(row);
  });

  totalApplicationsSpan.textContent = total;
  approvedLoansSpan.textContent = approved;
  rejectedLoansSpan.textContent = rejected;
  pendingApplicationsSpan.textContent = pending;
}

// Logout Function
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  }).catch((error) => {
    console.error("Logout Error:", error);
    alert("Error during logout. Please try again.");
  });
};