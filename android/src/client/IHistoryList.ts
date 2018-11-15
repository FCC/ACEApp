import {History} from 'History';
import {HistoryListApp} from 'HistoryListApp';
export interface IHistoryList {
	setApp(app:HistoryListApp):void;
    setList(list:Array<History>):void; // set the whole list at once.
    add(hist:History):void;
    update(hist:History):void;
    remove(hist:History):void;
    getList():Array<History>;
	registerEventHandlers():void;
};
