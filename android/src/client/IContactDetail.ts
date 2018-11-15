import {Contact} from 'Contact';
export interface IContactDetail {
	showDetail(contact: Contact):void;
	registerEventHandlers():void;
	validateDigits(number:string):boolean;
};
