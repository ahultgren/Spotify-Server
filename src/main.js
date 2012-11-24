var 
// Dependencies
	path = require('path'),
	path = require('path'),
	express = require('express'),
	app = express(),
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

	that.app = args.app;
	that.server = args.server.createServer(that.app);
	that.sio = args.socket.listen(that.server);
	that.port = args.port;


	/* Modules */

	that.permissions = Permissions({
		secret: 'lmkU8y)uOIY78&yYPO)/8%7i676RT)J&h7GB66GE5G(6;K&OHuT#e3"dåk' //## Create config file some day!
	});

	that.cache = Cache();

	that.client = Client({
		main: that,
		namespace: args.namespaces.client
	});

	that.spotify = Spotify({
		main: that,
		token: args.slaveToken,
		namespace: args.namespaces.slave
	});

	that.client.listen();


	/* Start server stuff */

	that.route(args.baseRoute);
	that.httpListen();
};

App.prototype.route = function(baseRoute) {
	var that = this;

	// Routing
	that.app.get(baseRoute, that.permissions.auth(), function(req, res){
		if( req.isAuth ){
			console.log(path.join(__dirname, '..', '/views/index.html'));
			res.sendfile(path.join(__dirname, '..', '/views/index.html'));
		}
		else {
			res.sendfile(path.join(__dirname, '..', '/views/user.html'));
		}
	});

	that.app.get(baseRoute + '/login', function(req, res){
		// Takes care of both /login and /login?token=mjau
		if( req.query.token !== undefined ){
			that.permissions.login(req.query.token, req.ip, function(id){
				if( id ){
					res.cookie('auth', id, {});
					res.redirect(303, baseRoute);
				}
				else {
					res.send(401);
				}
			});
		}
		else {
			res.sendfile(path.join(__dirname, '..', '/views/login.html'));
		}
	});
};

App.prototype.httpListen = function() {
	var that = this,
		port = that.port;

	that.server.listen(port);
	console.info('Listening on port %s', port);
};

// Global routing and middleware
app.use('/static', express.static(path.join(__dirname, '..', '/static')));
app.use(express.cookieParser());


// Wohoo

var main = new App({
	express: express,
	app: app,
	server: server,
	socket: socket,
	port: 3000,
	slaveToken: '1337',
	baseRoute: '/username',
	namespaces: {
		client: '/username_client',
		slave: '/username_slave'
	}
});