/**
 * Continuous-Line Hypnogram Renderer
 * Draws a flowing line through sleep stages with event markers
 */

class LineHypnogramRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.data = null;
        this.colorScheme = 'traditional';
        this.showGrid = true;
        this.timeScale = 60;
        this.showCircadian = true;
        this.showEventLabels = true;

        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;

        const width = container.clientWidth;
        const height = 500;

        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';

        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;

        this.ctx.scale(dpr, dpr);

        this.width = width;
        this.height = height;
        this.padding = { top: 40, right: 100, bottom: 80, left: 80 };
        this.plotWidth = this.width - this.padding.left - this.padding.right;
        this.plotHeight = this.height - this.padding.top - this.padding.bottom;
    }

    setupEventListeners() {
        window.addEventListener('resize', Utils.debounce(() => {
            this.setupCanvas();
            this.render();
        }, 250));

        // Tooltip on hover
        this.canvas.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
    }

    setData(data) {
        this.data = data;
    }

    setOptions(options) {
        if (options.colorScheme !== undefined) this.colorScheme = options.colorScheme;
        if (options.showGrid !== undefined) this.showGrid = options.showGrid;
        if (options.timeScale !== undefined) this.timeScale = options.timeScale;
        if (options.showCircadian !== undefined) this.showCircadian = options.showCircadian;
        if (options.showEventLabels !== undefined) this.showEventLabels = options.showEventLabels;
    }

    render() {
        if (!this.data || !this.data.epochs || this.data.epochs.length === 0) {
            this.renderEmpty();
            return;
        }

        this.clear();

        // Layer order
        if (this.showCircadian) {
            this.drawCircadianOverlay();
        }
        if (this.showGrid) {
            this.drawGrid();
        }
        this.drawAxes();
        this.drawStageRegions(); // Optional: light background colors
        this.drawSleepLine(); // Main continuous line
        this.drawEventMarkers(); // Vertical lines for awakenings
        this.drawLabels();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    renderEmpty() {
        this.clear();
        this.ctx.fillStyle = '#999';
        this.ctx.font = '18px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('No data to display', this.width / 2, this.height / 2);
    }

    /**
     * Get Y position for a sleep stage
     * Higher Y = top of canvas = Wake (surface)
     * Lower Y = bottom of canvas = N3 (deep)
     */
    getStageY(stage) {
        const stageValues = {
            'W': 5,
            'WASO': 5,
            'REM': 4,
            'N1': 3,
            'N2': 2,
            'N3': 1
        };

        const value = stageValues[stage] || 3;
        // Invert: value 5 (wake) at top, value 1 (N3) at bottom
        return this.padding.top + this.plotHeight - ((value - 1) / 4) * this.plotHeight;
    }

    /**
     * Get X position for a time point
     */
    getTimeX(timeInMinutes) {
        const totalMinutes = this.data.totalMinutes;
        return this.padding.left + (timeInMinutes / totalMinutes) * this.plotWidth;
    }

    /**
     * Draw optional stage region backgrounds
     */
    drawStageRegions() {
        const stages = [
            { name: 'Wake', y: 5, color: 'rgba(255, 107, 107, 0.05)' },
            { name: 'REM', y: 4, color: 'rgba(78, 205, 196, 0.05)' },
            { name: 'N1', y: 3, color: 'rgba(149, 225, 211, 0.05)' },
            { name: 'N2', y: 2, color: 'rgba(69, 183, 209, 0.05)' },
            { name: 'N3', y: 1, color: 'rgba(26, 83, 92, 0.05)' }
        ];

        const regionHeight = this.plotHeight / 5;

        for (let i = 0; i < stages.length; i++) {
            const y = this.padding.top + i * regionHeight;

            this.ctx.fillStyle = stages[stages.length - 1 - i].color;
            this.ctx.fillRect(
                this.padding.left,
                y,
                this.plotWidth,
                regionHeight
            );
        }
    }

    /**
     * Draw the continuous sleep line
     */
    drawSleepLine() {
        const epochs = this.data.epochs;
        if (epochs.length === 0) return;

        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = '#2C3E50';
        this.ctx.lineJoin = 'round';

        // Start at first epoch
        const firstEpoch = epochs[0];
        const firstX = this.getTimeX(firstEpoch.time);
        const firstY = this.getStageY(firstEpoch.stage);

        this.ctx.moveTo(firstX, firstY);

        // Draw line through all epochs
        for (let i = 1; i < epochs.length; i++) {
            const epoch = epochs[i];
            const x = this.getTimeX(epoch.time);
            const y = this.getStageY(epoch.stage);

            this.ctx.lineTo(x, y);
        }

        this.ctx.stroke();

        // Optionally fill under the line for visual effect
        this.ctx.lineTo(this.getTimeX(epochs[epochs.length - 1].time), this.padding.top + this.plotHeight);
        this.ctx.lineTo(this.getTimeX(epochs[0].time), this.padding.top + this.plotHeight);
        this.ctx.closePath();

        this.ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
        this.ctx.fill();
    }

    /**
     * Draw event markers as vertical lines
     */
    drawEventMarkers() {
        if (!this.data.events || this.data.events.length === 0) return;

        for (const event of this.data.events) {
            const eventInfo = SleepEvents.eventTypes[event.type];
            const x = this.getTimeX(event.time);

            // Draw vertical line
            this.ctx.strokeStyle = eventInfo.color;
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([4, 2]);

            this.ctx.beginPath();
            this.ctx.moveTo(x, this.padding.top);
            this.ctx.lineTo(x, this.padding.top + this.plotHeight);
            this.ctx.stroke();

            this.ctx.setLineDash([]);

            // Draw label at top
            if (this.showEventLabels) {
                this.ctx.save();
                this.ctx.translate(x, this.padding.top - 10);
                this.ctx.rotate(-Math.PI / 4);

                this.ctx.fillStyle = eventInfo.color;
                this.ctx.font = '11px sans-serif';
                this.ctx.textAlign = 'right';
                this.ctx.fillText(eventInfo.label, 0, 0);

                this.ctx.restore();
            } else {
                // Just draw icon
                this.ctx.font = '14px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(eventInfo.icon, x, this.padding.top - 5);
            }
        }
    }

    /**
     * Draw circadian rhythm overlay
     */
    drawCircadianOverlay() {
        const sleepOnsetMinutes = Utils.timeToMinutes(this.data.config.sleepOnset || '22:00');
        const totalDuration = this.data.totalMinutes / 60;
        const steps = 100;

        this.ctx.save();
        this.ctx.globalAlpha = 0.15;
        this.ctx.fillStyle = '#FFC107';

        this.ctx.beginPath();
        this.ctx.moveTo(this.padding.left, this.padding.top + this.plotHeight);

        for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * totalDuration * 60;
            const amplitude = SleepPatterns.getCircadianAmplitude(t, sleepOnsetMinutes);

            const x = this.padding.left + (t / this.data.totalMinutes) * this.plotWidth;
            const y = this.padding.top + this.plotHeight - (amplitude * this.plotHeight * 0.3);

            this.ctx.lineTo(x, y);
        }

        this.ctx.lineTo(this.padding.left + this.plotWidth, this.padding.top + this.plotHeight);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * Draw grid
     */
    drawGrid() {
        this.ctx.strokeStyle = '#E1E8ED';
        this.ctx.lineWidth = 1;

        const totalMinutes = this.data.totalMinutes;
        const numLines = Math.floor(totalMinutes / this.timeScale);

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
     * Draw labels
     */
    drawLabels() {
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.font = '12px sans-serif';

        // Y-axis labels (stages) - from top to bottom
        const stages = ['Wake', 'REM', 'N1', 'N2', 'N3'];
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';

        for (let i = 0; i < stages.length; i++) {
            const y = this.padding.top + (i / 5) * this.plotHeight + (this.plotHeight / 10);
            this.ctx.fillText(stages[i], this.padding.left - 10, y);
        }

        // X-axis labels (time)
        const totalMinutes = this.data.totalMinutes;
        const sleepOnset = this.data.config.sleepOnset || '22:00';
        const sleepOnsetMinutes = Utils.timeToMinutes(sleepOnset);
        const numLabels = Math.floor(totalMinutes / this.timeScale) + 1;

        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';

        for (let i = 0; i < numLabels; i++) {
            const minutes = i * this.timeScale;
            const clockTime = Utils.minutesToTime(sleepOnsetMinutes + minutes);
            const x = this.padding.left + (minutes / totalMinutes) * this.plotWidth;

            this.ctx.fillText(clockTime, x, this.padding.top + this.plotHeight + 10);
        }

        // Axis titles
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Time', this.padding.left + this.plotWidth / 2, this.height - 20);

        this.ctx.save();
        this.ctx.translate(20, this.padding.top + this.plotHeight / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Sleep Depth', 0, 0);
        this.ctx.restore();
    }

    /**
     * Handle mouse move for tooltips
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if over plot area
        if (x < this.padding.left || x > this.width - this.padding.right ||
            y < this.padding.top || y > this.height - this.padding.bottom) {
            return;
        }

        // Find closest epoch
        const timeInMinutes = ((x - this.padding.left) / this.plotWidth) * this.data.totalMinutes;
        const epoch = this.data.epochs.find(e =>
            e.time <= timeInMinutes && e.time + e.duration >= timeInMinutes
        );

        if (epoch) {
            this.canvas.title = `${epoch.stage} at ${Utils.formatDuration(epoch.time)}${epoch.event ? ` (${SleepEvents.eventTypes[epoch.event].label})` : ''}`;
        }
    }

    /**
     * Export as image
     */
    exportImage() {
        return this.canvas.toDataURL('image/png');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LineHypnogramRenderer;
}
