#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Comscore, NSObject)

RCT_EXTERN_METHOD(trackView:(NSString *)name)

RCT_EXTERN_METHOD(trackEvent:(NSString *)action withCategory:(NSString *)category)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
