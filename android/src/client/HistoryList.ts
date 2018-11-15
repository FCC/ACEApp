import {IHistoryList} from 'IHistoryList';
import {History} from 'History';
import {Contact} from 'Contact';
import {CardUI} from 'CardUI';
import {HistoryListApp} from 'HistoryListApp';

export class HistoryList implements IHistoryList{
	private list:Array<History>;
	private app:HistoryListApp;

	private table;


	constructor(private cardui: CardUI){
		this.list = [];
		this.table = document.getElementById("history-table");
	};
	
	 registerEventHandlers():void {
        $(document).ready(() => { 
			$('#historyNav').click(x => {this.cardui.expose("historyCard");});	
		});
	 }
	
	setApp(app:HistoryListApp){
		this.app = app;
	}
	
	setList(list:Array<History>){
		this.list = list;
		this.showList();
	}
	
	getList(){
		return this.list;
	}
	
	showList(){
		this.clearTable();
		this.list.forEach(x => {this.showHistory(x)});
	}
	
	showHistory(h:History) {

		var tr = document.createElement("tr"),
		    td = document.createElement("td");
			
		tr.appendChild(this.makeTdWithImage('anon.png', 'icon_contact'));

		$(td).text(h.contact.username);
		$(td).click(x => { 
			this.cardui.expose("contactDetailCard");
			this.app.showContactDetail(h.contact);
		})
		tr.appendChild(td);
		
		if(h.cptText.length !== 0){
			td = this.makeTd(h.cptText[0]);
			$(td).click(x => { 
				this.cardui.expose("historyDetailCard");
				this.app.showHistoryDetail(h);
			});
			tr.appendChild(td);
		}else{
			tr.appendChild(this.makeTd(''));
		}
		
        var d = new Date();

		tr.appendChild(this.makeTd(d.toUTCString())); 

		tr.setAttribute("id", "entry-" + h.id);

		this.table.appendChild(tr);		
	}

    makeTdWithImage(src, klass) {
		var td = document.createElement("td");

        var img = document.createElement("img");

        if (window['isCordova'])  img.setAttribute('src', '/android_asset/www/pic/' + src);
        else            img.setAttribute('src', '../pic/' + src);

        img.setAttribute('class', klass);

        td.appendChild(img);
        return td;
    }
	
	makeTd(s:string, klass = ''){
		var td = document.createElement("td");
		td.appendChild(document.createTextNode(s));
		return td;
	}
	
	clearTable(){
		$("#tbody").empty();
	}
	
	add(hist:History){}
    update(hist:History){}
    remove(hist:History){}


}
