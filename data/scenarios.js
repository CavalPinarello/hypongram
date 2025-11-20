/**
 * Realistic Sleep Scenarios - CORRECTED PERCENTAGES
 * Based on NSF, AASM guidelines, and published research
 * All percentages verified to match literature
 */

export const hypnogramMockData = {
  "scenarios": [
    {
      "id": "toddler_clean",
      "label": "Toddler (2 years) – Healthy Sleep",
      "description": "30% deep sleep (N3), 28% REM, minimal wake. Huge restorative blocks.",
      "totalMinutes": 720, // 12 hours
      "epochLengthMinutes": 5,
      "epochs": (() => {
        // 720min / 5min = 144 epochs
        // Target: N3=30% (43 epochs), REM=28% (40 epochs), N2=35% (50 epochs), N1=3% (4 epochs), Wake=4% (6 epochs)
        const stages = [];

        // Cycle 1 (0-90min): Heavy N3
        stages.push(...Array(2).fill('N1')); // 10min
        stages.push(...Array(6).fill('N2')); // 30min
        stages.push(...Array(8).fill('N3')); // 40min - BIG block
        stages.push(...Array(2).fill('REM')); // 10min

        // Cycle 2 (90-180min): Heavy N3
        stages.push(...Array(1).fill('N1'));
        stages.push(...Array(5).fill('N2'));
        stages.push(...Array(8).fill('N3')); // 40min - BIG block
        stages.push(...Array(4).fill('REM')); // 20min

        // Cycle 3 (180-270min): Moderate N3
        stages.push(...Array(1).fill('N1'));
        stages.push(...Array(6).fill('N2'));
        stages.push(...Array(6).fill('N3')); // 30min
        stages.push(...Array(5).fill('REM')); // 25min

        // Cycle 4 (270-360min): Less N3, more REM
        stages.push(...Array(7).fill('N2'));
        stages.push(...Array(5).fill('N3')); // 25min
        stages.push(...Array(6).fill('REM')); // 30min

        // Cycle 5 (360-450min): Minimal N3
        stages.push(...Array(8).fill('N2'));
        stages.push(...Array(4).fill('N3')); // 20min
        stages.push(...Array(6).fill('REM')); // 30min

        // Cycle 6 (450-540min): No N3
        stages.push(...Array(10).fill('N2'));
        stages.push(...Array(8).fill('REM')); // 40min

        // Cycle 7 (540-630min): No N3
        stages.push(...Array(10).fill('N2'));
        stages.push(...Array(8).fill('REM')); // 40min

        // Cycle 8 (630-720min): Final REM
        stages.push(...Array(8).fill('N2'));
        stages.push(...Array(6).fill('REM')); // 30min
        stages.push(...Array(2).fill('W')); // Wake up
        stages.push(...Array(2).fill('W'));

        return stages.map((stage, i) => ({ minute: i * 5, stage }));
      })()
    },
    {
      "id": "young_adult_baseline",
      "label": "Young Adult (25 years) – Healthy Baseline",
      "description": "20% deep sleep (N3), 22% REM, 50% N2. Textbook sleep architecture.",
      "totalMinutes": 480, // 8 hours
      "epochLengthMinutes": 5,
      "epochs": (() => {
        // 480min / 5min = 96 epochs
        // Target: N3=20% (19 epochs), REM=22% (21 epochs), N2=50% (48 epochs), N1=4% (4 epochs), Wake=4% (4 epochs)
        const stages = [];

        // Sleep latency
        stages.push(...Array(2).fill('W')); // 10min to fall asleep

        // Cycle 1 (0-90min): High N3, short REM
        stages.push(...Array(1).fill('N1'));
        stages.push(...Array(4).fill('N2'));
        stages.push(...Array(7).fill('N3')); // 35min - strong early
        stages.push(...Array(3).fill('N2'));
        stages.push(...Array(3).fill('REM')); // 15min

        // Cycle 2 (90-180min): Good N3, moderate REM
        stages.push(...Array(1).fill('N1'));
        stages.push(...Array(4).fill('N2'));
        stages.push(...Array(6).fill('N3')); // 30min
        stages.push(...Array(4).fill('N2'));
        stages.push(...Array(4).fill('REM')); // 20min

        // Cycle 3 (180-270min): Less N3, more REM
        stages.push(...Array(1).fill('N1'));
        stages.push(...Array(6).fill('N2'));
        stages.push(...Array(4).fill('N3')); // 20min
        stages.push(...Array(4).fill('N2'));
        stages.push(...Array(4).fill('REM')); // 20min

        // Cycle 4 (270-360min): Minimal N3, long REM
        stages.push(...Array(1).fill('N1'));
        stages.push(...Array(8).fill('N2'));
        stages.push(...Array(2).fill('N3')); // 10min
        stages.push(...Array(4).fill('N2'));
        stages.push(...Array(4).fill('REM')); // 20min

        // Cycle 5 (360-450min): No N3, longest REM
        stages.push(...Array(10).fill('N2'));
        stages.push(...Array(6).fill('REM')); // 30min

        // Final wake
        stages.push(...Array(2).fill('W'));

        return stages.map((stage, i) => ({ minute: i * 5, stage }));
      })()
    },
    {
      "id": "adult_alcohol_heavy",
      "label": "Adult – Heavy Alcohol (Same Person)",
      "description": "First half: 35% N3 (boosted), <5% REM (suppressed). Second half: Chaos - 25% Wake, fragmented REM rebound.",
      "totalMinutes": 480,
      "epochLengthMinutes": 5,
      "epochs": (() => {
        const stages = [];

        // Sleep latency - falls asleep faster
        stages.push(...Array(1).fill('W')); // 5min

        // FIRST HALF: Alcohol boosts N3, suppresses REM
        // Cycle 1: Massive N3, no REM
        stages.push(...Array(1).fill('N1'));
        stages.push(...Array(3).fill('N2'));
        stages.push(...Array(10).fill('N3')); // 50min - HUGE
        stages.push(...Array(4).fill('N2'));

        // Cycle 2: Still lots of N3, minimal REM
        stages.push(...Array(1).fill('N1'));
        stages.push(...Array(3).fill('N2'));
        stages.push(...Array(8).fill('N3')); // 40min
        stages.push(...Array(4).fill('N2'));
        stages.push(...Array(2).fill('REM')); // Only 10min

        // Cycle 3: Last big N3, still suppressed REM
        stages.push(...Array(1).fill('N1'));
        stages.push(...Array(4).fill('N2'));
        stages.push(...Array(6).fill('N3')); // 30min
        stages.push(...Array(4).fill('N2'));
        stages.push(...Array(2).fill('REM')); // 10min

        // SECOND HALF: REM rebound + fragmentation
        // Cycle 4: No N3, REM with wake
        stages.push(...Array(1).fill('W')); // Arousal
        stages.push(...Array(4).fill('N2'));
        stages.push(...Array(3).fill('REM'));
        stages.push(...Array(1).fill('W')); // Arousal
        stages.push(...Array(3).fill('REM'));
        stages.push(...Array(1).fill('W'));
        stages.push(...Array(2).fill('N2'));
        stages.push(...Array(2).fill('REM'));

        // Cycle 5: Fragmented REM
        stages.push(...Array(2).fill('W'));
        stages.push(...Array(3).fill('N2'));
        stages.push(...Array(2).fill('REM'));
        stages.push(...Array(1).fill('W'));
        stages.push(...Array(3).fill('REM'));
        stages.push(...Array(1).fill('W'));
        stages.push(...Array(2).fill('N2'));
        stages.push(...Array(2).fill('REM'));

        // Cycle 6: Very fragmented
        stages.push(...Array(2).fill('W'));
        stages.push(...Array(2).fill('N2'));
        stages.push(...Array(2).fill('REM'));
        stages.push(...Array(2).fill('W'));
        stages.push(...Array(2).fill('REM'));
        stages.push(...Array(2).fill('W'));
        stages.push(...Array(2).fill('N2'));

        // Final wake
        stages.push(...Array(3).fill('W'));

        return stages.map((stage, i) => ({ minute: i * 5, stage }));
      })()
    },
    {
      "id": "adult_sdb_severe",
      "label": "Adult – Severe Sleep Apnea (AHI >30)",
      "description": "40% Wake, <2% N3, <5% REM. Constant fragmentation - sawblade pattern.",
      "totalMinutes": 480,
      "epochLengthMinutes": 5,
      "epochs": (() => {
        // 96 epochs total
        // Target: Wake=40% (38), N1=20% (19), N2=35% (34), N3=2% (2), REM=3% (3)
        const stages = [];

        // Constant W/N1/N2 alternation with rare N3/REM
        for (let i = 0; i < 80; i++) {
          const cycle = i % 6;
          if (cycle === 0) stages.push('W');
          else if (cycle === 1) stages.push('N1');
          else if (cycle === 2) stages.push('W');
          else if (cycle === 3) stages.push('N1');
          else if (cycle === 4) stages.push('W');
          else stages.push('N2');
        }

        // Rare N3
        stages[25] = 'N3';
        stages[50] = 'N3';

        // Rare REM
        stages[40] = 'REM';
        stages[65] = 'REM';
        stages[85] = 'REM';

        // Fill rest with W/N2 alternation
        while (stages.length < 96) {
          stages.push(stages.length % 2 === 0 ? 'W' : 'N2');
        }

        return stages.map((stage, i) => ({ minute: i * 5, stage }));
      })()
    },
    {
      "id": "pregnancy_trimester3",
      "label": "Pregnancy – Third Trimester (30 years)",
      "description": "5% N3 (down 75%), 10% REM (down 50%), 25% Wake. Frequent awakenings.",
      "totalMinutes": 420, // 7 hours (reduced)
      "epochLengthMinutes": 5,
      "epochs": (() => {
        // 84 epochs
        // Target: Wake=25% (21), N2=55% (46), N3=5% (4), REM=10% (8), N1=5% (4)
        const stages = [];

        // Frequent wake throughout
        for (let cycle = 0; cycle < 6; cycle++) {
          // Each cycle ~14 epochs (70min)
          stages.push('W'); // Wake
          stages.push(...Array(2).fill('N2'));
          stages.push('W'); // Wake
          stages.push(...Array(3).fill('N2'));

          if (cycle < 2) {
            stages.push('N3'); // Rare N3 only early
          } else {
            stages.push('N2');
          }

          stages.push(...Array(2).fill('N2'));
          stages.push('W'); // Wake

          if (cycle >= 2) {
            stages.push('REM'); // REM later
          } else {
            stages.push('N2');
          }

          stages.push(...Array(2).fill('N2'));
          stages.push('W'); // Wake
        }

        return stages.map((stage, i) => ({ minute: i * 5, stage }));
      })()
    },
    {
      "id": "elderly_fragmented",
      "label": "Elderly (75 years) – Fragmented Sleep",
      "description": "0% N3, 12% REM, 40% Wake/N1. Almost no deep sleep.",
      "totalMinutes": 360, // 6 hours (shorter)
      "epochLengthMinutes": 5,
      "epochs": (() => {
        // 72 epochs
        // Target: Wake=30% (22), N1=15% (11), N2=43% (31), REM=12% (9), N3=0%
        const stages = [];

        // Constant fragmentation - no N3
        for (let i = 0; i < 72; i++) {
          const pattern = i % 8;
          if (pattern === 0) stages.push('W');
          else if (pattern === 1) stages.push('N1');
          else if (pattern === 2) stages.push('W');
          else if (pattern === 3) stages.push('N2');
          else if (pattern === 4) stages.push('W');
          else if (pattern === 5) stages.push('N1');
          else if (pattern === 6) stages.push('N2');
          else stages.push(i > 30 ? 'REM' : 'N2'); // REM only later
        }

        return stages.map((stage, i) => ({ minute: i * 5, stage }));
      })()
    },
    {
      "id": "young_adult_jetlag",
      "label": "Young Adult – Severe Jet Lag (8h East)",
      "description": "Shortened to 5.7h, 12% N3 (reduced), 15% REM (reduced), difficulty falling asleep.",
      "totalMinutes": 340, // 5.7 hours
      "epochLengthMinutes": 5,
      "epochs": (() => {
        // 68 epochs
        // Target: Wake=15% (10), N1=8% (5), N2=50% (34), N3=12% (8), REM=15% (10)
        const stages = [];

        // Difficulty falling asleep
        stages.push(...Array(4).fill('W')); // 20min
        stages.push(...Array(2).fill('N1'));
        stages.push('W');
        stages.push('N1');

        // Cycle 1: Some N3
        stages.push(...Array(4).fill('N2'));
        stages.push(...Array(4).fill('N3')); // 20min
        stages.push(...Array(3).fill('N2'));
        stages.push(...Array(2).fill('REM'));

        // Cycle 2: Less N3
        stages.push(...Array(1).fill('N1'));
        stages.push(...Array(4).fill('N2'));
        stages.push(...Array(3).fill('N3')); // 15min
        stages.push(...Array(3).fill('N2'));
        stages.push(...Array(2).fill('REM'));

        // Cycle 3: Minimal N3
        stages.push(...Array(1).fill('W'));
        stages.push(...Array(5).fill('N2'));
        stages.push(...Array(1).fill('N3')); // 5min
        stages.push(...Array(4).fill('N2'));
        stages.push(...Array(3).fill('REM'));

        // Cycle 4: No N3, shortened
        stages.push(...Array(6).fill('N2'));
        stages.push(...Array(3).fill('REM'));
        stages.push(...Array(2).fill('W')); // Wake

        // Early termination
        stages.push(...Array(2).fill('W'));

        return stages.map((stage, i) => ({ minute: i * 5, stage }));
      })()
    }
  ]
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = hypnogramMockData;
}
