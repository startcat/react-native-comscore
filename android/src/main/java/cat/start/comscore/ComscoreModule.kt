package cat.start.comscore

import android.app.Activity
import android.util.Log
import com.facebook.react.bridge.*
import com.comscore.Analytics
import com.comscore.PublisherConfiguration
import com.comscore.UsagePropertiesAutoUpdateMode
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import cat.start.comscore.integration.*

private const val NAME = "Comscore"
private const val TAG = "ComscoreModule"
private const val PUBLISHER_ID = "publisherId"

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

        Analytics.getConfiguration().enableImplementationValidationMode()
        Analytics.start(activity)
    }

}

class ComscoreModule(reactContext: ReactApplicationContext) :
ReactContextBaseJavaModule(reactContext) {

    private var comscoreConnectors: HashMap<Int, ComscoreConnector> = HashMap()

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun trackView(view: String) {

        val labels = HashMap<String, String>()
        labels.put("ns_category", view.replace("/", "."));
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

    @ReactMethod
    fun setPersistentLabel(publisherId: String, labelName: String, labelValue: String) {

        Analytics.getConfiguration().getPublisherConfiguration(publisherId).setPersistentLabel(labelName, labelValue);
        Analytics.notifyHiddenEvent();

    }

    @ReactMethod
    fun notifyUxActive() {
        Analytics.notifyUxActive()
    }

    @ReactMethod
    fun notifyUxInactive() {
        Analytics.notifyUxInactive()
    }

    /*
     *  Streaming Tag por instancias según player
     *
     */

    @ReactMethod
    fun initializeStreaming(tag: Int, comscoreMetadata: ReadableMap, comscoreConfig: ReadableMap) {

        val customerKey = comscoreConfig.getString(PUBLISHER_ID) ?: ""

        Log.i(TAG, "initializeStreaming")

        if (customerKey.isEmpty()) {
            Log.e(TAG, "Invalid $PUBLISHER_ID")
        } else {
            comscoreConnectors[tag] = ComscoreConnector(
                reactApplicationContext,
                mapConfig(comscoreConfig),
                mapMetadata(comscoreMetadata),
            )
        }

    }

    @ReactMethod
    fun updateStreaming(tag: Int, comscoreMetadata: ReadableMap) {
        Log.i(TAG, "updateStreaming")
        comscoreConnectors[tag]?.update(mapMetadata(comscoreMetadata))
    }

    @ReactMethod
    fun setPersistentLabelsStreaming(tag: Int, labels: ReadableMap) {
        Log.i(TAG, "setPersistentLabelsStreaming")
        comscoreConnectors[tag]?.setPersistentLabels(mapLabels(labels))
    }

    @ReactMethod
    fun setPersistentLabelStreaming(tag: Int, label: String, value: String) {
        Log.i(TAG, "setPersistentLabelStreaming")
        comscoreConnectors[tag]?.setPersistentLabel(label, value)
    }

    @ReactMethod
    fun setMetadata(tag: Int, metadata: ReadableMap) {
        Log.i(TAG, "setMetadata")
        comscoreConnectors[tag]?.setMetadata(mapMetadata(metadata))
    }

    @ReactMethod
    fun notifyEnd(tag: Int) {
        Log.i(TAG, "notifyEnd")
        comscoreConnectors[tag]?.notifyEnd()
    }

    @ReactMethod
    fun notifyPause(tag: Int) {
        Log.i(TAG, "notifyPause")
        comscoreConnectors[tag]?.notifyPause()
    }

    @ReactMethod
    fun notifyPlay(tag: Int) {
        Log.i(TAG, "notifyPlay")
        comscoreConnectors[tag]?.notifyPlay()
    }

    @ReactMethod
    fun createPlaybackSession(tag: Int) {
        Log.i(TAG, "createPlaybackSession")
        comscoreConnectors[tag]?.createPlaybackSession()
    }

    @ReactMethod
    fun setDvrWindowLength(tag: Int, length: Long) {
        Log.i(TAG, "setDvrWindowLength")
        comscoreConnectors[tag]?.setDvrWindowLength(length)
    }

    @ReactMethod
    fun notifyBufferStop(tag: Int) {
        Log.i(TAG, "notifyBufferStop")
        comscoreConnectors[tag]?.notifyBufferStop()
    }

    @ReactMethod
    fun notifySeekStart(tag: Int) {
        Log.i(TAG, "notifySeekStart")
        comscoreConnectors[tag]?.notifySeekStart()
    }

    @ReactMethod
    fun startFromDvrWindowOffset(tag: Int, offset: Long) {
        Log.i(TAG, "startFromDvrWindowOffset")
        comscoreConnectors[tag]?.startFromDvrWindowOffset(offset)
    }

    @ReactMethod
    fun startFromPosition(tag: Int, position: Long) {
        Log.i(TAG, "startFromPosition")
        comscoreConnectors[tag]?.startFromPosition(position)
    }

    @ReactMethod
    fun notifyBufferStart(tag: Int) {
        Log.i(TAG, "notifyBufferStart")
        comscoreConnectors[tag]?.notifyBufferStart()
    }

    @ReactMethod
    fun notifyChangePlaybackRate(tag: Int, rate: Float) {
        Log.i(TAG, "notifyChangePlaybackRate")
        comscoreConnectors[tag]?.notifyChangePlaybackRate(rate)
    }

    @ReactMethod
    fun destroyStreaming(tag: Int) {
        Log.i(TAG, "destroyStreaming")
        comscoreConnectors[tag]?.destroy()
        comscoreConnectors.remove(tag)
    }

    private fun mapLabels(labels: ReadableMap): Map<String, String> {
        return labels.toHashMap().mapValues { it.toString() }
    }

    private fun mapConfig(config: ReadableMap): ComscoreConfiguration {
        return ComscoreConfiguration(
            config.getString("publisherId") ?: "",
            config.getString("applicationName") ?: "",
            mapUsagePropertiesAutoUpdateMode(config.getString("usagePropertiesAutoUpdateMode") ?: "foregroundOnly"),
            config.getString("userConsent") ?: "0",
            secureTransmission = false, // TODO: bring in line with other platforms
            childDirected = false, // TODO: bring in line with other platforms
            debug = config.getBoolean("debug")
        )
    }

    private fun mapUsagePropertiesAutoUpdateMode(usagePropertiesAutoUpdateMode: String): Int {
        return when(usagePropertiesAutoUpdateMode) {
            "foregroundOnly" -> UsagePropertiesAutoUpdateMode.FOREGROUND_ONLY
            "foregroundAndBackground" -> UsagePropertiesAutoUpdateMode.FOREGROUND_AND_BACKGROUND
            "disabled" -> UsagePropertiesAutoUpdateMode.DISABLED
            else -> UsagePropertiesAutoUpdateMode.FOREGROUND_ONLY
        }
    }

    private fun mapDate(date: ReadableMap?): ComscoreDate? {
        val day = date?.getInt("day")
        val month = date?.getInt("month")
        val year = date?.getInt("year")
        return if (day != null && month != null && year != null) {
            ComscoreDate(year, month, day)
        } else {
            null
        }
    }

    private fun mapTime(time: ReadableMap?): ComscoreTime? {
        val hours = time?.getInt("hours")
        val minutes = time?.getInt("minutes")
        return if (hours != null && minutes != null) {
            ComscoreTime(hours, minutes)
        } else {
            null
        }
    }

    private fun mapDimension(dimension: ReadableMap?): ComscoreDimension? {
        val width = dimension?.getInt("width")
        val height = dimension?.getInt("height")
        return if (width != null && height != null) {
            ComscoreDimension(width, height)
        } else {
            null
        }
    }

    private fun mapMediaType(mediaType: String?): ComscoreMediaType {
        return when (mediaType) {
            "longFormOnDemand" -> ComscoreMediaType.LONG_FORM_ON_DEMAND
            "shortFormOnDemand" -> ComscoreMediaType.SHORT_FORM_ON_DEMAND
            "live" -> ComscoreMediaType.LIVE
            "userGeneratedLongFormOnDemand" -> ComscoreMediaType.USER_GENERATED_LONG_FORM_ON_DEMAND
            "userGeneratedShortFormOnDemand" -> ComscoreMediaType.USER_GENERATED_SHORT_FORM_ON_DEMAND
            "userGeneratedLive" -> ComscoreMediaType.USER_GENERATED_LIVE
            "bumper" -> ComscoreMediaType.BUMPER
            else -> ComscoreMediaType.OTHER
        }
    }

    private fun mapFeedType(feedType: String?): ComscoreFeedType? {
        when (feedType) {
            "easthd" -> return ComscoreFeedType.EASTHD
            "westhd" -> return ComscoreFeedType.WESTHD
            "eastsd" -> return ComscoreFeedType.EASTSD
            "westsd" -> return ComscoreFeedType.WESTSD
        }
        return null
    }

    private fun mapDeliveryMode(deliveryMode: String?): ComscoreDeliveryMode? {
        when (deliveryMode) {
            "linear" -> return ComscoreDeliveryMode.LINEAR
            "ondemand" -> return ComscoreDeliveryMode.ON_DEMAND
        }
        return null
    }

    private fun mapDeliverySubscriptionType(deliverySubscriptionType: String?): ComscoreDeliverySubscriptionType? {
        when (deliverySubscriptionType) {
            "traditionalMvpd" -> return ComscoreDeliverySubscriptionType.TRADITIONAL_MVPD
            "virtualMvpd" -> return ComscoreDeliverySubscriptionType.VIRTUAL_MVPD
            "subscription" -> return ComscoreDeliverySubscriptionType.SUBSCRIPTION
            "transactional" -> return ComscoreDeliverySubscriptionType.TRANSACTIONAL
            "advertising" -> return ComscoreDeliverySubscriptionType.ADVERTISING
            "premium" -> return ComscoreDeliverySubscriptionType.PREMIUM
        }
        return null
    }

    private fun mapDeliveryComposition(deliveryComposition: String?): ComscoreDeliveryComposition? {
        when (deliveryComposition) {
            "clean" -> return ComscoreDeliveryComposition.CLEAN
            "embed" -> return ComscoreDeliveryComposition.EMBED
        }
        return null
    }

    private fun mapDeliveryAdvertisementCapability(deliveryAdvertisementCapability: String?): ComscoreDeliveryAdvertisementCapability? {
        when (deliveryAdvertisementCapability) {
            "none" -> return ComscoreDeliveryAdvertisementCapability.NONE
            "dynamicLoad" -> return ComscoreDeliveryAdvertisementCapability.DYNAMIC_LOAD
            "dynamicReplacement" -> return ComscoreDeliveryAdvertisementCapability.DYNAMIC_REPLACEMENT
            "linear1day" -> return ComscoreDeliveryAdvertisementCapability.LINEAR_1DAY
            "linear2day" -> return ComscoreDeliveryAdvertisementCapability.LINEAR_2DAY
            "linear3day" -> return ComscoreDeliveryAdvertisementCapability.LINEAR_3DAY
            "linear4day" -> return ComscoreDeliveryAdvertisementCapability.LINEAR_4DAY
            "linear5day" -> return ComscoreDeliveryAdvertisementCapability.LINEAR_5DAY
            "linear6day" -> return ComscoreDeliveryAdvertisementCapability.LINEAR_6DAY
            "linear7day" -> return ComscoreDeliveryAdvertisementCapability.LINEAR_7DAY
        }
        return null
    }

    private fun mapMediaFormat(mediaFormat: String?): ComscoreMediaFormat? {
        when (mediaFormat) {
            "fullContentEpisode" -> return ComscoreMediaFormat.FULL_CONTENT_EPISODE
            "fullContentMovie" -> return ComscoreMediaFormat.FULL_CONTENT_MOVIE
            "fullContentPodcast" -> return ComscoreMediaFormat.FULL_CONTENT_PODCAST
            "fullContentGeneric" -> return ComscoreMediaFormat.FULL_CONTENT_GENERIC
            "partialContentEpisode" -> return ComscoreMediaFormat.PARTIAL_CONTENT_EPISODE
            "partialContentMovie" -> return ComscoreMediaFormat.PARTIAL_CONTENT_MOVIE
            "partialContentPodcast" -> return ComscoreMediaFormat.PARTIAL_CONTENT_PODCAST
            "partialContentGeneric" -> return ComscoreMediaFormat.PARTIAL_CONTENT_GENERIC
            "previewEpisode" -> return ComscoreMediaFormat.PREVIEW_EPISODE
            "previewMovie" -> return ComscoreMediaFormat.PREVIEW_MOVIE
            "previewGeneric" -> return ComscoreMediaFormat.PREVIEW_GENERIC
            "extraEpisode" -> return ComscoreMediaFormat.EXTRA_EPISODE
            "extraMovie" -> return ComscoreMediaFormat.EXTRA_MOVIE
            "extraGeneric" -> return ComscoreMediaFormat.EXTRA_GENERIC
        }
        return null
    }

    private fun mapDistributionModel(distributionModel: String?): ComscoreDistributionModel? {
        when (distributionModel) {
            "tvAndOnline" -> return ComscoreDistributionModel.TV_AND_ONLINE
            "exclusivelyOnline" -> return ComscoreDistributionModel.EXCLUSIVELY_ONLINE
        }
        return null
    }

    private fun mapMetadata(metadata: ReadableMap): ComscoreMetaData {
        val mediaType = mapMediaType(metadata.getString("mediaType"))
        val uniqueId = metadata.getString("uniqueId")
        val length = if (metadata.hasKey("length")) metadata.getInt("length").toLong() else 0
        val c3 = metadata.getString("c3")
        val c4 = metadata.getString("c4")
        val c6 = metadata.getString("c6")
        val stationTitle = metadata.getString("stationTitle")
        val stationCode = metadata.getString("stationCode")
        val networkAffiliate = metadata.getString("networkAffiliate")
        val publisherName = metadata.getString("publisherName")
        val programTitle = metadata.getString("programTitle")
        val programId = metadata.getString("programId")
        val episodeTitle = metadata.getString("episodeTitle")
        val episodeId = metadata.getString("episodeId")
        val episodeSeasonNumber = metadata.getString("episodeSeasonNumber")
        val episodeNumber = metadata.getString("episodeNumber")
        val genreName = metadata.getString("genreName")
        val genreId = metadata.getString("genreId")
        val carryTvAdvertisementLoad =
            if (metadata.hasKey("carryTvAdvertisementLoad")) metadata.getBoolean("carryTvAdvertisementLoad") else false
        val classifyAsCompleteEpisode =
            if (metadata.hasKey("classifyAsCompleteEpisode")) metadata.getBoolean("classifyAsCompleteEpisode") else false
        val dateOfProduction = mapDate(metadata.getMap("dateOfProduction"))
        val timeOfProduction = mapTime(metadata.getMap("timeOfProduction"))
        val dateOfTvAiring = mapDate(metadata.getMap("dateOfTvAiring"))
        val timeOfTvAiring = mapTime(metadata.getMap("timeOfTvAiring"))
        val dateOfDigitalAiring = mapDate(metadata.getMap("dateOfDigitalAiring"))
        val timeOfDigitalAiring = mapTime(metadata.getMap("timeOfDigitalAiring"))
        val feedType = mapFeedType(metadata.getString("feedType"))
        val classifyAsAudioStream = if (metadata.hasKey("classifyAsAudioStream")) metadata.getBoolean("classifyAsAudioStream") else false
        val deliveryMode = mapDeliveryMode(metadata.getString("deliveryMode"))
        val deliverySubscriptionType =
            mapDeliverySubscriptionType(metadata.getString("deliverySubscriptionType"))
        val deliveryComposition = mapDeliveryComposition(metadata.getString("deliveryComposition"))
        val deliveryAdvertisementCapability =
            mapDeliveryAdvertisementCapability(metadata.getString("deliveryAdvertisementCapability"))
        val mediaFormat = mapMediaFormat(metadata.getString("mediaFormat"))
        val distributionModel = mapDistributionModel(metadata.getString("distributionModel"))
        val playlistTitle = metadata.getString("playlistTitle")
        val totalSegments =
            if (metadata.hasKey("totalSegments")) metadata.getInt("totalSegments") else null
        val clipUrl = metadata.getString("clipUrl")
        val videoDimension = mapDimension(metadata.getMap("videoDimension"))
        val customLabels = metadata.getMap("customLabels")
        return ComscoreMetaData(
            mediaType,
            uniqueId,
            length,
            c3,
            c4,
            c6,
            stationTitle,
            stationCode,
            networkAffiliate,
            publisherName,
            programTitle,
            programId,
            episodeTitle,
            episodeId,
            episodeSeasonNumber,
            episodeNumber,
            genreName,
            genreId,
            carryTvAdvertisementLoad,
            classifyAsCompleteEpisode,
            dateOfProduction,
            timeOfProduction,
            dateOfTvAiring,
            timeOfTvAiring,
            dateOfDigitalAiring,
            timeOfDigitalAiring,
            feedType,
            classifyAsAudioStream,
            deliveryMode,
            deliverySubscriptionType,
            deliveryComposition,
            deliveryAdvertisementCapability,
            mediaFormat,
            distributionModel,
            playlistTitle,
            totalSegments,
            clipUrl,
            videoDimension,
            customLabels?.toHashMap()?.mapValues { it.value.toString() } ?: mapOf()
        )
    }

}

