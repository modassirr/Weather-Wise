/**
 * WeatherWise — Application Script (Milestone 3)
 * -----------------------------------------------------------------------------
 * Milestone 3: Real-Time Weather & Metrics Integration + Pure CSS Weather Animations!
 *
 * What happens in this milestone:
 * 1. User searches a city -> Geocoding API converts name to (Lat, Lon).
 * 2. Forecast API (`api.open-meteo.com`) retrieves real-time weather metrics.
 * 3. WMO Weather Code translates numbers (e.g., code 61) into readable conditions & SVG icons.
 * 4. Hero Card & 6-Card Highlights Metrics update dynamically with real data.
 * 5. Pure CSS Weather Animations (Rain, Wind streams, Sun glow, Clouds, Snow)
 *    render smoothly inside the Hero Card background!
 * -----------------------------------------------------------------------------
 */

// =============================================================================
// 1. WMO Weather Codes Dictionary (The Weather Translation Matrix)
// =============================================================================
// Open-Meteo returns numeric WMO codes. In C++ you might use a switch/case or map.
// In JavaScript, an Object lookup is clean, fast, and readable:
const WMO_WEATHER_MAP = {
  0: { label: "Clear Sky", type: "sunny", icon: "sun" },
  1: { label: "Mainly Clear", type: "sunny", icon: "sun" },
  2: { label: "Partly Cloudy", type: "cloudy", icon: "partly-cloudy" },
  3: { label: "Overcast", type: "cloudy", icon: "cloud" },
  45: { label: "Foggy", type: "cloudy", icon: "cloud" },
  48: { label: "Icy Fog", type: "cloudy", icon: "cloud" },
  51: { label: "Light Drizzle", type: "rainy", icon: "drizzle" },
  53: { label: "Moderate Drizzle", type: "rainy", icon: "drizzle" },
  55: { label: "Dense Drizzle", type: "rainy", icon: "rain" },
  61: { label: "Slight Rain", type: "rainy", icon: "rain" },
  63: { label: "Moderate Rain", type: "rainy", icon: "rain" },
  65: { label: "Heavy Rain", type: "rainy", icon: "rain" },
  71: { label: "Slight Snowfall", type: "snowy", icon: "snow" },
  73: { label: "Moderate Snowfall", type: "snowy", icon: "snow" },
  75: { label: "Heavy Snowfall", type: "snowy", icon: "snow" },
  77: { label: "Snow Grains", type: "snowy", icon: "snow" },
  80: { label: "Slight Showers", type: "rainy", icon: "rain" },
  81: { label: "Moderate Showers", type: "rainy", icon: "rain" },
  82: { label: "Violent Showers", type: "rainy", icon: "rain" },
  85: { label: "Snow Showers", type: "snowy", icon: "snow" },
  86: { label: "Heavy Snow Showers", type: "snowy", icon: "snow" },
  95: { label: "Thunderstorm", type: "thunder", icon: "thunderstorm" },
  96: { label: "Thunderstorm with Hail", type: "thunder", icon: "thunderstorm" },
  99: { label: "Severe Thunderstorm", type: "thunder", icon: "thunderstorm" },
};

// =============================================================================
// 2. DOM Elements (Hooking into HTML)
// =============================================================================
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("city-search-input");
const searchBtn = document.getElementById("search-btn");
const clearBtn = document.querySelector(".search-clear-btn");
const searchDropdown = document.getElementById("search-dropdown");
const searchStatus = document.getElementById("search-status");
const cityChips = document.querySelectorAll(".city-chip");

// Hero Card Elements
const heroCard = document.getElementById("weather-hero-card");
const animationContainer = document.getElementById("weather-animation-container");
const cityNameEl = document.getElementById("city-name");
const countryNameEl = document.getElementById("country-name");
const timestampEl = document.getElementById("timestamp");
const currentTempEl = document.getElementById("current-temp");
const conditionBadgeEl = document.getElementById("condition-badge");
const heroIconContainer = document.querySelector(".weather-hero-icon");
const feelsLikeEl = document.getElementById("feels-like");
const highLowEl = document.getElementById("high-low");
const rainChanceEl = document.getElementById("rain-chance");

// Highlight Metrics Elements
const valHumidity = document.getElementById("val-humidity");
const subtextHumidity = document.getElementById("subtext-humidity");
const valWind = document.getElementById("val-wind");
const unitWindEl = document.getElementById("unit-wind");
const subtextWind = document.getElementById("subtext-wind");
const valUv = document.getElementById("val-uv");
const badgeUv = document.getElementById("badge-uv");
const subtextUv = document.getElementById("subtext-uv");
const valPressure = document.getElementById("val-pressure");
const subtextPressure = document.getElementById("subtext-pressure");
const valVisibility = document.getElementById("val-visibility");
const subtextVisibility = document.getElementById("subtext-visibility");
const valSunrise = document.getElementById("val-sunrise");
const valSunset = document.getElementById("val-sunset");
const valDaylight = document.getElementById("val-daylight");
const currentTempUnitEl = document.getElementById("current-temp-unit");
const forecastStrip = document.getElementById("forecast-strip");

// Theme & Unit Controls
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const iconSun = themeToggleBtn ? themeToggleBtn.querySelector(".icon-sun") : null;
const iconMoon = themeToggleBtn ? themeToggleBtn.querySelector(".icon-moon") : null;
const unitOptions = document.querySelectorAll(".unit-option");

// Current Active State
let currentUnit = "c"; // 'c' for Celsius, 'f' for Fahrenheit
let lastWeatherData = null; // Caches API response for instantaneous unit toggling

let currentLocation = {
  name: "New York",
  country: "United States",
  latitude: 40.7128,
  longitude: -74.0060,
};

// =============================================================================
// 3. Open-Meteo Geocoding Flow
// =============================================================================
async function searchCityGeocoding(cityName) {
  const query = cityName.trim();
  if (!query) {
    showStatus("Please enter a city name to search.", "error");
    return;
  }

  setLoading(true);
  hideStatus();
  hideDropdown();

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query
  )}&count=5&language=en&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      showStatus(`No cities found matching "${query}". Please check the spelling.`, "error");
      setLoading(false);
      return;
    }

    if (data.results.length === 1) {
      selectLocation(data.results[0]);
    } else {
      renderDropdown(data.results);
      showStatus(`Found ${data.results.length} locations. Select your city below:`, "info");
    }
  } catch (err) {
    console.error("[WeatherWise] Geocoding Error:", err);
    showStatus("Could not connect to weather service. Please check your network.", "error");
  } finally {
    setLoading(false);
  }
}

// =============================================================================
// 4. Open-Meteo Weather Forecast Flow (Milestone 3 Core)
// =============================================================================
/**
 * Temperature and Wind conversion helpers
 */
