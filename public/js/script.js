var SocketIO = function(url) {
    var self = this;
    
    this.socket = null;
    this.url = typeof url != "undefined" ? url : window.location.origin;
    this.status = false;
    
    this.connect = function() {
        this.socket = io.connect(this.url);
        
        this.attach('connect', function() {
            self.status = true;
        });
    };
    
    this.send = function(event, data) {
        data = data || {};
        data = typeof data == "undefined" ? {} : data;
        
        this.socket.emit(event, data);
    };
    
    this.attach = function(event, handler) {
        this.socket.on(event, handler);
    };
    
    this.connect();
};

var DroneControl = function(controlClass, elem, keymap) {
    var self = this;
    
    this.controlObj = new controlClass(this, elem, keymap);
    
    this.socket = new SocketIO();
    this.connected = false;
    this.droneData = null;
    
    this.commandMap = {
        emergency   : 0,
        takeoff     : 1,
        land        : 2,
        up          : 3,
        down        : 4,
        turnRight   : 5,
        turnLeft    : 6,
        forward     : 7,
        backward    : 8,
        left        : 9,
        right       : 10,
        stop        : 11
    };
    
    this.socket.attach('droneConnected', function(data) {
        self.connected = data.status;
        self.droneData = data.data;
        
        $("#status").html('<b>Status: </b>' + self.connected + '<br>' +
                          '<b>Drone: </b>' + self.droneData.name + ' (' +
                          self.droneData.uuid +')');
    });
    
    this.socket.attach('battery', function(data) {
        $("#battery").html('<b>Battery: </b>' + data.status + '%');
    });
    
    this.sendCmd = function(cmd) {
        console.log(cmd);
        if (!this.connected) {
            return ;
        }
        
        if (typeof this.commandMap[cmd] == 'undefined') {
            return ;
        }
        
        this.socket.send('command', {command: this.commandMap[cmd]});
        console.log('Command: ' + cmd);
    };
};

var KeyboardControl = function(obj, elem, keyMap) {
    var self = this;
    var defaultKeyMap = {
        27 : {
            command: 'emergency',
            releaseable: false
        },
        32 : {
            command: 'takeoff',
            releaseable: false
        },
        8  : {
            command: 'land',
            releaseable: false
        },
        38 : {
            command: 'up',
            releaseable: true
        },
        40 : {
            command: 'down',
            releaseable: true
        },
        37 : {
            command: 'turnLeft',
            releaseable: true
        },
        39 : {
            command: 'turnRight',
            releaseable: true
        },
        87 : {
            command: 'forward',
            releaseable: true
        },
        65 : {
            command: 'left',
            releaseable: true
        },
        83 : {
            command: 'backward',
            releaseable: true
        },
        68 : {
            command: 'right',
            releaseable: true
        },
        9  : {
            command: 'stop',
            releaseable: false
        }
    };
    
    this.obj = obj;
    this.keyMap = keyMap || defaultKeyMap;
    
    this.keyIsPressed = false;

    elem.on('keydown', function(e) {
        
        e.preventDefault();
        
        if (self.keyIsPressed) {
            return ;
        }
        
        if (typeof self.keyMap[e.keyCode] == 'undefined') {
            return;
        }
        
        self.keyIsPressed = true;

        self.obj.sendCmd( self.keyMap[e.keyCode].command );
    });
    
    elem.on('keyup', function(e) {
        e.preventDefault();
        
        if (typeof self.keyMap[e.keyCode] == 'undefined') {
            return;
        }
        
        self.keyIsPressed = false;
        
        if (self.keyMap[e.keyCode].releaseable) {
            self.obj.sendCmd('stop');
        }
    });
};

