const addon = new Addon();
const statusEl = document.getElementById('status');
const contentEl = document.getElementById('content');

addon.on('init', async function() {
  try {
    document.getElementById("status").innerText = "Connected to Wealthica!";
    await loadDividendHistory();
    // React to global filter changes
    addon.on('filterChange', async function() {
      document.getElementById("status").innerText = "Global filters changed — updating...";
      await loadDividendHistory();
    });
  } catch (err) {
    document.getElementById("status").innerText = "Error initializing add-on";
    console.error("Initialization error:", err);
  }
});
async function loadDividendHistory() {
  try {
    statusEl.textContent = 'Loading dividends…';

    const txs = await addon.api.getTransactions();
    const dividends = txs.filter(tx => tx.origin_type === 'Dividend');

    if (!dividends.length) {
      contentEl.innerHTML = '<p>No dividends found for the selected filters.</p>';
      statusEl.textContent = 'Connected to Wealthica!';
      return;
    }

    // Group by symbol
    const grouped = {};
    dividends.forEach(tx => {
      if (!grouped[tx.symbol]) grouped[tx.symbol] = [];
      grouped[tx.symbol].push(tx);
    });

    // Build table
    let html = `<table>
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Payments</th>
                      <th>Total Amount</th>
                      <th>Average Amount</th>
                    </tr>
                  </thead>
                  <tbody>`;

    let grandTotal = 0;

    Object.keys(grouped).forEach(symbol => {
      const arr = grouped[symbol];
      const total = arr.reduce((sum, tx) => sum + tx.currency_amount, 0);
      const avg = total / arr.length;
      grandTotal += total;

      html += `<tr>
                 <td>${symbol}</td>
                 <td>${arr.length}</td>
                 <td>${total.toFixed(2)}</td>
                 <td>${avg.toFixed(2)}</td>
               </tr>`;
    });

    html += `<tr class="total-row">
               <td colspan="2">Grand Total</td>
               <td>${grandTotal.toFixed(2)}</td>
               <td>-</td>
             </tr>`;

    html += '</tbody></table>';
    contentEl.innerHTML = html;
    statusEl.textContent = 'Connected to Wealthica!';
  } catch (err) {
    console.error('loadDividendHistory error:', err);
    statusEl.textContent = 'Error loading dividends.';
    contentEl.innerHTML = '';
  }
}

