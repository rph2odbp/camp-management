# Kateri Camper Management Platform - MASTER LOG

## I. Project Game Plan (The Definitive Blueprint)

This document contains the expert-provided, blueprint-informed game plan for the development of the Kateri Camper Management Platform. It is the single source of truth for the project's structure, features, and development lifecycle.

### 1. Recommended Templates / Starter Repositories

- **Primary Blueprint:** `cjmyles/firebase-monorepo` (Yarn workspaces, React frontend, TypeScript Cloud Functions).

### 2. Project Structure Best Practices

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

- **Key Principles:** Yarn Workspaces for dependency management, a `shared` package for types to ensure data consistency.

### 3. Key Tools to Accelerate Development

- **Local Environment:** Firebase Emulator Suite (Auth, Firestore, Functions, Hosting).
- **Backend:** Firebase Cloud Functions (TypeScript), Firebase Authentication with custom claims for role-based access.
- **Database:** Cloud Firestore.
- **AI Integration:** Google Cloud Vertex AI for natural language dashboards and insights.
- **Payments:** Stripe Extension (or a similar payment processor).
- **IDE:** IDX Studio, configured via a `.idx/dev.nix` file.

### 4. Extra “Bring-Over” Resources

- **UI Libraries:** MUI or Chakra UI for rapid portal development.
- **Data Seeding:** `faker.js` to create realistic mock data for development.
- **Form Management:** `react-hook-form` or `Formik` for robust forms.

### 5. Ideas for AI & Automation

- **Vertex AI Insights:** Build admin dashboards for natural language queries.
- **Automated Communications:** Use Firestore triggers to send automated emails for registration, reminders, etc.
- **Secure Document Uploads:** Use Firebase Storage with Cloud Functions for security scanning.

### 6. "Next Steps" - Our Active Game Plan

1.  **DONE:** Pick a Firebase + React Functions Monorepo Template (`cjmyles/firebase-monorepo`).
2.  **DONE:** Set up Yarn Workspaces and add packages for `web`, `functions`, and `shared`.
3.  **DONE:** Configure Firestore and the Firebase Emulator Suite.
4.  **NEXT:** Build out role-based portal skeletons using React Router.
5.  Integrate a payment processor.
6.  Design and implement the final Firestore data models.
7.  Add CI/CD and automate deployments.
8.  Plan and integrate the Vertex AI features.

---

## II. Project History

### **Project Restart (2025-08-15)**

- **Trigger:** After a long and difficult troubleshooting process with the previous project structure, a strategic decision was made to restart from a clean slate.
- **Foundation:** The new project is built on the foundation of an expert-provided, blueprint-informed game plan, which is now the first section of this `MASTER_LOG.md`.
- **Environment:** A new, definitive `.idx/dev.nix` file was created, based on expert, external AI guidance. The environment is stable and fully functional. The project is now structured as a Yarn Workspaces monorepo, with separate packages for the React frontend (`web`), Cloud Functions backend (`functions`), and shared code (`core`). The root directory contains a `firebase.json` file for managing Firebase settings.
- **Key Improvement:** The .idx/dev.nix file has been successfully configured to use a yarn workspaces setup.

---

## III. Active Plan & Next Steps

- The next action is to focus on building out the React frontend (`packages/web`) using the base Firebase configuration and the new directory structure
