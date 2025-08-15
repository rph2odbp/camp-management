{ pkgs, ... }:

{
  # Packages needed for full-stack Firebase monorepo development
  packages = [
    pkgs.nodejs_22
    pkgs.jdk
    pkgs.lsof
    pkgs.yarn
    pkgs.firebase-tools
  ];

  # Install all dependencies on environment creation
  onCreate = {
    command = "yarn install";
    workingDirectory = "./kateri-monorepo";
  };

  # Build backend functions on environment start
  onStart = [
    {
      command = "yarn build";
      workingDirectory = "./kateri-monorepo/packages/functions";
    }
  ];

  # Previews for web and emulators
  previews = [
    {
      id = "web";
      label = "Web App";
      command = "yarn start";
      workingDirectory = "./kateri-monorepo/packages/web";
      port = 3000; # adjust if your React dev server uses a different port
    }
    {
      id = "emulators";
      label = "Firebase Emulators";
      command = "firebase emulators:start";
      workingDirectory = "./kateri-monorepo";
      env = {
        NODE_OPTIONS = "--dns-result-order=ipv4first";
      };
      port = 4000; # default Emulator UI port
    }
  ];
}
