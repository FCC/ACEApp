import {IHistoryService} from "IHistoryService";
import {History} from "History";

// Implements an "in-memory" contact service" 
export class FakeHistSvc implements IHistoryService {

	public list:Array<History>;
	
	constructor () {
		this.list = [];
	}
	
	
	load(next: (list:Array<History>) => void) {
        // do nothing.
		next(this.list);
	}

	store(history_list, next) {
		this.list = history_list.slice();
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


