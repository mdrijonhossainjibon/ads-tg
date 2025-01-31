let tg = window.Telegram.WebApp;
let user = {
    watchedAds: 0,
    earnedPoints: 0.00,
    dailyLimit: 200,
    lastAdTime: null,
    watchTime: 0,
    tasks: {
        watchAds: { current: 0, target: 5, reward: 2.5, completed: false },
        dailyTarget: { current: 0, target: 60, reward: 5, completed: false },
        watchTime: { current: 0, target: 30, reward: 3, completed: false }
    },
    lastTaskReset: null,
    lastWatchTime: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    tg.ready();
    tg.expand();

    // Set user info
    const username = tg.initDataUnsafe.user?.username || 'User';
    document.getElementById('header-user-name').textContent = username;
    document.getElementById('user-name').textContent = username;
    
    // Load saved data
    loadUserData();
    checkDailyReset();
    updateUI();
    populateTasks();
    startWatchTimeTracking();
});

// Save and load user data
function saveUserData() {
    localStorage.setItem('userData', JSON.stringify(user));
}

function loadUserData() {
    const savedData = localStorage.getItem('userData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        user = {
            ...user,
            ...parsedData,
            tasks: {
                ...user.tasks,
                ...(parsedData.tasks || {})
            }
        };
    }
}

// Check daily reset
function checkDailyReset() {
    const lastReset = localStorage.getItem('lastReset');
    const now = new Date();
    const today = now.toDateString();

    if (lastReset !== today) {
        user.dailyLimit = 200;
        user.watchedAds = 0;
        user.watchTime = 0;
        user.tasks = {
            watchAds: { current: 0, target: 5, reward: 2.5, completed: false },
            dailyTarget: { current: 0, target: 60, reward: 5, completed: false },
            watchTime: { current: 0, target: 30, reward: 3, completed: false }
        };
        user.lastTaskReset = today;
        user.lastWatchTime = null;
        localStorage.setItem('lastReset', today);
        saveUserData();
    }
}

// Update UI
function updateUI() {
    document.getElementById('watched-ads').textContent = user.watchedAds;
    document.getElementById('earned-points').textContent = user.earnedPoints.toFixed(2);
    document.getElementById('daily-limit').textContent = `${user.dailyLimit} ads left today`;
    
    const progress = ((200 - user.dailyLimit) / 200) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('ads-progress').textContent = `${Math.round(progress)}%`;
}

