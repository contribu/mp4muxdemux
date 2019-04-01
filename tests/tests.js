exports.defineAutoTests = function () {
    // before(() => {
    //
    // });

    describe("create", function () {
        it("defined", function () {
            expect(cordova.plugins.mp4muxdemux.create).toBeDefined();
        });

        it("success", function () {
            const result = cordova.plugins.mp4muxdemux.create({});
            expect(result).toEqual(jasmine.any(Object));
        });
    });

    describe("muxDeferred", function () {
        it("defined", function () {
            expect(cordova.plugins.mp4muxdemux.muxDeferred).toBeDefined();
        });
    });

    describe("demuxDeferred", function () {
        it("defined", function () {
            expect(cordova.plugins.mp4muxdemux.demuxDeferred).toBeDefined();
        });
    });

    describe("getAssetInfoDeferred", function () {
        it("defined", function () {
            expect(cordova.plugins.mp4muxdemux.getAssetInfoDeferred).toBeDefined();
        });

        // it("success", function (done) {
        //     cordova.plugins.mp4muxdemux.getAssetInfoDeferred(h264AacMp4Path)
        //         .then((info) => {
        //             expect(info.)
        //             done();
        //         });
        // });
    });

    describe("listDemuxOutputsDeferred", function () {
        it("defined", function () {
            expect(cordova.plugins.mp4muxdemux.listDemuxOutputsDeferred).toBeDefined();
        });
    });
};
