/**
 * UI Controls Handler
 */

class ControlsManager {
    constructor(onUpdate) {
        this.onUpdate = onUpdate;
        this.config = this.getDefaultConfig();
        this.setupControls();
    }

    /**
     * Get default configuration
     */
    getDefaultConfig() {
        return {
            age: 30,
            duration: 8,
            sleepOnset: '22:00',
            fragmentationType: 'none',
            alcoholEffect: 'none',
            showCircadian: true,
            showWASO: true,
            colorScheme: 'traditional',
            showGrid: true,
            timeScale: 60
        };
    }

    /**
     * Setup all control event listeners
     */
    setupControls() {
        // Age slider
        const ageInput = document.getElementById('age');
        const ageValue = document.getElementById('age-value');
        ageInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            ageValue.textContent = value;
            this.config.age = value;
            this.triggerUpdate();
        });

        // Duration slider
        const durationInput = document.getElementById('duration');
        const durationValue = document.getElementById('duration-value');
        durationInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            durationValue.textContent = value;
            this.config.duration = value;
            this.triggerUpdate();
        });

        // Sleep onset time
        const sleepOnsetInput = document.getElementById('sleep-onset');
        sleepOnsetInput.addEventListener('change', (e) => {
            this.config.sleepOnset = e.target.value;
            this.triggerUpdate();
        });

        // Fragmentation type
        const fragmentationSelect = document.getElementById('fragmentation');
        fragmentationSelect.addEventListener('change', (e) => {
            this.config.fragmentationType = e.target.value;
            this.triggerUpdate();
        });

        // Alcohol effect
        const alcoholSelect = document.getElementById('alcohol');
        alcoholSelect.addEventListener('change', (e) => {
            this.config.alcoholEffect = e.target.value;
            this.triggerUpdate();
        });

        // Circadian rhythm checkbox
        const circadianCheckbox = document.getElementById('circadian');
        circadianCheckbox.addEventListener('change', (e) => {
            this.config.showCircadian = e.target.checked;
            this.triggerUpdate();
        });

        // Show WASO checkbox
        const wasoCheckbox = document.getElementById('show-waso');
        wasoCheckbox.addEventListener('change', (e) => {
            this.config.showWASO = e.target.checked;
            this.triggerUpdate();
        });

        // Color scheme
        const colorSchemeSelect = document.getElementById('color-scheme');
        colorSchemeSelect.addEventListener('change', (e) => {
            this.config.colorScheme = e.target.value;
            this.updateStageColors(e.target.value);
            this.triggerUpdate();
        });

        // Show grid checkbox
        const gridCheckbox = document.getElementById('show-grid');
        gridCheckbox.addEventListener('change', (e) => {
            this.config.showGrid = e.target.checked;
            this.triggerUpdate();
        });

        // Time scale
        const timeScaleSelect = document.getElementById('time-scale');
        timeScaleSelect.addEventListener('change', (e) => {
            this.config.timeScale = parseInt(e.target.value);
            this.triggerUpdate();
        });

        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => {
            this.resetToDefaults();
        });

        // Export button
        const exportBtn = document.getElementById('export-btn');
        exportBtn.addEventListener('click', () => {
            this.exportImage();
        });
    }

    /**
     * Update stage color indicators in statistics panel
     */
    updateStageColors(colorScheme) {
        const colors = document.querySelectorAll('.stage-color');
        const stages = ['W', 'REM', 'N1', 'N2', 'N3', 'WASO'];

        colors.forEach((element, index) => {
            if (index < stages.length) {
                element.style.background = Utils.getStageColor(stages[index], colorScheme);
            }
        });

        // Update bar colors
        const bars = {
            'bar-wake': 'W',
            'bar-rem': 'REM',
            'bar-n1': 'N1',
            'bar-n2': 'N2',
            'bar-n3': 'N3'
        };

        for (const [id, stage] of Object.entries(bars)) {
            const element = document.getElementById(id);
            if (element) {
                element.style.background = Utils.getStageColor(stage, colorScheme);
            }
        }
    }

    /**
     * Reset all controls to default values
     */
    resetToDefaults() {
        const defaults = this.getDefaultConfig();
        this.config = defaults;

        // Update UI elements
        document.getElementById('age').value = defaults.age;
        document.getElementById('age-value').textContent = defaults.age;
        document.getElementById('duration').value = defaults.duration;
        document.getElementById('duration-value').textContent = defaults.duration;
        document.getElementById('sleep-onset').value = defaults.sleepOnset;
        document.getElementById('fragmentation').value = defaults.fragmentationType;
        document.getElementById('alcohol').value = defaults.alcoholEffect;
        document.getElementById('circadian').checked = defaults.showCircadian;
        document.getElementById('show-waso').checked = defaults.showWASO;
        document.getElementById('color-scheme').value = defaults.colorScheme;
        document.getElementById('show-grid').checked = defaults.showGrid;
        document.getElementById('time-scale').value = defaults.timeScale;

        this.updateStageColors(defaults.colorScheme);
        this.triggerUpdate();
    }

    /**
     * Export current visualization as image
     */
    exportImage() {
        if (this.onExport) {
            this.onExport();
        }
    }

    /**
     * Trigger update callback
     */
    triggerUpdate() {
        if (this.onUpdate) {
            // Debounce updates for sliders
            clearTimeout(this.updateTimeout);
            this.updateTimeout = setTimeout(() => {
                this.onUpdate(this.config);
            }, 100);
        }
    }

    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Set export callback
     */
    setExportCallback(callback) {
        this.onExport = callback;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ControlsManager;
}
