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
	var that = this;

	if( param === 'position' && that.params.state && that.params.state.value ){
		return Date.now() - that.params.position.timestamp + that.params.position.value;
	}

	return that.params[param].value;
};

Cache.prototype.getAll = function() {
	var that = this,
		params = that.params,
		result = {},
		i;

	for( i in params ){
		if( params[i] ){
			if( i === 'position' && that.params.state && that.params.state.value ){
				result[i] = Date.now() - that.params.position.timestamp + that.params.position.value;
			}
			else {
				result[i] = params[i].value;
			}
		}
	}

	return result;
};

Cache.prototype.clear = function(callback) {
	var params = this.params,
		i;

	for( i in params ){
		params[i] = undefined;
	}
};