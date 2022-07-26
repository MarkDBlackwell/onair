#!/bin/sh -e

# Copyright (C) 2022 Mark D. Blackwell.
#   All rights reserved.
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

# The path to the directory containing this script (without a trailing separator):
script_directory="$( cd "$( dirname $0 )" && echo $PWD )"
#echo "script_directory = $script_directory"

cd $script_directory

/usr/bin/tar --extract --file all.tar

mkdir --parents /home/mark/onair
mkdir --parents /var/www/html/onair

cp --target-directory=/var/www/html/onair \
          container.css \
          container.html \
          onair.css \
          onair.html \
          onair.js

cp --target-directory=/home/mark/onair \
      update-check.sh

cp --target-directory=/etc/systemd/system \
      websocat.service \
      websocat-update-check.service \
      websocat-update-check.timer

cp --target-directory=/etc/apache2/conf-available \
      local-settings.conf \
      security.conf



cp   output.pkcs12 /home/mark/onair/output.pkcs12

sudo apache2ctl graceful

sudo systemctl daemon-reload

sudo systemctl restart websocat

rm *.css *.conf *.html *.js *.pkcs12 *.service *.timer update-check.sh

echo "Success"
