import subprocess

#IMPORTANT: This is using cmd to scrape the page. Problem here is that it won't be specific here, so there needs to be a better way to do this.
subprocess.call(["python", "sinobuz.py"], cwd="scripts")
subprocess.call(["python", "cannonballers.py"], cwd="scripts")
