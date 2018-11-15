import {Contact} from "Contact";
import {History} from "History";
import {Setting} from "Setting";
import {SipConfig} from "SipConfig";
import {Observer} from "Observer";

// UI
import {ContactList} from "ContactList";
import {CardUI} from "CardUI";
import {HistoryList} from "HistoryList";
import {Keypad} from "Keypad";
import {TranscriptorDummy} from "TranscriptorDummy";
import {PeriodicTranscriptor} from "PeriodicTranscriptor";
import {PeriodicFinalizingTranscriptor} from "PeriodicFinalizingTranscriptor";
import {FlushingTranscriptor} from "FlushingTranscriptor";
// import {RemoteTranscriptor} from "RemoteTranscriptor";
import {RemoteSipTranscriptor} from "RemoteSipTranscriptor";
import {ContactDetail} from "ContactDetail";
import {ITranscriptor} from "ITranscriptor";
import {HistoryDetail} from "HistoryDetail";

// Apps
import {CallApp} from "CallApp";
import {HistoryListApp} from "HistoryListApp";
import {ContactListApp} from "ContactListApp";
import {SettingApp} from "SettingApp";

// Services
import {SipServiceFactory} from "SipServiceFactory";
import {SecureLocalConfigSvc} from "SecureLocalConfigSvc";
import {LocalConfigSvc} from "LocalConfigSvc";
import {RemoteConfigSvc} from "RemoteConfigSvc";
import {FakeContactSvc} from "FakeContactSvc";
import {FakeHistSvc} from "FakeHistSvc";

declare var gDeviceId:any; // see index.ejs for declaration.
declare var device:any; // this is a Cordova object.
declare var configSvc:any;

const observer = new Observer();

//*****
window['isCordova'] = false;     // DO NOT CHANGE LINE IN ANY WAY! HOT PATCHED BY GULP.
//*****
function run()
{
    var global = {
        ua: null  // contains shared SIP user agent
        };

	const testWithoutServer = false;
	const cardui = new CardUI();

    if (window['isCordova']) {
        if(typeof device === 'undefined') {
            gDeviceId = 'unknown_device';
    		configSvc = new LocalConfigSvc();
        }else {
            gDeviceId = device.uuid;
            configSvc = new SecureLocalConfigSvc();
        }
    }else{
		gDeviceId = 'non-mobile_device';
		configSvc = new LocalConfigSvc();
	}
	
	configSvc.setObserver(observer);
	
	const setting = new Setting(cardui);
	const settingApp = new SettingApp(configSvc,setting);
	setting.setApp(settingApp);

	settingApp.start();

	var sipsvc;        
	var trans:ITranscriptor;
	if(testWithoutServer) {
		sipsvc  = SipServiceFactory.createSipServiceDummy();
		
		let count = 8, delayInMS = 1000, finalEvery = 4, maxDelay = 6000;
		trans = new PeriodicFinalizingTranscriptor('Message #', count, finalEvery, delayInMS);
	} else {
		sipsvc  = SipServiceFactory.createSipService(global);
		trans = new RemoteSipTranscriptor(global);
	}
	
	const keypad  = new Keypad(cardui);
	const callApp = new CallApp(keypad,sipsvc,trans);
	sipsvc.setCallState(callApp);

	callApp.start();
	
/*THIS MUST STAY IN THIS ORDER BECAUSE OF SHARED global_ua*/
	observer.add(sipsvc); 
	observer.add(trans);  
/******************************/
	
	const cd		= new ContactDetail(cardui);

	setUpInitialContactList(callApp,cardui,cd);
	setUpInitialHistoryList(callApp,cardui,cd);
	
	configSvc.load(config => {
			if (config === null || !configSvc.configPassesInspection(config)) {
				if(config !== null) setting.setConfig(config);

				setting.show();
			}else{
				cardui.expose("historyCard");
				console.log("Initial config " + config);
				setting.setConfig(config);
			}
	});
}
if (window['isCordova']) {
    document.addEventListener('deviceready', run, false);
}else{
    run();
}

function setUpInitialContactList(callApp,cardui,cd){
	const cl      = new ContactList(cardui);
	const cs		= new FakeContactSvc();

	cd.setCallApp(callApp);

	cs.list =  [
		{
		id           : 1,
		username     : "Bob",
		first_name   : "Robert",
		last_name    : "Bedford",
		home_number  : "777-888-9999",
		mobile_number: "888-888-8888",
		work_number  : "999-999-9999",
		favorite     : true
		},
		{
		id           : 2,
		username     : "Burt",
		first_name   : "Robert",
		last_name    : "Amherst",
		home_number  : "777-888-9999",
		mobile_number: "888-888-8888",
		work_number  : "999-999-9999",
		favorite     : false
		},
		{
		id           : 3,
		username     : "Gordy",
		first_name   : "Gordon",
		last_name    : "Boston",
		home_number  : "777-888-9999",
		mobile_number: "888-888-8888",
		work_number  : "999-999-9999",
		favorite     : true
		}
		];

	const contactListApp = new ContactListApp(cl, cs, cd);
	cl.setApp(contactListApp);
	contactListApp.start();
	cd.setContactListApp(contactListApp);
	
	observer.add(cs);
}

function setUpInitialHistoryList(callApp,cardui,cd){
	const hl      = new HistoryList(cardui);
	const hs		= new FakeHistSvc();
	const hd		= new HistoryDetail(cardui);
	hs.list =  [
			{ id: 11,
			contact: {
				id           : 1,
				username     : "Bob",
				first_name   : "Robert",
				last_name    : "Bedford",
				home_number  : "777-888-9999",
				mobile_number: "888-888-8888",
				work_number  : "999-999-9999",
				favorite     : true
				},
			cptText: ["*No prior caption"],
			startTime: 0,
			endTime: 0
			},
			{ id: 22,
				contact :{
				id           : 2,
				username     : "Burt",
				first_name   : "Robert",
				last_name    : "Amherst",
				home_number  : "777-888-9999",
				mobile_number: "888-888-8888",
				work_number  : "999-999-9999",
				favorite     : false
				},
			cptText: ["*No prior caption*"],
			startTime: 0,
			endTime: 0
			},
			{ id: 33,
				contact: {
				id           : 3,
				username     : "Gordy",
				first_name   : "Gordon",
				last_name    : "Boston",
				home_number  : "777-888-9999",
				mobile_number: "888-888-8888",
				work_number  : "999-999-9999",
				favorite     : true
				},
			cptText: ["*No prior caption*"],
			startTime: 0,
			endTime: 0
			}
		];
	const historyApp = new HistoryListApp(hl,hs,cd,hd);
	hl.setApp(historyApp);
	historyApp.start();
	
	observer.add(hs);
}


