document.addEventListener("DOMContentLoaded", () => {
  const user = auth.currentUser;
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  
  const calendarContainer = document.getElementById("calendar");
  const activeLoansCount = document.getElementById("activeLoansCount");
  const upcomingPayments = document.getElementById("upcomingPayments");
  const totalDue = document.getElementById("totalDue");
  const paymentHistory = document.getElementById("paymentHistory");
  
  // Load user's approved loans
  db.collection("loanApplications")
    .where("userId", "==", user.uid)
    .where("status", "==", "approved")
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        calendarContainer.innerHTML = '<p class="no-data">No active loans found</p>';
        activeLoansCount.textContent = "0";
        upcomingPayments.textContent = "0";
        totalDue.textContent = "₹0";
        return;
      }
      
      activeLoansCount.textContent = snapshot.size;
      
      let totalUpcoming = 0;
      let totalAmountDue = 0;
      let allPayments = [];
      
      snapshot.forEach((doc) => {
        const loan = doc.data();
        const loanId = doc.id;
        const payments = generateRepaymentSchedule(loanId, loan);
        allPayments = [...allPayments, ...payments];
      });
      
      // Sort payments by date
      allPayments.sort((a, b) => a.date - b.date);
      
      // Calculate upcoming payments and total due
      const now = new Date();
      const upcoming = allPayments.filter(payment => 
        payment.status === "pending" && payment.date >= now
      );
      
      totalUpcoming = upcoming.length;
      totalAmountDue = upcoming.reduce((sum, payment) => sum + payment.amount, 0);
      
      upcomingPayments.textContent = totalUpcoming;
      totalDue.textContent = `₹${totalAmountDue.toLocaleString()}`;
      
      // Display payment history
      displayPaymentHistory(allPayments);
    })
    .catch((error) => {
      console.error("Error loading loans:", error);
      calendarContainer.innerHTML = '<p class="error">Error loading repayment schedule. Please try again.</p>';
    });
  
  function generateRepaymentSchedule(loanId, loan) {
    if (!loan.financialInfo || !loan.financialInfo.loanAmount || !loan.approvedAt) {
      console.error("Loan data incomplete");
      return [];
    }
    
    const amount = loan.financialInfo.loanAmount;
    const term = loan.financialInfo.term || 12; // default to 12 months
    const rate = loan.financialInfo.rate || 10; // default to 10%
    const startDate = loan.approvedAt.toDate();
    
    const monthlyPayment = calculateMonthlyPayment(amount, rate, term);
    const loanDiv = document.createElement("div");
    loanDiv.className = "loan-schedule";
    
    loanDiv.innerHTML = `
      <h3>Loan #${loanId.slice(0, 8)} - ₹${amount.toLocaleString()}</h3>
      <p>${term} months at ${rate}% - Monthly: ₹${monthlyPayment.toFixed(2)}</p>
      <div class="schedule"></div>
    `;
    
    calendarContainer.appendChild(loanDiv);
    const scheduleDiv = loanDiv.querySelector(".schedule");
    
    const payments = [];
    
    for (let i = 1; i <= term; i++) {
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);
      
      const paymentDiv = document.createElement("div");
      paymentDiv.className = "payment";
      
      // For demo, randomly mark some payments as paid
      const status = i % 3 === 0 ? "paid" : 
                     paymentDate < new Date() ? "overdue" : "pending";
      
      paymentDiv.innerHTML = `
        <span class="date">${paymentDate.toLocaleDateString()}</span>
        <span class="amount">₹${monthlyPayment.toFixed(2)}</span>
        <span class="status ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
        <button class="pay-btn" ${status === "paid" ? "disabled" : ""}>
          ${status === "overdue" ? "Pay Now" : "Schedule Payment"}
        </button>
      `;
      
      scheduleDiv.appendChild(paymentDiv);
      
      payments.push({
        loanId: loanId,
        date: paymentDate,
        amount: monthlyPayment,
        status: status
      });
    }
    
    return payments;
  }
  
  function calculateMonthlyPayment(amount, rate, months) {
    const monthlyRate = rate / 100 / 12;
    return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }
  
  function displayPaymentHistory(payments) {
    // Filter for paid payments only
    const paidPayments = payments.filter(payment => payment.status === "paid");
    
    if (paidPayments.length === 0) {
      paymentHistory.innerHTML = `
        <tr>
          <td colspan="4" class="no-data">No payment history found</td>
        </tr>
      `;
      return;
    }
    
    let historyHTML = "";
    
    paidPayments.forEach(payment => {
      historyHTML += `
        <tr>
          <td>${payment.date.toLocaleDateString()}</td>
          <td>₹${payment.amount.toFixed(2)}</td>
          <td>${payment.loanId.slice(0, 8)}</td>
          <td><span class="status-badge paid">Paid</span></td>
        </tr>
      `;
    });
    
    paymentHistory.innerHTML = historyHTML;
  }
});