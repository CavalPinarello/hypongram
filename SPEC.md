# Sleep Staging Hypnogram Visualization Tool - Technical Specification

## 1. Project Overview

A web-based interactive sleep hypnogram visualization tool that displays sleep stages over time with various modifiable parameters to demonstrate healthy sleep patterns, age-related changes, circadian rhythm influence, sleep fragmentation, and alcohol effects.

## 2. Core Features

### 2.1 Sleep Stage Visualization
- **Traditional AASM Sleep Stages:**
  - Wake (W)
  - REM (Rapid Eye Movement)
  - N1 (Light Sleep - Stage 1)
  - N2 (Light Sleep - Stage 2)
  - N3 (Deep Sleep / Slow Wave Sleep)
  - WASO (Wake After Sleep Onset)

### 2.2 Visualization Scenarios

#### 2.2.1 Healthy Sleep Cycles
- Display typical 90-minute sleep cycles
- Normal progression: Wake → N1 → N2 → N3 → N2 → REM
- 4-6 cycles per night (7-9 hours)
- Deep sleep concentrated in first half of night
- REM periods lengthening toward morning

#### 2.2.2 Age-Related Sleep Patterns
**Age Groups:**
- **Infants (0-1 year):** 50% REM, fragmented sleep
- **Children (2-12 years):** High N3 (20-25%), robust sleep architecture
- **Teenagers (13-18 years):** Strong N3, delayed sleep phase
- **Young Adults (19-35 years):** Balanced, healthy baseline
- **Middle-Aged (36-60 years):** Reduced N3 (15-18%), more WASO
- **Elderly (60+ years):** Minimal N3 (<10%), fragmented, early wake times

#### 2.2.3 Circadian Rhythm Overlay
- Sine wave overlay showing circadian process (Process C)
- Melatonin secretion period
- Core body temperature nadir
- Integration with sleep homeostasis (Process S)

#### 2.2.4 Sleep Fragmentation Types

**A. Age-Related Fragmentation:**
- Increased micro-arousals
- More frequent transitions to lighter stages
- Extended WASO periods
- Reduced sleep efficiency

**B. Sleep Disorder Breathing (SDB) Fragmentation:**
- Frequent arousals from deep sleep and REM
- Cyclic pattern of disruptions (every 30-90 seconds)
- Reduced time in restorative stages
- Oxygen desaturation events markers (optional)

#### 2.2.5 Alcohol Impact
- Increased N3 in first half of night
- Suppressed REM in first half
- REM rebound in second half (fragmented)
- Increased WASO in second half
- Overall reduced sleep quality

### 2.3 Statistical Metrics Display
- **Percentages by Stage:**
  - Wake %
  - N1 %
  - N2 %
  - N3 (Deep Sleep) %
  - REM %
  - WASO %
- **Sleep Efficiency:** (Total Sleep Time / Time in Bed) × 100
- **Sleep Latency:** Time to fall asleep
- **REM Latency:** Time to first REM period
- **Number of Awakenings**
- **WASO Duration** (minutes)

## 3. User Controls & Configuration

### 3.1 Primary Controls
- **Age Selection:** Slider or dropdown (0-100 years)
- **Sleep Duration:** 4-12 hours
- **Sleep Onset Time:** 18:00 - 04:00
- **Staging System:** Traditional 5-stage (W, REM, N1, N2, N3)

### 3.2 Condition Toggles
- **Baseline:** Healthy sleep
- **Circadian Rhythm Overlay:** On/Off
- **Fragmentation Type:**
  - None
  - Age-related
  - Sleep disorder breathing
  - Combined
- **Alcohol Effect:** None / Moderate / Heavy
- **WASO Display:** Show/Hide

### 3.3 Visual Controls
- **Color Scheme:**
  - Traditional (medical colors)
  - High contrast
  - Color-blind friendly
- **Grid Lines:** On/Off
- **Time Scale:** 30min / 1hr / 2hr intervals
- **Stage Labels:** Left/Right/Both/None

## 4. Technical Architecture

### 4.1 Technology Stack
- **Frontend Framework:** Vanilla JavaScript (ES6+) with optional React later
- **Visualization:** HTML5 Canvas or SVG
- **Styling:** CSS3 with CSS Grid/Flexbox
- **Build Tools:** None initially (static files), can add Vite/Webpack later
- **No backend required** (client-side only)

### 4.2 Component Structure

```
hypongram/
├── index.html              # Main application page
├── css/
│   ├── main.css           # Main styles
│   ├── controls.css       # Control panel styles
│   └── hypnogram.css      # Hypnogram visualization styles
├── js/
│   ├── main.js            # Application entry point
│   ├── hypnogram.js       # Core hypnogram rendering
│   ├── sleepModels.js     # Sleep pattern generators
│   ├── controls.js        # UI controls handler
│   ├── statistics.js      # Sleep metrics calculator
│   └── utils.js           # Utility functions
├── data/
│   └── sleepPatterns.js   # Predefined sleep pattern templates
├── README.md
├── SPEC.md
└── package.json
```

### 4.3 Data Models

#### Sleep Stage Data Point
```javascript
{
  time: Number,        // Epoch time or minutes from sleep onset
  stage: String,       // 'W', 'REM', 'N1', 'N2', 'N3', 'WASO'
  duration: Number,    // Duration in minutes (typically 30s epochs)
  arousal: Boolean,    // Micro-arousal flag
  event: String        // Optional: 'apnea', 'hypopnea', etc.
}
```

