/*
 * this is a lightweight wrapper on the http://jssip.net SIP object.
 *
 */


import { ISipService, dialResponseFunction } from 'ISipService';
import { ICallState, SIP_State } from 'ICallState';
import { BaseSipService } from 'BaseSipService';

declare var JsSIP: any;
declare var build_info:{buildnbr:string,gitcommit:string};
declare var gDeviceId:string;

export class SipService extends BaseSipService implements ISipService {

    protected rtcsession;
	private jssip_config;
	private socket;
    private global:any;

    protected dialThisWhenConnected : () => void;

    // NOTE: DO NOT CONSTRUCTOR DIRECTLY - USE THE SipServiceFactory

    constructor(global:any) {
        super();
        this.global = global;
        this.rtcsession = null;

		this.global.ua = null;
        this.dialThisWhenConnected = () => {};

        this.registerUAEvents();
    }

    private registerUAEvents():void {
        if (this.global.ua) {
			this.global.ua.on('newRTCSession', e => {
              console.log('SipService: Starting RTC session');
              var remoteVideo = document.getElementById('remoteVideo');
              this.rtcsession = e.session;
              var peerconnection = this.rtcsession.connection;
              if (peerconnection === null) {
                  console.log("SipService: peer connection is null in SipService");
              }else{
                  peerconnection.addEventListener('addstream', function (evt) {
                      if(remoteVideo !== null)
                          remoteVideo['srcObject'] = evt.stream;
                  });
              }
			});
			this.global.ua.on('connected', e => {
				console.log('SipService: Received event:' + 'connected yes?');
                this.sendRegistrationInfoToServer(this.jssip_config.extension)
				this.dialThisWhenConnected();
				this.dialThisWhenConnected = () => {};
			});
			this.logUAEvent('connecting');
			this.logUAEvent('disconnected');
			this.logUAEvent('registered');
			this.logUAEvent('unregistered');
			this.logUAEvent('registrationFailed');
			this.logUAEvent('registrationExpiring');
			this.logUAEvent('newMessage');
		}

    }

    private logUAEvent(eventName:string):void {
        if (this.global.ua) {
          this.global.ua.on(eventName, e => {
              console.log('SipService: logUAEvent:' + eventName);

              if (typeof e === 'undefined') {
                  console.log('SipService: no additional event');
              }else{
                  console.log('SipService: event parameter:');
                  console.dir(e);
              }
          });
        }
    }

    // Used by SipServiceFactory
    public makeConfiguration(sip_config, socket): any {

      const uri = 'sip:' + sip_config.extension + '@' +  sip_config.host + ':' + sip_config.sipport;
        return {
            sockets: [socket],   // Single socket
            uri: uri,
            password: sip_config.password
        };
    }

	/**
     * This function creates a callOptions object
 	 * Register event handlers and tell it who to call when states change.
	 */

     private makeCallOptions(stateChanger:(state:SIP_State)=>void, errorHandler: ()=>void) :any {
        return {
            eventHandlers: {
                connecting: () => { // No event passed in.
                                stateChanger(SIP_State.connecting);
                                console.log('call in progress');
                                },
                confirmed: e => {
                            stateChanger(SIP_State.connected);
                            this.LogJSONSafely(e,'call confirmed');
                            },
                failed: e => {
                                this.LogJSONSafely(e,'call failed, whole event provided: ');

                                /*
                                console.log("JsSIP.C.causes.BUSY: " + JsSIP.C.causes.BUSY);
                                console.log("JsSIP.C.causes.REJECTED: " + JsSIP.C.causes.REJECTED);
                                console.log("JsSIP.C.causes.UNAVAILABLE: " + JsSIP.C.causes.UNAVAILABLE);
                                console.log("JsSIP.C.causes.NOT_FOUND: " + JsSIP.C.causes.NOT_FOUND);
                                console.log("JsSIP.C.causes.ADDRESS_INCOMPLETE: " + JsSIP.C.causes.ADDRESS_INCOMPLETE);
                                console.log("JsSIP.C.causes.INCOMPATIBLE_SDP: " + JsSIP.C.causes.INCOMPATIBLE_SDP);
                                console.log("JsSIP.C.causes.MISSING_SDP: " + JsSIP.C.causes.MISSING_SDP);
                                console.log("JsSIP.C.causes.AUTHENTICATION_ERROR: " + JsSIP.C.causes.AUTHENTICATION_ERROR);
                                */

                                switch(e.cause) {
                                case JsSIP.C.causes.TERMINATED:
                                case JsSIP.C.causes.CANCELED:
                                case JsSIP.C.causes.BUSY:
                                case JsSIP.C.causes.REJECTED:
                                case JsSIP.C.causes.UNAVAILABLE:
                                case JsSIP.C.causes.NOT_FOUND:
                                case JsSIP.C.causes.ADDRESS_INCOMPLETE:
                                case JsSIP.C.causes.INCOMPATIBLE_SDP:
                                case JsSIP.C.causes.MISSING_SDP:
                                case JsSIP.C.causes.AUTHENTICATION_ERROR:
                                    console.log("SipService: Failure Cause: " + e.cause);
								    errorHandler();
                                    break;
                                default:
                                    console.log("SipService: default cause: " + e.cause);
    								errorHandler();
                                    break;
                                }
                                stateChanger(SIP_State.disconnected);
							},
                        ended: e => {
                                this.LogJSONSafely(e,'call ended with cause: ');
								stateChanger(SIP_State.disconnected);

							},
            },
            mediaConstraints: { 'audio': true, 'video': false },
            pcConfig: {
                'rtcpMuxPolicy': 'negotiate'
            }
        };
    }

