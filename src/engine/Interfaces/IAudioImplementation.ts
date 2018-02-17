import { Promise } from './../Promises';
import { IAudio } from './IAudio';


export type ExResponseType = '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';

/**
 * Represents an audio implementation like [[AudioTag]] or [[WebAudio]]
 */
export interface IAudioImplementation {

   /**
    * XHR response type
    */
   responseType: ExResponseType;

   /**
    * Processes raw data and transforms into sound data
    */
   processData(data: Blob|ArrayBuffer): Promise<string|AudioBuffer>;

   /**
    * Factory method that returns an instance of a played audio track
    */
   createInstance(data: string|AudioBuffer): IAudio;
}