function toDisplayTemp(celsius) {
  if (currentUnit === "f") {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

function toDisplayWind(kmh) {
  if (currentUnit === "f") {
    return { val: Math.round(kmh * 0.621371), unit: "mph" };
  }
  return { val: Math.round(kmh), unit: "km/h" };
}

/**
 * Fetches real-time weather metrics for the given coordinates.
 */
async function fetchWeatherData(lat, lon) {
  showStatus(`Fetching live weather data...`, "info");
  document.body.classList.add("is-fetching-weather");

  // Open-Meteo Forecast endpoint requesting current conditions (with is_day), daily metrics (7 days), and hourly temperature + visibility
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&hourly=temperature_2m,visibility&timezone=auto&forecast_days=7`;

  try {
    const res = await fetch(weatherUrl);
    if (!res.ok) throw new Error(`Weather API returned HTTP ${res.status}`);
    const weatherData = await res.json();

    console.log("[WeatherWise] Live Weather Data Received:", weatherData);
    lastWeatherData = weatherData; // Cache for instantaneous unit switching
    updateWeatherUI(weatherData);
    hideStatus();
  } catch (err) {
    console.error("[WeatherWise] Forecast API Error:", err);
    showStatus("Failed to retrieve real-time weather. Please try again.", "error");
  } finally {
    document.body.classList.remove("is-fetching-weather");
  }
}

/**
 * Updates all dashboard cards with real live numbers and icons!
 */
function updateWeatherUI(data) {
  const current = data.current;
  const daily = data.daily;
  
  // Day / Night detection (1 = Day, 0 = Night)
  const isDay = current.is_day === 1;
  const tempSymbol = currentUnit === "f" ? "°F" : "°C";

  // 1. Weather condition interpretation (adapts for Day vs Night!)
  const code = current.weather_code;
  const baseInfo = WMO_WEATHER_MAP[code] || {
    label: "Cloudy",
    type: "cloudy",
    icon: "partly-cloudy",
  };

  let conditionLabel = baseInfo.label;
  let conditionType = baseInfo.type;
  let conditionIcon = baseInfo.icon;

  if (!isDay) {
    // Nighttime variations
    if (code <= 1) {
      conditionLabel = "Clear Night";
      conditionType = "night-clear";
      conditionIcon = "moon";
    } else if (code === 2) {
      conditionLabel = "Partly Cloudy";
      conditionType = "night-cloudy";
      conditionIcon = "moon-cloud";
    } else if (code === 3 || code === 45 || code === 48) {
      conditionLabel = baseInfo.label;
      conditionType = "night-cloudy";
      conditionIcon = "cloud";
    } else if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) {
      conditionLabel = baseInfo.label;
      conditionType = "night-rainy";
      conditionIcon = "moon-rain";
    } else {
      conditionLabel = baseInfo.label;
      conditionType = baseInfo.type;
      conditionIcon = baseInfo.icon;
    }
  }

  // 2. Current Temperature and Badges
  currentTempEl.textContent = toDisplayTemp(current.temperature_2m);
  if (currentTempUnitEl) currentTempUnitEl.textContent = tempSymbol;
  conditionBadgeEl.textContent = conditionLabel;

  // City Local Time & Day/Night label
  if (current.time) {
    const cityDate = new Date(current.time);
    const timeStr = cityDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dayStr = cityDate.toLocaleDateString([], { weekday: "long" });
    const dayNightLabel = isDay ? "Daytime" : "Nighttime";
    timestampEl.textContent = `${dayStr}, ${timeStr} • ${dayNightLabel} • Open-Meteo`;
  }

  // 3. Update Weather Hero SVG Icon
  heroIconContainer.innerHTML = getWeatherIconSVG(conditionIcon);

  // 4. Feels Like, High/Low, Precipitation
  feelsLikeEl.textContent = `${toDisplayTemp(current.apparent_temperature)}${tempSymbol}`;
  if (daily && daily.temperature_2m_max && daily.temperature_2m_min) {
    const high = toDisplayTemp(daily.temperature_2m_max[0]);
    const low = toDisplayTemp(daily.temperature_2m_min[0]);
    highLowEl.textContent = `${high}${tempSymbol} / ${low}${tempSymbol}`;
  }
  const rainProb = (daily && daily.precipitation_probability_max) ? daily.precipitation_probability_max[0] : 0;
  rainChanceEl.textContent = `${rainProb}%`;

  // 5. Update Metrics Grid
  // Humidity
  valHumidity.textContent = current.relative_humidity_2m;
  if (current.relative_humidity_2m > 75) {
    subtextHumidity.textContent = "High humidity, feels sticky.";
  } else if (current.relative_humidity_2m < 35) {
    subtextHumidity.textContent = "Dry air, stay hydrated.";
  } else {
    subtextHumidity.textContent = "Comfortable humidity range.";
  }

  // Wind Speed & Direction
  const windKm = Math.round(current.wind_speed_10m);
  const windInfo = toDisplayWind(current.wind_speed_10m);
  const windDirText = degreesToCompass(current.wind_direction_10m);
  valWind.textContent = windInfo.val;
  if (unitWindEl) unitWindEl.textContent = windInfo.unit;
  subtextWind.textContent = `Blowing from ${windDirText} (${Math.round(current.wind_direction_10m)}°)`;

  // UV Index (Night always has UV 0)
  const uvVal = isDay && daily && daily.uv_index_max ? Math.round(daily.uv_index_max[0]) : 0;
  valUv.textContent = uvVal;
  updateUvBadge(uvVal);

  // Surface Air Pressure
  valPressure.textContent = Math.round(current.surface_pressure).toLocaleString();
  if (current.surface_pressure < 1005) {
    subtextPressure.textContent = "Low pressure, storms possible.";
  } else if (current.surface_pressure > 1022) {
    subtextPressure.textContent = "High pressure, stable & clear.";
  } else {
    subtextPressure.textContent = "Normal atmospheric pressure.";
  }

  // Visibility (from hourly array, fallback to 10km)
  let visibilityKm = 10;
  if (data.hourly && data.hourly.visibility && data.hourly.visibility.length > 0) {
    visibilityKm = Math.round(data.hourly.visibility[0] / 1000);
  }
  valVisibility.textContent = visibilityKm;
  subtextVisibility.textContent = visibilityKm >= 10 ? "Clear horizon, optimal visibility." : "Reduced visibility detected.";

  // Sun Schedule (Sunrise / Sunset & Daylight calculation)
  if (daily && daily.sunrise && daily.sunset) {
    const sunriseDate = new Date(daily.sunrise[0]);
    const sunsetDate = new Date(daily.sunset[0]);

    valSunrise.textContent = format12HourTime(sunriseDate);
    valSunset.textContent = format12HourTime(sunsetDate);

    // Daylight difference calculation
    const diffMs = sunsetDate - sunriseDate;
    if (diffMs > 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      valDaylight.textContent = `Total Daylight: ${hours}h ${mins}m`;
    }
  }

  // 6. Trigger Weather Background Animation (Passes isDay flag!)
  applyWeatherAnimation(conditionType, windKm, isDay);

  // 7. Render 7-Day Extended Forecast Strip (Milestone 4)
  if (daily) {
    renderForecast(daily);
  }

  // 8. Render Smart Weather Insights (dynamic, based on live data!)
  renderSmartInsights({
    rainProb:      rainProb,
    tempC:         current.temperature_2m,
    uvVal:         uvVal,
    windKm:        windKm,
    humidity:      current.relative_humidity_2m,
    conditionType: conditionType,
    isDay:         isDay,
  });

  // 9. Render 24-Hour Temperature Chart (Milestone 5)
  if (data.hourly && data.hourly.temperature_2m) {
    renderHourlyChart(data.hourly);
  }

  // 10. Render Sunset & Sunrise Solar Cycle Dashboard (Reference Matched)
  renderSolarCycle(data);
}

// =============================================================================
// 4b. Open-Meteo Air Quality Flow (Reference Dashboard)
// =============================================================================
/**
 * Fetches real-time Air Quality data (AQI, PM2.5, PM10) from Open-Meteo Air Quality API.
 * Free, no API key required, reliable worldwide.
 */
async function fetchAirQualityData(lat, lon) {
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10`;
  
  try {
    const res = await fetch(aqiUrl);
    if (!res.ok) throw new Error(`AQI API HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.current) {
      renderAirQuality(data.current);
    } else {
      renderAirQualityFallback();
    }
  } catch (err) {
    console.warn("[WeatherWise] Air Quality API warning:", err);
    renderAirQualityFallback();
  }
}

/**
 * Updates the Air Quality Dashboard with real AQI, health description,
 * mask recommendations, and positions the glowing pin along the continuous spectrum bar.
 */
function renderAirQuality(current) {
  const aqi = Math.round(current.us_aqi || 42);
  const pm25 = current.pm2_5 !== undefined ? Math.round(current.pm2_5) : "--";
  const pm10 = current.pm10 !== undefined ? Math.round(current.pm10) : "--";

  const statusTextEl = document.getElementById("aqi-status-text");
  const healthDescEl = document.getElementById("aqi-health-desc");
  const suggestIconEl = document.getElementById("aqi-suggestion-icon");
  const suggestTextEl = document.getElementById("aqi-suggestion-text");
  const indicatorEl = document.getElementById("aqi-spectrum-indicator");
  const badgeEl = document.getElementById("aqi-badge");
  const valPm25El = document.getElementById("val-pm25");
  const valPm10El = document.getElementById("val-pm10");
  const valTierEl = document.getElementById("val-aqi-tier");

  if (valPm25El) valPm25El.textContent = `${pm25} µg/m³`;
  if (valPm10El) valPm10El.textContent = `${pm10} µg/m³`;

  // Continuous rainbow spectrum: map AQI (0 to 350+) onto 3% to 97% range
  const spectrumPct = Math.min(Math.max((aqi / 350) * 100, 3), 97);
  if (indicatorEl) {
    indicatorEl.style.left = `${spectrumPct}%`;
  }

  let title = `Good ${aqi}`;
  let desc = "Air quality is satisfactory and poses little or no health risk.";
  let icon = "🍃";
  let advice = "Safe to go outside! Perfect conditions for outdoor exercise, walking, and ventilation.";
  let badgeClass = "status-good";
  let tierLabel = "Tier 1: Good";

  if (aqi > 300) {
    title = `Hazardous ${aqi}`;
    desc = "Health emergency warning. The entire population is likely affected.";
    icon = "🚫";
    advice = "Do not go outside! Keep doors and windows closed. Wear a sealed N95 mask if outdoors.";
    badgeClass = "status-hazardous";
    tierLabel = "Tier 6: Hazardous";
  } else if (aqi > 200) {
    title = `Very Unhealthy ${aqi}`;
    desc = "Anyone could experience health effects. Significant health alert for serious conditions.";
    icon = "🚨";
    advice = "Refrain from long or intense activities! Wear an N95 mask outdoors and run an air purifier.";
    badgeClass = "status-very-unhealthy";
    tierLabel = "Tier 5: Very High";
  } else if (aqi > 150) {
    title = `Unhealthy ${aqi}`;
    desc = "General public may experience health effects; sensitive groups experience more serious effects.";
    icon = "😷";
    advice = "Wear a mask outdoors. Avoid prolonged outdoor exertion and keep indoor air filtered.";
    badgeClass = "status-unhealthy";
    tierLabel = "Tier 4: Unhealthy";
  } else if (aqi > 100) {
    title = `Unhealthy (Sensitive) ${aqi}`;
    desc = "Members of sensitive groups may experience health effects. General public less affected.";
    icon = "⚠️";
    advice = "Sensitive individuals should wear a mask outdoors and reduce prolonged outdoor activity.";
    badgeClass = "status-sensitive";
    tierLabel = "Tier 3: Moderate-High";
  } else if (aqi > 50) {
    title = `Moderate ${aqi}`;
    desc = "Air quality is acceptable; however, sensitive individuals may experience minor irritation.";
    icon = "🌤️";
    advice = "Safe for most people to go outside. Extremely sensitive groups should monitor symptoms.";
    badgeClass = "status-moderate";
    tierLabel = "Tier 2: Moderate";
  }

  if (statusTextEl) statusTextEl.textContent = title;
  if (healthDescEl) healthDescEl.textContent = desc;
  if (suggestIconEl) suggestIconEl.textContent = icon;
  if (suggestTextEl) suggestTextEl.textContent = advice;
  if (valTierEl) valTierEl.textContent = tierLabel;
  if (badgeEl) {
    badgeEl.textContent = `AQI ${aqi}`;
    badgeEl.className = `aqi-badge ${badgeClass}`;
  }
}

function renderAirQualityFallback() {
  renderAirQuality({ us_aqi: 45, pm2_5: 11, pm10: 22 });
}

/**
 * Updates the Sunset & Sunrise Solar Cycle Dashboard card.
 * Calculates solar trajectory progress and remaining time until next transition.
 */
function renderSolarCycle(data) {
  const daily = data.daily;
  const current = data.current;
  if (!daily || !daily.sunrise || !daily.sunset) return;

  const card = document.getElementById("sun-cycle-card");
  const sunsetValEl = document.getElementById("sun-card-sunset");
  const sunriseValEl = document.getElementById("sun-card-sunrise");
  const progressEl = document.getElementById("sun-trajectory-progress");
  const pinEl = document.getElementById("celestial-body-pin");
  const bubbleEl = document.getElementById("celestial-icon-bubble");
  const countdownEl = document.getElementById("sun-cycle-countdown");
  const phaseBadgeEl = document.getElementById("sun-cycle-phase");

  const sunriseDate = new Date(daily.sunrise[0]);
  const sunsetDate = new Date(daily.sunset[0]);

  // Display times formatted in 12-hour AM/PM (matching reference image)
  if (sunriseValEl) sunriseValEl.textContent = format12HourTime(sunriseDate);
  if (sunsetValEl) sunsetValEl.textContent = format12HourTime(sunsetDate);

  const now = current.time ? new Date(current.time) : new Date();
  const isDay = current.is_day === 1;

  if (card) {
    card.classList.toggle("is-night", !isDay);
  }

  let progressPct = 50;
  let countdownText = "";

  if (isDay) {
    // Daytime: calculate progress between sunrise and sunset
    const totalDaylightMs = sunsetDate - sunriseDate;
    const elapsedMs = now - sunriseDate;
    progressPct = Math.min(Math.max((elapsedMs / totalDaylightMs) * 100, 5), 95);

    const msUntilSunset = sunsetDate - now;
    if (msUntilSunset > 0) {
      const h = Math.floor(msUntilSunset / (1000 * 60 * 60));
      const m = Math.floor((msUntilSunset % (1000 * 60 * 60)) / (1000 * 60));
      countdownText = `Sunset in ${h}h ${m}m`;
    } else {
      countdownText = "Sun is setting";
    }

    if (phaseBadgeEl) phaseBadgeEl.textContent = "Daytime";

    if (bubbleEl) {
      bubbleEl.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        </svg>`;
    }
  } else {
    // Nighttime: Moon active
    if (phaseBadgeEl) phaseBadgeEl.textContent = "Nighttime";
    progressPct = 50;

    if (bubbleEl) {
      bubbleEl.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#c7d2fe" stroke="#818cf8" stroke-width="2">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </svg>`;
    }

    // Next sunrise calculation
    const msUntilSunrise = sunriseDate - now;
    if (msUntilSunrise > 0) {
      const h = Math.floor(msUntilSunrise / (1000 * 60 * 60));
      const m = Math.floor((msUntilSunrise % (1000 * 60 * 60)) / (1000 * 60));
      countdownText = `Sunrise in ${h}h ${m}m`;
    } else {
      countdownText = "Night sky • Solar rest";
    }
  }

  if (progressEl) progressEl.style.width = `${progressPct}%`;
  if (pinEl) pinEl.style.left = `${progressPct}%`;
  if (countdownEl) countdownEl.textContent = countdownText;
}

// =============================================================================
// 5. 7-Day Extended Forecast Strip (Milestone 4 Core)
// =============================================================================
/**
 * Dynamically builds and displays the 7-day extended forecast cards.
 * Translates daily weather codes into conditions & SVG icons,
 * and formats temperatures according to the active unit (°C or °F).
 */
function renderForecast(daily) {
  if (!forecastStrip || !daily || !daily.time) return;

  // Clear existing cards
  forecastStrip.innerHTML = "";

  const totalDays = Math.min(daily.time.length, 7);

  for (let i = 0; i < totalDays; i++) {
    const dateStr = daily.time[i]; // e.g., "2026-11-21"
    const dateObj = new Date(dateStr + "T00:00:00");

    // Day name ("Today" for the first card, otherwise "Sun", "Mon", etc.)
    const dayName = i === 0 
      ? "Today" 
      : dateObj.toLocaleDateString([], { weekday: "short" });

    // Date label (e.g., "Nov 21")
    const dateLabel = dateObj.toLocaleDateString([], { month: "short", day: "numeric" });

    // Weather condition and matching icon
    const code = daily.weather_code[i];
    const codeInfo = WMO_WEATHER_MAP[code] || {
      label: "Partly Cloudy",
      type: "cloudy",
      icon: "partly-cloudy",
    };

    // Temperatures formatted in currently active unit (°C or °F)
    const high = toDisplayTemp(daily.temperature_2m_max[i]);
    const low = toDisplayTemp(daily.temperature_2m_min[i]);

    // Precipitation probability badge (if > 15%)
    const rainChance = (daily.precipitation_probability_max && daily.precipitation_probability_max[i]) || 0;
    const rainBadgeHTML = rainChance > 15
      ? `<span class="forecast-rain-prob" title="Precipitation probability">💧 ${rainChance}%</span>`
      : "";

    // Create forecast card element
    const card = document.createElement("div");
    card.className = `forecast-card ${i === 0 ? "today" : ""}`;
    card.innerHTML = `
      <span class="day-name">${dayName}</span>
      <span class="day-date">${dateLabel}</span>
      <div class="forecast-icon" aria-label="${codeInfo.label}">
        ${getWeatherIconSVG(codeInfo.icon, 36)}
      </div>
      <span class="forecast-condition">${codeInfo.label}</span>
      ${rainBadgeHTML}
      <div class="forecast-temp-range">
        <span class="temp-high">${high}°</span>
        <span class="temp-low">${low}°</span>
      </div>
    `;

    forecastStrip.appendChild(card);
  }
}

// =============================================================================
// 5a. 24-Hour Temperature Chart (Milestone 5 — Chart.js)
// =============================================================================
/**
 * Draws a smooth live temperature trend chart for the next 24 hours.
 * Uses Chart.js (loaded via CDN). Re-renders when unit toggles.
 */
let hourlyChartInstance = null; // Keeps track of the Chart.js instance for clean re-renders

function renderHourlyChart(hourly) {
  const canvas = document.getElementById("hourly-chart");
  if (!canvas || !window.Chart) return; // Bail if Chart.js isn't loaded yet

  // Extract the first 24 hours of data
  const times = (hourly.time || []).slice(0, 24);
  const tempsC = (hourly.temperature_2m || []).slice(0, 24);

  // Convert temperatures to the active display unit
  const temps = tempsC.map(t => toDisplayTemp(t));
  const unit = currentUnit === "f" ? "°F" : "°C";

  // Format time labels as "6 AM", "12 PM", "6 PM", etc.
  const labels = times.map(t => {
    const d = new Date(t);
    return d.toLocaleTimeString([], { hour: "numeric", hour12: true });
  });

  // Destroy existing chart instance before re-drawing (prevents canvas reuse errors)
  if (hourlyChartInstance) {
    hourlyChartInstance.destroy();
    hourlyChartInstance = null;
  }

  // Detect dark mode to adjust chart colors dynamically
  const isDark = document.body.classList.contains("dark-mode");
  const gridColor   = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const labelColor  = isDark ? "#94a3b8" : "#64748b";
  const lineColor   = "#3b82f6";
  const pointColor  = "#2563eb";

  // Create gradient fill under the line
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 220);
  gradient.addColorStop(0,   isDark ? "rgba(59,130,246,0.35)" : "rgba(37,99,235,0.28)");
  gradient.addColorStop(1,   "rgba(59,130,246,0.00)");

  hourlyChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: `Temperature (${unit})`,
        data: temps,
        borderColor: lineColor,
        backgroundColor: gradient,
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: pointColor,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 1.5,
        tension: 0.4,       // Smooth curve!
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
          borderColor: isDark ? "#334155" : "#e2e8f0",
          borderWidth: 1,
          titleColor: isDark ? "#e2e8f0" : "#0f172a",
          bodyColor: isDark ? "#94a3b8" : "#475569",
          padding: 10,
          callbacks: {
            label: ctx => ` ${ctx.parsed.y}${unit}`,
          }
        },
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: {
            color: labelColor,
            maxTicksLimit: 8,
            font: { size: 11 },
          },
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: labelColor,
            font: { size: 11 },
            callback: val => `${val}${unit}`,
          },
        },
      },
    },
  });
}

