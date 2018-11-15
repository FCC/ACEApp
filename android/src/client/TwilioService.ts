import {ISipService,dialResponseFunction} from 'ISipService';
import {ICallState} from 'ICallState';
import {BaseSipService} from 'BaseSipService';

declare var Twilio:any;

export class TwilioService extends BaseSipService implements ISipService{
    private connected : boolean;
	constructor(){
		super();
        this.connected = false;
	};

	registerEventHandler(){
		$.getJSON('/token')
			.done(function (data) {
			  console.log('Token: ' + data.token);

			  // Setup Twilio.Device
			  Twilio.Device.setup(data.token);

			  Twilio.Device.ready(function (device) {
				document.getElementById('call-controls').style.display = 'block';
			  });

			  Twilio.Device.error(function (error) {
			  });

			  Twilio.Device.connect(function (conn) {
                this.connected = true;

			  });

			  Twilio.Device.disconnect(function (conn) {
                this.connected = false;

			  });

			  Twilio.Device.incoming(function (conn) {
                this.connected = true;
				var archEnemyPhoneNumber = '+12099517118';

				if (conn.parameters.From === archEnemyPhoneNumber) {
				  conn.reject();
				} else {
				  conn.accept();

				}
			  });

			})
			.fail(function () {
			  });
	}
		
	dial(phone:string, statusChanger: Function, eh:Function, next:dialResponseFunction) {
		Twilio.Device.connect({To:phone});
	}
    dtmf(key:string, next) {
        throw "Unimplemented DTMF function in TwillioService.ts";
    }
	
	hangup(next:dialResponseFunction) {
		Twilio.Device.disconnectAll();
	}

    isConnected() : boolean{
        return true;
    }
    toggleMute(cb) {
        throw "Unimplemented ToggleMute function in TwillioService.ts";
    }
	
}
