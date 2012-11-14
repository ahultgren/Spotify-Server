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

Permissions.prototype.auth = function(req, res, next) {
	var that = this;

	// Expected to be called as express.use or equivalent
	if( that.token !== undefined ){
		store.validate(req.cookie['auth'], req.ip, function(isValid){
			if( isValid ){
				req.isAdmin = true;
				next();	
			}
			else {
				next();
			}
		});
	}
	else {
		req.isAdmin = true;
		next();	
	}
};

Permissions.prototype.login = function(token, ip, callback) {
	var that = this;

	if( token === that.token ){
		that.store.generateHash(ip, callback);
	}
	else {
		callback(false);
	}
};

Permissions.prototype.enableAuth = function(token) {
	that.token = token;
};

Permissions.prototype.disableAuth = function() {
	that.token = undefined;
};

// Class for storing insensitive session data in memory
function SessionStore(secret){
	function SessionStore(secret){
		this.secret = secret;
	}

	SessionStore.prototype = new Array();

	SessionStore.prototype.validate = function(hash, ip, callback) {
		find(hash, function(){
			generateHash(function(testHash){
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

	function generateHash(ip, callback){
		var that = sessionStore;

		callback(crypto.createHash('md5').update(ip + that.secret).digest('hex'));
	}

	var sessionStore = new SessionStore(secret);
	return sessionStore;
}