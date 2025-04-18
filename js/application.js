import { auth, db, storage } from "./firebase-config.js";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loanForm");
  const steps = document.querySelectorAll(".step");
  const stepContents = document.querySelectorAll(".step-content");
  let currentStep = 1;

  const formData = {
    personalInfo: {},
    financialInfo: {},
    documents: {}
  };

  // Handling step navigation
  steps.forEach(step => {
    step.addEventListener("click", function() {
      const stepNum = parseInt(this.getAttribute("data-step"));
      if (stepNum < currentStep) {
        goToStep(stepNum);
      }
    });
  });

  form.addEventListener("submit", submitForm);

  document.querySelectorAll(".next-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const stepNum = parseInt(this.getAttribute("data-step"));
      nextStep(stepNum);
    });
  });

  document.querySelectorAll(".back-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const stepNum = parseInt(this.getAttribute("data-step"));
      prevStep(stepNum);
    });
  });

  // Step validation
  document.getElementById("email").addEventListener("blur", validateEmail);
  document.getElementById("phone").addEventListener("blur", validatePhone);
  document.getElementById("income").addEventListener("blur", validateIncome);
  document.getElementById("amount").addEventListener("blur", validateAmount);

  // Navigate to specific step
  function goToStep(step) {
    stepContents.forEach(content => {
      content.classList.remove("active");
    });
    document.getElementById(`step${step}`).classList.add("active");

    steps.forEach(indicator => {
      const stepNum = parseInt(indicator.getAttribute("data-step"));
      indicator.classList.toggle("active", stepNum === step);
      indicator.classList.toggle("completed", stepNum < step);
    });

    currentStep = step;
  }

  // Move to the next step
  function nextStep(current) {
    if (!validateStep(current)) return;
    saveStepData(current);
    goToStep(current + 1);
  }

  // Move to the previous step
  function prevStep(current) {
    goToStep(current - 1);
  }

  // Validate steps
  function validateStep(step) {
    if (step === 1) return validatePersonalInfo();
    if (step === 2) return validateFinancialInfo();
    return true;
  }

  // Validate personal info
  function validatePersonalInfo() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (!name) return showError("nameError", "Please enter your full name");
    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      return showError("emailError", "Please enter a valid email address");
    if (!phone || !/^\d{10}$/.test(phone))
      return showError("phoneError", "Please enter a valid 10-digit phone number");

    return true;
  }

  // Validate financial info
  function validateFinancialInfo() {
    const income = parseFloat(document.getElementById("income").value);
    const amount = parseFloat(document.getElementById("amount").value);
    const purpose = document.getElementById("purpose").value;

    if (isNaN(income))
      return showError("incomeError", "Please enter a valid monthly income");
    if (isNaN(amount))
      return showError("amountError", "Please enter a valid loan amount");
    if (amount > income * 12)
      return showError("amountError", "Loan amount cannot exceed your annual income");
    if (!purpose)
      return showError("purposeError", "Please select a loan purpose");

    return true;
  }

  // Validate email
  function validateEmail() {
    const email = document.getElementById("email").value.trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      showError("emailError", "Please enter a valid email address");
      return false;
    }
    hideError("emailError");
    return true;
  }

  // Validate phone
  function validatePhone() {
    const phone = document.getElementById("phone").value.trim();
    if (!phone || !/^\d{10}$/.test(phone)) {
      showError("phoneError", "Please enter a valid 10-digit phone number");
      return false;
    }
    hideError("phoneError");
    return true;
  }

  // Validate income
  function validateIncome() {
    const income = parseFloat(document.getElementById("income").value);
    if (isNaN(income)) {
      showError("incomeError", "Please enter a valid monthly income");
      return false;
    }
    hideError("incomeError");
    return true;
  }

  // Validate loan amount
  function validateAmount() {
    const income = parseFloat(document.getElementById("income").value);
    const amount = parseFloat(document.getElementById("amount").value);

    if (isNaN(amount)) {
      showError("amountError", "Please enter a valid loan amount");
      return false;
    }

    if (!isNaN(income) && amount > income * 12) {
      showError("amountError", "Loan amount cannot exceed your annual income");
      return false;
    }

    hideError("amountError");
    return true;
  }

  // Show error messages
  function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = "block";
    return false;
  }

  // Hide error messages
  function hideError(elementId) {
    const element = document.getElementById(elementId);
    element.style.display = "none";
  }

  // Save step data
  function saveStepData(step) {
    if (step === 1) {
      formData.personalInfo = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim()
      };
    } else if (step === 2) {
      formData.financialInfo = {
        monthlyIncome: parseFloat(document.getElementById("income").value),
        loanAmount: parseFloat(document.getElementById("amount").value),
        purpose: document.getElementById("purpose").value
      };
    } else if (step === 3) {
      formData.documents = {
        idProof: document.getElementById("idProof").files[0]?.name || null,
        addressProof: document.getElementById("addressProof").files[0]?.name || null,
        incomeProof: document.getElementById("incomeProof").files[0]?.name || null
      };
    }
  }

  // Submit form data to Firebase Firestore and Storage
  async function submitForm(e) {
    e.preventDefault();

    if (!validateStep(3)) return;
    saveStepData(3);

    const user = auth.currentUser;
    if (!user) {
      alert("Please login to submit your application");
      return;
    }

    try {
      const submitBtn = document.querySelector(".submit-btn");
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      // Prepare the complete application data
      const applicationData = {
        userId: user.uid,
        userEmail: user.email,
        ...formData,
        status: "pending",
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Generate a unique ID for the application
      const applicationId = generateApplicationId();
      
      // Save to Realtime Database
      const applicationRef = ref(realtimeDB, `loanApplications/${user.uid}/${applicationId}`);
      await set(applicationRef, applicationData);

      alert("Application submitted successfully!");
      window.location.href = "dashboard.html";
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Error submitting application: " + error.message);
    } finally {
      const submitBtn = document.querySelector(".submit-btn");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Application";
      }
    }
  }

  // Helper function to generate application ID
  function generateApplicationId() {
    return 'app_' + Date.now();
  }
});