import {SipService} from 'SipService';
import {SipServiceDummy} from 'SipServiceDummy';
import {TwilioService} from 'TwilioService';
import {ISipService} from 'ISipService';
import {SipConfig} from 'SipConfig';

declare var JsSIP:any;  // TODO: Add JSSIP library declarations. For now, this is sufficient.

export class SipServiceFactory {

	static createSipService(global):ISipService|null {
	
		return new SipService(global);
		
	}


	static createSipServiceDummy():ISipService {
		return new SipServiceDummy();
	}

	static createTwilioService():ISipService {
		return new TwilioService();
	}


}
