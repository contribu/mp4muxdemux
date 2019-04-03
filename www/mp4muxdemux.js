const exec = require('cordova/exec');

const service = 'mp4muxdemux';

const getDefaultPromise = () => {
    return typeof Promise === 'undefined' ? void 0 : Promise;
};

const isArray = (obj) => {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

const normalizePath = (path) => {
    if (path.nativeURL) {
        path = path.nativeURL;
    }
    return path.replace(/^file:\/\//, '');
};

const loadFile = (url) => {
    return fetch(url)
        .then((res) => {
            return res.text();
        });
};

const create = (options) => {
    const instance = {
        // public API
        create: create,
        promise: options.Promise || getDefaultPromise(),
        mux: (options) => {
            return instance.promise.resolve()
                .then(() => {
                    const clone = JSON.parse(JSON.stringify(options));
                    // for (let i = 0; i < clone.inputs.length; i++) {
                    //     if (clone.inputs[i].frameRate) {
                    //         // for accuracy
                    //         clone.inputs[i].frameRate = clone.inputs[i].timeScale + '/' + Math.round(clone.inputs[i].timeScale / clone.inputs[i].frameRate);
                    //     }
                    // }
                    return instance._mux(clone);
                })
                .then(() => {
                    return new instance.promise((resolve, reject) => {
                        window.resolveLocalFileSystemURL(options.outputPath, resolve, reject);
                    });
                });
        },
        demux: (options) => {
            return instance.promise.resolve()
                .then(() => {
                    return instance._demux(options);
                })
                .then(() => {
                    return instance._listDemuxOutputs(options.outputDir);
                });
        },
        getAssetInfo: (path) => {
            return new instance.promise((resolve, reject) => {
                exec(resolve, reject, service, 'getAssetInfo', [normalizePath(path)]);
            });
        },
        // private API
        _mux: (args) => {
            return new instance.promise((resolve, reject) => {
                if (!isArray(args)) {
                    const originalArgs = args;
                    args = [
                        '-o',
                        normalizePath(originalArgs.outputPath),
                        '--overwrite',
                    ];

                    if (originalArgs.timeScale) {
                        args.push('--mpeg4-timescale');
                        args.push('' + originalArgs.timeScale);
                    }

                    for (let i = 0; i < originalArgs.inputs.length; i++) {
                        args.push('-i');
                        args.push(normalizePath(originalArgs.inputs[i].path));
                        if (originalArgs.inputs[i].timeScale) {
                            args.push('--media-timescale');
                            args.push('' + originalArgs.inputs[i].timeScale);
                        }
                        if (originalArgs.inputs[i].frameRate) {
                            args.push('--input-video-frame-rate');
                            args.push('' + originalArgs.inputs[i].frameRate);
                        }
                        if (originalArgs.inputs[i].matrix) {
                            args.push('--media-matrix');
                            for (let j = 0; j < 9; j++) {
                                args.push('' + originalArgs.inputs[i].matrix[j]);
                            }
                        }
                    }
                }
                exec(resolve, reject, service, 'mux', [args]);
            });
        },
        _demux: (args) => {
            return new instance.promise((resolve, reject) => {
                if (!isArray(args)) {
                    args = [
                        '--input-file',
                        normalizePath(args.inputPath),
                        '--output-folder',
                        normalizePath(args.outputDir),
                    ];
                }
                exec(resolve, reject, service, 'demux', [args]);
            });
        },
        _listDemuxOutputs: (path) => {
            return new instance.promise((resolve, reject) => {
                window.resolveLocalFileSystemURL(path,
                    function (fileSystem) {
                        const reader = fileSystem.createReader();
                        reader.readEntries(
                            (entries) => {
                                let i, j;
                                const results = [];
                                for (i = 0; i < entries.length; i++) {
                                    let m = entries[i].name.match(/out_(\d+)(\..+)/);
                                    if (m) {
                                        let tkhdFileEntry;
                                        for (j = 0; j < entries.length; j++) {
                                            let mTkhd = entries[j].name.match(/out_(\d+)_tkhd(\..+)/);
                                            if (mTkhd) {
                                                tkhdFileEntry = entries[j];
                                            }
                                        }

                                        if (tkhdFileEntry) {
                                            results.push({
                                                idx: +m[1],
                                                extension: m[2],
                                                fileEntry: entries[i],
                                                tkhdFileEntry: tkhdFileEntry,
                                            });
                                        }
                                    }
                                }

                                results.sort((a, b) => {
                                    return a.idx - b.idx;
                                });

                                const promises = [];
                                for (i = 0; i < results.length; i++) {
                                    const result = results[i];
                                    promises.push(new instance.promise((resolve, reject) => {
                                        result.fileEntry.file((file) => {
                                            result.file = file;
                                            resolve();
                                        }, reject);
                                    }));
                                    promises.push(new instance.promise((resolve, reject) => {
                                        loadFile(result.tkhdFileEntry.nativeURL)
                                            .then((jsonStr) => {
                                                result.tkhd = JSON.parse(jsonStr);
                                                resolve();
                                            }, reject);
                                    }));
                                }

                                instance.promise.all(promises)
                                    .then(() => {
                                        resolve(results);
                                    }, reject);
                            }, reject
                        );
                    }, reject
                );
            });
        },
    };
    return instance;
};

module.exports = create({});
