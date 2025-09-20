# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{pkgs}: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.yarn
    pkgs.nodePackages.pnpm
    pkgs.bun
    pkgs.psmisc # Provides killall, a tool to stop processes
  ];
  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "google.gemini-cli-vscode-ide-companion"
    ];
    workspace = {
      # To run something each time the workspace is (re)started, use the `onStart` hook
      onStart = {
        # Kill any zombie node processes that might be hogging ports from previous sessions
        kill-zombies = "killall -q -s 9 node || true";
      };
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        # The Frontend Web Preview
        web = {
          command = ["npm", "run", "dev"];
          # Set the working directory for the command
          cwd = "frontend";
          manager = "web";
          env = {
            # This is a special variable from the IDE. It will contain the
            # public URL of our backend preview service.
            NEXT_PUBLIC_API_BASE = "$IDES_PREVIEW_BACKEND_URL/api";
          };
        };
        # The Backend API Preview
        backend = {
          command = ["npm", "run", "dev"];
          # The working directory for this command
          cwd = "backend";
          # The invalid 'port' attribute has been removed.
        };
      };
    };
  };
}
