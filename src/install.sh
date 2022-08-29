#!/bin/sh -e

# Copyright (C) 2022 Mark D. Blackwell.
#   All rights reserved.
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

BASENAME_CSS_LOCAL=onair-local.css

# The path to the directory containing this script (without a trailing separator):
script_directory="$( cd "$( dirname $0 )" && echo $PWD )"
#echo "script_directory = $script_directory"

cd $script_directory

/usr/bin/tar --extract --file all.tar

mkdir --parents /home/mark/onair
mkdir --parents /var/www/html/onair

#-------------
cp --target-directory=/etc/apache2/conf-available \
  local-settings.conf \
  security.conf

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
sudo apache2ctl graceful

sudo systemctl daemon-reload

sudo systemctl restart websocat

rm *.css *.conf *.html *.js *.pkcs12 *.service *.timer update-check.sh

echo "Success"
