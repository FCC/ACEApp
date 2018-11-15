
import {IContactService} from "IContactService";
import {Contact} from "Contact";

export class LocalContactSvc implements IContactService {

    private static KEY = "ContactList";
	
	reconfigure(config){
		
	}
	
	load(next: (list:Array<Contact>) => void) {
        const s = window.localStorage.getItem(LocalContactSvc.KEY);
        next((s === null)? [] : JSON.parse(s));
	}

    store(contacts_list:Array<Contact>, next: (list: Array<Contact>) => void) {
        window.localStorage.setItem(LocalContactSvc.KEY, JSON.stringify(contacts_list));

        next(contacts_list);
	}

}
