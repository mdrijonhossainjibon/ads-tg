// Initialize Telegram WebApp
const webApp = window.Telegram.WebApp;
webApp.ready();

// Set user name in header
const headerUserName = document.getElementById('header-user-name');
headerUserName.textContent = webApp.initDataUnsafe.user?.username || 'User';

// Task definitions
const tasks = {
    watchAds: {
        id: 'watchAds',
        title: 'Watch 5 Ads',
        description: 'Watch 5 ads to earn bonus points',
        icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>',
        iconBg: 'blue',
        current: 0,
        target: 5,
        reward: 2.5,
        completed: false
    },
    dailyTarget: {
        id: 'dailyTarget',
        title: 'Complete Daily Target',
        description: 'Watch ads for 1 hour to complete daily target',
        icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>',
        iconBg: 'purple',
        current: 0,
        target: 60,
        reward: 5,
        completed: false
    },
    watchTime: {
        id: 'watchTime',
        title: 'Watch Ads for 30 mins',
        description: 'Keep watching ads for 30 minutes',
        icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        iconBg: 'yellow',
        current: 0,
        target: 30,
        reward: 3,
        completed: false
    }
};

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        for (const taskId in parsedTasks) {
            if (tasks[taskId]) {
                tasks[taskId] = { ...tasks[taskId], ...parsedTasks[taskId] };
            }
        }
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update task progress
function updateTaskProgress(taskId, progress) {
    if (tasks[taskId]) {
        tasks[taskId].current = progress;
        if (progress >= tasks[taskId].target && !tasks[taskId].completed) {
            tasks[taskId].completed = true;
            // Add reward points
            let currentPoints = parseFloat(localStorage.getItem('earnedPoints') || '0');
            currentPoints += tasks[taskId].reward;
            localStorage.setItem('earnedPoints', currentPoints.toString());
            // Show notification
            showNotification('Task Completed!', `+${tasks[taskId].reward} points earned`);
        }
        saveTasks();
        updateTasksUI();
    }
}

// Create task element
function createTaskElement(task) {
    const progress = Math.min((task.current / task.target) * 100, 100);
    return `
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:bg-gray-700/50 transition-colors" onclick="show_8863238()">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-${task.iconBg}-500/20 flex items-center justify-center">
                        ${task.icon}
                    </div>
                    <div>
                        <h4 class="font-medium text-white">${task.title}</h4>
                        <p class="text-xs text-gray-400">${task.description}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm font-medium text-${task.iconBg}-400">+${task.reward} points</p>
                    <p class="text-xs text-gray-400 mt-1">Progress: ${task.current}/${task.target}</p>
                </div>
            </div>
            <div class="w-full bg-gray-700/50 rounded-full h-2 mt-2">
                <div class="bg-${task.iconBg}-500 h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
            </div>
        </div>
    `;
}

// Update tasks UI
function updateTasksUI() {
    const tasksContainer = document.getElementById('tasks-container');
    const totalPoints = document.getElementById('total-points');
    const completedTasks = document.getElementById('completed-tasks');
    
    // Clear container
    tasksContainer.innerHTML = '';
    
    // Add task elements
    for (const taskId in tasks) {
        tasksContainer.innerHTML += createTaskElement(tasks[taskId]);
    }
    
    // Update stats
    const earnedPoints = parseFloat(localStorage.getItem('earnedPoints') || '0').toFixed(2);
    totalPoints.textContent = earnedPoints;
    
    const completed = Object.values(tasks).filter(task => task.completed).length;
    const total = Object.keys(tasks).length;
    completedTasks.textContent = `${completed}/${total}`;
}

// Update time until reset
function updateResetTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    const timeUntilReset = tomorrow - now;
    
    const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
    
    const refreshTimeElement = document.getElementById('task-refresh-time');
    refreshTimeElement.textContent = `${hours}h ${minutes}m`;
}

// Show notification
function showNotification(title, message) {
    webApp.showPopup({
        title: title,
        message: message,
        buttons: [{type: 'ok'}]
    });
}

// Check if tasks should be reset
function checkTaskReset() {
    const lastReset = localStorage.getItem('lastTaskReset');
    const now = new Date();
    const today = now.toDateString();
    
    if (lastReset !== today) {
        // Reset all tasks
        for (const taskId in tasks) {
            tasks[taskId].current = 0;
            tasks[taskId].completed = false;
        }
        saveTasks();
        localStorage.setItem('lastTaskReset', today);
    }
}

