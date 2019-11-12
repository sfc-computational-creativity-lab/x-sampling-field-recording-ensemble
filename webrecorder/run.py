import json
import socket

from service import app


with open('config.json', 'r') as f:
    conf = json.load(f)

IP = conf["ip"]
Port = conf['port']
debug = conf['debug']

if __name__ == "__main__":
    app.app.run(host=IP, port=Port, debug=debug)
