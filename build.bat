call tsc --declaration ./ts/Core.ts -out ./build/Excalibur.js
call tools\nuget pack Excalibur.nuspec -OutputDirectory ./build
if %ERRORLEVEL% EQU 0 call tsc ./sample-game/ts/game.ts
if %ERRORLEVEL% EQU 0 start ./sample-game/html/index.html