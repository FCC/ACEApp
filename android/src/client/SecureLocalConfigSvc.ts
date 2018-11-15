import {IConfigService} from "IConfigService";
import {SipConfig} from "SipConfig";
import {Observer} from "Observer";

declare var cordova;

export class SecureLocalConfigSvc implements IConfigService{

    private static KEY = "Configuration";
	private observer;
	
    private ss;
    private APP = 'ACEQUILLAPP';

    constructor(){
        this.ss = new cordova.plugins.SecureStorage(
            function() { console.log('Success'); },
            function(error) { console.log('Error  ' + error); },
            this.APP);
    }
	load(next: (item:SipConfig) => void) {
		var config;

        if (this.ss) {
            this.ss.get( (value:string) =>{
                var creds = JSON.parse(value);

                const s = window.localStorage.getItem(SecureLocalConfigSvc.KEY);
                if(s===null){
                  config = null;
                }else{ //TODO try catch
                  config = JSON.parse(s);
                  if (typeof config.host === 'undefined') { config.host = ''; }
                  if (typeof config.sipport === 'undefined') { config.sipport = ''; }
                  if (typeof config.password === 'undefined') { config.password = ''; }
                  if (typeof config.extension === 'undefined') { config.extension = ''; }
                  config.password = creds.password;
                  config.extension = creds.extension;
                }

				if (!this.configPassesInspection(config))return next(config); 
                console.log("SecureLocalConfigSvc: got " + JSON.stringify(config));
                this.observer.onChanged(config);
                next(config); //OBE?
                }, 
                error => { console.log('SecureLocalConfigSvc: error load secure storage.'); 
					this.observer.onChanged(null);
					next(null); //OBE?
				},
                SecureLocalConfigSvc.KEY);
        }
	}

    store(config:SipConfig, next: (config: SipConfig) => void) {
		
        if (typeof config.host === 'undefined') { console.log("SecureLocalConfigSvc: Set missing host property"); config.host = ''; }
        if (typeof config.sipport === 'undefined') { console.log("SecureLocalConfigSvc: Set missing sipport property");config.sipport = ''; }
        if (typeof config.password === 'undefined') { console.log("SecureLocalConfigSvc: Set missing password property");config.password = ''; }
        if (typeof config.extension === 'undefined') { console.log("SecureLocalConfigSvc: Set missing extension property");config.extension = ''; }

        var creds = { password: config.password, 
                        extension: config.extension };
        delete config.extension;
        delete config.password;

        if(this.ss) {
            this.ss.set(() =>{
                window.localStorage.setItem(SecureLocalConfigSvc.KEY, JSON.stringify(config));

                config.extension = creds.extension;
                config.password = creds.password;
				this.observer.onChanged(config);
                next(config); 
                }, 
                error =>{ console.log('SecureLocalConfigSvc: error setting secure storage.'); },
                SecureLocalConfigSvc.KEY, JSON.stringify(creds));
        }
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