// Populate tasks
function populateTasks() {
    const tasksContainer = document.getElementById('tasks-container');
    if (!tasksContainer) return;
    
    tasksContainer.innerHTML = '';

    // Only show top 2 incomplete tasks or completed tasks if all are done
    const tasks = [
        {
            id: 'watchAds',
            title: 'Watch 5 Ads',
            description: 'Watch 5 ads to earn bonus points',
            reward: 2.5,
            icon: `<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
                   </svg>`,
            color: 'blue'
        },
        {
            id: 'dailyTarget',
            title: 'Complete Daily Target',
            description: 'Watch ads for 1 hour to complete daily target',
            reward: 5,
            icon: `<svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                   </svg>`,
            color: 'purple'
        },
        {
            id: 'watchTime',
            title: 'Watch Ads for 30 mins',
            description: 'Keep watching ads for 30 minutes',
            reward: 3,
            icon: `<svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                   </svg>`,
            color: 'yellow'
        }
    ];

    // Filter tasks to show incomplete ones first
    const incompleteTasks = tasks.filter(task => !user.tasks[task.id].completed);
    const completedTasks = tasks.filter(task => user.tasks[task.id].completed);
    
    // Show 2 incomplete tasks or completed ones if all are done
    const tasksToShow = incompleteTasks.length > 0 ? incompleteTasks.slice(0, 2) : completedTasks.slice(0, 2);

    tasksToShow.forEach(task => {
        const taskData = user.tasks[task.id];
        const progress = (taskData.current / taskData.target) * 100;
        
        const taskElement = document.createElement('div');
        taskElement.className = 'bg-gray-700/50 backdrop-blur-sm rounded-xl p-4';
        taskElement.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-${task.color}-500/20 flex items-center justify-center">
                        ${task.icon}
                    </div>
                    <div>
                        <h4 class="font-medium text-white">${task.title}</h4>
                        <p class="text-xs text-gray-400">${task.description}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm font-medium text-${task.color}-400">+${task.reward} points</p>
                    <p class="text-xs text-gray-400 mt-1">Progress: ${taskData.current}/${taskData.target}</p>
                </div>
            </div>
            <div class="w-full bg-gray-800/50 rounded-full h-2 mt-2">
                <div class="bg-${task.color}-500 h-2 rounded-full transition-all duration-300" 
                     style="width: ${progress}%"></div>
            </div>
            ${taskData.completed ? 
                `<div class="mt-2 text-center">
                    <span class="text-xs text-green-400">✓ Completed</span>
                </div>` : ''}
        `;
        tasksContainer.appendChild(taskElement);
    });
}

// Watch Ad
function watchAd() {
    if (user.dailyLimit <= 0) {
        tg.showPopup({
            title: 'Daily Limit Reached',
            message: 'You have reached your daily limit. Come back tomorrow!',
            buttons: [{type: 'ok'}]
        });
        return;
    }

    // Check cooldown
    if (user.lastAdTime) {
        const now = new Date().getTime();
        const timeSinceLastAd = now - user.lastAdTime;
        if (timeSinceLastAd < 30000) { // 30 seconds cooldown
            const remainingTime = Math.ceil((30000 - timeSinceLastAd) / 1000);
            tg.showPopup({
                title: 'Please Wait',
                message: `Wait ${remainingTime} seconds before watching next ad`,
                buttons: [{type: 'ok'}]
            });
            return;
        }
    }

    // Show ad
    try {
        if (typeof show_8863238 === 'function') {
            show_8863238();
            
            // Update stats
            user.watchedAds++;
            user.dailyLimit--;
            user.earnedPoints += 0.5;
            user.lastAdTime = new Date().getTime();
            user.lastWatchTime = new Date().getTime();
            
            // Update watch ads task
            if (!user.tasks.watchAds.completed) {
                user.tasks.watchAds.current = Math.min(user.tasks.watchAds.current + 1, user.tasks.watchAds.target);
                if (user.tasks.watchAds.current >= user.tasks.watchAds.target) {
                    completeTask('watchAds');
                }
            }
            
            saveUserData();
            updateUI();
            populateTasks();
        } else {
            tg.showPopup({
                title: 'Error',
                message: 'Ad service is temporarily unavailable. Please try again later.',
                buttons: [{type: 'ok'}]
            });
        }
    } catch (error) {
        console.error('Error showing ad:', error);
        tg.showPopup({
            title: 'Error',
            message: 'Failed to load ad. Please try again.',
            buttons: [{type: 'ok'}]
        });
    }
}

// Complete task
function completeTask(taskId) {
    if (user.tasks[taskId] && !user.tasks[taskId].completed) {
        user.tasks[taskId].completed = true;
        user.earnedPoints += user.tasks[taskId].reward;
        
        tg.showPopup({
            title: 'Task Completed! 🎉',
            message: `Congratulations! You earned +${user.tasks[taskId].reward} points!`,
            buttons: [{type: 'ok'}]
        });
        
        saveUserData();
        updateUI();
        populateTasks();
    }
}

// Start watch time tracking
function startWatchTimeTracking() {
    setInterval(() => {
        const now = new Date().getTime();
        
        // Only track time if there's a last watch time and it's within 2 minutes
        if (user.lastWatchTime && (now - user.lastWatchTime) <= 120000) {
            user.watchTime++;
            
            // Update daily target task
            if (!user.tasks.dailyTarget.completed) {
                user.tasks.dailyTarget.current = Math.min(user.watchTime, user.tasks.dailyTarget.target);
                if (user.tasks.dailyTarget.current >= user.tasks.dailyTarget.target) {
                    completeTask('dailyTarget');
                }
            }
            
            // Update watch time task
            if (!user.tasks.watchTime.completed) {
                user.tasks.watchTime.current = Math.min(user.watchTime, user.tasks.watchTime.target);
                if (user.tasks.watchTime.current >= user.tasks.watchTime.target) {
                    completeTask('watchTime');
                }
            }
            
            saveUserData();
            populateTasks();
        }
    }, 60000); // Check every minute
}
