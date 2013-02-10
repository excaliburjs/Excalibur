all: engine sample run

engine:
	tsc --declarations ./ts/Game.ts -out ./js/Engine.js -c
sample:
	tsc ./sample-game/ts/AppStart.ts -c
run:
	start ./sample-game/html/GameStart.html
clean:
	rm -f ./js/*.js
	rm -f ./js/*.d.ts
	rm -f ./sample-game/ts/*.js