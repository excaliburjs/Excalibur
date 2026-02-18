import { Logger } from './log';

/**
 * Whether or not the browser can play this file as HTML5 Audio
 */
export function canPlayFile(file: string): boolean {
  try {
    const a = new Audio();
    const filetype = /.*\.([A-Za-z0-9]+)(?=[?#]|$)/;
    const type = file.match(filetype)[1];
    if (a.canPlayType('audio/' + type)) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    Logger.getInstance().warn('Cannot determine audio support, assuming no support for the Audio Tag', e);
    return false;
  }
}

export function canPlayMime(mime: string): boolean {
  try {
    const a = new Audio();
    const mimeMatch = /.*audio\/([A-Za-z0-9]+);?/;
    const extractedMime = mime.match(mimeMatch)[1];
    if (a.canPlayType(`audio/${extractedMime}`)) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    Logger.getInstance().warn('Cannot determine audio support via blob mime type.', e)
    return false
  }
}
