var merge = require('merge');
var RollingSpider = require('rolling-spider');

module.exports = function(settings, flightSettings) {
    
    this.drone = null;
    this.settings = settings || {};
    this.connected = false;
    this.batteryHandler = null;
    
    this.flightSettings = flightSettings || {
        speed: 50,
        steps: 50
    };
    
    // Registering events
    this.registerEventHandler = function(event, handler) {
        if (event == 'battery') {
            this.batteryHandler = handler;
        }
        else {
            this.drone.on(event, handler);
        }
    };
    
    this.connect = function(callback) {
        var self = this;
        
        this.drone = new RollingSpider(this.settings);
        
        this.drone.connect(function () {
            self.drone.setup(function () {
              self.connected = true;
              
              self.drone.calibrate();
              self.drone.startPing();
              self.drone.calibrate();
              
              self.drone.wheelOn();
              
              self.drone.on('battery', function(data) {
                  if (typeof self.batteryHandler == 'function') {
                    self.batteryHandler(data);
                  }
                
                  if (data.status <= 10) {
                    self.land();
                  }
              });
              
              if (typeof callback == 'function') {
                callback({
                    uuid: self.drone.peripheral.uuid,
                    name: self.drone.peripheral.advertisement.localName    
                });
              }
            });
        });
    };
    
    this.disconnect = function(callback) {
        this.drone.disconnect(callback);
        this.connected = false;
    };
    
    this.calibrate = function(callback) {
        this.drone.calibrate(callback);
    };
    
    this.emergency = function(callback) {
        this.drone.emergency(callback);
    };
    
    this.takeoff = function(callback) {
        this.drone.takeoff(callback);
    };
    
    this.land = function(callback) {
        this.drone.land(callback);
    };
    
    this.up = function(settings, callback) {
        settings = merge(this.flightSettings, settings);
        this.drone.up(settings, callback);
    };
    
    this.down = function(settings, callback) {
        settings = merge(this.flightSettings, settings);
        this.drone.down(settings, callback);
    };
    
    this.turnRight = function(settings, callback) {
        settings = merge(this.flightSettings, settings);
        this.drone.turnRight(settings, callback);
    };
    
    this.turnLeft = function(settings, callback) {
        settings = merge(this.flightSettings, settings);
        this.drone.turnLeft(settings, callback);
    };
    
    this.forward = function(settings, callback) {
        settings = merge(this.flightSettings, settings);
        this.drone.forward(settings, callback);
    };
    
    this.backward = function(settings, callback) {
        settings = merge(this.flightSettings, settings);
        this.drone.backward(settings, callback);
    };
    
    this.left = function(settings, callback) {
        settings = merge(this.flightSettings, settings);
        this.drone.left(settings, callback);
    };
    
    this.right = function(settings, callback) {
        settings = merge(this.flightSettings, settings);
        this.drone.right(settings, callback);
    };
    
    this.stop = function() {
        this.drone.hover();
    };
    
    // Rolling Spider specific commands
    this.startPing = function() {
        this.drone.startPing();
    };
    this.wheelOn = function() {
        this.drone.wheelOn();
    };
    this.wheelOff = function() {
        this.drone.wheelOff();
    };
    this.signalStrength = function(callback) {
        this.drone.signalStrength(callback);
    };
};