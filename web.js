var 
// Dependencies
	express = require('express'),
	server = require('http'),
	socket = require('socket.io'),
// Interfaces
	spotify = require('./spotify_interface'),
	slave = require('./spotify_slave'),
// Other private vars
	auth,
	allowedLevels = 9;


function App(args){
	var that = this;

	that.useAuth = false;
	that.app = args.express();
	that.server = args.server.createServer(that.app);
	that.sio = args.socket.listen(that.server);
	that.slave = args.slave;
	that.port = args.port;

	that._cache = {};

	that.start();
}

App.prototype.start = function() {
	var that = this;

	that.route();
	that.httpListen();
	that.connectToSpotify();
	that.socketsListen();
};

App.prototype.route = function() {
	var that = this;

	//Routing

	that.app.get('/', function(req, res){
		res.sendfile(__dirname + '/index.html');
	});
};

App.prototype.httpListen = function() {
	var that = this,
		port = that.port;

	that.server.listen(port);
	console.info('Listening on port %s', port);
};

App.prototype.connectToSpotify = function() {
	var that = this;

	that.spotify = spotify();

	that.slave = that.slave({
		sio: that.sio,
		spotify: that.spotify,
		token: '1337' //## Create a config-file and keep auth stuff there
	});
};

App.prototype.socketsListen = function() {
	var that = this,
		sockets = that.sio.sockets,
		spotify = that.spotify;

	that.sio.of('/client').on('connection', function (socket) {
		console.log('connected as client');

		socket.emit('news', { hello: 'world' });
		
		socket.on('disconnect', function (data) {
			console.log('disconnect', data);
		});
	});

	spotify.event.on('set', function(data){
		var property;

		// Extract setted property
		for( property in data ){
			break;
		}

		// Tell everyone only if there's actually a difference
		if( that._cache[property] !== data[property] ){
			that.sio.of('client').emit(that._cache[property] = data[property]);
		}
	});

	spotify.event.on('new track', function(data){
		that.sio.of('client').emit('new track', data);
	});
};


// Wohoo

var app = new App({
	express: express,
	server: server,
	port: 3000,
	socket: socket,
	slave: slave
});