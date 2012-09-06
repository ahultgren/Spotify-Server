var app = require('express')(),
	port = 3000,
	spotify = require('./spotify_interface')();


// Routing

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

app.get('/play', function(req, res){
	spotify.play(function(status, message){
		res.send(status, message);
	});
});

app.get('/play/:uri', function(req, res){
	spotify.playUri(req.params.uri, function(status, message){
		res.send(status, message);
	});
});

app.get('/next', function(req, res){
	spotify.next(function(status, message){
		res.send(status, message);
	});
});

app.get('/prev', function(req, res){
	spotify.prev(function(status, message){
		res.send(status, message);
	});
});

app.get('/get/:property', function(req, res){
	spotify.get(req.params.property, function(status, message){
		res.send(status, message);
	});
});

app.get('/set/:property/:value', function(req, res){
	spotify.set(req.params.property, req.params.value, function(status, message){
		res.send(status, message);
	});
});

app.listen(port);
console.log('Listening on port ' + port);