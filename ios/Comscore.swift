import Foundation
import React

@objc(Comscore)
class Comscore: NSObject {

  @objc(multiply:withB:withResolver:withRejecter:)
  func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
    resolve(a*b)
  }

  @objc(trackView:)
  func trackView(_ view:String) -> Void {
    RCTLog("+++ [ComScore] trackView");
    
  }

  @objc(trackEvent:category:)
  func trackEvent(_ action:String, category:String) -> Void {
    RCTLog("+++ [ComScore] trackEvent");
    
  }
}
