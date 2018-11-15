export class SipUrl {
    // based on an idea here: https://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
    // requires a DOM.

    private parser:any;
    private uri:string;
    public href : string;
    
    constructor(uri:string) {
        this.href = uri;
        this.uri = uri.replace(/^sip:/,'http:');
        console.log("SipUrl: this.uri = " + this.uri);

        if (typeof window.URL == 'undefined') { // then use the A element hack
          this.parser = document.createElement('a');
          this.parser.href = this.uri;
          console.log("SipUrl: Using legacy solution");
        }else{  // use the Modern URL object.
          this.parser = new URL(this.uri);
          console.log("SipUrl: Using modern solution");
        }
    }
    get protocol():string { return 'sip:'; }
    get host():string { return this.parser.host; }  // hostname : port
    get hostname():string { return this.parser.hostname; } // host
    get port():string { return this.parser.port; }
    get username():string { return this.parser.user; }
    get pathname():string {
        if (this.parser.pathname.length >=1 && this.parser.pathname.charAt(0) === '/')
         return this.parser.pathname;   
        else return "/" + this.parser.pathname;
    }
}
