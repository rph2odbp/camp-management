{ pkgs, ... }: {
  # The Nix packages to make available in your workspace
  # Search for packages at https://search.nixos.org/packages
  packages = [
    pkgs.firebase-tools
    pkgs.jdk17
    pkgs.nodejs_20
    pkgs.google-cloud-sdk
  ];

  # The VS Code extensions to install in your workspace
  # Search for extensions at https://open-vsx.org/
  idx.extensions = [
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
  idx.workspace = {
    # Runs when a workspace is first created
    onCreate = {
      install-npm-packages = "npm install && npm install --prefix backend && npm install --prefix frontend";
      #build-backend = "npm run build --prefix backend";
    };
    # Runs every time the workspace is (re)started
    onStart = {
      #start-backend = "npm run start --prefix backend";
      #start-frontend = "npm start --prefix frontend";
    };
  };

  # Web-based previews
  idx.previews = {
    enable = true;
    previews = {
      web = {
        # The name that will show up in the Preview panel
        id = "web";
        # The command to run to start your app
        command = ["npm" "start" "--prefix" "frontend"];
        # "web" will open this in a new tab.
        # "web-embedded" will open this in a panel inside the editor
        manager = "web";
      };
      storybook = {
        id = "storybook";
        command = ["npm" "run" "storybook" "--prefix" "frontend"];
        manager = "web";
      };
      "firebase-emulator-ui" = {
        id = "firebase-emulator-ui";
        command = ["firebase" "emulators:start"];
        manager = "web";
      };
    };
  };

  # Environment variables
  env = {
    # Example:
    # PREVIEW_URL = idx.previews.web.url;
  };
}
