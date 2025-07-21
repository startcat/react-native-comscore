import Foundation
import React
import ComScore

@objc(Comscore)
class Comscore: NSObject {
    
    private var comscoreConnectors: [Int: ComscoreConnector] = [:]
    private let TAG = "ComscoreModule"
    
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
}

// MARK: - ComscoreConnector Class

class ComscoreConnector {
    private let streamingAnalytics: SCORStreamingAnalytics
    private let TAG = "ComscoreConnector"
    
    init(configuration: ComscoreConfig, metadata: ComscoreMetaData) {
        // Crear la configuración de ComScore
        let config = SCORConfiguration.configuration() as! SCORConfiguration
        
        if configuration.debug {
            config.enableImplementationValidationMode(true)
        }
        
        // Configurar publisher
        let publisherConfigBuilder = SCORPublisherConfigurationBuilder(publisherId: configuration.publisherId)
        
        // secureTransmission no está disponible en iOS - omitir
        // publisherConfigBuilder.secureTransmission(configuration.secureTransmission) // ❌ No disponible
        
        let publisherConfig = publisherConfigBuilder.build()
        config.addClient(withConfiguration: publisherConfig)
        SCORAnalytics.start(with: config)
        
        // Crear instancia de streaming analytics
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
        
        // Usar el patrón de builder de iOS
        let contentMetadata = SCORStreamingContentMetadata(builderBlock: { (builder) in
            // Mapear tipos de contenido de Android a iOS
            if let mediaType = mapContentType(metadata.mediaType) {
                builder?.setMediaType(mediaType)
            }
            
            // Propiedades básicas
            if let uniqueId = metadata.uniqueId {
                builder?.setUniqueId(uniqueId)
            }
            
            if let length = metadata.length {
                builder?.setLength(length)
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
            if let classifyAsAudioStream = metadata.classifyAsAudioStream {
                builder?.classifyAsAudioStream(classifyAsAudioStream)
            }
            
            // Custom labels
            if let customLabels = metadata.customLabels {
                builder?.setCustomLabels(customLabels)
            }
        })
        
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
}

// MARK: - Helper Functions

extension Comscore {
    
    func mapConfig(_ config: NSDictionary) -> ComscoreConfig {
        return ComscoreConfig(
            publisherId: config["publisherId"] as? String ?? "",
            debug: config["debug"] as? Bool ?? false,
            secureTransmission: config["secureTransmission"] as? Bool ?? true // No se usa en iOS
        )
    }
    
    func mapMetadata(_ metadata: NSDictionary) -> ComscoreMetaData {
        return ComscoreMetaData(
            mediaType: metadata["mediaType"] as? String,
            uniqueId: metadata["uniqueId"] as? String,
            length: metadata["length"] as? Int32,
            stationTitle: metadata["stationTitle"] as? String,
            programTitle: metadata["programTitle"] as? String,
            episodeTitle: metadata["episodeTitle"] as? String,
            genreName: metadata["genreName"] as? String,
            classifyAsAudioStream: metadata["classifyAsAudioStream"] as? Bool,
            customLabels: metadata["customLabels"] as? [String: String]
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
    
    // Mapear tipos de contenido de Android a iOS
    func mapContentType(_ mediaType: String?) -> SCORStreamingContentType? {
        guard let mediaType = mediaType else { return nil }
        
        switch mediaType {
        case "shortFormOnDemand":
            return SCORStreamingContentTypeShortFormOnDemand
        case "longFormOnDemand":
            return SCORStreamingContentTypeLongFormOnDemand
        case "live":
            return SCORStreamingContentTypeLive
        case "userGeneratedShortFormOnDemand":
            return SCORStreamingContentTypeUserGeneratedShortFormOnDemand
        case "userGeneratedLongFormOnDemand":
            return SCORStreamingContentTypeUserGeneratedLongFormOnDemand
        case "userGeneratedLive":
            return SCORStreamingContentTypeUserGeneratedLive
        case "bumper":
            return SCORStreamingContentTypeBumper
        case "other":
            return SCORStreamingContentTypeOther
        default:
            print("[\(TAG)] Unknown media type: \(mediaType), defaulting to Other")
            return SCORStreamingContentTypeOther
        }
    }
}

// MARK: - Data Classes

struct ComscoreConfig {
    let publisherId: String
    let debug: Bool
    let secureTransmission: Bool // No se usa en iOS pero se mantiene para compatibilidad
}

struct ComscoreMetaData {
    let mediaType: String?
    let uniqueId: String?
    let length: Int32?
    let stationTitle: String?
    let programTitle: String?
    let episodeTitle: String?
    let genreName: String?
    let classifyAsAudioStream: Bool?
    let customLabels: [String: String]?
}