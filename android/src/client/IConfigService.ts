import {SipConfig} from 'SipConfig';
import {Observer} from 'Observer';

/**
 * The configuration service will provide required configuration settings
 * for enable SIP communications.
 */

export interface IConfigService {
	setObserver(observer: Observer):void;
    store(item : SipConfig, next: (list: SipConfig) => void):void;
    load(next : (item : SipConfig) => void):void;
	configPassesInspection(config: SipConfig):boolean;
};
