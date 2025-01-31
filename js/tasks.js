// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.ready();

// Set user name in header
const headerUserName = document.getElementById('header-user-name');
headerUserName.textContent = tg.initDataUnsafe?.user?.username || 'User';

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

// Load tasks from StorageManager
function loadTasks() {
    const savedTasks = StorageManager.getTasks();
    Object.keys(savedTasks).forEach(taskId => {
        if (tasks[taskId]) {
            tasks[taskId] = { ...tasks[taskId], ...savedTasks[taskId] };
        }
    });
}

// Save tasks to StorageManager
function saveTasks() {
    StorageManager.setTasks(tasks);
}

// Update task progress
function updateTaskProgress(taskId, progress) {
    if (tasks[taskId]) {
        tasks[taskId].current = progress;
        if (progress >= tasks[taskId].target && !tasks[taskId].completed) {
            tasks[taskId].completed = true;
            // Add reward points
            const newPoints = StorageManager.addPoints(tasks[taskId].reward);
            // Show notification
            showNotification('Task Completed!', `+${tasks[taskId].reward} points earned`);
        }
        saveTasks();
        updateTasksUI();
    }
}

// Update UI with current points
function updatePoints() {
    const totalPoints = document.getElementById('total-points');
    totalPoints.textContent = StorageManager.getPoints().toFixed(2);
}

// Check if tasks should be reset
function checkTaskReset() {
    if (StorageManager.shouldReset()) {
        StorageManager.resetTasks(tasks);
        updateTasksUI();
    }
}

