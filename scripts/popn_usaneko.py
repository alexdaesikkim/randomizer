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

version_url = "http://bemaniwiki.com/index.php?pop%27n%20music%20%A4%A6%A4%B5%A4%AE%A4%C8%C7%AD%A4%C8%BE%AF%C7%AF%A4%CE%CC%B4"
main_page = urlopen(version_url)
version_name = BeautifulSoup(main_page, "html5lib").findAll('strong', text=re.compile("^M39:"))[0].text[-10:]
print(version_name)

new_url = "http://bemaniwiki.com/index.php?pop%27n%20music%20%A4%A6%A4%B5%A4%AE%A4%C8%C7%AD%A4%C8%BE%AF%C7%AF%A4%CE%CC%B4%2F%BF%B7%B6%CA%A5%EA%A5%B9%A5%C8"
old_url = "http://bemaniwiki.com/index.php?pop%27n%20music%20%A4%A6%A4%B5%A4%AE%A4%C8%C7%AD%A4%C8%BE%AF%C7%AF%A4%CE%CC%B4%2F%B5%EC%B6%CA%A5%EA%A5%B9%A5%C8"

page_new = urlopen(new_url)
page_old = urlopen(old_url)

print ("Opened pages")

song_new_table = BeautifulSoup(page_new, "html5lib").find('div', class_='ie5')
old_tables = BeautifulSoup(page_old, "html5lib").find_all('div', class_='ie5')
song_old_table = old_tables[1]
song_cs_table = old_tables[2]
song_license_table = old_tables[3]
song_eemall_table = old_tables[4]

new_rows = song_new_table.find_all('tr')
old_rows = song_old_table.find_all('tr')
cs_rows = song_cs_table.find_all('tr')
license_rows = song_license_table.find_all('tr')
eemall_rows = song_eemall_table.find_all('tr')

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
    0: "easy",
    1: "normal",
    2: "hyper",
    3: "ex"
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
        if version != "pop'n music うさぎと猫と少年の夢" and len(cols) == 1:
            if(re.match("pop'n music", cols[0].text)) or (re.match("TV", cols[0].text)) or (re.match("ee", cols[0].text)):
                version = cols[0].text
                if(version.endswith(" ▲ ▼/△/△")):
                    version = version[:-8]
                if(version.endswith(" ▲ ▼/△")):
                    version = version[:-6]
                if(version.endswith(" ▲▼/△")):
                    version = version[:-5]
                if(version.endswith(" ▼/△") or version.endswith(" ▲/△")):
                    version = version[:-4]
                if(version.endswith(" /△")):
                    version = version[:-3]
                print(version)
        if (len(cols) == 9 or len(cols) == 10 or len(cols) == 12) and cols[3].text != "BPM":
            if not (cols[0].has_attr('style') and cols[0]['style'] == "background-color:#gray;"):
                x = 0
                genre = ''
                if(len(cols) == 10 or len(cols) == 12):
                    genre = cols[0].text
                    x = 1
                #basic
                #if it ends in leggendaria, there's only another difficulty
                #if it ends with hcn just nope
                title = cols[0+x].text
                artist = cols[1+x].text
                bpm = cols[2+x].text
                if bpm[0] == '[':
                    index = 0
                    while (bpm[index] != ']'):
                        index = index+1
                    bpm = bpm[index+1:len(bpm)]
                get_song(get_level(cols[4+x]), 0, version, "single", title, artist, genre, bpm)
                get_song(get_level(cols[5+x]), 1, version, "single", title, artist, genre, bpm)
                get_song(get_level(cols[6+x]), 2, version, "single", title, artist, genre, bpm)
                get_song(get_level(cols[7+x]), 3, version, "single", title, artist, genre, bpm)
    return

parse_raw(old_rows, "")
parse_raw(cs_rows, "")
parse_raw(license_rows, "")
parse_raw(eemall_rows, "")
parse_raw(new_rows, "pop'n music うさぎと猫と少年の夢")

print ("Writing json")

final_data = {
    "id": "popn24",
    "songs": songs
}

with open('../games/popn/24/' +  version_name + '.json', 'w') as file:
    json.dump(final_data, file, indent=2)
print ("Finished")

data = {}
with open('../games/game_data.json') as file:
    data = json.load(file)
    data["games"]["popn"]["versions"]["24"]["current"] = version_name
    array = data["games"]["popn"]["versions"]["24"]["builds"]
    check = False
    for x in array:
        print(x)
        print(version_name)
        if(version_name == x):
            check = True
    if not check:
        data["games"]["popn"]["versions"]["24"]["builds"].append(version_name)
print ("Finished reading game_data.json file")

with open('../games/game_data.json', 'w') as file:
    json.dump(data, file, indent=2)
print ("Finished updating game_data.json file")
