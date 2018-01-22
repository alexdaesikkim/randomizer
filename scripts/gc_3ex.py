import json
import os
import re
from urllib.request import urlopen
from bs4 import BeautifulSoup


#problem: how to solve overlapping issues?
#1. can use local dict and keep track, but will double the memory size (3000ish max)
#2. somehow use json properties? but how to do this?
#3. use dict to store all data, then convert it to json later?

version_url = "http://www.wikihouse.com/groove/index.php?Groove%20Coaster%A1%CAAC%C8%C7%A1%CB%2F%BC%FD%CF%BF%B6%CA%A5%EA%A5%B9%A5%C8#VARIETY"
main_page = urlopen(version_url)
side_bar = BeautifulSoup(main_page, "html5lib").find('div', class_='span3 hidden-phone')
text = side_bar.find_all('p')[1].text.split("(")[1]
text = text[:-1]
version_name = text

print(version_name)
song_url = "http://www.wikihouse.com/groove/index.php?Groove%20Coaster%A1%CAAC%C8%C7%A1%CB%2F%BC%FD%CF%BF%B6%CA%A5%EA%A5%B9%A5%C8#VARIETY"

song_opened_url = urlopen(song_url)

print ("Opened page")

all_song_table = BeautifulSoup(song_opened_url, "html5lib").find('div', class_='ie5')

all_rows = all_song_table.find_all('tr')

songs = []

song_dict = {}

#solution: use dictionary, have title + difficulty (in plain text, i.e. SPA) as the key
#REMINDER: leggendarias are separate difficulty due to reasons
#also, remove (HCN ver.) before creating key

#reminder to self for DDR: BSP, two of them exist. differentiate beginner

print ("Grabbing data...")

def get_levels(col):
    levels = col.text.split(".")
    return levels

diff_options = {
    0: "Simple",
    1: "Normal",
    2: "Hard",
    3: "Extra"
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
    #need case for era and valanga
    for row in rows:
        cols = row.find_all('td')
        if len(cols) == 1:
            version = cols[0].text.split(" ")[0]
            version = version[5:]
            print(version)
        if len(cols) == 6 and cols[3].text != 'BPM':
            if not (re.match("storyteller:", cols[1].text)):
                title = cols[0].text
                artist = cols[1].text
                genre = ""
                bpm = cols[3].text
                levels = get_levels(cols[2])

                get_song(levels[0], 0, version, "single", title, artist, genre, bpm)
                get_song(levels[1], 1, version, "single", title, artist, genre, bpm)
                get_song(levels[2], 2, version, "single", title, artist, genre, bpm)
                if(len(levels) > 3):
                    get_song(levels[3], 3, version, "single", title, artist, genre, bpm)
    return

parse_raw(all_rows, "")

print ("Writing json")

final_data = {
    "id": "gc_3ex",
    "songs": songs
}

with open('../games/gc/3ex/' +  version_name + '.json', 'w') as file:
    json.dump(final_data, file, indent=2, sort_keys=True)
print ("Finished")

data = {}
with open('../games/game_data.json') as file:
    data = json.load(file)
    data["games"]["gc"]["versions"]["3ex"]["current"] = version_name
    array = data["games"]["gc"]["versions"]["3ex"]["builds"]
    check = False
    for x in array:
        if(version_name == x):
            check = True
    if not check:
        data["games"]["gc"]["versions"]["3ex"]["builds"].append(version_name)
print ("Finished reading game_data.json file")

with open('../games/game_data.json', 'w') as file:
    json.dump(data, file, indent=2, sort_keys=True)
print ("Finished updating game_data.json file")
