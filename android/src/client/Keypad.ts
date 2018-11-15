import { IKeypad } from 'IKeypad';
import { IDialer } from 'IDialer';
import { CardUI } from 'CardUI';
import { SIP_State } from 'ICallState';

export class Keypad implements IKeypad {
	private state: SIP_State;
	private dialer: IDialer;
	private pnum: string;
	private rowId: number;
	private temp: boolean;

	constructor(private cardui: CardUI) {
		this.state = SIP_State.disconnected;
		this.pnum = "";
		this.rowId = 0;
		this.temp = true;
	}
	showTranscriptionState(isshowing: boolean, message: string): void {
	
	}

	/**
	 * this is where we wire up the UI to event handlers.
	 */
	registerEventHandlers(): void {

		$(document).ready(() => {
			// sets a click handler on each key of the keypad.
			$('.keypad-button').click(e => {
				var etemp = $(e.currentTarget);
				etemp.css("background-color", "Gray");
                var timeToRestoreColor = 100; // was 500
				setTimeout(() => {etemp.css("background-color", "White")}, timeToRestoreColor);
				var el = etemp.find('.big');
                var text = el.text().trim();

				var telNumber = $('#phone-number');
				$(telNumber).val(telNumber.val() + text);
				if (this.isConnected()) {
					this.dialer.dtmf(text, () => { console.log('sent DTMF key "' + text + '"'); }); 
					var lastRow = $("#transcript-box>p:last-child");
					if(lastRow.hasClass('me')){
						lastRow.text(lastRow.text()+text);
					}else {
						var row = $("<p></p>")
											.addClass("message-text-me")
											.addClass('me')
											.addClass('message-final')
											.text(text);
						$("#transcript-box").append(row);
					}
					$("#transcript-box").scrollTop($("#transcript-box")[0].scrollHeight);

				}
			});

			$('#button-call').click(e => {
				if (this.isConnected()) {
					this.dialer.hangup(x => {
					});
				} else {
					this.dialer.dial(this.getPhoneNumber(), (num, state) => {
						console.log("in callback dial in keypad")
						this.openCallScreen(state);
					});
				}
			});
		});

		$('.callButtonNav').click(x => { this.cardui.expose("callCard"); });

		$('#mute').click(x => {
            this.dialer.toggleMute( (isMuted:boolean) => {
            });
		});
		$('#dial').click(x => {
				if($("#keypad").is(":visible")){
					$("#keypad").hide();
					this.makeBigKeyboard();
				}else{
					$("#keypad").show();
					this.makeSmallKeyboard();
				}
		});
		$('#speaker').click(x => {

			if($("video").prop('muted') === true){
				this.unmuteSpeaker();
			} else {
				this.muteSpeaker();
			}
		});
		$('#phone-number-delete-btn').click(e => {
			$('#phone-number').val(
				function (index, value) {
					return value.substr(0, value.length - 1);
				})
		});

	}
	
	closeCallScreen(){
		console.log("Hangup call");

		this.makeBigKeyboard();
		this.showBigKeyboard();		
		this.unmuteSpeaker();
		this.enableOtherPageOptions();

		this.toggleCaptions();
		this.toggleButtonState();

        this.clearTranscript();
		$("#transcription-svc").text("");
	}

	private displayTranscriptions(msgid: number, text: string, source: string, isfinal: boolean){
		var rowId = 'row_' + msgid;
		if (source === "PSTN") {
			var el = $('#' + rowId);
			if (el.length > 0) {
				el.text(text)
					.toggleClass('message-final', isfinal)
					.toggleClass('message-interim', !isfinal);
			} else {
				var row = $("<p></p>").attr('id', rowId)
					.addClass("message-text")
					.addClass('you')
					.toggleClass('message-final', isfinal)
					.toggleClass('message-interim', !isfinal)
					.text(text);
				$("#transcript-box").append(row);
			}
		}
		$("#transcript-box").scrollTop($("#transcript-box")[0].scrollHeight);
	}
	
