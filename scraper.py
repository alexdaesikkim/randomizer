#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
reload(sys)
sys.setdefaultencoding('utf-8')
import datetime
import urllib2
import json
from bs4 import BeautifulSoup


#problem: how to solve overlapping issues?
#1. can use local dict and keep track, but will double the memory size (3000ish max)
#2. somehow use json properties? but how to do this?
#3. use dict to store all data, then convert it to json later?

sinobuz_new_url = "http://bemaniwiki.com/index.php?beatmania%20IIDX%2024%20SINOBUZ%2F%BF%B7%B6%CA%A5%EA%A5%B9%A5%C8"
sinobuz_old_url = "http://bemaniwiki.com/index.php?beatmania%20IIDX%2024%20SINOBUZ%2F%B5%EC%B6%CA%A5%EA%A5%B9%A5%C8"

page_new = urllib2.urlopen(sinobuz_new_url)
page_old = urllib2.urlopen(sinobuz_old_url)

print "Opened pages"

song_new_table = BeautifulSoup(page_new, "html.parser").find('div', class_='ie5')
song_old_table = BeautifulSoup(page_old, "html.parser").find_all('div', class_='ie5')[1]

sinobuz_new_rows = song_new_table.find_all('tr')
sinobuz_old_rows = song_old_table.find_all('tr')

print "Parsed pages"

songs = []

song_dict = {}

#solution: use dictionary, have title + difficulty (in plain text, i.e. SPA) as the key
#REMINDER: leggendarias are separate difficulty due to reasons
#also, remove (HCN ver.) before creating key

#reminder to self for DDR: BSP, two of them exist. differentiate beginner

print "Grabbing data..."

def get_level(col):
    level = col.text
    if len(col) != 1 and level != '-':
        index = len(level)-1
        end_index = index
        while (level[index] != ']'):
            index = index-1
        level = level[index+1:len(level)]
    elif level == '-':
        level = 0
    return level

diff_options = {
    0: "spb",
    1: "spn",
    2: "sph",
    3: "spa",
    4: "dpn",
    5: "dph",
    6: "dpa",
    7: "spl",
    8: "dpl"
}

def get_song(level, difficulty, title, artist, bpm):
    if(level != 0):
        diff_name = diff_options[difficulty]
        style = "single"
        if difficulty > 3:
            style = "double"
        key = title + " " + diff_name
        if key not in song_dict:
            data = {
                "title": title,
                "artist": artist,
                "bpm": bpm,
                "style": style,
                "difficulty": difficulty,
                "level": level
            }
            song_dict[key] = data

leggendaria = "LEGGENDARIA"
leggendaria_mark = "†"
hcn = "(HCN Ver.)"

def parse_raw(rows):
    for row in rows:
        cols = row.find_all('td')
        if len(cols) == 11:
            #basic
            #if it ends in leggendaria, there's only another difficulty
            #if it ends with hcn just nope
            title = cols[9].text
            artist = cols[10].text
            if title.startswith('crew['):
                title = "crew"
                artist = "beatnation Records"
            if title.startswith('Evans['):
                title = "Evans"
            if artist.startswith('DJ SWAN['):
                artist = "DJ SWAN"
            bpm = cols[7].text
            if title.endswith(leggendaria_mark) or title.endswith(leggendaria):
                get_song(get_level(cols[3]), 7, title, artist, bpm)
                get_song(get_level(cols[6]), 8, title, artist, bpm)
            elif not title.endswith(hcn):
                get_song(get_level(cols[0]), 0, title, artist, bpm)
                get_song(get_level(cols[1]), 1, title, artist, bpm)
                get_song(get_level(cols[2]), 2, title, artist, bpm)
                get_song(get_level(cols[3]), 3, title, artist, bpm)
                get_song(get_level(cols[4]), 4, title, artist, bpm)
                get_song(get_level(cols[5]), 5, title, artist, bpm)
                get_song(get_level(cols[6]), 6, title, artist, bpm)
    return

parse_raw(sinobuz_new_rows)
parse_raw(sinobuz_old_rows)

for x in song_dict:
    songs.append(song_dict[x])

now = datetime.datetime.now()

print "Writing json"

final_data = {
    "id": "beatmaniaiidx24",
    "songs": songs
}
with open('./games/iidx/24/' + now.strftime('%Y%m%d') + '.json', 'wb') as file:
    json.dump(final_data, file)

print "Finished"
