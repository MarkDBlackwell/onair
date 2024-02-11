#!/bin/sh -e

# Copyright (C) 2022 Mark D. Blackwell.
#   All rights reserved.
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

# The path to the directory containing this script (without a trailing separator):
script_directory="$( cd "$( dirname $0 )" && echo $PWD )"

# The script basename:
script_basename="$( basename $0 )"

BASENAME_CSS_LOCAL=onair-local.css

#-------------
cd $script_directory

/usr/bin/tar --extract --file all.tar

mkdir --parents /home/mark/onair
mkdir --parents /var/www/html/onair

#-------------
cp --target-directory=/etc/systemd/system \
  websocat-update-check.service \
  websocat-update-check.timer \
  websocat.service

cp --target-directory=/home/mark/onair \
  output.pkcs12 \
  update-check.sh

cp --target-directory=/var/www/html/onair \
  container.css \
  container.html \
  onair-default.css \
  onair.css \
  onair.js \
  onair.html

if [ -s $BASENAME_CSS_LOCAL ]; then
  cp --target-directory=/var/www/html/onair \
    $BASENAME_CSS_LOCAL
fi

#-------------
sudo systemctl daemon-reload

sudo systemctl restart websocat

mv $script_basename $script_basename-save

rm -fv \
  websocat-update-check.service \
  websocat-update-check.timer \
  websocat.service
rm -fv \
  output.pkcs12 \
  update-check.sh
rm -fv \
  container.css \
  container.html \
  onair-default.css \
  onair.css \
  onair.js \
  onair.html

mv $script_basename-save $script_basename

echo "Success"
