/**
 * Main Application
 */

class HypnogramApp {
    constructor() {
        this.renderer = null;
        this.controls = null;
        this.currentEpochs = null;
        this.currentStats = null;

        this.init();
    }

    /**
     * Initialize application
     */
    init() {
        // Initialize renderer
        this.renderer = new HypnogramRenderer('hypnogram-canvas');

        // Initialize controls
        this.controls = new ControlsManager((config) => {
            this.updateVisualization(config);
        });

        // Set export callback
        this.controls.setExportCallback(() => {
            this.handleExport();
        });

        // Generate initial visualization
        this.updateVisualization(this.controls.getConfig());

        console.log('Hypnogram application initialized');
    }

    /**
     * Update visualization based on configuration
     */
    updateVisualization(config) {
        console.log('Updating visualization with config:', config);

        // Generate sleep data
        this.currentEpochs = SleepModel.generateSleepData(config);

        // Calculate statistics
        this.currentStats = Statistics.calculate(this.currentEpochs, config.duration);

        // Update renderer
        this.renderer.setData(this.currentEpochs, config);
        this.renderer.setOptions({
            colorScheme: config.colorScheme,
            showGrid: config.showGrid,
            timeScale: config.timeScale,
            showCircadian: config.showCircadian
        });
        this.renderer.render();

        // Update statistics display
        this.updateStatisticsDisplay();
    }

    /**
     * Update statistics panel
     */
    updateStatisticsDisplay() {
        if (!this.currentStats) return;

        const stats = this.currentStats;

        // Update main statistics
        document.getElementById('stat-tst').textContent = Utils.formatDuration(stats.totalSleepTime);
        document.getElementById('stat-efficiency').textContent = `${stats.sleepEfficiency}%`;
        document.getElementById('stat-latency').textContent = Utils.formatDuration(stats.sleepLatency);
        document.getElementById('stat-rem-latency').textContent = Utils.formatDuration(stats.remLatency);

        // Update percentages
        document.getElementById('pct-wake').textContent = `${stats.wakePercent}%`;
        document.getElementById('pct-rem').textContent = `${stats.remPercent}%`;
        document.getElementById('pct-n1').textContent = `${stats.n1Percent}%`;
        document.getElementById('pct-n2').textContent = `${stats.n2Percent}%`;
        document.getElementById('pct-n3').textContent = `${stats.n3Percent}%`;
        document.getElementById('pct-waso').textContent = `${stats.wasoPercent}%`;

        // Update stage distribution bars
        this.updateStageBars(stats);
    }

    /**
     * Update stage distribution visualization bars
     */
    updateStageBars(stats) {
        const total = 100; // Percentage

        // Calculate widths
        const stages = [
            { id: 'bar-wake', percent: stats.wakePercent },
            { id: 'bar-rem', percent: stats.remPercent },
            { id: 'bar-n1', percent: stats.n1Percent },
            { id: 'bar-n2', percent: stats.n2Percent },
            { id: 'bar-n3', percent: stats.n3Percent }
        ];

        // Update each bar
        stages.forEach(stage => {
            const element = document.getElementById(stage.id);
            if (element) {
                element.style.width = `${stage.percent}%`;

                // Show percentage if bar is wide enough
                if (stage.percent > 5) {
                    element.textContent = `${stage.percent}%`;
                } else {
                    element.textContent = '';
                }
            }
        });
    }

    /**
     * Handle export functionality
     */
    handleExport() {
        const imageData = this.renderer.exportImage();

        // Create download link
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 10);
        const age = this.controls.getConfig().age;
        link.download = `hypnogram-age${age}-${timestamp}.png`;
        link.href = imageData;
        link.click();

        console.log('Hypnogram exported');
    }

    /**
     * Get current configuration
     */
    getConfig() {
        return this.controls.getConfig();
    }

    /**
     * Get current statistics
     */
    getStatistics() {
        return this.currentStats;
    }

    /**
     * Get current epoch data
     */
    getEpochs() {
        return this.currentEpochs;
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.hypnogramApp = new HypnogramApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HypnogramApp;
}
