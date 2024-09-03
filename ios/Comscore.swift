import Foundation
import React
import ComScore

@objc(Comscore)
class Comscore: NSObject {

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
        action: category
      ]);
  }

  @objc(updatePersistentLabels:withFpid:withFpit:withFpdm:withFpdt:)
  func updatePersistentLabels(publisherId:String, fpid:String, fpit: String, fpdm: String, fpdt: String) {

      print("+++ [ComScore] updatePersistentLabels");
      SCORAnalytics.configuration().publisherConfiguration(withPublisherId:publisherId)
        .setPersistentLabelWithName("cs_fpid", value:fpid)
        .setPersistentLabelWithName("cs_fpit", value:fpit)
        .setPersistentLabelWithName("cs_fpdm", value:fpdm)
        .setPersistentLabelWithName("cs_fpdt", value:fpdt)

      SCORAnalytics.notifyHiddenEvent()
  }

}