// =============================================================================
// 5b. Smart Weather Insights Engine (Dynamic, Real-Data Driven!)
// =============================================================================
/**
 * Builds contextual advice cards inside #advice-list based on live weather.
 * Called every time weather data updates (search, unit switch, page load).
 *
 * @param {Object} opts - { rainProb, tempC, uvVal, windKm, humidity, isDay }
 */
function renderSmartInsights({ rainProb, tempC, uvVal, windKm, humidity, conditionType, isDay }) {
  const list = document.getElementById("advice-list");
  if (!list) return;

  // Clear any previous advice items
  list.innerHTML = "";

  // Helper: creates one advice card and appends it to the list
  function addAdvice(type, iconSVG, title, detail) {
    // type = 'positive' | 'neutral' | 'warning'
    const item = document.createElement("div");
    item.className = `advice-item advice-${type}`;
    item.innerHTML = `
      <div class="advice-icon-bubble">${iconSVG}</div>
      <div class="advice-text"><h4>${title}</h4><p>${detail}</p></div>
    `;
    list.appendChild(item);
  }

  // ── SVG Icons (inline, no external files needed) ─────────────────────────
  const SVG_UMBRELLA = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 12a10.06 10.06 0 0 0-20 0Z"></path>
    <path d="M12 12v8a2 2 0 0 0 4 0"></path>
    <path d="M12 2v1"></path></svg>`;

  const SVG_SHIRT = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path></svg>`;

  const SVG_SUN = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M12 2v2"></path><path d="M12 20v2"></path>
    <path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path>
    <path d="M2 12h2"></path><path d="M20 12h2"></path>
    <path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`;

  const SVG_MOON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`;

  const SVG_WIND = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path>
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path>
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path></svg>`;

  const SVG_DROPLET = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`;

  const SVG_SNOW = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line>
    <path d="m20 16-4-4 4-4"></path><path d="m4 8 4 4-4 4"></path>
    <path d="m16 4-4 4-4-4"></path><path d="m8 20 4-4 4 4"></path></svg>`;

  const SVG_THUNDER = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"></path></svg>`;

  // ── Advice 1: Rain / Umbrella ─────────────────────────────────────────────
  if (conditionType === "thunder") {
    addAdvice("warning", SVG_THUNDER,
      "⚡ Thunderstorm Alert!",
      "Stay indoors. Dangerous lightning and heavy rain — avoid all outdoor activity.");
  } else if (rainProb >= 70) {
    addAdvice("warning", SVG_UMBRELLA,
      "Take Your Umbrella!",
      `Heavy rain very likely (${rainProb}%). Don't step out without an umbrella and waterproof shoes.`);
  } else if (rainProb >= 35) {
    addAdvice("neutral", SVG_UMBRELLA,
      "Rain Possible — Pack an Umbrella",
      `Showers are likely (${rainProb}%). Keep a light umbrella handy just in case.`);
  } else {
    addAdvice("positive", SVG_UMBRELLA,
      "No Umbrella Needed",
      `Rain probability is low (${rainProb}%). Great conditions for outdoor plans!`);
  }

  // ── Advice 2: Clothing / Temperature ─────────────────────────────────────
  const displayTemp = toDisplayTemp(tempC);
  const unit = currentUnit === "f" ? "°F" : "°C";

  if (conditionType === "snowy" || tempC <= 0) {
    addAdvice("warning", SVG_SNOW,
      `❄️ Freezing! Bundle Up (${displayTemp}${unit})`,
      `Below freezing — heavy coat, gloves, thermal layers, and warm boots are essential.`);
  } else if (tempC <= 8) {
    addAdvice("neutral", SVG_SHIRT,
      `Cold Outside — Dress Warmly (${displayTemp}${unit})`,
      `It's chilly at ${displayTemp}${unit}. Wear a thick jacket and warm layers.`);
  } else if (tempC <= 15) {
    addAdvice("neutral", SVG_SHIRT,
      `Light Jacket Recommended (${displayTemp}${unit})`,
      `Cool at ${displayTemp}${unit} — a light jacket or hoodie will keep you comfortable.`);
  } else if (tempC <= 24) {
    addAdvice("positive", SVG_SHIRT,
      `Perfect Weather — Light Clothing (${displayTemp}${unit})`,
      `Pleasant ${displayTemp}${unit} — a t-shirt or light top is ideal. Enjoy the outdoors!`);
  } else if (tempC <= 30) {
    addAdvice("neutral", SVG_SHIRT,
      `Warm Day — Dress Light (${displayTemp}${unit})`,
      `It's warm at ${displayTemp}${unit}. Wear breathable, light-coloured clothing and stay hydrated.`);
  } else {
    addAdvice("warning", SVG_SHIRT,
      `🔥 Very Hot! Stay Cool (${displayTemp}${unit})`,
      `Extreme heat at ${displayTemp}${unit} — light clothes, lots of water, and shade are a must.`);
  }

  // ── Advice 3: UV / Sun / Night ────────────────────────────────────────────
  if (!isDay) {
    addAdvice("neutral", SVG_MOON,
      "Night Time — No UV Risk",
      "No sun exposure to worry about. Enjoy the evening or get a good night's rest!");
  } else if (uvVal <= 2) {
    addAdvice("positive", SVG_SUN,
      `UV Index Low (${uvVal}) — No Sunscreen Needed`,
      "UV is minimal today. Safe to be outside without special sun protection.");
  } else if (uvVal <= 5) {
    addAdvice("neutral", SVG_SUN,
      `Moderate UV (Index ${uvVal}) — Wear Sunscreen`,
      "Apply SPF 30+ for extended outdoor time, especially between 11am and 3pm.");
  } else if (uvVal <= 7) {
    addAdvice("warning", SVG_SUN,
      `High UV Alert (Index ${uvVal}) — SPF 50+ Required`,
      "Seek shade during peak hours. Sunglasses and sun hat strongly recommended.");
  } else {
    addAdvice("warning", SVG_SUN,
      `🌡️ Extreme UV (Index ${uvVal}) — Avoid Direct Sun!`,
      "Dangerous UV levels. Stay indoors or in shade between 10am–4pm. Full sun protection essential.");
  }

  // ── Advice 4: Wind (only if notably windy) ───────────────────────────────
  if (windKm >= 60) {
    addAdvice("warning", SVG_WIND,
      `🌬️ Strong Winds (${windKm} km/h) — Stay Safe`,
      "Dangerous gusts. Secure loose objects, avoid open areas, and expect travel disruptions.");
  } else if (windKm >= 30) {
    addAdvice("neutral", SVG_WIND,
      `Breezy Conditions (${windKm} km/h)`,
      "Moderate wind — hold onto hats and umbrellas. Great kite-flying weather!");
  }

  // ── Advice 5: Humidity (only if extreme) ─────────────────────────────────
  if (humidity > 85) {
    addAdvice("warning", SVG_DROPLET,
      `Very Humid (${humidity}%) — Feels Muggy`,
      "High humidity makes it feel hotter and sticky. Light, loose clothing and fans help.");
  } else if (humidity < 25) {
    addAdvice("neutral", SVG_DROPLET,
      `Dry Air (${humidity}%) — Stay Hydrated`,
      "Very low humidity can dry out skin and airways. Drink plenty of water and use moisturiser.");
  }
}


