export interface IDialer {
	dial(phone:string, next: Function);
	hangup(next: Function);
	dtmf(key:string, next: Function);
	isConnected():boolean;
	onReceive( callback: (msgid:number, text:string, source:string, isfinal:boolean, sttengine: string) => void);
    toggleMute(callback: (isMuted:boolean) => void);
}
