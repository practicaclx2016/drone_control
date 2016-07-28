var merge = require('merge');
var Parrot = require('ar-drone');

module.exports = function(settings, flightSettings) {
    
    this.drone = null;
    this.settings = settings || {};
    this.connected = false;
    this.batteryHandler = null;
    
    this.flightSettings = flightSettings || {
        speed: 0.5
    };
    
    // Registering events
    this.registerEventHandler = function(event, handler) {
        if (event == 'battery') {
            event = 'batteryChange';
        }
        
        if (event == 'batteryChange') {
            this.batteryHandler = handler;
        }
        else {
            this.drone.on(event, handler);
        }
    };
    
    this.connect = function(callback) {
        var self = this;
        
        this.drone = Parrot.createClient(self.settings);
        
        this.drone.on('batteryChange', function(data) {
            if (typeof self.batteryHandler == 'function') {
                self.batteryHandler({status: data});
            }
            
            console.log(data);
            
            if (data <= 10) {
                self.land();
            }
        });
        
        if (typeof callback == 'function') {
            callback({
                uuid: '-',
                name: 'Parrot 2'
            });
        }
    };
    
    this.disconnect = function(callback) {
        
    };
    
    this.calibrate = function() {
        this.drone.calibrate();
    };
    
    this.emergency = function() {
        this.drone.disableEmergency();
    };
    
    this.takeoff = function(callback) {
        this.drone.takeoff(callback);
    };
    
    this.land = function(callback) {
        this.drone.land(callback);
    };
    
    this.up = function(settings) {
        settings = merge(this.flightSettings, settings);
        this.drone.up(settings.speed);
    };
    
    this.down = function(settings) {
        settings = merge(this.flightSettings, settings);
        this.drone.down(settings.speed);
    };
    
    this.turnRight = function(settings) {
        settings = merge(this.flightSettings, settings);
        this.drone.clockwise(settings.speed);
    };
    
    this.turnLeft = function(settings) {
        settings = merge(this.flightSettings, settings);
        this.drone.counterClockwise(settings.speed);
    };
    
    this.forward = function(settings) {
        settings = merge(this.flightSettings, settings);
        this.drone.front(settings.speed);
    };
    
    this.backward = function(settings) {
        settings = merge(this.flightSettings, settings);
        this.drone.back(settings.speed);
    };
    
    this.left = function(settings) {
        settings = merge(this.flightSettings, settings);
        this.drone.left(settings.speed);
    };
    
    this.right = function(settings) {
        settings = merge(this.flightSettings, settings);
        this.drone.right(settings.speed);
    };
    
    this.stop = function() {
        this.drone.stop();
    };
    
    // Parrot specific commands
    this.getPngStream = function() {
        return this.drone.getPngStream();
    };
    
    this.getVideoStream = function() {
        return this.drone.getVideoStream();
    };
    
};