/**
 * Sleep Architecture Parameters - Literature-Based
 * Based on NSF, AASM, and published sleep research
 */

const SleepArchitecture = {
    /**
     * Recommended total sleep time by age (hours per 24h)
     * Source: National Sleep Foundation, AASM guidelines
     */
    sleepDuration: {
        newborn: { min: 14, max: 17, default: 15.5 },      // 0-3 months
        infant: { min: 12, max: 16, default: 14 },         // 4-12 months
        toddler: { min: 11, max: 14, default: 12.5 },      // 1-2 years
        youngChild: { min: 10, max: 13, default: 11.5 },   // 3-5 years
        schoolAge: { min: 9, max: 12, default: 10.5 },     // 6-12 years
        teen: { min: 8, max: 10, default: 9 },             // 13-17 years
        youngAdult: { min: 7, max: 9, default: 8 },        // 18-25 years
        adult: { min: 7, max: 9, default: 8 },             // 26-64 years
        olderAdult: { min: 7, max: 8, default: 7.5 }       // 65+ years
    },

    /**
     * Stage distribution percentages by age group
     * Values represent typical healthy ranges
     */
    stageDistribution: {
        toddler: {
            wake: 2, n1: 3, n2: 35, n3: 30, rem: 28, waso: 2
        },
        youngChild: {
            wake: 2, n1: 3, n2: 42, n3: 25, rem: 23, waso: 5
        },
        schoolAge: {
            wake: 2, n1: 4, n2: 47, n3: 22, rem: 22, waso: 3
        },
        teen: {
            wake: 3, n1: 4, n2: 50, n3: 18, rem: 22, waso: 3
        },
        youngAdult: {
            wake: 2, n1: 4, n2: 50, n3: 20, rem: 22, waso: 2
        },
        adult: {
            wake: 3, n1: 5, n2: 55, n3: 15, rem: 20, waso: 2
        },
        middleAge: {
            wake: 5, n1: 8, n2: 58, n3: 7, rem: 20, waso: 2
        },
        olderAdult: {
            wake: 8, n1: 10, n2: 62, n3: 3, rem: 15, waso: 2
        }
    },

    /**
     * Sex-specific modifiers
     * Women tend to have slightly more TST, more SWS, but more insomnia complaints
     */
    sexModifiers: {
        male: {
            tstMultiplier: 1.0,
            n3Multiplier: 1.0,
            wasoMultiplier: 1.0,
            fragmentationMultiplier: 1.0
        },
        female: {
            tstMultiplier: 1.05,    // Slightly longer total sleep
            n3Multiplier: 1.1,      // More slow-wave sleep
            wasoMultiplier: 1.2,    // More awakenings (complaints vs objective)
            fragmentationMultiplier: 1.15
        }
    },

    /**
     * Pregnancy modifiers by trimester
     */
    pregnancyModifiers: {
        none: null,
        first: {
            tstMultiplier: 1.1,
            n3Multiplier: 1.2,
            remMultiplier: 0.9,
            wasoMultiplier: 1.5,
            fragmentationMultiplier: 1.4
        },
        second: {
            tstMultiplier: 1.0,
            n3Multiplier: 1.0,
            remMultiplier: 1.0,
            wasoMultiplier: 1.3,
            fragmentationMultiplier: 1.2
        },
        third: {
            tstMultiplier: 0.95,
            n3Multiplier: 0.7,
            remMultiplier: 0.8,
            wasoMultiplier: 2.5,
            fragmentationMultiplier: 2.0
        }
    },

    /**
     * Menopause modifier
     */
    menopauseModifier: {
        n3Multiplier: 0.85,
        wasoMultiplier: 1.8,
        fragmentationMultiplier: 1.7,
        hotFlashProbability: 0.3  // 30% chance per hour
    },

    /**
     * Get age category from age
     */
    getAgeCategory(age) {
        if (age < 0.25) return 'newborn';
        if (age < 1) return 'infant';
        if (age <= 2) return 'toddler';
        if (age <= 5) return 'youngChild';
        if (age <= 12) return 'schoolAge';
        if (age <= 17) return 'teen';
        if (age <= 25) return 'youngAdult';
        if (age <= 45) return 'adult';
        if (age <= 64) return 'middleAge';
        return 'olderAdult';
    },

    /**
     * Get appropriate stage distribution for age
     */
    getStageDistribution(age) {
        const category = this.getAgeCategory(age);

        // For very young ages not in our distribution map, use toddler
        if (!this.stageDistribution[category]) {
            return this.stageDistribution.toddler;
        }

        return this.stageDistribution[category];
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SleepArchitecture;
}
