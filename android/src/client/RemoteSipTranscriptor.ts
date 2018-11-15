import {ITranscriptor, TranscriptorCallback} from "ITranscriptor";

class SipData {
    event: string;
    time?: string;
    msgid?:number;
    transcript?:string;
    source?:string;
    final?:boolean;
    sttengine?:string ;
}

interface SipUserAgent{
    start();
    stop();
    register();
    unregister(options?:any);
    registrator():any; 
    call(target, options?:any);
    sendMessage(target:Object|string, body:string, options?:any);
    terminateSessions(options?:any);
    isRegistered():boolean;
    isConnected():boolean;
    get(parameter:string):any;
    set(parameter:string, value:any):boolean;
    on(s:string,callback:(data:SipData) => void);
    };


export class RemoteSipTranscriptor implements ITranscriptor {
    private global:any;	

    constructor(global) {
        this.global = global;
	}

    onReceive(transcript_callback:TranscriptorCallback, transcriptionStarted:(isstarted:boolean, time:string)=>void) {
		console.log("RemoteSipTranscriptor: I'm in remote transciptor onReceive");

        this.global.ua.on('newMessage', (data) => {
            
			if(data.direction === 'outgoing') return;

			var ex;	
            try {
                var msg : SipData = JSON.parse(data.request.body);
            }catch(ex) {
                console.error("RemoteSipTranscriptor: JSON parser error on data.content. Whole Data object is: '" + data + "'");
                msg = {event : "BAD JSON"};
            }
            switch(msg.event) {
            case 'start-call':
                console.log('RemoteSipTranscriptor: Call Started: ' + msg.time);
                var time = msg.time;
                transcriptionStarted(true, time);
                break;
            case 'message-stream':
			    transcript_callback(msg.msgid, msg.transcript, msg.source, msg.final, msg.sttengine); 
                break;
            case 'end-call':
                console.log('RemoteSipTranscriptor: Call Ended: ' + msg.time);
                transcriptionStarted(false, msg.time);
                break;
            default:
                break;
            }			
		});
    }
	
    stop() {
	
    }
	
	reconfigure(config){

        if (config !== null) {
        }
	}
}
