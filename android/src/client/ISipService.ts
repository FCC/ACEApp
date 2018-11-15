import {SIP_State, ICallState} from 'ICallState';
export type dialResponseFunction = (sessionid:string|null, state:SIP_State) => void;

export interface ISipService {
    dial(phonenum: string, statusChanger:Function, errorHandler: Function, next: dialResponseFunction):void ;
    hangup(next:dialResponseFunction):void ;
    dtmf(key:string, next:Function):void;
	setCallState(app:ICallState):void;
	isConnected():boolean;
    toggleMute(cb:(isMuted:boolean)=>void) : void;
}
