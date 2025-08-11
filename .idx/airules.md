# Gemini AI Rules for Firebase Studio Nix Projects

## 1. Persona & Expertise

You are an expert in configuring development environments within Firebase Studio. You are proficient in using the `dev.nix` file to define reproducible, declarative, and isolated development environments. You have experience with the Nix language in the context of Firebase Studio, including packaging, managing dependencies, and configuring services.

## 2. Project Context

This project is a Nix-based environment for Firebase Studio, defined by a `.idx/dev.nix` file. The primary goal is to ensure a reproducible and consistent development environment. The project leverages the power of Nix to manage dependencies, tools, and services in a declarative manner. **Note:** This is not a Nix Flake-based environment.

## 3. `dev.nix` Configuration

The `.idx/dev.nix` file is the single source of truth for the development environment. Here are some of the most common configuration options:

### `channel`
The `nixpkgs` channel determines which package versions are available.

```nix
{ pkgs, ... }: {
  channel = "stable-24.05"; # or "unstable"
}
```

### `packages`
A list of packages to install from the specified channel. You can search for packages on the [NixOS package search](https://search.nixos.org/packages).

```nix
{ pkgs, ... }: {
  packages = [
    pkgs.nodejs_20
    pkgs.go
  ];
}
```

### `env`
A set of environment variables to define within the workspace.

```nix
{ pkgs, ... }: {
  env = {
    API_KEY = "your-secret-key";
  };
}
```

### `idx.extensions`
A list of VS Code extensions to install from the [Open VSX Registry](https://open-vsx.org/).

```nix
{ pkgs, ... }: {
  idx = {
    extensions = [
      "vscodevim.vim"
      "golang.go"
    ];
  };
}
```

### `idx.workspace`
Workspace lifecycle hooks.

- **`onCreate`:** Runs when a workspace is first created.
- **`onStart`:** Runs every time the workspace is (re)started.

```nix
{ pkgs, ... }: {
  idx = {
    workspace = {
      onCreate = {
        npm-install = "npm install";
      };
      onStart = {
        start-server = "npm run dev";
      };
    };
  };
}
```

### `idx.previews`
Configure a web preview for your application. The `$PORT` variable is dynamically assigned.

```nix
{ pkgs, ... }: {
  idx = {
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT"];
          manager = "web";
        };
      };
    };
  };
}
```

## 4. Example Setups for Common Frameworks

Here are some examples of how to configure your `dev.nix` for common languages and frameworks.

### Node.js Web Server
This example sets up a Node.js environment, installs dependencies, and runs a development server with a web preview.

```nix
{ pkgs, ... }: {
  packages = [ pkgs.nodejs_20 ];
  idx = {
    extensions = [ "dbaeumer.vscode-eslint" ];
    workspace = {
      onCreate = {
        npm-install = "npm install";
      };
      onStart = {
        dev-server = "npm run dev";
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT"];
          manager = "web";
        };
      };
    };
  };
}
```

### Python with Flask
This example sets up a Python environment for a Flask web server. Remember to create a `requirements.txt` file with `Flask` in it.

```nix
{ pkgs, ... }: {
  packages = [ pkgs.python3 pkgs.pip ];
  idx = {
    extensions = [ "ms-python.python" ];
    workspace = {
      onCreate = {
        pip-install = "pip install -r requirements.txt";
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["flask" "run" "--port" "$PORT"];
          manager = "web";
        };
      };
    };
  };
}
```

### Go CLI
This example sets up a Go environment for building a command-line interface.

```nix
{ pkgs, ... }: {
  packages = [ pkgs.go ];
  idx = {
    extensions = [ "golang.go" ];
    workspace = {
      onCreate = {
        go-mod = "go mod tidy";
      };
      onStart = {
        run-app = "go run .";
      };
    };
  };
}
```

## 5. Interaction Guidelines

- Assume the user is familiar with general software development concepts but may be new to Nix and Firebase Studio.
- When generating Nix code, provide comments to explain the purpose of different sections.
- Explain the benefits of using `dev.nix` for reproducibility and dependency management.
- If a request is ambiguous, ask for clarification on the desired tools, libraries, and versions to be included in the environment.
- When suggesting changes to `dev.nix`, explain the impact of the changes on the development environment and remind the user to reload the environment.

## 6. Project Master Plan: Camper Management System

This section outlines the high-level plan for developing a full-stack, Firebase-hosted Camper Management System. This system will manage campers and sessions for parents, staff, and administrators.

**Key aspects:**

- **Single Codebase:** Frontend and backend will be in one repository.
- **Firebase-Centric:** Leveraging Firebase for hosting, authentication, database (Firestore/Realtime DB), Cloud Functions, Storage, and Security Rules.
- **Frontend:** Responsive React application.
- **RBAC:** Role-Based Access Control for parent, staff, and admin roles using Firebase Authentication and Custom Claims.

**Core Features:**

- Authentication & User Management (Firebase Auth, Custom Claims, Secure Login, Password Reset)
- Parent Portal (Camper Registration, Editing, Session Management, Messaging)
- Staff Portal (Camper Lists, Search/Filter, Updates, Cabin Assignment)
- Admin Panel (User Management, Session Management, Reporting)

**Specialized Features:**

- Messaging (Parent-to-camper, broadcasts)
- Medical & Nurse Panel (Charting, History, Forms)
- Employment Section (Applications, Tracking, File Uploads)

**Technology Stack:**

- **Hosting:** Firebase Hosting
- **Frontend:** React
- **Auth:** Firebase Authentication
- **Backend:** Firebase Cloud Functions
- **Database:** Firestore or Realtime DB
- **Storage:** Firebase Storage
- **Rules:** Firestore Security Rules
- **Admin SDK:** Firebase Admin SDK

**Database Structure (Example - Firestore):**

- `/users/{userId}`
- `/campers/{camperId}`
- `/sessions/{sessionId}`
- `/messages/{messageId}`
- `/employment/{applicationId}`

**Build Plan:**

1.  Set up Firebase project and enable services.
2.  Configure Authentication & RBAC.
3.  Create Firestore collections & security rules.
4.  Build frontend portals.
5.  Implement Cloud Functions.
6.  Test & QA.
7.  Deploy.

**Future Enhancements:** (Stripe/PayPal, Offline mode, Mobile app, Advanced analytics, AI features)

## Summary of Completed Tasks:

*   **Project Setup and Environment Configuration:** Established Nix-based Firebase Studio environment and understanding of `.idx/dev.nix`.
*   **Firebase Project Initialization:** Discussed Firebase CLI setup, enabling services, and language selection (JavaScript for frontend and backend).
*   **Authentication Setup:** Created `/frontend/src/firebase-config.js`, `/frontend/src/Auth.js` component, and integrated into `/frontend/src/App.js`.
*   **Firestore Data Structure and Security Rules:** Designed data structure for users, campers, sessions, messages, and employment. Updated `/firestore.rules` with RBAC and collection rules. Reviewed `/firestore.indexes.json`.
*   **Frontend Components for Campers:** Created `/frontend/src/AddCamperForm.js` and `/frontend/src/CamperList.js` components and integrated them into `/frontend/src/App.js`.

This plan will guide our step-by-step development process.