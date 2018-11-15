import {Contact} from 'Contact';
import {CardUI} from 'CardUI';
import {HistoryListApp} from 'HistoryListApp';
import {History} from 'History';
import {IHistoryDetail} from 'IHistoryDetail';

export class HistoryDetail implements IHistoryDetail{
	private historyListApp: HistoryListApp;

	constructor(private cardui: CardUI){
	};
	
	registerEventHandlers():void {
        $(document).ready(() => { 
			$('#histBackButton').click(x => {this.cardui.expose("historyCard");});	
		});
	}	
	
	setHistoryListApp(historyListApp:HistoryListApp){
		this.historyListApp = historyListApp;
	}
	
	 showDetail(hist:History){
		 
	 }
	 
	 
	
	
}
