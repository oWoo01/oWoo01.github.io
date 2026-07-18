#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

read -r -s -p "Enter a new 4-digit Gallery PIN: " gallery_password
echo
read -r -s -p "Confirm the Gallery password: " gallery_password_confirm
echo

if [[ "${gallery_password}" != "${gallery_password_confirm}" ]]; then
  echo "Error: the passwords do not match." >&2
  exit 1
fi

if [[ ! "${gallery_password}" =~ ^[0-9]{4}$ ]]; then
  echo "Error: the Gallery PIN must contain exactly 4 digits." >&2
  exit 1
fi

GALLERY_ENCRYPTION_PASSWORD="${gallery_password}" node "${script_dir}/encrypt-gallery.mjs"

unset gallery_password gallery_password_confirm GALLERY_ENCRYPTION_PASSWORD
