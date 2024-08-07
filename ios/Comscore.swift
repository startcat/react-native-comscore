import Foundation
import React
import ComScore

@objc(Comscore)
class Comscore: NSObject {

  @objc(multiply:withB:withResolver:withRejecter:)
  func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
    resolve(a*b)
  }

  @objc(trackView:)
  func trackView(name:String) {
      print("+++ [ComScore] trackView");
      SCORAnalytics.notifyViewEvent(withLabels: [
        "name": name
      ]);
    
  }

    @objc(trackEvent:withCategory:)
  func trackEvent(action:String, category:String) {
      print("+++ [ComScore] trackEvent");
      SCORAnalytics.notifyViewEvent(withLabels: [
        action: name
      ]);
  }

}
