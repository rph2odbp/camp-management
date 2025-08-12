# Current Task: Setting Up Firebase Local Emulators

Our main goal is to run the application locally for development using the Firebase Emulator Suite. This will allow us to bypass the cloud IAM policies and permissions that were blocking us.

## Blocker
The Firebase Emulators require the Java Development Kit (JDK) to run, but it was not installed in the environment.

## Current Status
1. I have updated the `.idx/dev.nix` file to include the `pkgs.jdk` package.
2. I have configured `firebase.json` with the necessary emulator settings.
3. I have updated `frontend/src/firebase-config.js` to automatically connect the frontend to the emulators when running on `localhost`.

## Action Required By You
You need to **rebuild the environment** by clicking the "Reload" button in the notification at the bottom-right of your screen. This will install the JDK.

## Plan After Rebuild
Once the environment has reloaded and you tell me to continue, I will:
1. Run the `firebase emulators:start` command.
2. This will start the local emulators for Authentication, Firestore, Functions, and Storage.
3. I will then guide you on how to access the Emulator UI and your locally running frontend application.
