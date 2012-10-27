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
	if( param === 'position' ){
		return Date.now() - this.params.position.timestamp + this.params.position.value;
	}
	return this.params[param].value;
};

Cache.prototype.getAll = function() {
	var params = this.params,
		result = {},
		i;

	for( i in params ){
		if( i === 'position' ){
			result[i] = Date.now() - this.params.position.timestamp + this.params.position.value;
		}
		else {
			result[i] = params[i].value;
		}
	}

	return result;
};