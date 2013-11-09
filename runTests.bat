del "spec/*.js"
call tsc "spec/ActorSpec.ts" -out "spec/ActorSpec.js"
call tsc "spec/ColorSpec.ts" -out "spec/ColorSpec.js"
call tsc "spec/PromiseSpec.ts" -out "spec/PromiseSpec.js"
call jasmine-node --verbose spec/