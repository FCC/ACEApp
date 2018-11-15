import {IContactService} from "IContactService";
import {Contact} from "Contact";

// Implements an "in-memory" contact service" 
export class FakeContactSvc implements IContactService {

	public list:Array<Contact>;
	
	constructor () {
		this.list = [];
	}
	
	
	load(next: (list:Array<Contact>) => void) {
        // do nothing.
		next(this.list);
	}

	store(contacts_list, next) {
		this.list = contacts_list.slice();
		if (next) next();
	}
	

	init() {
		this.clearList();
	}
	
	clearList() {
		this.list = [];
	}
	reconfigure(){}

}

