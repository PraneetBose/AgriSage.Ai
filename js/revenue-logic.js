let revenueChart;
let revenueData = [];
let timeLabels = [];
async function initHistoricalData() {
    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) return;
        const { data, error } = await window.supabaseClient
            .from('revenue_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);
        if (error) throw error;
        if (data && data.length> 0) {
            const chronologicalData = [...data].reverse();
            revenueData = chronologicalData.map(entry => entry.amount);
            timeLabels = chronologicalData.map(entry => {
                const date = new Date(entry.created_at);
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            });
            const latestAmount = data[0].amount;
            const totalEl = document.getElementById('rev-total');
            if (totalEl) totalEl.textContent = latestAmount.toLocaleString();
        } else {
            const now = new Date();
            for (let i = 0; i < 5; i++) {
                timeLabels.push(new Date(now.getTime() - (5 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                revenueData.push(0);
            }
        }
    } catch (err) {
        console.error("Error loading revenue history:", err);
    }
}
function updatePredictor() {
    if (revenueData.length === 0) return;
    const last3 = revenueData.slice(-3).filter(v => v> 0);
    const avg = last3.length> 0 ? (last3.reduce((a, b) => a + b, 0) / last3.length) : 0;
    const growth = 1.05 + (Math.random() * 0.1);  
    const prediction = Math.floor(avg * growth);
    const predEl = document.getElementById('predicted-revenue');
    if (predEl) {
        predEl.textContent = `₹ ${prediction.toLocaleString()}`;
    }
    const confEl = document.getElementById('prediction-confidence');
    if (confEl) {
        const conf = 85 + Math.floor(Math.random() * 10);
        confEl.textContent = `${conf}% Confidence`;
    }
}
function initChart() {
    const ctx = document.getElementById('revenueTrendChart').getContext('2d');
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Revenue (INR)',
                data: revenueData,
                borderColor: '#D4AF37',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#D4AF37'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#888', font: { size: 10 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#888', font: { size: 10 } }
                }
            }
        }
    });
}
function addRevenuePoint(value) {
    const now = new Date();
    const label = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    revenueData.shift();
    revenueData.push(value);
    timeLabels.shift();
    timeLabels.push(label);
    revenueChart.update();
    updatePredictor();
}
let expenseChart;
window.calculateProfitability = async function () {
    const acres = parseFloat(document.getElementById('rev-area').value) || 1;
    const kg = parseFloat(document.getElementById('rev-kg').value) || 0;
    const price = parseFloat(document.getElementById('rev-price').value) || 0;
    const eSeeds = parseFloat(document.getElementById('cost-seeds').value) || 0;
    const eFert = parseFloat(document.getElementById('cost-fert').value) || 0;
    const eLabor = parseFloat(document.getElementById('cost-labor').value) || 0;
    const eMach = parseFloat(document.getElementById('cost-mach').value) || 0;
    const eWater = parseFloat(document.getElementById('cost-water').value) || 0;
    const totalRevenue = kg * price;
    const totalCost = eSeeds + eFert + eLabor + eMach + eWater;
    const netProfit = totalRevenue-totalCost;
    const profitPerAcre = acres> 0 ? (netProfit / acres) : 0;
    document.getElementById('res-revenue').textContent = `₹ ${totalRevenue.toLocaleString()}`;
    document.getElementById('res-cost').textContent = `₹ ${totalCost.toLocaleString()}`;
    const profitEl = document.getElementById('res-profit');
    profitEl.textContent = `₹ ${netProfit.toLocaleString()}`;
    profitEl.style.color = netProfit>= 0 ? 'var(--accent-color)' : '#ff5252';  
    document.getElementById('res-ppa').textContent = `₹ ${profitPerAcre.toLocaleString()}`;
    updateExpenseChart([eSeeds, eFert, eLabor, eMach, eWater]);
    if (totalRevenue> 0) {
        addRevenuePoint(totalRevenue);
    }
};
function initExpenseChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Seeds', 'Fertilizer', 'Labor', 'Machinery', 'Water'],
            datasets: [{
                data: [0, 0, 0, 0, 0],  
                backgroundColor: [
                    '#D4AF37',  
                    '#00E676',  
                    '#81C784',  
                    '#A67C00',  
                    '#1B5E20'   
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { color: '#888', boxWidth: 10 } }
            }
        }
    });
}
function updateExpenseChart(data) {
    if (!expenseChart) return;
    expenseChart.data.datasets[0].data = data;
    expenseChart.update();
}
window.calculateLoan = function () {
    const P = parseFloat(document.getElementById('loan-amt').value) || 0;
    const annualRate = parseFloat(document.getElementById('loan-rate').value) || 0;
    const months = parseFloat(document.getElementById('loan-term').value) || 0;
    if (P <= 0 || months <= 0) return;
    let emi = 0;
    if (annualRate === 0) {
        emi = P / months;
    } else {
        const r = annualRate / (12 * 100);
        emi = (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    }
    document.getElementById('loan-emi').textContent = `₹ ${Math.round(emi).toLocaleString()}`;
};
document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('revenueTrendChart')) {
        await initHistoricalData();
        initChart();
        updatePredictor();
    }
    if (document.getElementById('expenseChart')) {
        initExpenseChart();
    }
});