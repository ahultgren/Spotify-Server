var
// Room model
	Room = require('./room'),
// Vars
	reservedRoutes = {
		static: 1
	};

module.exports = function(args){
	return new Main(args);
}

function Main(args){
	var that = this;

	that.sio = args.sio;

	cronDeleteInactive(that);
}

Main.prototype = new Array();

// Public methods

Main.prototype.add = function() {
	var that = this;

	return function(req, res, next){
		var name = req.params.roomname;

		isReserved(name, next, function(){
			that.get(name, next, function(){
				new Room({
					name: name,
					sio: that.sio,
					slaveToken: req.body.slaveToken,
					adminToken: req.body.adminToken,
					namespaces: {
						client: '/' + name + '_client',
						slave: '/' + name + '_slave'
					}
				},
				function(room){
					that.push(room);
				});

				res.send(200);
			});
		});
	}
};

Main.prototype.remove = function(index) {
	var that = this;

	that[index].die();
	that.splice(index, 1);
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

	found ? yes && yes(that[i]) : no && no({text: 'Name is already used'});
};

Main.prototype.playerView = function() {
	var that = this;

	return function(req, res, next){
		that.get(req.params.roomname, function(room){
			room.playerView(req, res, next);
		},
		function(){
			var err = new Error('This is not the room you\'re looking for.')
			err.code = 404;
			next(err);
		});
	};
};

Main.prototype.loginView = function() {
	var that = this;

	return function(req, res, next){
		that.get(req.params.roomname, function(room){
			room.loginView(req, res, next);
		},
		function(){
			var err = new Error('There\'s no way you\'ll get in here.')
			err.code = 404;
			next(err);
		});
	};
};

// Private methods

function isReserved(name, yes, no){
	reservedRoutes[name] 
		? yes && yes({text: 'Name is not allowed'})
		: no && no();
}

function cronDeleteInactive(that){
	var i;

	setTimeout(function cron(){
		var limit = Date.now() - 15 * 60000;

		for( i = that.length; i--; ){
			if( that[i].lastTouched < limit && that[i].spotify.numberOfSlaves === 0 ){
				that.remove(i);
			}
		}
	}, 60000);
}