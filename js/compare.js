document.addEventListener("DOMContentLoaded", () => {
  const loanAmountSlider = document.getElementById("loanAmount");
  const selectedAmountDisplay = document.getElementById("selectedAmount");
  const loanTermSelect = document.getElementById("loanTerm");
  const comparisonTable = document.getElementById("comparisonTable");
  
  // Initialize loan options
  const loanTypes = [
    { type: "personal", name: "Personal Loan", rate: 10.5, minTerm: 12, maxTerm: 60 },
    { type: "home", name: "Home Loan", rate: 8.2, minTerm: 60, maxTerm: 240 },
    { type: "education", name: "Education Loan", rate: 7.5, minTerm: 12, maxTerm: 84 },
    { type: "car", name: "Car Loan", rate: 9.0, minTerm: 12, maxTerm: 84 },
    { type: "business", name: "Business Loan", rate: 12.0, minTerm: 12, maxTerm: 60 }
  ];
  
  // Initialize event listeners
  loanAmountSlider.addEventListener("input", updateComparison);
  loanTermSelect.addEventListener("change", updateComparison);
  
  // Initial update
  updateComparison();
  
  function updateComparison() {
    const amount = parseInt(loanAmountSlider.value);
    const term = parseInt(loanTermSelect.value);
    
    // Update displayed amount
    selectedAmountDisplay.textContent = amount.toLocaleString();
    
    // Filter loan types available for selected term
    const availableLoans = loanTypes.filter(loan => 
      term >= loan.minTerm && term <= loan.maxTerm
    );
    
    if (availableLoans.length === 0) {
      comparisonTable.innerHTML = `
        <tr>
          <td colspan="5" class="no-data">No loan options available for the selected term</td>
        </tr>
      `;
      return;
    }
    
    // Generate table rows
    let tableHTML = "";
    
    availableLoans.forEach(loan => {
      const monthlyPayment = calculateMonthlyPayment(amount, loan.rate, term);
      const totalInterest = monthlyPayment * term - amount;
      const totalPayment = monthlyPayment * term;
      
      tableHTML += `
        <tr>
          <td>${loan.name}</td>
          <td>${loan.rate}%</td>
          <td>₹${monthlyPayment.toFixed(2)}</td>
          <td>₹${totalInterest.toFixed(2)}</td>
          <td>₹${totalPayment.toFixed(2)}</td>
        </tr>
      `;
    });
    
    comparisonTable.innerHTML = tableHTML;
  }
  
  function calculateMonthlyPayment(amount, rate, months) {
    const monthlyRate = rate / 100 / 12;
    return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }
});