var exec = require('cordova/exec');

var service = 'mp4muxdemux';

var getDefaultPromise = function () {
    return typeof Promise === 'undefined' ? void 0 : Promise;
};

var isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

var normalizePath = function (path) {
    if (path.nativeURL) {
        path = path.nativeURL;
    }
    return path.replace(/^file:\/\//, '');
};

var create = function (options) {
    var instance = {
        create: create,
        Promise: options.Promise || getDefaultPromise(),
        muxDeferred: function (args) {
            return new instance.Promise((resolve, reject) => {
                instance.mux(args, resolve, reject);
            });
        },
        demuxDeferred: function (args) {
            return new instance.Promise((resolve, reject) => {
                instance.demux(args, resolve, reject);
            });
        },
        getAssetInfoDeferred: function (path) {
            return new instance.Promise((resolve, reject) => {
                instance.getAssetInfo(path, resolve, reject);
            });
        },
        listDemuxOutputsDeferred: function (path) {
            return new instance.Promise((resolve, reject) => {
                instance.listDemuxOutputs(path, resolve, reject);
            });
        },
        mux: function (args, success, error) {
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
            exec(success, error, service, 'mux', [args]);
        },
        demux: function (args, success, error) {
            if (!isArray(args)) {
                args = [
                    '--input-file',
                    normalizePath(args.inputPath),
                    '--output-folder',
                    normalizePath(args.outputDir),
                ];
            }
            exec(success, error, service, 'demux', [args]);
        },
        getAssetInfo: function (path, success, error) {
            exec(success, error, service, 'getAssetInfo', [normalizePath(path)]);
        },
        listDemuxOutputs: function (path, success, error) {
            window.resolveLocalFileSystemURL(path,
                function (fileSystem) {
                    var reader = fileSystem.createReader();
                    reader.readEntries(
                        function (entries) {
                            var results = [];
                            for (var i = 0; i < entries.length; i++) {
                                if (entries[i].name.match(/out_\d+\..+/)) {
                                    results.push(entries[i]);
                                }
                            }
                            success(results);
                        },
                        function (err) {
                            error(err);
                        }
                    );
                }, function (err) {
                    error(err);
                }
            );
        },
    };
    return instance;
};

module.exports = create();
