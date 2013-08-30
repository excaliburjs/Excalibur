all: engine sample run redist
	
engine:
	tsc --declaration ./ts/Core.ts -out ./js/Engine.js
sample:
	tsc ./sample-game/ts/game.ts
physics:
	tsc ./sample-physics-game/ts/game.ts
run:
	/opt/google/chrome/google-chrome ./sample-game/html/index.html&
	/opt/google/chrome/google-chrome ./sample-physics-game/html/index.html&
build-tests:
	rm -rf "spec/*.js"
	tsc "spec/ActorSpec.ts" -out "spec/ActorSpec.js"
tests: build-tests
	jasmine-node /spec/
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