/**
 * Injects lightweight HTML particles into the hero card and sets theme classes
 * so CSS keyframes bring the background to life!
 */
function applyWeatherAnimation(weatherType, windSpeed, isDay) {
  if (!animationContainer || !heroCard) return;

  // Clear existing animation elements
  animationContainer.innerHTML = "";

  // Reset theme classes on hero card
  heroCard.classList.remove(
    "is-night",
    "theme-sunny",
    "theme-rainy",
    "theme-windy",
    "theme-cloudy",
    "theme-snowy",
    "theme-thunder"
  );

  // If nighttime, apply the midnight dark mode styling to the hero card
  if (!isDay) {
    heroCard.classList.add("is-night");
  }

  // If wind speed is noticeably high (> 20 km/h), show wind streams
  const isHighWind = windSpeed >= 20;

  switch (weatherType) {
    // Night Clear: Glowing moon halo, 22 twinkling stars & a shooting star!
    case "night-clear":
      const moonGlow = document.createElement("div");
      moonGlow.className = "anim-moon-glow";
      animationContainer.appendChild(moonGlow);

      // Twinkling stars
      for (let i = 0; i < 22; i++) {
        const star = document.createElement("div");
        star.className = "star-twinkle";
        const size = 1.5 + Math.random() * 2.5;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 95}%`;
        star.style.top = `${Math.random() * 85}%`;
        star.style.animationDuration = `${1.5 + Math.random() * 2.5}s`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        animationContainer.appendChild(star);
      }

      // Shooting star
      const shootingStar = document.createElement("div");
      shootingStar.className = "shooting-star";
      animationContainer.appendChild(shootingStar);
      break;

    // Night Cloudy: Twinkling stars + drifting dark clouds
    case "night-cloudy":
      for (let i = 0; i < 14; i++) {
        const star = document.createElement("div");
        star.className = "star-twinkle";
        const size = 1.5 + Math.random() * 2;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 95}%`;
        star.style.top = `${Math.random() * 80}%`;
        star.style.animationDuration = `${2 + Math.random() * 2}s`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        animationContainer.appendChild(star);
      }

      const nightCloud = document.createElement("div");
      nightCloud.className = "cloud-svg-shape";
      nightCloud.style.top = "20px";
      nightCloud.style.right = "30px";
      nightCloud.innerHTML = `
        <svg width="220" height="90" viewBox="0 0 100 45" fill="rgba(51, 65, 85, 0.45)">
          <path d="M 15 35 A 15 15 0 0 1 35 22 A 20 20 0 0 1 70 18 A 16 16 0 0 1 88 35 Z"></path>
        </svg>
      `;
      animationContainer.appendChild(nightCloud);
      break;

    // Night Rain: Falling rain with dark ambiance
    case "night-rainy":
    case "rainy":
      if (isDay) heroCard.classList.add("theme-rainy");
      
      // Thirty dynamic angled raindrops
      for (let i = 0; i < 30; i++) {
        const drop = document.createElement("div");
        drop.className = "rain-drop";
        drop.style.left = `${Math.random() * 105}%`;
        drop.style.top = `${Math.random() * -50}px`;
        drop.style.height = `${20 + Math.random() * 22}px`;
        drop.style.animationDuration = `${0.55 + Math.random() * 0.35}s`;
        drop.style.animationDelay = `${Math.random() * 1.5}s`;
        animationContainer.appendChild(drop);
      }

      // Ground splash ripples
      for (let i = 0; i < 5; i++) {
        const splash = document.createElement("div");
        splash.className = "rain-splash";
        splash.style.left = `${12 + i * 20 + Math.random() * 8}%`;
        splash.style.animationDelay = `${i * 0.25}s`;
        animationContainer.appendChild(splash);
      }
      break;

    case "sunny":
      heroCard.classList.add("theme-sunny");
      
      // 1. Glowing sunbeam core
      const sunGlow = document.createElement("div");
      sunGlow.className = "anim-sun-glow";
      animationContainer.appendChild(sunGlow);

      // 2. Rotating corona ray ring
      const rayRing = document.createElement("div");
      rayRing.className = "sun-ray-ring";
      animationContainer.appendChild(rayRing);

      // 3. Shimmering golden sun bokeh particles
      for (let i = 0; i < 12; i++) {
        const particle = document.createElement("div");
        particle.className = "sun-particle";
        const size = 4 + Math.random() * 6;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.right = `${15 + Math.random() * 110}px`;
        particle.style.top = `${60 + Math.random() * 90}px`;
        particle.style.animationDuration = `${2.5 + Math.random() * 2.5}s`;
        particle.style.animationDelay = `${Math.random() * 2.5}s`;
        animationContainer.appendChild(particle);
      }
      break;

    case "snowy":
      heroCard.classList.add("theme-snowy");
      for (let i = 0; i < 24; i++) {
        const flake = document.createElement("div");
        flake.className = "snowflake";
        flake.style.left = `${Math.random() * 100}%`;
        const size = 3 + Math.random() * 7;
        flake.style.width = `${size}px`;
        flake.style.height = `${size}px`;
        flake.style.animationDuration = `${2.5 + Math.random() * 3}s`;
        flake.style.animationDelay = `${Math.random() * 3}s`;
        animationContainer.appendChild(flake);
      }
      break;

    case "thunder":
      heroCard.classList.add("theme-thunder");
      const flash = document.createElement("div");
      flash.className = "thunder-flash";
      animationContainer.appendChild(flash);

      const bolt = document.createElement("div");
      bolt.className = "thunder-bolt";
      bolt.innerHTML = `
        <svg width="40" height="75" viewBox="0 0 24 24" fill="#f59e0b" stroke="#fbbf24" stroke-width="1.5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      `;
      animationContainer.appendChild(bolt);

      for (let i = 0; i < 25; i++) {
        const drop = document.createElement("div");
        drop.className = "rain-drop";
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.height = `${22 + Math.random() * 16}px`;
        drop.style.animationDuration = `${0.45 + Math.random() * 0.3}s`;
        drop.style.animationDelay = `${Math.random() * 1.2}s`;
        animationContainer.appendChild(drop);
      }
      break;

    case "cloudy":
    default:
      heroCard.classList.add("theme-cloudy");
      const cloudBack = document.createElement("div");
      cloudBack.className = "cloud-svg-shape";
      cloudBack.style.top = "15px";
      cloudBack.style.right = "20px";
      cloudBack.innerHTML = `
        <svg width="220" height="90" viewBox="0 0 100 45" fill="rgba(148, 163, 184, 0.28)">
          <path d="M 15 35 A 15 15 0 0 1 35 22 A 20 20 0 0 1 70 18 A 16 16 0 0 1 88 35 Z"></path>
        </svg>
      `;
      animationContainer.appendChild(cloudBack);

      const cloudFront = document.createElement("div");
      cloudFront.className = "cloud-svg-shape cloud-fast";
      cloudFront.style.top = "45px";
      cloudFront.style.right = "80px";
      cloudFront.innerHTML = `
        <svg width="180" height="75" viewBox="0 0 100 45" fill="rgba(203, 213, 225, 0.42)">
          <path d="M 15 35 A 15 15 0 0 1 35 22 A 20 20 0 0 1 70 18 A 16 16 0 0 1 88 35 Z"></path>
        </svg>
      `;
      animationContainer.appendChild(cloudFront);
      break;
  }

  // If wind is high or daytime, add flowing breeze streams
  if (isHighWind || (isDay && weatherType === "sunny")) {
    for (let i = 0; i < (isHighWind ? 5 : 2); i++) {
      const wind = document.createElement("div");
      wind.className = "wind-stream";
      wind.style.top = `${25 + i * 38}px`;
      wind.style.width = `${140 + Math.random() * 160}px`;
      wind.style.animationDuration = `${1.6 + Math.random() * 1.4}s`;
      wind.style.animationDelay = `${i * 0.5}s`;
      animationContainer.appendChild(wind);
    }

    if (isDay) {
      for (let i = 0; i < (isHighWind ? 4 : 2); i++) {
        const leaf = document.createElement("div");
        leaf.className = "wind-leaf";
        leaf.style.top = `${20 + i * 42}px`;
        leaf.style.animationDuration = `${2.4 + Math.random() * 2}s`;
        leaf.style.animationDelay = `${i * 0.9}s`;
        animationContainer.appendChild(leaf);
      }
    }
  }
}

