/**
 * Enhanced Continuous-Line Hypnogram Renderer
 * Dramatically visible differences for all conditions
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
        const height = 600; // Increased height for better visibility

        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';

        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;

        this.ctx.scale(dpr, dpr);

        this.width = width;
        this.height = height;
        this.padding = { top: 50, right: 120, bottom: 80, left: 100 };
        this.plotWidth = this.width - this.padding.left - this.padding.right;
        this.plotHeight = this.height - this.padding.top - this.padding.bottom;
    }

    setupEventListeners() {
        window.addEventListener('resize', Utils.debounce(() => {
            this.setupCanvas();
            this.render();
        }, 250));

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

        // Layer order - build up from back to front
        this.drawStageRegions(); // Background stage zones
        if (this.showCircadian) {
            this.drawCircadianOverlay();
        }
        if (this.showGrid) {
            this.drawGrid();
        }
        this.drawAxes();
        this.drawSleepQualityFill(); // ENHANCED: Gradient fill showing sleep quality
        this.drawColoredSleepLine(); // ENHANCED: Multi-colored line by stage
        this.drawDeepSleepHighlights(); // ENHANCED: Highlight N3 periods
        this.drawEventMarkers(); // ENHANCED: Large, prominent event markers
        this.drawCycleMarkers(); // NEW: Show sleep cycle boundaries
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
     * Get stage color with enhanced visibility
     */
    getStageColor(stage, alpha = 1.0) {
        const colors = {
            traditional: {
                'W': `rgba(255, 107, 107, ${alpha})`,
                'WASO': `rgba(255, 139, 148, ${alpha})`,
                'REM': `rgba(78, 205, 196, ${alpha})`,
                'N1': `rgba(149, 225, 211, ${alpha})`,
                'N2': `rgba(69, 183, 209, ${alpha})`,
                'N3': `rgba(26, 83, 92, ${alpha})`
            }
        };

        return colors[this.colorScheme]?.[stage] || `rgba(150, 150, 150, ${alpha})`;
    }

    /**
     * ENHANCED: Draw stage region backgrounds with stronger colors
     */
    drawStageRegions() {
        const stages = [
            { name: 'Wake', color: 'rgba(255, 107, 107, 0.08)' },
            { name: 'REM', color: 'rgba(78, 205, 196, 0.08)' },
            { name: 'N1', color: 'rgba(149, 225, 211, 0.08)' },
            { name: 'N2', color: 'rgba(69, 183, 209, 0.08)' },
            { name: 'N3', color: 'rgba(26, 83, 92, 0.12)' } // Darker for deep sleep
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
     * NEW: Draw gradient fill under line showing sleep quality
     */
    drawSleepQualityFill() {
        const epochs = this.data.epochs;
        if (epochs.length === 0) return;

        this.ctx.save();

        // Create path
        this.ctx.beginPath();
        this.ctx.moveTo(this.getTimeX(epochs[0].time), this.getStageY(epochs[0].stage));

        for (let i = 1; i < epochs.length; i++) {
            const x = this.getTimeX(epochs[i].time);
            const y = this.getStageY(epochs[i].stage);
            this.ctx.lineTo(x, y);
        }

        // Close path to bottom
        this.ctx.lineTo(this.getTimeX(epochs[epochs.length - 1].time), this.padding.top + this.plotHeight);
        this.ctx.lineTo(this.getTimeX(epochs[0].time), this.padding.top + this.plotHeight);
        this.ctx.closePath();

        // Create gradient (deep blue = good sleep, light = poor)
        const gradient = this.ctx.createLinearGradient(
            0, this.padding.top + this.plotHeight, // Bottom (deep sleep)
            0, this.padding.top // Top (wake)
        );
        gradient.addColorStop(0, 'rgba(26, 83, 92, 0.25)'); // Deep sleep - darker
        gradient.addColorStop(0.5, 'rgba(69, 183, 209, 0.15)'); // N2 - medium
        gradient.addColorStop(1, 'rgba(255, 107, 107, 0.08)'); // Wake - light

        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * ENHANCED: Draw color-coded line segments by stage
     */
    drawColoredSleepLine() {
        const epochs = this.data.epochs;
        if (epochs.length === 0) return;

        this.ctx.lineWidth = 4; // Thicker line
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';

        // Draw line in colored segments by stage
        for (let i = 0; i < epochs.length - 1; i++) {
            const epoch = epochs[i];
            const nextEpoch = epochs[i + 1];

            const x1 = this.getTimeX(epoch.time);
            const y1 = this.getStageY(epoch.stage);
            const x2 = this.getTimeX(nextEpoch.time);
            const y2 = this.getStageY(nextEpoch.stage);

            // Color based on current stage
            this.ctx.strokeStyle = this.getStageColor(epoch.stage, 0.9);

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }

        // Add white outline for contrast
        this.ctx.lineWidth = 6;
        this.ctx.globalAlpha = 0.3;
        this.ctx.strokeStyle = '#ffffff';

        this.ctx.beginPath();
        this.ctx.moveTo(this.getTimeX(epochs[0].time), this.getStageY(epochs[0].stage));

        for (let i = 1; i < epochs.length; i++) {
            const x = this.getTimeX(epochs[i].time);
            const y = this.getStageY(epochs[i].stage);
            this.ctx.lineTo(x, y);
        }

        this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;
    }

    /**
     * NEW: Highlight deep sleep (N3) periods with visual emphasis
     */
    drawDeepSleepHighlights() {
        const epochs = this.data.epochs;

        let inN3 = false;
        let n3StartX = 0;

        for (let i = 0; i < epochs.length; i++) {
            const epoch = epochs[i];
            const x = this.getTimeX(epoch.time);
            const y = this.getStageY(epoch.stage);

            if (epoch.stage === 'N3' && !inN3) {
                // Start of N3 period
                inN3 = true;
                n3StartX = x;
            } else if (epoch.stage !== 'N3' && inN3) {
                // End of N3 period - draw highlight box
                inN3 = false;

                const n3Y = this.getStageY('N3');
                const boxHeight = 30;

                this.ctx.fillStyle = 'rgba(26, 83, 92, 0.15)';
                this.ctx.fillRect(
                    n3StartX,
                    n3Y - boxHeight / 2,
                    x - n3StartX,
                    boxHeight
                );

                // Add border
                this.ctx.strokeStyle = 'rgba(26, 83, 92, 0.4)';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(
                    n3StartX,
                    n3Y - boxHeight / 2,
                    x - n3StartX,
                    boxHeight
                );
            }
        }
    }

    /**
     * ENHANCED: Draw large, prominent event markers
     */
    drawEventMarkers() {
        if (!this.data.events || this.data.events.length === 0) return;

        for (const event of this.data.events) {
            const eventInfo = SleepEvents.eventTypes[event.type];
            const x = this.getTimeX(event.time);

            // Draw shadow for depth
            this.ctx.save();
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            this.ctx.shadowBlur = 4;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;

            // Draw thick vertical line
            this.ctx.strokeStyle = eventInfo.color;
            this.ctx.lineWidth = 3; // Thicker line
            this.ctx.setLineDash([]);

            this.ctx.beginPath();
            this.ctx.moveTo(x, this.padding.top);
            this.ctx.lineTo(x, this.padding.top + this.plotHeight);
            this.ctx.stroke();

            this.ctx.restore();

            // Draw large marker circle at top
            this.ctx.fillStyle = eventInfo.color;
            this.ctx.beginPath();
            this.ctx.arc(x, this.padding.top - 10, 6, 0, Math.PI * 2);
            this.ctx.fill();

            // White border on circle
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw label or icon
            if (this.showEventLabels && this.data.events.length < 20) {
                this.ctx.save();
                this.ctx.translate(x + 5, this.padding.top - 5);
                this.ctx.rotate(-Math.PI / 4);

                this.ctx.fillStyle = eventInfo.color;
                this.ctx.font = 'bold 11px sans-serif';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(eventInfo.label, 0, 0);

                this.ctx.restore();
            } else {
                // Just icon for dense events
                this.ctx.font = '16px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(eventInfo.icon, x, this.padding.top - 20);
            }
        }
    }

    /**
     * NEW: Draw sleep cycle boundaries
     */
    drawCycleMarkers() {
        const totalMinutes = this.data.totalMinutes;
        const cycleLength = 90; // 90-minute cycles

        this.ctx.strokeStyle = 'rgba(150, 150, 150, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);

        for (let t = cycleLength; t < totalMinutes; t += cycleLength) {
            const x = this.getTimeX(t);

            this.ctx.beginPath();
            this.ctx.moveTo(x, this.padding.top);
            this.ctx.lineTo(x, this.padding.top + this.plotHeight);
            this.ctx.stroke();

            // Label
            this.ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
            this.ctx.font = '10px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Cycle ${Math.floor(t / cycleLength)}`, x, this.padding.top - 5);
        }

        this.ctx.setLineDash([]);
    }

    /**
     * Draw circadian rhythm overlay
     */
    drawCircadianOverlay() {
        const sleepOnsetMinutes = Utils.timeToMinutes(this.data.config.sleepOnset || '22:00');
        const totalDuration = this.data.totalMinutes / 60;
        const steps = 100;

        this.ctx.save();
        this.ctx.globalAlpha = 0.2; // More visible
        this.ctx.fillStyle = '#FFC107';

        this.ctx.beginPath();
        this.ctx.moveTo(this.padding.left, this.padding.top + this.plotHeight);

        for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * totalDuration * 60;
            const amplitude = SleepPatterns.getCircadianAmplitude(t, sleepOnsetMinutes);

            const x = this.padding.left + (t / this.data.totalMinutes) * this.plotWidth;
            const y = this.padding.top + this.plotHeight - (amplitude * this.plotHeight * 0.35);

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
        this.ctx.lineWidth = 3;

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
        this.ctx.font = 'bold 13px sans-serif';

        // Y-axis labels (stages)
        const stages = ['Wake', 'REM', 'N1', 'N2', 'N3 (Deep)'];
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';

        for (let i = 0; i < stages.length; i++) {
            const y = this.padding.top + (i / 5) * this.plotHeight + (this.plotHeight / 10);

            // Add colored box next to label
            const boxSize = 12;
            const stage = ['W', 'REM', 'N1', 'N2', 'N3'][i];
            this.ctx.fillStyle = this.getStageColor(stage, 0.8);
            this.ctx.fillRect(this.padding.left - 35, y - boxSize / 2, boxSize, boxSize);

            // Border
            this.ctx.strokeStyle = '#2C3E50';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(this.padding.left - 35, y - boxSize / 2, boxSize, boxSize);

            // Label
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.fillText(stages[i], this.padding.left - 40, y);
        }

        // X-axis labels (time)
        const totalMinutes = this.data.totalMinutes;
        const sleepOnset = this.data.config.sleepOnset || '22:00';
        const sleepOnsetMinutes = Utils.timeToMinutes(sleepOnset);
        const numLabels = Math.floor(totalMinutes / this.timeScale) + 1;

        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.font = '12px sans-serif';

        for (let i = 0; i < numLabels; i++) {
            const minutes = i * this.timeScale;
            const clockTime = Utils.minutesToTime(sleepOnsetMinutes + minutes);
            const x = this.padding.left + (minutes / totalMinutes) * this.plotWidth;

            this.ctx.fillText(clockTime, x, this.padding.top + this.plotHeight + 10);
        }

        // Axis titles
        this.ctx.font = 'bold 15px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Time', this.padding.left + this.plotWidth / 2, this.height - 25);

        this.ctx.save();
        this.ctx.translate(25, this.padding.top + this.plotHeight / 2);
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

        if (x < this.padding.left || x > this.width - this.padding.right ||
            y < this.padding.top || y > this.height - this.padding.bottom) {
            return;
        }

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
