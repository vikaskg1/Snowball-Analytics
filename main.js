var addon = new Addon();

addon.on('init', async function() {
  document.getElementById("status").innerText = "Connected to Wealthica!";
  await loadDividendHistory();
});

async function loadDividendHistory() {
  try {
    const transactions = await addon.api.getTransactions();
    
    // Filter dividend transactions
    const dividendTx = transactions.filter(tx => tx.type === 'dividend');

    if(dividendTx.length === 0){
      document.getElementById("content").innerText = "No historical dividends found.";
      return;
    }

    const dividendMap = {};

    dividendTx.forEach(tx => {
      // Try multiple fields in case of broker import
      const symbol = tx.symbol || tx.security?.symbol || "UNKNOWN";
      const amount = tx.amount || 0;

      if (!dividendMap[symbol]) {
        dividendMap[symbol] = { total: 0, count: 0 };
      }

      dividendMap[symbol].total += amount;
      dividendMap[symbol].count += 1;
    });

    // Sort by total descending
    const sorted = Object.entries(dividendMap).sort((a,b) => b[1].total - a[1].total);

    renderDividendTable(sorted);

  } catch(err) {
    document.getElementById("status").innerText = "Error loading dividend history";
    console.error(err);
  }
}

function renderDividendTable(sortedData) {
  const container = document.getElementById("content");
  container.innerHTML = "";

  let grandTotal = 0;

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr style="background:#2c3e50; color:white; text-align:left;">
      <th style="padding:8px">Symbol</th>
      <th style="padding:8px">Payments</th>
      <th style="padding:8px">Total ($)</th>
      <th style="padding:8px">Average per Payment ($)</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  sortedData.forEach(([symbol, data]) => {
    const avg = data.count > 0 ? (data.total / data.count).toFixed(2) : "0.00";
    const row = document.createElement("tr");
    row.style.borderBottom = "1px solid #ddd";
    row.innerHTML = `
      <td style="padding:8px">${symbol}</td>
      <td style="padding:8px">${data.count}</td>
      <td style="padding:8px">${data.total.toFixed(2)}</td>
      <td style="padding:8px">${avg}</td>
    `;
    tbody.appendChild(row);
    grandTotal += data.total;
  });

  table.appendChild(tbody);
  container.appendChild(table);

  const totalDiv = document.createElement("div");
  totalDiv.className = "total";
  totalDiv.innerText = `Grand Total Dividends: $${grandTotal.toFixed(2)}`;
  container.appendChild(totalDiv);
}
