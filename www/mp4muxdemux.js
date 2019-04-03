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

const create = (options) => {
    const instance = {
        // public API
        create: create,
        Promise: options.Promise || getDefaultPromise(),
        mux: (options) => {
            return instance.Promise.resolve()
                .then(() => {
                    const clone = JSON.parse(JSON.generate(options));
                    for (let i = 0; i < clone.inputs.length; i++) {
                        if (clone.inputs[i].frameRate) {
                            // for accuracy
                            clone.inputs[i].frameRate = clone.inputs[i].timeScale + '/' + Math.round(clone.inputs[i].timeScale / clone.inputs[i].frameRate);
                        }
                    }
                    return instance._mux(clone);
                })
                .then(() => {
                    return new Promise((resolve, reject) => {
                        window.resolveLocalFileSystemURL(options.outputPath, resolve, reject);
                    });
                });
        },
        demux: (options) => {
            return instance.Promise.resolve()
                .then(() => {
                    return instance._demux(options);
                })
                .then(() => {
                    return instance._listDemuxOutputs(options.outputDir);
                });
        },
        getAssetInfo: (path) => {
            return new instance.Promise((resolve, reject) => {
                exec(resolve, reject, service, 'getAssetInfo', [normalizePath(path)]);
            });
        },
        // private API
        _mux: (args) => {
            return new instance.Promise((resolve, reject) => {
                if (!isArray(args)) {
                    var originalArgs = args;
                    args = [
                        '-o',
                        normalizePath(originalArgs.outputPath),
                        '--overwrite',
                    ];

                    if (originalArgs.timeScale) {
                        args.push('--mpeg4-timescale');
                        args.push('' + originalArgs.timeScale);
                    }

                    for (var i = 0; i < originalArgs.inputs.length; i++) {
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
                    }
                }
                exec(resolve, reject, service, 'mux', [args]);
            });
        },
        _demux: (args) => {
            return new instance.Promise((resolve, reject) => {
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
            return new instance.Promise((resolve, reject) => {
                window.resolveLocalFileSystemURL(path,
                    function (fileSystem) {
                        var reader = fileSystem.createReader();
                        reader.readEntries(
                            (entries) => {
                                var i;
                                var results = [];
                                for (i = 0; i < entries.length; i++) {
                                    var m = entries[i].name.match(/out_(\d+)(\..+)/);
                                    if (m) {
                                        results.push({
                                            idx: +m[1],
                                            extension: m[2],
                                            fileEntry: entries[i],
                                        });
                                    }
                                }

                                results.sort((a, b) => {
                                    return a.idx - b.idx;
                                });

                                const promises = [];
                                for (i = 0; i < results.length; i++) {
                                    const result = results[i];
                                    promises.push(new Promise((resolve, reject) => {
                                        result.fileEntry.file((file) => {
                                            result.file = file;
                                            resolve();
                                        }, reject);
                                    }));
                                }

                                instance.Promise.all(promises)
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
