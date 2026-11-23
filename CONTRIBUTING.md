# Contributing to WeatherWise

Thank you for your interest in contributing to **WeatherWise**!

## How to Contribute

1. **Fork the Repository**:
   Click the "Fork" button at the top right of the GitHub repository page.

2. **Clone your Fork**:
   ```bash
   git clone https://github.com/<your-username>/WeatherWise.git
   cd WeatherWise
   ```

3. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Your Changes**:
   - Write clean, well-commented HTML, CSS, and JavaScript.
   - Maintain responsiveness and cross-browser compatibility.
   - Test your changes locally by serving the project (e.g. `npx serve .` or Python `python -m http.server 5500`).

5. **Commit and Push**:
   ```bash
   git commit -m "Add: descriptive summary of your feature"
   git push origin feature/your-feature-name
   ```

6. **Submit a Pull Request**:
   Open a Pull Request against the `main` branch with a description of your improvements.

## Code Standards
- Keep HTML semantic and accessible.
- Maintain CSS variable naming conventions in `style.css`.
- Ensure clean asynchronous error handling for API calls in `app.js`.
