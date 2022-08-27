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

src/upload-common.sh

cd develop-tmp

cp ../var/lets-encrypt.pkcs12 output.pkcs12



cp     ../var/onair-min.css         onair.css
cp     ../var/onair-default-min.css onair-default.css
cp     ../var/onair-min.js          onair.js

/usr/bin/tar --create --file all.tar *

echo "When prompted, enter the password for the production server."

cat ../src/session.ftp | ftp -n `cat ../build/c-drive/Onair/var/domain-name-production`

echo "Success"
