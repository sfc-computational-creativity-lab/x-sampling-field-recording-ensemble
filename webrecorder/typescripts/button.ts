class Button {

  private w: number
  private h: number
  private centerX: number
  private centerY: number
  private radius: number
  private isRecording: boolean
  private rectCircleRatio: number
  private maxDuration: number
  private progress: number // 0 ~ FrameRate x MaxDuration value

  constructor(w: number, h: number, size: number) {
    this.w = w
    this.h = h
    this.centerX = w / 2
    this.centerY = h / 2
    this.radius = size
    this.isRecording = false
    this.rectCircleRatio = size / 2
    this.maxDuration = 10 // 10s
    this.progress = 0
  }

  isTouched(x: number, y: number) {
    if (((x - this.centerX) ** 2 + (y - this.centerY) ** 2) < this.radius ** 2) {
      return true
    }
    return false
  }

  switchRecording() {
    this.isRecording = !this.isRecording
    console.log(`switched to recording: ${this.isRecording}`)
    if (this.isRecording) {
      startRecording()
    } else {
      stopRecording(this.progress / 60)
      this.progress = 0
    }
  }

  draw() {
    if (this.progress == 60 * this.maxDuration) {
      this.progress = 0
      this.switchRecording()
    }
    if (this.isRecording) {
      if (this.rectCircleRatio > 5) {
        clear();
        this.rectCircleRatio -= 5;
      }
      this.progress++
    } else {
      if (this.rectCircleRatio <= this.radius / 2) {
        clear();
        this.rectCircleRatio += 5;
      }
    }
    drawCircleUI(this.progress * 2 * PI / (60 * this.maxDuration))
    noStroke();
    fill(mainColor);
    rect(
      this.centerX - this.radius / 2,
      this.centerY - this.radius / 2,
      this.radius, this.radius,
      this.rectCircleRatio
    );
    // text
    fill(white)
    textAlign(CENTER, CENTER);
    textSize(18);
    textStyle(BOLD);
    if (this.isRecording) {
      text('STOP',
        this.centerX,
        this.centerY);
    } else {
      text('REC',
        this.centerX,
        this.centerY);
    }
  }
}
