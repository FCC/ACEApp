import {Contact} from 'Contact';
import {ContactListApp} from 'ContactListApp';

export interface IContactList {
	setApp(app:ContactListApp):void;
    setList(list:Array<Contact>):void; // set the whole list at once.
    add(contact:Contact):void;
    update(contact:Contact):void;
    remove(contact:Contact):void;
    getList():Array<Contact>;
	registerEventHandlers():void;
};
