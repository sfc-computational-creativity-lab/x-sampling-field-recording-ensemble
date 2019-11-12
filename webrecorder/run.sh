#!/bin/bash

if !(type "pip3" > /dev/null 2>&1); then
  echo "install pip..."
  brew install python
fi

pip3 install -r requirements.txt

tmux kill-server

echo "copying recorder.js plugin"
cp Recorderjs/dist/recorder.js service/static/js/

echo "transpile typescript files"
tsc

if !(type "jq" > /dev/null 2>&1); then
  echo "install jq..."
  brew install jq
fi

ip=`jq '.ip' config.json`
echo "IP address : $ip"
port=`jq '.port' config.json`
echo "port number: $port"

# kill zombie gunicorn server
pid=`ps ax | grep gunicorn | grep $port | awk '{split($0,a," "); print a[1]}' | head -n 1`
if [ -z "$pid" ]; then
  echo "No gunicorn deamon on port $port"
else
  kill $pid
  echo "killed gunicorn deamon on port $port"
fi


echo "Create tmux session for python api"
`tmux new-session -d -s server gunicorn service.app:app -b :$port`

if !(type "ngrok" > /dev/null 2>&1); then
  echo "install ngrok: exec ngrok-install.sh"
else
  echo "Create tmux session for ngrok"  
  tmux new-session -d -s ngrok "ngrok http $port"
  # tmux new-session -d -s serveo "ssh -R 80:${ip}:${port} serveo.net"
fi

echo "Waiting ngrok API tunnel..."

sleep 5

url=`eval "curl localhost:4040/api/tunnels  | jq '.tunnels[0].public_url'"`

echo "URL is ${url}"
python3 -c "import qr; qr.generate(${url})"

tmux a -t ngrok
