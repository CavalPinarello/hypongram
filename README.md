# Hypongram - Sleep Staging Hypnogram Visualization Tool

An interactive web-based tool for visualizing sleep hypnograms with customizable parameters to demonstrate various sleep patterns, age-related changes, and sleep disorders.

## Features

- **Realistic Sleep Architecture**: Based on AASM sleep staging (Wake, REM, N1, N2, N3)
- **Age-Related Patterns**: Visualize how sleep changes from childhood to elderly years
- **Circadian Rhythm Overlay**: Show the interaction between sleep stages and circadian processes
- **Sleep Fragmentation**: Model age-related and sleep disorder breathing patterns
- **Alcohol Impact**: Demonstrate how alcohol affects sleep architecture
- **Real-Time Statistics**: View percentages of each sleep stage, efficiency, and more
- **Customizable Controls**: Adjust age, duration, fragmentation, and visual settings

## Quick Start

Simply open `index.html` in a modern web browser. No build process or server required!

```bash
# Clone the repository
git clone <repository-url>
cd hypongram

# Open in browser
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

Or use a local server:
```bash
python -m http.server 8000
# Then visit http://localhost:8000
```

## Usage

1. **Select Age**: Use the age slider to see how sleep patterns change across the lifespan
2. **Adjust Duration**: Set the total sleep recording time (4-12 hours)
3. **Add Effects**: Toggle fragmentation types, alcohol effects, or circadian rhythm overlay
4. **View Statistics**: Check the statistics panel for sleep stage percentages and metrics
5. **Customize Appearance**: Change color schemes and visual settings

## Controls

### Primary Settings
- **Age**: 0-100 years (affects N3 amount and fragmentation)
- **Sleep Duration**: 4-12 hours
- **Sleep Onset Time**: When sleep begins

### Conditions
- **Fragmentation Type**: None / Age-related / Sleep Disorder Breathing / Combined
- **Alcohol Effect**: None / Moderate / Heavy
- **Circadian Rhythm**: Show/hide overlay

### Visual Options
- **Color Scheme**: Traditional / High Contrast / Colorblind-friendly
- **Grid Lines**: Toggle time grid
- **Stage Labels**: Position and visibility

## Sleep Stages

- **Wake (W)**: Awake before sleep onset
- **WASO**: Wake After Sleep Onset
- **REM**: Rapid Eye Movement sleep (dreaming)
- **N1**: Light sleep stage 1
- **N2**: Light sleep stage 2
- **N3**: Deep sleep (slow-wave sleep)

## Technical Details

- **Pure JavaScript**: No framework dependencies for core functionality
- **HTML5 Canvas**: High-performance rendering
- **Responsive Design**: Works on desktop and mobile
- **Client-Side Only**: No server or data collection

## Development

See [SPEC.md](SPEC.md) for detailed technical specifications.

### Project Structure
```
hypongram/
├── index.html              # Main application
├── css/                    # Stylesheets
├── js/                     # JavaScript modules
├── data/                   # Sleep pattern templates
├── README.md
└── SPEC.md
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions welcome! Please read the specification document first.

## License

MIT License - feel free to use for educational and research purposes.

## References

- American Academy of Sleep Medicine (AASM) Sleep Staging Manual
- Sleep research by Carskadon & Dement
- Age-related sleep architecture studies
- Circadian rhythm biology

## Roadmap

- [ ] Export hypnogram as PNG/SVG
- [ ] Comparison mode (side-by-side)
- [ ] Import real sleep data (EDF/CSV)
- [ ] Preset scenario library
- [ ] Animation of sleep progression
- [ ] Multi-night trends

---

**Educational Tool**: This visualization is for educational purposes. Consult sleep medicine professionals for clinical sleep analysis.
