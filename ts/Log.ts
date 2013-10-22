/**
Copyright (c) 2013 Erik Onarheim
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software
   must display the following acknowledgement:
   This product includes software developed by the ExcaliburJS Team.
4. Neither the name of the creator nor the
   names of its contributors may be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE EXCALIBURJS TEAM ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE EXCALIBURJS TEAM BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSIENSS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

enum Log {
	DEBUG,
	INFO,
	WARN,
	ERROR,
	FATAL
}

interface IAppender {
	log(message : string, level : Log);
}

class ConsoleAppender implements IAppender {
	constructor(){}
	public log(message: string, level: Log){
		if (level < Log.WARN){
			console.log("["+Log[level]+"] : " + message);
		} else if (level < Log.ERROR){
			console.warn("["+Log[level]+"] : " + message);
		} else {
			console.error("["+Log[level]+"] : " + message);
		}
	}
}

class ScreenAppender implements IAppender {
	
	private _messages : string[] = [];
	private canvas : HTMLCanvasElement;
	private ctx : CanvasRenderingContext2D;
	constructor(width? : number, height? : number){
		this.canvas = <HTMLCanvasElement>document.createElement('canvas');
		this.canvas.width = width || window.innerWidth;
		this.canvas.height = height || window.innerHeight;
		this.canvas.style.position = 'absolute';
		this.ctx = this.canvas.getContext('2d');
		document.body.appendChild(this.canvas);
	}

	public log(message: string, level: Log){
		//this.ctx.fillStyle = 'rgba(0,0,0,1.0)';
		this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);


		this._messages.unshift("["+Log[level]+"] : " + message);

		var pos = 10;
		var opacity = 1.0;
		for(var i = 0; i < this._messages.length; i++){
			this.ctx.fillStyle = 'rgba(255,255,255,'+opacity.toFixed(2)+')';
			var message = this._messages[i];
			this.ctx.fillText(message, 200, pos);
			pos += 10;
			opacity = opacity>0?opacity-.05:0;
		}
	}
}

class Logger {
	private static _instance : Logger = null;
	private appenders : IAppender[] = [];
	public defaultLevel : Log = Log.INFO;

	constructor(){
		if(Logger._instance){
			throw new Error("Logger is a singleton");
		}
		Logger._instance = this;
	}

	public static getInstance() : Logger {
		if(Logger._instance == null){
			Logger._instance = new Logger();
		}
		return Logger._instance;
	}

	public addAppender(appender: IAppender){
		this.appenders.push(appender);
	}

	public log(message: string, level?: Log){
		if(level == null){
			level = this.defaultLevel;
		}
		var defaultLevel = this.defaultLevel;
		this.appenders.forEach(function(appender){
			if(level >= defaultLevel){
				appender.log(message, level);
			}
		});
	}
}