import {ITranscriptor, TranscriptorCallback} from "ITranscriptor";

export class TranscriptorDummy implements ITranscriptor {
    constructor(public text:string){
	}
    onReceive(callback:TranscriptorCallback, started) {
        const d = new Date();
        started(d.toLocaleString());
        callback(0, this.text, 'PSTN', true, 'T'); // immediate callback.
    }
    stop() { ; } // do nothing.
	reconfigure(config){
		
	}
}
