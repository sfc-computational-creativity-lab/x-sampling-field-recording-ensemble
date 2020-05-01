import json
import os
import threading
import wave
from datetime import datetime

import numpy as np
import pyaudio
from flask import Flask, abort, jsonify, render_template, request
from pythonosc import dispatcher, osc_message_builder, osc_server, udp_client

import service.classifier_config as cconfig
from service import sound_processor

app = Flask(__name__)

with open("config.json", "r") as f:
    conf = json.load(f)

if conf["use-osc"]:
    address = "127.0.0.1"
    client = udp_client.UDPClient(address, conf["osc-port"])

# lord and setup trained keras classification model as module variable
model = sound_processor.KerasTFGraph(os.path.join(os.path.dirname(os.getcwd()),
                                                  "ml-sound-classifier", "model", "mobilenetv2_fsd2018_41cls.pb"),
                                     input_name='import/input_1',
                                     keras_learning_phase_name='import/bn_Conv1/keras_learning_phase',
                                     output_name='import/output0')


@app.route('/', methods=['GET'])
def root():
    html = render_template('index.html')
    return html


@app.route('/', methods=['POST'])
def upload():
    file_name = os.path.join(
        "sounds", datetime.now().strftime('%m%d%H%M%S') + ".wav")
    file_path = os.path.join(os.path.dirname(os.getcwd()), file_name)

    with open(f"{file_path}", "wb") as f:
        f.write(request.files['data'].read())
    print("Posted binary data: {file_path}")

    # classification
    label, label_class, pitch, trimed_file_path = analyze_wav_file(file_path)

    # play
    if conf["talking"]:
        player = threading.Thread(target=play_wav_file, args=(file_path, ))
        player.start()

    # osc
    if conf["use-osc"]:
        send_osc(trimed_file_path)
        send_osc(label_class, "/label")
        send_osc(pitch, "/pitch")

    return jsonify({"data": trimed_file_path, "class": label, "label": label_class, "pitch": pitch})


@app.route('/meta', methods=['POST'])
def location_update():
    data = request.json
    if data is not None:
        print(f"meta info received: {data}")
        # osc
        if conf["use-osc"]:
            send_osc(f"{data['latitude']}/{data['longitude']}",
                     route="/location")
            send_osc(data['duration'], route="/duration")
        return jsonify({"data": f"Meta info Received\nLocation: {data['latitude']} {data['longitude']}\nDuration: {data['duration']}"})


def play_wav_file(file_name):
    """
    Talking mode: play sounds immediately after recording
    """
    try:
        wf = wave.open(file_name, "r")
    except FileNotFoundError:
        print("[Error 404] No such file or directory: " + file_name)
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


def send_osc(msg, route="/sound"):
    """
    Send saved .wav file path as osc message
    """
    if not conf["use-osc"]:
        return
    msg_obj = osc_message_builder.OscMessageBuilder(address=route)
    msg_obj.add_arg(msg)
    print(f"sent msg: {msg} to address: {route}")
    client.send(msg_obj.build())


def analyze_wav_file(file_path):
    """
    Detect pitch and classify sounds: based on labels used in DCASE2018 Challenge: 
    IEEE AASP Challenge on Detection and Classification of Acoustic Scenes and Events
    """
    wave, trimed_file_path = sound_processor.read_audio(
        cconfig.conf, file_path, trim_long_data=False)
    pitch = sound_processor.detect_pitch(cconfig.conf, wave)
    preds = model.predict(
        sound_processor.audio_sample_to_X(cconfig.conf, wave))
    for pred in preds:
        result = np.argmax(pred)
    label = cconfig.conf.labels[result]
    label_class = cconfig.conf.label_classes[label]
    print(f"Result: {label} / Class: '{label_class}' / Proba: {pred[result]}")
    print(f"Pitch: {pitch}")
    return (cconfig.conf.labels[result], label_class, pitch, trimed_file_path)


if __name__ == "__main__":
    app.run()
