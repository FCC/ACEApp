import {SipConfig} from 'SipConfig';

export class Observer{
	
	private objectList = [];

	onChanged(config:SipConfig){
		this.objectList.forEach((x,i)=>{x.reconfigure(config)});
	}
	
	add(that){
		this.objectList.push(that);
	}
}