var GamepadControl = function(obj, elem, keyMap) {
    var self = this;
    var defaultKeyMap = {
        b2 : {
            command: 'emergency',
            releaseable: false
        },
        a5down : {
            command: 'takeoff',
            releaseable: false
        },
        a2down  : {
            command: 'land',
            releaseable: false
        },
        a1up : {
            command: 'up',
            releaseable: true
        },
        a1down : {
            command: 'down',
            releaseable: true
        },
        a1: {
            command: 'stop',
            releaseable: true
        },
        a0up : {
            command: 'turnLeft',
            releaseable: true
        },
        a0down : {
            command: 'turnRight',
            releaseable: true
        },
        a0: {
            command: 'stop',
            releaseable: true
        },
        a4up : {
            command: 'forward',
            releaseable: true
        },
        a4down : {
            command: 'backward',
            releaseable: true
        },
        a4: {
            command: 'stop',
            releaseable: true
        },
        a3up : {
            command: 'left',
            releaseable: true
        },
        a3down : {
            command: 'right',
            releaseable: true
        },
        a3: {
            command: 'stop',
            releaseable: true
        },
        b1  : {
            command: 'stop',
            releaseable: false
        }
    };
    
    this.obj = obj;
    this.keyMap = keyMap || defaultKeyMap;
    
    var haveEvents = 'ongamepadconnected' in window;
    
    this.controllers = {};
    this.values = {
        buttons : [],
        axes    : []
    };
    this.beforeValues = cloneObj(this.values);
    
    this.connecthandler = function(e) {
        self.addgamepad(e.gamepad);
    };
    
    this.disconnecthandler = function(e) {
        self.removegamepad(e.gamepad);
    };
    
    this.addgamepad = function(gamepad) {
        self.controllers[gamepad.index] = gamepad;
        
        requestAnimationFrame(self.updateStatus);
    };
    
    this.removegamepad = function(gamepad) {
        delete self.controllers[gamepad.index];
    };
    
    this.updateStatus = function() {
        if (!haveEvents) {
            self.scangamepads();
        }
        
        var i = 0;
        var j;
        
        for (j in self.controllers) {
            var controller = self.controllers[j];
            
            for (i = 0; i < controller.buttons.length; i++) {
                var val = controller.buttons[i];
                var pressed = val == 1.0;
                if (typeof(val) == "object") {
                    pressed = val.pressed;
                    val = val.value;
                }
                
                self.values.buttons[i] = val;
            }
            
            for (i = 0; i < controller.axes.length; i++) {
                var val = controller.axes[i].toFixed(4);
                val = Math.round(val);
                if ((i == 2 || i == 5) && val == 0) {
                    continue;
                }
                self.values.axes[i] = val;
            }
        }
        
        // Check for buttons
        for(var i = 0; i < self.values.buttons.length; i++) {
            if (typeof self.beforeValues.buttons[i] != 'undefined' &&
                self.values.buttons[i] != self.beforeValues.buttons[i]) {
                
                var key = 'b' + i;
                
                if (typeof self.keyMap[key] == 'undefined') {
                    continue;
                }
                
                if (self.values.buttons[i] == 1) {
                    self.obj.sendCmd(self.keyMap[key].command);
                }
                else if(self.keyMap[key].releaseable) {
                    self.obj.sendCmd('stop');
                }
            }
        }
        
        // Check for axes
        for(var i = 0; i < self.values.axes.length; i++) {
            if (typeof self.beforeValues.axes[i] != 'undefined' &&
                self.values.axes[i] != self.beforeValues.axes[i]) {
                
                var key = 'a' + i;
                
                if (self.values.axes[i] == 1) {
                    key += 'down';
                }
                
                if (self.values.axes[i] == -1) {
                    key += 'up';
                }
                
                if (typeof self.keyMap[key] == 'undefined') {
                    continue;
                }
                
                self.obj.sendCmd(self.keyMap[key].command);
            }
        }
       
        self.beforeValues = cloneObj(self.values);
        
        requestAnimationFrame(self.updateStatus);
    };
    
    this.scangamepads = function() {
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
        for (var i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                if (gamepads[i].index in self.controllers) {
                    self.controllers[gamepads[i].index] = gamepads[i];
                } else {
                    self.addgamepad(gamepads[i]);
                }
            }
        }
    };
    
    window.addEventListener("gamepadconnected", self.connecthandler);
    window.addEventListener("gamepaddisconnected", self.disconnecthandler);
    
    if (!haveEvents) {
      setInterval(self.scangamepads, 500);
    }
    
    function cloneObj(source) {
        var newObj = {
            buttons : [],
            axes    : []
        };
        
        for(var i = 0; i < source.buttons.length; i++) {
            newObj.buttons[i] = source.buttons[i];
        }
        
        
        for(var i = 0; i < source.axes.length; i++) {
            newObj.axes[i] = source.axes[i];
        }
        
        return newObj;
    }
};

$(document).ready(function() {
    //var drone = new DroneControl(GamepadControl, $(window));
    var drone = new DroneControl(KeyboardControl, $(window));
    //var control = new KeyboardControl(new DroneControl(), $(window));
});