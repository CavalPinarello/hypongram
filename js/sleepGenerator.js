/**
 * Sleep Generator - Literature-Based Architecture
 * Generates scientifically accurate sleep patterns
 */

const SleepGenerator = {
    /**
     * Generate complete sleep session
     */
    generate(config) {
        const {
            age = 30,
            sex = 'male',
            duration = null, // If null, use recommended
            sleepOnset = '22:00',
            pregnancy = 'none',
            menopause = false,
            alcohol = 'none',
            jetLag = 0,
            sdbSeverity = 'none',
            partnerSnoring = 'none',
            partnerMovement = 'none'
        } = config;

        // Get baseline architecture for age
        const ageCategory = SleepArchitecture.getAgeCategory(age);
        const baseDistribution = SleepArchitecture.getStageDistribution(age);

        // Determine total sleep time
        let totalDuration = duration;
        if (!totalDuration) {
            const recommended = SleepArchitecture.sleepDuration[ageCategory];
            totalDuration = recommended ? recommended.default : 8;
        }

        // Apply sex modifiers
        const sexMod = SleepArchitecture.sexModifiers[sex];
        totalDuration *= sexMod.tstMultiplier;

        // Apply pregnancy modifiers
        if (pregnancy !== 'none' && SleepArchitecture.pregnancyModifiers[pregnancy]) {
            const pregMod = SleepArchitecture.pregnancyModifiers[pregnancy];
            totalDuration *= pregMod.tstMultiplier;
        }

        // Calculate cycles
        const cycleLength = 90; // minutes
        const totalMinutes = totalDuration * 60;
        const numCycles = Math.max(4, Math.min(6, Math.round(totalMinutes / cycleLength)));

        // Generate baseline hypnogram
        let epochs = this.generateBaselineHypnogram({
            totalMinutes,
            numCycles,
            cycleLength,
            distribution: baseDistribution,
            age,
            sex
        });

        // Apply modifiers
        epochs = this.applyAlcoholEffect(epochs, alcohol, numCycles);
        epochs = this.applyPregnancyEffect(epochs, pregnancy);
        epochs = this.applyMenopauseEffect(epochs, menopause);
        epochs = this.applyJetLagEffect(epochs, jetLag);

        // Generate and apply events
        const events = SleepEvents.generateAllEvents(config, totalMinutes);
        epochs = SleepEvents.applyEventsToEpochs(epochs, events);

        return {
            epochs,
            events,
            config,
            totalMinutes
        };
    },

    /**
     * Generate baseline hypnogram with proper cycle structure
     */
    generateBaselineHypnogram(params) {
        const { totalMinutes, numCycles, cycleLength, distribution, age } = params;
        const epochs = [];
        const epochDuration = 0.5; // 30-second epochs

        // Sleep latency (time to fall asleep)
        const sleepLatency = this.getSleepLatency(age);

        // Add wake period (sleep latency)
        for (let t = 0; t < sleepLatency; t += epochDuration) {
            epochs.push({
                time: t,
                stage: 'W',
                duration: epochDuration,
                arousal: false
            });
        }

        let currentTime = sleepLatency;

        // Generate each cycle with proper weighting
        for (let cycle = 0; cycle < numCycles; cycle++) {
            const cycleEpochs = this.generateCycle({
                cycleNumber: cycle,
                totalCycles: numCycles,
                cycleLength,
                distribution,
                startTime: currentTime,
                epochDuration
            });

            epochs.push(...cycleEpochs);
            currentTime += cycleLength;
        }

        // Trim to exact duration
        const trimmedEpochs = epochs.filter(e => e.time < totalMinutes);

        // Add final wake if we end before total duration
        while (currentTime < totalMinutes) {
            epochs.push({
                time: currentTime,
                stage: 'W',
                duration: epochDuration,
                arousal: false
            });
            currentTime += epochDuration;
        }

        return trimmedEpochs;
    },

    /**
     * Generate a single sleep cycle
     * Early cycles: more N3, less REM
     * Late cycles: little/no N3, more REM
     */
    generateCycle(params) {
        const { cycleNumber, totalCycles, cycleLength, distribution, startTime, epochDuration } = params;
        const epochs = [];

        // Calculate N3 and REM weighting for this cycle
        // N3 heavily front-loaded, REM back-loaded
        const cyclePosition = cycleNumber / (totalCycles - 1); // 0 to 1

        // N3 weight: high early (cycle 0-1), minimal late (cycle 4-5)
        const n3Weight = Math.max(0, 1 - cyclePosition * 1.2);

        // REM weight: low early, high late
        const remWeight = 0.3 + cyclePosition * 0.7;

        // Calculate target durations for this cycle
        const baseN3 = (distribution.n3 / 100) * cycleLength;
        const baseREM = (distribution.rem / 100) * cycleLength;

        const n3Duration = baseN3 * n3Weight * (totalCycles / 5); // Normalize to 5 cycles
        const remDuration = baseREM * remWeight * (totalCycles / 5);

        // Remaining time goes to N2
        const n1Duration = 2; // Brief transition
        const n2Duration = cycleLength - n1Duration - n3Duration - remDuration;

        // Build cycle progression: N1 → N2 → N3 → N2 → REM
        let currentTime = startTime;

        // N1 (sleep onset or brief transition)
        if (cycleNumber === 0) {
            currentTime = this.addStageEpochs(epochs, 'N1', n1Duration * 2, currentTime, epochDuration);
        } else {
            currentTime = this.addStageEpochs(epochs, 'N1', n1Duration, currentTime, epochDuration);
        }

        // N2 (descending)
        currentTime = this.addStageEpochs(epochs, 'N2', n2Duration * 0.4, currentTime, epochDuration);

        // N3 (deep sleep)
        if (n3Duration > 0) {
            currentTime = this.addStageEpochs(epochs, 'N3', n3Duration, currentTime, epochDuration);
        }

        // N2 (ascending)
        currentTime = this.addStageEpochs(epochs, 'N2', n2Duration * 0.6, currentTime, epochDuration);

        // REM
        currentTime = this.addStageEpochs(epochs, 'REM', remDuration, currentTime, epochDuration);

        return epochs;
    },

    /**
     * Add epochs of a specific stage
     */
    addStageEpochs(epochs, stage, duration, startTime, epochDuration) {
        const numEpochs = Math.round(duration / epochDuration);
        let currentTime = startTime;

        for (let i = 0; i < numEpochs; i++) {
            epochs.push({
                time: currentTime,
                stage,
                duration: epochDuration,
                arousal: false
            });
            currentTime += epochDuration;
        }

        return currentTime;
    },

    /**
     * Get sleep latency by age
     */
    getSleepLatency(age) {
        if (age < 2) return Utils.random(5, 15);
        if (age < 18) return Utils.random(8, 15);
        if (age < 60) return Utils.random(10, 20);
        return Utils.random(15, 30);
    },

    /**
     * Apply alcohol effect
     * First half: +N3, -REM
     * Second half: -N3, +REM, +WASO
     */
    applyAlcoholEffect(epochs, alcoholLevel, numCycles) {
        if (alcoholLevel === 'none') return epochs;

        const multipliers = {
            light: { n3First: 1.2, remFirst: 0.7, remSecond: 1.3, wasoSecond: 1.5 },
            moderate: { n3First: 1.4, remFirst: 0.5, remSecond: 1.6, wasoSecond: 2.0 },
            heavy: { n3First: 1.6, remFirst: 0.3, remSecond: 1.9, wasoSecond: 2.5 }
        };

        const mult = multipliers[alcoholLevel];
        if (!mult) return epochs;

        const halfwayCycle = Math.floor(numCycles / 2);

        for (let i = 0; i < epochs.length; i++) {
            const epoch = epochs[i];
            const cycleNum = Math.floor(i / (epochs.length / numCycles));

            if (cycleNum < halfwayCycle) {
                // First half: more N3, less REM
                if (epoch.stage === 'REM' && Math.random() > mult.remFirst) {
                    epoch.stage = 'N2';
                }
            } else {
                // Second half: less N3, more REM, more WASO
                if (epoch.stage === 'N3' && Math.random() > 0.6) {
                    epoch.stage = 'N2';
                }
                if (epoch.stage === 'N2' && Math.random() < (mult.wasoSecond - 1) * 0.02) {
                    epoch.stage = 'WASO';
                }
            }
        }

        return epochs;
    },

    /**
     * Apply pregnancy effect
     */
    applyPregnancyEffect(epochs, pregnancy) {
        if (pregnancy === 'none') return epochs;

        const modifier = SleepArchitecture.pregnancyModifiers[pregnancy];
        if (!modifier) return epochs;

        for (let epoch of epochs) {
            // Reduce N3 and REM per trimester
            if (epoch.stage === 'N3' && Math.random() > modifier.n3Multiplier) {
                epoch.stage = 'N2';
            }
            if (epoch.stage === 'REM' && Math.random() > modifier.remMultiplier) {
                epoch.stage = 'N2';
            }
        }

        return epochs;
    },

    /**
     * Apply menopause effect
     */
    applyMenopauseEffect(epochs, menopause) {
        if (!menopause) return epochs;

        const modifier = SleepArchitecture.menopauseModifier;

        for (let epoch of epochs) {
            // Reduce N3
            if (epoch.stage === 'N3' && Math.random() > modifier.n3Multiplier) {
                epoch.stage = 'N2';
            }

            // Add more arousals
            if (epoch.stage !== 'W' && Math.random() < 0.05 * modifier.fragmentationMultiplier) {
                epoch.arousal = true;
            }
        }

        return epochs;
    },

    /**
     * Apply jet lag effect
     * Reduces TST, shifts REM, increases fragmentation
     */
    applyJetLagEffect(epochs, jetLagHours) {
        if (jetLagHours === 0) return epochs;

        const severity = Math.abs(jetLagHours) / 12; // 0 to 1

        // Increase fragmentation
        for (let epoch of epochs) {
            if (Math.random() < severity * 0.1) {
                if (epoch.stage !== 'W') {
                    epoch.stage = Math.random() < 0.5 ? 'N1' : 'WASO';
                }
            }
        }

        return epochs;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SleepGenerator;
}
