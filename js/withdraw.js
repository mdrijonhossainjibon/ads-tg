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
    document.getElementById('header-user-name').textContent = tg.initDataUnsafe.user?.username || 'User';
    
    // Load saved data
    loadUserData();
    updateUI();

    // Setup payment dropdown
    const dropdownBtn = document.getElementById('payment-dropdown-btn');
    const dropdown = document.getElementById('payment-dropdown');
    
    // Toggle dropdown
    dropdownBtn.addEventListener('click', () => {
        dropdown.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdownBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    // Show default payment fields
    document.getElementById('binance-fields').classList.remove('hidden');
});

// Payment selection function
function selectPayment(method) {
    // Update dropdown button
    const iconContainer = document.getElementById('selected-payment-icon');
    const text = document.getElementById('selected-payment-text');
    const dropdown = document.getElementById('payment-dropdown');
    
    // Update radio button
    document.querySelector(`input[value="${method}"]`).checked = true;
    
    // Update icon and text
    const icons = {
        binance: '<img src="https://cryptologos.cc/logos/binance-coin-bnb-logo.png" alt="Binance" class="w-5 h-5">',
        bkash: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        nagad: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        xrocket: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
        coinbase: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>'
    };

    const labels = {
        binance: 'Binance',
        bkash: 'bKash',
        nagad: 'Nagad',
        xrocket: 'Xrocket Bot',
        coinbase: 'Coinbase'
    };

    // Update icon and text
    iconContainer.innerHTML = icons[method];
    text.textContent = labels[method];
    
    // Hide all payment fields
    document.getElementById('binance-fields').classList.add('hidden');
    document.getElementById('mobile-payment-fields').classList.add('hidden');
    document.getElementById('xrocket-fields').classList.add('hidden');
    document.getElementById('coinbase-fields').classList.add('hidden');
    
    // Show selected payment field
    switch(method) {
        case 'binance':
            document.getElementById('binance-fields').classList.remove('hidden');
            break;
        case 'bkash':
        case 'nagad':
            document.getElementById('mobile-payment-fields').classList.remove('hidden');
            break;
        case 'xrocket':
            document.getElementById('xrocket-fields').classList.remove('hidden');
            break;
        case 'coinbase':
            document.getElementById('coinbase-fields').classList.remove('hidden');
            break;
    }
    
    // Close dropdown
    dropdown.classList.add('hidden');
}

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
    document.getElementById('available-points').textContent = user.earnedPoints.toFixed(2);
}

// Withdraw points
function withdrawPoints() {
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    // Validate amount
    if (!amount || amount < 10) {
        showError('Minimum withdrawal amount is 10 points');
        return;
    }
    
    if (amount > user.earnedPoints) {
        showError('Insufficient balance');
        return;
    }

    let withdrawalInfo = '';
    let isValid = true;

    // Get payment details based on method
    switch(paymentMethod) {
        case 'binance':
            const binanceUid = document.getElementById('binance-uid').value;
            if (!binanceUid) {
                showError('Please enter your Binance UID');
                isValid = false;
            } else {
                withdrawalInfo = `Binance UID: ${binanceUid}`;
            }
            break;

        case 'bkash':
        case 'nagad':
            const phoneNumber = document.getElementById('phone-number').value;
            if (!phoneNumber || !/^1\d{9}$/.test(phoneNumber)) {
                showError('Please enter a valid phone number starting with 1');
                isValid = false;
            } else {
                withdrawalInfo = `${paymentMethod.toUpperCase()}\nPhone: +880${phoneNumber}`;
            }
            break;

        case 'xrocket':
            const username = document.getElementById('telegram-username').value;
            if (!username) {
                showError('Please enter your Telegram username');
                isValid = false;
            } else {
                withdrawalInfo = `Xrocket Bot Payment\nTelegram: @${username}`;
            }
            break;

        case 'coinbase':
            const email = document.getElementById('coinbase-email').value;
            if (!email || !email.includes('@')) {
                showError('Please enter a valid Coinbase email');
                isValid = false;
            } else {
                withdrawalInfo = `Coinbase Payment\nEmail: ${email}`;
            }
            break;
    }

    if (!isValid) return;

    // Prepare withdrawal message
    const message = `💰 Withdrawal Request\n\n` +
                   `Amount: ${amount} Points\n` +
                   `${withdrawalInfo}\n\n` +
                   `User: @${tg.initDataUnsafe.user.username}`;

    // Send withdrawal request
    tg.sendData(message);
    
    // Update local data
    user.earnedPoints -= amount;
    user.withdrawals.push({
        amount: amount,
        method: paymentMethod,
        details: withdrawalInfo,
        status: 'pending',
        date: new Date().toISOString()
    });
    
    // Save and update UI
    saveUserData();
    updateUI();
}

function showError(message) {
    tg.showPopup({
        title: 'Error',
        message: message,
        buttons: [{type: 'ok'}]
    });
}
