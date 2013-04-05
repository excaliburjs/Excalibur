del "spec/*.js"
tsc "spec/ActorSpec.ts" -out "spec/ActorSpec.js"
jasmine-node --verbose spec/