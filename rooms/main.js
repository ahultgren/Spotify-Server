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

function Main(){
	var that = this;

	cronDeleteInactive(that);
}

Main.prototype = new Array();

// Public methods

Main.prototype.add = function(args, success, fail) {
	var that = this;

	isReserved(args.name, fail, function(){
		that.get(args.name, fail,
		function(){
			new Room(args, function(room){
				success ? success(that.push(room)) : that.push(room);
			});	
		})
	});
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