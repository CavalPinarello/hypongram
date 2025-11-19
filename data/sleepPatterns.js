/**
 * Sleep Pattern Templates and Age-Related Data
 */

const SleepPatterns = {
    /**
     * Typical sleep cycle structure (90 minutes)
     * Progressive changes across the night
     */
    typicalCycles: [
        // Cycle 1: High N3, short REM
        {
            n1Duration: 5,
            n2Duration: 20,
            n3Duration: 30,
            remDuration: 15,
            cycle: 1
        },
        // Cycle 2: Good N3, moderate REM
        {
            n1Duration: 3,
            n2Duration: 20,
            n3Duration: 25,
            remDuration: 22,
            cycle: 2
        },
        // Cycle 3: Reduced N3, longer REM
        {
            n1Duration: 2,
            n2Duration: 25,
            n3Duration: 15,
            remDuration: 28,
            cycle: 3
        },
        // Cycle 4: Minimal N3, long REM
        {
            n1Duration: 2,
            n2Duration: 30,
            n3Duration: 8,
            remDuration: 30,
            cycle: 4
        },
        // Cycle 5: No N3, longest REM
        {
            n1Duration: 2,
            n2Duration: 28,
            n3Duration: 0,
            remDuration: 35,
            cycle: 5
        },
        // Cycle 6: Light sleep and REM only
        {
            n1Duration: 5,
            n2Duration: 20,
            n3Duration: 0,
            remDuration: 25,
            cycle: 6
        }
    ],

    /**
     * Age-related sleep architecture parameters
     */
    ageParameters: {
        infant: {
            ageRange: [0, 1],
            remPercent: 50,
            n3Multiplier: 0.8,
            fragmentationMultiplier: 2.5,
            cycleLength: 50, // Shorter cycles
            wasoMultiplier: 2.0
        },
        child: {
            ageRange: [2, 12],
            remPercent: 25,
            n3Multiplier: 1.5,
            fragmentationMultiplier: 0.5,
            cycleLength: 90,
            wasoMultiplier: 0.3
        },
        teenager: {
            ageRange: [13, 18],
            remPercent: 22,
            n3Multiplier: 1.3,
            fragmentationMultiplier: 0.6,
            cycleLength: 90,
            wasoMultiplier: 0.5
        },
        youngAdult: {
            ageRange: [19, 35],
            remPercent: 20,
            n3Multiplier: 1.0,
            fragmentationMultiplier: 1.0,
            cycleLength: 90,
            wasoMultiplier: 1.0
        },
        middleAge: {
            ageRange: [36, 60],
            remPercent: 18,
            n3Multiplier: 0.6,
            fragmentationMultiplier: 1.5,
            cycleLength: 90,
            wasoMultiplier: 1.8
        },
        elderly: {
            ageRange: [61, 100],
            remPercent: 15,
            n3Multiplier: 0.3,
            fragmentationMultiplier: 3.0,
            cycleLength: 90,
            wasoMultiplier: 3.5
        }
    },

    /**
     * Get age category parameters
     */
    getAgeCategory(age) {
        for (const [category, params] of Object.entries(this.ageParameters)) {
            const [min, max] = params.ageRange;
            if (age >= min && age <= max) {
                return { category, ...params };
            }
        }
        return { category: 'youngAdult', ...this.ageParameters.youngAdult };
    },

    /**
     * Sleep latency (time to fall asleep) by age
     */
    getSleepLatency(age) {
        if (age < 2) return Utils.random(5, 15); // Infants vary
        if (age < 18) return Utils.random(8, 15); // Children/teens
        if (age < 60) return Utils.random(10, 20); // Adults
        return Utils.random(15, 30); // Elderly
    },

    /**
     * REM latency (time to first REM) by age
     */
    getRemLatency(age) {
        if (age < 2) return Utils.random(30, 60); // Infants enter REM quickly
        if (age < 18) return Utils.random(70, 90);
        if (age < 60) return Utils.random(80, 100);
        return Utils.random(90, 120); // Elderly may have delayed REM
    },

    /**
     * Fragmentation patterns for sleep disorder breathing
     */
    sdbPattern: {
        arousalFrequency: 60, // Arousal every 60 seconds on average
        arousalVariation: 30, // ±30 seconds
        affectedStages: ['N2', 'N3', 'REM'], // Stages where arousals occur
        remMultiplier: 1.5 // More arousals in REM
    },

    /**
     * Alcohol effect parameters
     */
    alcoholEffects: {
        moderate: {
            n3FirstHalf: 1.3, // 30% increase
            remFirstHalf: 0.5, // 50% decrease
            remSecondHalf: 1.5, // 50% increase but fragmented
            wasoMultiplier: 2.0,
            efficiencyPenalty: 10 // -10%
        },
        heavy: {
            n3FirstHalf: 1.5, // 50% increase
            remFirstHalf: 0.3, // 70% decrease
            remSecondHalf: 2.0, // 100% increase but very fragmented
            wasoMultiplier: 3.0,
            efficiencyPenalty: 20 // -20%
        }
    },

    /**
     * Circadian rhythm model (simplified)
     * Returns amplitude (0-1) for given time
     */
    getCircadianAmplitude(timeInMinutes, sleepOnsetMinutes) {
        // Peak melatonin/sleep pressure at 2-4 AM
        const minutesFromMidnight = (sleepOnsetMinutes + timeInMinutes) % 1440;
        const hoursFromMidnight = minutesFromMidnight / 60;

        // Sine wave with peak at 3 AM (hour 3)
        const phase = ((hoursFromMidnight - 3) / 24) * 2 * Math.PI;
        const amplitude = (Math.cos(phase) + 1) / 2; // 0 to 1

        return amplitude;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SleepPatterns;
}
