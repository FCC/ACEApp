import {IConfigService} from "IConfigService";
import {SipConfig} from "SipConfig";
import {Observer} from "Observer";

export class LocalConfigSvc implements IConfigService{

    private static KEY = "Configuration";
	private observer;
	
	load(next: (item:SipConfig) => void) {
		var config;

		const s = window.localStorage.getItem(LocalConfigSvc.KEY);
			if(s===null){
		  config = null;
		}else{
		  config = JSON.parse(s);
		  if (typeof config.host === 'undefined') { config.host = ''; }
		  if (typeof config.sipport === 'undefined') { config.sipport = ''; }
		  if (typeof config.password === 'undefined') { config.password = ''; }
		  if (typeof config.extension === 'undefined') { config.extension = ''; }
		}

		console.log("LocalConfigSvc: got " + JSON.stringify(config));
		if (!this.configPassesInspection(config))return next(config); 

		this.observer.onChanged(config);

		next(config);
	}

    store(config:SipConfig, next: (config: SipConfig) => void) {
        console.log("Warning: Using insecure local storage.");
        console.log("LocalConfigSvc: storing " + JSON.stringify(config));
		
        if (typeof config.host === 'undefined') { console.log("LocalConfigSvc: Set missing host property"); config.host = ''; }
        if (typeof config.sipport === 'undefined') { console.log("LocalConfigSvc: Set missing sipport property");config.sipport = ''; }
        if (typeof config.password === 'undefined') { console.log("LocalConfigSvc: Set missing password property");config.password = ''; }
        if (typeof config.extension === 'undefined') { console.log("LocalConfigSvc: Set missing extension property");config.extension = ''; }
        window.localStorage.setItem(LocalConfigSvc.KEY, JSON.stringify(config));
		
		this.observer.onChanged(config);

        next(config); 
	}
	
	configPassesInspection(config: SipConfig){
		if(config.host === '') return false;
		if(config.sipport === '') return false;
		if(config.extension=== '') return false;
		if(config.password	=== '') return false;
	
		return true;
	}

	setObserver(observer: Observer){
		this.observer = observer;
	}
}
