
package cat.start.comscore;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class RNComscoreModule extends ReactContextBaseJavaModule {

    ReactApplicationContext reactContext;

    private static final String TAG = "RNComscore";
	private String appName;

	public RNComscoreModule(ReactApplicationContext reactContext) {
		super(reactContext);
		this.reactContext = reactContext;
	}

	@Override
	public String getName() {
		return "RNComscore";
	}

    /*
     * Public Methods
     *
     */

    @ReactMethod
    public void moduleInit(final Promise promise) {
        //Log.d(TAG, "+++ [Comscore] init");


        promise.resolve(null);

    }

	@ReactMethod
	public void trackView(String view) {
		String comScoreViewName = getAppName() + view;
		HashMap<String,String> labels = new HashMap<String,String>();
		labels.put("name", comScoreViewName.replace("/", "."));
		//Analytics.notifyViewEvent(labels);
	}

	@ReactMethod
	public void trackEvent(String action, String category) {
		String comScoreEventName = category + "." + action;
		HashMap<String,String> labels = new HashMap<String,String>();
		labels.put("event", comScoreEventName);
		//Analytics.notifyViewEvent(labels);
	}

	public String getAppName() {
		return this.appName;
	}

	public void setAppName(String appName) {
		this.appName = appName;
	}

}
