export type TranscriptorCallback = (msgid: number, text:string, source:string, isfinal:boolean, sttengine: string) => void;
export type StartingCallback = (isstarted:boolean, time:string)=>void;

export interface ITranscriptor {
onReceive( callback:TranscriptorCallback, started:StartingCallback ):void;
stop():void;
}
