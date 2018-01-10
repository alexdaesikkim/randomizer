import subprocess

#IMPORTANT: This is using cmd to scrape the page. Problem here is that it won't be specific here, so there needs to be a better way to do this.
print("IIDX")

print("SINOBUZ")
try:
    subprocess.call(["python3", "sinobuz.py"], cwd="scripts")
except subprocess.CalledProcessError:
    subprocess.call(["python", "sinobuz.py"], cwd="scripts")

print("CANNON BALLERS")
try:
    subprocess.call(["python3", "cannonballers.py"], cwd="scripts")
except subprocess.CalledProcessError:
    subprocess.call(["python", "cannonballers.py"], cwd="scripts")

print("DDR")

print("2014")
try:
    subprocess.call(["python3", "ddr_2014.py"], cwd="scripts")
except subprocess.CalledProcessError:
    subprocess.call(["python", "ddr_2014.py"], cwd="scripts")

print("Ace")
try:
    subprocess.call(["python3", "ddr_ace.py"], cwd="scripts")
except subprocess.CalledProcessError:
    subprocess.call(["python", "ddr_ace.py"], cwd="scripts")
