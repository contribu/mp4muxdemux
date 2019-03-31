#import <Cordova/CDVPlugin.h>

@interface CDVMp4muxdemux: CDVPlugin

- (void)mux:(CDVInvokedUrlCommand*)command;
- (void)demux:(CDVInvokedUrlCommand *)command;
- (void)getAssetInfo:(CDVInvokedUrlCommand *)command;

@end
