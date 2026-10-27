# Golf Caddie

A mobile-first Angular starter for a personal golf club-selection assistant. Club distances in the sample bag are clearly marked as estimates; the simple starter suggestion compares the pin distance with each active club's carry number and does not adjust for conditions.

## Development

This project uses Angular 22 and Node.js 22.22.3. With nvm installed:

```bash
cd ~/Documents/Projects/golf-caddie
nvm use
npm start
```

Open [http://localhost:4200](http://localhost:4200). The dev server reloads when source files change. `npm run build` creates the production build; `npm test` runs the configured unit tests.

## PWA and iPhone installation

Angular's PWA package provides the web app manifest, icon set, and service worker configuration. The service worker is enabled in production builds; development mode does not register it. Offline behavior has not been verified.

For a normal deployment and iPhone Home Screen installation, serve the app over HTTPS. Localhost is suitable for local development. On iPhone, open the deployed HTTPS address in Safari and use **Share → Add to Home Screen**. Keep the site hosted at the same URL so the app can receive updates.

## Local data

The club bag is stored in this browser's local storage on this device. No account or backend is used. Clearing browser data removes saved clubs. Sample clubs are loaded in memory only when there is no valid saved bag; the app does not overwrite a saved bag automatically.
