"use strict";
class Button {
    constructor(w, h, size) {
        this.w = w;
        this.h = h;
        this.centerX = w / 2;
        this.centerY = h / 2;
        this.radius = size;
        this.isRecording = false;
        this.rectCircleRatio = size / 2;
        this.maxDuration = 10;
        this.progress = 0;
    }
    isTouched(x, y) {
        if ((Math.pow((x - this.centerX), 2) + Math.pow((y - this.centerY), 2)) < Math.pow(this.radius, 2)) {
            return true;
        }
        return false;
    }
    switchRecording() {
        this.isRecording = !this.isRecording;
        console.log(`switched to recording: ${this.isRecording}`);
        if (this.isRecording) {
            startRecording();
        }
        else {
            stopRecording(this.progress / 60);
            this.progress = 0;
        }
    }
    draw() {
        if (this.progress == 60 * this.maxDuration) {
            this.progress = 0;
            this.switchRecording();
        }
        if (this.isRecording) {
            if (this.rectCircleRatio > 5) {
                clear();
                this.rectCircleRatio -= 5;
            }
            this.progress++;
        }
        else {
            if (this.rectCircleRatio <= this.radius / 2) {
                clear();
                this.rectCircleRatio += 5;
            }
        }
        drawCircleUI(this.progress * 2 * PI / (60 * this.maxDuration));
        noStroke();
        fill(mainColor);
        rect(this.centerX - this.radius / 2, this.centerY - this.radius / 2, this.radius, this.radius, this.rectCircleRatio);
        fill(white);
        textAlign(CENTER, CENTER);
        textSize(18);
        textStyle(BOLD);
        if (this.isRecording) {
            text('STOP', this.centerX, this.centerY);
        }
        else {
            text('REC', this.centerX, this.centerY);
        }
    }
}
let audio_context;
let recorder;
const __log = (e) => {
    let log = document.querySelector("#log") || document.createElement("p");
    log.innerHTML = `<span>${e}</span>` + log.innerHTML;
    console.log(e);
};
const startUserMedia = (stream) => {
    audio_context = new AudioContext;
    __log('Audio context set up.');
    let input = audio_context.createMediaStreamSource(stream);
    __log('Media stream created.');
    recorder = new Recorder(input);
    __log('Recorder initialized.');
};
const startRecording = () => {
    recorder && recorder.record();
    __log('Recording...');
};
const stopRecording = (duration) => {
    recorder && recorder.stop();
    __log('Stopped recording.');
    createDownloadLink();
    sendMeta(duration);
};
const createDownloadLink = () => {
    __log("Sending Data...");
    recorder && recorder.exportWAV((blob) => {
        let url = URL.createObjectURL(blob);
        let dlLink = document.getElementById("dl");
        dlLink.style.opacity = "1";
        dlLink.href = url;
        dlLink.download = "sound.wav";
        let fd = new FormData();
        fd.append('data', blob);
        $.ajax({
            type: 'POST',
            url: '/',
            data: fd,
            processData: false,
            contentType: false
        }).done((data) => {
            __log(`File saved: ${data.data}`);
            __log(`Sound classified: ${data.class}`);
            __log(`Assigned to... ${data.label}`);
            __log(`Pitch detected: ${data.pitch}Hz`);
            recorder.clear();
        });
    });
};
const sendMeta = (duration) => {
    $.ajax({
        type: "POST",
        url: "/meta",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
            "latitude": locationData.latitude,
            "longitude": locationData.longitude,
            "duration": duration
        }),
        success: msg => {
            if (msg) {
                __log(`Meta info sent!\nLocation: ${String(locationData.latitude)} / ${String(locationData.longitude)}\nDuration:${duration}sec`);
            }
            else {
                __log(`Failed to meta info sending: ${msg}`);
            }
        }
    });
};
var locationData = {
    latitude: 0,
    longitude: 0
};
window.onload = function init() {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var mediaDevicesInterface = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia));
        console.dir(mediaDevicesInterface);
        if (!navigator.mediaDevices) {
            __log("getUserMedia() not supported.");
            return;
        }
        window.URL = window.URL || window.webkitURL;
    }
    catch (e) {
        alert('No web audio support in this browser!:' + e);
    }
    mediaDevicesInterface.getUserMedia({ audio: true })
        .then(startUserMedia).catch(function (e) {
        __log('No live audio input: ' + e);
    });
    navigator.geolocation.getCurrentPosition(position => {
        locationData.latitude = position.coords.latitude;
        locationData.longitude = position.coords.longitude;
    });
};
class Morph {
    setup() {
        this.shapes = [];
        this.currentShape = 0;
        this.shapes.push({ points: Shapes.circle(100), color: color('#009CDF') });
        this.shapes.push({ points: Shapes.circle(150), color: color(255, 204, 0) });
        this.shapes.push({ points: Shapes.square(50), color: color(175, 100, 220) });
        this.morph = new Array();
        let highestCount = 0;
        for (var i = 0; i < this.shapes.length; i++) {
            highestCount = Math.max(highestCount, this.shapes[i].points.length);
        }
        for (var i = 0; i < highestCount; i++) {
            this.morph.push(new p5.Vector());
        }
    }
    recalc() {
        var totalDistance = 0;
        const points = this.shapes[this.currentShape].points;
        for (var i = 0; i < points.length; i++) {
            var v1 = points[i];
            var v2 = this.morph[i];
            v2.lerp(v1, 0.1);
            totalDistance += p5.Vector.dist(v1, v2);
        }
        if (totalDistance < 0.1) {
            this.currentShape++;
            if (this.currentShape >= this.shapes.length) {
                this.currentShape = 0;
            }
        }
    }
    draw() {
        this.recalc();
        const color = this.shapes[this.currentShape].color;
        const points = this.shapes[this.currentShape].points;
        translate(width / 2, height / 2);
        strokeWeight(4);
        beginShape();
        noFill();
        stroke(color);
        for (var i = 0; i < points.length; i++) {
            var v = this.morph[i];
            vertex(v.x, v.y);
        }
        endShape(CLOSE);
    }
}
class Shapes {
    static circle(size) {
        const points = new Array();
        for (var angle = 0; angle < 360; angle += 9) {
            var v = p5.Vector.fromAngle(radians(angle - 135));
            v.mult(size);
            points.push(v);
        }
        return points;
    }
    static square(size) {
        const points = new Array();
        for (var x = -size; x < size; x += 10) {
            points.push(createVector(x, -size));
        }
        for (var y = -size; y < size; y += 10) {
            points.push(createVector(size, y));
        }
        for (var x = size; x > -size; x -= 10) {
            points.push(createVector(x, size));
        }
        for (var y = size; y > -size; y -= 10) {
            points.push(createVector(-size, y));
        }
        return points;
    }
    static star(x, y, radius1, radius2, npoints) {
        var angle = TWO_PI / npoints;
        var halfAngle = angle / 2.0;
        const points = new Array();
        for (var a = 0; a < TWO_PI; a += angle) {
            var sx = x + cos(a) * radius2;
            var sy = y + sin(a) * radius2;
            points.push(createVector(sx, sy));
            sx = x + cos(a + halfAngle) * radius1;
            sy = y + sin(a + halfAngle) * radius1;
            points.push(createVector(sx, sy));
        }
        return points;
    }
}
const mainColor = "#FF5555";
const white = "#F5FFF2";
const bodyPadding = 15;
const circleWidth = 180;
const circleWeight = 20;
const buttonWidth = 80;
let button;
let circleLeftY;
let circleLeftX;
let circleRightX;
let circleRightY;
function setup() {
    const canvas = createCanvas(window.screen.availWidth - (bodyPadding * 2), window.screen.availWidth - (bodyPadding * 2));
    canvas.parent('canvas');
    console.log("canvas set");
    circleLeftX = width / 2 - (circleWidth / 2);
    circleRightX = width / 2 + (circleWidth / 2);
    circleLeftY = height / 2 - (circleWidth / 2);
    circleRightY = height / 2 + (circleWidth / 2);
    drawCircleUI(0);
    button = new Button(width, height, buttonWidth);
}
function windowResized() {
    resizeCanvas(window.screen.availWidth - (bodyPadding * 2), window.screen.availHeight / 2);
}
function drawCircleUI(progress) {
    strokeWeight(circleWeight);
    stroke(white);
    noFill();
    ellipse(width / 2, height / 2, circleWidth, circleWidth);
    stroke(mainColor);
    strokeWeight(circleWeight / 2);
    strokeCap(SQUARE);
    arc(width / 2, height / 2, circleWidth - (circleWeight / 2), circleWidth - (circleWeight / 2), -PI / 2, (progress) - PI / 2 + .0001);
}
function draw() {
    button.draw();
}
let buttonUnLock = true;
function mousePressed() {
    if (button.isTouched(mouseX, mouseY) && (buttonUnLock)) {
        button.switchRecording();
        buttonUnLock = false;
        setTimeout(() => {
            buttonUnLock = true;
            console.log("Button Unlocked");
        }, 100);
    }
}
//# sourceMappingURL=main.js.map