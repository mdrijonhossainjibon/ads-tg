let tg = window.Telegram.WebApp;
let user = {
    earnedPoints: 0.00,
    withdrawals: []
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    tg.ready();
    tg.expand();

    // Set user info
    document.getElementById('header-user-name').textContent = tg.initDataUnsafe.user.username || 'User';

    // Initialize filters
    const statusFilter = document.getElementById('status-filter');
    const paymentFilter = document.getElementById('payment-filter');

    // Add filter change handlers
    statusFilter.addEventListener('change', () => {
        filterHistory();
        animateItems();
    });
    paymentFilter.addEventListener('change', () => {
        filterHistory();
        animateItems();
    });

    // Load saved data
    loadUserData();
    updateUI();
    loadHistoryData();
});

// Save and load user data
function saveUserData() {
    localStorage.setItem('userData', JSON.stringify(user));
}

function loadUserData() {
    const savedData = localStorage.getItem('userData');
    if (savedData) {
        user = { ...user, ...JSON.parse(savedData) };
    }
}

// Update UI
function updateUI() {
    const totalWithdrawn = user.withdrawals
        .filter(w => w.status === 'completed')
        .reduce((sum, w) => sum + w.amount, 0);
    
    const pendingAmount = user.withdrawals
        .filter(w => w.status === 'pending')
        .reduce((sum, w) => sum + w.amount, 0);

    document.getElementById('total-withdrawn').textContent = totalWithdrawn.toFixed(2);
    document.getElementById('pending-withdrawal').textContent = pendingAmount.toFixed(2);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Load history data
function loadHistoryData() {
    // This would typically fetch data from your backend
    // For now, we'll use sample data
    const historyData = [
        {
            id: 'TXN123456789',
            amount: 50,
            method: 'bkash',
            account: '*****12345',
            status: 'completed',
            date: 'January 31, 2025 12:30 PM',
            timestamp: new Date('2025-01-31T12:30:00').getTime()
        },
        {
            id: 'TXN987654321',
            amount: 75,
            method: 'nagad',
            account: '*****67890',
            status: 'pending',
            date: 'January 31, 2025 2:45 PM',
            timestamp: new Date('2025-01-31T14:45:00').getTime()
        },
        {
            id: 'TXN456789123',
            amount: 25,
            method: 'binance',
            account: '*****89012',
            status: 'failed',
            date: 'January 31, 2025 3:15 PM',
            timestamp: new Date('2025-01-31T15:15:00').getTime(),
            error: 'Invalid Binance UID provided'
        }
    ];

    // Sort by timestamp descending (newest first)
    historyData.sort((a, b) => b.timestamp - a.timestamp);

    // Update stats
    updateStats(historyData);

    // Update history list
    updateHistoryList(historyData);

    // Animate items
    setTimeout(animateItems, 100);
}

function updateStats(data) {
    const stats = {
        total: 0,
        pending: 0,
        completed: 0
    };

    data.forEach(item => {
        stats.total += item.amount;
        if (item.status === 'pending') stats.pending += item.amount;
        if (item.status === 'completed') stats.completed += item.amount;
    });

    // Animate number updates
    animateNumber('total-withdrawn', stats.total);
    animateNumber('pending-withdrawal', stats.pending);
    animateNumber('completed-withdrawal', stats.completed);
}

function animateNumber(elementId, target) {
    const element = document.getElementById(elementId);
    const start = parseFloat(element.textContent) || 0;
    const duration = 1000; // 1 second
    const steps = 60;
    const increment = (target - start) / steps;
    let current = start;
    let step = 0;

    const animate = () => {
        current += increment;
        step++;

        if (step === steps) current = target;
        element.textContent = current.toFixed(2);

        if (step < steps) {
            requestAnimationFrame(animate);
        }
    };

    requestAnimationFrame(animate);
}

function filterHistory() {
    const status = document.getElementById('status-filter').value;
    const method = document.getElementById('payment-filter').value;

    const items = document.querySelectorAll('#history-list > div');
    let visibleCount = 0;

    items.forEach(item => {
        const itemStatus = item.getAttribute('data-status');
        const itemMethod = item.getAttribute('data-method');
        
        const statusMatch = status === 'all' || status === itemStatus;
        const methodMatch = method === 'all' || method === itemMethod;

        if (statusMatch && methodMatch) {
            item.classList.remove('hidden');
            visibleCount++;
        } else {
            item.classList.add('hidden');
        }
    });

    // Show/hide empty state with animation
    const emptyState = document.getElementById('no-history');
    const historyList = document.getElementById('history-list');
    
    if (visibleCount === 0) {
        historyList.classList.add('opacity-0');
        setTimeout(() => {
            historyList.classList.add('hidden');
            emptyState.classList.remove('hidden');
            requestAnimationFrame(() => {
                emptyState.classList.remove('opacity-0');
            });
        }, 150);
    } else {
        emptyState.classList.add('opacity-0');
        setTimeout(() => {
            emptyState.classList.add('hidden');
            historyList.classList.remove('hidden');
            requestAnimationFrame(() => {
                historyList.classList.remove('opacity-0');
            });
        }, 150);
    }
}

function animateItems() {
    const items = document.querySelectorAll('#history-list > div:not(.hidden)');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
            item.style.transition = 'all 0.3s ease-out';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function createHistoryItem(item) {
    const statusColors = {
        completed: 'green',
        pending: 'yellow',
        failed: 'red'
    };

    const methodIcons = {
        binance: '<img src="https://cryptologos.cc/logos/binance-coin-bnb-logo.png" alt="Binance" class="w-4 h-4">',
        bkash: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        nagad: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        xrocket: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
        coinbase: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>'
    };

    const color = statusColors[item.status];
    const methodIcon = methodIcons[item.method];
    
    const html = `
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-${color}-500/20 hover:border-${color}-500/40 transition-all hover:transform hover:scale-[1.02] hover:shadow-lg"
             data-status="${item.status}" data-method="${item.method}">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center">
                        <svg class="w-5 h-5 text-${color}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            ${getStatusIcon(item.status)}
                        </svg>
                    </div>
                    <div>
                        <h4 class="font-medium text-white">${item.amount} Points Withdrawn</h4>
                        <div class="flex items-center gap-2 text-sm text-gray-400">
                            <span class="flex items-center gap-1">
                                ${methodIcon}
                                ${item.method.charAt(0).toUpperCase() + item.method.slice(1)}
                            </span>
                            <span>•</span>
                            <span>${item.account}</span>
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-500/20 text-${color}-400">
                        ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                    <div class="mt-1 text-xs text-gray-500">${item.date}</div>
                </div>
            </div>
            <div class="mt-3 pt-3 border-t border-gray-700/50">
                <div class="flex flex-col gap-2">
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-400">Transaction ID</span>
                        <span class="text-gray-300 font-mono">${item.id}</span>
                    </div>
                    ${item.error ? `
                        <div class="text-sm text-red-400">
                            ${item.error}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    return html;
}

function getStatusIcon(status) {
    switch (status) {
        case 'completed':
            return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>';
        case 'pending':
            return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>';
        case 'failed':
            return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>';
        default:
            return '';
    }
}

function updateHistoryList(data) {
    const historyList = document.getElementById('history-list');
    const emptyState = document.getElementById('no-history');

    if (data.length === 0) {
        historyList.classList.add('hidden', 'opacity-0');
        emptyState.classList.remove('hidden', 'opacity-0');
    } else {
        emptyState.classList.add('hidden', 'opacity-0');
        historyList.classList.remove('hidden');
        historyList.innerHTML = data.map(item => createHistoryItem(item)).join('');
    }
}
