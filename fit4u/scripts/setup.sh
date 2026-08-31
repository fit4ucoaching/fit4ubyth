#!/usr/bin/env bash
set -euo pipefail

echo "→ Installation des dépendances (pnpm)"
pnpm install

echo "→ Copie des variables d'environnement"
[ -f .env ] || cp .env.example .env

echo "→ Démarrage des services (Postgres, Redis)"
docker compose -f docker/docker-compose.yml up -d postgres redis

echo "→ Génération du client Prisma"
pnpm prisma:generate

echo "→ Migration de la base de données"
pnpm prisma:migrate

echo "✔ Environnement prêt. Lancez 'pnpm dev:backend', 'pnpm dev:mobile' ou 'pnpm dev:web'."
