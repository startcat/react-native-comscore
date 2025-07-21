import Foundation
import React
import ComScore

@objc(Comscore)
class Comscore: NSObject {
    
    private var comscoreConnectors: [Int: ComscoreConnector] = [:]
    private let TAG = "ComscoreModule"
    private static var isGlobalConfigurationInitialized = false
    
    // MARK: - Basic Analytics (Global)
    
    @objc(trackView:)
    func trackView(view: String) {
        print("[\(TAG)] trackView: \(view)")
        let labels = [
            "ns_category": view.replacingOccurrences(of: "/", with: ".")
        ]
        SCORAnalytics.notifyViewEvent(withLabels: labels)
    }

    @objc(trackEvent:withCategory:)
    func trackEvent(action: String, category: String) {
        print("[\(TAG)] trackEvent: \(action) - \(category)")
        let comScoreEventName = "\(category).\(action)"
        let labels = [
            "event": comScoreEventName
        ]
        SCORAnalytics.notifyViewEvent(withLabels: labels)
    }

    @objc(updatePersistentLabels:withFpid:withFpit:withFpdm:withFpdt:)
    func updatePersistentLabels(publisherId: String, fpid: String, fpit: String, fpdm: String, fpdt: String) {
        print("[\(TAG)] updatePersistentLabels")
        let publisherConfig = SCORAnalytics.configuration().publisherConfiguration(withPublisherId: publisherId)
        
        publisherConfig?.setPersistentLabel(withName: "cs_fpid", value: fpid)
        publisherConfig?.setPersistentLabel(withName: "cs_fpit", value: fpit)
        publisherConfig?.setPersistentLabel(withName: "cs_fpdm", value: fpdm)
        publisherConfig?.setPersistentLabel(withName: "cs_fpdt", value: fpdt)

        SCORAnalytics.notifyHiddenEvent()
    }

    @objc(setPersistentLabel:withLabelName:withLabelValue:)
    func setPersistentLabel(publisherId: String, labelName: String, labelValue: String) {
        print("[\(TAG)] setPersistentLabel: \(labelName) = \(labelValue)")
        let publisherConfig = SCORAnalytics.configuration().publisherConfiguration(withPublisherId: publisherId)
        publisherConfig?.setPersistentLabel(withName: labelName, value: labelValue)
        SCORAnalytics.notifyHiddenEvent()
    }

    @objc(notifyUxActive)
    func notifyUxActive() {
        print("[\(TAG)] notifyUxActive")
        SCORAnalytics.notifyUxActive()
    }

    @objc(notifyUxInactive)
    func notifyUxInactive() {
        print("[\(TAG)] notifyUxInactive")
        SCORAnalytics.notifyUxInactive()
    }

    // MARK: - Streaming Analytics (Por instancias)
    
    @objc(initializeStreaming:comscoreMetadata:comscoreConfig:)
    func initializeStreaming(tag: NSNumber, comscoreMetadata: NSDictionary, comscoreConfig: NSDictionary) {
        let tagInt = tag.intValue
        print("[\(TAG)] initializeStreaming tag: \(tagInt)")
        
        guard let publisherId = comscoreConfig["publisherId"] as? String, !publisherId.isEmpty else {
            print("[\(TAG)] Error: Invalid publisherId")
            return
        }
        
        // Inicializar configuración global solo una vez
        initializeGlobalComscoreConfiguration(comscoreConfig)
        
        let connector = ComscoreConnector(
            configuration: mapConfig(comscoreConfig),
            metadata: mapMetadata(comscoreMetadata)
        )
        
        comscoreConnectors[tagInt] = connector
    }
    
    @objc(updateStreaming:comscoreMetadata:)
    func updateStreaming(tag: NSNumber, comscoreMetadata: NSDictionary) {
        let tagInt = tag.intValue
        print("[\(TAG)] updateStreaming tag: \(tagInt)")
        comscoreConnectors[tagInt]?.update(mapMetadata(comscoreMetadata))
    }
    
