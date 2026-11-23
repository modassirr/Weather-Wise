# 🌤️ WeatherWise — Smart Weather & Forecast Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Open-Meteo](https://img.shields.io/badge/API-Open--Meteo-0ea5e9)](https://open-meteo.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-v4.4-FF6384?style=flat&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

**WeatherWise** is a modern, responsive, client-side weather and atmospheric intelligence dashboard. Built with vanilla web technologies, it features real-time weather forecasts, air quality index (AQI) tracking, solar cycle animations, smart contextual lifestyle recommendations, interactive canvas backgrounds, and a frosted glassmorphic UI.

---

## 🌟 Key Features

### 📍 Automatic Geolocation on Startup
- Prompts for your location upon opening the site to instantly load your local weather.
- Reverse-geocodes GPS coordinates into readable city, region, and country names.
- Includes a dedicated GPS button beside the search bar to re-detect location anytime.

### 🔍 Live City Search with Auto-Suggestions
- Instant, debounced geocoding search as you type.
- Clean dropdown highlighting query matches with country and coordinate badges.
- Full keyboard navigation support (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`) and quick shortcut (`/` to focus search).
- Quick-selection chips for popular global cities (New York, London, Tokyo, Paris, Sydney).

### 🌦️ Atmospheric Weather Hero Card
- Dynamic weather state visualization that adapts to conditions:
  - ☀️ **Clear / Sunny**: Rotating solar corona ring with shimmering bokeh particles.
  - 🌧️ **Rainy**: Angled rainfall streaks with puddle splash ripples.
  - 💨 **Windy**: Flowing aerodynamic breeze streams with tumbling leaves.
  - ☁️ **Cloudy / Overcast**: Multi-layered floating cloud drifts.
  - ❄️ **Snowy**: Swaying snowflakes with gentle flutter.
  - ⚡ **Thunderstorm**: Atmospheric electric charge and flash pulses.
  - 🌙 **Nighttime Mode**: Ambient moon glow, twinkling star field, and passing shooting stars.

### 🍃 Real-Time Air Quality Dashboard
- Integrates the Open-Meteo Air Quality API to calculate US AQI standards.
- Continuous multi-stop spectrum bar (Good 🟢 → Moderate 🟡 → Unhealthy 🟠 → Very Unhealthy 🔴 → Hazardous 🟣) with a dynamic glowing indicator pin.
- Health status ratings, pollutant breakdown ($PM_{2.5}$ and $PM_{10}$), and actionable lifestyle advice (e.g., mask recommendations, outdoor safety).

### ☀️ Sunset & Sunrise Solar Cycle
- Parabolic celestial trajectory arc visualizing the sun's position across daylight hours.
- Day and night mode tracking (switches to a glowing crescent moon after sunset).
- 12-hour formatted rise and set times with live countdown to the next solar transition.

### 💡 Smart Weather Insights Engine
- Algorithmic, rule-based recommendation cards:
  - ☂️ **Rain & Umbrella Alert**: Alerts when precipitation probability exceeds 35%.
  - 👕 **Clothing & Layering Advice**: Tailored suggestions based on current temperature and wind chill.
  - 🧴 **UV Radiation Shield**: Sunscreen and protection reminders when UV Index is elevated.
  - 💧 **Humidity & Hydration Guide**: Comfort and hydration tips for extreme humidity conditions.
  - 🏃 **Outdoor Activity Rating**: Workout and recreation suitability based on weather and air quality.

### 📊 24-Hour Temperature & Trend Chart
- Interactive hourly forecast chart powered by Chart.js.
- Smooth Bézier curve interpolation with custom cyan-to-transparent gradient fill.
- Frosted glass tooltips showing time, temperature, and rain probability.

### 📅 7-Day Extended Forecast Strip
- Horizontal swipeable 7-day forecast cards.
- High/low temperature ranges, weather condition badges, and precipitation probabilities.
- Highlighted card for today with smooth hover elevations.

### 🧊 Frosted Glassmorphism & `<CursorGrid />` Component
- High-fidelity frosted glass cards with `backdrop-filter: blur(16px)` and translucent borders.
- Background `<CursorGrid />` interactive canvas:
  - Grid cells illuminate smoothly within cursor proximity radius.
  - Clicking produces an expanding radial ripple wave across the grid.
  - Subtle ambient sparkles and smooth edge vignette.
  - Zero-overhead performance (animation loop throttles to 0% CPU when idle).

### 🌓 Theme & Unit Personalization
- Dark / Light mode toggle with persistent state saved in `localStorage`.
- Automatic detection of OS/browser color scheme (`prefers-color-scheme`).
- Seamless temperature unit conversion (°C / °F) with instant metric re-calculation.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Pure HTML5, Modern CSS3, and Vanilla JavaScript (ES6+).
- **Styling Architecture**: Custom CSS Variables, Flexbox, CSS Grid, Glassmorphism (`backdrop-filter`), and CSS Keyframe Animations.
- **Visuals & Charts**: [Chart.js](https://www.chartjs.org/) via CDN, HTML5 Canvas 2D API for the interactive cursor grid.
- **Weather API**: [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs) (No API key required, free & high accuracy).
- **Air Quality API**: [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api).
- **Reverse Geocoding**: [BigDataCloud Client Geocode API](https://www.bigdatacloud.com/) (Fast, free, client-side reverse geocoding).

---

## 📂 Project Structure

```text
WeatherWise/
│
├── index.html              # Semantic HTML5 layout and accessibility markup
├── style.css               # Complete design system, glassmorphism, responsive grid, animations
├── app.js                  # Application engine, API integration, CursorGrid, state management
├── package.json            # Project metadata and quick npm scripts
├── .gitignore              # Standard git exclusion rules
├── CONTRIBUTING.md         # Guidelines for open-source contributions
└── LICENSE                 # MIT License
```

---

## 🚀 Getting Started

No build tools, bundlers, or package installations are required! WeatherWise runs directly in any modern web browser.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/WeatherWise.git
cd WeatherWise
```

### 2. Run Locally

You can open `index.html` directly in your browser, or serve it using any local static server:

#### Using Python
```bash
# Python 3.x
python -m http.server 5500
```

#### Using Node.js (npx)
```bash
npx serve . -p 5500
```

#### Using VS Code
- Install the **Live Server** extension.
- Right-click `index.html` and click **"Open with Live Server"**.

Visit `http://localhost:5500` in your browser.

---

## 🌐 Deploying to GitHub Pages

You can host WeatherWise for free on GitHub Pages in under a minute:

1. Push this repository to GitHub.
2. In your repository on GitHub, navigate to **Settings** > **Pages**.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**.
5. Your live dashboard will be accessible at:
   ```
   https://<your-username>.github.io/WeatherWise/
   ```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `/` | Focus the city search bar immediately |
| `ArrowDown` | Move down through search suggestions |
| `ArrowUp` | Move up through search suggestions |
| `Enter` | Select active search suggestion / Submit search |
| `Escape` | Dismiss suggestions dropdown / blur search bar |

---

## 🤝 Contributing

Contributions, feature requests, and bug reports are welcome! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
