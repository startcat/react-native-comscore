#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RNComscoreModule, NSObject)

RCT_EXTERN_METHOD(moduleInit:(NSDictionary *) config)

RCT_EXPORT_METHOD(trackView:(NSString *) view)

RCT_EXPORT_METHOD(trackEvent:(NSString *)action category:(NSString *)category)

@end
