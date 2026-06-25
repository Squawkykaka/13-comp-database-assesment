Lobby creation flow
user clicks the game type they want to use
Original, Ultimate, etc

# new design idea
When you get to the site you will get to a page with a blank tic-tac-toe board
A circle will appear on a tile that will transform into the text `Sign in` clicking it will popup the google login, then when you login the sign in transforms into a tick, or a cross if it fails will shake and make a red line showing the error. new tiles get drawn for `Join Lobby`, `Create Lobby` and `Sign Out`.

clicking on one will make the computer run moves completing the pattern and then the page navigates to the new link. 
Signing out will undraw all the tiles and go back to login, being red as you lost

Completing a line also flashes a animation over those tiles and makes an animation on the tiles,

You can also click randomly around the login section and draw tiles with it uncovering features, like if your an admin you can find a admin section.

clicking join lobby draws a line where you enter your lobby code.
The creation screen removes the tiles, and puts a text on the background with the various modes, allowing you to select the options.

signing up without previously having an account will allow you to enter various opitons through the tic-tac-ui

## needed information ingame
- The board, and game moves
- who you are fighting
- whos turn it is
  - could be done with a list of moves?
- the ready button (before game start)

## accesable information
- the people in the lobby
  - wins, losses etc
- the lobby settings

## features
- standardises border size
  - 35 pixels
  - keeps consistent look


# old stuff
each of these has a small settings button if you want to change certain rules.



then the screen moves down to the next section, where they choose if its multiplayer or local, screen then moves down
if its the local type it shows options to put in username for both players
if its multiplayer it asks you if you want tourament mode or not, and lets you put in your username
a button to start the game is visible and the lobby code is shown in multiplayer

- [ ] add setting for 1v1 where you can choose a score goal to win
- [ ] add max users in lobby setting
- [ ] maybe have preset games, like local original 1v1 for ease of use
- [x] add code enter to the top of the screen
- [ ] make it so you can only change the next and previous elements in the signup, not all
- [ ] make it so someone leaving a game kicks the other person out
- [ ] make it so activegame updates?

# TODO

- [x] fix incorrectly displayed code when joining from lobby list
- [x] make it so when a lobby is deleted, users get sent to home screen
- [x] fix the activeGame not being reset when manually leaving  lobby
- [ ] change the scoring color based on if you won
- [ ] make the border around the creation options
  - [ ] make the first option selected
- [ ] name the tournament champtionship
- [x] players ready up rather than owner starting the lobby
- [ ] make it so after you finish you can click `ready` then when everyone is ready go onto next round
- [ ] BUG: if the host readys up before anyone else has joined the game can never be started
make it so it displays when a lobby is locked, and allows you to unlock

need to get feedback from user to improve my layout
the banning system currently does not stop people from playing in games
games should be moved under lobbies, and player info should be moved globally along with the removal of firestore

SOmehow artem joined when it was mac vs idriss
The login flow was not at all clear to the teacher

# lobby flow

have a abstract class that has functions for setting and getting various values from the lobby
there can be a local implementation, and a firebase implementation.
this gets listened on with a lobbyrenderer which then updates the web page with the data from the data store

the data handler can expose an event bus where it posts the data it receives, and you can post to this as well
This data handler handles _only_ lobby specific data, when a game is created either by receiving or posting an event
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

# Database Development

Initial root database:

```yaml
users:
  public:
    uid:
      defaultUsername: string <= 15 chars,
      # statistics for each unique game can be set here
      statistics:
        tictactoe:
          wins: number
          losses: number
      profileURL: url,
      bio: string
  private:
    uid:
      realName: string,
      age: number,
  roles:
    # gives whoever is in this list access to the admin page, and roles grant them more edit permissions
    owner: uid[]
games:
  tictactoe:
    lobbys: Lobby[] # look above for the defintion of this
```

# 25/05

Made it so when i press the start game button, it shows the board and you can begin to play

# 26/05 (birthday!)

screenshots and graphics, start dev log
for excellece:
looks good
full evence of design and stuff for one component

programming:
COMMENDTS, works
make a testing table and plan, ALL TYPES
boundry test is edge cases, something like a special case, labeling things properly, maybe vitest can work
quality of testing has most bearing on your grade in programming

today:
make a mockup of what my database will look like, make sure this changes as i develop about 3-4
give some wirframes of page layout, this is where iterative excellee development happens
make some basic vitests tests to show teacher
maybe setup the local firebase testing thingymagig

# 02/06

Ive realised that my ENTIRE way of using firebase is bad and gross
currently i use svelete stores, which i did not understand how they work and are making things difficult
lobbySettings and lobbyMembers are global variables which when i dont magically set them, my game page then breaks when i go to it

i need to fix it.

- When i navigate to the active lobby page, i want it so it shows a loading screen, then behind the scenes connecting / creating the lobby happens
  - firebase data needs a reliable way to be synced to a store, perhaps $effect could be useful
  - stuff needs to not be gross

Ive decided to change the way user information is stored in the database, instead of in a lobby having a reference to a user, it will contain data for that user in the current session

## user (as member)

```yaml
{ userid }:
  displayName: string
  quote: string
  wins: number
  loses: number
```

## user (in root users)

```yaml
{ userid }:
  displayName: string,
  joinDate: date,
  photoURL: string,
  quote: string,
```

## gamehistory (later feature)

```yaml
gameHistory:
  { gameid }:
    winner: ref
    loser: ref
```

# 10/06
Added max length and min length to name form

cleaned up the firebase rule for members, instead of ternary `if locked then data.exists() else true`, this logic is same as the implies operator
`locked -> data.exists()`, since this operator doesnt exist in javascript `!locked || data.exists()` works instead 
