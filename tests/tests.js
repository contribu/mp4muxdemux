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

    describe("mux", function () {
        it("defined", function () {
            expect(cordova.plugins.mp4muxdemux.mux).toBeDefined();
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
                output: {
                    videos: [{
                        idx: 1,
                        extension: '.h264',
                        fileEntry: {
                            nativeURL: cordova.file.dataDirectory + '/h264aaclc/out_1.h264',
                        },
                    }],
                    audios: [{
                        idx: 2,
                        extension: '.adts',
                        fileEntry: {
                            nativeURL: cordova.file.dataDirectory + '/h264aaclc/out_2.adts',
                        },
                    }],
                }
            },
            {
                name: 'h265aaclc.mp4',
                input: {
                    inputPath: testFiles['h265aaclc.mp4'].nativeURL,
                    outputDir: cordova.file.dataDirectory + '/h265aaclc'
                },
                output: {
                    videos: [{
                        idx: 1,
                        extension: '.vide',
                        fileEntry: {
                            nativeURL: cordova.file.dataDirectory + '/h265aaclc/out_1.vide',
                        },
                    }],
                    audios: [{
                        idx: 2,
                        extension: '.adts',
                        fileEntry: {
                            nativeURL: cordova.file.dataDirectory + '/h265aaclc/out_2.adts',
                        },
                    }],
                }
            },
            {
                name: 'h264dolbyac3.mp4',
                input: {
                    inputPath: testFiles['h264dolbyac3.mp4'].nativeURL,
                    outputDir: cordova.file.dataDirectory + '/h264dolbyac3'
                },
                output: {
                    videos: [{
                        idx: 1,
                        extension: '.h264',
                        fileEntry: {
                            nativeURL: cordova.file.dataDirectory + '/h264dolbyac3/out_1.h264',
                        },
                    }],
                    audios: [{
                        idx: 2,
                        extension: '.soun',
                        fileEntry: {
                            nativeURL: cordova.file.dataDirectory + '/h264dolbyac3/out_2.soun',
                        },
                    }],
                }
            },
            {
                name: 'h265dolbyac3.mp4',
                input: {
                    inputPath: testFiles['h265dolbyac3.mp4'].nativeURL,
                    outputDir: cordova.file.dataDirectory + '/h265dolbyac3'
                },
                output: {
                    videos: [{
                        idx: 1,
                        extension: '.vide',
                        fileEntry: {
                            nativeURL: cordova.file.dataDirectory + '/h265dolbyac3/out_1.vide',
                        },
                    }],
                    audios: [{
                        idx: 2,
                        extension: '.soun',
                        fileEntry: {
                            nativeURL: cordova.file.dataDirectory + '/h265dolbyac3/out_2.soun',
                        },
                    }],
                }
            },
            {
                name: 'mpeg4spaaclc.mp4',
                input: {
                    inputPath: testFiles['mpeg4spaaclc.mp4'].nativeURL,
                    outputDir: cordova.file.dataDirectory + '/mpeg4spaaclc'
                },
                output: {
                    videos: [{
                        idx: 1,
                        extension: '.vide',
                        fileEntry: {
                            nativeURL: cordova.file.dataDirectory + '/mpeg4spaaclc/out_1.vide',
                        },
                    }],
                    audios: [{
                        idx: 2,
                        extension: '.adts',
                        fileEntry: {
                            nativeURL: cordova.file.dataDirectory + '/mpeg4spaaclc/out_2.adts',
                        },
                    }],
                }
            },
        ];

        _.each(tests, (test) => {
            describe(test.name, function () {
                it("success", function (done) {
                    cordova.plugins.mp4muxdemux.demux(test.input)
                        .then((info) => {
                            expect(info).toEqual(test.output);
                            done();
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
                    videoFrameRate: 1,
                    videoTimeScale: 1,
                }
            },
            {
                name: 'h265aaclc.mp4',
                input: testFiles['h265aaclc.mp4'].nativeURL,
                output: {
                    videoFrameRate: 1,
                    videoTimeScale: 1,
                }
            },
            {
                name: 'h264dolbyac3.mp4',
                input: testFiles['h264dolbyac3.mp4'].nativeURL,
                output: {
                    videoFrameRate: 1,
                    videoTimeScale: 1,
                }
            },
            {
                name: 'h265dolbyac3.mp4',
                input: testFiles['h265dolbyac3.mp4'].nativeURL,
                output: {
                    videoFrameRate: 1,
                    videoTimeScale: 1,
                }
            },
            {
                name: 'mpeg4spaaclc.mp4',
                input: testFiles['mpeg4spaaclc.mp4'].nativeURL,
                output: {
                    videoFrameRate: 1,
                    videoTimeScale: 1,
                }
            },
        ];

        _.each(tests, (test) => {
            describe(test.name, function () {
                it("success", function (done) {
                    cordova.plugins.mp4muxdemux.getAssetInfo(test.input)
                        .then((info) => {
                            expect(info).toEqual(test.output);
                            done();
                        });
                });
            });
        });
    });
};
