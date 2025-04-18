document.addEventListener("DOMContentLoaded", () => {
  const user = auth.currentUser;
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  
  const loanStatusContainer = document.getElementById("loanStatus");
  const adminControls = document.getElementById("adminControls");
  
  // Check if user is admin
  db.collection("users").doc(user.uid).get().then((doc) => {
    const isAdmin = doc.exists && doc.data().isAdmin;
    
    if (isAdmin) {
      adminControls.style.display = "block";
      setupAdminControls();
      loadAllApplications();
    } else {
      adminControls.style.display = "none";
      loadUserApplications(user.uid);
    }
  });
  
  function setupAdminControls() {
    const filterStatus = document.getElementById("filterStatus");
    const searchApplicant = document.getElementById("searchApplicant");
    
    filterStatus.addEventListener("change", () => {
      loadAllApplications(filterStatus.value, searchApplicant.value);
    });
    
    searchApplicant.addEventListener("input", () => {
      loadAllApplications(filterStatus.value, searchApplicant.value);
    });
  }
  
  function loadUserApplications(userId) {
    loanStatusContainer.innerHTML = '<div class="loading-spinner"></div>';
    
    db.collection("loanApplications")
      .where("userId", "==", userId)
      .orderBy("submittedAt", "desc")
      .onSnapshot((snapshot) => {
        displayApplications(snapshot, false);
      }, (error) => {
        console.error("Error loading applications:", error);
        loanStatusContainer.innerHTML = '<p class="error">Error loading applications. Please try again.</p>';
      });
  }
  
  function loadAllApplications(statusFilter = "all", searchQuery = "") {
    loanStatusContainer.innerHTML = '<div class="loading-spinner"></div>';
    
    let query = db.collection("loanApplications").orderBy("submittedAt", "desc");
    
    if (statusFilter !== "all") {
      query = query.where("status", "==", statusFilter);
    }
    
    query.onSnapshot((snapshot) => {
      let filteredDocs = snapshot.docs;
      
      if (searchQuery) {
        const searchTerm = searchQuery.toLowerCase();
        filteredDocs = filteredDocs.filter(doc => {
          const data = doc.data();
          return data.personalInfo?.name?.toLowerCase().includes(searchTerm) || 
                 data.personalInfo?.email?.toLowerCase().includes(searchTerm);
        });
      }
      
      displayApplications({ docs: filteredDocs }, true);
    }, (error) => {
      console.error("Error loading applications:", error);
      loanStatusContainer.innerHTML = '<p class="error">Error loading applications. Please try again.</p>';
    });
  }
  
  function displayApplications(snapshot, isAdmin) {
    if (snapshot.docs.length === 0) {
      loanStatusContainer.innerHTML = '<p class="no-data">No applications found</p>';
      return;
    }
    
    loanStatusContainer.innerHTML = '';
    
    snapshot.docs.forEach((doc) => {
      const app = doc.data();
      const appId = doc.id;
      const card = createApplicationCard(appId, app, isAdmin);
      loanStatusContainer.appendChild(card);
    });
  }
  
  function createApplicationCard(appId, application, isAdmin) {
    const card = document.createElement("div");
    card.className = "loan-card";
    
    const statusColors = {
      submitted: "#3498db",
      "under-review": "#f39c12",
      approved: "#2ecc71",
      rejected: "#e74c3c"
    };
    
    const statusText = {
      submitted: "Submitted",
      "under-review": "Under Review",
      approved: "Approved",
      rejected: "Rejected"
    };
    
    const date = application.submittedAt?.toDate() || new Date();
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
    
    card.innerHTML = `
      <div class="loan-header">
        <h3>Application #${appId.slice(0, 8)}</h3>
        <span class="status-badge" style="background: ${statusColors[application.status] || "#95a5a6"}">
          ${statusText[application.status] || application.status}
        </span>
      </div>
      
      <p class="loan-date">Submitted: ${formattedDate}</p>
      
      <div class="progress-bar">
        <div class="step ${application.status === "submitted" ? "active" : ""}">Submitted</div>
        <div class="step ${application.status === "under-review" ? "active" : ""}">Review</div>
        <div class="step ${application.status === "approved" || application.status === "rejected" ? "active" : ""}">
          ${application.status === "approved" ? "Approved" : application.status === "rejected" ? "Rejected" : "Decision"}
        </div>
      </div>
      
      ${isAdmin ? `
        <div class="loan-details">
          <p><strong>Applicant:</strong> ${application.personalInfo?.name || "N/A"} (${application.personalInfo?.email || "N/A"})</p>
          <p><strong>Amount:</strong> ₹${application.financialInfo?.loanAmount?.toLocaleString() || "0"}</p>
          <p><strong>Purpose:</strong> ${getPurposeText(application.financialInfo?.purpose)}</p>
        </div>
        
        <div class="admin-actions">
          <button class="review-btn" onclick="updateStatus('${appId}', 'under-review')">Mark for Review</button>
          <button class="approve-btn" onclick="updateStatus('${appId}', 'approved')">Approve</button>
          <button class="reject-btn" onclick="updateStatus('${appId}', 'rejected')">Reject</button>
        </div>
      ` : ""}
    `;
    
    return card;
  }
  
  function getPurposeText(purpose) {
    const purposes = {
      home: "Home Loan",
      car: "Car Loan",
      education: "Education Loan",
      personal: "Personal Loan",
      business: "Business Loan"
    };
    return purposes[purpose] || purpose || "N/A";
  }
});

// Global function for admin to update status
function updateStatus(appId, status) {
  if (!confirm(`Are you sure you want to mark this application as "${status}"?`)) return;
  
  db.collection("loanApplications").doc(appId).update({
    status: status,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    console.log("Status updated successfully");
  })
  .catch((error) => {
    alert("Error updating status: " + error.message);
  });
}