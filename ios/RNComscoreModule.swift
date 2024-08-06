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
      DownloadsModule.emitter = self
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool { return true }
  
  @objc(moduleInit:rejecter:)
  func moduleInit(_ resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) -> Void {
    
    addObservers()
    resolve(nil)
    
  }
  
  @objc(trackView:)
  func trackView(_ view:String) -> Void {
    
    
  }

  @objc(trackEvent:category:)
  func resumeAll(_ action:String, category:String) -> Void {
    
    
  }
  
}
