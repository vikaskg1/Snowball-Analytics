// Create the add-on using the official Wealthica SDK
var addon = new Addon();

// Initialize when Wealthica container is ready
addon.on('init', function(options) {
  document.getElementById('status').innerText = "Connected to Wealthica successfully";

  // Dummy portfolio (replace with addon.api.getPositions() for real data)
  const portfolio = [
    { symbol: "AAPL", shares: 10, dividend: 0.92 },
    { symbol: "MSFT", shares: 5, dividend: 2.72 },
    { symbol: "KO", shares: 20, dividend: 0.44 },
    { symbol: "AAPL", shares: 5, dividend: 0.92 } // duplicate symbol example
  ];

  // Summarize dividends by symbol
  const dividendSummary = portfolio.reduce((acc, item) => {
    if (!acc[item.symbol]) {
      acc[item.symbol] = { shares: 0, dividendPerShare: item.dividend };
    }
    acc[item.symbol].shares += item.shares;
    return acc;
  }, {});

  // Render summary in the UI
  const content = document.getElementById('content');
  content.innerHTML = "<h3>Dividend Summary by Symbol</h3>";

  for (const symbol in dividendSummary) {
    const data = dividendSummary[symbol];
    const annualDividend = data.shares * data.dividendPerShare;
    const el = document.createElement('div');
    el.innerText = `${symbol}: ${data.shares} shares → Annual Dividend: $${annualDividend.toFixed(2)}`;
    content.appendChild(el);
  }
});

// Optional: respond to dashboard updates
addon.on('update', function(options) {
  console.log("Dashboard updated", options);
});
