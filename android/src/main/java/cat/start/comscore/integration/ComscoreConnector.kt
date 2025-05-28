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
