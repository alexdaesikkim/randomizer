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

cb_version_url = "http://bemaniwiki.com/index.php?beatmania%20IIDX%2025%20CANNON%20BALLERS"
main_page = urlopen(cb_version_url)
version_name = BeautifulSoup(main_page, "html.parser").findAll('strong', text=re.compile("^LDJ:J:B:A:"))[0].text[-10:]
print(version_name)

if not os.path.isfile('../games/iidx/25/' + version_name + '.json'):
    cb_new_url = "http://bemaniwiki.com/index.php?beatmaniaIIDX%2025%20CANNON%20BALLERS%2F%BF%B7%B6%CA%A5%EA%A5%B9%A5%C8"
    cb_old_url = "http://bemaniwiki.com/index.php?beatmania%20IIDX%2025%20CANNON%20BALLERS%2F%B5%EC%B6%CA%A5%EA%A5%B9%A5%C8"

    page_new = urlopen(cb_new_url)
    page_old = urlopen(cb_old_url)

    print ("Opened pages")

    song_new_table = BeautifulSoup(page_new, "html.parser").find('div', class_='ie5')
    song_old_table = BeautifulSoup(page_old, "html.parser").find_all('div', class_='ie5')[1]

    cb_new_rows = song_new_table.find_all('tr')
    cb_old_rows = song_old_table.find_all('tr')

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
        0: "basic",
        1: "novice",
        2: "hyper",
        3: "another",
        4: "leggendaria"
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
                song_dict[key] = data

    leggendaria = "LEGGENDARIA"
    leggendaria_mark = "†"
    hcn = "(HCN Ver.)"

    def parse_raw(rows):
        version = ""
        for row in rows:
            cols = row.find_all('td')
            if len(cols) == 1:
                if(re.match("beatmania", cols[0].text)):
                    version = cols[0].text
                    if(version.endswith(" ▲ ▼ △")):
                        version = version[:-6]
                    if(version.endswith(" ▲ △") or version.endswith(" ▼ △")):
                        version = version[:-4]
                    print(version)
            if len(cols) == 11:
                #basic
                #if it ends in leggendaria, there's only another difficulty
                #if it ends with hcn just nope
                title = cols[9].text
                artist = cols[10].text
                genre = cols[8].text
                bpm = cols[7].text
                if title.endswith(leggendaria_mark) or title.endswith(leggendaria):
                    get_song(get_level(cols[3]), 4, version, "single", title, artist, genre, bpm)
                    get_song(get_level(cols[6]), 4, version, "double", title, artist, genre, bpm)
                elif not title.endswith(hcn):
                    #note to self: This really shows... my dedication for details. aka kinda unnecessary but why not for the sake of correctness here?
                    if title.startswith('crew['):
                        get_song(get_level(cols[1]), 1, version, "single", "crew -original mix-", "beatnation Records feat.星野奏子", "ANTHEM", bpm)
                        get_song(get_level(cols[2]), 2, version, "single", "crew -VENUS mix-", "beatnation Records feat.VENUS", "WITHOUT YOU TONIGHT", bpm)
                        get_song(get_level(cols[3]), 3, version, "single", "crew -Ryu☆ mix-", "beatnation Records feat.NU-KO", "EURODANCE", bpm)
                        get_song(get_level(cols[4]), 1, version, "double", "crew -original mix-", "beatnation Records feat.星野奏子", "ANTHEM", bpm)
                        get_song(get_level(cols[5]), 2, version, "double", "crew -kors k mix-", "beatnation Records feat.星野奏子", "J-CORE", bpm)
                        get_song(get_level(cols[6]), 3, version, "double", "crew -Prim version-", "beatnation Records feat.Prim", "Hi ANTHEM", bpm)
                    elif title.startswith('Evans['):
                        get_song(get_level(cols[0]), 0, version, "single", "Evans -prototype-", artist, genre, bpm)
                        get_song(get_level(cols[1]), 1, version, "single", "Evans -prototype-", artist, genre, bpm)
                        get_song(get_level(cols[2]), 2, version, "single", "Evans -prototype-", artist, genre, bpm)
                        get_song(get_level(cols[3]), 3, version, "single", "Evans", artist, genre, bpm)
                        get_song(get_level(cols[4]), 1, version, "double", "Evans -prototype-", artist, genre, bpm)
                        get_song(get_level(cols[5]), 2, version, "double", "Evans -prototype-", artist, genre, bpm)
                        get_song(get_level(cols[6]), 3, version, "double", "Evans", artist, genre, bpm)
                    elif artist.startswith('DJ SWAN['):
                        get_song(get_level(cols[0]), 0, version, "single", title, "DJ SWAN", genre, bpm)
                        get_song(get_level(cols[1]), 1, version, "single", title, "DJ SWAN", genre, bpm)
                        get_song(get_level(cols[2]), 2, version, "single", title, "DJ SWAN", genre, bpm)
                        get_song(get_level(cols[3]), 3, version, "single", title, "DJ SWAN (Toshiaki Komiya & Keiichi Ueno)", genre, bpm)
                        get_song(get_level(cols[4]), 1, version, "double", title, "DJ SWAN", genre, bpm)
                        get_song(get_level(cols[5]), 2, version, "double", title, "DJ SWAN", genre, bpm)
                        get_song(get_level(cols[6]), 3, version, "double", title, "DJ SWAN (Toshiaki Komiya & Keiichi Ueno)", genre, bpm)
                    else:
                        get_song(get_level(cols[0]), 0, version, "single", title, artist, genre, bpm)
                        get_song(get_level(cols[1]), 1, version, "single", title, artist, genre, bpm)
                        get_song(get_level(cols[2]), 2, version, "single", title, artist, genre, bpm)
                        get_song(get_level(cols[3]), 3, version, "single", title, artist, genre, bpm)
                        get_song(get_level(cols[4]), 1, version, "double", title, artist, genre, bpm)
                        get_song(get_level(cols[5]), 2, version, "double", title, artist, genre, bpm)
                        get_song(get_level(cols[6]), 3, version, "double", title, artist, genre, bpm)
        return

    parse_raw(cb_new_rows)
    parse_raw(cb_old_rows)

    for x in song_dict:
        songs.append(song_dict[x])

    print ("Writing json")

    final_data = {
        "id": "beatmaniaiidx25",
        "songs": songs
    }
    #remember to change the datetime to the one from the page, not on the date it was update on the app's server
    with open('../games/iidx/25/' +  version_name + '.json', 'w') as file:
        json.dump(final_data, file)
    print ("Finished")
else:
    print("Version " + version_name + " already exists. Exiting...")
