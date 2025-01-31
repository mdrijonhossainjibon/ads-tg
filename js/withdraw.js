let tg = window.Telegram.WebApp;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    tg.ready();
    tg.expand();

    // Set user info
    document.getElementById('header-user-name').textContent = tg.initDataUnsafe.user?.username || 'User';
    
    // Update UI with current points
    updateUI();

    // Setup payment dropdown
    setupPaymentDropdown();
});

// Update UI
function updateUI() {
    document.getElementById('available-points').textContent = StorageManager.getPoints().toFixed(2);
}

// Setup payment dropdown
function setupPaymentDropdown() {
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
}

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

// Withdraw points
function withdraw() {
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    if (!amount || amount < 1) {
        showError('Minimum withdrawal amount is 1 point');
        return;
    }
    
    if (amount > StorageManager.getPoints()) {
        showError('Insufficient balance');
        return;
    }
    
    // Get selected payment method
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
    if (!paymentMethod) {
        showError('Please select a payment method');
        return;
    }
    
    // Get withdrawal info based on payment method
    let withdrawalInfo = {};
    switch(paymentMethod) {
        case 'binance':
            withdrawalInfo.address = document.getElementById('binance-address').value;
            if (!withdrawalInfo.address) {
                showError('Please enter your Binance address');
                return;
            }
            break;
            
        case 'bkash':
        case 'nagad':
            withdrawalInfo.number = document.getElementById('mobile-number').value;
            if (!withdrawalInfo.number) {
                showError('Please enter your mobile number');
                return;
            }
            break;
            
        case 'xrocket':
            withdrawalInfo.username = document.getElementById('xrocket-username').value;
            if (!withdrawalInfo.username) {
                showError('Please enter your Xrocket username');
                return;
            }
            break;
            
        case 'coinbase':
            withdrawalInfo.email = document.getElementById('coinbase-email').value;
            if (!withdrawalInfo.email) {
                showError('Please enter your Coinbase email');
                return;
            }
            break;
    }
    
    // Prepare withdrawal data
    const withdrawal = {
        amount: amount,
        method: paymentMethod,
        details: withdrawalInfo
    };
    
    // Send withdrawal request to bot
    const message = JSON.stringify({
        type: 'withdraw',
        data: withdrawal
    });
    tg.sendData(message);
    
    // Update local data
    StorageManager.addPoints(-amount);
    StorageManager.addWithdrawal(withdrawal);
    
    // Update UI
    updateUI();
    
    // Show success message
    tg.showPopup({
        title: 'Withdrawal Requested',
        message: `Your withdrawal request for ${amount} points has been submitted.`,
        buttons: [{type: 'ok'}]
    });
}

// Listen for storage changes
window.addEventListener('storage', (e) => {
    if (e.key === 'earnedPoints') {
        updateUI();
    }
});

// Show error message
function showError(message) {
    tg.showPopup({
        title: 'Error',
        message: message,
        buttons: [{type: 'ok'}]
    });
}
