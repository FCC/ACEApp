import {Contact} from 'Contact';
import {IApp} from 'IApp';
import {ITranscriptor} from 'ITranscriptor';
import {ISipService} from 'ISipService';
import {IKeypad} from 'IKeypad';
import {ICallState, SIP_State} from 'ICallState';
import {IDialer} from 'IDialer';

export class CallApp implements IApp, ICallState, IDialer {

    constructor(
                private keypad:IKeypad,
                private sipsvc:ISipService,
                private transcriptor:ITranscriptor
                ) {
                }

	start() {
		this.keypad.registerEventHandlers();
		this.keypad.connectTo(this);
	}

	onReceive( cb: (msgid:number, text:string, source:string, isfinal:boolean, sttengine: string) => void) {
		this.transcriptor.onReceive(cb, (bool, time) => {
				console.log("start receiving");
 				this.keypad.showTranscriptionState(bool, 'start time: ' + time);
		});
	}

	showNumber(number:string){
		this.keypad.setInputText(number);
	}

    dial(phone:string, next) {
        this.sipsvc.dial(phone,
                (state:SIP_State) => {
                    this.setState(state);
                },
                () => { this.hangup(null); },
                next);
    }

    dtmf(key:string, next) {
        this.sipsvc.dtmf(key, next);
    }

    isConnected():boolean {
        return this.sipsvc.isConnected();
    }

    hangup(next)
    {
		console.log("CallApp: hangup")
		this.transcriptor.stop();
        this.sipsvc.hangup( () => { });
    }

    // set visual indicator on keypad of call state.
    setState(state:SIP_State):void
    {
        this.keypad.setState(state);
    }

    toggleMute(cb:(isMuted:boolean) => void) {
        this.sipsvc.toggleMute(cb); 
    }

};
