module.exports = function(args){
	return new Cache(args);
}

function Cache(args){
	this.params = {};
}

Cache.prototype.set = function(params) {
	var that = this, i;

	for( i in params ){
		that.params[i] = {
			value: params[i],
			timestamp: Date.now()
		};
	}
};

Cache.prototype.get = function(param) {
	return this.params[param].value;
};