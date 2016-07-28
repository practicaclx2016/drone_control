var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Drone = require('./drone_utilities/drone.js');
var RollingSpiderPlugin = require('./drone_utilities/plugins/RollingSpider.js');
var Parrot = require('./drone_utilities/plugins/Parrot.js');
var port = 3000;


//var drone = new Drone(new RollingSpiderPlugin());
var drone = new Drone(new ParrotPlugin());

var droneIsConnected = false;
var droneData = {
  uuid: '-',
  name: '-'
};

drone.connect(function(data) {
  console.log('Connected');
  
  droneIsConnected = true;
  droneData = data;
  
  io.sockets.emit('droneConnected', {
    status: droneIsConnected,
    data: droneData
  });
  
  drone.registerEventHandler('battery', function(data) {
    console.log('Battery: ' + data.status);
    io.sockets.emit('battery', {status: data.status});
  });
});



// Deserve the HTML
app.use(express.static('public'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

var Client = function(socket) {
  this.socket = socket;
};

var clients = {};

var commandMap = {
  0  : 'emergency',
  1  : 'takeoff',
  2  : 'land',
  3  : 'up',
  4  : 'down',
  5  : 'turnRight',
  6  : 'turnLeft',
  7  : 'forward',
  8  : 'backward',
  9  : 'left',
  10 : 'right',
  11 : 'stop'
};

// Socket.IO connection
io.sockets.on('connection', function(socket){
  var socketID = socket.id.replace('/#', '');
  clients[socketID] = new Client(socket);
  
  socket.on('disconnect', function() {
    var socketID = socket.id.replace('/#', '');
    delete clients[socketID];
  });
  
  socket.emit('droneConnected', {
    status: droneIsConnected,
    data: droneData
  });
  
  socket.emit('welcome', {
    status: 1,
    message: 'Welcome!'
  });
  
  // Custom events
  
  socket.on('command', function(data) {
    if (typeof commandMap[data.command] == 'undefined') {
      return ;
    }
    
    drone[ commandMap[data.command] ]();
    console.log(commandMap[data.command]);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