// Create task element
function createTaskElement(task) {
    const progress = Math.min((task.current / task.target) * 100, 100);
    return `
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:bg-gray-700/50 transition-colors" data-task-id="${task.id}" onclick="startTask('${task.id}')">
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
    updatePoints();
    
    const earnedPoints = StorageManager.getPoints();
    totalPoints.textContent = earnedPoints.toFixed(2);
    
    const completed = Object.values(tasks).filter(task => task.completed).length;
    const total = Object.keys(tasks).length;
    completedTasks.textContent = `${completed}/${total}`;
}

// Update time until reset
function updateResetTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    const timeLeft = tomorrow - now;

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    const resetTimeElement = document.getElementById('task-refresh-time');
    if (resetTimeElement) {
        resetTimeElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Reset tasks if it's a new day
    if (hours === 23 && minutes === 59 && seconds === 59) {
        setTimeout(() => {
            Object.keys(tasks).forEach(taskId => {
                tasks[taskId].current = 0;
                tasks[taskId].completed = false;
            });
            saveTasks();
            updateTasksUI();
            alert('Tasks Reset', 'Daily tasks have been reset!');
        }, 1000);
    }
}

// Show notification
function showNotification(title, message) {
    tg.showPopup({
        title: title,
        message: message,
        buttons: [{type: 'ok'}]
    });
}

// Global variables for ad handling
let adCheckInterval = null;
let adTimeout = null;
let isAdPlaying = false;
let currentTaskId = null;
let backButtonCount = 0;

function initAdHandling() {
    // Listen for clicks on ad elements
    document.addEventListener('click', function(e) {
        if (e.target.closest('[class*="download"], [class*="reward"], [id*="download"], [id*="reward"]')) {
            e.preventDefault(); // Prevent default action
            e.stopPropagation(); // Stop event bubbling
            setTimeout(() => closeAd(true), 1000);
        }
    }, true);

    // Add mutation observer for dynamic elements
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    const downloadBtn = node.querySelector('[class*="download"], [class*="reward"]');
                    if (downloadBtn) {
                        downloadBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setTimeout(() => closeAd(true), 1000);
                        });
                    }
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function startTask(taskId) {
    if (isAdPlaying) return;
    
    try {
        isAdPlaying = true;
        currentTaskId = taskId;
        backButtonCount = 0;
        
        // Prevent back button
        window.history.pushState({}, '');
        window.addEventListener('popstate', preventBack);
        
        // Start monitoring ad state
        startAdCheck();
        
    } catch (error) {
        console.error('Error starting task:', error);
        resetAdState();
    }
}

function preventBack(e) {
    if (isAdPlaying) {
        e.preventDefault();
        window.history.pushState({}, '');
        backButtonCount++;
        
        if (backButtonCount >= 3) {
            closeAd(false);
        }
    }
}

function startAdCheck() {
    if (adCheckInterval) clearInterval(adCheckInterval);
    if (adTimeout) clearTimeout(adTimeout);
    
    // Set timeout for ad completion
    adTimeout = setTimeout(() => {
        closeAd(false);
    }, 300000); // 5 minutes max
    
    // Check ad state periodically
    adCheckInterval = setInterval(() => {
        const adElements = document.querySelectorAll(
            'iframe[src*="niphaumeenses.net"], #container-8863238, [id*="monetag"], [class*="monetag"]'
        );
        
        if (adElements.length === 0 && isAdPlaying) {
            closeAd(true);
        }
    }, 1000);
}

function closeAd(completed) {
    if (!isAdPlaying) return;
    
    // Remove back button prevention
    window.removeEventListener('popstate', preventBack);
    
    // Clear timers
    clearTimers();
    
    // Remove all ad-related elements
    const selectors = [
        'iframe[src*="niphaumeenses.net"]',
        '#container-8863238',
        '[id*="monetag"]',
        '[class*="monetag"]',
        '[class*="download"]',
        '[class*="reward"]',
        '[style*="z-index: 99999"]',
        '.ad-overlay'
    ];
    
    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
    });
    
    // Clean up body styles
    document.body.style.overflow = '';
    document.body.style.position = '';
    
    // Remove overlay elements
    document.querySelectorAll('div').forEach(el => {
        const style = window.getComputedStyle(el);
        if (
            style.position === 'fixed' &&
            (style.backgroundColor.includes('rgba') || parseFloat(style.opacity) < 1)
        ) {
            el.remove();
        }
    });
    
    // Update task progress if completed
    if (completed && currentTaskId) {
        const task = tasks[currentTaskId];
        if (task) {
            task.current = Math.min(task.current + 1, task.target);
            task.completed = task.current >= task.target;
            
            if (task.completed) {
                alert('Task Complete!', `You've completed the ${task.title} task!`);
            } else {
                show_8876485().then(() => {
                    // Add points and update UI
                    const pointsEarned = 0.5; // Earn 0.5 points per ad view
                    StorageManager.addPoints(pointsEarned);
                    saveTasks();
                    updateTasksUI();
                    updatePoints();
                    alert('Points Earned!', `You earned ${pointsEarned} points! Total: ${StorageManager.getPoints().toFixed(2)}`);
                })
            }
        }
    }
    
    resetAdState();
}

function resetAdState() {
    isAdPlaying = false;
    currentTaskId = null;
    backButtonCount = 0;
    clearTimers();
}

function clearTimers() {
    if (adCheckInterval) {
        clearInterval(adCheckInterval);
        adCheckInterval = null;
    }
    if (adTimeout) {
        clearTimeout(adTimeout);
        adTimeout = null;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    tg.ready();
    tg.expand();
    
    // Set user info
    const username = tg.initDataUnsafe.user?.username || 'User';
    document.getElementById('header-user-name').textContent = username;
    
    // Load saved data
    loadTasks();
    updatePoints();
    
    // Check for reset
    checkTaskReset();
    updateTasksUI();
    
    // Initialize ad handling
    initAdHandling();
    
    // Update countdown
    updateResetTime();
    setInterval(updateResetTime, 1000);
    
    // Add click handlers
    document.querySelectorAll('.task-item').forEach(task => {
        const taskDiv = task.querySelector('div');
        taskDiv.addEventListener('click', () => {
            const taskId = task.dataset.taskId;
            if (taskId) startTask(taskId);
        });
    });
});

// Listen for storage changes
window.addEventListener('storage', (e) => {
    if (e.key === 'tasks') {
        loadTasks();
        updateTasksUI();
    } else if (e.key === 'earnedPoints') {
        updatePoints();
    }
});
