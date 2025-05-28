package cat.start.comscore.integration

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.comscore.Analytics
import com.comscore.PublisherConfiguration
import com.comscore.UsagePropertiesAutoUpdateMode
import com.comscore.streaming.AdvertisementMetadata
import com.comscore.streaming.AdvertisementType
import com.comscore.streaming.ContentMetadata
import com.comscore.streaming.StreamingAnalytics
import cat.start.comscore.BuildConfig

private const val TAG = "ComscoreConnector"

class ComscoreConnector(
  appContext: ReactApplicationContext,
  configuration: ComscoreConfiguration,
  metadata: ComscoreMetaData
) {

  private var startedTracking = false
  private val streamingAnalytics: StreamingAnalytics = StreamingAnalytics()

  init {
    initialize(appContext, configuration, metadata)
  }

  fun initialize(
    context: Context,
    configuration: ComscoreConfiguration,
    metadata: ComscoreMetaData
  ) {
    if (startedTracking) {
      return
    }
    startedTracking = true

    if (BuildConfig.DEBUG) {
      Log.i(TAG, "initialize")
    }

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
  }

  fun update(metadata: ComscoreMetaData) {
    // Utilizar la configuración para actualizar los metadatos
    streamingAnalytics.getConfiguration().addAssetMetadata(metadata.toAssetMetadata())
  }

  fun setPersistentLabels(labels: Map<String, String>) {
    // Configurar etiquetas persistentes una por una
    labels.forEach { (key, value) ->
      streamingAnalytics.getConfiguration().setPersistentLabel(key, value)
    }
  }

  fun setPersistentLabel(label: String, value: String) {
    // Configurar una etiqueta persistente
    streamingAnalytics.getConfiguration().setPersistentLabel(label, value)
  }

  fun setMetadata(metadata: ComscoreMetaData) {
    // Convertir ComscoreMetaData a AssetMetadata y agregarlo a la configuración
    streamingAnalytics.getConfiguration().addAssetMetadata(metadata.toAssetMetadata())
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
