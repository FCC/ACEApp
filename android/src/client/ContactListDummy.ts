import {IContactList} from 'IContactList';
import {Contact} from 'Contact';
import {ContactListApp} from 'ContactListApp';

/* a dummy always returns as near to empty as possible. */
export class ContactListDummy implements IContactList {
	setApp(app:ContactListApp) {}
    setList(list:Array<Contact>) { }
    add(contact:Contact) {}
    update(contact:Contact) {}
    remove(contact:Contact) {}
    getList():Array<Contact> { return []; }
	registerEventHandlers(): void {}
};
