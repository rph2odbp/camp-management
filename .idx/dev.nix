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
        # Install firebase-tools globally via npm to avoid Nix build issues
        install-firebase-and-npm-packages = "npm install -g firebase-tools && npm install && npm install --prefix backend && npm install --prefix frontend";
      };
      # onStart is kept empty to prevent conflicts with the Firebase emulator.
      # You should start the emulators manually from the Previews panel.
      onStart = {};
    };

    # Configure web previews for your application and the Firebase Emulator Suite
    previews = {
      enable = true;
      previews = {
        # Emulator Suite Preview
        # This command starts the emulators with the correct project context to avoid permission errors.
        # It also imports any data from your .firebase/emulated-data directory.
        # Access the Emulator UI at its specified port (usually 4000).
        "emulators" = {
          command = [ "firebase" "emulators:start" "--project=kateri-fbc" "--import=.firebase/emulated-data" ];
          manager = "web";
        };
        # Web App Preview (Hosting Emulator)
        # This preview will show your web application served by the hosting emulator.
        "web-app" = {
          command = [ "npm" "start" "--prefix" "frontend" "--" "--port" "$PORT" ];
          manager = "web";
        };
      };
    };
  };

  # Environment variables
  env = {};
}
