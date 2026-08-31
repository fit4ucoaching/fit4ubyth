#!/usr/bin/env bash
# Génère le squelette standard d'un module (components/hooks/services/api/types/validators/utils/tests)
# Usage : ./scripts/bootstrap-module.sh apps/mobile/src/modules nomDuModule
set -euo pipefail

BASE_DIR="${1:?Chemin de base requis (ex: apps/mobile/src/modules)}"
MODULE_NAME="${2:?Nom du module requis}"
TARGET="$BASE_DIR/$MODULE_NAME"

mkdir -p "$TARGET/components" "$TARGET/hooks" "$TARGET/services" "$TARGET/api" \
         "$TARGET/types" "$TARGET/validators" "$TARGET/utils" "$TARGET/tests"
echo "# Module: $MODULE_NAME" > "$TARGET/README.md"

echo "✔ Module '$MODULE_NAME' créé dans $TARGET"
