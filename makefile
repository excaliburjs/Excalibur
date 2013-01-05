all: ./ts/AppStart.ts ./ts/Game.ts
	tsc ./ts/AppStart.ts -out ./ts/gamestart.js
	start ./html/GameStart.html