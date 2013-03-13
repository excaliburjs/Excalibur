all: engine sample run redist
	
engine:
	tsc --declaration ./ts/Core.ts -out ./js/Engine.js -c
sample:
	tsc ./sample-game/ts/AppStart.ts -c
run:
	start ./sample-game/html/GameStart.html
redist:
	tar -cvzf GameTS.tar.gz ./js
clean:
	rm -f ./js/*.d.ts
	rm -f ./js/*.js
	rm -f ./sample-game/ts/*.js
installdeps:
	npm install -g typescript
	npm -f update -g typescript
