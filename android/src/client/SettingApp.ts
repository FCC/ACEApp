import {IConfigService} from 'IConfigService';
import {ISetting} from 'ISetting';
import {SipConfig} from "SipConfig";

export class SettingApp {
	private currentConfig:SipConfig | null;

	constructor(private configSvc:IConfigService, private setting:ISetting){
		this.currentConfig = null;
	}


    store(item:SipConfig, next: (item: SipConfig) => void) {
        this.configSvc.store(item,next);
	}

	start(){
		
		this.setting.registerEventHandlers();
	}

	getCurrentConfig(){
		return this.currentConfig;
	}

}
