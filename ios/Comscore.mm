#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Comscore, NSObject)

RCT_EXTERN_METHOD(trackView:(NSString *)name)

RCT_EXTERN_METHOD(trackEvent:(NSString *)action withCategory:(NSString *)category)

RCT_EXTERN_METHOD(updatePersistentLabels:(NSString *)publisherId withFpid:(NSString *)fpid withFpit:(NSString *)fpit withFpdm:(NSString *)fpdm withFpdt:(NSString *)fpdt)

RCT_EXTERN_METHOD(setPersistentLabel:(NSString *)publisherId withLabelName:(NSString *)labelName withLabelValue:(NSString *)labelValue)

RCT_EXTERN_METHOD(notifyUxActive)

RCT_EXTERN_METHOD(notifyUxInactive)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
