const MIN_WITHDRAW_POINTS = 50;
const ADMIN_USER_ID = 2002197659;
const BOT_TOKEN = "7610469827:AAE4PnILQw0Z10wT9yjcYG9kkoOEwoXXJ44";
const DAILY_ADS_LIMIT = 200;
let watchedAdsCount = 0;
let earnedPoints = 0.00;
let autoAdInterval;
let withdrawalHistory = JSON.parse(localStorage.getItem('withdrawalHistory') || '[]');
let dailyAdsCount = 0;
let lastAdDate = localStorage.getItem('lastAdDate') || '';

let tg = window.Telegram.WebApp;
let user = {
    watchedAds: 0,
    earnedPoints: 0.00,
    dailyLimit: 200,
    tasks: {
        watchAds: { current: 0, target: 5, reward: 2.5, completed: false },
        dailyTarget: { current: 0, target: 1, reward: 5, completed: false },
        watchTime: { current: 0, target: 30, reward: 3, completed: false }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    tg.ready();
    tg.expand();

    // Set user info
    document.getElementById('header-user-name').textContent = tg.initDataUnsafe.user.username || 'User';
    document.getElementById('user-name').textContent = tg.initDataUnsafe.user.username || 'User';
    
    // Load saved data
    loadUserData();
    updateUI();
    startTaskTimer();

    const telegramUserName = "@exampleUser"; // Replace this with actual logic
    document.getElementById("user-name").textContent = telegramUserName;
    document.getElementById("header-user-name").textContent = telegramUserName;
    document.getElementById("mobile-user-name").textContent = telegramUserName;

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuButton = document.querySelector('button[onclick="toggleMobileMenu()"]');
        if (!mobileMenu.contains(e.target) && !menuButton.contains(e.target) && mobileMenu.classList.contains('show')) {
            toggleMobileMenu();
        }
    });

    // Reset daily count if it's a new day
    const today = new Date().toDateString();
    if (lastAdDate !== today) {
        dailyAdsCount = 0;
        localStorage.setItem('dailyAdsCount', '0');
        localStorage.setItem('lastAdDate', today);
    } else {
        dailyAdsCount = parseInt(localStorage.getItem('dailyAdsCount') || '0');
    }

    if (localStorage.getItem('watchedAdsCount')) {
        watchedAdsCount = parseInt(localStorage.getItem('watchedAdsCount'));
        earnedPoints = parseFloat(localStorage.getItem('earnedPoints'));
        updateStats();
        updateProgressCircle();
    }

    // Update UI to show daily limit
    updateDailyLimitDisplay();

    // Initialize withdraw modal handlers
    document.getElementById('withdraw-section').addEventListener('click', (e) => {
        if (e.target.id === 'withdraw-section') {
            hideWithdrawForm();
        }
    });

    // Phone number input formatting
    const phoneInput = document.getElementById('withdraw-phone');
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) value = value.slice(0, 10);
        e.target.value = value;
    });
});

function updateStats() {
    document.getElementById('watched-ads').textContent = watchedAdsCount;
    document.getElementById('earned-points').textContent = earnedPoints.toFixed(2);
}

