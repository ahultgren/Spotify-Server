var crypto = require('crypto'),
	permissions,
	store;

module.exports = function(args){
	permissions = new Permissions(args);
	return permissions;
}

function Permissions(args){
	var that = this;

	that.token = args.token;
	that.secret = args.secret;

	store = SessionStore(that.secret);
}

/* Public methods */

Permissions.prototype.auth = function() {
	var that = this;

	return function(req, res, next){
		// Expected to be called as express.use or equivalent
		if( that.token !== undefined ){
			store.validate(req.cookies.auth, req.ip, function(isValid){
				if( isValid ){
					req.isAuth = true;
					next();	
				}
				else {
					next();
				}
			});
		}
		else {
			req.isAuth = true;
			next();	
		}
	};
};

Permissions.prototype.login = function(token, ip, callback) {
	var that = this;

	if( token === that.token ){
		store.generateHash(ip, callback);
	}
	else {
		callback(false);
	}
};

Permissions.prototype.enable = function(token) {
	this.token = token;
};

Permissions.prototype.disable = function() {
	this.token = undefined;
};

// Class for storing insensitive session data in memory
function SessionStore(secret){
	function SessionStore(secret){
		this.secret = secret;
	}

	SessionStore.prototype = new Array();

	SessionStore.prototype.validate = function(hash, ip, callback) {
		var that = this;

		find(hash, function(){
			that.generateHash(function(testHash){
				if( testHash === hash ){
					callback(true);
				}
				else {
					callback(false);
				}
			});
		},
		function(){
			callback(false);
		});
	};

	SessionStore.prototype.generateHash = function(ip, callback) {
		var that = sessionStore;

		callback(crypto.createHash('md5').update(ip + that.secret).digest('hex'));
	};

	function find(id, success, fail){
		var that = sessionStore,
			i;

		for( i = that.length; i--; ){
			if( that[i].id = id){
				success(id);
				return;
			}
		}

		fail();
	}

	var sessionStore = new SessionStore(secret);
	return sessionStore;
}