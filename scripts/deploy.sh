#!/usr/bin/env bash

set -Eeuo pipefail

# Runtime knobs for operators. Override any of these inline when running the
# script, for example: GIT_PULL=true CLIENT_PORT=4174 ./scripts/deploy.sh
NODE_MAJOR="${NODE_MAJOR:-20}"
NODE_ENV="${NODE_ENV:-production}"
PORT="${PORT:-8080}"
CLIENT_PORT="${CLIENT_PORT:-4173}"
SERVER_PM2_NAME="${SERVER_PM2_NAME:-peekaboo-server}"
CLIENT_PM2_NAME="${CLIENT_PM2_NAME:-peekaboo-client}"

# GIT_PULL=true updates the checked-out branch before building. SEQUENTIAL=true
# builds the server and client one at a time for smaller servers.
GIT_PULL="${GIT_PULL:-false}"
SEQUENTIAL="${SEQUENTIAL:-false}"

# Resolve paths from this file so the script works from any current directory.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVER_DIR="$REPO_ROOT/server"
CLIENT_DIR="$REPO_ROOT/client"
PLATFORM=""
CPU_ARCH=""

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

fail() {
  printf '\nERROR: %s\n' "$*" >&2
  exit 1
}

as_bool() {
  case "${1:-}" in
    true | TRUE | 1 | yes | YES | y | Y) return 0 ;;
    *) return 1 ;;
  esac
}

require_dir() {
  [ -d "$1" ] || fail "Required directory not found: $1"
}

detect_platform() {
  CPU_ARCH="$(uname -m)"

  case "$(uname -s)" in
    Linux)
      PLATFORM="linux"
      [ -r /etc/os-release ] || fail "Cannot detect Linux distribution. This script supports Ubuntu/Debian and macOS."

      # The Linux bootstrap path uses apt-get and NodeSource Debian packages, so
      # keep the script explicit instead of guessing on unsupported distributions.
      # shellcheck disable=SC1091
      . /etc/os-release

      case "${ID:-}" in
        ubuntu | debian) ;;
        *)
          case " ${ID_LIKE:-} " in
            *" debian "*) ;;
            *) fail "Unsupported Linux distribution '${ID:-unknown}'. Use Ubuntu/Debian or macOS." ;;
          esac
          ;;
      esac
      ;;
    Darwin)
      PLATFORM="macos"
      case "$CPU_ARCH" in
        arm64 | x86_64) ;;
        *) fail "Unsupported macOS CPU architecture '$CPU_ARCH'. Expected arm64 or x86_64." ;;
      esac
      ;;
    *)
      fail "Unsupported OS '$(uname -s)'. Use Ubuntu/Debian or macOS."
      ;;
  esac
}

setup_privileges() {
  if [ "$PLATFORM" = "macos" ]; then
    # Homebrew does not support running as root. Use a normal admin user.
    [ "${EUID:-$(id -u)}" -ne 0 ] || fail "Do not run this script as root on macOS."
    return
  fi

  if [ "${EUID:-$(id -u)}" -eq 0 ]; then
    return
  fi

  command -v sudo >/dev/null 2>&1 || fail "sudo is required when not running as root."
}

# On Linux, package-manager commands need root. Normal build commands still run
# as the deploy user so node_modules and dist files stay owned by that user.
run_as_root() {
  if [ "${EUID:-$(id -u)}" -eq 0 ]; then
    "$@"
  else
    sudo "$@"
  fi
}

# NodeSource provides a Linux Bash installer that must run as root and needs env
# propagation when sudo is involved.
run_bash_as_root_with_env() {
  if [ "${EUID:-$(id -u)}" -eq 0 ]; then
    bash "$@"
  else
    sudo -E bash "$@"
  fi
}

load_homebrew_path() {
  local brew_bin

  if command -v brew >/dev/null 2>&1; then
    eval "$(brew shellenv)"
    return
  fi

  # Apple Silicon Homebrew installs to /opt/homebrew; Intel installs to /usr/local.
  for brew_bin in /opt/homebrew/bin/brew /usr/local/bin/brew; do
    if [ -x "$brew_bin" ]; then
      eval "$("$brew_bin" shellenv)"
      return
    fi
  done
}

ensure_xcode_command_line_tools() {
  if xcode-select -p >/dev/null 2>&1; then
    return
  fi

  log "Xcode Command Line Tools are required for native npm modules"
  xcode-select --install >/dev/null 2>&1 || true
  fail "Finish installing Xcode Command Line Tools, then rerun this script."
}

ensure_homebrew() {
  load_homebrew_path
  if command -v brew >/dev/null 2>&1; then
    log "Homebrew already installed: $(brew --version | head -n 1)"
    return
  fi

  log "Installing Homebrew for macOS $CPU_ARCH"
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  load_homebrew_path
  command -v brew >/dev/null 2>&1 || fail "Homebrew installed, but brew is not available on PATH."
}

ensure_npm_global_path() {
  local npm_bin

  command -v npm >/dev/null 2>&1 || return
  npm_bin="$(npm prefix -g)/bin"
  case ":$PATH:" in
    *":$npm_bin:"*) ;;
    *) export PATH="$npm_bin:$PATH" ;;
  esac
}

install_base_packages() {
  case "$PLATFORM" in
    linux)
      # build-essential is needed for native npm dependencies such as bcrypt.
      log "Installing base packages"
      run_as_root apt-get update
      run_as_root apt-get install -y curl git build-essential ca-certificates
      ;;
    macos)
      # Xcode Command Line Tools provide compilers for native npm dependencies.
      log "Checking macOS build tools"
      ensure_xcode_command_line_tools
      ensure_homebrew

      if ! command -v git >/dev/null 2>&1; then
        log "Installing git with Homebrew"
        brew install git
      fi
      ;;
  esac
}