function watchAd() {
    // Check daily limit
    if (dailyAdsCount >= DAILY_ADS_LIMIT) {
        showNotification('Daily Limit Reached', 'You have reached your daily limit of 200 ads. Please try again tomorrow.', 'warning');
        return;
    }

    const watchButton = document.querySelector('button[onclick="watchAd()"]');
    watchButton.disabled = true;
    watchButton.innerHTML = '<svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Loading Ad...</span>';

    const adDuration = 15000;
    const pointValue = 0.13;

    if (typeof show_8863238 === 'function') {
        const adStartTime = Date.now();
        let adWindow = null;

        show_8863238().then((window) => {
            adWindow = window;
            return new Promise((resolve) => {
                // Set up a check every second to see if the ad window is closed
                const checkInterval = setInterval(() => {
                    if (adWindow && adWindow.closed) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 1000);

                // Auto-close after adDuration
                setTimeout(() => {
                    if (adWindow && !adWindow.closed) {
                        adWindow.close();
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, adDuration);
            });
        }).then(() => {
            const adEndTime = Date.now();
            const watchTime = adEndTime - adStartTime;

            if (watchTime >= adDuration) {
                watchedAdsCount++;
                dailyAdsCount++;
                earnedPoints += pointValue;
                updateStats();
                localStorage.setItem('watchedAdsCount', watchedAdsCount);
                localStorage.setItem('earnedPoints', earnedPoints.toFixed(2));
                localStorage.setItem('dailyAdsCount', dailyAdsCount);
                localStorage.setItem('lastAdDate', new Date().toDateString());
                updateProgressCircle();
                updateDailyLimitDisplay();
                showNotification('Success!', 'Ad watched successfully! Points added.', 'success');
            } else {
                showNotification('Warning', 'You must watch the ad for at least 15 seconds to earn points.', 'warning');
            }
        }).finally(() => {
            watchButton.disabled = false;
            watchButton.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>Watch Ad</span>';
        });
    } else {
        showNotification('Error', 'Ad function not available.', 'error');
        watchButton.disabled = false;
        watchButton.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>Watch Ad</span>';
    }
}

function updateProgressCircle() {
    const percentage = Math.min((watchedAdsCount / 10) * 100, 100);
    document.getElementById('ads-progress').textContent = `${percentage.toFixed(0)}%`;
    
    // Update progress circle fill
    const circle = document.querySelector('.progress-circle');
    circle.style.background = `conic-gradient(#22c55e ${percentage}%, transparent ${percentage}%)`;
}

function startAutoAds() {
    if (dailyAdsCount >= DAILY_ADS_LIMIT) {
        showNotification('Daily Limit Reached', 'You have reached your daily limit of 200 ads. Please try again tomorrow.', 'warning');
        return;
    }
    autoAdInterval = setInterval(() => {
        if (dailyAdsCount >= DAILY_ADS_LIMIT) {
            stopAutoAds();
            showNotification('Daily Limit Reached', 'Auto ads stopped: Daily limit reached.', 'warning');
            return;
        }
        watchAd();
    }, 20000);
    document.getElementById('auto-ad-btn').disabled = true;
    document.getElementById('stop-auto-btn').disabled = false;
    showNotification('Auto Ads', 'Auto ads started successfully!', 'info');
}

function stopAutoAds() {
    clearInterval(autoAdInterval);
    document.getElementById('auto-ad-btn').disabled = false;
    document.getElementById('stop-auto-btn').disabled = true;
    showNotification('Auto Ads', 'Auto ads stopped.', 'info');
}

function showWithdrawForm() {
    const modal = document.getElementById('withdraw-section');
    const modalContent = document.getElementById('withdraw-modal');
    modal.classList.remove('hidden');
    // Trigger reflow
    void modal.offsetWidth;
    modalContent.style.transform = 'scale(1)';
    modalContent.style.opacity = '1';
}

function hideWithdrawForm() {
    const modal = document.getElementById('withdraw-section');
    const modalContent = document.getElementById('withdraw-modal');
    modalContent.style.transform = 'scale(0.95)';
    modalContent.style.opacity = '0';
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function validatePhoneNumber(phone) {
    // Bangladesh phone number validation (10 digits starting with 1)
    return /^1\d{9}$/.test(phone);
}

function withdrawPoints() {
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const phoneNumber = document.getElementById('withdraw-phone').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    if (isNaN(amount) || amount < MIN_WITHDRAW_POINTS) {
        showNotification('Error', `Minimum withdrawal amount is ${MIN_WITHDRAW_POINTS} points.`, 'error');
        return;
    }

    if (amount > earnedPoints) {
        showNotification('Error', `Insufficient balance. You have ${earnedPoints.toFixed(2)} points.`, 'error');
        return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
        showNotification('Error', 'Please enter a valid Bangladesh phone number (10 digits starting with 1).', 'error');
        return;
    }

    const submitButton = document.querySelector('button[onclick="withdrawPoints()"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Processing...</span>';

    earnedPoints -= amount;
    updateStats();
    localStorage.setItem('earnedPoints', earnedPoints.toFixed(2));

    const message = `Withdrawal Request from ${tg.initDataUnsafe.user.username}:
Amount: ${amount} points
Payment Method: ${paymentMethod}
Phone Number: +880${phoneNumber}`;

    // Add to history
    const historyItem = {
        date: new Date().toLocaleString(),
        amount: amount,
        paymentMethod: paymentMethod,
        phoneNumber: phoneNumber,
        status: 'Pending'
    };
    withdrawalHistory.unshift(historyItem);
    localStorage.setItem('withdrawalHistory', JSON.stringify(withdrawalHistory));

    sendWithdrawRequestToAdmin(message)
        .then(() => {
            document.getElementById('withdraw-amount').value = '';
            document.getElementById('withdraw-phone').value = '';
            showNotification('Success', 'Withdrawal request sent successfully!', 'success');
            historyItem.status = 'Sent';
            localStorage.setItem('withdrawalHistory', JSON.stringify(withdrawalHistory));
            hideWithdrawForm();
        })
        .catch(() => {
            earnedPoints += amount; // Revert the deduction
            updateStats();
            localStorage.setItem('earnedPoints', earnedPoints.toFixed(2));
            historyItem.status = 'Failed';
            localStorage.setItem('withdrawalHistory', JSON.stringify(withdrawalHistory));
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg><span>Submit Withdrawal</span>';
        });
}

function sendWithdrawRequestToAdmin(message) {
    return new Promise((resolve, reject) => {
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${ADMIN_USER_ID}&text=${encodeURIComponent(message)}`)
            .then(response => response.json())
            .then(data => {
                if (!data.ok) {
                    showNotification('Error', 'Failed to send withdrawal request. Try again later.', 'error');
                    reject(new Error('Failed to send withdrawal request'));
                } else {
                    resolve();
                }
            })
            .catch(error => {
                showNotification('Error', 'Error connecting to the server. Try again later.', 'error');
                console.error('Error sending message:', error);
                reject(error);
            });
    });
}

function showNotification(title, message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-sm z-50 transform translate-x-full transition-transform duration-300
        ${type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        type === 'warning' ? 'bg-yellow-500' :
        'bg-blue-500'} text-white`;
    
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            ${type === 'success' ? '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' :
            type === 'error' ? '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>' :
            type === 'warning' ? '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>' :
            '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'}
            <div>
                <h4 class="font-bold">${title}</h4>
                <p class="text-sm">${message}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
        notification.style.transform = 'translateX(full)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showWithdrawHistory() {
    const modal = document.getElementById('history-section');
    const modalContent = document.getElementById('history-modal');
    const historyList = document.getElementById('history-list');
    const noHistory = document.getElementById('no-history');

    // Clear previous history
    historyList.innerHTML = '';

    if (withdrawalHistory.length > 0) {
        noHistory.classList.add('hidden');
        withdrawalHistory.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'bg-gray-900 rounded-lg p-4 space-y-2';
            historyItem.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-300">${item.date}</span>
                    <span class="text-sm font-bold text-green-400">${item.amount} points</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-400">${item.paymentMethod}</span>
                    <span class="text-gray-400">+880${item.phoneNumber}</span>
                </div>
                <div class="text-xs text-gray-500">${item.status}</div>
            `;
            historyList.appendChild(historyItem);
        });
    } else {
        noHistory.classList.remove('hidden');
    }

    modal.classList.remove('hidden');
    // Trigger reflow
    void modal.offsetWidth;
    modalContent.style.transform = 'scale(1)';
    modalContent.style.opacity = '1';
}

function hideWithdrawHistory() {
    const modal = document.getElementById('history-section');
    const modalContent = document.getElementById('history-modal');
    modalContent.style.transform = 'scale(0.95)';
    modalContent.style.opacity = '0';
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function updateDailyLimitDisplay() {
    const adsLeft = DAILY_ADS_LIMIT - dailyAdsCount;
    document.getElementById('daily-limit').textContent = `${adsLeft} ads left today`;
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('show');
}

function saveUserData() {
    localStorage.setItem('userData', JSON.stringify(user));
}

function loadUserData() {
    const savedData = localStorage.getItem('userData');
    if (savedData) {
        user = { ...user, ...JSON.parse(savedData) };
    }
}

function updateUI() {
    document.getElementById('watched-ads').textContent = user.watchedAds;
    document.getElementById('earned-points').textContent = user.earnedPoints.toFixed(2);
    document.getElementById('daily-limit').textContent = `${user.dailyLimit} ads left today`;
    document.getElementById('ads-progress').textContent = 
        `${Math.min(((200 - user.dailyLimit) / 200 * 100), 100).toFixed(0)}%`;
    
    // Update task progress
    updateTaskProgress();
}

function updateTaskProgress() {
    const tasksContainer = document.getElementById('tasks-container');
    const buttons = tasksContainer.getElementsByTagName('button');
    
    // Watch Ads Task
    buttons[0].textContent = `${user.tasks.watchAds.current}/${user.tasks.watchAds.target}`;
    if (user.tasks.watchAds.completed) {
        buttons[0].classList.add('bg-blue-500', 'text-white');
    }
    
    // Daily Target Task
    buttons[1].textContent = `${user.tasks.dailyTarget.current}/${user.tasks.dailyTarget.target}`;
    if (user.tasks.dailyTarget.completed) {
        buttons[1].classList.add('bg-purple-500', 'text-white');
    }
    
    // Watch Time Task
    buttons[2].textContent = `${user.tasks.watchTime.current}/${user.tasks.watchTime.target}`;
    if (user.tasks.watchTime.completed) {
        buttons[2].classList.add('bg-yellow-500', 'text-white');
    }
}

function checkTaskCompletion() {
    // Watch Ads Task
    if (user.tasks.watchAds.current >= user.tasks.watchAds.target && !user.tasks.watchAds.completed) {
        user.tasks.watchAds.completed = true;
        user.earnedPoints += user.tasks.watchAds.reward;
        showNotification('Task Completed', `+${user.tasks.watchAds.reward} points earned!`);
    }
    
    // Daily Target Task
    if (user.watchedAds >= 50 && !user.tasks.dailyTarget.completed) {
        user.tasks.dailyTarget.completed = true;
        user.earnedPoints += user.tasks.dailyTarget.reward;
        showNotification('Task Completed', `+${user.tasks.dailyTarget.reward} points earned!`);
    }
    
    // Watch Time Task (updated in watchAd function)
    
    saveUserData();
    updateUI();
}

function watchAd() {
    if (user.dailyLimit <= 0) {
        tg.showAlert('Daily limit reached! Come back tomorrow.');
        return;
    }

    // Simulate ad watching
    setTimeout(() => {
        user.watchedAds++;
        user.dailyLimit--;
        user.earnedPoints += 0.5;
        
        // Update task progress
        user.tasks.watchAds.current++;
        user.tasks.watchTime.current++;
        
        checkTaskCompletion();
        saveUserData();
        updateUI();
    }, 1000);
}

function startAutoAds() {
    if (user.dailyLimit <= 0) {
        tg.showAlert('Daily limit reached! Come back tomorrow.');
        return;
    }
    
    document.getElementById('auto-ad-btn').classList.add('hidden');
    document.getElementById('stop-auto-btn').classList.remove('hidden');
    
    autoAdInterval = setInterval(() => {
        if (user.dailyLimit > 0) {
            watchAd();
        } else {
            stopAutoAds();
        }
    }, 3000);
}

function stopAutoAds() {
    clearInterval(autoAdInterval);
    document.getElementById('auto-ad-btn').classList.remove('hidden');
    document.getElementById('stop-auto-btn').classList.add('hidden');
}

function showHome() {
    // Implementation
}

function showTasks() {
    // Implementation
}

function startTaskTimer() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeLeft = tomorrow - now;
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById('task-refresh-time').textContent = `${hours}h ${minutes}m`;
    
    setTimeout(startTaskTimer, 60000); // Update every minute
}

function showNotification(title, message) {
    tg.showPopup({
        title: title,
        message: message,
        buttons: [{
            type: 'ok'
        }]
    });
}
