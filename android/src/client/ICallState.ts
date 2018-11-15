// classes that can set the call state.

export enum SIP_State {connecting, connected, disconnected};

export interface ICallState {
	setState(state:SIP_State):void;
    isConnected():boolean;
}
