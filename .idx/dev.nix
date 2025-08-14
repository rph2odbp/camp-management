# To learn more about how to use Nix to configure your environment, see
# https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.firebase-tools
    pkgs.nodejs_20
  ];
  # Sets environment variables in the workspace
  env = {};
  # Fast way to install nix packages from official nixpkgs
  # nidex.dev.nix = {
  #   packages = [
  #     "nixpkgs.go"
  #     "nixpkgs.python3"
  #   ];
  # };
  # From https://open-vsx.org/
  idx.extensions = [
    "dbaeumer.vscode-eslint"
  ];
  idx.workspace = {
    # Runs when a workspace is first created with this `dev.nix` file
    onCreate = {
      npm-install = "npm install";
      # frontend-install = "npm install --prefix frontend";
      # backend-install = "npm install --prefix backend";
    };
    # Runs when a workspace is (re)started
    onStart = {
      # "start-emulators" = "firebase emulators:start --project=kateri-fbc --import=.firebase/emulated-data";
      # "start-frontend" = "npm start --prefix frontend";
    };
  };
  # Enable previews and customize configuration
  idx.previews = {
    enable = true;
    previews = {
      # Emulator UI Preview
      # This preview will show the Emulator UI when you run your emulators.
      "emulator-ui" = {
        command = [ "firebase" "emulators:start" "--project=kateri-fbc" "--import=.firebase/emulated-data" "--tls-enabled" ];
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
}