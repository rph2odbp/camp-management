{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    pkgs.firebase-tools
    pkgs.google-cloud-sdk
  ];
  env = {};
  idx = {
    extensions = [
      "dbaeumer.vscode-eslint"
    ];
    workspace = {
      onCreate = {
        npm-install = "npm install";
        frontend-npm-install = "npm install --prefix frontend";
        backend-npm-install = "npm install --prefix backend";
      };
      # The onStart hook is no longer needed to start servers,
      # as this is now handled by the previews section.
      onStart = {};
    };
    previews = {
      enable = true;
      previews = {
        # This defines the preview for your frontend application.
        # It runs on a port that Firebase Studio assigns dynamically to $PORT.
        frontend = {
          command = ["npm", "start", "--prefix", "frontend", "--", "--port", "$PORT"];
          manager = "web";
        };
        # This defines the preview for the Firebase Emulator Suite UI.
        # The command starts the emulators, and the UI is typically available on port 4000.
        # Firebase Studio will provide a URL to access this.
        "emulator-ui" = {
          command = ["firebase", "emulators:start"];
        };
      };
    };
  };
}
