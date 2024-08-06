#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE (RNComscoreModule, NSObject)

RCT_EXTERN_METHOD(moduleInit:(NSDictionary *) config)

RCT_EXPORT_METHOD(trackView:(NSString *) view)

RCT_EXPORT_METHOD(trackEvent:(NSString *)action category:(NSString *)category)

@end
