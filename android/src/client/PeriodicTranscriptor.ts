import {ITranscriptor, TranscriptorCallback} from "ITranscriptor";

// Another test dummy for interactive use.

export class PeriodicTranscriptor implements ITranscriptor {
    public timerId:number;

    constructor(public text:string, public count:number, public delayInMS:number){
        this.timerId = 0;
	}

    onReceive(callback:TranscriptorCallback, started) {
        const d = new Date();
        started(true, d.toLocaleString());
		var count = this.count;
		var upcount = 1;

        this.timerId = setInterval(() => {
            count--;
            callback(upcount, this.text + " " + upcount++, 'PSTN', true, 'T'); 
            if (count <= 0) { this.stop(); }
        }, this.delayInMS);
    }
    stop() { 
		if (this.timerId !== 0){
			clearInterval(this.timerId); 
			this.timerId = 0; 
		}
	}
	reconfigure(config){
		
	}
}
