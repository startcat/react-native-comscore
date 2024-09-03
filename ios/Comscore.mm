#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Comscore, NSObject)

RCT_EXTERN_METHOD(trackView:(NSString *)name)

RCT_EXTERN_METHOD(trackEvent:(NSString *)action withCategory:(NSString *)category)

RCT_EXTERN_METHOD(updatePersistentLabels:(NSString *)publisherId  withFpid:(NSString *)fpid withFpit:(NSString *)fpit withFpdm:(NSString *)fpdm withFpdt:(NSString *)fpdt)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
