var 
// Dependencies
	path = require('path'),
// Interfaces
	Client = require('./client'),
	Spotify = require('./spotify'),
	Cache = require('./cache'),
	Permissions = require('./permissions');

module.exports = function(args, callback){
	return new Room(args, callback);
}

function Room(args, callback){
	var that = this;

	that.name = args.name;
	that.sio = args.sio;
	that.port = args.port;

	that.lastTouched = Date.now();

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

	// Update lastTouched when Spotify does anything
	function spotifyTouched(){
		that.lastTouched = Date.now();
	}

	that.spotify.event.on('connected', spotifyTouched);
	that.spotify.event.on('change', spotifyTouched);
	that.spotify.event.on('disconnect', spotifyTouched);

	that.client.listen();

	callback(that);
};

Room.prototype.playerView = function(req, res, next) {
	var that = this;

	that.permissions.plainAuth(req.cookies.auth, req.ip, req, function(){
		if( req.isAuth ){
			res.sendfile(path.join(__dirname, '..', '/views/index.html'));
		}
		else {
			res.sendfile(path.join(__dirname, '..', '/views/user.html'));
		}	
	});
};

Room.prototype.loginView = function(req, res, next) {
	var that = this;

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
};

Room.prototype.die = function() {
	var that = this;

	that.client.die();
	that.spotify.die();
};