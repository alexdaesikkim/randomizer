import subprocess

#IMPORTANT: This is using cmd to scrape the page. Problem here is that it won't be specific here, so there needs to be a better way to do this.
try:
    subprocess.call(["python3", "sinobuz.py"], cwd="scripts")
except subprocess.CalledProcessError:
    subprocess.call(["python", "sinobuz.py"], cwd="scripts")

try:
    subprocess.call(["python3", "cannonballers.py"], cwd="scripts")
except subprocess.CalledProcessError:
    subprocess.call(["python", "cannonballers.py"], cwd="scripts")
