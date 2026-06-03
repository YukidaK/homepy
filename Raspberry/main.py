import network
import socket
import machine
import time

SSID     = "A35Y"
PASSWORD = "1nf0rm4l"

# IP fixo do Pico W na rede. Garante que o app/servidor sempre achem o mesmo
# endereco (sem depender do DHCP, que pode mudar a cada reboot).
# AJUSTE para a sua rede:
#   STATIC_IP -> um IP livre dentro da faixa do roteador
#   GATEWAY   -> o IP do roteador (ex.: 192.168.15.1)
#   SUBNET    -> mascara da rede (normalmente 255.255.255.0)
#   DNS       -> pode usar o proprio gateway ou um DNS publico (ex.: 8.8.8.8)
STATIC_IP = "192.168.15.50"
SUBNET    = "255.255.255.0"
GATEWAY   = "192.168.15.1"
DNS       = "8.8.8.8"

# LED no GP0
led = machine.Pin(0, machine.Pin.OUT)
led.off()
led_state = False

# Servo no GP15
servo = machine.PWM(machine.Pin(15))
servo.freq(50)
porta_aberta = False

def set_angle(angle):
    duty = int(2000 + (7500 - 2000) * angle / 180)
    servo.duty_u16(duty)

def abrir_porta():
    global porta_aberta
    set_angle(180
              )
    porta_aberta = True
    print("Porta aberta")

def fechar_porta():
    global porta_aberta
    set_angle(0)
    porta_aberta = False
    print("Porta fechada")

time.sleep(1)
fechar_porta()

# Conecta ao WiFi
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
# Define o IP fixo ANTES de conectar (precisa estar com a interface ativa).
wlan.ifconfig((STATIC_IP, SUBNET, GATEWAY, DNS))
wlan.connect(SSID, PASSWORD)

print("Conectando ao WiFi...")
for _ in range(20):
    if wlan.isconnected():
        break
    time.sleep(0.5)

if not wlan.isconnected():
    print("Falha ao conectar ao WiFi")
else:
    ip = wlan.ifconfig()[0]
    print("Conectado! IP:", ip)

    addr = socket.getaddrinfo("0.0.0.0", 80)[0][-1]
    s = socket.socket()
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(addr)
    s.listen(5)
    print("Servidor HTTP em http://" + ip)

    while True:
        cl, _ = s.accept()
        request = cl.recv(1024).decode()
        first_line = request.split("\r\n")[0]

        if "GET /led/on" in first_line:
            led.on()
            led_state = True
        elif "GET /led/off" in first_line:
            led.off()
            led_state = False
        elif "GET /door/open" in first_line:
            abrir_porta()
        elif "GET /door/close" in first_line:
            fechar_porta()

        body = (
            '{"led":"' + ("on" if led_state else "off") + '",'
            '"door":"' + ("open" if porta_aberta else "closed") + '"}'
        )
        response = (
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: application/json\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            "Content-Length: " + str(len(body)) + "\r\n"
            "\r\n" + body
        )
        cl.send(response)
        cl.close()
