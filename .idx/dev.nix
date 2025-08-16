{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05";

  # Define the system packages that need to be available in your workspace.
  packages = [
    pkgs.firebase-tools
    pkgs.nodejs_22
    pkgs.jdk
    pkgs.lsof
    pkgs.yarn
  ];

  # Commands to execute *only once* when the workspace is created.
  idx.workspace.onCreate = {
    "install-monorepo-dependencies" = "cd kateri-monorepo && yarn install";
  };

  # Commands to execute every time the workspace is opened or restarted.
  idx.workspace.onStart = {
    "build-cloud-functions" = "cd kateri-monorepo/packages/functions && yarn build";
  };

  # Configure live previews for your applications and services.
  idx.previews = {
    enable = true;

    previews = {
      # 1. Web Application Preview (Your React Frontend)
      web = {
        command = [ "yarn" "start" ];
        cwd = "kateri-monorepo/packages/web";
        manager = "web";
      };

      # 2. Firebase Emulators Preview
      emulators = {
        command = [
          "firebase"
          "emulators:start"
          "--project=kateri-fbc"
          "--import=./emulator-data"
          "--export-on-exit"
        ];
        cwd = "kateri-monorepo";
        env = {
          NODE_OPTIONS = "--dns-result-order=ipv4first";
        };
        manager = "web";
      };
    };
  };
}
