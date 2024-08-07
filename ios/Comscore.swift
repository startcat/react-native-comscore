import Foundation
import React

@objc(Comscore)
class Comscore: NSObject {

  @objc(multiply:withB:withResolver:withRejecter:)
  func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
    resolve(a*b)
  }

  @objc(trackView:)
  func trackView(name:String) {
      print("+++ [ComScore] trackView");
    
  }

    @objc(trackEvent:withCategory:)
  func trackEvent(action:String, category:String) {
      print("+++ [ComScore] trackEvent");
    
  }
  
}
