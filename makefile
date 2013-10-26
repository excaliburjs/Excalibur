all: engine sample run redist
ci: installdeps tests engine

engine:
	tsc --declaration ./ts/Core.ts -out ./build/Excalibur.js
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
	jasmine-node spec/
redist:
	tar -cvzf GameTS.tar.gz ./build
clean:
	rm -f ./build/*.d.ts
	rm -f ./build/*.js
	rm -f ./sample-game/ts/*.js
	rm -f ./sample-physics-game/ts/*.js
installdeps:
	npm install -g jasmine-node
	npm install -g typescript
	npm -f update -g typescript
