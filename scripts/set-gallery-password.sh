#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(cd "${script_dir}/.." && pwd)"
target_file="${project_dir}/assets/script.js"

if [[ ! -f "${target_file}" ]]; then
  echo "Error: cannot find ${target_file}" >&2
  exit 1
fi

read -r -s -p "Enter the new Gallery password: " gallery_password
echo

if [[ -z "${gallery_password}" ]]; then
  echo "Error: password cannot be empty." >&2
  exit 1
fi

read -r -s -p "Confirm the new password: " gallery_password_confirm
echo

if [[ "${gallery_password}" != "${gallery_password_confirm}" ]]; then
  echo "Error: the passwords do not match." >&2
  exit 1
fi

gallery_hash="$(printf '%s' "${gallery_password}" | shasum -a 256 | awk '{print $1}')"

if ! grep -Eq 'const galleryPasswordHash = "[0-9a-f]{64}";' "${target_file}"; then
  echo "Error: galleryPasswordHash was not found in assets/script.js." >&2
  exit 1
fi

GALLERY_HASH="${gallery_hash}" perl -0pi -e \
  's/const galleryPasswordHash = "[0-9a-f]{64}";/const galleryPasswordHash = "$ENV{GALLERY_HASH}";/' \
  "${target_file}"

unset gallery_password gallery_password_confirm GALLERY_HASH

echo "Gallery password updated successfully."
echo "Close and reopen the Gallery tab, or clear galleryUnlocked from sessionStorage, before testing."