    @objc(setPersistentLabelsStreaming:labels:)
    func setPersistentLabelsStreaming(tag: NSNumber, labels: NSDictionary) {
        let tagInt = tag.intValue
        print("[\(TAG)] setPersistentLabelsStreaming tag: \(tagInt)")
        comscoreConnectors[tagInt]?.setPersistentLabels(mapLabels(labels))
    }
    
    @objc(setPersistentLabelStreaming:label:value:)
    func setPersistentLabelStreaming(tag: NSNumber, label: String, value: String) {
        let tagInt = tag.intValue
        print("[\(TAG)] setPersistentLabelStreaming tag: \(tagInt)")
        comscoreConnectors[tagInt]?.setPersistentLabel(label, value: value)
    }
    
    @objc(setMetadata:metadata:)
    func setMetadata(tag: NSNumber, metadata: NSDictionary) {
        let tagInt = tag.intValue
        print("[\(TAG)] setMetadata tag: \(tagInt)")
        comscoreConnectors[tagInt]?.setMetadata(mapMetadata(metadata))
    }
    
    // MARK: - Streaming Playback Events (Todos los métodos del .mm)
    
    @objc(notifyEnd:)
    func notifyEnd(tag: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] notifyEnd tag: \(tagInt)")
        comscoreConnectors[tagInt]?.notifyEnd()
    }
    
    @objc(notifyPause:)
    func notifyPause(tag: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] notifyPause tag: \(tagInt)")
        comscoreConnectors[tagInt]?.notifyPause()
    }
    
    @objc(notifyPlay:)
    func notifyPlay(tag: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] notifyPlay tag: \(tagInt)")
        comscoreConnectors[tagInt]?.notifyPlay()
    }
    
    @objc(createPlaybackSession:)
    func createPlaybackSession(tag: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] createPlaybackSession tag: \(tagInt)")
        // En ComScore iOS 6.x no hay método separado para crear sesión
        // La sesión se crea automáticamente con setMetadata
    }
    
    @objc(setDvrWindowLength:length:)
    func setDvrWindowLength(tag: NSNumber, length: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] setDvrWindowLength tag: \(tagInt), length: \(length)")
        // Este método no existe en ComScore iOS 6.x
        // Se usa startFromDvrWindowOffset en su lugar
    }
    
    @objc(notifyBufferStop:)
    func notifyBufferStop(tag: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] notifyBufferStop tag: \(tagInt)")
        comscoreConnectors[tagInt]?.notifyBufferStop()
    }
    
    @objc(notifySeekStart:)
    func notifySeekStart(tag: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] notifySeekStart tag: \(tagInt)")
        comscoreConnectors[tagInt]?.notifySeekStart()
    }
    
    @objc(startFromDvrWindowOffset:offset:)
    func startFromDvrWindowOffset(tag: NSNumber, offset: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] startFromDvrWindowOffset tag: \(tagInt), offset: \(offset)")
        comscoreConnectors[tagInt]?.startFromDvrWindowOffset(offset.int32Value)
    }
    
    @objc(startFromPosition:position:)
    func startFromPosition(tag: NSNumber, position: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] startFromPosition tag: \(tagInt), position: \(position)")
        comscoreConnectors[tagInt]?.startFromPosition(position.int32Value)
    }
    
    @objc(notifyBufferStart:)
    func notifyBufferStart(tag: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] notifyBufferStart tag: \(tagInt)")
        comscoreConnectors[tagInt]?.notifyBufferStart()
    }
    
    @objc(notifyChangePlaybackRate:rate:)
    func notifyChangePlaybackRate(tag: NSNumber, rate: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] notifyChangePlaybackRate tag: \(tagInt), rate: \(rate)")
        // Este método no existe en ComScore iOS 6.x
    }
    
    @objc(destroyStreaming:)
    func destroyStreaming(tag: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] destroyStreaming tag: \(tagInt)")
        comscoreConnectors[tagInt]?.notifyEnd()
        comscoreConnectors.removeValue(forKey: tagInt)
    }
    
    // MARK: - Private Methods
    
    private func initializeGlobalComscoreConfiguration(_ config: NSDictionary) {
        guard !Self.isGlobalConfigurationInitialized else { return }
        
        guard let publisherId = config["publisherId"] as? String, !publisherId.isEmpty else {
            print("[\(TAG)] Error: Cannot initialize global config without publisherId")
            return
        }
        
        let comscoreConfig = SCORConfiguration.configuration()!
        
        if let debug = config["debug"] as? Bool, debug {
            comscoreConfig.enableImplementationValidationMode(true)
        }
        
        let publisherConfigBuilder = SCORPublisherConfigurationBuilder(publisherId: publisherId)
        let publisherConfig = publisherConfigBuilder.build()
        comscoreConfig.addClient(withConfiguration: publisherConfig)
        
        SCORAnalytics.start(with: comscoreConfig)
        Self.isGlobalConfigurationInitialized = true
        
        print("[\(TAG)] Global ComScore configuration initialized")
    }
}

