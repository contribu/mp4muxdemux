exports.defineAutoTests = function () {
    const testDataDir = cordova.file.documentsDirectory + 'test_data/';
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

    // download test data
    beforeAll(function (done) {
        const requests = [
            {
                url: 'https://github.com/contribu/mp4muxdemux/raw/master/tests/data/h264aaclc.mp4'
            },
            {
                url: 'https://github.com/contribu/mp4muxdemux/raw/master/tests/data/h265aaclc.mp4'
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
            {
                url: 'https://github.com/contribu/mp4muxdemux/raw/master/tests/data/aaclc.aac'
            },
            {
                url: 'https://github.com/contribu/mp4muxdemux/raw/master/tests/data/h264.h264'
            },
            {
                url: 'https://github.com/contribu/mp4muxdemux/raw/master/tests/data/h265.h265'
            },
        ];
        console.log(requests);
        let downloadedCount = 0;
        downloader.init({folder: 'test_data', unzip: false, check: true});

        document.addEventListener('DOWNLOADER_downloadSuccess', function(event) {
            event.data.forEach((fileEntry) => {
                console.log('test data downloaded ' + fileEntry.name);
                console.log(fileEntry);
                downloadedCount += 1;
                if (downloadedCount === requests.length) {
                    console.log('test data all downloaded');
                    done();
                }
            });
        });
        document.addEventListener('DOWNLOADER_downloadError', function(err) {
            console.log('test data download failed');
            console.log(err);
            done.fail(err);
        });

        console.log('test data downloading');
        downloader.getMultipleFiles(requests);
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

    describe("mux", function () {
        it("defined", function () {
            expect(cordova.plugins.mp4muxdemux.mux).toBeDefined();
        });

        const tests = [
            {
                name: 'h264 + aac',
                input: {
                    outputPath: cordova.file.dataDirectory + 'h264aaclc_mux.mp4',
                    inputs: [
                        {
                            path: testDataDir +  'h264.h264',
                            timeScale: 600,
                            frameRate: 29.97,
                        },
                        {
                            path: testDataDir + 'aaclc.aac',
                        },
                    ],
                    timeScale: 600,
                },
                output: {
                    fileSize: 7016978,
                    assetInfo: {
                        durationValue: 2201, // It seems that there is some error
                        durationTimeScale: 600,
                        videoFrameRate: 29.97,
                        videoTimeScale: 600,
                    }
                }
            },
            {
                name: 'h265 + aac',
                input: {
                    outputPath: cordova.file.dataDirectory + 'h265aaclc_mux.mp4',
                    inputs: [
                        {
                            path: testDataDir + 'h265.h265',
                            timeScale: 30000,
                            frameRate: 29.97,
                        },
                        {
                            path: testDataDir + 'aaclc.aac',
                        },
                    ],
                    timeScale: 1000,
                },
                output: {
                    fileSize: 233571,
                    assetInfo: {
                        durationValue: 3669, // It seems that there is some error
                        durationTimeScale: 1000,
                        videoFrameRate: 29.97,
                        videoTimeScale: 30000,
                    }
                }
            },
        ];

        tests.forEach((test) => {
            describe(test.name, function () {
                it('success', function (done) {
                    Promise.resolve()
                        .then(() => {
                            console.log('mux start');
                            return cordova.plugins.mp4muxdemux.mux(test.input);
                        })
                        .then((fileEntry) => {
                            console.log('mux succeeded');
                            return new Promise((resolve, reject) => {
                                fileEntry.file(resolve, reject);
                            });
                        })
                        .then((file) => {
                            console.log('file succeeded');
                            console.log(file.size);
                            console.log(test.output.fileSize);
                            expect(file.size / 1024).toBeCloseTo(test.output.fileSize / 1024, 0);
                            return cordova.plugins.mp4muxdemux.getAssetInfo(test.input.outputPath);
                        })
                        .then((info) => {
                            console.log('getAssetInfo succeeded');
                            console.log(info);
                            console.log(test.assetInfo);
                            info.videoFrameRate = +(info.videoFrameRate.toFixed(2));
                            expect(info).toEqual(test.output.assetInfo);
                            done();
                        })
                        .catch(done.fail);
                });
            });
        });
    });

    describe("demux", function () {
        it("defined", function () {
            expect(cordova.plugins.mp4muxdemux.demux).toBeDefined();
        });

        const tests = [
            {
                name: 'h264aaclc.mp4',
                input: {
                    inputPath: testDataDir + 'h264aaclc.mp4',
                    outputDir: cordova.file.dataDirectory + 'h264aaclc'
                },
                output: [{
                    idx: 1,
                    extension: '.h264',
                    fileEntry: {
                        nativeURL: cordova.file.dataDirectory + 'h264aaclc/out_1.h264',
                    },
                    file: {
                        size: 6970158,
                    }
                }, {
                    idx: 2,
                    extension: '.adts',
                    fileEntry: {
                        nativeURL: cordova.file.dataDirectory + 'h264aaclc/out_2.adts',
                    },
                    file: {
                        size: 45449,
                    }
                }]
            },
            {
                name: 'h265aaclc.mp4',
                input: {
                    inputPath: testDataDir + 'h265aaclc.mp4',
                    outputDir: cordova.file.dataDirectory + 'h265aaclc'
                },
                output: [{
                    idx: 1,
                    extension: '.h265',
                    fileEntry: {
                        nativeURL: cordova.file.dataDirectory + 'h265aaclc/out_1.h265',
                    },
                    file: {
                        size: 185903,
                    }
                }, {
                    idx: 2,
                    extension: '.adts',
                    fileEntry: {
                        nativeURL: cordova.file.dataDirectory + 'h265aaclc/out_2.adts',
                    },
                    file: {
                        size: 45146,
                    }
                }]
            },
        ];

        tests.forEach((test) => {
            describe(test.name, function () {
                it("success", function (done) {
                    Promise.resolve()
                        .then(() => {
                            console.log('demux start');
                            return cordova.plugins.mp4muxdemux.demux(test.input);
                        })
                        .then((results) => {
                            console.log('demux succeeded');
                            console.log(results);
                            console.log(test.output);
                            expect(results.length).toEqual(test.output.length);
                            for (let i = 0; i < results.length; i++) {
                                expect(results[i].idx).toEqual(test.output[i].idx);
                                expect(results[i].extension).toEqual(test.output[i].extension);
                                expect(results[i].fileEntry.nativeURL).toEqual(test.output[i].fileEntry.nativeURL);
                                expect(results[i].file.size / 1024).toBeCloseTo(test.output[i].file.size / 1024, 0);
                            }
                            done();
                        })
                        .catch(done.fail);
                });
            });
        });
    });

    describe("getAssetInfo", function () {
        it("defined", function () {
            expect(cordova.plugins.mp4muxdemux.getAssetInfo).toBeDefined();
        });

        const tests = [
            {
                name: 'h264aaclc.mp4',
                input: testDataDir + 'h264aaclc.mp4',
                output: {
                    durationValue: 2162,
                    durationTimeScale: 600,
                    videoFrameRate: 29.97,
                    videoTimeScale: 600,
                }
            },
            {
                name: 'h265aaclc.mp4',
                input: testDataDir + 'h265aaclc.mp4',
                output: {
                    durationValue: 3604,
                    durationTimeScale: 1000,
                    videoFrameRate: 29.97,
                    videoTimeScale: 30000,
                }
            },
        ];

        tests.forEach((test) => {
            describe(test.name, function () {
                it("success", function (done) {
                    Promise.resolve()
                        .then(() => {
                            console.log('getAssetInfo start');
                            return cordova.plugins.mp4muxdemux.getAssetInfo(test.input);
                        })
                        .then((info) => {
                            console.log('getAssetInfo succeeded');
                            console.log(info);
                            console.log(test.output);
                            info.videoFrameRate = +(info.videoFrameRate.toFixed(2));
                            expect(info).toEqual(test.output);
                            done();
                        })
                        .catch(done.fail);
                });
            });
        });
    });
};
