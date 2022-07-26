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

FLAG=/var/www/html/onair/same

# Has the schedule changed?

if [ -f $FLAG ]; then
# The flag says the schedule is the same. So, we're done.
  exit 0
fi

# The schedule has changed.
# Restart the websocket service.

systemctl restart websocat

# Recreate the flag.

touch $FLAG
chown nowplaying@wtmd.org: $FLAG