// MARK: - ComscoreConnector Class

class ComscoreConnector {
    private let streamingAnalytics: SCORStreamingAnalytics
    private let TAG = "ComscoreConnector"
    
    init(configuration: ComscoreConfig, metadata: ComscoreMetaData) {
        // Crear instancia de streaming analytics (no requiere configuración adicional)
        self.streamingAnalytics = SCORStreamingAnalytics()
        
        // Establecer metadatos iniciales
        setMetadata(metadata)
    }
    
    func update(_ metadata: ComscoreMetaData) {
        print("[\(TAG)] update")
        setMetadata(metadata)
    }
    
    func setPersistentLabels(_ labels: [String: String]) {
        print("[\(TAG)] setPersistentLabels")
        for (key, value) in labels {
            streamingAnalytics.setPersistentLabel(withName: key, value: value)
        }
    }
    
    func setPersistentLabel(_ label: String, value: String) {
        print("[\(TAG)] setPersistentLabel: \(label) = \(value)")
        streamingAnalytics.setPersistentLabel(withName: label, value: value)
    }
    
    func setMetadata(_ metadata: ComscoreMetaData) {
        print("[\(TAG)] setMetadata")
        
        let contentMetadata = SCORStreamingContentMetadata.contentMetadata { (builder) in
            // Mapear tipo de contenido
            if let mediaType = mapContentType(metadata.mediaType) {
                builder?.setMediaType(mediaType)
            }
            
            // Propiedades básicas usando la API oficial
            if let uniqueId = metadata.uniqueId {
                builder?.setUniqueId(uniqueId)
            }
            
            if let length = metadata.length {
                builder?.setLength(length.intValue)
            }
            
            if let stationTitle = metadata.stationTitle {
                builder?.setStationTitle(stationTitle)
            }
            
            if let programTitle = metadata.programTitle {
                builder?.setProgramTitle(programTitle)
            }
            
            if let episodeTitle = metadata.episodeTitle {
                builder?.setEpisodeTitle(episodeTitle)
            }
            
            if let genreName = metadata.genreName {
                builder?.setGenreName(genreName)
            }
            
            // Clasificar como audio stream
            if metadata.classifyAsAudioStream {
                builder?.classifyAsAudioStream(true)
            }
            
            // Custom labels
            if !metadata.customLabels.isEmpty {
                builder?.setCustomLabels(metadata.customLabels)
            }
        }
        
        streamingAnalytics.setMetadata(contentMetadata)
    }
    
    // MARK: - Playback Events
    
    func notifyPlay() {
        print("[\(TAG)] notifyPlay")
        streamingAnalytics.notifyPlay()
    }
    
    func notifyPause() {
        print("[\(TAG)] notifyPause")
        streamingAnalytics.notifyPause()
    }
    
