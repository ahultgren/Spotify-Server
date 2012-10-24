var 
// Dependencies
	express = require('express'),
	server = require('http'),
	socket = require('socket.io'),
// Interfaces
	spotify = require('./client'),
	slave = require('./slave'),
	Cache = require('./cache');


function App(args){
	var that = this;

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

	that.cache = Cache();

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

	that.spotify = spotify({
		cache: that.cache
	});

	that.slave = that.slave({
		sio: that.sio,
		spotify: that.spotify,
		cache: that.cache,
		token: '1337' //## Create a config-file and keep auth stuff there
	});
};

App.prototype.socketsListen = function() {
	var that = this,
		sockets = that.sio.sockets,
		spotify = that.spotify;

	that.sio.of('/client').on('connection', function (socket) {
		console.log('connected as client');

		socket.on('get', function(property){
			that.spotify.get(property, function(data){
				socket.emit(property, data);
			});
		});

		socket.on('refresh', function(){
			that.slave.refresh();
		});

		socket.on('disconnect', function (data) {
			console.log('disconnect', data);
		});
	});

	spotify.event.on('change', function(changed){
		that.sio.of('client').emit('change', changed);
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