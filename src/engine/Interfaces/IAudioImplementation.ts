import { Promise } from './../Promises';
import { IAudio } from './IAudio';

export type ExResponseType = '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';

export interface IExResponseTypesLookup {
  [name: string]: ExResponseType;
}

export class ExResponse {
  public static type: IExResponseTypesLookup = {
    any: '',
    blob: 'blob',
    json: 'json',
    text: 'text',
    document: 'document',
    arraybuffer: 'arraybuffer'
  };
}

/**
 * Represents an audio implementation like [[AudioTagInstance]] or [[WebAudioInstance]]
 */
export interface IAudioImplementation {
  /**
   * XHR response type
   */
  responseType: ExResponseType;

  /**
   * Processes raw data and transforms into sound data
   */
  processData(data: Blob | ArrayBuffer): Promise<string | AudioBuffer>;

  /**
   * Factory method that returns an instance of a played audio track
   */
  createInstance(data: string | AudioBuffer): IAudio;
}
