# x-sampling-field-recording-ensemble

---

![badge](https://img.shields.io/badge/lab-cclab-red.svg)
![badge](https://img.shields.io/badge/year-2019s-green.svg)

Field recording ensemble in real time operation.

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

when do not use tmux sessions, build a server, make a tunnel and generate qr code manually.

```shell
cd x-sampling-field-recording-ensemble/webrecorder
gunicorn service.app:app -b :YOUR_PORT_NUMBER
```

```shell
ngrok http http://127.0.0.1:YOUR_PORT_NUMBER
```

```shell
python -c "import qr; qr.generate(NGROK_DISTRIBUTED_URL)"
```

share and access generated QR code !

when stopping daemon gunicorn process, for example exec below (8888 is hearing port num)

```shell
kill `ps ax | grep gunicorn | grep 8888 | awk '{split($0,a," "); print a[1]}' | head -n 1`
```

### sounds

`.wav` files will be saved in `/sounds/`

```shell
── sounds
   ├── 1115003250.wav
   ├── 1115003252.wav
   ├── 1115003300.wav
   ├── 1115003301.wav
   ├── 1115003306.wav
   ├── 1115003307.wav
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

use machine learning classification model of DCASE2018 Challenge: IEEE AASP Challenge on Detection and Classification of Acoustic Scenes and Events

use public trained model and implemented based on <https://github.com/daisukelab/ml-sound-classifier> (imported as submodule in this repo)
