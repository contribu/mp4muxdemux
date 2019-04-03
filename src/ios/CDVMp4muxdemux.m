#import "CDVMp4muxdemux.h"
@import AVFoundation;
#import <Cordova/CDVPlugin.h>
#include "muxer.h"
#include "demuxer.h"

@implementation CDVMp4muxdemux

- (void)mux:(CDVInvokedUrlCommand *)command
{
    NSArray* arguments = [command.arguments objectAtIndex:0];

    int argc = 1 + [arguments count];
    const char **argv = malloc(sizeof(char *) * argc);
    argv[0] = "muxer";
    for (int i = 0; i < argc - 1; ++i) {
        argv[1 + i] = [[arguments objectAtIndex:i] UTF8String];
    }

    [self.commandDelegate runInBackground:^{
        CDVPluginResult* pluginResult = nil;

        int exit_status = muxer_main(argc, argv);
        free(argv);

        if (exit_status == 0) {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        } else {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:exit_status];
        }

        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void)demux:(CDVInvokedUrlCommand *)command
{
    NSArray* arguments = [command.arguments objectAtIndex:0];

    int argc = 1 + [arguments count];
    const char **argv = malloc(sizeof(char *) * argc);
    argv[0] = "demuxer";
    for (int i = 0; i < argc - 1; ++i) {
        argv[1 + i] = [[arguments objectAtIndex:i] UTF8String];
    }

    [self.commandDelegate runInBackground:^{
        CDVPluginResult* pluginResult = nil;
        int exit_status = demuxer_main(argc, argv);
        free(argv);

        if (exit_status == 0) {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        } else {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:exit_status];
        }

        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void)getAssetInfo:(CDVInvokedUrlCommand *)command
{
    CDVPluginResult* pluginResult = nil;
    NSString* path = [command.arguments objectAtIndex:0];

    NSDictionary *assetOptions = [NSDictionary dictionaryWithObject:[NSNumber numberWithBool:YES] forKey:AVURLAssetPreferPreciseDurationAndTimingKey];
    AVURLAsset* avAsset = [[AVURLAsset alloc]initWithURL:[NSURL fileURLWithPath:path] options:assetOptions];

    if ([[avAsset tracksWithMediaType:AVMediaTypeVideo] count] > 0) {
        AVAssetTrack *videoTrack = [[avAsset tracksWithMediaType:AVMediaTypeVideo] objectAtIndex:0];
        CGAffineTransform matrix = [videoTrack preferredTransform];
        CMTime duration = [avAsset duration];
        // sometimes, preferredTransform seems to be wrong
        // so, use the tkhd json written by demux
        NSDictionary *result = [NSDictionary dictionaryWithObjectsAndKeys:
                                [NSNumber numberWithDouble:matrix.a], @"matrixA",
                                [NSNumber numberWithDouble:matrix.b], @"matrixB",
                                [NSNumber numberWithDouble:matrix.c], @"matrixC",
                                [NSNumber numberWithDouble:matrix.d], @"matrixD",
                                [NSNumber numberWithDouble:matrix.tx], @"matrixTx",
                                [NSNumber numberWithDouble:matrix.ty], @"matrixTy",
                                [NSNumber numberWithDouble:duration.value], @"durationValue",
                                [NSNumber numberWithDouble:duration.timescale], @"durationTimeScale",
                                [NSNumber numberWithInt:[videoTrack naturalTimeScale]], @"videoTimeScale",
                                [NSNumber numberWithDouble:[videoTrack nominalFrameRate]], @"videoFrameRate",
                                nil];
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:result];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"video track is not found"];
    }

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

@end

