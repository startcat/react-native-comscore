package com.comscore

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

import java.util.List
import java.util.Map
import java.util.HashMap

import com.comscore.Analytics
import com.comscore.PublisherConfiguration

class ComscoreModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  fun multiply(a: Double, b: Double, promise: Promise) {
    promise.resolve(a * b)
  }

  @ReactMethod
	public fun trackView(view: String) {

    val labels = HashMap<String, String>()
    labels.put("name", view.replace("/", "."));
    Analytics.notifyViewEvent(labels)

	}

	@ReactMethod
	public fun trackEvent(action: String, category: String) {
    
    val comScoreEventName = "$category.$action";
    val labels = HashMap<String, String>()
    labels.put("event", comScoreEventName)
    Analytics.notifyViewEvent(labels)

	}

  companion object {
    const val NAME = "Comscore"
  }
}
