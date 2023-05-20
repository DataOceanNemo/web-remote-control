# Web Virtual Remote Control

Web virtual remote control for ros2 robot Diablo.

## How to use

#### Prerequisite

You are using Linux and have ROS2 installed.

You have followed [these steps](https://github.com/DDTRobot/diablo_ros2) to build Diablo source code.

#### Install dependencies

Install python3 packages:

```bash
pip3 install flask flask_socketio flask_cors
```

#### Start

To start the web server:

```bash
python3 web-server.py
```

Open browser from mobile (in landscape mode), and open the web remote control using LAN ip and port, eg. `http://192.168.0.216:5000` (if the server is running on 192.168.0.216).

Screenshot:
![web virtual remote control](https://github.com/DataOceanNemo/web-remote-control/blob/main/static/screenshot.jpg?raw=true)

Note: this server can be run anywhere inside the robot's LAN, including in the robot Raspberry Pi Linux.
