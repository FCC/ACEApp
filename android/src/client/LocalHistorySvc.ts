import {IHistoryService} from "IHistoryService";
import {History} from "History";

export class LocalHistorySvc implements IHistoryService {

    private static KEY = "HistoryList";
	
	reconfigure(config){
		
	}
	
	load(next: (list:Array<History>) => void) {
        const s = window.localStorage.getItem(LocalHistorySvc.KEY);
        next((s === null)? [] : JSON.parse(s));
	}

    store(list:Array<History>, next: (list: Array<History>) => void) {
        window.localStorage.setItem(LocalHistorySvc.KEY, JSON.stringify(list));

        next(list);
	}

}
