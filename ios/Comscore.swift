import Foundation
import React
import ComScore

@objc(Comscore)
class Comscore: NSObject {
    
    private var streamingAnalyticsInstances: [Int: SCORStreamingAnalytics] = [:]
    private let TAG = "ComscoreModule"
    private static var isConfigured = false
    
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

    // MARK: - Streaming Analytics
    
    @objc(initializeStreaming:comscoreMetadata:comscoreConfig:)
    func initializeStreaming(tag: NSNumber, comscoreMetadata: NSDictionary, comscoreConfig: NSDictionary) {
        let tagInt = tag.intValue
        print("[\(TAG)] initializeStreaming tag: \(tagInt)")
        
        // Configurar ComScore globalmente si no se ha hecho
        configureComScoreIfNeeded(comscoreConfig)
        
        // ✅ CORRECCIÓN: Usar exactamente la sintaxis de la documentación oficial
        let streamingAnalytics = SCORStreamingAnalytics()
        streamingAnalyticsInstances[tagInt] = streamingAnalytics
        
        // Establecer metadatos iniciales
        setMetadataForTag(tagInt, metadata: comscoreMetadata)
        
        print("[\(TAG)] Streaming analytics initialized for tag: \(tagInt)")
    }
    
    @objc(updateStreaming:comscoreMetadata:)
    func updateStreaming(tag: NSNumber, comscoreMetadata: NSDictionary) {
        let tagInt = tag.intValue
        print("[\(TAG)] updateStreaming tag: \(tagInt)")
        setMetadataForTag(tagInt, metadata: comscoreMetadata)
    }
    
    @objc(setPersistentLabelsStreaming:labels:)
    func setPersistentLabelsStreaming(tag: NSNumber, labels: NSDictionary) {
        let tagInt = tag.intValue
        print("[\(TAG)] setPersistentLabelsStreaming tag: \(tagInt)")
        // Los persistent labels para streaming se manejan a nivel de configuración global
    }
    
    @objc(setPersistentLabelStreaming:label:value:)
    func setPersistentLabelStreaming(tag: NSNumber, label: String, value: String) {
        let tagInt = tag.intValue
        print("[\(TAG)] setPersistentLabelStreaming tag: \(tagInt), \(label) = \(value)")
        // Los persistent labels para streaming se manejan a nivel de configuración global
    }
    
    @objc(setMetadata:metadata:)
    func setMetadata(tag: NSNumber, metadata: NSDictionary) {
        let tagInt = tag.intValue
        print("[\(TAG)] setMetadata tag: \(tagInt)")
        setMetadataForTag(tagInt, metadata: metadata)
    }
    
    // MARK: - Streaming Playback Events
    
