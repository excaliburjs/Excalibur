tsc --declaration ./ts/Core.ts -out ./js/Engine.js -c
if %ERRORLEVEL% EQU 0 tsc ./sample-game/ts/AppStart.ts -c
if %ERRORLEVEL% EQU 0 tsc ./sample-physics-game/ts/Game.ts -c
if %ERRORLEVEL% EQU 0 start ./sample-game/html/GameStart.html
if %ERRORLEVEL% EQU 0 start ./sample-physics-game/html/index.html
