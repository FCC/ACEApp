/*
 * manage a card-based UI.
 * each card's toplevel ID is added to the cardUI.  
 * then, exposing any ID causes the others to be made invisible.
 */

export class CardUI {
    constructor(){ }    
    expose(id) {	
	    $('.card').css('display','none');
        $('#'+id).css('display','inline');
		
        // this.cards.filter( x => x !=id ).forEach( x => $('#'+x).css('display','none') );
    }

}
