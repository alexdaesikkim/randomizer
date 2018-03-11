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

print("IIDX Current:")
print("CANNON BALLERS")
subprocess.call([name, "iidx_cannonballers.py"], cwd="scripts")

print("DDR Current:")
print("Ace")
subprocess.call([name, "ddr_ace.py"], cwd="scripts")

print("POP'N MUSIC Current:")
print("Usaneko")
subprocess.call([name, "popn_usaneko.py"], cwd="scripts")

print("JUBEAT Current:")
print("clan")
subprocess.call([name, "jubeat_clan.py"], cwd="scripts")

print("REFLEC BEAT Current:")
print("Reflesia")
subprocess.call([name, "reflec_reflesia.py"], cwd="scripts")

print("SDVX Current:")
print("Heavenly Haven")
subprocess.call([name, "sdvx_hh.py"], cwd="scripts")

print("MUSECA Current:")
print("1+1/2")
subprocess.call([name, "museca_half.py"], cwd="scripts")

print("GROOVE COASTER Current:")
print("3EX")
subprocess.call([name, "gc_3ex.py"], cwd="scripts")

print("crossbeats REV. Current:")
print("SUNRISE")
subprocess.call([name, "crossbeats_sunrise.py"], cwd="scripts")
