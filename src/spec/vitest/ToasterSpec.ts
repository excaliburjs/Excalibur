import * as ex from '@excalibur';

describe('A Toaster', () => {
  it('exists', () => {
    expect(ex.Toaster).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new ex.Toaster();
    expect(sut).toBeDefined();
  });

  it('can pop a toast to a user', () => {
    const sut = new ex.Toaster();

    sut.toast('Some Toast Message');

    const toastContainer = document.getElementById('ex-toast-container');

    expect(toastContainer.textContent).toContain('Some Toast Message');
    sut.dispose();
  });

  it('can pop a toast with a link and name', () => {
    const sut = new ex.Toaster();

    sut.toast('Link [LINK]', 'https://excaliburjs.com', 'excalibur-link');

    const toastContainer = document.getElementById('ex-toast-container');

    expect(toastContainer.textContent).toContain('Link');

    expect(toastContainer.textContent).toContain('excalibur-link');

    sut.dispose();
  });

  it('can pop a toast with just a link', () => {
    const sut = new ex.Toaster();

    sut.toast('Link [LINK]', 'https://excaliburjs.com');

    const toastContainer = document.getElementById('ex-toast-container');

    expect(toastContainer.textContent).toContain('Link');

    expect(toastContainer.textContent).toContain('https://excaliburjs.com');

    sut.dispose();
  });

  it('can pop a toast and be dismissed with escape', () => {
    const sut = new ex.Toaster();

    sut.toast('Dismiss');

    const toastContainer = document.getElementById('ex-toast-container');

    expect(toastContainer.textContent).toContain('Dismiss');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(toastContainer.textContent).not.toContain('Dismiss');

    sut.dispose();
  });

  it('can pop a toast and be dismissed with click', () => {
    const sut = new ex.Toaster();

    sut.toast('Dismiss');
    const toastContainer = document.getElementById('ex-toast-container');

    expect(toastContainer.textContent).toContain('Dismiss');

    const toastButton = toastContainer.getElementsByTagName('button')[0];

    expect(toastButton.textContent).toContain('x');

    toastButton.click();

    const toastMessageGone = document.getElementById('ex-toast-container');

    expect(toastMessageGone.textContent).not.toContain('Dismiss');

    sut.dispose();
  });
});
