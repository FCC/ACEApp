import {ITranscriptor, TranscriptorCallback, StartingCallback} from "ITranscriptor";

declare var io: Function; // Socket.io

/**
 * This class wraps another Transcriptor, in order to queue and flush messages when the final
 * flag takes too long to be returned.
 */

export class FlushingTranscriptor implements ITranscriptor {
    private timerId:number;
	private countSinceFinal:number;
	private lastmessage:string|null;

    constructor(private delegated_inner: ITranscriptor, private maxDelayInMS:number) {
		this.lastmessage = null;
		this.countSinceFinal = 0;
        this.reset();
	}

    onReceive(transcript_callback:TranscriptorCallback, transcriptionStarted:StartingCallback): void {
        this.delegated_inner.onReceive((msgid:number, message:string, source:string, isfinal:boolean, sttengine:string) => {
				console.log("flush: countSinceFinal = " + this.countSinceFinal);
                if(isfinal) { 
					this.reset();
					console.log("flush: normal final:" + message);
					this.countSinceFinal = 0;
                    transcript_callback(msgid, message, source, isfinal, sttengine);
                } else {
					const flushOnTimeout =  () => 	{
														this.timerId = 0;
														this.countSinceFinal = 0;
														console.log("flush: timed-out: msg='" + this.lastmessage + "' countSinceFinal=" + this.countSinceFinal);
														if (this.lastmessage !== null) {
															transcript_callback(msgid, this.lastmessage, source, true,sttengine); // timeout flush
														}
													};
					this.lastmessage = message;
					if (this.countSinceFinal++ === 0)	{						
						this.timerId = setTimeout( flushOnTimeout, this.maxDelayInMS);
					}else{
						console.log("flush:   queued");
					}
                }
            }, transcriptionStarted);
    }
    startsWith(haystack:string, needle:string, position:number = 0):boolean{
      return haystack.substr(position, needle.length) === needle;
    }
    stop() :void {
        this.delegated_inner.stop();
    }
    reset():void  {
		this.lastmessage = null;
        if(this.timerId !== 0) { 
            clearTimeout(this.timerId); 
            this.timerId = 0;
        }
    }
}