	private LogJSONSafely(e, msg:string) : void{
		var ex;
		try{
			console.log('SipService:' + msg + JSON.stringify(e));
		}catch(ex){
			console.log('SipService: bad JSON:'+ ex);
			console.log('SipService:' + msg + ' cause: ' + e.cause);
		}
	}

    dial(phonenum: string, statusChanger: (status:SIP_State)=> void, errorHandler: () => void, next: dialResponseFunction) : void {
        if(this.global.ua)
          this.global.ua.start();
        else
          console.error('SipService: no useragent object. skipping call.');

        const sipuri = new JsSIP.URI('sip',
                                    phonenum,
                                    this.jssip_config.host, // without port!
                                    this.jssip_config.sipport);

       console.log("SipService: calling " + sipuri);

    		console.log('SipService: this is the number we are sending to asterisk: |' + phonenum + '|');
        if(this.global.ua) {
          try {
            this.dialThisWhenConnected = () => {
                this.global.ua.call(sipuri, this.makeCallOptions(statusChanger, errorHandler));
                next(phonenum, SIP_State.connected);
                };
			console.log(this.dialThisWhenConnected);
          }catch(ex) {
            console.log("SipService: Exception caught during attempt to call.");
            console.log(ex);
          }
        } else {
          console.error('SipService: no useragent object. skipping call.');
        }
    }

    isConnected() : boolean {
        if (this.global.ua)
          return this.global.ua.isConnected();
        else return false;
    }

    hangup(next: dialResponseFunction) :void {
        this.rtcsession = null; // release our pointer to the rtcsession.

        if (this.global.ua)
          this.global.ua.stop(); // unrgister, terminate, and disconnect.
        console.log('SipService: user agent stopped');

        if (typeof next === 'function') next(null, SIP_State.disconnected);
    }

    /**
     * send DTMF tones if there's an active rtcsession
     */

    dtmf(key: string, next:Function):void {
        if (this.rtcsession) {
            this.rtcsession.sendDTMF(key, { duration: 100, interToneGap: 500 });
        }
        if (typeof next === 'function') next();
    }
	
	reconfigure(config){
		if(config === null) {
			this.global.ua = null;
		    this.jssip_config = config;
            this.socket = null;
			return;
		}
		const wsuri = 'wss://' + config.host + '/ws';  // use default port.
		this.socket = new JsSIP.WebSocketInterface(wsuri);
		this.global.ua = new JsSIP.UA(this.makeConfiguration(config, this.socket));		
		this.jssip_config = config;
		
        this.registerUAEvents();
	}

    toggleMute(cb:(isMuted:boolean)=>void) {
        if (this.rtcsession === null) {
            cb(false);
        }else {
            if (this.rtcsession.ismute()) {
                this.rtcsession.unmute();
                cb(false);
            }else{
                this.rtcsession.mute();
                cb(true);
            }
        }
    }
    sendRegistrationInfoToServer(extension) {
        console.log("SipService: onconnect gDeviceId: " + gDeviceId);
        var target = '9999';    
        this.global.ua.sendMessage(target, JSON.stringify({event:'register-ext', extension:extension,buildnbr:build_info.buildnbr, gitcommit:build_info.gitcommit, deviceId:gDeviceId}));
    }
}
