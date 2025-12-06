
const donations = [
  { id: 1, name: "Rahul Sharma", amount: 800, date: "2025-11-28", campaign: "General Fund" },
  { id: 2, name: "Aisha Khan", amount: 1500, date: "2025-11-29", campaign: "Cancer Care Kits" },
  { id: 3, name: "John Doe", amount: 600, date: "2025-11-29", campaign: "Awareness Drive" },
  { id: 4, name: "Meera Iyer", amount: 1200, date: "2025-11-30", campaign: "General Fund" },
  { id: 5, name: "Vikram Patel", amount: 400, date: "2025-12-01", campaign: "Awareness Drive" },
  { id: 6, name: "Sara Ali", amount: 2200, date: "2025-12-01", campaign: "Cancer Care Kits" },
  { id: 7, name: "Arjun Mehta", amount: 900, date: "2025-12-02", campaign: "General Fund" },
  { id: 8, name: "Priya Nair", amount: 500, date: "2025-12-02", campaign: "Awareness Drive" },
  { id: 9, name: "David Lee", amount: 1600, date: "2025-12-03", campaign: "General Fund" },
  { id: 10, name: "Ananya Rao", amount: 700, date: "2025-12-03", campaign: "Cancer Care Kits" }
];

let chartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  populateSummary();
  renderTable(donations);
  renderChart(donations);
  setupSearch();
  setupCsvDownload();
});



function populateSummary() {
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  const uniqueDonors = new Set(donations.map(d => d.name)).size;
  const avgDonation = totalAmount / (uniqueDonors || 1);

  const latest = [...donations].sort((a, b) => (a.date < b.date ? 1 : -1))[0];

  document.getElementById("totalAmount").textContent = `₹${totalAmount.toLocaleString()}`;
  document.getElementById("totalDonors").textContent = uniqueDonors.toString();
  document.getElementById("avgDonation").textContent = `₹${Math.round(avgDonation).toLocaleString()}`;
  document.getElementById("latestDonation").textContent = latest
    ? `₹${latest.amount.toLocaleString()} on ${latest.date}`
    : "–";
}



function renderTable(data) {
  const tbody = document.getElementById("donationTableBody");
  tbody.innerHTML = "";

  if (!data.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "No donations match your search.";
    cell.style.textAlign = "center";
    cell.style.color = "#9ca3af";
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  data.forEach((d, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${d.name}</td>
      <td>${d.amount.toLocaleString()}</td>
      <td>${d.date}</td>
      <td>${d.campaign}</td>
    `;

    tbody.appendChild(tr);
  });
}



function renderChart(data) {
  
  const totalsByDate = data.reduce((acc, d) => {
    acc[d.date] = (acc[d.date] || 0) + d.amount;
    return acc;
  }, {});

  const labels = Object.keys(totalsByDate).sort();
  const values = labels.map(date => totalsByDate[date]);

  const ctx = document.getElementById("donationChart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Total Donations (₹)",
          data: values,
          borderWidth: 1.5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => `₹${value}`
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });

  
  document.getElementById("donationChart").parentElement.style.height = "260px";
}



function setupSearch() {
  const input = document.getElementById("searchInput");

  input.addEventListener("input", e => {
    const query = e.target.value.trim().toLowerCase();

    if (!query) {
      renderTable(donations);
      return;
    }

    const filtered = donations.filter(d => {
      return (
        d.name.toLowerCase().includes(query) ||
        d.date.toLowerCase().includes(query) ||
        d.campaign.toLowerCase().includes(query)
      );
    });

    renderTable(filtered);
  });
}



function setupCsvDownload() {
  const btn = document.getElementById("downloadCsvBtn");
  btn.addEventListener("click", () => {
    const header = ["Id", "Name", "Amount", "Date", "Campaign"];
    const rows = donations.map(d => [d.id, d.name, d.amount, d.date, d.campaign]);

    const csvContent = [header, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "donations_dummy_data.csv";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

