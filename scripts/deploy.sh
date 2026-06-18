#!/usr/bin/env bash
# 一键构建并同步 admin-web 到 ECS
# 用法: npm run deploy  或  bash scripts/deploy.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${DEPLOY_ENV_FILE:-$ROOT_DIR/deploy.env}"

red() { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }

if [[ ! -f "$ENV_FILE" ]]; then
  red "缺少配置文件: $ENV_FILE"
  echo "请先执行: cp deploy.env.example deploy.env"
  echo "然后编辑 deploy.env 填写 ECS 信息"
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

: "${DEPLOY_HOST:?请在 deploy.env 中设置 DEPLOY_HOST}"
: "${DEPLOY_USER:?请在 deploy.env 中设置 DEPLOY_USER}"
: "${DEPLOY_PATH:?请在 deploy.env 中设置 DEPLOY_PATH}"

DEPLOY_PORT="${DEPLOY_PORT:-22}"
RUN_BUILD="${RUN_BUILD:-1}"

SSH_OPTS=(-p "$DEPLOY_PORT" -o StrictHostKeyChecking=accept-new)
if [[ -n "${DEPLOY_SSH_KEY:-}" ]]; then
  SSH_OPTS+=(-i "$DEPLOY_SSH_KEY")
fi

REMOTE="${DEPLOY_USER}@${DEPLOY_HOST}"
RSYNC_SSH="ssh ${SSH_OPTS[*]}"

echo "========================================"
echo " admin-web 部署"
echo " 目标: ${REMOTE}:${DEPLOY_PATH}"
echo "========================================"

if [[ -f "$ROOT_DIR/.env" ]]; then
  API_URL="$(grep -E '^VITE_API_BASE_URL=' "$ROOT_DIR/.env" | tail -1 | cut -d= -f2- || true)"
  if [[ "$API_URL" == *localhost* ]]; then
    yellow "警告: .env 中 VITE_API_BASE_URL 仍指向 localhost"
    yellow "       当前值: $API_URL"
    yellow "       生产部署请改为 https://api.rarelink.com.cn/api 或 /api"
    read -r -p "仍继续部署? [y/N] " confirm
    [[ "$confirm" =~ ^[Yy]$ ]] || exit 1
  else
    green "API 地址: $API_URL"
  fi
else
  yellow "未找到 .env，将使用 Vite 默认环境变量"
fi

if [[ "$RUN_BUILD" == "1" ]]; then
  echo ""
  echo ">> 安装依赖 (npm ci)..."
  if [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi

  echo ""
  echo ">> 构建生产包 (npm run build)..."
  npm run build
else
  yellow "跳过构建 (RUN_BUILD=0)"
fi

if [[ ! -d "$ROOT_DIR/dist" ]]; then
  red "dist/ 不存在，请先构建"
  exit 1
fi

echo ""
echo ">> 测试 SSH 连接..."
if ! ssh "${SSH_OPTS[@]}" "$REMOTE" "echo ok" >/dev/null 2>&1; then
  red "无法 SSH 连接到 $REMOTE"
  echo "请检查: DEPLOY_HOST / DEPLOY_USER / DEPLOY_SSH_KEY / 安全组 22 端口"
  exit 1
fi
green "SSH 连接正常"

echo ""
echo ">> 创建远程目录..."
ssh "${SSH_OPTS[@]}" "$REMOTE" "mkdir -p '$DEPLOY_PATH'"

echo ""
echo ">> 同步 dist/ 到 ECS (rsync --delete)..."
# shellcheck disable=SC2086
rsync -avz --delete \
  ${RSYNC_EXTRA:-} \
  -e "$RSYNC_SSH" \
  "$ROOT_DIR/dist/" \
  "${REMOTE}:${DEPLOY_PATH}/"

echo ""
echo ">> 远程文件校验..."
ssh "${SSH_OPTS[@]}" "$REMOTE" "ls -la '$DEPLOY_PATH' | head -10"

echo ""
green "部署完成!"
echo "访问: https://admin.rarelink.com.cn"
echo ""
echo "ECS 本机验收:"
echo "  curl -Ik --resolve admin.rarelink.com.cn:443:127.0.0.1 https://admin.rarelink.com.cn/"
