#!/usr/bin/env bash

set -Eeuo pipefail

NODE_MAJOR="${NODE_MAJOR:-20}"
NODE_ENV="${NODE_ENV:-production}"
PORT="${PORT:-8080}"
CLIENT_PORT="${CLIENT_PORT:-4173}"
SERVER_PM2_NAME="${SERVER_PM2_NAME:-peekaboo-server}"
CLIENT_PM2_NAME="${CLIENT_PM2_NAME:-peekaboo-client}"
GIT_PULL="${GIT_PULL:-false}"
SEQUENTIAL="${SEQUENTIAL:-false}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVER_DIR="$REPO_ROOT/server"
CLIENT_DIR="$REPO_ROOT/client"

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

setup_sudo() {
  if [ "${EUID:-$(id -u)}" -eq 0 ]; then
    return
  fi

  command -v sudo >/dev/null 2>&1 || fail "sudo is required when not running as root."
}

run_as_root() {
  if [ "${EUID:-$(id -u)}" -eq 0 ]; then
    "$@"
  else
    sudo "$@"
  fi
}

run_bash_as_root_with_env() {
  if [ "${EUID:-$(id -u)}" -eq 0 ]; then
    bash "$@"
  else
    sudo -E bash "$@"
  fi
}

ensure_ubuntu_or_debian() {
  [ -r /etc/os-release ] || fail "Cannot detect OS. This script supports Ubuntu/Debian."

  # shellcheck disable=SC1091
  . /etc/os-release

  case "${ID:-}" in
    ubuntu | debian) ;;
    *)
      case " ${ID_LIKE:-} " in
        *" debian "*) ;;
        *) fail "Unsupported OS '${ID:-unknown}'. This script supports Ubuntu/Debian." ;;
      esac
      ;;
  esac
}

install_base_packages() {
  log "Installing base packages"
  run_as_root apt-get update
  run_as_root apt-get install -y curl git build-essential ca-certificates
}

install_node() {
  if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    log "Node and npm already installed: node $(node --version), npm $(npm --version)"
    return
  fi

  log "Installing Node.js ${NODE_MAJOR}.x from NodeSource"
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | run_bash_as_root_with_env -
  run_as_root apt-get install -y nodejs
}

install_pm2() {
  if command -v pm2 >/dev/null 2>&1; then
    log "PM2 already installed: $(pm2 --version)"
    return
  fi

  log "Installing PM2 globally"
  run_as_root npm install -g pm2
}

maybe_pull_latest() {
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
  setup_sudo
  ensure_ubuntu_or_debian

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
