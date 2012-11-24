var
// Dependencies
	path = require('path'),
// Interfaces
	Client = require('./client'),
	Spotify = require('./spotify'),
	Cache = require('./cache'),
	Permissions = require('./permissions');

module.exports = function(args){
	return new Main(args);
}

function Main(args){
	var that = this;

	/* Server stuff */

	that.app = args.app;
	that.server = args.server;
	that.sio = args.sio;
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
	that.route(args.baseRoute);
};

Main.prototype.route = function(baseRoute) {
	var that = this;

	// Routing
	that.app.get(baseRoute, that.permissions.auth(), function(req, res){
		if( req.isAuth ){
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