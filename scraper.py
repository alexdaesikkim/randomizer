import subprocess
import os

print("Starting scraper")

name = "python3"
#for the convenience of working on both windows and linux
#might not work for every setup since its only trying to differentiate between 'python3' and 'python'
if os.name == 'nt':
    name = "python"
    print("Windows")

#IMPORTANT: This is using cmd to scrape the page. Problem here is that it won't be specific here, so there needs to be a better way to do this.
print("Starting")

print("IIDX")

print("SINOBUZ")
subprocess.call([name, "iidx_sinobuz.py"], cwd="scripts")

print("CANNON BALLERS")
subprocess.call([name, "iidx_cannonballers.py"], cwd="scripts")

print("DDR")

print("2014")
subprocess.call([name, "ddr_2014.py"], cwd="scripts")

print("Ace")
subprocess.call([name, "ddr_ace.py"], cwd="scripts")

print("POP'N MUSIC")
print("Usaneko")
subprocess.call([name, "popn_usaneko.py"], cwd="scripts")

print("JUBEAT")
print("clan")
subprocess.call([name, "jubeat_clan.py"], cwd="scripts")

print("REFLEC BEAT")
print("Reflesia")
subprocess.call([name, "reflec_reflesia.py"], cwd="scripts")

print("SDVX")
subprocess.call([name, "sdvx_hh.py"], cwd="scripts")

print("MUSECA")
subprocess.call([name, "museca_half.py"], cwd="scripts")
