# Copyright (C) 2022 Mark D. Blackwell.
#   All rights reserved.
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

require 'digest'
require 'json'
require 'time'

# Check the argument cardinality
unless 3 == ARGV.length
  message = "Must supply three arguments."
  ::Kernel.raise(message)
end

# Set up
regexp_time = ::Regexp.new( /^(\d++):?(\d*+)$/ )

meridians = %w[ AM PM ]

label_section_default = 'weekday'

labels_section_week_day = %w[ monday tuesday wednesday thursday friday ]
labels_section_week_end = %w[ saturday sunday ]

labels_section_week = labels_section_week_day + labels_section_week_end

labels_section_all = [label_section_default] + labels_section_week

sections_content = labels_section_all.to_h {|e| [e, ::Array.new]}

# Validate the input
lines = ::File.open(ARGV.at(0),'r') do |f_input|
  f_input.readlines.map {|e| e.chomp}
end

section_current = nil
lines.each_with_index do |line, i|
  stripped = line.strip
  next if stripped.empty?
  next if stripped.start_with?('#')
  tokens = line.split
  if 1 == tokens.length
    s = tokens.first.downcase
    if labels_section_all.include?(s)
      section_current = s
      next
    end
  end
  unless tokens.length >= 3
    message = "Need more tokens in line #{i.succ}."
    ::Kernel.raise(message)
  end
  meridian = tokens.at(1).upcase
  unless meridians.include?(meridian)
    message = "Need AM or PM, or a space before it, in line #{i.succ}."
    ::Kernel.raise(message)
  end
  unless regexp_time =~ tokens.first
    message = "Bad start time: '#{tokens.first}' in line #{i.succ}."
    ::Kernel.raise(message)
  end
  unless section_current
    message = "Need a section label in line #{i.succ}."
    ::Kernel.raise(message)
  end
  is_am = 'AM' == meridian
  addend = is_am ? 0 : 12
  hour_twice, minute_small = [1,2].map {|e| ::Regexp.last_match[e].to_i}
  zeroed = 12 == hour_twice ? 0 : hour_twice
  hour = zeroed + addend
  minute = 60 * hour + minute_small
  string = tokens.drop(2).join(' ')
  sections_content[section_current].push([minute, string])
 end

# Fill any missing days
labels_section_week.each do |label_section|
  if sections_content[label_section].empty?
    sections_content[label_section] = sections_content[label_section_default]
  end
end

# Gather the information for verification
information_for_verification = ::Array.new
labels_section_week.each do |label_section|
  information_for_verification.push(label_section.capitalize)
  sections_content[label_section].each do |minutes, string|
    hour = minutes.div(60)
    minute = minutes % 60
    s_hour = '%2d' % hour
    s_minute = '%02d' % minute
    information_for_verification.push(" #{s_hour}:#{s_minute}  #{string}")
  end
end

# Print the information for verification
::File.open(ARGV.at(1),'w') do |f_verify|
  f_verify.puts(information_for_verification)
end

# Calculate the information for the webserver, as pairs
minutes_per_week = 7 * 24 * 60
zone_here = ::Time.now.zone
offset_seconds = ::Time.zone_offset(zone_here)
utc_minutes_add = - offset_seconds.div(60)
pairs = ::Array.new
labels_section_week.each_with_index do |label_section, i_day|
  sections_content[label_section].each do |minute_day, string|
    minute_week = i_day * 24 * 60 + minute_day
    minute = (minute_week + utc_minutes_add) % minutes_per_week
    pairs.push([minute, string])
  end
end

# Shrink the information for the webserver
minutes, descriptions_redundant = pairs.sort.transpose
descriptions = descriptions_redundant.sort.uniq
indexes = descriptions_redundant.map {|e| descriptions.index(e)}

# Enforce uniqueness of start times
unless minutes.uniq.length == minutes.length
  message = "No two shows may start on the same minute of the week."
  ::Kernel.raise(message)
end

# Build the information for the webserver
array = ['', minutes, indexes, descriptions]

# Constuct a digest
digest = ::Digest::MD5.hexdigest(array.inspect)
array[0] = digest

# Write the information
::File.open(ARGV.at(2),'w') do |f_webserver|
  f_webserver.puts(array.to_json)
end
