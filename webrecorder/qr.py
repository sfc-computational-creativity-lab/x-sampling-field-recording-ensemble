import qrcode


def generate(url):
    img = qrcode.make(url)
    print("Generating QR Code...")
    img.show()