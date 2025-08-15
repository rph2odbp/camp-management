# Kateri Camper Management Platform

## Overview

A multi-tenant web application for camp management, built with Firebase, Google Cloud, and React. This platform replaces spreadsheets and manual processes with a secure, centralized solution for Parents, Staff, and Administrators.

## Features

- **Parent Portal**: Registration, camper profile, session enrollment, document uploads, messaging.
- **Staff Portal**: Secure login, employment management, schedules, camper info.
- **Admin Portal**: User/session management, financial reporting, medical panel, AI-powered dashboard, communications.

## Tech Stack

- **Frontend**: React + Vite (`packages/web`)
- **Backend**: Firebase Cloud Functions (TypeScript) (`packages/functions`)
- **Database**: Cloud Firestore
- **AI Integration**: Vertex AI
- **Dev Env**: Firebase Emulator Suite, IDX Cloud IDE

## Repository Structure

```plaintext
kateri-monorepo/
  packages/
    web/         # React frontend
    functions/   # Cloud Functions backend
    shared/      # Shared types/interfaces
  firestore.rules
  firebase.json
  package.json   # Yarn workspaces
.idx/
  dev.nix        # IDX configuration
```

## Local Development

1. **Install dependencies**:  
   `cd kateri-monorepo && yarn install`
2. **Start emulators**:  
   `firebase emulators:start`
3. **Run frontend**:  
   `cd packages/web && yarn start`
4. **Build & start functions**:  
   `cd packages/functions && yarn build && yarn start`

## Firestore Data Models

See [`docs/firestore-models.md`](docs/firestore-models.md) for entity definitions.

## Deployment

- Configure `firebase.json` and `.env` as needed.
- Deploy with `firebase deploy`.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

MIT (or your license here)