{ pkgs, ... }: {
  # Specifies the Nixpkgs channel to use for package lookups.
  channel = "stable-24.05";

  # A list of system packages to install in the environment.
  packages = [
    pkgs.nodejs_20
    pkgs.firebase-tools
    pkgs.google-cloud-sdk
    pkgs.jdk # Java is required for the Firebase emulators.
  ];

  # A set of environment variables to be available in the workspace.
  env = {
    # Sets the JAVA_HOME environment variable, which the Firebase emulators need to find Java.
    JAVA_HOME = pkgs.jdk;
  };

  # Firebase Studio specific configurations.
  idx = {
    # A list of VS Code extensions to install from the Open VSX Registry.
    extensions = [
      "dbaeumer.vscode-eslint"
    ];

    # Workspace lifecycle hooks.
    workspace = {
      # Commands to run when the workspace is first created.
      onCreate = {
        npm-install = "npm install";
        frontend-npm-install = "npm install --prefix frontend";
        backend-npm-install = "npm install --prefix backend";
      };

      # Commands to run every time the workspace is (re)started.
      onStart = {
        # Start the Firebase emulators. The UI will be on port 4000.
        emulators = "firebase emulators:start";
      };
    };

    # Configures web previews for your application.
    previews = {
      enable = true;
      previews = {
        # Defines the preview for your frontend application.
        frontend = {
          command = ["npm" "start" "--prefix" "frontend" "--" "--port" "$PORT"];
          manager = "web";
        };
      };
    };
  };
}
