import {History} from 'History';
export interface IHistoryDetail {
	showDetail(hist: History):void;
	registerEventHandlers():void;
};
