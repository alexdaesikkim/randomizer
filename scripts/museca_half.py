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

version_url = "http://bemaniwiki.com/index.php?MUSECA%201%2B1%2F2"
main_page = urlopen(version_url)
version_name = BeautifulSoup(main_page, "html5lib").findAll('strong', text=re.compile("^PIX:"))[0].text[-10:]
print(version_name)

new_url = "http://bemaniwiki.com/index.php?MUSECA%201%2B1%2F2%2F%BF%B7%B6%CA%A5%EA%A5%B9%A5%C8"
old_url = "http://bemaniwiki.com/index.php?MUSECA%201%2B1%2F2%2F%B5%EC%B6%CA%A5%EA%A5%B9%A5%C8"

page_new = urlopen(new_url)
page_old = urlopen(old_url)

print ("Opened pages")

new_table = BeautifulSoup(page_new, "html5lib").find_all('div', class_='ie5')[1]
old_table = BeautifulSoup(page_old, "html5lib").find_all('div', class_='ie5')[1]

old_rows = old_table.find_all('tr')
new_rows = new_table.find_all('tr')

songs = []

song_dict = {}

#solution: use dictionary, have title + difficulty (in plain text, i.e. SPA) as the key
#REMINDER: leggendarias are separate difficulty due to reasons
#also, remove (HCN ver.) before creating key

#reminder to self for DDR: BSP, two of them exist. differentiate beginner

print ("Grabbing data...")

def get_level(col):
    level = col.text
    if level == '-' or level == '' or level == '--':
        level = -1
    return level

diff_options = {
    0: "G",
    1: "Y",
    2: "R"
}

def get_song(level, difficulty, version, style, title, artist, genre, bpm):
    if(level != -1):
        diff_name = diff_options[difficulty]
        key = title + " " + diff_name + " " + style
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
        if (len(cols) == 8) and cols[3].text != "BPM":
            if not (cols[1].has_attr('style') and re.match("^background-color:gray;", cols[1]['style'])):
                title = cols[1].text
                genre = ''
                artist = cols[2].text
                bpm = cols[3].text
                get_song(get_level(cols[4]), 0, version, "single", title, artist, genre, bpm)
                get_song(get_level(cols[5]), 1, version, "single", title, artist, genre, bpm)
                get_song(get_level(cols[6]), 2, version, "single", title, artist, genre, bpm)
    return

parse_raw(old_rows, "MÚSECA")
parse_raw(new_rows, "MÚSECA 1+1/2")

print ("Writing json")

final_data = {
    "id": "museca1+1/2",
    "songs": songs
}

with open('../games/museca/1_5/' +  version_name + '.json', 'w') as file:
    json.dump(final_data, file, indent=2)
print ("Finished")

data = {}
with open('../games/game_data.json') as file:
    data = json.load(file)
    data["games"]["museca"]["versions"]["1_5"]["current"] = version_name
    array = data["games"]["museca"]["versions"]["1_5"]["builds"]
    check = False
    for x in array:
        if(version_name == x):
            check = True
    if not check:
        data["games"]["museca"]["versions"]["1_5"]["builds"].append(version_name)
print ("Finished reading game_data.json file")

with open('../games/game_data.json', 'w') as file:
    json.dump(data, file, indent=2)
print ("Finished updating game_data.json file")
