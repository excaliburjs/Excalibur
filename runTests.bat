del "spec/*.js"
tsc "spec/ActorSpec.ts" -out "spec/ActorSpec.js"
tsc "spec/BoxSpec.ts" -out "spec/BoxSpec.js"
jasmine-node --verbose spec/