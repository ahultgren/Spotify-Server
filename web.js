var 
// Dependencies
	express = require('express'),
	server = require('http'),
	socket = require('socket.io'),
// Interfaces
	Client = require('./client'),
	Spotify = require('./spotify'),
	Cache = require('./cache'),
	Permissions = require('./permissions');


function App(args){
	var that = this;

	/* Server stuff */

	that.app = args.express();
	that.server = args.server.createServer(that.app);
	that.sio = args.socket.listen(that.server);
	that.port = args.port;


	/* Modules */

	that.permissions = Permissions({
		secret: 'lmkU8y)uOIY78&yYPO)/8%7i676RT)J&h7GB66GE5G(6;K&OHuT#e3"dåk' //## Create config file some day!
	});

	that.cache = Cache();

	that.client = Client({
		main: that
	});

	that.spotify = Spotify({
		main: that,
		token: '1337' //## Create a config-file and keep auth stuff there
	});

	that.client.listen();


	/* Start server stuff */

	that.route();
	that.httpListen();
};

App.prototype.route = function() {
	var that = this;

	//Routing

	that.app.use('/static', express.static(__dirname + '/static'));

	that.app.use(express.cookieParser());

	that.app.get('/', that.permissions.auth(), function(req, res){

		if( req.isAuth ){
			res.sendfile(__dirname + '/views/index.html');
		}
		else {
			res.sendfile(__dirname + '/views/user.html');
		}
	});

	that.app.get('/login', function(req, res){
		// Takes care of both /login and /login?token=mjau
		if( req.query.token !== undefined ){
			that.permissions.login(req.query.token, req.ip, function(id){
				if( id ){
					res.cookie('auth', id, {});
					res.redirect(303, '/');
				}
				else {
					res.send(401);
				}
			});
		}
		else {
			res.sendfile(__dirname + '/views/login.html');
		}
	});
};

App.prototype.httpListen = function() {
	var that = this,
		port = that.port;

	that.server.listen(port);
	console.info('Listening on port %s', port);
};

// Wohoo

var app = new App({
	express: express,
	server: server,
	port: 3000,
	socket: socket
});