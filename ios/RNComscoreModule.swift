import Foundation
import AVFoundation
import AVKit
import React
import Promises

@objc(RNComscoreModule)
class RNComscoreModule: RCTEventEmitter {
  
  public static var emitter: RCTEventEmitter!
  
  override init() {
      super.init()
      RNComscoreModule.emitter = self
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool { return true }
  
  @objc(moduleInit:)
  func moduleInit(_ config:NSDictionary) -> Void {
    
    RCTLog("+++ [ComScore] moduleInit");

    let myPublisherConfig = SCORPublisherConfiguration(builderBlock: { builder in builder?.publisherId = config.value(forKey: "publisherId") as! String })
    SCORAnalytics.configuration().addClient(with:myPublisherConfig)
    
  }
  
  @objc(trackView:)
  func trackView(_ view:String) -> Void {
    
    
  }

  @objc(trackEvent:category:)
  func resumeAll(_ action:String, category:String) -> Void {
    
    
  }
  
}
