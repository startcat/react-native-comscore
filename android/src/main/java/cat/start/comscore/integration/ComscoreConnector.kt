package cat.start.comscore.integration

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.comscore.Analytics
import com.comscore.PublisherConfiguration
import com.comscore.UsagePropertiesAutoUpdateMode
import com.comscore.streaming.AdvertisementMetadata
import com.comscore.streaming.AdvertisementType
import com.comscore.streaming.ContentMetadata
import com.comscore.streaming.StreamingAnalytics

class ComscoreConnector(
  appContext: ReactApplicationContext,
  configuration: ComscoreConfiguration,
  metadata: ComscoreMetaData
) {

  private var startedTracking = false
  private val streamingAnalytics: StreamingAnalytics = StreamingAnalytics()

  init {
    if (startedTracking) {
      return
    }
    startedTracking = true

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

    Analytics.start(appContext)
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

  fun setMetadata(metadata: ComscoreMetaData) {
    streamingAnalytics.setMetadata(metadata)
  }

  fun notifyEnd() {
    streamingAnalytics.notifyEnd()
  }

  fun notifyPause() {
    streamingAnalytics.notifyPause()
  }

  fun notifyPlay() {
    streamingAnalytics.notifyPlay()
  }

  fun createPlaybackSession() {
    streamingAnalytics.createPlaybackSession()
  }

  fun setDvrWindowLength(length: Long) {
    streamingAnalytics.setDvrWindowLength(length)
  }

  fun notifyBufferStop() {
    streamingAnalytics.notifyBufferStop()
  }

  fun notifySeekStart() {
    streamingAnalytics.notifySeekStart()
  }

  fun startFromDvrWindowOffset(offset: Long) {
    streamingAnalytics.startFromDvrWindowOffset(offset)
  }

  fun startFromPosition(position: Long) {
    streamingAnalytics.startFromPosition(position)
  }

  fun notifyBufferStart() {
    streamingAnalytics.notifyBufferStart()
  }

  fun notifyChangePlaybackRate(rate: Float) {
    streamingAnalytics.notifyChangePlaybackRate(rate)
  }

  fun destroy() {
    streamingAnalytics.destroy()
  }
}
