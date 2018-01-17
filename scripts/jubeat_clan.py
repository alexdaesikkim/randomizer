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

version_url = "http://bemaniwiki.com/index.php?jubeat%20clan"
main_page = urlopen(version_url)
version_name = BeautifulSoup(main_page, "html5lib").findAll('strong', text=re.compile("^L44:"))[0].text[-15:-5]
print(version_name)

new_url = "http://bemaniwiki.com/index.php?jubeat%20clan%2F%BF%B7%B6%CA%A5%EA%A5%B9%A5%C8"
old_url = "http://bemaniwiki.com/index.php?jubeat%20clan%2F%B5%EC%B6%CA%A5%EA%A5%B9%A5%C8"

page_new = urlopen(new_url)
page_old = urlopen(old_url)

print ("Opened pages")

new_tables = BeautifulSoup(page_new, "html5lib").find_all('div', class_='ie5')
old_tables = BeautifulSoup(page_old, "html5lib").find_all('div', class_='ie5')
new_table_1 = new_tables[0]
new_table_2 = new_tables[1]
new_table_3 = new_tables[2]
old_table = old_tables[2]

new_rows_1 = new_table_1.find_all('tr')
new_rows_2 = new_table_2.find_all('tr')
new_rows_3 = new_table_3.find_all('tr')
old_rows = old_table.find_all('tr')

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
    0: "Basic",
    1: "Advanced",
    2: "Extreme",
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
        if version != "jubeat clan" and len(cols) == 1:
            if(re.match("jubeat", cols[0].text)):
                version = cols[0].text
        if (len(cols) == 10 or len(cols) == 11):
            if not (cols[0].has_attr('style') and cols[0]['style'] == "background-color:#gray;"):
                x = 0
                if(len(cols) == 11):
                    x = 1
                genre = cols[0+x].text
                title = cols[1+x].text
                if(title.endswith("*3") or title.endswith("*4")):
                    title = title[:-2]
                artist = cols[2+x].text
                if(artist.endswith("*1") or artist.endswith("*2")):
                    title = title[:-2]
                bpm = cols[3+x].text
                get_song(get_level(cols[4+x]), 0, version, "single", title, artist, genre, bpm)
                get_song(get_level(cols[6+x]), 1, version, "single", title, artist, genre, bpm)
                get_song(get_level(cols[8+x]), 2, version, "single", title, artist, genre, bpm)
    return

parse_raw(old_rows, "")
parse_raw(new_rows_1, "jubeat clan")
parse_raw(new_rows_2, "jubeat clan")
parse_raw(new_rows_3, "jubeat clan")

print ("Writing json")

final_data = {
    "id": "jubeatclan",
    "songs": songs
}

with open('../games/jubeat/clan/' +  version_name + '.json', 'w') as file:
    json.dump(final_data, file, indent=2)
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
    json.dump(data, file, indent=2)
print ("Finished updating game_data.json file")
