import urllib2
from bs4 import BeautifulSoup

sinobuz_new_url = "http://bemaniwiki.com/index.php?beatmania%20IIDX%2024%20SINOBUZ%2F%BF%B7%B6%CA%A5%EA%A5%B9%A5%C8"

page = urllib2.urlopen(sinobuz_new_url)

song_table = BeautifulSoup(page).find('div', class_='ie5')

rows = song_table.find_all('tr')

def get_level(col):
    title = col.text
    if len(col) != 1:
        index = len(title)-1
        end_index = index
        while (title[index] != ']'):
            index = index-1
        title = title[index+1:len(title)]
    return title

for row in rows:
    cols = row.find_all('td')
    if len(cols) == 11:
        print "Song: " + cols[9].text
        print "Artist: " + cols[10].text
        print "BPM: " + cols[7].text


        spb = cols[0].text

        spn = get_level(cols[1])

        sph = get_level(cols[2])

        spa = get_level(cols[3])

        print "SPN: " + spn
        print "SPH: " + sph
        print "SPA: " + spa

        print "\n"
