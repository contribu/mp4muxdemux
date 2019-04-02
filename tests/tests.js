const _ = require('lodash');

exports.defineAutoTests = function () {
    let testFiles = {};

    // download test data
    beforeAll((done) => {
        downloader.init({folder: "test_data", unzip: false, check: true});

        document.addEventListener('DOWNLOADER_downloadSuccess', function(event) {
            _.each(event.data, (fileEntry) => {
                testFiles[fileEntry.name] = fileEntry;
            });
            done();
        });
        downloader.getMultipleFiles([
            {
                url: 'https://github.com/contribu/mp4muxdemux/raw/master/tests/data/h264aaclc.mp4'
            },
            {
                url: 'https://github.com/contribu/mp4muxdemux/raw/master/tests/data/h264dolbyac3.mp4'
            },
            {
                url: 'https://github.com/contribu/mp4muxdemux/raw/master/tests/data/h264dolbyac3.mp4'
            },
            {
                url: 'https://github.com/contribu/mp4muxdemux/raw/master/tests/data/h265dolbyac3.mp4'
            },
            {
                url: 'https://github.com/contribu/mp4muxdemux/raw/master/tests/data/mpeg4spaaclc.mp4'
            },
        ]);
    });

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

        // const tests = [
        //     {
        //         name: 'h264aaclc.mp4',
        //         input: testFiles['h264aaclc.mp4'].nativeURL,
        //         output: {
        //             videoFrameRate: 1,
        //             videoTimeScale: 1,
        //         }
        //     },
        // ];
        //
        // _.each(tests, (test) => {
        //     describe(test.name, function () {
        //         it("success", function (done) {
        //             cordova.plugins.mp4muxdemux.getAssetInfoDeferred(test.input)
        //                 .then((info) => {
        //                     expect(info).toEqual(test.output);
        //                     done();
        //                 });
        //         });
        //     });
        // });
    });

    describe("listDemuxOutputsDeferred", function () {
        it("defined", function () {
            expect(cordova.plugins.mp4muxdemux.listDemuxOutputsDeferred).toBeDefined();
        });
    });
};
