# Hypongram V2 - Evidence-Based Sleep Hypnogram Visualization

**Scientifically accurate, continuous-line hypnogram with comprehensive sleep modifiers**

## What's New in V2

### 🔬 Scientific Foundation
- **Literature-based parameters** from NSF, AASM guidelines, and published research
- **Age-specific distributions** matching actual sleep architecture across the lifespan
- **Sex differences** in total sleep time and slow-wave sleep
- **Cycle-level accuracy**: N3 front-loaded (early night), REM back-loaded (late night)

### 📊 Continuous-Line Visualization
- **Flowing wave pattern** showing sleep "deepening" to N3 and "surfacing" to Wake
- **No more disconnected blocks** - smooth transitions through sleep stages
- **Visual metaphor**: Deep sleep at bottom, wake at top
- **Event markers**: Vertical red lines showing specific awakening causes

### 🎯 New Modifiers

#### Demographics
- **Biological Sex**: Male/Female with distinct sleep patterns
- **Auto-Duration**: Age-appropriate recommended sleep time

#### Life Stage (Female-Specific)
- **Pregnancy** (all trimesters):
  - 1st: More N3, less REM, increased awakenings
  - 2nd: Best sleep quality
  - 3rd: Severe fragmentation, reduced N3/REM
- **Menopause**: Hot flashes, increased fragmentation

#### Bed Partner Effects
- **Partner Snoring**: Mild/Moderate/Severe
- **Partner Movement**: Low/Moderate/High
- Both cause micro-arousals and stage lightening

#### Event-Specific Awakenings
- **Urination**: Age, sex, and pregnancy-dependent frequency
- **Partner Disturbances**: Tracked separately
- **Hot Flashes**: Menopause-related
- **Apneas**: From sleep-disordered breathing

#### Other Modifiers
- **Sleep-Disordered Breathing**: AHI-based (mild/moderate/severe)
- **Alcohol**: Light/Moderate/Heavy with biphasic effects
  - First half: ↑N3, ↓REM
  - Second half: ↓N3, ↑REM (fragmented), ↑WASO
- **Jet Lag**: -12 to +12 hours (westward/eastward)

## Quick Start

### Version 2 (Evidence-Based)
```bash
# Open the new version
open index-v2.html

# Or with Python server (already running)
# Visit: http://localhost:8000/index-v2.html
```

### Version 1 (Original)
```bash
# Original version still available
open index.html
```

## Usage

1. **Set Demographics**: Age, sex, sleep duration (auto or manual)
2. **Life Stage**: Select pregnancy trimester or menopause if applicable
3. **Bed Partner**: Configure partner snoring/movement if co-sleeping
4. **Add Conditions**: SDB severity, alcohol consumption, jet lag
5. **Visualize**: See real-time continuous-line hypnogram with event markers
6. **Analyze**: View stage percentages, efficiency, and awakening counts

## Event Markers (Vertical Lines)

| Color | Event | Description |
|-------|-------|-------------|
| 🟧 Orange | Urination | Nocturia events (age/sex/pregnancy-dependent) |
| 🔴 Red | Partner Snoring | Arousal from bed partner's snoring |
| 🔴 Light Red | Partner Movement | Disturbance from partner movement |
| 🔴 Dark Red | Apnea/Snoring | Self sleep-disordered breathing |
| 🌸 Pink | Hot Flash | Menopause-related awakening |

## Scientific Basis

### Age-Related Sleep Architecture

| Age Group | N3 (Deep Sleep) | REM | Fragmentation |
|-----------|-----------------|-----|---------------|
| Toddler (1-2y) | 25-35% | 25-30% | Very low |
| Young Child (3-5y) | 20-30% | 20-25% | Low |
| Teen (13-17y) | 15-25% | 20-25% | Low |
| Young Adult (18-25y) | 15-25% | 20-25% | Moderate |
| Adult (26-45y) | 10-20% | 20-25% | Moderate |
| Middle-Age (45-64y) | 5-10% | 20-25% | High |
| Elderly (65+y) | <5-10% | 15-20% | Very high |

