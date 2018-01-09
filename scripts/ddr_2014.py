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

force_update = True

ddr_2014_version_url = "http://bemaniwiki.com/?DanceDanceRevolution(2014)"
main_page = urlopen(ddr_2014_version_url)
version_name = "2016021000"
print(version_name)

if not os.path.isfile('../games/ddr/2014/' + version_name + '.json') or force_update:



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
                song_dict[key] = True
                songs.append(data)

    def parse_new(rows, version):
        i = 0
        while i < len(rows):
            row = rows[i]
            i += 1
            cols = row.find_all('td')
            #all types need to be special cases
            #just bad programming on my part but im also not sure how to skip rows, just rows++?
            if version != "DanceDanceRevolution 2014" and version != "DanceDanceRevolution 2013" and len(cols) == 1:
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
            if len(cols) == 15:
                #basic
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

    def parse_old(rows, version):
        i = 0
        while i < len(rows):
            row = rows[i]
            i += 1
            cols = row.find_all('td')
            #all types need to be special cases
            #just bad programming on my part but im also not sure how to skip rows, just rows++?
            if cols[0].text == "New York EVOLVED (Type A)":
                title = "New York EVOLVED (Type A)"
                artist = "NC underground"
                source = "DDR 2010"
                bpm = "48-380(95-380)"

                get_song(get_level(cols[5]), 0, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[6]), 1, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[7]), 2, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[8]), 3, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[9]), 4, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[10]), 1, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[11]), 2, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[12]), 3, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[13]), 4, version, "double", title, artist, source, bpm)
                title = "New York EVOLVED (Type B)"
                bpm = "48-380(47.5-190)"
                get_song(get_level(cols[5]), 0, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[6]), 1, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[7]), 2, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[8]), 3, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[9]), 4, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[10]), 1, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[11]), 2, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[12]), 3, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[13]), 4, version, "double", title, artist, source, bpm)

                title = "New York EVOLVED (Type C)"
                get_song(get_level(cols[5]), 0, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[6]), 1, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[7]), 2, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[8]), 3, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[9]), 4, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[10]), 1, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[11]), 2, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[12]), 3, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[13]), 4, version, "double", title, artist, source, bpm)

                i += 2
            elif cols[0].text == "osaka EVOLVED -毎度、おおきに!- (TYPE1)":
                title = "osaka EVOLVED -毎度、おおきに!- (TYPE1)"
                artist = "NAOKI underground"
                source = "海外版 CS DDR HOTTEST PARTY 2 / CS DDR フルフル♪パーティー"
                bpm = "50-300"
                get_song(get_level(cols[5]), 0, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[6]), 1, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[7]), 2, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[8]), 3, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[9]), 4, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[10]), 1, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[11]), 2, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[12]), 3, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[13]), 4, version, "double", title, artist, source, bpm)
                title = "osaka EVOLVED -毎度、おおきに!- (TYPE2)"
                bpm = "48-380(47.5-190)"
                get_song(get_level(cols[5]), 0, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[6]), 1, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[7]), 2, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[8]), 3, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[9]), 4, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[10]), 1, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[11]), 2, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[12]), 3, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[13]), 4, version, "double", title, artist, source, bpm)
                title = "osaka EVOLVED -毎度、おおきに!- (TYPE3)"
                get_song(get_level(cols[5]), 0, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[6]), 1, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[7]), 2, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[8]), 3, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[9]), 4, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[10]), 1, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[11]), 2, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[12]), 3, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[13]), 4, version, "double", title, artist, source, bpm)
                i += 2
            elif cols[0].text == "tokyoEVOLVED (TYPE1)":
                title = "tokyoEVOLVED (TYPE1)"
                artist = "NAOKI underground"
                source = "CS DDR HOTTEST PARTY"
                bpm = "50-300"
                get_song(get_level(cols[5]), 0, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[6]), 1, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[7]), 2, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[8]), 3, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[9]), 4, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[10]), 1, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[11]), 2, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[12]), 3, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[13]), 4, version, "double", title, artist, source, bpm)
                title = "tokyoEVOLVED (TYPE2)"
                bpm = "48-380(47.5-190)"
                get_song(get_level(cols[5]), 0, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[6]), 1, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[7]), 2, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[8]), 3, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[9]), 4, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[10]), 1, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[11]), 2, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[12]), 3, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[13]), 4, version, "double", title, artist, source, bpm)
                title = "tokyoEVOLVED (TYPE3)"
                get_song(get_level(cols[5]), 0, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[6]), 1, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[7]), 2, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[8]), 3, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[9]), 4, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[10]), 1, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[11]), 2, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[12]), 3, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[13]), 4, version, "double", title, artist, source, bpm)
                i += 2
            elif cols[0].text == "roppongi EVOLVED ver.A":
                title = "roppongi EVOLVED ver.A"
                artist = "TAG underground"
                source = "DDR X2 / CS DDR MUSIC FIT"
                bpm = "170"
                get_song(get_level(cols[5]), 0, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[6]), 1, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[7]), 2, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[8]), 3, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[9]), 4, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[10]), 1, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[11]), 2, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[12]), 3, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[13]), 4, version, "double", title, artist, source, bpm)
                title = "roppongi EVOLVED ver.B"
                bpm = "(85-)170"
                get_song(get_level(cols[5]), 0, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[6]), 1, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[7]), 2, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[8]), 3, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[9]), 4, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[10]), 1, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[11]), 2, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[12]), 3, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[13]), 4, version, "double", title, artist, source, bpm)
                title = "roppongi EVOLVED ver.C"
                bpm = "(42.5-)170"
                get_song(get_level(cols[5]), 0, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[6]), 1, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[7]), 2, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[8]), 3, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[9]), 4, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[10]), 1, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[11]), 2, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[12]), 3, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[13]), 4, version, "double", title, artist, source, bpm)
                title = "roppongi EVOLVED ver.D"
                source = "DDR X2"
                bpm = "170(85-680)"
                get_song(get_level(cols[5]), 0, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[6]), 1, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[7]), 2, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[8]), 3, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[9]), 4, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[10]), 1, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[11]), 2, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[12]), 3, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[13]), 4, version, "double", title, artist, source, bpm)
                i += 3
            elif cols[0].text == "London EVOLVED ver.A":
                title = "London EVOLVED ver.A"
                artist = "TAG underground"
                source = "海外版 CS DDR II / DDR X3"
                bpm = "170-340(42.5-340)"
                get_song(get_level(cols[5]), 0, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[6]), 1, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[7]), 2, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[8]), 3, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[9]), 4, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[10]), 1, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[11]), 2, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[12]), 3, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[13]), 4, version, "double", title, artist, source, bpm)
                title = "London EVOLVED ver.B"
                bpm = "170-340(170-420)"
                get_song(get_level(cols[5]), 0, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[6]), 1, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[7]), 2, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[8]), 3, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[9]), 4, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[10]), 1, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[11]), 2, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[12]), 3, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[13]), 4, version, "double", title, artist, source, bpm)
                title = "London EVOLVED ver.C"
                bpm = "170-340"
                get_song(get_level(cols[5]), 0, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[6]), 1, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[7]), 2, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[8]), 3, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[9]), 4, version, "single", title, artist, source, bpm)
                get_song(get_level(cols[10]), 1, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[11]), 2, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[12]), 3, version, "double", title, artist, source, bpm)
                get_song(get_level(cols[13]), 4, version, "double", title, artist, source, bpm)
                i += 2
            else:
                if len(cols) == 1:
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
                if len(cols) == 14:
                    #basic
                    title = cols[0].text
                    artist = cols[1].text
                    source = cols[2].text
                    bpm = cols[3].text
                    get_song(get_level(cols[5]), 0, version, "single", title, artist, source, bpm)
                    get_song(get_level(cols[6]), 1, version, "single", title, artist, source, bpm)
                    get_song(get_level(cols[7]), 2, version, "single", title, artist, source, bpm)
                    get_song(get_level(cols[8]), 3, version, "single", title, artist, source, bpm)
                    get_song(get_level(cols[9]), 4, version, "single", title, artist, source, bpm)
                    get_song(get_level(cols[10]), 1, version, "double", title, artist, source, bpm)
                    get_song(get_level(cols[11]), 2, version, "double", title, artist, source, bpm)
                    get_song(get_level(cols[12]), 3, version, "double", title, artist, source, bpm)
                    get_song(get_level(cols[13]), 4, version, "double", title, artist, source, bpm)

        return

    parse_old(ddr_old_rows, "")
    parse_new(ddr_2013_rows, "DanceDanceRevolution 2013")
    parse_new(ddr_2014_rows, "DanceDanceRevolution 2014")

    print ("Writing json")

    final_data = {
        "id": "ddr2014",
        "songs": songs
    }
    #remember to change the datetime to the one from the page, not on the date it was update on the app's server
    with open('../games/ddr/2014/' +  version_name + '.json', 'w') as file:
        json.dump(final_data, file, indent=2)
    print ("Finished writing json")

    data = {}
    with open('../games/game_data.json') as file:
        data = json.load(file)
        data["games"]["ddr"]["versions"]["2014"]["current"] = version_name
        array = data["games"]["ddr"]["versions"]["2014"]["builds"]
        check = False
        for x in array:
            print(x)
            print(version_name)
            if(version_name == x):
                check = True
        if not check:
            data["games"]["ddr"]["versions"]["2014"]["builds"].append(version_name)
    print ("Finished reading game_data.json file")

    with open('../games/game_data.json', 'w') as file:
        json.dump(data, file, indent=2)
    print ("Finished updating game_data.json file")
else:
    print("Version " + version_name + " already exists. Exiting...")
