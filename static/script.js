class RemoteControl extends Phaser.Scene {
  constructor() {
    super({
      key: "RemoteControl"
    });
  }

  preload() {
    var url;

    url =
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js";
    this.load.plugin("rexvirtualjoystickplugin", url, true);

    this.load.scenePlugin({
      key: "rexuiplugin",
      url: "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js",
      sceneKey: "rexUI"
    });

    this.load.plugin(
      "rextoggleswitchplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rextoggleswitchplugin.min.js",
      true
    );

    this.load.image("ddt", "/static/ddt.png");
  }

  create() {
    // Get the width of the scene
    const viewportWidth =
      window.innerWidth || document.documentElement.clientWidth;

    // Get the height of the scene
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;

    const joystickRadius = 60;

    this.socket = io.connect(window.location.host);

    ////////////////////////////////// left joystick //////////////////////////////////
    this.joystickLeft = this.plugins
      .get("rexvirtualjoystickplugin")
      .add(this, {
        x: 120,
        y: viewportHeight / 2 + 30,
        radius: joystickRadius,
        base: this.add.circle(0, 0, joystickRadius, 0x888888),
        thumb: this.add.circle(0, 0, joystickRadius / 2, 0xcccccc)
        // dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
        // forceMin: 16,
        // enable: true
      })
      .on("update", this.dumpJoystickLeftState, this);

    this.textLeft = this.add.text(10, 10);
    this.dumpJoystickLeftState();

    ////////////////////////////////// right joystick //////////////////////////////////
    this.joystickRight = this.plugins
      .get("rexvirtualjoystickplugin")
      .add(this, {
        x: viewportWidth - 120,
        y: viewportHeight / 2 + 30,
        radius: joystickRadius,
        base: this.add.circle(0, 0, joystickRadius, 0x888888),
        thumb: this.add.circle(0, 0, joystickRadius / 2, 0xcccccc)
        // dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
        // forceMin: 16,
        // enable: true
      })
      .on("update", this.dumpJoystickRightState, this);

    this.textRight = this.add.text(viewportWidth - 200, 10);
    this.dumpJoystickRightState();


    // Prevent touch event interference
    this.input.addPointer(2);

    ////////////////////////////////// robot height slider //////////////////////////////////
    var textHeight = this.add.text(
      viewportWidth / 2 - 70,
      viewportHeight - 50,
      ""
    );
    var sliderHeight = this.rexUI.add
      .slider({
        x: viewportWidth / 2,
        y: viewportHeight - 124,
        width: 20,
        height: 130,
        orientation: "y",
        reverseAxis: true,
        value: 0.5,
        track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x777777),
        indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0xdddddd),
        thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0xdddddd),
        input: "drag", // 'drag'|'click'
        valuechangeCallback:  (value) => {
          textHeight.text = "Stand height: " + Math.round(value * 100) + '%';
          if (this.socket) {
            this.socket.emit('height', { message: Math.round(value * 100) });
          }
        },
        enable: false
      })
      .layout();

    ////////////////////////////////// robot creep/stand mode //////////////////////////////////
    var textStandMode = this.add.text(
      viewportWidth / 2 - 170,
      10,
      "Mode: creep"
    );
    var toggleSwitch = this.add.rexToggleSwitch(
      viewportWidth / 2 - 150,
      48,
      60,
      60,
      0x039be5
    );
    toggleSwitch.on("valuechange",  (value) => {
      textStandMode.text = "Mode: " + (value ? "stand" : "creep");
      sliderHeight.setEnable(value);

      if (this.socket) {
        this.socket.emit('mode', { message: value ? "stand" : "creep" });
      }
    });

    this.add.image(viewportWidth / 2, 50, "ddt");

    ////////////////////////////////// reset button //////////////////////////////////
    var style = {
      background: {
        radius: 5,
        color: 0x666666,
        strokeWidth: 0,
      },
      text: {
        fontSize: 14
      },
      space: { left: 10, right: 10, top: 10, bottom: 10 },
    }

    var buttons = this.rexUI.add.buttons({
      x: 60, 
      y: 100,
      width: 100,
      buttons: [
        createButton(this, style, 'Reset'),
      ],
      space: { item: 8 }
    })
    .layout();
    buttons.on('button.click',  () => {
      this.socket.emit('reset', { message: "" });
    })

    ////////////////////////////////// keep sdk control active //////////////////////////////////
    setInterval(() => {
      this.socket.emit('keepAlive', { message: "" });
    }, 200);
  }

  dumpJoystickLeftState() {
    var cursorKeys = this.joystickLeft.createCursorKeys();
    var s = "Key down: ";
    var key = '';
    for (var name in cursorKeys) {
      if (cursorKeys[name].isDown) {
        s += `${name} `;
        key = name;
      }
    }
    s += `
Force: ${Math.floor(this.joystickLeft.force * 100) / 100}
Angle: ${Math.floor(this.joystickLeft.angle * 100) / 100}
        `;
    this.textLeft.setText(s);

    if (this.socket) {
      this.socket.emit('joystickLeft', { message: key });
    }
  }

  dumpJoystickRightState() {
    var cursorKeys = this.joystickRight.createCursorKeys();
    var s = "Key down: ";
    var key = '';
    for (var name in cursorKeys) {
      if (cursorKeys[name].isDown) {
        s += `${name} `;
        key = name;
      }
    }
    s += `
Force: ${Math.floor(this.joystickRight.force * 100) / 100}
Angle: ${Math.floor(this.joystickRight.angle * 100) / 100}
        `;
    this.textRight.setText(s);

    if (this.socket) {
      this.socket.emit('joystickRight', { message: key });
    }
  }
}

var createButton = function (scene, style, text) {
  return scene.rexUI.add.simpleLabel(style)
    .resetDisplayContent(text)
    .setName(text);
}


var config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: "100%",
  height: "100%",
  scene: RemoteControl,
  backgroundColor: 0x333333
};

var game = new Phaser.Game(config);
