# Local development (beginner friendly)

These steps help you run Firebase locally with emulators and deploy functions later.

## 1) Install required tools
- Node.js 20: https://nodejs.org/en/download/package-manager
- Git: https://git-scm.com/downloads
- Firebase CLI: https://firebase.google.com/docs/cli#install_the_firebase_cli
  - After installing, login: `firebase login`

## 2) Get your Firebase web app config
- Go to https://console.firebase.google.com
- Create (or select) your project.
- In Project Settings → General → Your apps → Web app, copy the config values.

## 3) Set environment variables
- In the project folder, copy `.env.example` to `.env`.
- Paste the values you copied into `.env` next to each key.
- Do NOT commit `.env` to Git if your workflow blocks it; `.env` is for your computer.

## 4) Install dependencies
- At the repo root: `yarn install` (or `npm install`)
- Then go to functions folder: `cd functions && npm install`

## 5) Build Cloud Functions
- In the `functions` folder: `npm run build`

## 6) Start local emulators
- From the repo root: `firebase emulators:start`
- The Emulator UI will open (usually http://127.0.0.1:4000)

## 7) Test that it works
- Ping function: `curl http://127.0.0.1:5001/YOUR_PROJECT_ID/us-central1/ping`
  - Replace `YOUR_PROJECT_ID` with your Firebase project ID (see Project Settings).
- Create a test user (in Emulator UI under Auth), then check Database → `users/{uid}` was created.

## 8) Next steps
- When ready to deploy: `cd functions && npm run deploy` (this deploys functions only)
- Keep converting your JS files to TS over time. The project is already configured to allow both.

If you get stuck, share the error message and we can help.