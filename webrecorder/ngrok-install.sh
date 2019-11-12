if !(type "ngrok" > /dev/null 2>&1); then
    mkdir ngrok/
    cd ngrok
    brew install wget
    wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-darwin-amd64.zip
    unzip ngrok-stable-darwin-amd64.zip
    mv ngrok /usr/local/bin/
fi
echo input your ngrok authtoken
read token
ngrok authtoken $token