// =============================================================================
// 6. UI Helpers & Formatting
// =============================================================================

function selectLocation(location) {
  currentLocation = {
    name: location.name,
    country: location.country || "",
    admin1: location.admin1 || "",
    latitude: location.latitude,
    longitude: location.longitude,
  };

  // Persist last searched city in localStorage so it reloads on next visit
  try {
    localStorage.setItem("weatherwise_last_city", JSON.stringify(currentLocation));
  } catch(e) { /* Ignore storage quota errors */ }

  cityNameEl.textContent = currentLocation.name;
  const regionParts = [currentLocation.admin1, currentLocation.country].filter(Boolean);
  countryNameEl.innerHTML = `${regionParts.join(", ")} <span class="city-coords" id="city-coords">(${formatCoords(
    currentLocation.latitude,
    currentLocation.longitude
  )})</span>`;

  searchInput.value = currentLocation.admin1
    ? `${currentLocation.name}, ${currentLocation.admin1}`
    : `${currentLocation.name}, ${currentLocation.country}`;

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dayName = now.toLocaleDateString([], { weekday: "long" });
  timestampEl.textContent = `${dayName}, ${timeString} • Live data via Open-Meteo`;

  hideDropdown();

  // Fetch real-time weather and air quality immediately for this location!
  fetchWeatherData(currentLocation.latitude, currentLocation.longitude);
  fetchAirQualityData(currentLocation.latitude, currentLocation.longitude);
}

