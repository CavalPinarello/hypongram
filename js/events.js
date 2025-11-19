/**
 * Sleep Events System
 * Handles awakenings and arousals with specific causes
 */

const SleepEvents = {
    /**
     * Event types with colors and descriptions
     */
    eventTypes: {
        urination: {
            color: '#FFB74D',
            label: 'Urination',
            icon: '💧',
            causesBriefAwakening: true,
            typicalDuration: 5 // minutes
        },
        partnerSnoring: {
            color: '#EF5350',
            label: 'Partner Snoring',
            icon: '😴',
            causesBriefAwakening: false,
            typicalDuration: 0.5
        },
        partnerMovement: {
            color: '#FF7043',
            label: 'Partner Movement',
            icon: '🔄',
            causesBriefAwakening: false,
            typicalDuration: 0.5
        },
        selfSnoring: {
            color: '#F44336',
            label: 'Apnea/Snoring',
            icon: '🫁',
            causesBriefAwakening: false,
            typicalDuration: 0.5
        },
        hotFlash: {
            color: '#FF6B9D',
            label: 'Hot Flash',
            icon: '🔥',
            causesBriefAwakening: true,
            typicalDuration: 3
        },
        noise: {
            color: '#9E9E9E',
            label: 'Environmental Noise',
            icon: '🔊',
            causesBriefAwakening: false,
            typicalDuration: 0.5
        },
        spontaneous: {
            color: '#B0BEC5',
            label: 'Spontaneous Arousal',
            icon: '•',
            causesBriefAwakening: false,
            typicalDuration: 0.5
        }
    },

    /**
     * Generate urination events based on age, sex, and modifiers
     */
    generateUrinationEvents(config, totalMinutes) {
        const events = [];
        const { age, sex, pregnancy } = config;

        // Base probability per hour
        let hourlyProbability = 0.05; // 5% baseline

        // Age modifiers
        if (age > 60) hourlyProbability = 0.25;
        else if (age > 45) hourlyProbability = 0.15;
        else if (age > 30) hourlyProbability = 0.08;

        // Sex modifiers
        if (sex === 'male' && age > 50) {
            hourlyProbability *= 1.5; // Prostate issues
        }

        // Pregnancy dramatically increases nocturia
        if (pregnancy === 'first' || pregnancy === 'third') {
            hourlyProbability = 0.5; // Multiple times per night
        }

        // Generate events
        // More likely in second half of night (bladder fills)
        for (let t = 60; t < totalMinutes; t += 30) {
            const hourFactor = t / 60;
            const adjustedProb = hourlyProbability * (1 + hourFactor * 0.3);

            if (Math.random() < adjustedProb / 2) { // Divide by 2 since we check every 30min
                events.push({
                    time: t + Utils.random(-15, 15),
                    type: 'urination',
                    duration: Utils.random(3, 8)
                });
            }
        }

        return events;
    },

    /**
     * Generate partner disturbance events
     */
    generatePartnerEvents(config, totalMinutes) {
        const events = [];
        const { partnerSnoring, partnerMovement } = config;

        if (partnerSnoring && partnerSnoring !== 'none') {
            const frequency = partnerSnoring === 'mild' ? 0.1 :
                            partnerSnoring === 'moderate' ? 0.3 :
                            0.6; // severe

            for (let t = 0; t < totalMinutes; t += 10) {
                if (Math.random() < frequency) {
                    events.push({
                        time: t + Utils.random(-5, 5),
                        type: 'partnerSnoring',
                        duration: 0.5
                    });
                }
            }
        }

        if (partnerMovement && partnerMovement !== 'none') {
            const frequency = partnerMovement === 'low' ? 0.05 :
                            partnerMovement === 'moderate' ? 0.15 :
                            0.3; // high

            for (let t = 0; t < totalMinutes; t += 20) {
                if (Math.random() < frequency) {
                    events.push({
                        time: t + Utils.random(-10, 10),
                        type: 'partnerMovement',
                        duration: 0.5
                    });
                }
            }
        }

        return events;
    },

    /**
     * Generate sleep-disordered breathing events
     */
    generateSDBEvents(config, totalMinutes) {
        const events = [];
        const { sdbSeverity } = config;

        if (!sdbSeverity || sdbSeverity === 'none') return events;

        // AHI (Apnea-Hypopnea Index): events per hour
        const ahi = sdbSeverity === 'mild' ? 8 :
                    sdbSeverity === 'moderate' ? 20 :
                    40; // severe

        const intervalMinutes = 60 / ahi;

        for (let t = 30; t < totalMinutes; t += intervalMinutes) {
            const jitter = Utils.random(-intervalMinutes * 0.3, intervalMinutes * 0.3);
            events.push({
                time: t + jitter,
                type: 'selfSnoring',
                duration: 0.5
            });
        }

        return events;
    },

    /**
     * Generate menopause hot flash events
     */
    generateHotFlashEvents(config, totalMinutes) {
        const events = [];
        const { menopause } = config;

        if (!menopause) return events;

        // Hot flashes more common in early night
        for (let t = 60; t < totalMinutes; t += 60) {
            const probability = SleepArchitecture.menopauseModifier.hotFlashProbability;

            if (Math.random() < probability) {
                events.push({
                    time: t + Utils.random(-20, 20),
                    type: 'hotFlash',
                    duration: Utils.random(2, 5)
                });
            }
        }

        return events;
    },

    /**
     * Generate all events for a sleep session
     */
    generateAllEvents(config, totalMinutes) {
        const events = [];

        events.push(...this.generateUrinationEvents(config, totalMinutes));
        events.push(...this.generatePartnerEvents(config, totalMinutes));
        events.push(...this.generateSDBEvents(config, totalMinutes));
        events.push(...this.generateHotFlashEvents(config, totalMinutes));

        // Sort by time
        events.sort((a, b) => a.time - b.time);

        return events;
    },

    /**
     * Apply events to epoch data
     * Modifies epochs array to reflect awakenings/arousals
     */
    applyEventsToEpochs(epochs, events) {
        for (const event of events) {
            const eventInfo = this.eventTypes[event.type];

            // Find epochs at this time
            const affectedEpochs = epochs.filter(e =>
                e.time <= event.time && e.time + e.duration >= event.time
            );

            for (const epoch of affectedEpochs) {
                epoch.event = event.type;

                // Brief awakenings cause stage change
                if (eventInfo.causesBriefAwakening) {
                    // Wake up for the event
                    if (epoch.stage !== 'W') {
                        epoch.previousStage = epoch.stage;
                        epoch.stage = 'WASO';
                    }
                } else {
                    // Just mark as arousal (lightens sleep)
                    epoch.arousal = true;

                    // May lighten stage
                    if (epoch.stage === 'N3' && Math.random() < 0.7) {
                        epoch.stage = 'N2';
                    } else if (epoch.stage === 'N2' && Math.random() < 0.3) {
                        epoch.stage = 'N1';
                    }
                }
            }
        }

        return epochs;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SleepEvents;
}
