#!/usr/bin/env bash
# Empacota style-guide.html (fragmento, usado também para publicar como Artifact)
# num documento HTML completo e válido para hospedagem real, com:
#   - <!DOCTYPE html> + <html lang="pt-BR"> (evita tradução automática incorreta do navegador)
#   - <meta charset="UTF-8"> como primeira tag do <head> (evita acentuação/pontuação quebrada)
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$DIR/style-guide.html"
OUT_DIR="$DIR/dist"

mkdir -p "$OUT_DIR"

awk -v head_file="$OUT_DIR/_head.html" -v body_file="$OUT_DIR/_body.html" '
  /<!--HEAD-END-->/ { inbody = 1; next }
  !inbody { print > head_file; next }
  { print > body_file }
' "$SRC"

{
  echo '<!DOCTYPE html>'
  echo '<html lang="pt-BR">'
  echo '<head>'
  echo '<meta charset="UTF-8">'
  echo '<meta name="viewport" content="width=device-width, initial-scale=1">'
  cat "$OUT_DIR/_head.html"
  echo '</head>'
  echo '<body>'
  cat "$OUT_DIR/_body.html"
  echo '</body>'
  echo '</html>'
} > "$OUT_DIR/index.html"

rm -f "$OUT_DIR/_head.html" "$OUT_DIR/_body.html"
cp "$DIR/tokens.css" "$OUT_DIR/tokens.css"
cp "$DIR/tokens.json" "$OUT_DIR/tokens.json"

echo "OK: $OUT_DIR/index.html ($(wc -c < "$OUT_DIR/index.html") bytes)"
