var exec = require('cordova/exec');

var service = 'mp4muxdemux';

function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}

exports.echo = function (str, success, error) {
    exec(success, error, service, 'echo', [str]);
};

exports.mux = function (args, success, error) {
    if (!isArray(args)) {
        var originalArgs = args;
        args = [
            '-o',
            originalArgs.outputPath.replace(/^file:\/\//, ''),
            '--overwrite',
        ];

        if (originalArgs.timeScale) {
            args.push('--mpeg4-timescale');
            args.push('' + originalArgs.timeScale);
        }

        for (var i = 0; i < originalArgs.inputs.length; i++) {
            args.push('-i');
            args.push(originalArgs.inputs[i].path.replace(/^file:\/\//, ''));
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
};

exports.demux = function (args, success, error) {
    if (!isArray(args)) {
        args = [
            '--input-file',
            args.inputPath.replace(/^file:\/\//, ''),
            '--output-folder',
            args.outputDir.replace(/^file:\/\//, ''),
        ];
    }
    exec(success, error, service, 'demux', [args]);
};

exports.getAssetInfo = function (path, success, error) {
    exec(success, error, service, 'getAssetInfo', [path.replace(/^file:\/\//, '')]);
};

exports.listDemuxOutputs = function (path, success, error) {
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
};
