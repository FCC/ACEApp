export class PhoneNumber {
    private phone:string;

    private static legal_phone = /^[0-9()\-]+$/;

    constructor (phone:string) {
        this.phone = phone;
        if (!this.isValid()) throw "invalid object";
        this.trimBadCharacters();
    }    

    isValid():boolean {
        return this.phone.length >=10 && PhoneNumber.legal_phone.test(this.phone);
    }

    trimBadCharacters():void {
        for(var i =0 ;i < this.phone.length; ) {
            if (!PhoneNumber.legal_phone.test(this.phone.charAt(i))) {
                this.phone = this.phone.slice(0, i) + this.phone.slice(i+1);
            }else i++;
        }
    }
	
	asString()  { return this.phone; }

    equals(obj) {
        if(typeof obj === 'object') return obj.trimBadCharacters() === this.trimBadCharacters();
        if(typeof obj === 'string') return this.equals(new PhoneNumber(obj));
        throw "Unimplemented equals operator on type: " + typeof obj;
    }
}
