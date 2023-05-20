from flask import Flask, render_template
from flask_socketio import SocketIO
from flask_cors import CORS

import rclpy
from rclpy.node import Node
from motion_msgs.msg import MotionCtrl

app = Flask(__name__, static_url_path='/static')
socketio = SocketIO(app)
CORS(app)

CMD_GO_FORWARD = 0x08
CMD_GO_LEFT = 0x04
CMD_ROLL_RIGHT = 0x09

CMD_HEIGH_MODE = 0x01
CMD_BODY_UP = 0x11

CMD_STAND_UP = 0x02
CMD_STAND_DOWN  =  0x12

CMD_PITCH = 0x03
CMD_PITCH_MODE = 0x13

CMD_SPEED_MODE = 0x05

class RosNode(Node):
    def __init__(self):
        super().__init__('flask_ros_node')
        self.publisher_ = self.create_publisher(MotionCtrl,"diablo/MotionCmd",2)

    def publish_message(self, msg):
        self.publisher_.publish(msg)

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    # Perform any required actions when a client connects

@socketio.on('keepAlive')
def handle_keepAlive(data):
    # Handle the received message
    msg = MotionCtrl()
    msg.cmd_id = 0
    msg.value = 0.0
    ros_node.publish_message(msg)

@socketio.on('reset')
def handle_reset(data):
    # Handle the received message
    msg = MotionCtrl()
    msg.cmd_id = CMD_PITCH
    msg.value = 0.0
    ros_node.publish_message(msg)
    msg2 = MotionCtrl()
    msg2.cmd_id = CMD_ROLL_RIGHT
    msg2.value = 0.0
    ros_node.publish_message(msg2)

@socketio.on('mode')
def handle_mode(data):
    print('Stand/Creep mode:', data)
    # Handle the received message
    msg = MotionCtrl()
    key = data['message']
    if key == 'stand':
        msg.cmd_id = CMD_STAND_UP
        msg.value = 0.0
    elif key == 'creep':
        msg.cmd_id = CMD_STAND_DOWN
        msg.value = 0.0
    else:
        msg.cmd_id = 0
        msg.value = 0.0
    ros_node.publish_message(msg)


@socketio.on('height')
def handle_height(data):
    print('Stand height:', data)
    # Handle the received message
    msg = MotionCtrl()
    height = int(data['message'])
    if height > 66:
        msg.cmd_id = CMD_BODY_UP
        msg.value = 1.0
    elif height > 33:
        msg.cmd_id = CMD_BODY_UP
        msg.value = 0.5
    else:
        msg.cmd_id = CMD_BODY_UP
        msg.value = 0.0
    
    ros_node.publish_message(msg)


@socketio.on('joystickLeft')
def handle_joystickLeft(data):
    print('Left joystick:', data)
    # Handle the received message
    msg = MotionCtrl()
    key = data['message']
    if key == 'up':
        msg.cmd_id = CMD_PITCH
        msg.value = -(0.5)
    elif key == 'down':
        msg.cmd_id = CMD_PITCH
        msg.value = 0.5
    elif key == 'left':
        msg.cmd_id = CMD_ROLL_RIGHT
        msg.value = -(0.1)
    elif key == 'right':
        msg.cmd_id = CMD_ROLL_RIGHT
        msg.value = 0.1
    else:
        msg.cmd_id = 0
        msg.value = 0.0
    ros_node.publish_message(msg)
    

@socketio.on('joystickRight')
def handle_joystickRight(data):
    print('Right joystick:', data)
    # Handle the received message
    msg = MotionCtrl()
    key = data['message']
    if key == 'up':
        msg.cmd_id = CMD_GO_FORWARD
        msg.value = 1.0
    elif key == 'down':
        msg.cmd_id = CMD_GO_FORWARD
        msg.value = -(1.0)
    elif key == 'left':
        msg.cmd_id = CMD_GO_LEFT
        msg.value = 1.0
    elif key == 'right':
        msg.cmd_id = CMD_GO_LEFT
        msg.value = -(1.0)
    else:
        msg.cmd_id = 0
        msg.value = 0.0
    ros_node.publish_message(msg)
    

def start_flask_server():
    socketio.run(app, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    rclpy.init()
    ros_node = RosNode()

    import threading
    flask_thread = threading.Thread(target=start_flask_server)
    flask_thread.start()

    # Start the socket server
    import socket
    # Get the IP address dynamically
    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)
    server_address = (ip_address, 12345)
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(server_address)
    sock.listen(1)
    while True:
        print('Waiting for a connection...')
        connection, client_address = sock.accept()
        try:
            print('Accepted connection from', client_address)
            data = connection.recv(1024)
            print('Received:', data.decode())
        finally:
            connection.close()
    
