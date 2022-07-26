#!/bin/sh -e

# Copyright (C) 2022 Mark D. Blackwell.
#   All rights reserved.
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

# The path to the directory containing this script (without a trailing separator):
script_directory="$( cd "$( dirname $0 )" && echo $PWD )"
#echo "script_directory = $script_directory"

cd $script_directory/..

ruby --verbose -- input.rb data/input.txt var/schedule-verify.txt var/schedule.json

echo "When prompted, enter the password for nowplaying@wtmd.org."
