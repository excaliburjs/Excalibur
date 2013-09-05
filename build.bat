tsc --declaration ./ts/Core.ts -out ./js/Engine.js
::if %ERRORLEVEL% EQU 0 call runTests.bat
::if %ERRORLEVEL% EQU 0 tsc ./sample-game/ts/game.ts 
if %ERRORLEVEL% EQU 0 tsc ./sample-physics-game/ts/Game.ts
::if %ERRORLEVEL% EQU 0 start ./sample-game/html/index.html
if %ERRORLEVEL% EQU 0 start ./sample-physics-game/html/index.html