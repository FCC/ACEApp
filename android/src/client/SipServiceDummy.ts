import { ISipService, dialResponseFunction } from 'ISipService';
import {BaseSipService} from "BaseSipService";
import {ICallState, SIP_State} from "ICallState";

export class SipServiceDummy extends BaseSipService implements ISipService {
    private connected : boolean;
    constructor () {
		super();
	}

    dial(url:string, sc:Function, eh: Function, setKeypadState:(session:string, state:SIP_State) => void) : void{
		
        // TODO: Using phonenum as session. correct at all.
        setKeypadState(url,SIP_State.disconnected);
        this.connected = true;
    }
    dtmf(key:string, next) { 
        console.log("dtmf(" + key + ")");
        next(); 
    }
	hangup(next: dialResponseFunction) {
        console.log("hangup(");
        this.connected = false;
		next(null,SIP_State.disconnected);    
	}
    isConnected() :boolean {
        return this.connected;
    }
	
	reconfigure(config){
		
	}
    toggleMute(cb) {
        
    }
}
