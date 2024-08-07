#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Comscore, NSObject)

RCT_EXTERN_METHOD(trackView:(NSString *)name)

RCT_EXTERN_METHOD(trackEvent:(NSString *)action withCategory:(NSString *)category)

RCT_EXTERN_METHOD(multiply:(float)a withB:(float)b
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