// Ad watching functionality
let autoAdInterval;
let isAutoAdRunning = false;

function watchAd() {
    webApp.showPopup({
        title: 'Watching Ad',
        message: 'You earned 0.5 points!',
        buttons: [{type: 'ok'}]
    });

    // Update points
    let currentPoints = parseFloat(localStorage.getItem('earnedPoints') || '0');
    currentPoints += 0.5;
    localStorage.setItem('earnedPoints', currentPoints.toString());

    // Update watched ads count
    let watchedAds = parseInt(localStorage.getItem('watchedAds') || '0');
    watchedAds++;
    localStorage.setItem('watchedAds', watchedAds.toString());

    // Update task progress
    updateTaskProgress('watchAds', parseInt(localStorage.getItem('watchedAds')) || 0);
    updateTaskProgress('watchTime', parseInt(localStorage.getItem('watchMinutes')) || 0);
    updateTaskProgress('dailyTarget', parseInt(localStorage.getItem('watchMinutes')) || 0);

    // Update UI
    updateTasksUI();
}

function startAutoAds() {
    if (isAutoAdRunning) return;
    
    isAutoAdRunning = true;
    document.getElementById('auto-ad-btn').classList.add('hidden');
    document.getElementById('stop-auto-btn').classList.remove('hidden');
    
    // Start watching ads automatically
    autoAdInterval = setInterval(() => {
        watchAd();
        
        // Update watch time
        let watchMinutes = parseInt(localStorage.getItem('watchMinutes') || '0');
        watchMinutes++;
        localStorage.setItem('watchMinutes', watchMinutes.toString());
        
        // Update task progress
        updateTaskProgress('watchTime', watchMinutes);
        updateTaskProgress('dailyTarget', watchMinutes);
    }, 60000); // Run every minute
    
    // Watch first ad immediately
    watchAd();
}

function stopAutoAds() {
    if (!isAutoAdRunning) return;
    
    isAutoAdRunning = false;
    clearInterval(autoAdInterval);
    document.getElementById('auto-ad-btn').classList.remove('hidden');
    document.getElementById('stop-auto-btn').classList.add('hidden');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    checkTaskReset();
    updateTasksUI();
    updateResetTime();
    
    // Update reset time every minute
    setInterval(updateResetTime, 60000);
});

// Listen for task updates from other pages
window.addEventListener('storage', (e) => {
    if (e.key === 'tasks') {
        loadTasks();
        updateTasksUI();
    } else if (e.key === 'earnedPoints') {
        updateTasksUI();
    }
});

// Function to close ad iframe/window
function closeAd() {
    const adFrame = document.querySelector('.monetag-ad');
    if (adFrame) {
        adFrame.remove();
    }
    
    // If there's any overlay, remove it
    const overlay = document.querySelector('.ad-overlay');
    if (overlay) {
        overlay.remove();
    }

    // Force cleanup of any remaining ad elements
    const adElements = document.querySelectorAll('[id*="monetag"],[class*="monetag"]');
    adElements.forEach(el => el.remove());
}

// Show ad with auto-close functionality
function showAd() {
    show_8863238();
    
    // Set a fallback timer to close the ad after maximum duration (e.g., 30 seconds)
    setTimeout(() => {
        closeAd();
    }, 30000);
}

// Update task element click handler to use showAd function
function createTaskElement(task) {
    const progress = Math.min((task.current / task.target) * 100, 100);
    return `
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:bg-gray-700/50 transition-colors" onclick="showAd()">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-${task.iconBg}-500/20 flex items-center justify-center">
                        ${task.icon}
                    </div>
                    <div>
                        <h4 class="font-medium text-white">${task.title}</h4>
                        <p class="text-xs text-gray-400">${task.description}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm font-medium text-${task.iconBg}-400">+${task.reward} points</p>
                    <p class="text-xs text-gray-400 mt-1">Progress: ${task.current}/${task.target}</p>
                </div>
            </div>
            <div class="w-full bg-gray-700/50 rounded-full h-2 mt-2">
                <div class="bg-${task.iconBg}-500 h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
            </div>
        </div>
    `;
}
