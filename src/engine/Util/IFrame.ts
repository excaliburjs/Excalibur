/**
 * Checks if excalibur is in a x-origin iframe
 */
export function isCrossOriginIframe() {
  try {
    // Try and listen to events on top window frame if within an iframe.
    //
    // See https://github.com/excaliburjs/Excalibur/issues/1294
    //
    // Attempt to add an event listener, which triggers a DOMException on
    // cross-origin iframes
    const noop = () => {
      return;
    };
    window.top.addEventListener('blur', noop);
    window.top.removeEventListener('blur', noop);
  } catch {
    return true;
  }
  return false;
}