	openCallScreen( state:SIP_State) {
		console.log("state in dial is " + state);

		this.pnum = this.getPhoneNumber();
		this.disableOtherPageOptions();
		this.hideBigKeyboard();
		this.toggleCaptions();
		this.toggleButtonState();

		this.dialer.onReceive((msgid: number, text: string, source: string, isfinal: boolean, sttengine: string) => {
			this.displayTranscriptions(msgid,text,source,isfinal);
            this.displaySttEngine(sttengine);
		});
	}

    displaySttEngine(name) {
        $("#transcription-svc").text("("+name+")");
    }

	isConnected() {
		return (this.dialer !== null && this.dialer.isConnected());
	}

	setInputText(number: string) {
		$('#phone-number').val(number);
	}

	connectTo(dialer: IDialer) {
		this.dialer = dialer;
	}

	dial(): void {
		this.dialer.dial(this.getPhoneNumber(), (state) => { this.setState(state); });
	}

	private getPhoneNumber(): string {
		var telNumber = $('#phone-number').val();
		return telNumber;
	}

	setState(state: SIP_State) {
		console.log("set state in krypad");
		this.state = state;

        switch(state) {
        case SIP_State.disconnected: this.closeCallScreen(); break;
        case SIP_State.connecting: this.showCalling(); break;
        case SIP_State.connected: this.hideCalling(); break;
        }

	}
	
	private muteSpeaker() {
		$("video").prop('muted', true);
		$("#speaker > img").attr('src','pic/mute.png');
	}
	
	private unmuteSpeaker() {
		$("video").prop('muted', false);
		$("#speaker > img").attr('src','pic/speaker.png');
	}
	
	private makeSmallKeyboard(){
		$("#dial").removeClass("button_menu");
		$("#dial").addClass("button_menu_selected");
		$(".input-group").hide();
		$("#transcript-box").addClass("transcript-box_small");
		$(".span4").addClass("smaller-keyboard");
		$("#transcript-box").scrollTop($("#transcript-box")[0].scrollHeight);

	}

	private makeBigKeyboard() {
		$("#dial").removeClass("button_menu_selected");
		$("#dial").addClass("button_menu");
		$("#transcript-box").removeClass("transcript-box_small");
		$(".span4").removeClass("smaller-keyboard");
	}
	
	private showBigKeyboard() {
		$('#phone-number').show();
		$('.input-group').show();
		$(".num-pad").show();
		$("#keypad").css("display", "block");
		$('#phone-number').val(this.pnum); 
	}
	
	private hideBigKeyboard(){
		$(".input-group").hide();
		$(".num-pad").hide();
	}
	
	private enableOtherPageOptions(){
		$("#button_menu_panel").hide();
		$(".tab").show(); 
		$('#settingNav').click(x => {this.cardui.expose("settingCard");});
	}
	
	private disableOtherPageOptions(){
		$("#button_menu_panel").show();
		$(".tab").hide();
		$('#settingNav').off('click');
	}
	
	private toggleCaptions(){
		if($("#captions").is(":visible")) $("#captions").css("display", "none");
		else $("#captions").css("display", "block");
	}

	private toggleButtonState(){
		if($('#button-call').hasClass("hangup-state")) $('#button-call').removeClass("hangup-state");
		else $('#button-call').addClass("hangup-state");
	}
	
    private showCalling() {
		$(".num-pad").hide();
		this.hideTranscript();
        this.showProgress();
    }

	private hideCalling() {
		$(".num-pad").show();
		this.makeSmallKeyboard();
		this.hideProgress();
		this.showTranscript();
	}

    private hideProgress() {
        $("#progress-message").css('display','none');
    }
	
    private showProgress() {
        $("#progress-message").css('display','block');
    }
	
    private showTranscript() {
        $('#transcript-box').css('display','block');
    }
	
    private clearTranscript() {
        $('#transcript-box').html('');
    }

    private hideTranscript() {
        $('#transcript-box').css('display', 'none');
    }

	reset(): void {
		$('#phone-number').val('');
		this.setState(SIP_State.disconnected);
	}

	show() {
		$('.phone').slideUp();
	}

	hide() {
		$('.phone').slideDown();

	}
}
