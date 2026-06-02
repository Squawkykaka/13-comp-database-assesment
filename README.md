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
This data handler handles _only_ lobby specific data, when a game is created either by recieving or posting an event
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
{userid}:
  displayName: string
  quote: string
  wins: number
  loses: number
```
## user (in root users)
```yaml
{userid}:
  displayName: string,
  joinDate: date,
  photoURL: string,
  quote: string,
```

## gamehistory (later feature)
```yaml
gameHistory:
  {gameid}:
    winner: ref
    loser: ref
``` 
