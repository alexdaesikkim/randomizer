import datetime
import json
import os
import re
from urllib.request import urlopen
from bs4 import BeautifulSoup


#problem: how to solve overlapping issues?
#1. can use local dict and keep track, but will double the memory size (3000ish max)
#2. somehow use json properties? but how to do this?
#3. use dict to store all data, then convert it to json later?

version_name = "2016080100"
print(version_name)

url = "http://www.wikihouse.com/taiko/index.php?AC14%A4%CE%BC%FD%CF%BF%B6%CA"

song_page = urlopen(url)

print ("Opened pages")

table = BeautifulSoup(page_new, "html5lib").find_all('div', class_='ie5')

song_rows = table[1].find_all('tr')

print ("Parsed pages")

songs = []

song_dict = {}

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
    0: "kantan",
    1: "futsuu",
    2: "muzukashii",
    3: "oni"
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

def parse_raw(rows):
    version = ""
    for row in rows:
        cols = row.find_all('td')
        if len(cols) == 1:
            version = cols[0].text
        if (len(cols) == 8):
                title = cols[1].text
                artist = cols[2].text
                bpm = cols[3].text
                get_song(get_level(cols[4]), 0, version, "single", title, artist, genre, bpm)
                get_song(get_level(cols[5]), 1, version, "single", title, artist, genre, bpm)
                get_song(get_level(cols[6]), 2, version, "single", title, artist, genre, bpm)
                get_song(get_level(cols[7]), 2, version, "single", title, artist, genre, bpm)
    return

parse_raw(old_rows, "")
parse_raw(new_rows_1, "jubeat clan")
parse_raw(new_rows_2, "jubeat clan")
parse_raw(new_rows_3, "jubeat clan")

print ("Writing json")

'''final_data = {
    "id": "jubeatclan",
    "songs": songs
}

with open('../games/jubeat/clan/' +  version_name + '.json', 'w') as file:
    json.dump(final_data, file, indent=2, sort_keys=True)
print ("Finished")

data = {}
with open('../games/game_data.json') as file:
    data = json.load(file)
    data["games"]["jubeat"]["versions"]["clan"]["current"] = version_name
    array = data["games"]["jubeat"]["versions"]["clan"]["builds"]
    check = False
    for x in array:
        if(version_name == x):
            check = True
    if not check:
        data["games"]["jubeat"]["versions"]["clan"]["builds"].append(version_name)
print ("Finished reading game_data.json file")

with open('../games/game_data.json', 'w') as file:
    json.dump(data, file, indent=2, sort_keys=True)
print ("Finished updating game_data.json file")
'''
