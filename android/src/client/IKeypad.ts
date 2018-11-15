/**
 * the keypad will call the Dialer with a phone number.
 * once it is fully typed in.
 * Once the app is dialing, it will set the state of the keypad to reflect the state of the call.
 */
import {ICallState} from 'ICallState';
import {IDialer} from 'IDialer';
import {SIP_State} from 'ICallState';

export interface IKeypad extends ICallState {
    registerEventHandlers():void;
	setInputText(number:string):void;
    reset():void;
	connectTo(dialer:IDialer);
	closeCallScreen():void;
	openCallScreen(state:SIP_State):void;
	show():void;
	hide():void;
    showTranscriptionState(onoff:boolean, message:string):void;
};
