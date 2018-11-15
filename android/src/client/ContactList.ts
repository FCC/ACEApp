import {IContactList} from 'IContactList';
import {Contact} from 'Contact';
import {CardUI} from 'CardUI';
import {ContactListApp} from 'ContactListApp';

export class ContactList implements IContactList{
	private list:Array<Contact>;
	private app:ContactListApp;
	private table;
	
	constructor(private cardui: CardUI){
		this.list = [];
		this.table = document.getElementById("contactListTbody");
	};
	
	 registerEventHandlers():void {
        $(document).ready(() => { 
			// sets a click handler on each key of the keypad.
			$('.number').click( e =>{
				var el = $(e.currentTarget);
				var text = el.text();
				console.log(text);
			});
			
			$('#contactListNav').click(x => {this.cardui.expose("contactListCard");});
					});
	 }
	
	setApp(app:ContactListApp){
		this.app = app;
	}
	
	setList(list:Array<Contact>){
		this.list = list;
		this.showList();
	}
	
	getList(){
		return this.list;
	}
	
	showList(){
		this.clearTable();
		this.list.forEach(x => {this.showContact(x)});
	}
	
	showContact(c:Contact) {

		var tr = document.createElement("tr"),
			td;
			
		if(c.favorite){	
			tr.appendChild(this.makeTdWithImage('star.png', 'icon_favorite'));
		}else{
			tr.appendChild(this.makeTd(''));
		}
		
		td = document.createElement("td");
		
		$(td).text(c.first_name + " " + c.last_name);
		$(td).click(x => { 
			this.cardui.expose("contactDetailCard");
			this.app.showDetail(c);
		})
		tr.appendChild(td);
		tr.setAttribute("id", "entry-" + c.id);
		tr.appendChild(this.makeTdWithImage('anon.png', 'icon_contact'));

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
		if(klass !== ''){
			$(td).addClass(klass);
		}
		td.appendChild(document.createTextNode(s));
		return td;
	}
	
	clearTable(){
		$("#contactListTbody").empty();
	}
	
	add(contact:Contact){}
    update(contact:Contact){}
    remove(contact:Contact){}
	
}
