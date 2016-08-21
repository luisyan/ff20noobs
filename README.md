# ff20noobs
League of legends - website to check in-game status

Start on Aug.19, 2016

To start development, you need to install:
  1. Git
  2. Node.js

Installation
  1. git clone [git@github.com:luisyan/ff20noobs.git](https://github.com/luisyan/ff20noobs)
  2. npm install
  3. npm install supervisor -g (auto reload code for development)

Run
  supervisor app.js
  
Available API: (update to Aug 21)
(put /api before each api)

1. get featured game: GET /featured
2. get player info by id: GET /player?{name}&[region]
3. get current game by player name: GET /current?{name}

Test with browser:
(Default port is set to 16000)
http://localhost:16000/api/...

ff20

  

  
