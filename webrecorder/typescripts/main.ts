"use strict"

let audio_context: AudioContext
//@ts-ignore
let recorder: Recorder

const __log = (e: string) => {
  let log: Element = document.querySelector("#log") || document.createElement("p")
  log.innerHTML = `<span>${e}</span>` + log.innerHTML
  console.log(e)
}

const startUserMedia = (stream: MediaStream) => {
  audio_context = new AudioContext
  __log('Audio context set up.')
  let input: AudioNode = audio_context.createMediaStreamSource(stream)
  __log('Media stream created.')

  // Uncomment if you want the audio to feedback directly
  // input.connect(audio_context.destination)

  //@ts-ignore
  recorder = new Recorder(input)
  __log('Recorder initialized.')
}

const startRecording = () => {
  recorder && recorder.record()
  __log('Recording...')
}
// let startButton: Element = document.querySelector("#startButton") || document.createElement("div")
// startButton.addEventListener('click', startRecording)

const stopRecording = (duration: number) => {
  recorder && recorder.stop()
  __log('Stopped recording.')
  // create WAV download link using audio data blob
  createDownloadLink()
  sendMeta(duration)
}
// let stopButton: Element = document.querySelector("#stopButton") || document.createElement("div")
// stopButton.addEventListener('click', stopRecording)

const createDownloadLink = () => {
  __log("Sending Data...")
  recorder && recorder.exportWAV((blob: Blob) => {
    let url = URL.createObjectURL(blob)
    let dlLink = <HTMLAnchorElement>document.getElementById("dl")
    dlLink.style.opacity = "1"
    dlLink.href = url
    dlLink.download = "sound.wav"
    let fd = new FormData()
    fd.append('data', blob)
    $.ajax(
      {
        type: 'POST',
        url: '/',
        data: fd,
        processData: false,
        contentType: false
      }
    ).done((data) => {
      __log(`File saved: ${data.data}`)
      __log(`Sound classified: ${data.class}`)
      __log(`Assigned to... ${data.label}`)
      __log(`Pitch detected: ${data.pitch}Hz`)
      recorder.clear()
    }
    )
  })
}

const sendMeta = (duration: Number) => {
  $.ajax(
    {
      type: "POST",
      url: "/meta",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(
        {
          "latitude": locationData.latitude,
          "longitude": locationData.longitude,
          "duration": duration
        }
      ),
      success: msg => {
        if (msg) {
          __log(`Meta info sent!\nLocation: ${String(locationData.latitude)} / ${String(locationData.longitude)}\nDuration:${duration}sec`)
        } else {
          __log(`Failed to meta info sending: ${msg}`)
        }
      }
    }
  )
}

var locationData = {
  latitude: 0,
  longitude: 0
}

window.onload = function init() {
  try {
    //@ts-ignore
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    //@ts-ignore
    var mediaDevicesInterface = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia))
    console.dir(mediaDevicesInterface)
    if (!navigator.mediaDevices) {
      __log("getUserMedia() not supported.")
      return
    }
    window.URL = window.URL || window.webkitURL

  } catch (e) {
    alert('No web audio support in this browser!:' + e)
  }

  mediaDevicesInterface.getUserMedia({ audio: true })
    .then(
      startUserMedia
    ).catch(
      function (e: any) {
        __log('No live audio input: ' + e)
      }
    )

  navigator.geolocation.getCurrentPosition(
    position => {
      locationData.latitude = position.coords.latitude
      locationData.longitude = position.coords.longitude
    }
  )
}
