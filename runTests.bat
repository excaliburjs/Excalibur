del "spec/*.js"
call tsc "spec/ActorSpec.ts" -out "spec/ActorSpec.js"
call tsc "spec/ColorSpec.ts" -out "spec/ColorSpec.js"
call tsc "spec/PromiseSpec.ts" -out "spec/PromiseSpec.js"
call tsc "spec/CollectionSpec.ts" -out "spec/CollectionSpec.js"
call tsc "spec/LogSpec.ts" -out "spec/LogSpec.js"
call tsc "spec/ClassSpec.ts" -out "spec/ClassSpec.js"
call tsc "spec/TimerSpec.ts" -out "spec/TimerSpec.js"
call jasmine-node --verbose spec/