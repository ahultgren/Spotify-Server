# Spotify Server

Get your own spotify web-based remote controller and let the whole team (or just you) choose what Spotify is playing in the office speakers, right in the browser!

Have you ever been in an office or to a party where music is playing in the speakers, and there's one self-appointed music-fürher that controls the music? Or perhaps you want to be that fürher yourself, but you can't be assed to go all the way to the machine playing music. Maybe you're just tired of huddling around the computer competing to queue the most tracks.

Spotify Server is the solution to all this, and a variety of other problems. You will no longer have to huddle with your friends around the computer while competing about queuing the most songs. You can secretly manipulate the playlist while you lounge in your very comfortable armchair. You could even put a big screen in the middle of the living room, showing what is currently played.

## Current features
* See what's playing (name, artists, album, duration, player state, player position, and whether shuffling or repeating or not)
* Play or pause
* Play a specific track by URI
* Play a specific track in a specific playlist
* Play previous/next track
* Queue tracks
* Set volume (though currently not allowed in Spotify API) and position
* All this is a slick user interface

## Planned features
* Vote to change track!
* Display play queue
* Vote to change track
* Vote to order queued tracks
* Chat with admin or other listeners
* More fine-grained permissions system

## Installation

You must have node.js and npm installed to run this app. You also need Spotify (of course) and the [Spotify Slave](https://github.com/ahultgren/Spotify-Slave) app installed to be able to actually control Spotify.

* Clone this repo  
    `$ git clone git://github.com/ahultgren/Spotify-Server.git`
* Enter the created directory  
    `$ cd spotify-server`
* Install dependencies  
    `$ npm install`
* Make sure you have the [Spotify Slave](https://github.com/ahultgren/Spotify-Slave) app installed  
* Start the server  
    `$ node web.js`

Then try it out by visiting [http://localhost:3000](http://localhost:3000)

## Contribution

Contributions are very much appreciated. If you want to contribute just fork this repo, make your own branch, follow current coding style, change/add one feature per commit, and issue a pull request when you're done. Contributors will be credited below.

## License

**MIT**  
Eg. use as you please but don't expect anything and don't remove this notice :)
Oh, and I'd be happy if you tell people it's me (Andreas Hultgren) who built this.