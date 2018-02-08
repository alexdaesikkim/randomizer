import json
import os
import re
from urllib.request import urlopen
from bs4 import BeautifulSoup

from datetime import datetime, timedelta
from pytz import timezone
#to grab version name, go to main page, get the latest news entry and use that version_name
#checking for update:
#1. check to see if the date has passed yet. if yes, get the new date version. if not, go back one and grab the version name from there
#sidenote: might have to do this multiple times
#2. after grabbing the version name, update

current_time_jst = datetime.now(timezone('Asia/Tokyo'))

base_url = "http://www.capcom.co.jp/arcade/rev/PC/"

update_page = "http://www.capcom.co.jp/arcade/rev/PC/news1.html"
update_page_opened = urlopen(update_page)
update_links = BeautifulSoup(update_page_opened, "html5lib").find('div', class_='layout-1st').find_all('a')
version_index = 0
version_found = False
while not version_found:
    link = update_links[version_index]
    version_index += 1
    if(link['href'].startswith('newsentry')):
        news_url = base_url + link['href']
        news_page_opened = urlopen(news_url)
        news_content = BeautifulSoup(news_page_opened, "html5lib").find('small')
        for content in news_content.find_all("br"):
            content.replace_with("\n")
        news_content = news_content.text.split("\n")
        news_content = [x for x in news_content if x != '']
        date = news_content[0]
        version_name = news_content[1]
        date_length = len(date)
        date_starting_index = date.find('201')
        date_ending_index = date.find(':')+3
        date = date[date_starting_index:-(date_length-date_ending_index)]
        update_time = datetime.strptime(date, '%Y年%m月%d日 %I:%M')
        update_time_jst = timezone('Asia/Tokyo').localize(update_time)
        if current_time_jst >= update_time_jst:
            version_num_start = version_name.find('【')
            version_num_end = version_name.find('】')
            version_length = len(version_name)
            version_name = version_name[version_num_start+1 : -(version_length - version_num_end)]
            version_found = True

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

raw_songs = [];

def page_to_array(urls, title):
    for url in urls:
        page = urlopen(url)
        opened_page = BeautifulSoup(page, "html5lib").find_all('li', class_='gr-Black2');
        for raw_song in opened_page:
            obj = {
                "title": title,
                "li": raw_song
            }
            raw_songs.append(obj)

page_to_array(pickup_pages, "PICKUP")
page_to_array(jpop_pages, "J-POP")
page_to_array(vocaloid_pages, "VOCALOID")
page_to_array(toho_pages, "東方Project")
page_to_array(original_pages, "ORIGINAL")
page_to_array(variety_pages, "VARIETY")

print ("Parsed pages")

songs = []

song_dict = {}

#solution: use dictionary, have title + difficulty (in plain text, i.e. SPA) as the key
#REMINDER: leggendarias are separate difficulty due to reasons
#also, remove (HCN ver.) before creating key

#reminder to self for DDR: BSP, two of them exist. differentiate beginner

print ("Grabbing data...")

diff_options = {
    0: "EASY",
    1: "MEDIUM",
    2: "STANDARD",
    3: "MASTER",
    4: "UNLIMITED"
}

def get_song(level, difficulty, version, style, title, artist, genre, bpm):
    if(level != "--"):
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
                "version": version,
                "genre": genre
            }
            song_dict[key] = True
            songs.append(data)

def parse_raw(rows):
    for row in rows:
        genre = row["title"];
        song_info = row["li"];
        title = song_info.find('p', class_="n-mTitle").text
        artist = song_info.find('p', class_="n-mAuther").text
        bpm = song_info.find('p', class_="n-mDataBpm").find('span').text
        get_song(song_info.find('span', class_="easy").text, 0, "", "single", title, artist, genre, bpm)
        get_song(song_info.find('span', class_="standard").text, 1, "", "single", title, artist, genre, bpm)
        get_song(song_info.find('span', class_="hard").text, 2, "", "single", title, artist, genre, bpm)
        get_song(song_info.find('span', class_="master").text, 3, "", "single", title, artist, genre, bpm)
        get_song(song_info.find('span', class_="unlimited").text, 4, "", "single", title, artist, genre, bpm)
    return

parse_raw(raw_songs)

print ("Writing json")

final_data = {
    "id": "crossbeats_sunrise",
    "songs": songs
}
with open('../games/crossbeats/sunrise/' + version_name + '.json', 'w') as file:
    json.dump(final_data, file, indent=2, sort_keys=True)
print ("Finished writing json")

data = {}

with open('../games/game_data.json') as file:
    data = json.load(file)
    data["games"]["crossbeats"]["versions"]["sunrise"]["current"] = version_name
    array = data["games"]["crossbeats"]["versions"]["sunrise"]["builds"]
    check = False
    for x in array:
        if(version_name == x):
            check = True
    if not check:
        data["games"]["crossbeats"]["versions"]["sunrise"]["builds"].append(version_name)
print ("Finished reading game_data.json file")

with open('../games/game_data.json', 'w') as file:
    json.dump(data, file, indent=2, sort_keys=True)
print ("Finished updating game_data.json file")
