var addon = new Addon();

addon.on('init', function () {
  document.getElementById("status").innerText = "Connected to Wealthica!";
  loadPortfolio();
});

async function loadPortfolio() {
  try {
    const positions = await addon.api.getPositions();

    // Hardcoded dividend values for testing
    const dividendLookup = {
      "AAPL": 0.92,
      "MSFT": 2.72,
      "KO": 0.44,
      "TSLA": 0.00 // example of zero dividend stock
    };

    // Aggregate shares by symbol
    const dividendMap = {};
    positions.forEach(p => {
      const symbol = p.symbol || "UNKNOWN";
      const shares = p.quantity || 0;
      const dividendPerShare = dividendLookup[symbol] || 0;

      if (!dividendMap[symbol]) {
        dividendMap[symbol] = { shares: 0, dividendPerShare };
      }
      dividendMap[symbol].shares += shares;
    });

    renderDividendSummary(dividendMap);
    renderSnowball(dividendMap);

  } catch (err) {
    document.getElementById("status").innerText = "Could not load portfolio";
    console.error(err);
  }
}

function renderDividendSummary(map) {
  const container = document.getElementById("content");
  container.innerHTML = "";

  let totalAnnual = 0;

  for (const symbol in map) {
    const data = map[symbol];
    const annualDividend = data.shares * data.dividendPerShare;
    totalAnnual += annualDividend;

    const row = document.createElement("div");
    row.className = "symbol-row";
    row.innerText = `${symbol}: ${data.shares} shares → Annual Dividend $${annualDividend.toFixed(2)}`;
    container.appendChild(row);
  }

  const monthly = totalAnnual / 12;
  const total = document.createElement("div");
  total.className = "total";
  total.innerText = `Total Annual Dividend: $${totalAnnual.toFixed(2)} | Monthly: $${monthly.toFixed(2)}`;
  container.appendChild(total);
}

function renderSnowball(map) {
  let totalAnnual = 0;
  for (const symbol in map) {
    totalAnnual += map[symbol].shares * map[symbol].dividendPerShare;
  }

  const monthly = totalAnnual / 12;
  const months = [];
  const cumulative = [];
  let runningTotal = 0;

  for (let i = 1; i <= 60; i++) {
    runningTotal += monthly;
    months.push("M" + i);
    cumulative.push(runningTotal.toFixed(2));
  }

  const ctx = document.getElementById("snowballChart");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: months,
      datasets: [{
        label: "Dividend Snowball ($)",
        data: cumulative,
        borderWidth: 3,
        borderColor: "#2c3e50",
        backgroundColor: "rgba(44,62,80,0.1)",
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } }
    }
  });
}
