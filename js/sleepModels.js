/**
 * Sleep Model Generator
 * Generates realistic sleep stage sequences based on various parameters
 */

const SleepModel = {
    /**
     * Generate complete sleep session data
     */
    generateSleepData(config) {
        const {
            age = 30,
            duration = 8, // hours
            sleepOnset = '22:00',
            fragmentationType = 'none',
            alcoholEffect = 'none',
            showWASO = true
        } = config;

        const ageParams = SleepPatterns.getAgeCategory(age);
        const epochDuration = 0.5; // 30-second epochs in minutes
        const totalMinutes = duration * 60;
        const epochs = [];

        // Sleep latency
        const sleepLatency = SleepPatterns.getSleepLatency(age);

        // Add initial wake period (sleep latency)
        for (let i = 0; i < sleepLatency / epochDuration; i++) {
            epochs.push({
                time: i * epochDuration,
                stage: 'W',
                duration: epochDuration,
                arousal: false
            });
        }

        let currentTime = sleepLatency;
        const sleepOnsetMinutes = Utils.timeToMinutes(sleepOnset);

        // Calculate number of cycles based on remaining time
        const remainingTime = totalMinutes - sleepLatency;
        const numCycles = Math.min(
            Math.floor(remainingTime / ageParams.cycleLength),
            6 // Max 6 cycles
        );

        // Generate each sleep cycle
        for (let cycle = 0; cycle < numCycles; cycle++) {
            const cycleData = this.generateCycle(cycle, ageParams, age, alcoholEffect);
            const cycleEpochs = this.createEpochsFromCycle(
                cycleData,
                currentTime,
                epochDuration,
                sleepOnsetMinutes
            );

            epochs.push(...cycleEpochs);
            currentTime += cycleData.totalDuration;

            // Add brief awakening between cycles (occasional)
            if (cycle < numCycles - 1 && Math.random() < 0.3 * ageParams.fragmentationMultiplier) {
                const wakeTime = Utils.random(0.5, 2);
                for (let i = 0; i < wakeTime / epochDuration; i++) {
                    epochs.push({
                        time: currentTime,
                        stage: showWASO ? 'WASO' : 'W',
                        duration: epochDuration,
                        arousal: false
                    });
                    currentTime += epochDuration;
                }
            }
        }

        // Add final wake period
        while (currentTime < totalMinutes) {
            epochs.push({
                time: currentTime,
                stage: 'W',
                duration: epochDuration,
                arousal: false
            });
            currentTime += epochDuration;
        }

        // Apply fragmentation
        if (fragmentationType !== 'none') {
            this.applyFragmentation(epochs, fragmentationType, ageParams, showWASO);
        }

        return epochs;
    },

    /**
     * Generate a single sleep cycle
     */
    generateCycle(cycleNumber, ageParams, age, alcoholEffect) {
        // Get base cycle template
        const baseCycle = SleepPatterns.typicalCycles[Math.min(cycleNumber, 5)];

        // Apply age-related modifications
        let n3Duration = baseCycle.n3Duration * ageParams.n3Multiplier;
        let remDuration = baseCycle.remDuration;
        let n1Duration = baseCycle.n1Duration;
        let n2Duration = baseCycle.n2Duration;

        // Apply alcohol effects
        if (alcoholEffect !== 'none') {
            const alcohol = SleepPatterns.alcoholEffects[alcoholEffect];
            const isFirstHalf = cycleNumber < 2;

            if (isFirstHalf) {
                n3Duration *= alcohol.n3FirstHalf;
                remDuration *= alcohol.remFirstHalf;
            } else {
                n3Duration *= 0.6; // Reduced N3 in second half
                remDuration *= alcohol.remSecondHalf;
            }
        }

        // Ensure minimum durations
        n3Duration = Math.max(0, n3Duration);
        remDuration = Math.max(5, remDuration);

        // Adjust N2 to compensate for changes
        const targetCycleDuration = ageParams.cycleLength;
        const currentTotal = n1Duration + n2Duration + n3Duration + remDuration;
        const adjustment = targetCycleDuration - currentTotal;
        n2Duration = Math.max(10, n2Duration + adjustment);

        return {
            n1Duration: Utils.round(n1Duration, 1),
            n2Duration: Utils.round(n2Duration, 1),
            n3Duration: Utils.round(n3Duration, 1),
            remDuration: Utils.round(remDuration, 1),
            totalDuration: targetCycleDuration,
            cycleNumber
        };
    },

    /**
     * Create epoch-by-epoch data from cycle summary
     */
    createEpochsFromCycle(cycleData, startTime, epochDuration, sleepOnsetMinutes) {
        const epochs = [];
        let currentTime = startTime;

        // Typical progression: N1 -> N2 -> N3 -> N2 -> REM
        const stages = [
            { stage: 'N1', duration: cycleData.n1Duration },
            { stage: 'N2', duration: cycleData.n2Duration * 0.4 },
            { stage: 'N3', duration: cycleData.n3Duration },
            { stage: 'N2', duration: cycleData.n2Duration * 0.6 },
            { stage: 'REM', duration: cycleData.remDuration }
        ];

        for (const { stage, duration } of stages) {
            if (duration > 0) {
                const numEpochs = Math.round(duration / epochDuration);
                for (let i = 0; i < numEpochs; i++) {
                    epochs.push({
                        time: currentTime,
                        stage: stage,
                        duration: epochDuration,
                        arousal: false,
                        cycleNumber: cycleData.cycleNumber
                    });
                    currentTime += epochDuration;
                }
            }
        }

        return epochs;
    },

    /**
     * Apply fragmentation to sleep data
     */
    applyFragmentation(epochs, fragmentationType, ageParams, showWASO) {
        const applyAging = fragmentationType === 'aging' || fragmentationType === 'combined';
        const applySDB = fragmentationType === 'sdb' || fragmentationType === 'combined';

        // Age-related fragmentation
        if (applyAging) {
            const fragmentationRate = 0.02 * ageParams.fragmentationMultiplier;

            for (let i = 1; i < epochs.length - 1; i++) {
                const epoch = epochs[i];

                // Random arousals to lighter stages
                if (epoch.stage === 'N3' || epoch.stage === 'N2') {
                    if (Math.random() < fragmentationRate) {
                        epoch.arousal = true;

                        // Occasionally cause brief awakening
                        if (Math.random() < 0.3) {
                            epoch.stage = showWASO ? 'WASO' : 'W';
                        } else {
                            epoch.stage = Math.random() < 0.5 ? 'N1' : 'N2';
                        }
                    }
                }
            }
        }

        // Sleep disorder breathing fragmentation
        if (applySDB) {
            const pattern = SleepPatterns.sdbPattern;
            let timeSinceLastArousal = 0;

            for (let i = 0; i < epochs.length; i++) {
                const epoch = epochs[i];
                timeSinceLastArousal += epoch.duration;

                // Check if in affected stage
                if (pattern.affectedStages.includes(epoch.stage)) {
                    const targetInterval = pattern.arousalFrequency +
                        Utils.random(-pattern.arousalVariation, pattern.arousalVariation);

                    // Apply REM multiplier
                    const threshold = epoch.stage === 'REM' ?
                        targetInterval / pattern.remMultiplier :
                        targetInterval;

                    if (timeSinceLastArousal >= threshold / 60) { // Convert to minutes
                        epoch.arousal = true;
                        epoch.event = 'apnea';

                        // Brief arousal to lighter stage
                        if (epoch.stage === 'N3') {
                            epoch.stage = 'N2';
                        } else if (epoch.stage === 'N2' && Math.random() < 0.5) {
                            epoch.stage = 'N1';
                        }

                        timeSinceLastArousal = 0;
                    }
                }
            }
        }
    },

    /**
     * Add micro-arousals throughout the night
     */
    addMicroArousals(epochs, frequency) {
        for (let i = 0; i < epochs.length; i++) {
            if (epochs[i].stage !== 'W' && epochs[i].stage !== 'WASO') {
                if (Math.random() < frequency) {
                    epochs[i].arousal = true;
                }
            }
        }
    },

    /**
     * Smooth transitions between stages (post-processing)
     */
    smoothTransitions(epochs) {
        // Prevent impossible transitions (e.g., W directly to N3)
        for (let i = 1; i < epochs.length; i++) {
            const prev = epochs[i - 1].stage;
            const curr = epochs[i].stage;

            // If jumping from Wake to deep sleep, add transition
            if ((prev === 'W' || prev === 'WASO') && curr === 'N3') {
                epochs[i].stage = 'N1';
            }

            // If jumping from N3 to Wake, add transition
            if (prev === 'N3' && (curr === 'W' || curr === 'WASO')) {
                if (i < epochs.length - 1) {
                    epochs[i].stage = 'N2';
                }
            }
        }

        return epochs;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SleepModel;
}
