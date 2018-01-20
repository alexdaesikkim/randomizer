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

version_url = "http://bemaniwiki.com/index.php?REFLEC%20BEAT%20%CD%AA%B5%D7%A4%CE%A5%EA%A5%D5%A5%EC%A5%B7%A5%A2"
main_page = urlopen(version_url)
version_name = BeautifulSoup(main_page, "html5lib").findAll('strong', text=re.compile("^MBR:"))[0].text[-10:]
print(version_name)

new_url = "http://bemaniwiki.com/index.php?REFLEC%20BEAT%20%CD%AA%B5%D7%A4%CE%A5%EA%A5%D5%A5%EC%A5%B7%A5%A2%2F%BF%B7%B6%CA%A5%EA%A5%B9%A5%C8"
old_url = "http://bemaniwiki.com/index.php?REFLEC%20BEAT%20%CD%AA%B5%D7%A4%CE%A5%EA%A5%D5%A5%EC%A5%B7%A5%A2%2F%A5%EA%A5%E1%A5%A4%A5%AF%C9%E8%CC%CC%A5%EA%A5%B9%A5%C8"

page_new = urlopen(new_url)
page_old = urlopen(old_url)

print ("Opened pages")

new_table = BeautifulSoup(page_new, "html5lib").find_all('div', class_='ie5')[1]
old_table = BeautifulSoup(page_old, "html5lib").find_all('div', class_='ie5')[2]

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
    0: "Basic",
    1: "Medium",
    2: "Hard",
    3: "White Hard"
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
        if version != "REFLEC BEAT 悠久のリフレシア" and len(cols) == 1:
            if(re.match("REFLEC BEAT", cols[0].text)):
                version = cols[0].text
        if len(cols) == 18:
            if not (cols[1].has_attr('style') and cols[1]['style'] == "background-color:#gray;"):
                title = cols[3].text
                if(re.search("[*][0-9]$", title)):
                    title = title[:-2]
                genre = cols[1].text
                artist = cols[4].text
                if(re.search("[*][0-9]$", artist) and not artist.endswith("mow*2")):
                    artist = artist[:-2]
                bpm = cols[5].text
                get_song(get_level(cols[6]), 0, version, "single", title, artist, genre, bpm)
                get_song(get_level(cols[9]), 1, version, "single", title, artist, genre, bpm)
                get_song(get_level(cols[12]), 2, version, "single", title, artist, genre, bpm)
                get_song(get_level(cols[15]), 3, version, "single", title, artist, genre, bpm)
        elif len(cols) == 13:
            if version != "REFLEC BEAT 悠久のリフレシア" and len(cols) == 1:
                if(re.match("REFLEC BEAT", cols[0].text)):
                    version = cols[0].text
            if not (cols[1].has_attr('style') and re.match("^background-color:gray;", cols[1]['style'])):
                title = cols[0].text
                if(re.search("[*][0-9]$", title)):
                    title = title[:-2]
                if(re.match("era", title)):
                    genre = "オリジナル"
                    artist = "TaQ"
                    bpm = "90-180"
                    get_song(get_level(cols[10]), 3, version, "single", title, artist, genre, bpm)
                elif(re.match("Valanga", title)):
                    genre = "オリジナル"
                    artist = "DJ TOTTO"
                    bpm = "186"
                    get_song(get_level(cols[10]), 3, version, "single", title, artist, genre, bpm)
    return

parse_raw(old_rows, "")
parse_raw(new_rows, "REFLEC BEAT 悠久のリフレシア")

print ("Writing json")

final_data = {
    "id": "reflec_reflesia",
    "songs": songs
}

with open('../games/rb/reflesia/' +  version_name + '.json', 'w') as file:
    json.dump(final_data, file, indent=2)
print ("Finished")

data = {}
with open('../games/game_data.json') as file:
    data = json.load(file)
    data["games"]["rb"]["versions"]["reflesia"]["current"] = version_name
    array = data["games"]["rb"]["versions"]["reflesia"]["builds"]
    check = False
    for x in array:
        if(version_name == x):
            check = True
    if not check:
        data["games"]["rb"]["versions"]["reflesia"]["builds"].append(version_name)
print ("Finished reading game_data.json file")

with open('../games/game_data.json', 'w') as file:
    json.dump(data, file, indent=2)
print ("Finished updating game_data.json file")