let activeSuggestionIndex = -1;

function renderDropdown(results, highlightQuery = "") {
  searchDropdown.innerHTML = "";
  activeSuggestionIndex = -1;

  results.forEach((city, index) => {
    const item = document.createElement("div");
    item.className = "search-dropdown-item";
    item.dataset.index = index;

    const regionText = [city.admin1, city.country].filter(Boolean).join(", ");
    const coordsText = formatCoords(city.latitude, city.longitude);

    let cityNameHTML = city.name;
    if (highlightQuery && highlightQuery.trim().length > 0) {
      const q = highlightQuery.trim();
      const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
      cityNameHTML = city.name.replace(regex, '<span class="match-highlight">$1</span>');
    }

    item.innerHTML = `
      <div class="dropdown-item-left">
        <span class="dropdown-city">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          ${cityNameHTML}
        </span>
        <span class="dropdown-country">${regionText}</span>
      </div>
      <span class="dropdown-coords">${coordsText}</span>
    `;

    item.addEventListener("click", () => {
      selectLocation(city);
    });

    item.addEventListener("mouseenter", () => {
      activeSuggestionIndex = index;
      updateSuggestionHighlight();
    });

    searchDropdown.appendChild(item);
  });

  searchDropdown.classList.remove("hidden");
}

function updateSuggestionHighlight() {
  const items = searchDropdown.querySelectorAll(".search-dropdown-item");
  items.forEach((it, idx) => {
    it.classList.toggle("active", idx === activeSuggestionIndex);
    if (idx === activeSuggestionIndex) {
      it.scrollIntoView({ block: "nearest" });
    }
  });
}

function updateUvBadge(uv) {
  // Clear any inline styles so CSS handles light vs dark mode cleanly
  badgeUv.style.backgroundColor = "";
  badgeUv.style.color = "";

  if (uv <= 2) {
    badgeUv.textContent = "Low";
    badgeUv.className = "metric-badge-status status-low";
    subtextUv.textContent = "No special sun protection needed.";
  } else if (uv <= 5) {
    badgeUv.textContent = "Moderate";
    badgeUv.className = "metric-badge-status status-moderate";
    subtextUv.textContent = "Wear sunscreen during midday.";
  } else if (uv <= 7) {
    badgeUv.textContent = "High";
    badgeUv.className = "metric-badge-status status-high";
    subtextUv.textContent = "Seek shade and wear sunglasses.";
  } else {
    badgeUv.textContent = "Very High";
    badgeUv.className = "metric-badge-status status-extreme";
    subtextUv.textContent = "Avoid outdoor sun exposure.";
  }
}

function degreesToCompass(deg) {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const val = Math.floor((deg / 22.5) + 0.5);
  return directions[val % 16];
}

function format12HourTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatCoords(lat, lon) {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}° ${latDir}, ${Math.abs(lon).toFixed(2)}° ${lonDir}`;
}

function showStatus(msg, type = "info") {
  searchStatus.textContent = msg;
  searchStatus.className = `search-status ${type}`;
  searchStatus.classList.remove("hidden");
}

function hideStatus() {
  searchStatus.classList.add("hidden");
}

function hideDropdown() {
  searchDropdown.classList.add("hidden");
}

function setLoading(isLoading) {
  const btnText = searchBtn.querySelector(".btn-text");
  const btnSpinner = searchBtn.querySelector(".btn-spinner");
  if (isLoading) {
    searchBtn.classList.add("loading");
    searchBtn.disabled = true;
    if (btnText) btnText.classList.add("hidden");
    if (btnSpinner) btnSpinner.classList.remove("hidden");
  } else {
    searchBtn.classList.remove("loading");
    searchBtn.disabled = false;
    if (btnText) btnText.classList.remove("hidden");
    if (btnSpinner) btnSpinner.classList.add("hidden");
  }
}

// =============================================================================
// 7. Dynamic SVG Weather Icons Generator
// =============================================================================
function getWeatherIconSVG(iconType, size = 72) {
  switch (iconType) {
    case "moon":
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="#c7d2fe"></path>
        </svg>`;

    case "moon-cloud":
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="#c7d2fe"></path>
          <path d="M17.5 19H9a5 5 0 1 1 .9-9.92 4.5 4.5 0 0 1 8.5 2.5 3.5 3.5 0 0 1-.9 7.42Z" stroke="#94a3b8" fill="#1e293b"></path>
        </svg>`;

    case "moon-rain":
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="#c7d2fe" stroke="#a5b4fc"></path>
          <path d="M17.5 19H9a5 5 0 1 1 .9-9.92 4.5 4.5 0 0 1 8.5 2.5 3.5 3.5 0 0 1-.9 7.42Z" stroke="#94a3b8" fill="#1e293b"></path>
          <line x1="8" y1="19" x2="8" y2="23"></line>
          <line x1="12" y1="21" x2="12" y2="25"></line>
          <line x1="16" y1="19" x2="16" y2="23"></line>
        </svg>`;

    case "sun":
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5" fill="#fef3c7"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>`;

    case "rain":
    case "drizzle":
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" fill="#eff6ff"></path>
          <path d="M16 14v6"></path>
          <path d="M8 14v6"></path>
          <path d="M12 16v6"></path>
        </svg>`;

    case "snow":
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" fill="#f0f9ff"></path>
          <line x1="8" y1="16" x2="8.01" y2="16"></line>
          <line x1="8" y1="20" x2="8.01" y2="20"></line>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
          <line x1="12" y1="22" x2="12.01" y2="22"></line>
          <line x1="16" y1="16" x2="16.01" y2="16"></line>
          <line x1="16" y1="20" x2="16.01" y2="20"></line>
        </svg>`;

    case "thunderstorm":
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" fill="#e0e7ff"></path>
          <polyline points="13 11 9 17 15 17 11 23" stroke="#f59e0b" fill="#fef3c7"></polyline>
        </svg>`;

    case "cloud":
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="#f1f5f9"></path>
        </svg>`;

    case "partly-cloudy":
    default:
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="M20 12h2"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
          <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"></path>
          <path d="M17.5 19H9a5 5 0 1 1 .9-9.92 4.5 4.5 0 0 1 8.5 2.5 3.5 3.5 0 0 1-.9 7.42Z" stroke="#3b82f6" fill="#eff6ff"></path>
        </svg>`;
  }
}

// =============================================================================
// 8. Event Listeners & Startup Initialization
// =============================================================================
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  searchCityGeocoding(searchInput.value);
});

// Live City Search Auto-Suggestions as the user types (Debounced 220ms)
let searchDebounceTimer = null;

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  clearTimeout(searchDebounceTimer);
  activeSuggestionIndex = -1;

  if (query.length < 2) {
    hideDropdown();
    return;
  }

  searchDebounceTimer = setTimeout(async () => {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        renderDropdown(data.results, query);
      } else {
        hideDropdown();
      }
    } catch (err) {
      console.warn("[WeatherWise] Auto-suggest error:", err);
    }
  }, 220);
});

// Keyboard navigation in search suggestions dropdown
searchInput.addEventListener("keydown", (e) => {
  const items = searchDropdown.querySelectorAll(".search-dropdown-item");
  if (!items.length || searchDropdown.classList.contains("hidden")) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
    updateSuggestionHighlight();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
    updateSuggestionHighlight();
  } else if (e.key === "Enter" && activeSuggestionIndex >= 0) {
    e.preventDefault();
    items[activeSuggestionIndex].click();
  }
});

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
  hideDropdown();
  hideStatus();
});

document.addEventListener("click", (e) => {
  if (!searchForm.contains(e.target)) {
    hideDropdown();
  }
});

cityChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    cityChips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    searchInput.value = chip.textContent;
    searchCityGeocoding(chip.textContent);
  });
});

// Theme Toggle Handler (Light Mode <-> Dark Mode)
function setTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    if (iconSun) iconSun.classList.remove("hidden");
    if (iconMoon) iconMoon.classList.add("hidden");
  } else {
    document.body.classList.remove("dark-mode");
    if (iconSun) iconSun.classList.add("hidden");
    if (iconMoon) iconMoon.classList.remove("hidden");
  }
  localStorage.setItem("weatherwise_theme", theme);
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-mode");
    setTheme(isDark ? "light" : "dark");
  });
}

// Unit Switcher Handler (°C <-> °F)
unitOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const selectedUnit = option.getAttribute("data-unit");
    if (selectedUnit === currentUnit) return;

    currentUnit = selectedUnit;
    unitOptions.forEach((opt) => {
      opt.classList.toggle("active", opt.getAttribute("data-unit") === currentUnit);
    });

    localStorage.setItem("weatherwise_unit", currentUnit);

    // Immediately re-render with cached live weather (instant zero-delay conversion!)
    if (lastWeatherData) {
      updateWeatherUI(lastWeatherData);
    }
  });
});

// =============================================================================
// 9. Milestone 7 — Final Polish Features
// =============================================================================

// ── M7.1: "Use My Location" GPS function & button ─────────────────────────────
const geolocateBtn = document.getElementById("geolocate-btn");

/**
 * Prompts user for GPS location permission and loads local weather for their coordinates.
 * @param {boolean} isAutoPrompt - true if prompted automatically on website open
 */
function requestUserLocation(isAutoPrompt = false) {
  // Check if the browser supports geolocation
  if (!navigator.geolocation) {
    if (!isAutoPrompt) {
      showStatus("Your browser doesn't support GPS location.", "error");
    }
    return;
  }

  // Show a spinning animation while locating
  if (geolocateBtn) {
    geolocateBtn.classList.add("locating");
  }

  if (isAutoPrompt) {
    showStatus("📍 Detecting your location to show local weather...", "info");
  } else {
    showStatus("📍 Detecting your current location...", "info");
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      if (geolocateBtn) geolocateBtn.classList.remove("locating");
      hideStatus();

      let cityName = "Current Location";
      let countryName = "";
      let admin1Name = "";

      // Attempt reverse geocoding via BigDataCloud (fast, CORS-friendly client API)
      try {
        const revUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
        const res = await fetch(revUrl);
        if (res.ok) {
          const geo = await res.json();
          cityName = geo.city || geo.locality || geo.principalSubdivision || "Current Location";
          countryName = geo.countryName || "";
          admin1Name = geo.principalSubdivision || "";
        }
      } catch (e) {
        console.warn("[WeatherWise] Reverse geocode lookup failed, using coordinates fallback.", e);
      }

      // Deactivate popular chips since we're using current GPS
      document.querySelectorAll(".city-chip").forEach(c => c.classList.remove("active"));

      console.log(`[WeatherWise] 📍 Local GPS detected: ${cityName}, ${countryName} (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);

      selectLocation({
        name: cityName,
        country: countryName,
        admin1: admin1Name,
        latitude: latitude,
        longitude: longitude,
      });
    },
    (err) => {
      if (geolocateBtn) geolocateBtn.classList.remove("locating");
      hideStatus();

      const msgs = {
        1: "Location access was denied. You can search for your city above or click GPS to try again.",
        2: "Location is unavailable on this device. Try searching by city name.",
        3: "Location detection timed out. Please try clicking the GPS button again.",
      };

      if (!isAutoPrompt) {
        showStatus(msgs[err.code] || "Could not detect location.", "error");
      } else {
        console.info(`[WeatherWise] Geolocation prompt: ${msgs[err.code] || err.message}`);
      }
    },
    { timeout: 12000, maximumAge: 60000, enableHighAccuracy: false }
  );
}

