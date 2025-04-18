import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Initialize Firebase
const db = getFirestore();
const auth = getAuth();

let userRole = '';
let loanApplications = [];
let currentUserEmail = ''; // Store the current user's email

window.onload = async () => {
  // Check for logged-in user
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Get user data and role
      userRole = user.email.includes('admin') ? 'admin' : 'user';
      currentUserEmail = user.email; // Store the email of the logged-in user
      document.getElementById('userEmail').innerText = user.email;
      
      if (userRole === 'user') {
        loadUserLoanApplications(); // Load the user's own loan applications
      } else {
        loadAllLoanApplications(); // Load all loan applications if the user is an admin
      }
    } else {
      window.location.replace("login.html");
    }
  });
};

// Function to load all loan applications from Firestore (for admin)
const loadAllLoanApplications = async () => {
  const applicationsRef = collection(db, "loanApplications");
  const querySnapshot = await getDocs(applicationsRef);
  loanApplications = [];

  querySnapshot.forEach((doc) => {
    loanApplications.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  updateApplicationStats();
  displayApplications();
};

// Function to load loan applications specific to the logged-in user (user dashboard)
const loadUserLoanApplications = async () => {
  const applicationsRef = collection(db, "loanApplications");
  const q = query(applicationsRef, where("email", "==", currentUserEmail)); // Filter by the logged-in user's email
  const querySnapshot = await getDocs(q);
  loanApplications = [];

  querySnapshot.forEach((doc) => {
    loanApplications.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  updateUserLoanStats(); // Update the stats for the user
  displayUserApplications(); // Display the user's loan applications
};

// Function to update stats (for the user's dashboard)
const updateUserLoanStats = () => {
  let total = loanApplications.length;
  let pending = loanApplications.filter((app) => app.status === 'Under Review').length;
  let approved = loanApplications.filter((app) => app.status === 'Approved').length;
  let rejected = loanApplications.filter((app) => app.status === 'Rejected').length;

  document.getElementById('totalApplications').innerText = total;
  document.getElementById('pendingApplications').innerText = pending;
  document.getElementById('approvedLoans').innerText = approved;
  document.getElementById('rejectedLoans').innerText = rejected;
};

// Function to display loan applications in the table (for the user's dashboard)
const displayUserApplications = () => {
  const tableBody = document.getElementById('applicationsTable');
  tableBody.innerHTML = '';

  loanApplications.forEach((app) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${app.id}</td>
      <td>${app.name}</td>
      <td>${app.email}</td>
      <td>${app.purpose}</td>
      <td>${app.amount}</td>
      <td>${app.monthlyIncome}</td>
      <td>${app.status}</td>
      <td>${app.date}</td>
    `;

    tableBody.appendChild(row);
  });
};

// Function to update stats (for admin dashboard)
const updateApplicationStats = () => {
  let total = loanApplications.length;
  let pending = loanApplications.filter((app) => app.status === 'Under Review').length;
  let approved = loanApplications.filter((app) => app.status === 'Approved').length;
  let rejected = loanApplications.filter((app) => app.status === 'Rejected').length;

  document.getElementById('totalApplications').innerText = total;
  document.getElementById('pendingApplications').innerText = pending;
  document.getElementById('approvedLoans').innerText = approved;
  document.getElementById('rejectedLoans').innerText = rejected;
};

// Function to display loan applications in the table (for admin dashboard)
const displayApplications = () => {
  const tableBody = document.getElementById('applicationsTable');
  tableBody.innerHTML = '';

  loanApplications.forEach((app) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${app.id}</td>
      <td>${app.name}</td>
      <td>${app.email}</td>
      <td>${app.phone}</td>
      <td>${app.purpose}</td>
      <td>${app.amount}</td>
      <td>${app.monthlyIncome}</td>
      <td>${app.status}</td>
      <td>${app.date}</td>
      <td>
        <button onclick="approveLoan('${app.id}')">Approve</button>
        <button onclick="rejectLoan('${app.id}')">Reject</button>
        <button onclick="viewApplicationDetails('${app.id}')">View</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
};

// Approve Loan Function
const approveLoan = async (loanId) => {
  const loanRef = doc(db, "loanApplications", loanId);
  await updateDoc(loanRef, {
    status: 'Approved'
  });

  // Reload loan applications after approval
  loadAllLoanApplications();
};

// Reject Loan Function
const rejectLoan = async (loanId) => {
  const loanRef = doc(db, "loanApplications", loanId);
  await updateDoc(loanRef, {
    status: 'Rejected'
  });

  // Reload loan applications after rejection
  loadAllLoanApplications();
};

// View Application Details Function
const viewApplicationDetails = (loanId) => {
  const application = loanApplications.find(app => app.id === loanId);

  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = `
    <p><strong>Name:</strong> ${application.name}</p>
    <p><strong>Email:</strong> ${application.email}</p>
    <p><strong>Phone:</strong> ${application.phone}</p>
    <p><strong>Purpose:</strong> ${application.purpose}</p>
    <p><strong>Amount:</strong> ${application.amount}</p>
    <p><strong>Monthly Income:</strong> ${application.monthlyIncome}</p>
    <p><strong>Status:</strong> ${application.status}</p>
    <p><strong>Date:</strong> ${application.date}</p>
  `;

  document.getElementById('applicationModal').style.display = 'block';
};

// Close the modal
const closeModal = () => {
  document.getElementById('applicationModal').style.display = 'none';
};

// Logout Function
const logout = () => {
  auth.signOut().then(() => {
    window.location.replace("login.html");
  }).catch((error) => {
    console.error('Logout failed', error);
  });
};

// Close modal event
document.querySelector('.close-modal').addEventListener('click', closeModal);
