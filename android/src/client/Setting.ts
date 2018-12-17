import {ISetting} from 'ISetting';
import {Contact} from 'Contact';
import {CardUI} from 'CardUI';
import {SettingApp} from 'SettingApp';
import {SipConfig} from 'SipConfig';
import {SipUrl} from 'SipUrl';

declare var gDeviceId:string;
declare function $(x:any):any;

export class Setting implements ISetting{
	private app:SettingApp;
	private invalidForm;
	private storedConfig:SipConfig;
	
	constructor(private cardui: CardUI){
	};

	show() {
    $('#deviceId_Form').val(gDeviceId); 
		this.cardui.expose("settingCard");
	}
	registerEventHandlers():void {
		$(document).ready(() => {
			$('#settingNav').click(x => this.show( ));
		});
		$('#buttonSettingSubmit').click(x=> {
			 this.saveConfigurationFromForm();
			 this.cardui.expose("historyCard");
		});
    
		$('#buttonSettingCancel').click(x=> {
			this.setConfig(this.storedConfig);
			this.validateForm(this.storedConfig);
			this.cardui.expose("historyCard");
		});
        $('#settingCard').keyup(x => {
            this.validateForm(this.grabConfig());
			this.toggleSubmitButton(this.invalidForm);
        });
	 }

	setApp(app:SettingApp){
	 		this.app = app;
	}

  private grabConfig() : SipConfig {
    var config = new SipConfig();

    config.host = $('#hostForm').val();
    config.extension = $('#extensionForm').val();
    config.sipport = $('#sipportForm').val();
    config.password = $("#passwordForm").val();

    return config;
  }

  private saveConfigurationFromForm():void {
        var config = this.grabConfig();

		this.app.store(config, x =>{
			// window.location.reload(true);
		});
	}

  setConfig(config:SipConfig){
		this.storedConfig = config;

        $('#hostForm').val(config.host);
        $('#extensionForm').val(config.extension);
        $('#passwordForm').val(config.password);
        $('#sipportForm').val(config.sipport);
        $('#deviceId_Form').val(gDeviceId);
    }
	
	toggleSubmitButton(invalid){
		if(invalid){
			$('#buttonSettingSubmit').prop('disabled',true).prop('style','color:lightgray');
		}else{
			$('#buttonSettingSubmit').prop('disabled',false).prop('style','color:black');
		}
	}

    validateForm(config) {
		this.invalidForm = false;
        this.toggleInvalidIndicator('#hostForm_invalid', this.validateHostname(config.host));
        this.toggleInvalidIndicator('#sipportForm_invalid', this.validateDigits(config.sipport));
        this.toggleInvalidIndicator('#extensionForm_invalid', this.validateDigits(config.extension));
    }

    toggleInvalidIndicator(id, isvalid:boolean):void {
        if (isvalid) {
            $(id).text(''); 
        }else{
			this.invalidForm = true;
            $(id).text('X').prop('style','color:red'); 
        }
    }

    validateHostname(s:string):boolean {
        return !!/^[A-Za-z0-9]+(?:\.[A-Za-z0-9]*)*$/.exec(s); 
    }

    validateDigits(s:string):boolean {
        return !!/^[0-9]+$/.exec(s); 
    }

}