**Key Insight**: REM percentage stays remarkably stable across adulthood, while N3 declines dramatically with age.

### Pregnancy Sleep Changes

**First Trimester**
- ↑ Total sleep time (+10%)
- ↑ N3 (+20%)
- ↓ REM (-10%)
- ↑ Awakenings (nausea, urination)

**Second Trimester**
- Relatively stable
- Best sleep quality of pregnancy
- Moderate awakenings

**Third Trimester**
- ↓ Total sleep time (-5%)
- ↓ N3 (-30%)
- ↓ REM (-20%)
- ↑↑ Awakenings (+150%)
- High SDB prevalence

### Alcohol Effects (Biphasic Pattern)

**First Half of Night**
- Increased N3 (deep sleep)
- Suppressed REM
- Faster sleep onset

**Second Half of Night**
- REM rebound (but fragmented)
- Increased awakenings
- More light sleep
- Overall reduced sleep quality

## Technical Details

### Architecture

```
Baseline Sleep Model (Age/Sex)
    ↓
Apply Life-Stage Modifiers (Pregnancy/Menopause)
    ↓
Apply Substance Effects (Alcohol)
    ↓
Apply Circadian Misalignment (Jet Lag)
    ↓
Generate Awakening Events
    ↓
Render Continuous-Line Hypnogram
```

### Cycle Structure

Each 90-minute cycle follows physiological progression:
1. **N1** (brief transition)
2. **N2** (descending - 40% of N2 time)
3. **N3** (deep sleep - variable by cycle)
4. **N2** (ascending - 60% of N2 time)
5. **REM** (increasing duration in later cycles)

**Cycle 1-2**: Heavy N3, short REM
**Cycle 3-4**: Moderate N3, longer REM
**Cycle 5-6**: Minimal/no N3, longest REM

### Files

| File | Purpose |
|------|---------|
| `sleepArchitecture.js` | NSF/AASM-based parameters |
| `sleepGenerator.js` | Scientifically accurate sleep generation |
| `events.js` | Awakening events (urination, partner, etc.) |
| `lineHypnogram.js` | Continuous-line canvas renderer |
| `index-v2.html` | Updated UI with all modifiers |
| `controls-v2.js` | Enhanced control panel |
| `main-v2.js` | Application orchestration |

## Comparison: V1 vs V2

| Feature | V1 (Original) | V2 (Evidence-Based) |
|---------|---------------|---------------------|
| Visualization | Disconnected blocks | Continuous line |
| Sleep Model | Simplified estimates | Literature-based |
| Age Parameters | Rough approximations | NSF/AASM guidelines |
| Sex Differences | Not modeled | Included |
| Pregnancy | Not modeled | All trimesters |
| Menopause | Not modeled | Included with hot flashes |
| Bed Partner | Not modeled | Snoring + movement |
| Events | Generic arousals | Specific causes with markers |
| Urination | Not modeled | Age/sex/pregnancy-dependent |
| Cycle Structure | Template-based | Homeostatic priority |

## Known Evidence Gaps

**Well-Supported:**
- Age-related N3 decline ✅
- REM stability across adulthood ✅
- Alcohol biphasic effects ✅
- SDB fragmentation patterns ✅
- Pregnancy sleep changes ✅

**More Variable:**
- Exact percentages vary by lab, scoring rules
- Individual differences in partner tolerance
- Fine-grained effects of co-sleeping quality

## References

This tool is based on:
- National Sleep Foundation sleep duration recommendations
- AASM sleep staging criteria
- Published research on age-related sleep changes
- Pregnancy and menopause sleep studies
- Alcohol and sleep literature
- Sleep-disordered breathing research

## Future Enhancements

- [ ] Import real EDF/PSG data
- [ ] Multi-night comparison
- [ ] Sleep efficiency trends
- [ ] Medication effects
- [ ] CPAP treatment simulation
- [ ] Shift work patterns
- [ ] Sleep restriction/extension protocols

## License

MIT License - Educational and research use encouraged

---

**Version 2.0.0** - Evidence-based redesign
**Previous Version**: index.html (V1 - simplified model)
