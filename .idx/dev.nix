{ pkgs, ... }: {
  # Specifies the nixpkgs channel. It's recommended to use a stable channel for reproducibility.
  channel = "stable-24.05";

  # The Nix packages to make available in your workspace
  # Search for packages at https://search.nixos.org/packages
  packages = [
    pkgs.jdk17
    pkgs.nodejs_20
  ];

  # All `idx` configurations should be nested under a single `idx` attribute.
  idx = {
    # The VS Code extensions to install in your workspace
    # Search for extensions at https://open-vsx.org/
    extensions = [
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
      "vscode.emmet"
      "ms-azuretools.vscode-docker"
      "github.copilot"
      "ms-vscode.vscode-typescript-next"
      "apollographql.vscode-apollo"
      "figma.figma-for-vs-code"
      "wallabyjs.wallaby-vscode"
    ];

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        # Install firebase-tools globally and all other dependencies
        install-dependencies = "npm install -g firebase-tools && npm install && npm install --prefix backend && npm install --prefix frontend";
      };
      # onStart is removed as previews now handle service startup.
      onStart = {};
    };

    # Configure web previews for the Firebase Emulator Suite and the frontend app
    previews = {
      enable = true;
      previews = {
        # Emulator UI + All Emulators
        # This preview starts all Firebase emulators. The Emulator UI will be available on port 4000.
        # IDX automatically forwards the ports defined in firebase.json.
        emulators = {
          command = ["firebase", "emulators:start", "--import=./firebase-data", "--export-on-exit"];
          manager = "web";
        };

        # Web App Preview (Hosting Emulator)
        # This preview starts the frontend development server.
        # It will be available on port 5000, as served by the Hosting Emulator.
        web = {
          command = ["npm", "start", "--prefix", "frontend"];
          manager = "web";
        };
      };
    };
  };

  # Environment variables
  env = {
    # Example:
    # PREVIEW_URL = idx.previews.web.url;
  };
}
