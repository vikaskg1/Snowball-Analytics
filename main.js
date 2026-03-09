var addon = new Addon();

addon.on('init', function () {

document.getElementById("status").innerText = "Connected to Wealthica";

loadPortfolio();

});


async function loadPortfolio(){

try{

const positions = await addon.api.getPositions();

const dividendMap = {};

positions.forEach(p => {

if(!p.symbol) return;

const symbol = p.symbol;

const shares = p.quantity || 0;

/*
Wealthica usually does NOT provide dividend data
so this example assumes a dividend field exists.

You may later fetch dividend data from an API.
*/

const dividendPerShare = p.dividend || 0;

if(!dividendMap[symbol]){

dividendMap[symbol] = {
shares:0,
dividend:dividendPerShare
};

}

dividendMap[symbol].shares += shares;

});

renderDividendSummary(dividendMap);

renderSnowball(dividendMap);

}
catch(err){

document.getElementById("status").innerText =
"Could not load portfolio";

console.error(err);

}

}



function renderDividendSummary(map){

const container = document.getElementById("content");

container.innerHTML="";

let totalAnnual = 0;

for(const symbol in map){

const data = map[symbol];

const annualDividend = data.shares * data.dividend;

totalAnnual += annualDividend;

const row = document.createElement("div");

row.className="symbol-row";

row.innerText =
`${symbol} — ${data.shares} shares — Annual Dividend $${annualDividend.toFixed(2)}`;

container.appendChild(row);

}

const monthly = totalAnnual / 12;

const total = document.createElement("div");

total.className="total";

total.innerText =
`Total Annual Dividend: $${totalAnnual.toFixed(2)}  |  Monthly: $${monthly.toFixed(2)}`;

container.appendChild(total);

}



function renderSnowball(map){

let totalAnnual = 0;

for(const symbol in map){

totalAnnual += map[symbol].shares * map[symbol].dividend;

}

let monthly = totalAnnual / 12;

let months = [];

let income = [];

let cumulative = 0;

for(let i=1;i<=60;i++){

cumulative += monthly;

months.push("M"+i);

income.push(cumulative);

}

const ctx = document.getElementById("snowballChart");

new Chart(ctx,{

type:"line",

data:{
labels:months,
datasets:[{
label:"Dividend Snowball",
data:income,
borderWidth:3
}]
},

options:{
responsive:true
}

});

}
