import {ITranscriptor, TranscriptorCallback} from "ITranscriptor";

declare var io: Function; // Socket.io
declare var build_info:{buildnbr:string,gitcommit:string};
declare var gDeviceId:string;

export class RemoteTranscriptor implements ITranscriptor {
	private socket;
    private options;
	private shouldReconnect;
	private extension:string;
	private url:string;
	
    constructor(){
		this.options = {
            reconnection: false,
            reconnectionAttempts : 3,
            reconnectionDelay : 2000,
        };
		this.socket = null;
	}

    onReceive(transcript_callback:TranscriptorCallback, transcriptionStarted:(isstarted:boolean, time:string)=>void) {
		console.log("RemoteTranscriptor: I'm in remote transciptor onReceive");
		console.log(this.socket);
		this.shouldReconnect = true;
		
		this.socket = io(this.url, this.options);
		
		if(this.socket === null) {
			console.log("RemoteTranscriptor: jk im leaving remote transcriptor onReceive");
			return;
		}
		
		this.socket.on('connect', () => {
			console.log("RemoteTranscriptor: onconnect gDeviceId: " + gDeviceId);
			this.socket.emit('register-ext', {extension:this.extension,buildnbr:build_info.buildnbr, gitcommit:build_info.gitcommit, deviceId:gDeviceId});
		});
		
		this.socket.on('start-call', (obj) => {
			console.log('RemoteTranscriptor: Call Started: ' + obj.time);
			var time = obj.time;
			transcriptionStarted(true, time);
		});

        this.socket.on('message-stream', (obj) => { 
			transcript_callback(obj.msgid, obj.transcript, obj.source, obj.final, obj.sttengine); 
		});

		this.socket.on('end-call', (obj) => {
			console.log('RemoteTranscriptor: Call Ended: ' + obj.time);
			var time = obj.time;

			transcriptionStarted(false, time);
		});
		
		this.socket.on('disconnect', () => {
			if(this.shouldReconnect){
				this.socket.open();
				console.log("RemoteTranscriptor: reconnecting while on call");
			}
		});
		
		this.socket.on('connect_timeout', () => {
			if(this.shouldReconnect){
				this.socket.open();
				console.log("RemoteTranscriptor: reconnecting while on connect_timeout");
			}
		});
		
		this.socket.on('connect_error', () => {
			transcript_callback(1, "<b>ERROR</b>", "src", false, "current");
			console.log("RemoteTranscriptor: connection error");
		});
    }
	
    stop() {
		this.shouldReconnect = false;
		if(this.socket){
			this.socket.removeAllListeners("message-stream");
			this.socket.close();
		}
    }
	
	reconfigure(config){
		if(config !== null){
			this.extension = config.extension;
			this.url = 'https://' + config.host + ':' + config.nodeport;
			if(this.socket){this.socket.close();}
			this.socket = io(this.url, this.options);
			console.log("RemoteTranscriptor: config not empty! url: " + this.url);

		}
		console.log("RemoteTranscriptor: in reconfigure");
	}
}