if (geolocateBtn) {
  geolocateBtn.addEventListener("click", () => {
    requestUserLocation(false);
  });
}

// ── M7.3: Keyboard shortcut — press "/" to focus search bar ──────────────────
document.addEventListener("keydown", (e) => {
  // "/" key focuses search, Escape blurs it
  if (e.key === "/" && document.activeElement !== searchInput) {
    e.preventDefault();         // Don't type "/" into the input
    searchInput.focus();
    searchInput.select();       // Select all text so user can type instantly
  }
  if (e.key === "Escape") {
    searchInput.blur();
    hideDropdown();
  }
});

// ── M7.4: Back To Top button (shows after scrolling down 300px) ───────────────
const backToTopBtn = document.getElementById("back-to-top");

if (backToTopBtn) {
  // Show button when user scrolls more than 300px down
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  });

  // Smooth scroll to top when clicked
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ── M7.5: "Last Searched" city chip in quick-chips bar ───────────────────────
function injectLastCityChip() {
  try {
    const saved = localStorage.getItem("weatherwise_last_city");
    if (!saved) return;

    const loc = JSON.parse(saved);
    // Don't add if it's already one of the default chips
    const defaults = ["New York", "London", "Tokyo", "Paris", "Sydney"];
    if (defaults.includes(loc.name)) return;

    const chipsRow = document.querySelector(".quick-chips");
    if (!chipsRow) return;

    // Remove any old "last city" chip (avoid duplicates on hot reload)
    const old = chipsRow.querySelector(".chip-last-city");
    if (old) old.remove();

    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip-last-city";
    chip.title = `Return to ${loc.name}`;
    chip.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 14 4 9l5-5"></path><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"></path>
      </svg>
      ${loc.name}`;

    chip.addEventListener("click", () => {
      document.querySelectorAll(".city-chip").forEach(c => c.classList.remove("active"));
      selectLocation(loc);
    });

    // Insert as first chip
    const firstChip = chipsRow.querySelector(".city-chip");
    chipsRow.insertBefore(chip, firstChip);
  } catch(e) { /* Ignore */ }
}

// ── MagicBento Interactive Cursor Spotlight Tracking ─────────────────────────
function initMagicBentoSpotlights() {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mb-x", `${x.toFixed(1)}px`);
      card.style.setProperty("--mb-y", `${y.toFixed(1)}px`);
    });
    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--mb-x", `-999px`);
      card.style.setProperty("--mb-y", `-999px`);
    });
  });
}

// ============================================================================
// Interactive <CursorGrid /> Component Engine (React Bits Port for Vanilla JS)
// ============================================================================
function initCursorGrid() {
  const canvas = document.getElementById("cursor-grid-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Configuration Props (matching React Bits CursorGrid defaults)
  const config = {
    cellSize: 60,
    radius: 140,
    holdTime: 400,
    fadeDuration: 800,
    lineWidth: 1,
    maxOpacity: 1,
    fillOpacity: 0.08,
    gridOpacity: 0.09,
    spotlight: 0.6,
    clickPulse: true,
    pulseSpeed: 600,
    ambient: 0.03,
    edgeFade: 0.2,
    intro: true
  };

  let width = 0;
  let height = 0;
  let cols = 0;
  let rows = 0;
  let dpr = 1;
  let isRunning = false;
  let animId = null;

  // Active lit cells: key = r * cols + c -> { lastHit: timestamp, peak: number }
  const activeCells = new Map();
  // Active expanding pulses from clicks: { x, y, startTime, maxRadius }
  const activePulses = [];

  let mouseX = -9999;
  let mouseY = -9999;
  let mouseActive = false;
  let lastMouseMoveTime = 0;
  let lastAmbientTime = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    cols = Math.ceil(width / config.cellSize) + 1;
    rows = Math.ceil(height / config.cellSize) + 1;

    activeCells.clear();
    requestTick();
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  function triggerCell(col, row, intensity, time) {
    if (col < 0 || col >= cols || row < 0 || row >= rows) return;
    const key = row * cols + col;
    const existing = activeCells.get(key);
    if (!existing) {
      activeCells.set(key, { lastHit: time, peak: Math.min(intensity, 1) });
    } else {
      existing.lastHit = time;
      existing.peak = Math.min(1, Math.max(existing.peak * 0.5, intensity));
    }
  }

  // Pointer Movement tracking across entire window & through frosted glass cards
  window.addEventListener("pointermove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseActive = true;
    lastMouseMoveTime = performance.now();
    requestTick();
  }, { passive: true });

  window.addEventListener("pointerleave", () => {
    mouseActive = false;
    requestTick();
  });

  // Click pulse wave (React Bits clickPulse: true)
  if (config.clickPulse) {
    window.addEventListener("pointerdown", (e) => {
      // Ignore right clicks or auxiliary clicks
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const now = performance.now();
      const maxR = Math.hypot(width, height) * 0.95;
      activePulses.push({
        x: e.clientX,
        y: e.clientY,
        startTime: now,
        maxRadius: maxR
      });
      requestTick();
    });
  }

  // Intro expanding wave from the center (React Bits intro: true)
  if (config.intro) {
    setTimeout(() => {
      const now = performance.now();
      activePulses.push({
        x: width / 2,
        y: height / 2,
        startTime: now,
        maxRadius: Math.hypot(width, height) * 0.95
      });
      requestTick();
    }, 250);
  }

  function requestTick() {
    if (!isRunning) {
      isRunning = true;
      animId = requestAnimationFrame(render);
    }
  }

  function render(now) {
    // Determine active colors based on current theme (dark-mode vs light)
    const isDark = document.body.classList.contains("dark-mode");

    const gridStrokeColor = isDark
      ? `rgba(59, 130, 246, ${config.gridOpacity * 1.3})`
      : `rgba(37, 99, 235, ${config.gridOpacity})`;

    const spotlightColor = isDark
      ? `rgba(56, 189, 248, ${config.spotlight * 0.35})`
      : `rgba(37, 99, 235, ${config.spotlight * 0.18})`;

    const cellFillBase = isDark
      ? (alpha) => `rgba(14, 165, 233, ${(config.fillOpacity * alpha * 1.5).toFixed(3)})`
      : (alpha) => `rgba(37, 99, 235, ${(config.fillOpacity * alpha).toFixed(3)})`;

    const cellStrokeBase = isDark
      ? (alpha) => `rgba(96, 165, 250, ${(0.85 * alpha).toFixed(3)})`
      : (alpha) => `rgba(37, 99, 235, ${(0.7 * alpha).toFixed(3)})`;

    const pulseRingColor = isDark
      ? (alpha) => `rgba(56, 189, 248, ${(0.45 * alpha).toFixed(3)})`
      : (alpha) => `rgba(37, 99, 235, ${(0.35 * alpha).toFixed(3)})`;

    // 1. Process Cursor Proximity Area
    if (mouseActive) {
      const minCol = Math.max(0, Math.floor((mouseX - config.radius) / config.cellSize));
      const maxCol = Math.min(cols - 1, Math.ceil((mouseX + config.radius) / config.cellSize));
      const minRow = Math.max(0, Math.floor((mouseY - config.radius) / config.cellSize));
      const maxRow = Math.min(rows - 1, Math.ceil((mouseY + config.radius) / config.cellSize));

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const cx = (c + 0.5) * config.cellSize;
          const cy = (r + 0.5) * config.cellSize;
          const dist = Math.hypot(cx - mouseX, cy - mouseY);
          if (dist <= config.radius) {
            // Smooth falloff curve: s = t * t * (3 - 2 * t)
            const t = 1 - dist / config.radius;
            const s = t * t * (3 - 2 * t);
            triggerCell(c, r, s, now);
          }
        }
      }
    }

    // 2. Process Click Pulses
    for (let i = activePulses.length - 1; i >= 0; i--) {
      const p = activePulses[i];
      const elapsed = (now - p.startTime) * 0.001; // in seconds
      const currentRadius = elapsed * config.pulseSpeed;

      if (currentRadius > p.maxRadius) {
        activePulses.splice(i, 1);
        continue;
      }

      const ringWidth = 50;
      const pulseFade = Math.max(0, 1 - currentRadius / p.maxRadius);

      const minCol = Math.max(0, Math.floor((p.x - currentRadius - ringWidth) / config.cellSize));
      const maxCol = Math.min(cols - 1, Math.ceil((p.x + currentRadius + ringWidth) / config.cellSize));
      const minRow = Math.max(0, Math.floor((p.y - currentRadius - ringWidth) / config.cellSize));
      const maxRow = Math.min(rows - 1, Math.ceil((p.y + currentRadius + ringWidth) / config.cellSize));

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const cx = (c + 0.5) * config.cellSize;
          const cy = (r + 0.5) * config.cellSize;
          const dist = Math.hypot(cx - p.x, cy - p.y);
          const diff = Math.abs(dist - currentRadius);
          if (diff < ringWidth) {
            const ringIntensity = (1 - diff / ringWidth) * pulseFade;
            triggerCell(c, r, ringIntensity, now);
          }
        }
      }
    }

    // 3. Subtle Ambient Twinkle
    if (config.ambient > 0 && now - lastAmbientTime > 1400) {
      lastAmbientTime = now;
      const randCol = Math.floor(Math.random() * cols);
      const randRow = Math.floor(Math.random() * rows);
      triggerCell(randCol, randRow, 0.45, now);
    }

    // Clear and draw onto HiDPI canvas
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // 4. Draw Base Grid Lines
    ctx.beginPath();
    ctx.lineWidth = config.lineWidth;
    ctx.strokeStyle = gridStrokeColor;

    for (let c = 0; c <= cols; c++) {
      const x = c * config.cellSize;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let r = 0; r <= rows; r++) {
      const y = r * config.cellSize;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // 5. Draw Cursor Spotlight on Grid Lines
    if (mouseActive && config.spotlight > 0) {
      const spotGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, config.radius);
      spotGrad.addColorStop(0, spotlightColor);
      spotGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.save();
      ctx.strokeStyle = spotGrad;
      ctx.lineWidth = config.lineWidth + 0.75;
      ctx.beginPath();

      const minCol = Math.max(0, Math.floor((mouseX - config.radius) / config.cellSize));
      const maxCol = Math.min(cols, Math.ceil((mouseX + config.radius) / config.cellSize));
      const minRow = Math.max(0, Math.floor((mouseY - config.radius) / config.cellSize));
      const maxRow = Math.min(rows, Math.ceil((mouseY + config.radius) / config.cellSize));

      for (let c = minCol; c <= maxCol; c++) {
        const x = c * config.cellSize;
        ctx.moveTo(x, Math.max(0, mouseY - config.radius));
        ctx.lineTo(x, Math.min(height, mouseY + config.radius));
      }
      for (let r = minRow; r <= maxRow; r++) {
        const y = r * config.cellSize;
        ctx.moveTo(Math.max(0, mouseX - config.radius), y);
        ctx.lineTo(Math.min(width, mouseX + config.radius), y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 6. Draw Expanding Wave Rings
    for (let i = 0; i < activePulses.length; i++) {
      const p = activePulses[i];
      const elapsed = (now - p.startTime) * 0.001;
      const currentRadius = elapsed * config.pulseSpeed;
      const pulseFade = Math.max(0, 1 - currentRadius / p.maxRadius);
      if (pulseFade > 0 && currentRadius > 0) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = pulseRingColor(pulseFade);
        ctx.stroke();
      }
    }

    // 7. Draw Active Lit Cells
    let hasLiveCells = false;
    const totalDuration = config.holdTime + config.fadeDuration;

    activeCells.forEach((cell, key) => {
      const elapsed = now - cell.lastHit;
      if (elapsed >= totalDuration) {
        activeCells.delete(key);
        return;
      }

      hasLiveCells = true;
      let alpha = cell.peak;
      if (elapsed > config.holdTime) {
        const fadeT = (elapsed - config.holdTime) / config.fadeDuration;
        // Smooth quadratic decay
        alpha = cell.peak * (1 - fadeT * fadeT);
      }

      if (alpha <= 0.005) {
        activeCells.delete(key);
        return;
      }

      const r = Math.floor(key / cols);
      const c = key % cols;
      const x = c * config.cellSize;
      const y = r * config.cellSize;

      // Soft filled tile
      ctx.fillStyle = cellFillBase(alpha);
      ctx.fillRect(x + 1, y + 1, config.cellSize - 2, config.cellSize - 2);

      // Lit outline border
      ctx.strokeStyle = cellStrokeBase(alpha);
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, config.cellSize - 1, config.cellSize - 1);
    });

    // 8. Subtle Edge Vignette Fade (React Bits edgeFade: 0.2)
    if (config.edgeFade > 0) {
      const edgeGrad = ctx.createRadialGradient(
        width / 2, height / 2, Math.min(width, height) * 0.35,
        width / 2, height / 2, Math.max(width, height) * 0.72
      );
      const fadeBg = isDark ? "rgba(7, 11, 20, 0.45)" : "rgba(248, 250, 252, 0.45)";
      edgeGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
      edgeGrad.addColorStop(1, fadeBg);

      ctx.fillStyle = edgeGrad;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();

    // 9. Frame Throttling / Sleep when idle to save CPU/Battery
    const isMouseMovingRecently = mouseActive && (now - lastMouseMoveTime < 600);
    const hasPulses = activePulses.length > 0;

    if (hasLiveCells || hasPulses || isMouseMovingRecently) {
      animId = requestAnimationFrame(render);
    } else {
      isRunning = false;
    }
  }

  // Also hook into Theme Toggle so colors update immediately when user flips mode
  const themeToggle = document.getElementById("theme-toggle-btn");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      setTimeout(requestTick, 20);
    });
  }
}

// Kick off immediately on page load with initial city and preferences!
window.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize CursorGrid Interactive Background Component (React Bits)
  initCursorGrid();

  // 2. Initialize MagicBento Spotlight Effects across all cards
  initMagicBentoSpotlights();

  // 3. Restore saved theme or default to system preference
  const savedTheme = localStorage.getItem("weatherwise_theme") || 
    (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  setTheme(savedTheme);

  // 3. Restore saved temperature unit (°C or °F)
  const savedUnit = localStorage.getItem("weatherwise_unit") || "c";
  currentUnit = savedUnit;
  unitOptions.forEach((opt) => {
    opt.classList.toggle("active", opt.getAttribute("data-unit") === currentUnit);
  });

  // 4. M7.5: Inject last city chip before loading weather
  injectLastCityChip();

  // 5. M7.1: Restore last searched city — or fall back to default New York
  const savedCityRaw = localStorage.getItem("weatherwise_last_city");
  if (savedCityRaw) {
    try {
      const savedCity = JSON.parse(savedCityRaw);
      console.log(`[WeatherWise] Restoring last city: ${savedCity.name}`);
      currentLocation = savedCity;
    } catch(e) {
      console.warn("[WeatherWise] Could not restore last city, using default.");
    }
  }

  // Render saved/default city immediately so the UI is responsive from the start
  selectLocation(currentLocation);

  // 6. Ask for user's GPS location on website opening and set location there!
  requestUserLocation(true);

  console.log("WeatherWise ✅ Initialized — Theme, Unit, Last City restored & Geolocation prompted!");
});
