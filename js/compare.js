document.addEventListener("DOMContentLoaded", () => {
  // Initialize loan comparison functionality
  const loanAmountSlider = document.getElementById("loanAmount");
  const selectedAmountDisplay = document.getElementById("selectedAmount");
  const loanTermSelect = document.getElementById("loanTerm");
  const comparisonTable = document.getElementById("comparisonTable");
  
  // Loan options data
  const loanTypes = [
    { type: "personal", name: "Personal Loan", rate: 10.5, minTerm: 12, maxTerm: 60 },
    { type: "home", name: "Home Loan", rate: 8.2, minTerm: 60, maxTerm: 240 },
    { type: "education", name: "Education Loan", rate: 7.5, minTerm: 12, maxTerm: 84 },
    { type: "car", name: "Car Loan", rate: 9.0, minTerm: 12, maxTerm: 84 },
    { type: "business", name: "Business Loan", rate: 12.0, minTerm: 12, maxTerm: 60 }
  ];
  
  // Event listeners
  loanAmountSlider.addEventListener("input", updateComparison);
  loanTermSelect.addEventListener("change", updateComparison);
  
  // Initial update
  updateComparison();
  
  function updateComparison() {
    const amount = parseInt(loanAmountSlider.value);
    const term = parseInt(loanTermSelect.value);
    
    // Update displayed amount
    selectedAmountDisplay.textContent = amount.toLocaleString();
    
    // Filter available loans for selected term
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
    
    // Generate comparison table
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
    updateChart(availableLoans, amount, term);
  }
  
  function calculateMonthlyPayment(amount, rate, months) {
    const monthlyRate = rate / 100 / 12;
    return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }
  
  function updateChart(loans, amount, term) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    // Destroy previous chart if exists
    if (window.loanComparisonChart) {
      window.loanComparisonChart.destroy();
    }
    
    const labels = loans.map(loan => loan.name);
    const monthlyPayments = loans.map(loan => 
      calculateMonthlyPayment(amount, loan.rate, term)
    );
    
    window.loanComparisonChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Monthly Payment (₹)',
          data: monthlyPayments,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Monthly Payment (₹)'
            }
          }
        }
      }
    });
  }
});