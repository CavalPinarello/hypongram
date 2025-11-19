/**
 * UI Controls Handler - Version 2
 * Handles all user inputs for the scientifically-based hypnogram
 */

class ControlsManager {
    constructor(onUpdate) {
        this.onUpdate = onUpdate;
        this.config = this.getDefaultConfig();
        this.setupControls();
    }

    getDefaultConfig() {
        return {
            age: 30,
            sex: 'male',
            duration: 0, // 0 = auto (age-appropriate)
            sleepOnset: '22:00',
            pregnancy: 'none',
            menopause: false,
            partnerSnoring: 'none',
            partnerMovement: 'none',
            sdbSeverity: 'none',
            alcohol: 'none',
            jetLag: 0,
            showCircadian: true,
            showEventLabels: true,
            colorScheme: 'traditional',
            showGrid: true,
            timeScale: 60
        };
    }

    setupControls() {
        // Age
        const ageInput = document.getElementById('age');
        const ageValue = document.getElementById('age-value');
        ageInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            ageValue.textContent = value;
            this.config.age = value;
            this.triggerUpdate();
        });

        // Sex
        const sexSelect = document.getElementById('sex');
        sexSelect.addEventListener('change', (e) => {
            this.config.sex = e.target.value;
            this.updateGenderSpecificControls();
            this.triggerUpdate();
        });

        // Duration
        const durationInput = document.getElementById('duration');
        const durationValue = document.getElementById('duration-value');
        durationInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            durationValue.textContent = value === 0 ? 'Auto' : `${value}h`;
            this.config.duration = value === 0 ? null : value;
            this.triggerUpdate();
        });

        // Sleep onset
        document.getElementById('sleep-onset').addEventListener('change', (e) => {
            this.config.sleepOnset = e.target.value;
            this.triggerUpdate();
        });

        // Pregnancy
        const pregnancySelect = document.getElementById('pregnancy');
        pregnancySelect.addEventListener('change', (e) => {
            this.config.pregnancy = e.target.value;
            this.triggerUpdate();
        });

        // Menopause
        document.getElementById('menopause').addEventListener('change', (e) => {
            this.config.menopause = e.target.checked;
            this.triggerUpdate();
        });

        // Partner snoring
        document.getElementById('partner-snoring').addEventListener('change', (e) => {
            this.config.partnerSnoring = e.target.value;
            this.triggerUpdate();
        });

        // Partner movement
        document.getElementById('partner-movement').addEventListener('change', (e) => {
            this.config.partnerMovement = e.target.value;
            this.triggerUpdate();
        });

        // SDB severity
        document.getElementById('sdb-severity').addEventListener('change', (e) => {
            this.config.sdbSeverity = e.target.value;
            this.triggerUpdate();
        });

        // Alcohol
        document.getElementById('alcohol').addEventListener('change', (e) => {
            this.config.alcohol = e.target.value;
            this.triggerUpdate();
        });

        // Jet lag
        const jetLagInput = document.getElementById('jet-lag');
        const jetLagValue = document.getElementById('jet-lag-value');
        jetLagInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            jetLagValue.textContent = value;
            this.config.jetLag = value;
            this.triggerUpdate();
        });

        // Circadian
        document.getElementById('circadian').addEventListener('change', (e) => {
            this.config.showCircadian = e.target.checked;
            this.triggerUpdate();
        });

        // Show event labels
        document.getElementById('show-event-labels').addEventListener('change', (e) => {
            this.config.showEventLabels = e.target.checked;
            this.triggerUpdate();
        });

        // Show grid
        document.getElementById('show-grid').addEventListener('change', (e) => {
            this.config.showGrid = e.target.checked;
            this.triggerUpdate();
        });

        // Color scheme
        document.getElementById('color-scheme').addEventListener('change', (e) => {
            this.config.colorScheme = e.target.value;
            this.updateStageColors(e.target.value);
            this.triggerUpdate();
        });

        // Time scale
        document.getElementById('time-scale').addEventListener('change', (e) => {
            this.config.timeScale = parseInt(e.target.value);
            this.triggerUpdate();
        });

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetToDefaults();
        });

        // Export button
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportImage();
        });

        // Initial gender-specific control update
        this.updateGenderSpecificControls();
    }

    updateGenderSpecificControls() {
        const isFemale = this.config.sex === 'female';
        const pregnancySelect = document.getElementById('pregnancy');
        const menopauseCheckbox = document.getElementById('menopause');

        pregnancySelect.disabled = !isFemale;
        menopauseCheckbox.disabled = !isFemale;

        if (!isFemale) {
            this.config.pregnancy = 'none';
            this.config.menopause = false;
            pregnancySelect.value = 'none';
            menopauseCheckbox.checked = false;
        }
    }

    updateStageColors(colorScheme) {
        const colors = document.querySelectorAll('.stage-color');
        const stages = ['W', 'REM', 'N1', 'N2', 'N3'];

        colors.forEach((element, index) => {
            if (index < stages.length) {
                element.style.background = Utils.getStageColor(stages[index], colorScheme);
            }
        });

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

    resetToDefaults() {
        const defaults = this.getDefaultConfig();
        this.config = defaults;

        // Update all UI elements
        document.getElementById('age').value = defaults.age;
        document.getElementById('age-value').textContent = defaults.age;
        document.getElementById('sex').value = defaults.sex;
        document.getElementById('duration').value = defaults.duration;
        document.getElementById('duration-value').textContent = 'Auto';
        document.getElementById('sleep-onset').value = defaults.sleepOnset;
        document.getElementById('pregnancy').value = defaults.pregnancy;
        document.getElementById('menopause').checked = defaults.menopause;
        document.getElementById('partner-snoring').value = defaults.partnerSnoring;
        document.getElementById('partner-movement').value = defaults.partnerMovement;
        document.getElementById('sdb-severity').value = defaults.sdbSeverity;
        document.getElementById('alcohol').value = defaults.alcohol;
        document.getElementById('jet-lag').value = defaults.jetLag;
        document.getElementById('jet-lag-value').textContent = defaults.jetLag;
        document.getElementById('circadian').checked = defaults.showCircadian;
        document.getElementById('show-event-labels').checked = defaults.showEventLabels;
        document.getElementById('show-grid').checked = defaults.showGrid;
        document.getElementById('color-scheme').value = defaults.colorScheme;
        document.getElementById('time-scale').value = defaults.timeScale;

        this.updateGenderSpecificControls();
        this.updateStageColors(defaults.colorScheme);
        this.triggerUpdate();
    }

    exportImage() {
        if (this.onExport) {
            this.onExport();
        }
    }

    triggerUpdate() {
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
            if (this.onUpdate) {
                this.onUpdate(this.config);
            }
        }, 100);
    }

    getConfig() {
        return { ...this.config };
    }

    setExportCallback(callback) {
        this.onExport = callback;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ControlsManager;
}
