import {ICallState} from "ICallState";

export class BaseSipService {
	protected app:ICallState;
		
	setCallState(app:ICallState) {
		this.app = app;
	}
}