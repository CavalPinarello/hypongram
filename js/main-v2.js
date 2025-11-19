/**
 * Main Application - Version 2
 * Scientifically-based hypnogram with continuous line visualization
 */

class HypnogramApp {
    constructor() {
        this.renderer = null;
        this.controls = null;
        this.currentData = null;
        this.currentStats = null;

        this.init();
    }

    init() {
        console.log('Initializing Evidence-Based Hypnogram Application...');

        // Initialize renderer
        this.renderer = new LineHypnogramRenderer('hypnogram-canvas');

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

        console.log('Application initialized successfully');
    }

    updateVisualization(config) {
        console.log('Generating sleep data with config:', config);

        try {
            // Generate sleep data using the new scientifically-based generator
            this.currentData = SleepGenerator.generate(config);

            console.log(`Generated ${this.currentData.epochs.length} epochs and ${this.currentData.events.length} events`);

            // Calculate statistics
            this.currentStats = Statistics.calculate(
                this.currentData.epochs,
                this.currentData.totalMinutes / 60
            );

            // Update renderer
            this.renderer.setData(this.currentData);
            this.renderer.setOptions({
                colorScheme: config.colorScheme,
                showGrid: config.showGrid,
                timeScale: config.timeScale,
                showCircadian: config.showCircadian,
                showEventLabels: config.showEventLabels
            });
            this.renderer.render();

            // Update statistics display
            this.updateStatisticsDisplay();

        } catch (error) {
            console.error('Error generating visualization:', error);
        }
    }

    updateStatisticsDisplay() {
        if (!this.currentStats) return;

        const stats = this.currentStats;

        // Update main statistics
        document.getElementById('stat-tst').textContent = Utils.formatDuration(stats.totalSleepTime);
        document.getElementById('stat-efficiency').textContent = `${stats.sleepEfficiency}%`;
        document.getElementById('stat-latency').textContent = Utils.formatDuration(stats.sleepLatency);
        document.getElementById('stat-rem-latency').textContent = Utils.formatDuration(stats.remLatency);
        document.getElementById('stat-awakenings').textContent = stats.numberOfAwakenings;
        document.getElementById('stat-waso').textContent = Utils.formatDuration(stats.waso);

        // Update percentages
        document.getElementById('pct-wake').textContent = `${stats.wakePercent}%`;
        document.getElementById('pct-rem').textContent = `${stats.remPercent}%`;
        document.getElementById('pct-n1').textContent = `${stats.n1Percent}%`;
        document.getElementById('pct-n2').textContent = `${stats.n2Percent}%`;
        document.getElementById('pct-n3').textContent = `${stats.n3Percent}%`;

        // Update stage distribution bars
        this.updateStageBars(stats);
    }

    updateStageBars(stats) {
        const stages = [
            { id: 'bar-wake', percent: stats.wakePercent },
            { id: 'bar-rem', percent: stats.remPercent },
            { id: 'bar-n1', percent: stats.n1Percent },
            { id: 'bar-n2', percent: stats.n2Percent },
            { id: 'bar-n3', percent: stats.n3Percent }
        ];

        stages.forEach(stage => {
            const element = document.getElementById(stage.id);
            if (element) {
                element.style.width = `${stage.percent}%`;

                if (stage.percent > 5) {
                    element.textContent = `${stage.percent}%`;
                } else {
                    element.textContent = '';
                }
            }
        });
    }

    handleExport() {
        const imageData = this.renderer.exportImage();

        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 10);
        const config = this.controls.getConfig();
        const filename = `hypnogram-${config.sex}-age${config.age}-${timestamp}.png`;

        link.download = filename;
        link.href = imageData;
        link.click();

        console.log('Hypnogram exported:', filename);
    }

    getConfig() {
        return this.controls.getConfig();
    }

    getStatistics() {
        return this.currentStats;
    }

    getData() {
        return this.currentData;
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
