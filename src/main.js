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

function Main(){
	//## Add cronjob that removes inactive rooms
}

Main.prototype = new Array();

Main.prototype.add = function(args) {
	var that = this;

	//## Make sure the name is unique and not reserved
	new Room(args, function(room){
		that.push(room);
	});
};

Main.prototype.remove = function(index) {
	//## Make sure no socket listeners are still hanging around
};

Main.prototype.get = function(name, yes, no) {
	var that = this,
		found = false,
		i;

	for( i = that.length; i--; ){
		if( that[i].name === name ){
			found = true;
			break;
		}
	}

	found ? yes(that[i]) : no();
};

function Room(args, callback){
	var that = this;

	that.name = args.name;
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