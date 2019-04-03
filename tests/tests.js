exports.defineAutoTests = function () {
    var originalTimeout;
    let testFiles = {};

    // download test data
    beforeAll((done) => {
        downloader.init({folder: "test_data", unzip: false, check: true});

        document.addEventListener('DOWNLOADER_downloadSuccess', function(event) {
            event.data.forEach((fileEntry) => {
                testFiles[fileEntry.name] = fileEntry;
            });
            console.log('test data donwloaded');
            done();
        });
        document.addEventListener('DOWNLOADER_downloadError', function(err) {
            console.log('test data donwload failed');
            console.log(err);
            done(err);
        });
        
        console.log('test data downloading');
        downloader.getMultipleFiles([
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
        ]);
    });

    beforeEach(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
    });

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
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
                            path: testFiles['h264.h264'].nativeURL,
                            timeScale: 60000,
                            frameRate: 29,
                        },
                        {
                            path: testFiles['aaclc.aac'].nativeURL,
                        },
                    ],
                    timeScale: 60000,
                },
                output: {
                    fileSize: 1000,
                    assetInfo: {
                        durationValue: 3.603,
                        durationTimeScale: 3.603,
                        videoFrameRate: 1,
                        videoTimeScale: 1,
                    }
                }
            },
            {
                name: 'h265 + aac',
                input: {
                    outputPath: cordova.file.dataDirectory + 'h265aaclc_mux.mp4',
                    inputs: [
                        {
                            path: testFiles['h265.h265'].nativeURL,
                            timeScale: 60000,
                            frameRate: 29,
                        },
                        {
                            path: testFiles['aaclc.aac'].nativeURL,
                        },
                    ],
                    timeScale: 60000,
                },
                output: {
                    fileSize: 1000,
                    assetInfo: {
                        durationValue: 3.603,
                        durationTimeScale: 3.603,
                        videoFrameRate: 1,
                        videoTimeScale: 1,
                    }
                }
            },
        ];

        tests.forEach((test) => {
            describe(test.name, function () {
                it("success", function (done) {
                    cordova.plugins.mp4muxdemux.mux(test.input)
                        .then(() => {
                            return new Promise((resolve, reject) => {
                                window.resolveLocalFileSystemURL(test.input.outputPath,
                                    (fileEntry) => {
                                        fileEntry.file(resolve, reject);
                                    }, reject);
                            });
                        })
                        .then((file) => {
                            expect(file.size).toEqual(test.output.fileSize);
                            return cordova.plugins.mp4muxdemux.getAssetInfo(test.input.outputPath);
                        })
                        .then((info) => {
                            expect(info).toEqual(test.assetInfo);
                            done();
                        })
                        .catch((err) => {
                            done('failed ' + err);
                        });
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
                    inputPath: testFiles['h264aaclc.mp4'].nativeURL,
                    outputDir: cordova.file.dataDirectory + '/h264aaclc'
                },
                output: [{
                    idx: 1,
                    extension: '.h264',
                    fileEntry: {
                        nativeURL: cordova.file.dataDirectory + '/h264aaclc/out_1.h264',
                    },
                    file: {
                        size: 1,
                    }
                }, {
                    idx: 2,
                    extension: '.adts',
                    fileEntry: {
                        nativeURL: cordova.file.dataDirectory + '/h264aaclc/out_2.adts',
                    },
                    file: {
                        size: 1,
                    }
                }]
            },
            {
                name: 'h265aaclc.mp4',
                input: {
                    inputPath: testFiles['h265aaclc.mp4'].nativeURL,
                    outputDir: cordova.file.dataDirectory + '/h265aaclc'
                },
                output: [{
                    idx: 1,
                    extension: '.h265',
                    fileEntry: {
                        nativeURL: cordova.file.dataDirectory + '/h265aaclc/out_1.h265',
                    },
                    file: {
                        size: 1,
                    }
                }, {
                    idx: 2,
                    extension: '.adts',
                    fileEntry: {
                        nativeURL: cordova.file.dataDirectory + '/h265aaclc/out_2.adts',
                    },
                    file: {
                        size: 1,
                    }
                }]
            },
        ];

        tests.forEach((test) => {
            describe(test.name, function () {
                it("success", function (done) {
                    cordova.plugins.mp4muxdemux.demux(test.input)
                        .then((results) => {
                            expect(results.length).toEqual(test.output.length);
                            for (let i = 0; i < results.length; i++) {
                                expect(results[i].idx).toEqual(test.output[i].idx);
                                expect(results[i].extension).toEqual(test.output[i].extension);
                                expect(results[i].fileEntry.nativeURL).toEqual(test.output[i].fileEntry.nativeURL);
                                expect(results[i].file.size).toEqual(test.output[i].file.size);
                            }
                            done();
                        })
                        .catch((err) => {
                            done('failed ' + err);
                        });
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
                input: testFiles['h264aaclc.mp4'].nativeURL,
                output: {
                    durationValue: 3.603,
                    durationTimeScale: 3.603,
                    videoFrameRate: 1,
                    videoTimeScale: 600,
                }
            },
            {
                name: 'h265aaclc.mp4',
                input: testFiles['h265aaclc.mp4'].nativeURL,
                output: {
                    durationValue: 3.603,
                    durationTimeScale: 3.603,
                    videoFrameRate: 1,
                    videoTimeScale: 1,
                }
            },
        ];

        tests.forEach((test) => {
            describe(test.name, function () {
                it("success", function (done) {
                    cordova.plugins.mp4muxdemux.getAssetInfo(test.input)
                        .then((info) => {
                            expect(info).toEqual(test.output);
                            done();
                        })
                        .catch((err) => {
                            done('failed ' + err);
                        });
                });
            });
        });
    });
};
