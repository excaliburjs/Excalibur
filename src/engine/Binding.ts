/// <reference path="Promises.ts" />
/// <reference path="Loader.ts" />
/// <reference path="Log.ts" />


module ex {
  
   /**
    * Excalibur's built in templating class, it is a loadable that will load
    * and html fragment from a url. Excalibur templating is very basic only
    * allowing bindings of the type `data-text="this.obj.someprop"`, 
    * `data-style="color:this.obj.color.toString()"`. Bindings allow all valid
    * Javascript expressions.
    */
   export class Template implements ILoadable {
      private _htmlString: string;
      private _styleElements: NodeList;
      private _textElements: NodeList;
      private _innerElement: HTMLElement;
      private _isLoaded: boolean = false;
      private _engine: Engine;
      public logger: Logger = Logger.getInstance();

      /**
       * @param path  Location of the html template
       */
      constructor(public path: string) {
         this._innerElement = document.createElement('div');
         this._innerElement.className = 'excalibur-template';
      }

      public wireEngine(engine: Engine) {
         this._engine = engine;
      }

      /**
       * Returns the full html template string once loaded.
       */
      public getTemplateString() {
         if (!this._isLoaded) {return ''; }
         return this._htmlString;
      }

      private _compile() {
         this._innerElement.innerHTML = this._htmlString;
         this._styleElements = this._innerElement.querySelectorAll('[data-style]');
         this._textElements = this._innerElement.querySelectorAll('[data-text]');
      }
      private _evaluateExpresion(expression, ctx) {
         var func = new Function('return ' + expression + ';');
         var val = func.call(ctx);
         return val;
      }

      /**
       * Applies any ctx object you wish and evaluates the template.
       * Overload this method to include your favorite template library.
       * You may return either an HTML string or a Dom node.
       * @param ctx Any object you wish to apply to the template
       */
      public apply(ctx: any): any {
         /* tslint:disable:no-string-literal */
         for(var j = 0; j < this._styleElements.length; j++) {
            (() => {
               // poor man's json parse for things that aren't exactly json :(
               // Extract style expressions
               var styles = {};
               (<HTMLElement>this._styleElements[j]).dataset['style'].split(';').forEach(function(s) {
                  if(s) {
                     var vals = s.split(':');
                     styles[vals[0].trim()] = vals[1].trim();
                  }
               });

               // Evaluate parsed style expressions
               for(var style in styles) {
                  (() => {
                     var expression = styles[style];
                     (<HTMLElement>this._styleElements[j]).style[style] = this._evaluateExpresion(expression, ctx);
                  })();
               }         
            })();      
         }
         for(var i = 0; i < this._textElements.length; i++) {
            (() => {
               // Evaluate text expressions
               var expression = (<HTMLElement>this._textElements[i]).dataset['text'];
               (<HTMLElement>this._textElements[i]).innerText = this._evaluateExpresion(expression, ctx);
            })();
         }

         // If the template HTML has a root element return that, otherwise use constructed root
         if(this._innerElement.children.length === 1) {
            this._innerElement = (<HTMLElement>this._innerElement.firstChild);
         }
         /* tslint:enable:no-string-literal */
         return this._innerElement;
      }

      /**
       * Begins loading the template. Returns a promise that resolves with the template string when loaded.
       */
      public load(): ex.Promise<string> {
         var complete = new ex.Promise<string>();
         
         var request = new XMLHttpRequest();
         request.open('GET', this.path, true);
         request.responseType = 'text';
         request.onprogress = this.onprogress;
         request.onerror = this.onerror;
         request.onload = (e) => {
            if(request.status !== 200) {
               this.logger.error('Failed to load html template resource ', this.path, ' server responded with error code', request.status);
               this.onerror(request.response);
               this._isLoaded = false;
               complete.resolve('error');
               return;
            }
            this._htmlString = request.response;
            this.oncomplete();
            this.logger.debug('Completed loading template', this.path);
            this._compile();
            this._isLoaded = true;
            complete.resolve(this._htmlString);
         };
         if(request.overrideMimeType) {
            request.overrideMimeType('text/plain; charset=x-user-defined');
         }
         request.send();

         return complete;
      }

      /**
       * Indicates whether the template has been loaded
       */
      public isLoaded(): boolean {
         return this._isLoaded;
      }


      public onprogress: (e: any) => void = () => { return; };

      public oncomplete: () => void = () => { return; };

      public onerror: (e: any) => void = () => { return; };


   }

   /**
    * Excalibur's binding library that allows you to bind an html
    * template to the dom given a certain context. Excalibur bindings are only updated
    * when the update() method is called
    */
   export class Binding {
      public parent: HTMLElement;
      public template: Template;
      private _renderedTemplate: string;
      private _ctx: any;

      /**
       * @param parentElementId  The id of the element in the dom to attach the template binding
       * @param template         The template you wish to bind
       * @param ctx              The context of the binding, which can be any object
       */
      constructor(parentElementId: string, template: Template, ctx: any) {
         this.parent = document.getElementById(parentElementId);
         this.template = template;
         this._ctx = ctx;
         this.update();
      }

      /**
       * Listen to any arbitrary object's events to update this binding
       * @param obj     Any object that supports addEventListener
       * @param events  A list of events to listen for
       * @param handler A optional handler to fire on any event
       */
      public listen(obj: {addEventListener: any}, events: string[], handler?: (evt?: GameEvent) => void) {
         // todo
         if(!handler) {
            handler = () => {
               this.update();
            };
         }

         if(obj.addEventListener) {
            events.forEach((e) => {
               obj.addEventListener(e, handler);
            });
         }
      }

      /**
       * Update this template binding with the latest values from 
       * the ctx reference passed to the constructor
       */
      public update() {
         var html = this._applyTemplate(this.template, this._ctx);
         if(html instanceof String) {
            this.parent.innerHTML = html;
         }
         if(html instanceof Node) {
            if(this.parent.lastChild !== html) {
               this.parent.appendChild(html);
            }
         }
      }

      private _applyTemplate(template: Template, ctx: any): any {
         if(template.isLoaded()) {
            return template.apply(ctx);
         }
      }
   }
}
