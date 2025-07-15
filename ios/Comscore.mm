#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Comscore, NSObject)

// MARK: - Basic Analytics (Global)
RCT_EXTERN_METHOD(trackView:(NSString *)view)
RCT_EXTERN_METHOD(trackEvent:(NSString *)action withCategory:(NSString *)category)
RCT_EXTERN_METHOD(updatePersistentLabels:(NSString *)publisherId 
                                withFpid:(NSString *)fpid 
                                withFpit:(NSString *)fpit 
                                withFpdm:(NSString *)fpdm 
                                withFpdt:(NSString *)fpdt)
RCT_EXTERN_METHOD(setPersistentLabel:(NSString *)publisherId 
                        withLabelName:(NSString *)labelName 
                       withLabelValue:(NSString *)labelValue)
RCT_EXTERN_METHOD(notifyUxActive)
RCT_EXTERN_METHOD(notifyUxInactive)

// MARK: - Streaming Analytics (Por instancias)
RCT_EXTERN_METHOD(initializeStreaming:(nonnull NSNumber *)tag 
                     comscoreMetadata:(NSDictionary *)comscoreMetadata 
                        comscoreConfig:(NSDictionary *)comscoreConfig)

RCT_EXTERN_METHOD(updateStreaming:(nonnull NSNumber *)tag 
                 comscoreMetadata:(NSDictionary *)comscoreMetadata)

RCT_EXTERN_METHOD(setPersistentLabelsStreaming:(nonnull NSNumber *)tag 
                                        labels:(NSDictionary *)labels)

RCT_EXTERN_METHOD(setPersistentLabelStreaming:(nonnull NSNumber *)tag 
                                        label:(NSString *)label 
                                        value:(NSString *)value)

RCT_EXTERN_METHOD(setMetadata:(nonnull NSNumber *)tag 
                     metadata:(NSDictionary *)metadata)

// MARK: - Streaming Playback Events
RCT_EXTERN_METHOD(notifyEnd:(nonnull NSNumber *)tag)
RCT_EXTERN_METHOD(notifyPause:(nonnull NSNumber *)tag)
RCT_EXTERN_METHOD(notifyPlay:(nonnull NSNumber *)tag)
RCT_EXTERN_METHOD(createPlaybackSession:(nonnull NSNumber *)tag)
RCT_EXTERN_METHOD(setDvrWindowLength:(nonnull NSNumber *)tag 
                              length:(nonnull NSNumber *)length)
RCT_EXTERN_METHOD(notifyBufferStop:(nonnull NSNumber *)tag)
RCT_EXTERN_METHOD(notifySeekStart:(nonnull NSNumber *)tag)
RCT_EXTERN_METHOD(startFromDvrWindowOffset:(nonnull NSNumber *)tag 
                                    offset:(nonnull NSNumber *)offset)
RCT_EXTERN_METHOD(startFromPosition:(nonnull NSNumber *)tag 
                           position:(nonnull NSNumber *)position)
RCT_EXTERN_METHOD(notifyBufferStart:(nonnull NSNumber *)tag)
RCT_EXTERN_METHOD(notifyChangePlaybackRate:(nonnull NSNumber *)tag 
                                      rate:(nonnull NSNumber *)rate)
RCT_EXTERN_METHOD(destroyStreaming:(nonnull NSNumber *)tag)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end