import {ITranscriptor, TranscriptorCallback} from "ITranscriptor";

// Another test dummy for interactive use.

export class PeriodicFinalizingTranscriptor implements ITranscriptor {
    public timerId:number;
    public finalCount;

    constructor(public text:string, public count:number, public finalizeEveryN:number, public delayInMS:number){
        this.timerId = 0;
        this.finalCount = 0;
	}

    onReceive(callback:TranscriptorCallback, started) {
        const d = new Date();
        started(true, d.toString());
		var count = this.count;
		var upcount = 1;

        this.timerId = setInterval(() => {
            count--;
            const isfinal = (upcount % this.finalizeEveryN === 0);
            callback(this.finalCount, this.text + " " + upcount++, 'PSTN', isfinal, 'T'); 
            if(isfinal) ++this.finalCount;
            if (count <= 0) { this.stop(); }
        }, this.delayInMS);
    }
    stop() { 
		if (this.timerId !== 0){
			clearInterval(this.timerId); 
			this.timerId = 0; 
            this.finalCount = 0;
		}
	}
	reconfigure(config){
		
	}
}
