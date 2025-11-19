/**
 * Sleep Statistics Calculator
 */

const Statistics = {
    /**
     * Calculate all sleep statistics from epoch data
     */
    calculate(epochs, totalDuration) {
        const stats = {
            totalRecordingTime: totalDuration * 60, // in minutes
            totalSleepTime: 0,
            sleepEfficiency: 0,
            sleepLatency: 0,
            remLatency: 0,
            waso: 0,
            numberOfAwakenings: 0,

            // Stage durations (minutes)
            wakeDuration: 0,
            remDuration: 0,
            n1Duration: 0,
            n2Duration: 0,
            n3Duration: 0,
            wasoDuration: 0,

            // Stage percentages
            wakePercent: 0,
            remPercent: 0,
            n1Percent: 0,
            n2Percent: 0,
            n3Percent: 0,
            wasoPercent: 0,

            // Additional metrics
            arousals: 0,
            arousalIndex: 0
        };

        if (!epochs || epochs.length === 0) {
            return stats;
        }

        // Calculate durations
        let firstSleepEpoch = -1;
        let firstRemEpoch = -1;
        let inSleep = false;
        let wasInSleep = false;

        for (let i = 0; i < epochs.length; i++) {
            const epoch = epochs[i];
            const stage = epoch.stage;

            // Count arousals
            if (epoch.arousal) {
                stats.arousals++;
            }

            // Track stage durations
            switch (stage) {
                case 'W':
                    stats.wakeDuration += epoch.duration;
                    if (inSleep) {
                        // This is a WASO
                        stats.wasoDuration += epoch.duration;
                        if (!wasInSleep) {
                            stats.numberOfAwakenings++;
                            wasInSleep = true;
                        }
                    }
                    break;
                case 'WASO':
                    stats.wasoDuration += epoch.duration;
                    if (!wasInSleep) {
                        stats.numberOfAwakenings++;
                        wasInSleep = true;
                    }
                    break;
                case 'REM':
                    stats.remDuration += epoch.duration;
                    stats.totalSleepTime += epoch.duration;
                    inSleep = true;
                    wasInSleep = false;
                    if (firstRemEpoch === -1) {
                        firstRemEpoch = i;
                    }
                    break;
                case 'N1':
                    stats.n1Duration += epoch.duration;
                    stats.totalSleepTime += epoch.duration;
                    inSleep = true;
                    wasInSleep = false;
                    break;
                case 'N2':
                    stats.n2Duration += epoch.duration;
                    stats.totalSleepTime += epoch.duration;
                    inSleep = true;
                    wasInSleep = false;
                    break;
                case 'N3':
                    stats.n3Duration += epoch.duration;
                    stats.totalSleepTime += epoch.duration;
                    inSleep = true;
                    wasInSleep = false;
                    break;
            }

            // Track first sleep epoch
            if (firstSleepEpoch === -1 && inSleep) {
                firstSleepEpoch = i;
            }
        }

        // Calculate latencies
        stats.sleepLatency = firstSleepEpoch >= 0 ? epochs[firstSleepEpoch].time : 0;
        stats.remLatency = firstRemEpoch >= 0 ? epochs[firstRemEpoch].time : 0;

        // WASO is wake time after sleep onset
        stats.waso = stats.wasoDuration;

        // Calculate percentages
        const totalTime = stats.totalRecordingTime;
        if (totalTime > 0) {
            stats.wakePercent = Utils.round((stats.wakeDuration / totalTime) * 100, 1);
            stats.remPercent = Utils.round((stats.remDuration / totalTime) * 100, 1);
            stats.n1Percent = Utils.round((stats.n1Duration / totalTime) * 100, 1);
            stats.n2Percent = Utils.round((stats.n2Duration / totalTime) * 100, 1);
            stats.n3Percent = Utils.round((stats.n3Duration / totalTime) * 100, 1);
            stats.wasoPercent = Utils.round((stats.wasoDuration / totalTime) * 100, 1);
        }

        // Sleep efficiency: (Total Sleep Time / Time in Bed) × 100
        stats.sleepEfficiency = totalTime > 0 ?
            Utils.round((stats.totalSleepTime / totalTime) * 100, 1) : 0;

        // Arousal index: arousals per hour of sleep
        const sleepHours = stats.totalSleepTime / 60;
        stats.arousalIndex = sleepHours > 0 ?
            Utils.round(stats.arousals / sleepHours, 1) : 0;

        // Round all durations
        stats.totalSleepTime = Utils.round(stats.totalSleepTime, 1);
        stats.sleepLatency = Utils.round(stats.sleepLatency, 1);
        stats.remLatency = Utils.round(stats.remLatency, 1);
        stats.waso = Utils.round(stats.waso, 1);
        stats.wakeDuration = Utils.round(stats.wakeDuration, 1);
        stats.remDuration = Utils.round(stats.remDuration, 1);
        stats.n1Duration = Utils.round(stats.n1Duration, 1);
        stats.n2Duration = Utils.round(stats.n2Duration, 1);
        stats.n3Duration = Utils.round(stats.n3Duration, 1);
        stats.wasoDuration = Utils.round(stats.wasoDuration, 1);

        return stats;
    },

    /**
     * Format statistics for display
     */
    format(stats) {
        return {
            'Total Sleep Time': Utils.formatDuration(stats.totalSleepTime),
            'Sleep Efficiency': `${stats.sleepEfficiency}%`,
            'Sleep Latency': Utils.formatDuration(stats.sleepLatency),
            'REM Latency': Utils.formatDuration(stats.remLatency),
            'WASO': Utils.formatDuration(stats.waso),
            'Awakenings': stats.numberOfAwakenings,
            'Arousal Index': `${stats.arousalIndex}/hr`,

            // Percentages
            'Wake %': `${stats.wakePercent}%`,
            'REM %': `${stats.remPercent}%`,
            'N1 %': `${stats.n1Percent}%`,
            'N2 %': `${stats.n2Percent}%`,
            'N3 %': `${stats.n3Percent}%`,
            'WASO %': `${stats.wasoPercent}%`
        };
    },

    /**
     * Get summary interpretation
     */
    getInterpretation(stats, age) {
        const interpretations = [];

        // Sleep efficiency
        if (stats.sleepEfficiency >= 85) {
            interpretations.push('Excellent sleep efficiency');
        } else if (stats.sleepEfficiency >= 75) {
            interpretations.push('Good sleep efficiency');
        } else if (stats.sleepEfficiency >= 65) {
            interpretations.push('Fair sleep efficiency');
        } else {
            interpretations.push('Poor sleep efficiency');
        }

        // N3 percentage
        const expectedN3 = age < 30 ? 20 : age < 60 ? 15 : 10;
        if (stats.n3Percent >= expectedN3) {
            interpretations.push('Adequate deep sleep');
        } else {
            interpretations.push('Reduced deep sleep');
        }

        // REM percentage
        if (stats.remPercent >= 18 && stats.remPercent <= 25) {
            interpretations.push('Normal REM sleep');
        } else if (stats.remPercent < 18) {
            interpretations.push('Reduced REM sleep');
        } else {
            interpretations.push('Elevated REM sleep');
        }

        return interpretations.join(' • ');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Statistics;
}
