package cat.start.comscore.integration

import android.content.Context
import android.util.Log
import com.comscore.Analytics
import com.comscore.PublisherConfiguration
import com.comscore.UsagePropertiesAutoUpdateMode

private const val TAG = "ComscoreConnector"

class ComscoreAnalytics {
  // private var adapter: ComscoreAdapter? = null
  private var startedTracking = false

  fun initialize(
    context: Context,
    configuration: ComscoreConfiguration,
    metadata: ComscoreMetaData
  ) {
    if (startedTracking) {
      return
    }
    startedTracking = true

    // if (BuildConfig.DEBUG) {
      // Log.i(TAG, "initialize")
    // }

    Analytics.getConfiguration().apply {
      addClient(PublisherConfiguration.Builder()
        .publisherId(configuration.publisherId)
        .secureTransmission(configuration.secureTransmission).apply {
          if (configuration.userConsent == "1" || configuration.userConsent == "0") {
            persistentLabels(hashMapOf("cs_ucfr" to configuration.userConsent))
          }
        }
        .build()
      )
      setUsagePropertiesAutoUpdateMode(configuration.usagePropertiesAutoUpdateMode)
      setApplicationName(configuration.applicationName)
      if (configuration.childDirected) {
        enableChildDirectedApplicationMode()
      }
      if (configuration.debug) {
        enableImplementationValidationMode()
      }
    }

    Analytics.start(context)

    // adapter = ComscoreAdapter(configuration, metadata)
  }

  fun destroy() {
    // adapter?.destroy()
  }

  fun setPersistentLabel(label: String, value: String) {
    // adapter?.setPersistentLabel(label, value)
  }

  fun setPersistentLabels(labels: Map<String, String>) {
    // adapter?.setPersistentLabels(labels)
  }

  fun update(metadata: ComscoreMetaData) {
    // adapter?.setMedatata(metadata)
  }
}
