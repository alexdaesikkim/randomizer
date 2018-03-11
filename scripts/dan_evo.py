import json
import os
import re
from urllib.request import urlopen
from bs4 import BeautifulSoup


#problem: how to solve overlapping issues?
#1. can use local dict and keep track, but will double the memory size (3000ish max)
#2. somehow use json properties? but how to do this?
#3. use dict to store all data, then convert it to json later?

version_name = "FINAL"
print(version_name)

url = "http://bemaniwiki.com/index.php?DanceEvolution%20ARCADE%2F%BC%FD%CF%BF%B6%CA%A5%EA%A5%B9%A5%C8"

song_page = urlopen(url)

print ("Opened pages")

table = BeautifulSoup(song_page, "html5lib").find('div', class_='ie5')

song_rows = table.find_all('tr')

print ("Parsed pages")

songs = []

song_dict = {}

#solution: use dictionary, have title + difficulty (in plain text, i.e. SPA) as the key
#REMINDER: leggendarias are separate difficulty due to reasons
#also, remove (HCN ver.) before creating key

#reminder to self for DDR: BSP, two of them exist. differentiate beginner

print ("Grabbing data...")

def get_level(col):
    level = col.text
    if len(col) != 1 and level != '-' and level != '' and level != '--' and len(col) != 0:
        index = len(level)-1
        while (level[index] != ']'):
            index = index-1
        level = level[index+1:len(level)]
    elif level == '-' or level == '' or level == '--':
        level = -1
    return level

diff_options = {
    0: "All"
}

def get_song(level, difficulty, version, style, title, artist, genre, bpm):
    if(level != -1):
        diff_name = diff_options[difficulty]
        key = title + " " + artist + " " + version + " " + bpm + " "+ diff_name + " " + style
        if key not in song_dict:
            data = {
                "title": title,
                "artist": artist,
                "genre": genre,
                "bpm": bpm,
                "style": style,
                "difficulty": difficulty,
                "level": level,
                "version": version
            }
            song_dict[key] = True
            songs.append(data)

def parse_raw(rows, version):
    for row in rows:
        cols = row.find_all('td')
        if (not len(cols) == 1 and (len(cols) == 8 or len(cols) == 9)):
            if not (cols[1].has_attr('style') and re.match("^background-color:GRAY;", cols[1]['style'])) and cols[3].text != 'BPM':
                x = 0
                if(len(cols) == 9):
                    x = 1
                title = cols[0+x].text
                artist = cols[1+x].text
                bpm = cols[3+x].text
                genre = cols[7+x].text
                get_song(get_level(cols[4+x]), 0, version, "single", title, artist, genre, bpm)
    return

parse_raw(song_rows, "")

print ("Writing json")

final_data = {
    "id": "danevo",
    "songs": songs
}

with open('../games/danevo/first/FINAL.json', 'w') as file:
    json.dump(final_data, file, indent=2, sort_keys=True)
print ("Finished")
