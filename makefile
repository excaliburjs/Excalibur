all: engine sample run redist
ci: installdeps tests engine

engine:
	grunt
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
	tsc "spec/ColorSpec.ts" -out "spec/ColorSpec.js"
	tsc "spec/PromiseSpec.ts" -out "spec/PromiseSpec.js"
	tsc "spec/CollectionSpec.ts" -out "spec/CollectionSpec.js"
	tsc "spec/LogSpec.ts" -out "spec/LogSpec.js"
tests: build-tests
	jasmine-node spec/
redist:
	tar -cvzf GameTS.tar.gz ./build
clean:
	rm -f ./build/*.d.ts
	rm -f ./build/*.js
	rm -f ./sample-game/ts/*.js
installdeps:
	npm install
	npm -f update -g typescript
	
