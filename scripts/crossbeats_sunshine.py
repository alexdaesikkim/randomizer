import json
import os
import re
from urllib.request import urlopen
from bs4 import BeautifulSoup

version_name = "FINAL"
print(version_name)

pickup_url = "http://www.capcom.co.jp/arcade/rev/PC/music_pickup.html"
jpop_url = "http://www.capcom.co.jp/arcade/rev/PC/music_jpop.html"
vocaloid_url = "http://www.capcom.co.jp/arcade/rev/PC/music_vocaloid.html"
toho_url = "http://www.capcom.co.jp/arcade/rev/PC/music_toho.html"
original_url = "http://www.capcom.co.jp/arcade/rev/PC/music_originaln.html"
variety_url = "http://www.capcom.co.jp/arcade/rev/PC/music_variety.html"

pickup_opened = urlopen(pickup_url)
jpop_opened = urlopen(jpop_url)
vocaloid_opened = urlopen(vocaloid_url)
toho_opened = urlopen(toho_url)
original_opened = urlopen(original_url)
variety_opened = urlopen(variety_url)

base_url = "http://www.capcom.co.jp/arcade/rev/PC/"

print ("Opened pages")

print ("Processing links")

def find_links(orig_url):
    pages = []
    opened_page = urlopen(orig_url)
    links = BeautifulSoup(opened_page, "html5lib").find('div', class_='mPager-top').find_all('a')
    if not links:
        pages.append(orig_url)
    else:
        for link in links:
            pages.append(base_url + link['href'])
    return pages

pickup_pages = find_links(pickup_url)
jpop_pages = find_links(jpop_url)
vocaloid_pages = find_links(vocaloid_url)
toho_pages = find_links(toho_url)
original_pages = find_links(original_url)
variety_pages = find_links(variety_url)

songs = [];

def page_to_array(urls, title):
    for url in urls:
        page = urlopen(url)
        opened_page = BeautifulSoup(page, "html5lib").find_all('li', class_='gr-Black2');
        for song in opened_page:
            obj = {
                "title": title,
                "li": song
            }
            songs.append(obj)

page_to_array(pickup_pages, "PICKUP")
page_to_array(jpop_pages, "J-POP")
page_to_array(vocaloid_pages, "VOCALOID")
page_to_array(toho_pages, "東方Project")
page_to_array(original_pages, "ORIGINAL")
page_to_array(variety_pages, "VARIETY")

'''
license_songs = BeautifulSoup(license_opened, "html5lib")
license_song_tables = license_songs.find('div', id='main').find_all('table')
license_titles = license_songs.find('div', id='main').find_all('h3')
orig_songs = BeautifulSoup(orig_opened, "html5lib")
orig_song_tables = orig_songs.find('div', id='main').find_all('table')
orig_titles = orig_songs.find('div', id='main').find_all('h3')


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

parse_raw(song_rows, "")'''
'''
print ("Writing json")

final_data = {
    "id": "ddrextreme",
    "songs": songs
}
with open('../games/ddr/extreme/' +  "wrong_data"+ '.json', 'w') as file:
    json.dump(final_data, file, indent=2, sort_keys=True)
print ("Finished writing json")

data = {}
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
    json.dump(data, file, indent=2, sort_keys=True)
print ("Finished updating game_data.json file")
'''
