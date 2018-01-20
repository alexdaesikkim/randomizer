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

version_name = "FINAL"
print(version_name)

page_url = "https://zenius-i-vanisher.com/v5.2/gamedb.php?gameid=81"

page_opened_url = urlopen(page_url)

print ("Opened pages")

song_table = BeautifulSoup(page_opened_url, "html5lib").find_all('table')[2]

song_rows = song_table.find_all('tr')

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
    if len(col) != 1 and level != '-' and len(col) != 0:
        index = len(level)-1
        end_index = index
        while (level[index] != ']'):
            index = index-1
        level = level[index+1:len(level)]
    elif level == '-':
        level = -1
    return level

diff_options = {
    0: "beginner",
    1: "basic",
    2: "difficult",
    3: "expert",
    4: "challenge"
}
def get_song(level, difficulty, version, style, title, artist, bpm):
    if(level != -1):
        diff_name = diff_options[difficulty]
        key = title + " " + artist + " " + version + " " + bpm + " "+ diff_name + " " + style
        if key not in song_dict:
            data = {
                "title": title,
                "artist": artist,
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
        if len(cols) == 12 or len(cols) == 13:
            count = len(songs)
            x = 0
            genre = ""
            if len(cols) == 13:
                x = 1;
                genre = cols[2].text
            title = cols[0]
            if(title.find('span') is None):
                title = title.text
            else:
                title = title.find('span').text
            artist = cols[1]
            if(artist.find('span') is None):
                artist = artist.text
            else:
                artist = artist.find('span').text
            bpm = cols[2+x].text
            get_song(get_level(cols[3+x]), 0, version, "single", title, artist, bpm)
            get_song(get_level(cols[4+x]), 1, version, "single", title, artist, bpm)
            get_song(get_level(cols[5+x]), 2, version, "single", title, artist, bpm)
            get_song(get_level(cols[6+x]), 3, version, "single", title, artist, bpm)
            get_song(get_level(cols[7+x]), 4, version, "single", title, artist, bpm)
            get_song(get_level(cols[8+x]), 1, version, "double", title, artist, bpm)
            get_song(get_level(cols[9+x]), 2, version, "double", title, artist, bpm)
            get_song(get_level(cols[10+x]), 3, version, "double", title, artist, bpm)
            get_song(get_level(cols[11+x]), 4, version, "double", title, artist, bpm)
            if(len(songs) == count):
                print(title)
                print("error")
    return

parse_raw(song_rows, "")

print ("Writing json")

final_data = {
    "id": "ddrextreme",
    "songs": songs
}
#remember to change the datetime to the one from the page, not on the date it was update on the app's server
with open('../games/ddr/extreme/' +  "RAWR"+ '.json', 'w') as file:
    json.dump(final_data, file, indent=2)
print ("Finished writing json")

'''data = {}
with open('../games/game_data.json') as file:
    data = json.load(file)
    data["games"]["ddr"]["versions"]["extreme"]["current"] = version_name
    array = data["games"]["ddr"]["versions"]["extreme"]["builds"]
    check = False
    for x in array:
        if(version_name == x):
            check = True
    if not check:
        data["games"]["ddr"]["versions"]["extreme"]["builds"].append(version_name)
print ("Finished reading game_data.json file")

with open('../games/game_data.json', 'w') as file:
    json.dump(data, file, indent=2)
print ("Finished updating game_data.json file")
'''
