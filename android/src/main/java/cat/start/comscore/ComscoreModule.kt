package cat.start.comscore

import android.app.Activity
import com.comscore.Analytics
import com.comscore.PublisherConfiguration
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

public fun init(activity:Activity, publisherId: String, applicationName: String){

  if (publisherId != null) {

    val labels = HashMap<String, String>()
    labels.put("cs_ucfr", "1");

    val publisher = PublisherConfiguration.Builder()
      .publisherId(publisherId)
      .persistentLabels(labels)
      .build()

    Analytics.getConfiguration().addClient(publisher)
    Analytics.getConfiguration().enableImplementationValidationMode()

    if (applicationName != null) {
      Analytics.getConfiguration().setApplicationName(applicationName)
    }

    //Analytics.getConfiguration().enableImplementationValidationMode();
    Analytics.start(activity)
  }

}

class ComscoreModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
	fun trackView(view: String) {

    val labels = HashMap<String, String>()
    labels.put("name", view.replace("/", "."));
    Analytics.notifyViewEvent(labels)

	}

	@ReactMethod
	fun trackEvent(action: String, category: String) {

    val comScoreEventName = "$category.$action";
    val labels = HashMap<String, String>()
    labels.put("event", comScoreEventName)
    Analytics.notifyViewEvent(labels)

	}

  @ReactMethod
  fun updatePersistentLabels(publisherId: String, fpid: String, fpit: String, fpdm: String, fpdt: String) {

    Analytics.getConfiguration().getPublisherConfiguration(publisherId).setPersistentLabel("cs_fpid", fpid);
    Analytics.getConfiguration().getPublisherConfiguration(publisherId).setPersistentLabel("cs_fpit", fpit);
    Analytics.getConfiguration().getPublisherConfiguration(publisherId).setPersistentLabel("cs_fpdm", fpdm);
    Analytics.getConfiguration().getPublisherConfiguration(publisherId).setPersistentLabel("cs_fpdt", fpdt);
    Analytics.notifyHiddenEvent();

  }

  companion object {
    const val NAME = "Comscore"
  }
}
