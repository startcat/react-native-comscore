package cat.start.comscore.integration

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext

class ComscoreConnector(
  appContext: ReactApplicationContext,
  configuration: ComscoreConfiguration,
  metadata: ComscoreMetaData
) {

  private val streamingAnalytics = ComscoreAnalytics()

  init {
    streamingAnalytics.initialize(appContext, configuration, metadata)
  }

  fun update(metadata: ComscoreMetaData) {
    streamingAnalytics.update(metadata)
  }

  fun setPersistentLabels(labels: Map<String, String>) {
    streamingAnalytics.setPersistentLabels(labels)
  }

  fun setPersistentLabel(label: String, value: String) {
    streamingAnalytics.setPersistentLabel(label, value)
  }

  fun destroy() {
    streamingAnalytics.destroy()
  }
}
