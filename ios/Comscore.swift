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
    
    // MARK: - Streaming Playback Events
    
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
        comscoreConnectors[tagInt]?.createPlaybackSession()
    }
    
    @objc(setDvrWindowLength:length:)
    func setDvrWindowLength(tag: NSNumber, length: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] setDvrWindowLength tag: \(tagInt)")
        comscoreConnectors[tagInt]?.setDvrWindowLength(length.int64Value)
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
        print("[\(TAG)] startFromDvrWindowOffset tag: \(tagInt)")
        comscoreConnectors[tagInt]?.startFromDvrWindowOffset(offset.int64Value)
    }
    
    @objc(startFromPosition:position:)
    func startFromPosition(tag: NSNumber, position: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] startFromPosition tag: \(tagInt)")
        comscoreConnectors[tagInt]?.startFromPosition(position.int64Value)
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
        print("[\(TAG)] notifyChangePlaybackRate tag: \(tagInt)")
        comscoreConnectors[tagInt]?.notifyChangePlaybackRate(rate.floatValue)
    }
    
    @objc(destroyStreaming:)
    func destroyStreaming(tag: NSNumber) {
        let tagInt = tag.intValue
        print("[\(TAG)] destroyStreaming tag: \(tagInt)")
        comscoreConnectors[tagInt]?.destroy()
        comscoreConnectors.removeValue(forKey: tagInt)
    }
    
    // MARK: - Utility Methods
    
    private func mapLabels(_ labels: NSDictionary) -> [String: String] {
        var result: [String: String] = [:]
        for (key, value) in labels {
            if let keyString = key as? String {
                result[keyString] = String(describing: value)
            }
        }
        return result
    }
    
    private func mapConfig(_ config: NSDictionary) -> ComscoreConfiguration {
        let publisherId = config["publisherId"] as? String ?? ""
        let applicationName = config["applicationName"] as? String ?? ""
        let usagePropertiesAutoUpdateMode = mapUsagePropertiesAutoUpdateMode(
            config["usagePropertiesAutoUpdateMode"] as? String ?? "foregroundOnly"
        )
        let userConsent = config["userConsent"] as? String ?? "1"
        let secureTransmission = config["secureTransmission"] as? Bool ?? true
        let debug = config["debug"] as? Bool ?? false
        
        return ComscoreConfiguration(
            publisherId: publisherId,
            applicationName: applicationName,
            usagePropertiesAutoUpdateMode: usagePropertiesAutoUpdateMode,
            userConsent: userConsent,
            secureTransmission: secureTransmission,
            debug: debug
        )
    }
    
    private func mapUsagePropertiesAutoUpdateMode(_ mode: String) -> SCORUsagePropertiesAutoUpdateMode {
        switch mode.lowercased() {
        case "foregroundonly":
            return .foregroundOnly
        case "foregroundandbackground":
            return .foregroundAndBackground
        case "disabled":
            return .disabled
        default:
            return .foregroundOnly
        }
    }
    
    private func mapMetadata(_ metadata: NSDictionary) -> ComscoreMetaData {
        return ComscoreMetaData(
            mediaType: mapMediaType(metadata["mediaType"] as? String),
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
    
    private func mapMediaType(_ mediaType: String?) -> SCORStreamingContentType {
        guard let mediaType = mediaType else { return .longFormOnDemand }
        
        switch mediaType.lowercased() {
        case "longformondemand":
            return .longFormOnDemand
        case "shortformondemand":
            return .shortFormOnDemand
        case "live":
            return .live
        case "usergenerated":
            return .userGenerated
        case "buzzbeater":
            return .buzzBeater
        case "other":
            return .other
        default:
            return .longFormOnDemand
        }
    }
}

// MARK: - Supporting Classes

struct ComscoreConfiguration {
    let publisherId: String
    let applicationName: String
    let usagePropertiesAutoUpdateMode: SCORUsagePropertiesAutoUpdateMode
    let userConsent: String
    let secureTransmission: Bool
    let debug: Bool
}

struct ComscoreMetaData {
    let mediaType: SCORStreamingContentType
    let uniqueId: String?
    let length: NSNumber?
    let stationTitle: String?
    let programTitle: String?
    let episodeTitle: String?
    let genreName: String?
    let classifyAsAudioStream: Bool
    let customLabels: [String: String]
}

class ComscoreConnector {
    private let streamingAnalytics: SCORStreamingAnalytics
    private let TAG = "ComscoreConnector"
    private var startedTracking = false
    
    init(configuration: ComscoreConfiguration, metadata: ComscoreMetaData) {
        self.streamingAnalytics = SCORStreamingAnalytics()
        initialize(configuration: configuration, metadata: metadata)
    }
    
    private func initialize(configuration: ComscoreConfiguration, metadata: ComscoreMetaData) {
        if startedTracking {
            return
        }
        startedTracking = true
        
        if configuration.debug {
            print("[\(TAG)] initialize: starting")
            print("[\(TAG)] initialize: configuration=[publisherId=\(configuration.publisherId), appName=\(configuration.applicationName), debug=\(configuration.debug)]")
            print("[\(TAG)] initialize: metadata=\(metadata)")
        }
        
        // Configure Analytics
        let publisherConfig = SCORPublisherConfiguration { builder in
            builder?.publisherId = configuration.publisherId
            builder?.secureTransmission = configuration.secureTransmission
            
            if configuration.userConsent == "1" || configuration.userConsent == "0" {
                builder?.persistentLabels = ["cs_ucfr": configuration.userConsent]
            }
        }
        
        if let config = publisherConfig {
            SCORAnalytics.configuration().addClient(with: config)
        }
        
        SCORAnalytics.configuration().usagePropertiesAutoUpdateMode = configuration.usagePropertiesAutoUpdateMode
        SCORAnalytics.configuration().applicationName = configuration.applicationName
        
        if configuration.debug {
            SCORAnalytics.configuration().enableImplementationValidationMode = true
        }
        
        // Set initial metadata
        setMetadata(metadata)
    }
    
    func update(_ metadata: ComscoreMetaData) {
        if #available(iOS 11.0, *) {
            print("[\(TAG)] update")
        }
        setMetadata(metadata)
    }
    
    func setPersistentLabels(_ labels: [String: String]) {
        if #available(iOS 11.0, *) {
            print("[\(TAG)] setPersistentLabels")
        }
        for (key, value) in labels {
            streamingAnalytics.setPersistentLabel(withName: key, value: value)
        }
    }
    
    func setPersistentLabel(_ label: String, value: String) {
        if #available(iOS 11.0, *) {
            print("[\(TAG)] setPersistentLabel: \(label) = \(value)")
        }
        streamingAnalytics.setPersistentLabel(withName: label, value: value)
    }
    
    func setMetadata(_ metadata: ComscoreMetaData) {
        if #available(iOS 11.0, *) {
            print("[\(TAG)] setMetadata")
        }
        
        let contentMetadata = SCORStreamingContentMetadata()
        contentMetadata.mediaType = metadata.mediaType
        contentMetadata.uniqueId = metadata.uniqueId
        contentMetadata.length = metadata.length
        contentMetadata.stationTitle = metadata.stationTitle
        contentMetadata.programTitle = metadata.programTitle
        contentMetadata.episodeTitle = metadata.episodeTitle
        contentMetadata.genreName = metadata.genreName
        contentMetadata.classifyAsAudioStream = metadata.classifyAsAudioStream
        contentMetadata.customLabels = metadata.customLabels
        
        streamingAnalytics.setMetadata(contentMetadata)
    }
    
    // MARK: - Playback Events
    
    func notifyEnd() {
        if #available(iOS 11.0, *) {
            print("[\(TAG)] notifyEnd")
        }
        streamingAnalytics.notifyPause()
    }
    
    func notifyPause() {
        if #available(iOS 11.0, *) {
            print("[\(TAG)] notifyPause")
        }
        streamingAnalytics.notifyPause()
    }
    
    func notifyPlay() {
        if #available(iOS 11.0, *) {
            print("[\(TAG)] notifyPlay")
        }
        streamingAnalytics.notifyPlay()
    }
    
    func createPlaybackSession() {
        if #available(iOS 11.0, *) {
            print("[\(TAG)] createPlaybackSession")
        }
        streamingAnalytics.createPlaybackSession()
    }
    
    func setDvrWindowLength(_ length: Int64) {
        if #available(iOS 11.0, *) {
            print("[\(TAG)] setDvrWindowLength: \(length)")
        }
        streamingAnalytics.setDvrWindowLength(length)
    }
    
    func notifyBufferStop() {
        if #available(iOS 11.0, *) {
            print("[\(TAG)] notifyBufferStop")
        }
        streamingAnalytics.notifyBufferStop()
    }
    
    func notifySeekStart() {
        if #available(iOS 11.0, *) {
            print("[\(TAG)] notifySeekStart")
        }
        streamingAnalytics.notifySeekStart()
    }
    
    func startFromDvrWindowOffset(_ offset: Int64) {
        if #available(iOS 11.0, *) {
            print("[\(TAG)] startFromDvrWindowOffset: \(offset)")
        }
        streamingAnalytics.startFromDvrWindowOffset(offset)
    }
    
    func startFromPosition(_ position: Int64) {
        if #available(iOS 11.0, *) {
            print("[\(TAG)] startFromPosition: \(position)")
        }
        streamingAnalytics.startFromPosition(position)
    }
    
    func notifyBufferStart() {
        if #available(iOS 11.0, *) {
            print("[\(TAG)] notifyBufferStart")
        }
        streamingAnalytics.notifyBufferStart()
    }
    
    func notifyChangePlaybackRate(_ rate: Float) {
        if #available(iOS 11.0, *) {
            print("[\(TAG)] notifyChangePlaybackRate: \(rate)")
        }
        streamingAnalytics.notifyChangePlaybackRate(rate)
    }
    
    func destroy() {
        if #available(iOS 11.0, *) {
            print("[\(TAG)] destroy")
        }
        // Cleanup if needed
    }
}