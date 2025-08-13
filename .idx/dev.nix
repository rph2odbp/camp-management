{ pkgs, ... }: {
  # Specifies the nixpkgs channel. It's recommended to use a stable channel for reproducibility.
  channel = "stable-24.05";

  # The Nix packages to make available in your workspace
  # Search for packages at https://search.nixos.org/packages
  packages = [
    # firebase-tools is now installed via npm in the onCreate hook below
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
    ];

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        # Install firebase-tools globally via npm to avoid Nix build issues
        install-firebase-and-npm-packages = "npm install -g firebase-tools && npm install && npm install --prefix backend && npm install --prefix frontend";
      };
      # onStart is empty to prevent conflicts with the Firebase emulator
      # You should start the emulators manually with `firebase emulators:start`
      onStart = {};
    };

    # Configure web previews for the Firebase Emulator Suite
    previews = {
      enable = true;
      previews = {
        # Emulator UI
        # Access the UI by running `firebase emulators:start` in the terminal
        # and opening the "Emulator UI" preview.
        "emulator-ui" = {
          command = [ "echo" "Firebase Emulator UI running on http://$HOST:4000. Start emulators and refresh." ];
          manager = "web";
        };
        # Web App Preview (Hosting Emulator)
        # This preview will show your web application served by the hosting emulator.
        "web-app" = {
          command = ["npm" "start" "--prefix" "frontend" "--" "--port" "$PORT"];
          manager = "web";
        };
      };
    };
  };

  # Environment variables
  env = {};
}
