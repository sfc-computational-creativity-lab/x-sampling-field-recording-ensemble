const mainColor : string = "#FF5555"
const white : string = "#F5FFF2"
const bodyPadding : number = 15
const circleWidth : number = 180
const circleWeight : number = 20
const buttonWidth : number = 80
let button : Button
let circleLeftY : number
let circleLeftX : number
let circleRightX : number
let circleRightY : number

function setup() {
  const canvas = createCanvas(
    window.screen.availWidth - (bodyPadding * 2),
    window.screen.availWidth - (bodyPadding * 2)
  )
  canvas.parent('canvas')
  console.log("canvas set")
  circleLeftX = width / 2 - (circleWidth / 2)
  circleRightX = width / 2 + (circleWidth / 2)
  circleLeftY = height / 2 - (circleWidth / 2)
  circleRightY = height / 2 + (circleWidth / 2)
  drawCircleUI(0)
  button = new Button(width, height, buttonWidth)
}

function windowResized() {
  resizeCanvas(window.screen.availWidth - (bodyPadding * 2), window.screen.availHeight/2);
}

function drawCircleUI(progress : number) {
  strokeWeight(circleWeight)
  stroke(white)
  noFill()
  ellipse(width / 2, height / 2, circleWidth, circleWidth)
  stroke(mainColor)
  strokeWeight(circleWeight / 2)
  strokeCap(SQUARE);
  // progress 0 ~ 2PI
  arc(
    width / 2, height / 2,
    circleWidth - (circleWeight / 2), circleWidth - (circleWeight / 2),
    -PI/2, (progress)-PI/2+.0001);
}

function draw() {
  button.draw()
}

function mouseClicked() {
  if (button.isTouched(mouseX, mouseY)) {
    button.switchRecording()
  }
}

function mousePressed() {
  if (button.isTouched(mouseX, mouseY)) {
    button.switchRecording()
  } 
}