install_node() {
  if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    log "Node and npm already installed: node $(node --version), npm $(npm --version)"
    ensure_npm_global_path
    return
  fi

  case "$PLATFORM" in
    linux)
      log "Installing Node.js ${NODE_MAJOR}.x from NodeSource"
      curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | run_bash_as_root_with_env -
      run_as_root apt-get install -y nodejs
      ;;
    macos)
      ensure_homebrew
      log "Installing Node.js ${NODE_MAJOR}.x with Homebrew"
      brew install "node@${NODE_MAJOR}"
      export PATH="$(brew --prefix "node@${NODE_MAJOR}")/bin:$PATH"
      ;;
  esac

  ensure_npm_global_path
}

install_pm2() {
  if command -v pm2 >/dev/null 2>&1; then
    log "PM2 already installed: $(pm2 --version)"
    return
  fi

  log "Installing PM2 globally"
  if [ "$PLATFORM" = "macos" ]; then
    npm install -g pm2
  else
    run_as_root npm install -g pm2
  fi
  ensure_npm_global_path
}

maybe_pull_latest() {
  # Keep code updates opt-in so a colleague can deploy an already uploaded
  # release directory without requiring git remotes or credentials.
  if ! as_bool "$GIT_PULL"; then
    log "Skipping git update because GIT_PULL is not true"
    return
  fi

  if ! git -C "$REPO_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    log "Skipping git update because $REPO_ROOT is not a git repository"
    return
  fi

  log "Updating repository with git pull --ff-only"
  git -C "$REPO_ROOT" pull --ff-only
}

npm_install() {
  local app_dir="$1"
  local app_name="$2"

  log "Installing dependencies for $app_name"
  if [ -f "$app_dir/package-lock.json" ]; then
    npm --prefix "$app_dir" ci
  else
    npm --prefix "$app_dir" install
  fi
}

build_server() {
  npm_install "$SERVER_DIR" "server"
  log "Building server"
  npm --prefix "$SERVER_DIR" run build
  [ -f "$SERVER_DIR/dist/server.js" ] || fail "Server build completed but dist/server.js was not found."
}

build_client() {
  npm_install "$CLIENT_DIR" "client"
  log "Building client"
  npm --prefix "$CLIENT_DIR" run build
  [ -d "$CLIENT_DIR/dist" ] || fail "Client build completed but dist/ was not found."
}

build_apps() {
  if as_bool "$SEQUENTIAL"; then
    log "Building apps sequentially"
    build_server
    build_client
    return
  fi

  # Parallel builds deploy both apps faster. Use SEQUENTIAL=true if the server
  # is memory constrained.
  log "Building server and client in parallel"
  build_server &
  local server_pid=$!
  build_client &
  local client_pid=$!

  local status=0
  wait "$server_pid" || status=$?
  wait "$client_pid" || status=$?
  [ "$status" -eq 0 ] || fail "One or more builds failed."
}

pm2_exists() {
  pm2 describe "$1" >/dev/null 2>&1
}

start_or_restart_server() {
  log "Starting or restarting PM2 process: $SERVER_PM2_NAME"

  # Do not use PM2 cluster mode here. server/src/server.ts already forks worker
  # processes with Node cluster and starts cron jobs only in the primary process.
  if pm2_exists "$SERVER_PM2_NAME"; then
    (
      cd "$SERVER_DIR"
      NODE_ENV="$NODE_ENV" PORT="$PORT" pm2 restart "$SERVER_PM2_NAME" --update-env
    )
    return
  fi

  (
    cd "$SERVER_DIR"
    NODE_ENV="$NODE_ENV" PORT="$PORT" pm2 start dist/server.js --name "$SERVER_PM2_NAME"
  )
}

start_or_restart_client() {
  log "Starting or restarting PM2 process: $CLIENT_PM2_NAME"

  # The client is a Vite build served by Vite preview because this deployment
  # target intentionally keeps nginx/static hosting outside the script.
  if pm2_exists "$CLIENT_PM2_NAME"; then
    (
      cd "$CLIENT_DIR"
      NODE_ENV="$NODE_ENV" CLIENT_PORT="$CLIENT_PORT" pm2 restart "$CLIENT_PM2_NAME" --update-env
    )
    return
  fi

  (
    cd "$CLIENT_DIR"
    NODE_ENV="$NODE_ENV" CLIENT_PORT="$CLIENT_PORT" pm2 start npm --name "$CLIENT_PM2_NAME" -- run preview -- --host 0.0.0.0 --port "$CLIENT_PORT"
  )
}

main() {
  require_dir "$SERVER_DIR"
  require_dir "$CLIENT_DIR"
  detect_platform
  setup_privileges

  log "Deploying on $PLATFORM ($CPU_ARCH)"

  # This script prepares Node/PM2 only. It assumes PostgreSQL and the app .env
  # files already exist and does not create secrets, firewall rules, SSL, or nginx.
  install_base_packages
  install_node
  install_pm2
  maybe_pull_latest
  build_apps

  start_or_restart_server
  start_or_restart_client

  log "Saving PM2 process list"
  pm2 save

  log "PM2 status"
  pm2 status

  printf '\nDeployment complete.\n'
  printf 'Backend: http://localhost:%s\n' "$PORT"
  printf 'Client:  http://localhost:%s\n' "$CLIENT_PORT"
}

main "$@"
