all: engine sample run
	
engine:
	tsc --declaration ./ts/Game.ts -out ./js/Engine.js -c
sample:
	tsc --module amd ./sample-game/ts/AppStart.ts -c
run:
	start ./sample-game/html/GameStart.html
clean:
	rm ./ts/*.js
	rm ./sample-game/ts/*.js