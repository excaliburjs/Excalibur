import toasterCss from './Toaster.css';
export class Toaster {
  private _styleBlock: HTMLStyleElement;
  private _container: HTMLDivElement;
  private _toasterCss: string = toasterCss.toString();
  constructor() {}

  private _isInitialized = false;
  private _initialize() {
    if (!this._isInitialized) {
      this._container = document.createElement('div');
      this._container.id = 'ex-toast-container';
      document.body.appendChild(this._container);
      this._isInitialized = true;

      this._styleBlock = document.createElement('style');
      this._styleBlock.textContent = this._toasterCss;
      document.head.appendChild(this._styleBlock);
    }
  }

  private _createFragment(message: string) {
    let toastMessage = document.createElement('span');
    toastMessage.innerText = message;
    return toastMessage;
  }

  public toast(message: string, linkTarget?: string, linkName?: string) {
    this._initialize();
    var toast = document.createElement('div');
    toast.className = 'ex-toast-message';

    let messageFragments: HTMLElement[] = message.split("[LINK]").map(message => this._createFragment(message));

    if (linkTarget) {
      var link = document.createElement('a');
      link.href = linkTarget;
      if (linkName) {
        link.innerText = linkName;
      } else {
        link.innerText = linkTarget;
      }
      messageFragments.splice(1, 0, link);
    }
    
    // Assembly message
    let finalMessage = document.createElement('div');
    messageFragments.forEach(message => {
      finalMessage.appendChild(message);
    });
    toast.appendChild(finalMessage);

    // Dismiss button
    var dismissBtn = document.createElement('button');
    dismissBtn.innerText = 'x'
    dismissBtn.addEventListener('click', () => {
      this._container.removeChild(toast);
    });
    toast.appendChild(dismissBtn);

    // Escape to dismiss
    let keydownHandler = (evt: KeyboardEvent) => {
      if (evt.key === "Escape") {
        this._container.removeChild(toast)
      }
      document.removeEventListener('keydown', keydownHandler);
    }
    document.addEventListener('keydown', keydownHandler);

    // Insert into container
    var first = this._container.firstChild;
    this._container.insertBefore(toast, first);
  }
}