import {History} from 'History';

export interface IHistoryService {
    store(hist : Array<History>, next: (list: Array<History>) => void):void;
    load(next : (list : Array<History>) => void):void;
};
