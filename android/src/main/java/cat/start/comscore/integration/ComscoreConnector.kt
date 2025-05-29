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
      Log.i(TAG, "initialize: starting with context=$context")
      Log.i(TAG, "initialize: configuration=[publisherId=${configuration.publisherId}, appName=${configuration.applicationName}, debug=${configuration.debug}]")
      Log.i(TAG, "initialize: metadata=$metadata")
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
    if (BuildConfig.DEBUG) {
      Log.i(TAG, "update with metadata: ${metadata}")
    }
    // Utilizar la configuración para actualizar los metadatos
    streamingAnalytics.setMetadata(metadata.toComscoreContentMetadata())
  }

  fun setPersistentLabels(labels: Map<String, String>) {
    if (BuildConfig.DEBUG) {
      Log.i(TAG, "setPersistentLabels: ${labels}")
    }
    // Configurar etiquetas persistentes una por una
    labels.forEach { (key, value) ->
      Analytics.getConfiguration().setPersistentLabel(key, value)
    }
  }

  fun setPersistentLabel(label: String, value: String) {
    if (BuildConfig.DEBUG) {
      Log.i(TAG, "setPersistentLabel: $label = $value")
    }
    // Configurar una etiqueta persistente
    Analytics.getConfiguration().setPersistentLabel(label, value)
  }

  fun setMetadata(metadata: ComscoreMetaData) {
    if (BuildConfig.DEBUG) {
      Log.i(TAG, "setMetadata: ${metadata}")
    }
    // Configurar los metadatos del contenido
    streamingAnalytics.setMetadata(metadata.toComscoreContentMetadata())
  }

  fun notifyEnd() {
    if (BuildConfig.DEBUG) {
      Log.i(TAG, "notifyEnd")
    }
    streamingAnalytics.notifyEnd()
  }

  fun notifyPause() {
    if (BuildConfig.DEBUG) {
      Log.i(TAG, "notifyPause")
    }
    streamingAnalytics.notifyPause()
  }

  fun notifyPlay() {
    if (BuildConfig.DEBUG) {
      Log.i(TAG, "notifyPlay")
    }
    streamingAnalytics.notifyPlay()
  }

  fun createPlaybackSession() {
    if (BuildConfig.DEBUG) {
      Log.i(TAG, "createPlaybackSession")
    }
    streamingAnalytics.createPlaybackSession()
  }

  fun setDvrWindowLength(length: Long) {
    if (BuildConfig.DEBUG) {
      Log.i(TAG, "setDvrWindowLength: $length")
    }
    streamingAnalytics.setDvrWindowLength(length)
  }

  fun notifyBufferStop() {
    if (BuildConfig.DEBUG) {
      Log.i(TAG, "notifyBufferStop")
    }
    streamingAnalytics.notifyBufferStop()
  }

  fun notifySeekStart() {
    if (BuildConfig.DEBUG) {
      Log.i(TAG, "notifySeekStart")
    }
    streamingAnalytics.notifySeekStart()
  }

  fun startFromDvrWindowOffset(offset: Long) {
    if (BuildConfig.DEBUG) {
      Log.i(TAG, "startFromDvrWindowOffset: $offset")
    }
    streamingAnalytics.startFromDvrWindowOffset(offset)
  }

  fun startFromPosition(position: Long) {
    if (BuildConfig.DEBUG) {
      Log.i(TAG, "startFromPosition: $position")
    }
    streamingAnalytics.startFromPosition(position)
  }

  fun notifyBufferStart() {
    if (BuildConfig.DEBUG) {
      Log.i(TAG, "notifyBufferStart")
    }
    streamingAnalytics.notifyBufferStart()
  }

  fun notifyChangePlaybackRate(rate: Float) {
    if (BuildConfig.DEBUG) {
      Log.i(TAG, "notifyChangePlaybackRate: $rate")
    }
    // streamingAnalytics.notifyChangePlaybackRate(
    //   java.lang.Double.valueOf(rateChangeEvent.playbackRate).toFloat()
    // )
    streamingAnalytics.notifyChangePlaybackRate(rate)
  }

  fun destroy() {
    if (BuildConfig.DEBUG) {
      Log.i(TAG, "destroy")
    }
    // TODO: Limpiar eventos si los hay
  }
}
