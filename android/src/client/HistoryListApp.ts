import {Contact} from 'Contact';
import {IApp} from 'IApp';
import {History} from 'History';
import {IContactDetail} from 'IContactDetail';

import {IHistoryList} from 'IHistoryList';
import {IHistoryService} from 'IHistoryService';
import {IHistoryDetail} from 'IHistoryDetail';

export class HistoryListApp implements IApp{
    constructor(private historylist:IHistoryList, 
                private histsvc:IHistoryService,
				private contactdetail: IContactDetail,
				private historydetail: IHistoryDetail) {
    }

	start() : void{
		this.historylist.registerEventHandlers();
		// get the initial contact list and post it to the page.
       	this.histsvc.load( list => { this.historylist.setList(list); } );
	}

    store(list:Array<History>, next) : void{
        this.histsvc.store(list, next);
    }
	
	
	showContactDetail(contact: Contact) : void{
		this.contactdetail.showDetail(contact);
	}
	
	showHistoryDetail(hist: History) : void{
		this.historydetail.showDetail(hist);
	}
};
