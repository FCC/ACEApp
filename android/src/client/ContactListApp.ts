import {Contact} from 'Contact';
import {IApp} from 'IApp';
import {IContactList} from 'IContactList';
import {IContactService} from 'IContactService';
import {IContactDetail} from 'IContactDetail';

export class ContactListApp implements IApp{
    constructor(private contactlist:IContactList, 
                private contactsvc:IContactService,
				private contactdetail: IContactDetail) {
    }

	start() : void{
		this.contactlist.registerEventHandlers();
		this.contactdetail.registerEventHandlers();
		// get the initial contact list and post it to the page.
       	this.contactsvc.load( list => { this.contactlist.setList(list); } );
	}

    store(list:Array<Contact>, next) : void{
        this.contactsvc.store(list, next);
    }

	showDetail(contact: Contact) : void{
		this.contactdetail.showDetail(contact);
	}
	
	updateContact(contact:Contact) : void{
		var list = this.contactlist.getList();
		list.forEach((x,i) => {
			if(x.username === contact.username){
				list[i] = contact;
			}
		});
		this.contactlist.setList(list);
	}		
	
};
