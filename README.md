Lobby creation flow
user clicks the game type they want to use
Original, Ultimate, etc

each of these has a small settings button if you want to change certain rules.

then the screen moves down to the next section, where they choose if its multiplayer or local, screen then moves down
if its the local type it shows options to put in username for both players
if its multiplayer it asks you if you want tourament mode or not, and lets you put in your username
a button to start the game is visible and the lobby code is shown in multiplayer

- [ ] add setting for 1v1 where you can choose a score goal to win
- [ ] add max users in lobby setting
- [ ] maybe have preset games, like local original 1v1 for ease of use
- [ ] add code enter to the top of the screen
- [ ] make it so you can only change the next and previous elements in the signup, not all


# lobby flow
have a abstract class that has functions for setting and getting various values from the lobby
there can be a local implementation, and a firebase implementation.
this gets listened on with a lobbyrenderer which then updates the web page with the data from the data store

the data handler can expose an event bus where it posts the data it receives, and you can post to this as well
This data handler handles *only* lobby specific data, when a game is created either by recieving or posting an event
a game handler is returned which can then be attached to the game and it then handles the games data

oop im recreating an ECS :p

Enters, page args are passed
if code then
    create the lobby class, and sets the editing permission to false for all the settings except username
    if the lobby is a firebase one it sets up the firebase data handler which then adds itself to the lobby and begins joining process
else
    create the lobby class, set editing perms to true
    if gametype == "firebase" then
    it then runs the lobby creation flow with firebase, creating the various data structures it needs, which then returns the firebase handler. (this can probably be two constructors).
    else
    creates a local event bus, which doesnt do any syncing and just stores the data locally,


