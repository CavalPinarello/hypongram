/**
 * Utility Functions for Hypongram
 */

const Utils = {
    /**
     * Clamp a value between min and max
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Linear interpolation between two values
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * Map a value from one range to another
     */
    map(value, inMin, inMax, outMin, outMax) {
        return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
    },

    /**
     * Random number between min and max
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Random integer between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Random element from array
     */
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * Convert time string (HH:MM) to minutes from midnight
     */
    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    },

    /**
     * Convert minutes to time string (HH:MM)
     */
    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60) % 24;
        const mins = Math.floor(minutes % 60);
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    },

    /**
     * Format duration in minutes to readable string
     */
    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        if (hours === 0) return `${mins}m`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
    },

    /**
     * Deep clone an object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Calculate sum of array
     */
    sum(array) {
        return array.reduce((a, b) => a + b, 0);
    },

    /**
     * Calculate average of array
     */
    average(array) {
        return array.length > 0 ? this.sum(array) / array.length : 0;
    },

    /**
     * Round to specified decimal places
     */
    round(value, decimals = 0) {
        const multiplier = Math.pow(10, decimals);
        return Math.round(value * multiplier) / multiplier;
    },

    /**
     * Get color for sleep stage
     */
    getStageColor(stage, colorScheme = 'traditional') {
        const schemes = {
            traditional: {
                'W': '#FF6B6B',
                'WASO': '#FF8B94',
                'REM': '#4ECDC4',
                'N1': '#95E1D3',
                'N2': '#45B7D1',
                'N3': '#1A535C'
            },
            'high-contrast': {
                'W': '#FFFFFF',
                'WASO': '#FF6B6B',
                'REM': '#FF00FF',
                'N1': '#FFFF00',
                'N2': '#00FFFF',
                'N3': '#000080'
            },
            colorblind: {
                'W': '#E69F00',
                'WASO': '#D55E00',
                'REM': '#56B4E9',
                'N1': '#009E73',
                'N2': '#0072B2',
                'N3': '#000000'
            }
        };

        return schemes[colorScheme]?.[stage] || '#999999';
    },

    /**
     * Get stage numeric value for Y-axis positioning
     */
    getStageValue(stage) {
        const values = {
            'W': 4,
            'WASO': 4,
            'REM': 3,
            'N1': 2,
            'N2': 1,
            'N3': 0
        };
        return values[stage] ?? 0;
    },

    /**
     * Get stage name
     */
    getStageName(stage) {
        const names = {
            'W': 'Wake',
            'WASO': 'WASO',
            'REM': 'REM',
            'N1': 'N1 (Light)',
            'N2': 'N2 (Light)',
            'N3': 'N3 (Deep)'
        };
        return names[stage] || stage;
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
