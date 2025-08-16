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
/
|-- kateri-monorepo/
|   |-- packages/
|   |   |-- web/        # React + Vite frontend
|   |   |-- functions/  # Firebase Cloud Functions (TypeScript)
|   |   |-- shared/     # Shared types/interfaces/models
|   |-- firestore.rules # Firestore security rules
|   |-- firebase.json   # Firebase project config
|   |-- package.json    # Yarn workspaces config
|-- .idx/
|   |-- dev.nix         # IDX/Cloud IDE setup
|-- README.md           # Project documentation
|-- .gitignore
```

## Local Development in Firebase Studio (IDX)

1.  **Rebuild the Environment (if prompted):** The `.idx/dev.nix` file will automatically install all necessary tools (`yarn`, `firebase-tools`, `Java`, etc.).
2.  **View Previews:** Open the **Previews** panel in the IDX sidebar.
3.  **Start Emulators:** Click the "play" button next to the `emulators` preview. This will start the Firebase Emulator Suite.
4.  **Start Frontend:** Click the "play" button next to the `web` preview. This will start the React development server.
5.  **View Your App:** Open the URL provided by the `web` preview.

## Firestore Data Models

See [`docs/firestore-models.md`](docs/firestore-models.md) for entity definitions.

## Deployment

- Configure `firebase.json` and `.env` as needed.
- Deploy with `firebase deploy`.
