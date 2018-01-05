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

ddr_2014_version_url = "http://bemaniwiki.com/?DanceDanceRevolution(2014)"
main_page = urlopen(ddr_2014_version_url)
version_name = "2016021000"
print(version_name)

if not os.path.isfile('../games/ddr/2014/' + version_name + '.json'):
    ddr_2014_new_url = "http://bemaniwiki.com/index.php?DanceDanceRevolution%282014%29%2F%BF%B7%B6%CA%A5%EA%A5%B9%A5%C8"
    ddr_2014_old_url = "http://bemaniwiki.com/index.php?DanceDanceRevolution%282014%29%2F%B5%EC%B6%CA%A5%EA%A5%B9%A5%C8"

    page_new = urlopen(ddr_2014_new_url)
    page_old = urlopen(ddr_2014_old_url)

    print ("Opened pages")

    new_table = BeautifulSoup(page_new, "html.parser").find_all('div', class_='ie5')
    song_2014_table = new_table[0]
    song_2013_table = new_table[1]
    song_old_table = BeautifulSoup(page_old, "html.parser").find_all('div', class_='ie5')[1]

    ddr_2014_rows = song_2014_table.find_all('tr')
    ddr_2013_rows = song_2013_table.find_all('tr')
    ddr_old_rows = song_old_table.find_all('tr')

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

    def get_song(level, difficulty, version, style, title, artist, source, bpm):
        if(level != -1):
            diff_name = diff_options[difficulty]
            key = title + " " + diff_name + " " + style
            if key not in song_dict:
                data = {
                    "title": title,
                    "artist": artist,
                    "source": source,
                    "bpm": bpm,
                    "style": style,
                    "difficulty": difficulty,
                    "level": level,
                    "version": version
                }
                song_dict[key] = data

    def parse_raw(rows, version):
        for row in rows:
            cols = row.find_all('td')
            if version != "DanceDanceRevolution 2014" and version != "DanceDanceRevolution 2013" and len(cols) == 1:
                print(cols)
                version = cols[0].text
                if(version.endswith(" ▲ ▼ △")):
                    version = version[:-6]
                if(version.endswith(" ▲ △") or version.endswith(" ▼ △")):
                    version = version[:-4]
                if(version.endswith(" ▲▼")):
                    verison = version[:-3]
                if(version.endswith(" ▼") or version.endswith("▲▼")):
                    version = version[:-2]
                if(version.endswith("▲")):
                    version = version[:-1]
                print(version)
            if len(cols) == 15:
                #basic
                #if it ends in leggendaria, there's only another difficulty
                #if it ends with hcn just nope
                title = cols[1].text
                artist = cols[2].text
                source = cols[3].text
                bpm = cols[4].text
                get_song(get_level(cols[6]), 0, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[7]), 1, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[8]), 2, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[9]), 3, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[10]), 4, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[11]), 1, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[12]), 2, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[13]), 3, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[14]), 4, version, "double", title, artist, source, bpm)
        return

    parse_raw(ddr_2014_rows, "DanceDanceRevolution 2014")
    parse_raw(ddr_2013_rows, "DanceDanceRevolution 2013")
    parse_raw(ddr_old_rows, "")

    for x in song_dict:
        songs.append(song_dict[x])

    print ("Writing json")

    final_data = {
        "id": "ddrace",
        "songs": songs
    }
    #remember to change the datetime to the one from the page, not on the date it was update on the app's server
    '''with open('../games/ddr/ace/' +  version_name + '.json', 'w') as file:
        json.dump(final_data, file)
    print ("Finished")
    '''
else:
    print("Version " + version_name + " already exists. Exiting...")
