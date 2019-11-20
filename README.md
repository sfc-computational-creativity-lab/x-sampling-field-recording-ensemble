# x-sampling-field-recording-ensemble

![badge](https://img.shields.io/badge/lab-cclab-red.svg)
![badge](https://img.shields.io/badge/year-2019s-green.svg)

Field recording ensemble in real time operation.

![system scrennshot](https://i.gyazo.com/461f87e2b700294b805cfc2c253317c2.gif)

## web recorder

### packages/dependencies

- python3 and packages listed in `requirements.txt`
- nodejs and packages listed in `package.json`
- tmux
- ngrok
- [recorder-js](https://www.npmjs.com/package/recorder-js)

### setup

```shell
git clone --recursive https://github.com/sfc-computational-creativity-lab/x-sampling-field-recording-ensemble.git
cd x-sampling-field-recording-ensemble/webrecorder
npm install
sh ngrok-install.sh
```

then put your ngrok auth-token

### run

if using `pip` and `HomeBrew`, run this prepared script. if NOT, rewrite the script suitably (e.g. `pip` -> `conda`, `brew` -> `apt-get`).

```shell
cd x-sampling-field-recording-ensemble/webrecorder
bash run.sh
```

#### manual running

1. create a WSGI app

```shell
cd x-sampling-field-recording-ensemble/webrecorder
gunicorn service.app:app -b :YOUR_PORT_NUMBER
```

1. when do not use gunicorn, build local server by `run.py` (dev mode)

```shell
cd x-sampling-field-recording-ensemble/webrecorder
python run.py
```

2. then make www tunnel and generate qr code manually.

```shell
ngrok http http://127.0.0.1:YOUR_PORT_NUMBER
```

```shell
python -c "import qr; qr.generate('NGROK_DISTRIBUTED_URL')"
```

3. share and access generated QR code !

#### stop server

when stopping daemon gunicorn process, for example exec below (8888 is hearing port num)

```shell
kill `ps ax | grep gunicorn | grep 8888 | awk '{split($0,a," "); print a[1]}' | head -n 1`
```

or `kill -9 GUNICORN_PID`

### generated sounds

`.wav` files will be saved in `/sounds/`

```shell
── sounds
   ├── 1115003250.wav
   ├── 1115003250_trimmed.wav
   ├── 1115003252.wav
   ├── 1115003252_trimmed.wav
   ├── 1115003300.wav
   ├── 1115003300_trimmed.wav
   ├── 1115003301.wav
   ├── 1115003301_trimmed.wav
   ├── 1115003306.wav
   ├── 1115003306_trimmed.wav
   ├── 1115003307.wav
   ├── 1115003307_trimmed.wav
```

sound file path will be sent as osc message (to address `/`)

### settings

edit settings (`config.json`) suitably.

```javascript
{
    "ip" : "127.0.0.1",
    "port" : 8888, // listening port number
    "debug" : true,
    "talking": false, // toggle talking mode
    "workers": 2, // gunicorn worker for server
    "use-osc": true, // send osc message when receive the sound
    "osc-port": 5050 // osc poert number
}
```

### develop

front-end dev

```shell
npm run watch
```

check Python flask process

```shell
tmux a -t
```

### UI design

<https://www.figma.com/file/nRi4YNe3WGXpCxocEcpN35/x-sampling-recorder?node-id=0%3A1>

## Sound Classification

use machine learning classification model of *DCASE2018 Challenge: IEEE AASP Challenge on Detection and Classification of Acoustic Scenes and Events*

sound classes are

```shell
'Hi-hat','Saxophone','Trumpet','Glockenspiel','Cello','Knock','Gunshot_or_gunfire','Clarinet','Computer_keyboard','Keys_jangling','Snare_drum','Writing','Laughter','Tearing','Fart','Oboe','Flute','Cough','Telephone','Bark','Chime','Bass_drum','Bus','Squeak','Scissors','Harmonica','Gong','Microwave_oven','Burping_or_eructation','Double_bass','Shatter','Fireworks','Tambourine','Cowbell','Electric_piano','Meow','Drawer_open_or_close','Applause','Acoustic_guitar','Violin_or_fiddle','Finger_snapping'
```

using public trained model and implemented based on <https://github.com/daisukelab/ml-sound-classifier> (imported as submodule in this repo)
