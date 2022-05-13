import toasterCss from './Toaster.css';

/**
 * The Toaster is only meant to be called from inside Excalibur to display messages to players
 */
export class Toaster {
  private _styleBlock: HTMLStyleElement;
  private _container: HTMLDivElement;
  private _toasterCss: string = toasterCss.toString();

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

  public dispose() {
    this._container.parentElement.removeChild(this._container);

    this._styleBlock.parentElement.removeChild(this._styleBlock);

    this._isInitialized = false;
  }

  private _createFragment(message: string) {
    const toastMessage = document.createElement('span');
    toastMessage.innerText = message;
    return toastMessage;
  }

  /**
   * Display a toast message to a player
   * @param message Text of the message, messages may have a single "[LINK]" to influence placement
   * @param linkTarget Optionally specify a link location
   * @param linkName Optionally specify a name for that link location
   */
  public toast(message: string, linkTarget?: string, linkName?: string) {
    this._initialize();
    const toast = document.createElement('div');
    toast.className = 'ex-toast-message';

    const messageFragments: HTMLElement[] = message.split('[LINK]').map(message => this._createFragment(message));

    if (linkTarget) {
      const link = document.createElement('a');
      link.href = linkTarget;
      if (linkName) {
        link.innerText = linkName;
      } else {
        link.innerText = linkTarget;
      }
      messageFragments.splice(1, 0, link);
    }

    // Assembly message
    const finalMessage = document.createElement('div');
    messageFragments.forEach(message => {
      finalMessage.appendChild(message);
    });
    toast.appendChild(finalMessage);

    // Dismiss button
    const dismissBtn = document.createElement('button');
    dismissBtn.innerText = 'x';
    dismissBtn.addEventListener('click', () => {
      this._container.removeChild(toast);
    });
    toast.appendChild(dismissBtn);

    // Escape to dismiss
    const keydownHandler = (evt: KeyboardEvent) => {
      if (evt.key === 'Escape') {
        try {
          this._container.removeChild(toast);
        } catch {
          // pass
        }
      }
      document.removeEventListener('keydown', keydownHandler);
    };
    document.addEventListener('keydown', keydownHandler);

    // Insert into container
    const first = this._container.firstChild;
    this._container.insertBefore(toast, first);
  }
}