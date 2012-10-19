# Spotify Server

Let the whole team choose what Spotify is playing in the office speakers.
Also works if you want people at say a party easily check what song is currently being played, if they're too shy to ask someone.

_Now working with all OSs that runs Spotify!_

## Installation

You must have node.js and npm installed.

* Clone this repo  
    `$ git clone git://github.com/ahultgren/Spotify-Server.git`
* Enter the created directory  
    `$ cd spotify-server`
* Install dependencies  
    `$ npm install`
* If you're not on a mac, get [Spotify Slave](https://github.com/ahultgren/Spotify-Slave)  
* Start the server  
    `$ node web.js`

Then try it out by visiting [http://localhost:3000](http://localhost:3000)

## How to use Spotify Server

**[/play](http://localhost:3000/play)**  
Plays current song if no song is playing, pauses if a song is currenty playing.

**[/play/uri](http://localhost:3000/play/spotify:track:3Y2nz1ySBZ9Wg0kv9Cuc3Q)**  
Plays whatever the Spotify URI points to. Could be a song, a playlist, an album or an artist.

**[/next](http://localhost:3000/next)**  
Plays next song in the play queue.

**[/prev](http://localhost:3000/prev)**  
Plays previous song in the play queue.

**[/current](http://localhost:3000/current)**  
Shows all info about the current track.

**[/get/property](http://localhost:3000/get/name)**  
Get a player or track property. Currently supported properties: [/state][get1], [/position][get2], [/volume][get3], [/name][get4], [/artist][get5], [/album][get6], [/duration][get7], [/url][get8].

**[/set/property/value](http://localhost:3000/set/volume/50)**  
Set a player property. Currently supported:

* [/state][set1] - _play_ or _pause_.
* [/position][set2] - Number of seconds. Must be at least 0 and less than the lenght of the track.
* [/volume][set3] - Number of seconds. Must be between 0 and 100.

**[/auth/wantedPassword/allowedLevels](http://localhost:3000/meow/2)**  
Set password and permission level. Spotify Server now supports permissions as a way to limit what non-admins are allowed to do.
To then authenticate yourself as admin for any action, just add [?token=meow](http://localhost:3000/play?token=meow) to the url.

Currently the following levels are supported:

* 0: /
* 1: /current
* 2: /get
* 3: /play, /next, /prev
* 4: /play/uri
* 5: /set
* 10: /auth

So for example if the permission level is set to 2, anyone can get info about the player and tracks but not change what's playing.
Also if you would set the permission level to 10 or higher anyone will be able to change the password. Don't do that.

## Contribution

Contributions are very much appreciated. The following are stuff that need special attention:

* **A UI**  
Currently this is not much more than a REST API, which is not very usable.

If you want to contribute just fork this repo, make your own branch, follow current coding style, change/add one feature per commit, and issue a pull request when you're done. Contributors will be credited below.

Thanks to nicoo for this extensible [list of supported Spoitfy commands](http://www.instructables.com/id/RFID-Controls-for-Spotify-on-OSX-using-hacked-Mir/step3/Spotify-osascript-commands/).

[get1]: http://localhost:3000/get/state
[get2]: http://localhost:3000/get/position
[get3]: http://localhost:3000/get/volume
[get4]: http://localhost:3000/get/name
[get5]: http://localhost:3000/get/artist
[get6]: http://localhost:3000/get/album
[get7]: http://localhost:3000/get/duration
[get8]: http://localhost:3000/get/url

[set1]: http://localhost:3000/set/state/pause
[set2]: http://localhost:3000/set/position/200
[set3]: http://localhost:3000/set/volume/50

## License

MIT. Eg. use as you please but don't expect anything and don't remove this notice :)
Oh, and I'd be happy if you tell people it's me (Andreas Hultgren) who built this.