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
		store.add(ip, callback);
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
		this.__proto__.secret = secret;
	}

	SessionStore.prototype = new Array();
	SessionStore.prototype.constructor = SessionStore;

	SessionStore.prototype.validate = function(hash, ip, callback) {
		var that = this;

		find(hash, function(i, data){
			generateHash(ip, data.salt, function(testHash){
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

	SessionStore.prototype.add = function(ip, callback) {
		var that = this;

		generateHash(ip, function(hash, salt){
			that.push({
				id: hash,
				salt: salt
			});

			callback(hash);
		});
	};

	SessionStore.prototype.remove = function(id) {
		var that = this;

		find(id, function(i){
			that.splice(i, 1);
		});
	};

	SessionStore.prototype.clear = function() {
		this.splice(0);
	};

	function generateHash(ip, salt, callback){
		var that = sessionStore,
			salt = salt || (Math.random()*0xFFFFFF<<0).toString(16),
			callback = callback || salt;

		callback(crypto.createHash('md5').update(ip + salt + that.secret).digest('hex'), salt);
	};

	function find(id, success, fail){
		var that = sessionStore,
			i;

		for( i = that.length; i--; ){
			if( that[i].id = id){
				success(i, that[i]);
				return;
			}
		}

		fail();
	}

	var sessionStore = new SessionStore(secret);
	return sessionStore;
}