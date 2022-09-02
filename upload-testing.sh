#!/bin/sh -e

# Copyright (C) 2022 Mark D. Blackwell.
#   All rights reserved.
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

# The path to the directory containing this script (without a trailing separator):
script_directory="$( cd "$( dirname $0 )" && echo $PWD )"

BASENAME_CSS_LOCAL=onair-local.css
IMPORT_START="@import \""

#-------------
cd $script_directory

src/upload-common.sh

cd develop-tmp

#-------------
cp      ../src/web/onair-default.css          onair-default.css
echo "$IMPORT_START$BASENAME_CSS_LOCAL\";" >> onair.css
cp      ../src/web/onair.js                   onair.js
cp          ../src/test.pkcs12                output.pkcs12
cp   ../etc/sample/$BASENAME_CSS_LOCAL        $BASENAME_CSS_LOCAL

#-------------
/usr/bin/tar --create --file all.tar *

echo "When prompted, enter the password for the testing server."

cat ../src/session.ftp | /usr/bin/ftp -n `cat ../var/domain-name-testing`

echo "Success"
