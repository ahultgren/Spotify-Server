var exec = require('child_process').exec,
	child,
	app = require('express')();

app.get('/', function(req, res){
	exec('osascript -e \'tell application "Spotify" to playpause\'');
	res.send('Hello World');
});

app.listen(3000);
console.log('Listening on port 3000');