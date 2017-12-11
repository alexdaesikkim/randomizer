from urllib.request import urlopen
from bs4 import BeautifulSoup

sinobuz_new_url = "http://bemaniwiki.com/index.php?beatmania%20IIDX%2024%20SINOBUZ%2F%BF%B7%B6%CA%A5%EA%A5%B9%A5%C8"

page = urlopen(sinobuz_new_url)

soup = BeautifulSoup(page, "lxml")
print(soup)
