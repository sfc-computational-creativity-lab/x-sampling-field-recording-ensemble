import json

from pythonosc import dispatcher, osc_message_builder, osc_server, udp_client

with open("config.json", "r") as f:
    conf = json.load(f)

if conf["use-osc"]:
    address = "127.0.0.1"
    client = udp_client.UDPClient(address, conf["osc-port"])

print(client)


def send_osc(msg, route="/sound"):
    if not conf["use-osc"]:
        return
    msg_obj = osc_message_builder.OscMessageBuilder(address=route)
    msg_obj.add_arg(msg)
    print(f"sent msg: {msg} to address: {route}")
    client.send(msg_obj.build())


send_osc("This is file path")
send_osc("Label Class", "/label")
send_osc(440, "/pitch")
