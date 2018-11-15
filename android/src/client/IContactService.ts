import {Contact} from 'Contact';

export interface IContactService {
    store(contact : Array<Contact>, next: (list: Array<Contact>) => void):void;
    load(next : (list : Array<Contact>) => void):void;
};
