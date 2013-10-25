call tsc --declaration ./ts/Core.ts -out ./js/Excalibur.js
if %ERRORLEVEL% EQU 0 call tsc ./sample-game/ts/game.ts
if %ERRORLEVEL% EQU 0 start ./sample-game/html/index.html