#### Sleep Session Configuration
```javascript
{
  age: Number,                    // 0-100
  duration: Number,               // Total recording time in hours
  sleepOnset: String,            // Time (HH:MM)
  fragmentationType: String,      // 'none', 'aging', 'sdb', 'combined'
  alcoholEffect: String,          // 'none', 'moderate', 'heavy'
  showCircadian: Boolean,
  showWASO: Boolean,
  colorScheme: String
}
```

## 5. Visualization Specifications

### 5.1 Canvas/SVG Layout
- **Width:** Responsive (100% container width, min 800px)
- **Height:** 400-600px
- **X-axis:** Time (hours)
- **Y-axis:** Sleep stages (discrete levels)

### 5.2 Stage Y-Positions (Bottom to Top)
1. N3 (Deep Sleep) - Bottom
2. N2 (Light Sleep)
3. N1 (Light Sleep)
4. REM
5. Wake
6. WASO (optional, same level as Wake or separate)

### 5.3 Color Schemes

#### Traditional Medical
- Wake: #FF6B6B (Red)
- REM: #4ECDC4 (Teal/Cyan)
- N1: #95E1D3 (Light Green)
- N2: #45B7D1 (Blue)
- N3: #1A535C (Dark Blue/Navy)
- WASO: #FF8B94 (Light Red)

#### High Contrast
- Wake: #FFFFFF (White)
- REM: #FF00FF (Magenta)
- N1: #FFFF00 (Yellow)
- N2: #00FFFF (Cyan)
- N3: #000080 (Navy)

### 5.4 Grid & Annotations
- Vertical gridlines every hour
- Horizontal lines separating stages
- Time labels on X-axis
- Stage labels on Y-axis
- Optional sleep cycle markers (90-min intervals)

## 6. Sleep Pattern Algorithms

### 6.1 Healthy Adult Baseline (25-35 years)
```
Cycle 1 (0-90min):   W→N1(5min)→N2(20min)→N3(30min)→N2(20min)→REM(15min)
Cycle 2 (90-180min): N2(15min)→N3(25min)→N2(25min)→REM(25min)
Cycle 3 (180-270min): N2(20min)→N3(15min)→N2(30min)→REM(25min)
Cycle 4 (270-360min): N2(25min)→N3(5min)→N2(25min)→REM(35min)
Cycle 5 (360-450min): N2(30min)→N2(20min)→REM(40min)
Wake
```

### 6.2 Age Adjustment Factors
- **N3 Duration Multiplier:**
  - Children (2-12): 1.5x
  - Young Adult (19-35): 1.0x (baseline)
  - Middle-aged (36-60): 0.6x
  - Elderly (60+): 0.3x

- **Fragmentation Frequency:**
  - Children: 0.5x
  - Young Adult: 1.0x
  - Middle-aged: 1.5x
  - Elderly: 3.0x

### 6.3 Circadian Rhythm Model
- Sine wave with 24-hour period
- Peak melatonin: 2-4 AM
- Core body temp minimum: 4-5 AM
- Overlay opacity: 20-30%

### 6.4 Alcohol Effect Model
- First 3 hours: +30% N3, -50% REM
- Hours 3-6: -60% N3, +80% REM (fragmented)
- +200% WASO in second half
- Reduced overall sleep efficiency by 15-25%

### 6.5 Sleep Disorder Breathing Pattern
- Arousal every 45-90 seconds during N2, N3, REM
- More pronounced in REM (REM-related OSA)
- Cyclic pattern with oxygen desaturation
- Optional apnea event markers

## 7. Implementation Phases

### Phase 1: Foundation (MVP)
- [ ] Project setup
- [ ] Basic HTML structure
- [ ] Canvas/SVG rendering engine
- [ ] Healthy adult baseline hypnogram
- [ ] Basic controls (age, duration)
- [ ] Traditional color scheme

### Phase 2: Age Variations
- [ ] Age-based sleep pattern generator
- [ ] Age slider with real-time updates
- [ ] N3 reduction algorithm
- [ ] Fragmentation increase algorithm

### Phase 3: Advanced Features
- [ ] Circadian rhythm overlay
- [ ] Alcohol effect simulation
- [ ] Sleep disorder breathing fragmentation
- [ ] WASO visualization

### Phase 4: Polish & Analytics
- [ ] Sleep statistics panel
- [ ] Percentages calculation
- [ ] Multiple color schemes
- [ ] Responsive design
- [ ] Export functionality (PNG/SVG)

### Phase 5: Enhancements
- [ ] Preset scenarios library
- [ ] Comparison mode (2 hypnograms side-by-side)
- [ ] Animation of sleep progression
- [ ] Educational tooltips
- [ ] Print-friendly view

## 8. Success Criteria

- [ ] Accurately represents sleep architecture per clinical standards
- [ ] Smooth, responsive visualization (60fps)
- [ ] All controls modify hypnogram in real-time
- [ ] Statistics match displayed hypnogram (±1%)
- [ ] Works on modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] Mobile-responsive design
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Documentation for usage and customization

## 9. Future Enhancements

- React/Vue component version
- Integration with sleep tracking APIs
- Real sleep data import (EDF, CSV)
- Machine learning-based pattern generation
- Multi-night comparison
- Sleep quality scoring
- Intervention impact simulation (CPAP, medication, CBT-I)
- PDF report generation

## 10. References

- AASM Sleep Staging Manual
- Sleep cycle research (Carskadon & Dement)
- Age-related sleep architecture changes
- Circadian rhythm integration models
- Alcohol and sleep literature
- Sleep disorder breathing patterns
