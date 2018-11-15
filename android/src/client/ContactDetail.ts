import {IContactDetail} from 'IContactDetail';
import {Contact} from 'Contact';
import {CardUI} from 'CardUI';
import {CallApp} from 'CallApp';
import {ContactListApp} from 'ContactListApp';

export class ContactDetail implements IContactDetail{
	private callApp:CallApp;
	private contactListApp: ContactListApp;

	constructor(private cardui: CardUI){
	};
	
	registerEventHandlers():void {
        $(document).ready(() => { 
			$("#button_popUp").click(x => {
				$("#popUpMain").css("display","block");
				$("#firstNameForm").val($("#cdFirstName").text());
				$("#lastNameForm").val($("#cdLastName").text());
				$("#usernameForm").val($("#cdUsername").text()); //???
				$("#mobileForm").val($("#cdMobile").text());
				$("#workForm").val($("#cdWork").text());
				$("#homeForm").val($("#cdHome").text());
				$("#favoriteForm").prop("checked",$("#cdFavorite").prop("checked"));
				});
			$("#popUpClose").click(x => {$("#popUpMain").css("display","none")});
			$("#buttonPopupSubmit").click(x => {
				$("#popUpMain").css("display","none");
				this.editContact();
			});
			
		});
	}	
	 
	editContact(){
		var c = new Contact();
		c.username = $("#usernameForm").val();
		c.first_name = $("#firstNameForm").val();
		c.last_name = $("#lastNameForm").val();
		
		if(this.validateDigits($("#mobileForm").val())) c.mobile_number = $("#mobileForm").val();
		else c.mobile_number = "";
		
		if(this.validateDigits($("#workForm").val())) c.work_number = $("#workForm").val();
		else c.work_number = "";
		
		if(this.validateDigits($("#homeForm").val())) c.home_number = $("#homeForm").val();
		else c.home_number = "";

		c.favorite = $("#favoriteForm").prop("checked");
		
		this.contactListApp.showDetail(c);
		this.contactListApp.updateContact(c);
	}

	
	validateDigits(number:string):boolean {
        return number.length >=10 && !!/^[(]?[0-9]{3}[)]?[-]?[0-9]{3}[-]?[0-9]{4}$/.exec(number);
    }
	 
	setCallApp(callApp:CallApp){
		this.callApp = callApp;
	}
	
	setContactListApp(contactListApp:ContactListApp){
		this.contactListApp = contactListApp;
	}
	
	 showDetail(contact:Contact){
		 $("#cdFirstName").text(contact.first_name);
		 $("#cdLastName").text(contact.last_name);
		 $("#cdUsername").text(contact.username);
		 $("#cdMobile").text(contact.mobile_number);
		 $("#cdWork").text(contact.work_number);
		 $("#cdHome").text(contact.home_number);
		 $("#cdFavorite").prop("checked", contact.favorite);

		 $("#cdMobile").click(x => { 
			this.cardui.expose("callCard");
			this.callApp.showNumber($("#cdMobile").text());
		 })
		 $("#cdWork").click(x => { 
			this.cardui.expose("callCard");			
			this.callApp.showNumber($("#cdWork").text());
		 })		 
		 $("#cdHome").click(x => { 
			this.cardui.expose("callCard");
			this.callApp.showNumber($("#cdHome").text());
		 })
	 }
	 
	 
	
	
}
