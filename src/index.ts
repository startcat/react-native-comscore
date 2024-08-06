import { Platform, DeviceEventEmitter, NativeEventEmitter, NativeModules } from 'react-native';
import { EventRegister } from 'react-native-event-listeners';





/*
 *  Comscore Module
 *  Interface for the Comscore Analytics module
 * 
 */

const { RNComscoreModule } = NativeModules;

class Singleton {

    static #instance: Singleton;

    private log_key: string = `[Downloads]`;
    private initialized: boolean = false;

    private constructor() { }

    public static get instance(): Singleton {

        if (!Singleton.#instance) {
            Singleton.#instance = new Singleton();
        }

        return Singleton.#instance;

    }

    public init (): Promise<void> {

        return new Promise((resolve, reject) => {


            return resolve();

        });

    }

	public trackView (view:string): void {
		RNComscoreModule.trackView(view);

	}

	trackEvent(action:string, category:string): void {
		RNComscoreModule.trackEvent(action, category);

	}

}

export default Singleton.instance;
