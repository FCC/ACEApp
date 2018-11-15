import {IConfigService} from "IConfigService";
import {SipConfig} from "SipConfig";
import {Observer} from "Observer";


export class RemoteConfigSvc implements IConfigService {

    private static KEY = "Configuration";
	
	load(next: (item:SipConfig) => void) {
		$.get("/config","",(config,status)=>{
			next(config);
		},"json");		
	}

    store(item:SipConfig, next: (item: SipConfig) => void) {
        next(item);
	}
	configPassesInspection(config: SipConfig){return true;}
	
	setObserver(observer: Observer){
	}
}
