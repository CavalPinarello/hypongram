/**
 * Hypnogram Canvas Renderer
 */

class HypnogramRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.epochs = [];
        this.config = {};
        this.colorScheme = 'traditional';
        this.showGrid = true;
        this.timeScale = 60; // minutes
        this.showCircadian = true;

        this.setupCanvas();
        this.setupEventListeners();
    }

    /**
     * Setup canvas with proper dimensions and DPI
     */
    setupCanvas() {
        const container = this.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;

        // Set display size
        const width = container.clientWidth;
        const height = 500;

        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';

        // Set actual size in memory (scaled for DPI)
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;

        // Scale context to match DPI
        this.ctx.scale(dpr, dpr);

        // Store dimensions
        this.width = width;
        this.height = height;
        this.padding = { top: 40, right: 80, bottom: 60, left: 80 };
        this.plotWidth = this.width - this.padding.left - this.padding.right;
        this.plotHeight = this.height - this.padding.top - this.padding.bottom;
    }

    /**
     * Setup event listeners for interactivity
     */
    setupEventListeners() {
        window.addEventListener('resize', Utils.debounce(() => {
            this.setupCanvas();
            this.render();
        }, 250));
    }

    /**
     * Set epochs data
     */
    setData(epochs, config) {
        this.epochs = epochs;
        this.config = config;
    }

    /**
     * Set visualization options
     */
    setOptions(options) {
        if (options.colorScheme !== undefined) this.colorScheme = options.colorScheme;
        if (options.showGrid !== undefined) this.showGrid = options.showGrid;
        if (options.timeScale !== undefined) this.timeScale = options.timeScale;
        if (options.showCircadian !== undefined) this.showCircadian = options.showCircadian;
    }

    /**
     * Main render function
     */
    render() {
        if (!this.epochs || this.epochs.length === 0) {
            this.renderEmpty();
            return;
        }

        this.clear();

        // Draw in layers
        if (this.showCircadian) {
            this.drawCircadianOverlay();
        }
        if (this.showGrid) {
            this.drawGrid();
        }
        this.drawAxes();
        this.drawHypnogram();
        this.drawLabels();
    }

    /**
     * Clear canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Render empty state
     */
    renderEmpty() {
        this.clear();
        this.ctx.fillStyle = '#999';
        this.ctx.font = '18px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('No data to display', this.width / 2, this.height / 2);
    }

    /**
     * Draw circadian rhythm overlay
     */
    drawCircadianOverlay() {
        const sleepOnsetMinutes = Utils.timeToMinutes(this.config.sleepOnset || '22:00');
        const totalDuration = this.config.duration || 8;
        const steps = 100;

        this.ctx.save();
        this.ctx.globalAlpha = 0.15;
        this.ctx.fillStyle = '#FFC107';

        this.ctx.beginPath();
        this.ctx.moveTo(this.padding.left, this.padding.top + this.plotHeight);

        for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * totalDuration * 60; // Time in minutes
            const amplitude = SleepPatterns.getCircadianAmplitude(t, sleepOnsetMinutes);

            const x = this.padding.left + (t / (totalDuration * 60)) * this.plotWidth;
            const y = this.padding.top + this.plotHeight - (amplitude * this.plotHeight * 0.3);

            this.ctx.lineTo(x, y);
        }

        this.ctx.lineTo(this.padding.left + this.plotWidth, this.padding.top + this.plotHeight);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * Draw grid lines
     */
    drawGrid() {
        this.ctx.strokeStyle = '#E1E8ED';
        this.ctx.lineWidth = 1;

        const totalDuration = this.config.duration || 8;
        const numLines = Math.floor((totalDuration * 60) / this.timeScale);

        // Vertical time lines
        for (let i = 0; i <= numLines; i++) {
            const x = this.padding.left + (i / numLines) * this.plotWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.padding.top);
            this.ctx.lineTo(x, this.padding.top + this.plotHeight);
            this.ctx.stroke();
        }

        // Horizontal stage lines
        for (let i = 0; i <= 5; i++) {
            const y = this.padding.top + (i / 5) * this.plotHeight;
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding.left, y);
            this.ctx.lineTo(this.padding.left + this.plotWidth, y);
            this.ctx.stroke();
        }
    }

    /**
     * Draw axes
     */
    drawAxes() {
        this.ctx.strokeStyle = '#2C3E50';
        this.ctx.lineWidth = 2;

        // X-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding.left, this.padding.top + this.plotHeight);
        this.ctx.lineTo(this.padding.left + this.plotWidth, this.padding.top + this.plotHeight);
        this.ctx.stroke();

        // Y-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding.left, this.padding.top);
        this.ctx.lineTo(this.padding.left, this.padding.top + this.plotHeight);
        this.ctx.stroke();
    }

    /**
     * Draw the hypnogram
     */
    drawHypnogram() {
        if (this.epochs.length === 0) return;

        const totalDuration = this.config.duration || 8;
        const totalMinutes = totalDuration * 60;

        // Group consecutive epochs with same stage
        const segments = this.groupEpochs(this.epochs);

        // Draw each segment as a filled rectangle
        for (const segment of segments) {
            const stageValue = Utils.getStageValue(segment.stage);
            const color = Utils.getStageColor(segment.stage, this.colorScheme);

            const x1 = this.padding.left + (segment.startTime / totalMinutes) * this.plotWidth;
            const x2 = this.padding.left + (segment.endTime / totalMinutes) * this.plotWidth;
            const y = this.padding.top + this.plotHeight - ((stageValue / 4) * this.plotHeight);
            const segmentHeight = this.plotHeight / 5;

            this.ctx.fillStyle = color;
            this.ctx.fillRect(x1, y - segmentHeight, x2 - x1, segmentHeight);

            // Draw border
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.lineWidth = 0.5;
            this.ctx.strokeRect(x1, y - segmentHeight, x2 - x1, segmentHeight);
        }

        // Draw arousal markers
        this.drawArousals();
    }

    /**
     * Group consecutive epochs with the same stage
     */
    groupEpochs(epochs) {
        const segments = [];
        let currentSegment = null;

        for (const epoch of epochs) {
            if (!currentSegment || currentSegment.stage !== epoch.stage) {
                if (currentSegment) {
                    segments.push(currentSegment);
                }
                currentSegment = {
                    stage: epoch.stage,
                    startTime: epoch.time,
                    endTime: epoch.time + epoch.duration
                };
            } else {
                currentSegment.endTime = epoch.time + epoch.duration;
            }
        }

        if (currentSegment) {
            segments.push(currentSegment);
        }

        return segments;
    }

    /**
     * Draw arousal markers
     */
    drawArousals() {
        const totalDuration = this.config.duration || 8;
        const totalMinutes = totalDuration * 60;

        this.ctx.fillStyle = '#FF0000';

        for (const epoch of this.epochs) {
            if (epoch.arousal) {
                const x = this.padding.left + (epoch.time / totalMinutes) * this.plotWidth;
                const stageValue = Utils.getStageValue(epoch.stage);
                const y = this.padding.top + this.plotHeight - ((stageValue / 4) * this.plotHeight) - (this.plotHeight / 10);

                // Draw small marker
                this.ctx.beginPath();
                this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    /**
     * Draw labels
     */
    drawLabels() {
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.font = '12px sans-serif';

        // Y-axis labels (stages)
        const stages = ['N3', 'N2', 'N1', 'REM', 'Wake'];
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';

        for (let i = 0; i < stages.length; i++) {
            const y = this.padding.top + this.plotHeight - ((i / 4) * this.plotHeight) - (this.plotHeight / 10);
            this.ctx.fillText(stages[i], this.padding.left - 10, y);
        }

        // X-axis labels (time)
        const totalDuration = this.config.duration || 8;
        const sleepOnset = this.config.sleepOnset || '22:00';
        const sleepOnsetMinutes = Utils.timeToMinutes(sleepOnset);
        const numLabels = Math.floor((totalDuration * 60) / this.timeScale) + 1;

        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';

        for (let i = 0; i < numLabels; i++) {
            const minutes = i * this.timeScale;
            const clockTime = Utils.minutesToTime(sleepOnsetMinutes + minutes);
            const x = this.padding.left + (minutes / (totalDuration * 60)) * this.plotWidth;

            this.ctx.fillText(clockTime, x, this.padding.top + this.plotHeight + 10);
        }

        // Axis titles
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Time', this.padding.left + this.plotWidth / 2, this.height - 20);

        this.ctx.save();
        this.ctx.translate(20, this.padding.top + this.plotHeight / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Sleep Stage', 0, 0);
        this.ctx.restore();
    }

    /**
     * Export canvas as image
     */
    exportImage() {
        return this.canvas.toDataURL('image/png');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HypnogramRenderer;
}
