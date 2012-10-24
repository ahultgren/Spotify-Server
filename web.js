var 
// Dependencies
	express = require('express'),
	server = require('http'),
	socket = require('socket.io'),
// Interfaces
	Client = require('./client'),
	Slave = require('./slave'),
	Cache = require('./cache');


function App(args){
	var that = this;

	/* Server stuff */

	that.app = args.express();
	that.server = args.server.createServer(that.app);
	that.sio = args.socket.listen(that.server);
	that.port = args.port;


	/* Modules */

	that.cache = Cache();

	that.client = Client({
		cache: that.cache
	});

	that.slave = Slave({
		sio: that.sio,
		client: that.client,
		cache: that.cache,
		token: '1337' //## Create a config-file and keep auth stuff there
	});


	/* Start server stuff */

	that.route();
	that.httpListen();
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

App.prototype.socketsListen = function() {
	var that = this,
		sockets = that.sio.sockets,
		client = that.client;

	that.sio.of('/client').on('connection', function (socket) {
		console.log('connected as client');

		socket.on('get', function(property){
			that.client.get(property, function(data){
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

	client.event.on('change', function(changed){
		that.sio.of('client').emit('change', changed);
	});
};


// Wohoo

var app = new App({
	express: express,
	server: server,
	port: 3000,
	socket: socket
});