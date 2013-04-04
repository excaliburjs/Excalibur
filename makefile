all: engine sample physics run redist
	
engine:
	tsc --declaration ./ts/Core.ts -out ./js/Engine.js -c
sample:
	tsc ./sample-game/ts/AppStart.ts -c
physics:
	tsc ./sample-physics-game/ts/Game.ts -c
run:
	/opt/google/chrome/google-chrome ./sample-game/html/GameStart.html&
	/opt/google/chrome/google-chrome ./sample-physics-game/html/index.html&
tests:
	jasmine-node ./tests/spec/
redist:
	tar -cvzf GameTS.tar.gz ./js
clean:
	rm -f ./js/*.d.ts
	rm -f ./js/*.js
	rm -f ./sample-game/ts/*.js
	rm -f ./sample-physics-game/ts/*.js
installdeps:
	npm install -g jasmine-node
	npm install -g typescript
	npm -f update -g typescript
