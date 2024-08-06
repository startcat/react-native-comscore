#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RNComscoreModule, RCTEventEmitter)

RCT_EXTERN_METHOD(moduleInit:(RCTPromiseResolveBlock)resolve
        rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXPORT_METHOD(trackView:(NSString *) view)

RCT_EXPORT_METHOD(trackEvent:(NSString *)action category:(NSString *)category)

@end