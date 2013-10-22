tsc --declaration ./ts/Core.ts -out ./js/Engine.js
if %ERRORLEVEL% EQU 0 tsc ./sample-game/ts/game.ts
if %ERRORLEVEL% EQU 0 start ./sample-game/html/index.html