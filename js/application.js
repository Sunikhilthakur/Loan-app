import { auth, db } from "./firebaseConfig.js";
import { collection, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loanForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Grab form values
    const email = document.getElementById("email").value.trim();
    const fullName = document.getElementById("fullName").value.trim();
    const loanAmount = parseFloat(document.getElementById("loanAmount").value);
    const loanPurpose = document.getElementById("loanPurpose").value.trim();
    const monthlyIncome = parseFloat(document.getElementById("monthlyIncome").value);
    const phoneNumber = document.getElementById("phoneNumber").value.trim();

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert("You must be logged in to submit the form.");
        return;
      }

      const loanID = `loan_${Date.now()}_${user.uid}`;

      const loanData = {
        id: loanID,
        email,
        fullName,
        loanAmount,
        loanPurpose,
        monthlyIncome,
        phoneNumber,
        submittedAt: serverTimestamp(),
      };

      try {
        await setDoc(doc(db, "loan", loanID), loanData);

        alert("Loan application submitted successfully!");
        form.reset();
        window.location.href = "dashboard.html";
      } catch (err) {
        console.error("Error submitting loan application:", err.message, err);
        alert("Something went wrong: " + err.message);
      }
    });
  });
});
