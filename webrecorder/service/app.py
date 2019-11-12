import json
import os
import threading
import wave
from datetime import datetime

import pyaudio
from flask import Flask, abort, jsonify, render_template, request

from pythonosc import dispatcher, osc_message_builder, osc_server, udp_client


app = Flask(__name__)

with open("config.json", "r") as f:
    conf = json.load(f)

if conf["use-osc"]:
    address = "127.0.0.1"
    client = udp_client.UDPClient(address, conf["osc-port"])


@app.route('/', methods=['GET'])
def root():
    html = render_template('index.html')
    return html


@app.route('/', methods=['POST'])
def upload():
    fname = os.path.join("sounds", datetime.now().strftime('%m%d%H%M%S') + ".wav")
    with open(f"{fname}", "wb") as f:
        f.write(request.files['data'].read())
    print("posted binary data")
    # play
    if conf["talking"]:
        player = threading.Thread(target=play_wav_file, args=(fname, ))
        player.start()
    # osc
    if conf["use-osc"]:
        send_osc(os.path.join(os.path.dirname(os.getcwd()), fname))
    return jsonify({"data": fname})


def play_wav_file(fname):
    """
    Talking mode: play sounds immediately after recording
    """
    try:
        wf = wave.open(fname, "r")
    except FileNotFoundError:
        print("[Error 404] No such file or directory: " + fname)
        return 0

    p = pyaudio.PyAudio()
    print("talking: open audio stream")
    print(f"taking: framerate={wf.getframerate()}")
    stream = p.open(format=p.get_format_from_width(wf.getsampwidth()),
                    channels=wf.getnchannels(),
                    rate=wf.getframerate(),
                    output=True)

    print("talking: loading data")
    data = wf.readframes(1024)
    print(wf)
    while data != '':
        stream.write(data)
        data = wf.readframes(1024)
    stream.close()
    p.terminate()


def send_osc(msg):
    """
    send saved .wav file path as osc message
    """
    if not conf["use-osc"]:
        return
    msg_obj = osc_message_builder.OscMessageBuilder(address=address)
    msg_obj.add_arg(msg)
    client.send(msg_obj.build())


if __name__ == "__main__":
    app.run()
