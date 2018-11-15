import {SettingApp} from 'SettingApp';
import {SipConfig} from 'SipConfig';
export interface ISetting {
	setApp(app:SettingApp):void;
	registerEventHandlers():void;
	setConfig(config:SipConfig):void;
	show(next:()=>void):void;
};
