all: ./ts/AppStart.ts ./ts/Game.ts
	tsc ./sample-game/ts/AppStart.ts -out ./js/gamestart.js
	start ./sample-game/html/GameStart.html

clean:
	rm ./js/gamestart.js