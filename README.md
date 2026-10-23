# VALTEX Trading — Interactive B2B Wholesale Platform & Logistics Dashboard

A high-performance client-side web application for green coffee importers and roasting procurement teams. Engineered using a modular, task-driven Gulp build system, this portal integrates public corporate presentation layers with a secure, stateful wholesale private dashboard toggled reactively via client-side state management.

*Note: This repository hosts an end-to-end frontend architecture derived from a real-world commercial asset. My mission was to engineer the automated Gulp pipeline, transition monolithic assets into a structured component-driven SCSS ecosystem, construct a reactive vector animation engine, and deliver 100% network-independent autonomy.*

## 🛠 Tech Stack & Engineering Core
- **Build Automation & Pipeline:** Gulp 4+ (Task-driven modular architecture with post-processing media query grouping)
- **Script Bundling:** Webpack (Integrated script compilation and asset mapping)
- **Preprocessors & Architecture:** SCSS / SASS (Strict BEM methodology, 7-1 architectural split with nested responsive media matrix)
- **Animation Suite:** GSAP 3+ (MotionPathPlugin, custom programmatic Timelines for traffic control)

## 💡 Key Technical & Architectural Features Engineered by Me:

- **Programmatic Dynamic Traffic Engine:** Architected a zero-overhead, data-driven vector traffic generator utilizing GSAP `MotionPathPlugin`. The script measures physical paths at runtime via the SVG `.getTotalLength()` API, mathematically standardizing velocities (`pixelsPerSecond`) across asymmetrical lanes to eliminate unnatural movement anomalies.
- **Bi-Directional Alignment Correctors:** Built self-correcting vector trajectory hooks. By sampling precise path coordinates on the fly using `.getPointAtLength()`, the runtime programmatically identifies inverse curves drawn in Figma and applies dynamic `scaleY` properties, ensuring simulated cargo fleets maintain flawless spatial orientation.
- **Stateful Performance & Lifecycle Optimization:** Designed a high-efficiency pause/resume pipeline tied directly to UI visibility states and window resizing events. When hidden via CSS boundaries, frozen by responsive breakpoints (<=768px), or when the user is authorized, the engine halts all active GSAP timelines in memory. This eliminates idle background calculations, maintaining a 0% CPU overhead signature.
- **Secure Client-Side B2B Dashboard Isolation:** Engineered a network-independent authentication simulator backing a complex wholesale interface. JavaScript orchestrates state changes cleanly via atomic `.is-hidden` modifiers on protected DOM nodes, while validated accounts unlock sensitive corporate data pools: financial ledgers, debt aging matrices, dynamic QR-code invoicing, and reservation tracking.
- **Encapsulated & Reusable Event Matrix:** Packaged the interactive map lifecycle into an autonomous, configuration-agnostic arrow function (`initSvgTraffic`). All underlying identifiers and markers are exposed via generic data-attributes, completely shielding global execution spaces from element naming collisions during layout updates or window resize triggers.
- **Persistent Offline Mock Data Architecture:** Developed a resilient client-side storage adapter synced with the browser's `localStorage` API. Seamlessly handles user registration records, credentials validation, custom profile settings, and persistent order tracking tables without requiring an active database connection.

## ⚙️ Available Scripts

In the project directory, you can run the following automated scripts:

### `npm run dev`
Launches the local Gulp development environment. Compiles asset paths, watches for real-time SCSS/JS modifications, and boots up a local server environment with Hot Reload.

### `npm run build`
Compiles, minifies, and optimizes production-ready assets inside the root `/dist` directory. Performs image compression, script bundling, and file structure mapping.

### `npm run deploy`
Automated continuous deployment script via the `gh-pages` provider compatibility layer. Automatically builds the production assets and pushes the `/dist` contents straight to the isolated GitHub Pages rendering branch.
