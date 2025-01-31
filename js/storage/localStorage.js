// Local Storage Keys
const STORAGE_KEYS = {
    EARNED_POINTS: 'earnedPoints',
    TASKS: 'tasks',
    LAST_RESET: 'lastTaskReset',
    USER_DATA: 'userData',
    WITHDRAWALS: 'withdrawals'
};

// Storage Manager
const StorageManager = {
    // Points Management
    getPoints() {
        return parseFloat(localStorage.getItem(STORAGE_KEYS.EARNED_POINTS)) || 0;
    },

    setPoints(points) {
        localStorage.setItem(STORAGE_KEYS.EARNED_POINTS, points.toFixed(2));
        this.notifyChange(STORAGE_KEYS.EARNED_POINTS);
    },

    addPoints(amount) {
        const currentPoints = this.getPoints();
        this.setPoints(currentPoints + amount);
        return this.getPoints();
    },

    // Tasks Management
    getTasks() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || {};
        } catch {
            return {};
        }
    },

    setTasks(tasks) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        this.notifyChange(STORAGE_KEYS.TASKS);
    },

    updateTask(taskId, taskData) {
        const tasks = this.getTasks();
        tasks[taskId] = { ...tasks[taskId], ...taskData };
        this.setTasks(tasks);
    },

    // Reset Management
    getLastReset() {
        return localStorage.getItem(STORAGE_KEYS.LAST_RESET);
    },

    setLastReset(date) {
        localStorage.setItem(STORAGE_KEYS.LAST_RESET, date);
    },

    shouldReset() {
        const lastReset = this.getLastReset();
        const now = new Date();
        const today = now.toDateString();
        return lastReset !== today;
    },

    // Withdrawal Management
    getWithdrawals() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.WITHDRAWALS)) || [];
        } catch {
            return [];
        }
    },

    addWithdrawal(withdrawal) {
        const withdrawals = this.getWithdrawals();
        withdrawals.push({
            ...withdrawal,
            date: new Date().toISOString(),
            status: 'pending'
        });
        localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(withdrawals));
        this.notifyChange(STORAGE_KEYS.WITHDRAWALS);
    },

    // Change Notification
    notifyChange(key) {
        window.dispatchEvent(new StorageEvent('storage', {
            key: key,
            newValue: localStorage.getItem(key),
            url: window.location.href
        }));
    },

    // Reset All Tasks
    resetTasks(tasks) {
        const resetTasks = {};
        Object.keys(tasks).forEach(taskId => {
            resetTasks[taskId] = {
                ...tasks[taskId],
                current: 0,
                completed: false
            };
        });
        this.setTasks(resetTasks);
        this.setLastReset(new Date().toDateString());
    },

    // Clear All Data
    clearAll() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
};

// Export the StorageManager
window.StorageManager = StorageManager;
