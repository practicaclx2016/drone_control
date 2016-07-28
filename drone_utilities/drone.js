module.exports = function(dronePlugin) {
    
    this.drone = dronePlugin;
    
    // General command bypass
    this.command = function(command) {
      if (typeof this.drone[command] == "function") {
        var args = [];
        for (var i in arguments) {
            if (i === 0) {
                continue;
            }
            args.push(arguments[i]);
        }
        var result = this.drone[command].apply(this.drone, args);
        return result;
      }
    };
    
    // Registering events
    this.registerEventHandler = function(event, handler) {
        this.drone.registerEventHandler(event, handler);
    };
    
    this.connect = function(callback) {
        this.drone.connect(callback);
    };
    
    this.disconnect = function(callback) {
        this.drone.disconnect(callback);
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
        this.drone.up(settings, callback);
    };
    
    this.down = function(settings, callback) {
        this.drone.down(settings, callback);
    };
    
    this.turnRight = function(settings, callback) {
        this.drone.turnRight(settings, callback);
    };
    
    this.turnLeft = function(settings, callback) {
        this.drone.turnLeft(settings, callback);
    };
    
    this.forward = function(settings, callback) {
        this.drone.forward(settings, callback);
    };
    
    this.backward = function(settings, callback) {
        this.drone.backward(settings, callback);
    };
    
    this.left = function(settings, callback) {
        this.drone.left(settings, callback);
    };
    
    this.right = function(settings, callback) {
        this.drone.right(settings, callback);
    };
    
    this.stop = function() {
        this.drone.stop();
    };
};