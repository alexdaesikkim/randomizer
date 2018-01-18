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

version_url = "http://bemaniwiki.com/index.php?SOUND%20VOLTEX%20IV%20HEAVENLY%20HAVEN"
main_page = urlopen(version_url)
version_name = BeautifulSoup(main_page, "html5lib").findAll('strong', text=re.compile("^KFC:"))[0].text[-10:]
print(version_name)

new_url = "http://bemaniwiki.com/index.php?SOUND%20VOLTEX%20IV%20HEAVENLY%20HAVEN%2F%BF%B7%B6%CA%A5%EA%A5%B9%A5%C8"
old_url = "http://bemaniwiki.com/index.php?SOUND%20VOLTEX%20IV%20HEAVENLY%20HAVEN%2F%B5%EC%B6%CA%2F%B3%DA%B6%CA%A5%EA%A5%B9%A5%C8"

page_new = urlopen(new_url)
page_old = urlopen(old_url)

print ("Opened pages")

new_table = BeautifulSoup(page_new, "html5lib").find('div', class_='ie5')
old_tables = BeautifulSoup(page_old, "html5lib").find_all('div', class_='ie5')
sdvx_1 = old_tables[1]
sdvx_2 = old_tables[2]
sdvx_3 = old_tables[3]
new_table = new_table

sdvx_rows_1 = sdvx_1.find_all('tr')
sdvx_rows_2 = sdvx_2.find_all('tr')
sdvx_rows_3 = sdvx_3.find_all('tr')
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
    if len(col) != 1 and level != '-' and len(col) != 0:
        index = len(level)-1
        end_index = index
        while (level[index] != ']'):
            index = index-1
        level = level[index+1:len(level)]
    elif level == '-' or level == '' or level == '--':
        level = -1
    elif(len(level) == 3):
        level = level[1:]
    return level

diff_options = {
    0: "Novice",
    1: "Advanced",
    2: "Exhaust",
    3: "Maximum",
    4: "Inf",
    5: "Grv",
    6: "Hvn"
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
        #if row is 8, def old song with shorter rows
        #if row is 9, it may be old rows or sdvx4 songs but shorter row
        if ((len(cols) == 9 and version != "SOUND VOLTEX IV HEAVENLY HAVEN") or len(cols) == 10) and cols[3].text != "BPM":
            if not (cols[0].has_attr('style') and cols[0]['style'] == "background-color:gray;"):
                title = cols[0].text
                genre = ''
                if(re.search("[*][0-9]$", title)):
                    title = title[:-2]
                artist = cols[1].text
                bpm = cols[3].text
                get_song(get_level(cols[4]), 0, version, "single", title, artist, genre, bpm)
                get_song(get_level(cols[5]), 1, version, "single", title, artist, genre, bpm)
                get_song(get_level(cols[6]), 2, version, "single", title, artist, genre, bpm)
                if(len(cols) == 10):
                    get_song(get_level(cols[7]), 3, version, "single", title, artist, genre, bpm)
                    get_song(get_level(cols[8]), 6, version, "single", title, artist, genre, bpm)
                elif(cols[7].has_attr('style')):
                    if(re.match("^background-color:#fce;", cols[7]['style'])):
                        get_song(get_level(cols[7]), 4, version, "single", title, artist, genre, bpm)
                    elif(re.match("^background-color:#fdc;", cols[7]['style'])):
                        get_song(get_level(cols[7]), 5, version, "single", title, artist, genre, bpm)
                    else:
                        get_song(get_level(cols[7]), 6, version, "single", title, artist, genre, bpm)
        elif (len(cols) == 8 or len(cols) == 9) and cols[3].text != "BPM":
            if not (cols[0].has_attr('style') and cols[0]['style'] == "background-color:gray;"):
                x = 0
                if(len(cols) == 9):
                    x = 1
                title = cols[0].text
                genre = ''
                if(re.search("[*][0-9]$", title)):
                    title = title[:-2]
                artist = cols[1].text
                bpm = cols[2].text
                get_song(get_level(cols[3]), 0, version, "single", title, artist, genre, bpm)
                get_song(get_level(cols[4]), 1, version, "single", title, artist, genre, bpm)
                get_song(get_level(cols[5]), 2, version, "single", title, artist, genre, bpm)
                if(len(cols) == 9):
                    get_song(get_level(cols[6]), 3, version, "single", title, artist, genre, bpm)
                    get_song(get_level(cols[7]), 6, version, "single", title, artist, genre, bpm)
                elif(cols[6].has_attr('style')):
                    if(re.match("^background-color:#fce;", cols[6]['style'])):
                        get_song(get_level(cols[6]), 4, version, "single", title, artist, genre, bpm)
                    elif(re.match("^background-color:#fdc;", cols[6]['style'])):
                        get_song(get_level(cols[6]), 5, version, "single", title, artist, genre, bpm)
                    else:
                        get_song(get_level(cols[6]), 6, version, "single", title, artist, genre, bpm)
    return

parse_raw(sdvx_rows_1, "SOUND VOLTEX BOOTH")
parse_raw(sdvx_rows_2, "SOUND VOLTEX II -infinite infection-")
parse_raw(sdvx_rows_3, "SOUND VOLTEX III GRAVITY WARS")
parse_raw(new_rows, "SOUND VOLTEX IV HEAVENLY HAVEN")

print ("Writing json")

final_data = {
    "id": "sdvxiv",
    "songs": songs
}

with open('../games/sdvx/iv/' +  version_name + '.json', 'w') as file:
    json.dump(final_data, file, indent=2)
print ("Finished")

data = {}
with open('../games/game_data.json') as file:
    data = json.load(file)
    data["games"]["sdvx"]["versions"]["iv"]["current"] = version_name
    array = data["games"]["sdvx"]["versions"]["iv"]["builds"]
    check = False
    for x in array:
        if(version_name == x):
            check = True
    if not check:
        data["games"]["sdvx"]["versions"]["iv"]["builds"].append(version_name)
print ("Finished reading game_data.json file")

with open('../games/game_data.json', 'w') as file:
    json.dump(data, file, indent=2)
print ("Finished updating game_data.json file")