    func notifyEnd() {
        print("[\(TAG)] notifyEnd")
        streamingAnalytics.notifyEnd()
    }
    
    func notifyBufferStart() {
        print("[\(TAG)] notifyBufferStart")
        streamingAnalytics.notifyBufferStart()
    }
    
    func notifyBufferStop() {
        print("[\(TAG)] notifyBufferStop")
        streamingAnalytics.notifyBufferStop()
    }
    
    func notifySeekStart() {
        print("[\(TAG)] notifySeekStart")
        streamingAnalytics.notifySeekStart()
    }
    
    func notifySeekEnd() {
        print("[\(TAG)] notifySeekEnd")
        streamingAnalytics.notifySeekEnd()
    }
    
    func startFromPosition(_ position: Int32) {
        print("[\(TAG)] startFromPosition: \(position)")
        streamingAnalytics.startFromPosition(position)
    }
    
    func startFromDvrWindowOffset(_ offset: Int32) {
        print("[\(TAG)] startFromDvrWindowOffset: \(offset)")
        streamingAnalytics.startFromDvrWindowOffset(offset)
    }
    
    // MARK: - Private Helper
    
    private func mapContentType(_ mediaType: String?) -> SCORStreamingContentType? {
        guard let mediaType = mediaType else { return nil }
        
        switch mediaType.lowercased() {
        case "shortformondemand":
            return SCORStreamingContentTypeShortFormOnDemand
        case "longformondemand":
            return SCORStreamingContentTypeLongFormOnDemand
        case "live":
            return SCORStreamingContentTypeLive
        case "userGeneratedShortFormOnDemand".lowercased():
            return SCORStreamingContentTypeUserGeneratedShortFormOnDemand
        case "userGeneratedLongFormOnDemand".lowercased():
            return SCORStreamingContentTypeUserGeneratedLongFormOnDemand
        case "userGeneratedLive".lowercased():
            return SCORStreamingContentTypeUserGeneratedLive
        case "bumper":
            return SCORStreamingContentTypeBumper
        case "other":
            return SCORStreamingContentTypeOther
        default:
            print("[\(TAG)] Unknown media type: \(mediaType), defaulting to LongFormOnDemand")
            return SCORStreamingContentTypeLongFormOnDemand
        }
    }
}

// MARK: - Helper Functions

extension Comscore {
    
    func mapConfig(_ config: NSDictionary) -> ComscoreConfig {
        return ComscoreConfig(
            publisherId: config["publisherId"] as? String ?? "",
            debug: config["debug"] as? Bool ?? false
        )
    }
    
    func mapMetadata(_ metadata: NSDictionary) -> ComscoreMetaData {
        return ComscoreMetaData(
            mediaType: metadata["mediaType"] as? String,
            uniqueId: metadata["uniqueId"] as? String,
            length: metadata["length"] as? NSNumber,
            stationTitle: metadata["stationTitle"] as? String,
            programTitle: metadata["programTitle"] as? String,
            episodeTitle: metadata["episodeTitle"] as? String,
            genreName: metadata["genreName"] as? String,
            classifyAsAudioStream: metadata["classifyAsAudioStream"] as? Bool ?? false,
            customLabels: mapLabels(metadata["customLabels"] as? NSDictionary ?? [:])
        )
    }
    
    func mapLabels(_ labels: NSDictionary) -> [String: String] {
        var result: [String: String] = [:]
        for (key, value) in labels {
            if let strKey = key as? String, let strValue = value as? String {
                result[strKey] = strValue
            }
        }
        return result
    }
}

// MARK: - Data Classes

struct ComscoreConfig {
    let publisherId: String
    let debug: Bool
}

struct ComscoreMetaData {
    let mediaType: String?
    let uniqueId: String?
    let length: NSNumber?
    let stationTitle: String?
    let programTitle: String?
    let episodeTitle: String?
    let genreName: String?
    let classifyAsAudioStream: Bool
    let customLabels: [String: String]
}