import { Platform, DeviceEventEmitter, NativeEventEmitter, NativeModules } from 'react-native';
import { EventRegister } from 'react-native-event-listeners';

type Config = {
    publisherId: string;
    applicationName: string;
};



/*
 *  Comscore Module
 *  Interface for the Comscore Analytics module
 * 
 */

const { RNComscoreModule } = NativeModules;

class Singleton {

    static #instance: Singleton;

    private log_key: string = `[ComScore]`;
    private initialized: boolean = false;

    private constructor() { }

    public static get instance(): Singleton {

        if (!Singleton.#instance) {
            Singleton.#instance = new Singleton();
        }

        return Singleton.#instance;

    }

    private log (message:string): void {
        console.log(`${this.log_key} ${message}`);
    }

    public init (config:Config): void {

        this.log(`Config Settings: ${JSON.stringify(config)}`);
        RNComscoreModule.moduleInit(config);

    }

	public trackView (view:string): void {
		RNComscoreModule.trackView(view);

	}

	public trackEvent(action:string, category:string): void {
		RNComscoreModule.trackEvent(action, category);

	}

}

export default Singleton.instance;
