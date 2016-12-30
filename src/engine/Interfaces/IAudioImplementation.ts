import { Promise } from './../Promises';
import { IAudio } from './IAudio';

/**
 * Represents an audio implementation like [[AudioTag]] or [[WebAudio]]
 */
export interface IAudioImplementation {

   /**
    * XHR response type
    */
   responseType: string;

   /**
    * Processes raw data and transforms into sound data
    */
   processData(data: Blob|ArrayBuffer): Promise<string|AudioBuffer>;

   /**
    * Factory method that returns an instance of a played audio track
    */
   createInstance(data: string|AudioBuffer): IAudio;
}