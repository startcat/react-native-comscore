#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Comscore, NSObject)

RCT_EXTERN_METHOD(multiply:(float)a withB:(float)b
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXPORT_METHOD(trackView:(NSString *) view)

RCT_EXPORT_METHOD(trackEvent:(NSString *)action category:(NSString *)category)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