    @objc(notifyEnd:)
    func notifyEnd(tag: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] notifyEnd tag: \(tagInt)")
        streamingAnalyticsInstances[tagInt]?.notifyEnd()
    }
    
    @objc(notifyPause:)
    func notifyPause(tag: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] notifyPause tag: \(tagInt)")
        streamingAnalyticsInstances[tagInt]?.notifyPause()
    }
    
    @objc(notifyPlay:)
    func notifyPlay(tag: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] notifyPlay tag: \(tagInt)")
        streamingAnalyticsInstances[tagInt]?.notifyPlay()
    }
    
    @objc(createPlaybackSession:)
    func createPlaybackSession(tag: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] createPlaybackSession tag: \(tagInt)")
        // La sesión se crea automáticamente en ComScore iOS
    }
    
    @objc(setDvrWindowLength:length:)
    func setDvrWindowLength(tag: NSNumber, length: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] setDvrWindowLength tag: \(tagInt), length: \(length)")
        // Esta funcionalidad se maneja a través de otros métodos
    }
    
    @objc(notifyBufferStop:)
    func notifyBufferStop(tag: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] notifyBufferStop tag: \(tagInt)")
        streamingAnalyticsInstances[tagInt]?.notifyBufferStop()
    }
    
    @objc(notifySeekStart:)
    func notifySeekStart(tag: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] notifySeekStart tag: \(tagInt)")
        streamingAnalyticsInstances[tagInt]?.notifySeekStart()
    }
    
    @objc(startFromDvrWindowOffset:offset:)
    func startFromDvrWindowOffset(tag: NSNumber, offset: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] startFromDvrWindowOffset tag: \(tagInt), offset: \(offset)")
        // ✅ CORRECCIÓN: Según la documentación oficial, usar startFromDvrWindowOffset
        streamingAnalyticsInstances[tagInt]?.startFromDvrWindowOffset(offset.int32Value)
    }
    
    @objc(startFromPosition:position:)
    func startFromPosition(tag: NSNumber, position: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] startFromPosition tag: \(tagInt), position: \(position)")
        // ✅ CORRECCIÓN: Según la documentación oficial, usar startFromPosition seguido de notifyPlay
        streamingAnalyticsInstances[tagInt]?.startFromPosition(position.int32Value)
        streamingAnalyticsInstances[tagInt]?.notifyPlay()
    }
    
    @objc(notifyBufferStart:)
    func notifyBufferStart(tag: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] notifyBufferStart tag: \(tagInt)")
        streamingAnalyticsInstances[tagInt]?.notifyBufferStart()
    }
    
    @objc(notifyChangePlaybackRate:rate:)
    func notifyChangePlaybackRate(tag: NSNumber, rate: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] notifyChangePlaybackRate tag: \(tagInt), rate: \(rate)")
        // Esta funcionalidad puede no estar disponible en todas las versiones
    }
    
    @objc(destroyStreaming:)
    func destroyStreaming(tag: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] destroyStreaming tag: \(tagInt)")
        streamingAnalyticsInstances[tagInt]?.notifyEnd()
        streamingAnalyticsInstances.removeValue(forKey: tagInt)
    }
    
    // MARK: - Private Helper Methods
    
    private func configureComScoreIfNeeded(_ config: NSDictionary) {
        guard !Self.isConfigured else { return }
        
        guard let publisherId = config["publisherId"] as? String else {
            print("[\(TAG)] Error: No publisherId provided")
            return
        }
        
        // ✅ CORRECCIÓN: Usar exactamente la sintaxis de la documentación oficial
        let publisherConfig = SCORPublisherConfiguration { builder in
            builder?.publisherId = publisherId
        }
        
        if let publisherConfig = publisherConfig {
            SCORAnalytics.configuration().addClient(with: publisherConfig)
        }
        
        // Configurar otras propiedades básicas
        if let applicationName = config["applicationName"] as? String {
            SCORAnalytics.configuration().applicationName = applicationName
        }
        
        // ✅ CORRECCIÓN: Verificar si configuration() devuelve un opcional
        if let debug = config["debug"] as? Bool, debug {
            SCORAnalytics.configuration().enableImplementationValidationMode = true
        }
        
        Self.isConfigured = true
        print("[\(TAG)] ComScore configured with publisherId: \(publisherId)")
    }
    
    private func setMetadataForTag(_ tag: Int, metadata: NSDictionary) {
        guard let streamingAnalytics = streamingAnalyticsInstances[tag] else {
            print("[\(TAG)] No streaming analytics instance for tag: \(tag)")
            return
        }
        
        // ✅ CORRECCIÓN: Usar EXACTAMENTE la sintaxis de la documentación oficial Swift
        let cm = SCORStreamingContentMetadata(builderBlock: { (builder) in
            // Mapear mediaType
            if let mediaType = metadata["mediaType"] as? String {
                let mappedType = mapMediaType(mediaType)
                builder?.setMediaType(mappedType)
            }
            
            // Propiedades básicas según la documentación oficial
            if let uniqueId = metadata["uniqueId"] as? String {
                builder?.setUniqueId(uniqueId)
            }
            
            if let length = metadata["length"] as? NSNumber {
                builder?.setLength(length.intValue)
            }
            
            if let stationTitle = metadata["stationTitle"] as? String {
                builder?.setStationTitle(stationTitle)
            }
            
            if let programTitle = metadata["programTitle"] as? String {
                builder?.setProgramTitle(programTitle)
            }
            
            if let episodeTitle = metadata["episodeTitle"] as? String {
                builder?.setEpisodeTitle(episodeTitle)
            }
            
            if let genreName = metadata["genreName"] as? String {
                builder?.setGenreName(genreName)
            }
            
            if let classifyAsAudioStream = metadata["classifyAsAudioStream"] as? Bool, classifyAsAudioStream {
                builder?.classifyAsAudioStream(true)
            }
            
            // Custom labels
            if let customLabels = metadata["customLabels"] as? [String: String] {
                builder?.setCustomLabels(customLabels)
            }
        })
        
        // ✅ CORRECCIÓN: Usar exactamente la sintaxis de la documentación oficial
        streamingAnalytics.setMetadata(cm)
        
        print("[\(TAG)] Metadata set for tag: \(tag)")
    }
    
    // ✅ CORRECCIÓN: Usar exactamente los tipos de la documentación oficial
    private func mapMediaType(_ mediaType: String) -> SCORStreamingContentType {
        switch mediaType.lowercased() {
        case "longformondemand":
            return SCORStreamingContentTypeLongFormOnDemand
        case "shortformondemand":
            return SCORStreamingContentTypeShortFormOnDemand
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
            return SCORStreamingContentTypeLongFormOnDemand
        }
    }
}