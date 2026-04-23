## game ideas
- uno?
- exploding kittens (probs cant cause license)
  - exploding cactusus - Extremely unique origninal
- guess the number
- poker
- connect 4
- tic tac toe
- checkers
- chess

Looking through all these ideas i feel tic tac toe balances complexity with ease of implementation so i will decide to implement this.
Some extra features i could add in in order to make it more unique include:
- making the board bigger
- different rulesets
- adding a shop system to give players customisation
  - coins from winning
- implement a bot
- timeline of game
- multiple game types
- highscore stored a signed number by all lobby members.
  - when submitting high score, all members of a lobby will submit there scores that they calculated
  - then this is saved in a high score collection, and when displaying a score on a user it selects all the high scores and chooses the one with the most
  of the same number, as this is the one *most likely* to be accurate.

For multiplayer funtionality i will need a data structure to allow this.
I want to make this record each action played so you can show a timeline at the end, and show different stats
Since a database is being used for syncronisation there is no trust for a user, so my security will include full trust
of a `host` user.

Many users can join a lobby and they will run in a tournament style game, where pairs of users will fight
slowly going up the bracket in order to find the true winner. This will require extensive data collection of player
data.

Lobby initialisation flow:
- `host` runs a create function that makes a new collection under `lobbies` this is marked with the following data:
  ```yaml
  begun: bool # this marks wether the game is in play
  private: bool # wether the game is private
  members: # this is a list of members in the lobby
    - user: # this is the uid to the user
        displayName: string # display name for this session
        currentMatch: ref # current match this user is playing in, if null then they are seeking a match
  validationRequests:
    randomid:
      - match: ref # reference to the match needing validation
  matches:
    randomid:
      # list of members in this match
      host: ref # the creating user
      members: ref[]
      invalid:
        - userid:
          - untrusted: bool # wether this user belives this is untrusted, 
      moves:
        # each move is a change to the state, each client has a listener on these
        # moves, when it updates, it checks to make sure this move is valid for the previous state of the game
        # and if it is, updates. more info in VALIDATION
        randomid:
          - user: ref # user making the move
            x: int # x position of placement
            y: int # y positon of piece
  ```
  This by default contains the `host` user. And that user being set on the host. The lobby is then displayed in the lobby selection, unless it is private, if it is private
  the `players` collection cannot be modified, and only the host can add to it.

### validation
Moves are inherently untrusted by the clients in the lobby, as any could lie and modify the gamestate to fit there agenda.

**Move validation**
In a match, either user can add elements to the moves collection, if either user suspects the other is cheating
(this is automated in the algorithm) then they add there match id to `validationRequests` and all clients will then validate the state of that match, if a client doesnt trust this then it adds there uid to the matches `invalid` collection, and when the list of confirmations matches the length of `players`, and the majority belive the user is cheating then **all** clients then ignore that users match moves, (an optimisation is when it doesnt trust it then it just ignores by default) and the other player in that match sets there `currentMatch` attribute to null. Clients should count that match as a draw. Gameplay continues as normal.

### thoughts
having vallidations requests in the members list could be renamed, and the `invalid` collection could be removed since if the users all check and determine cheating then they can just ignore.This would have issues with high score checks as then newer users wouldnt know it was cheated.
Probably a non-issue due to match's not needing to be read

### Possible weakness's
- flooding is possible, where if enough clients join that are malicious they outrun the trusted users
