/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2015, Joyent, Inc.
 */

/*
 * extracttime.js: extract the "time" field from newline-separated JSON records
 */

var mod_lstream = require('lstream');
var mod_stream = require('stream');
var mod_util = require('util');
var mod_vstream = require('vstream');
var JsonParserStream = require('../lib/vstream-json-parser');

function main()
{
	var lstream = new mod_lstream();
	var parser = new JsonParserStream();
	var extractor = new ExtractorStream();

	process.stdin.pipe(lstream);
	lstream.pipe(parser);
	parser.pipe(extractor);
	extractor.pipe(process.stdout);

	parser.on('warn', printWarning);
	extractor.on('warn', printWarning);
}

/*
 * The signature for this function is defined in node-vstream.  The point is to
 * provide enough context to report which object this was at each stage in the
 * pipeline, like "JSON object #52 from line #57".
 */
function printWarning(context, kind, err)
{
	if (context !== null) {
		console.error('warn: %s: %s', context.label(), err.message);
	} else {
		console.error('warn: %s', err.message);
	}
}

/*
 * Simple transform string that takes plain JavaScript objects and emits their
 * "time" field.  Uses node-vstream to emit helpful warnings.
 */
function ExtractorStream()
{
	mod_stream.Transform.call(this, {
	    'objectMode': true,
	    'highWaterMark': 0
	});
	mod_vstream.wrapTransform(this, { 'name': 'extractor' });
}
mod_util.inherits(ExtractorStream, mod_stream.Transform);
ExtractorStream.prototype._transform = function (obj, _, callback)
{
	if (typeof (obj) != 'object' || obj === null) {
		this.vsWarn(new Error('object not valid'), 'not valid');
	} else if (!obj.hasOwnProperty('time')) {
		this.vsWarn(new Error('object has no "time"'), 'no "time"');
	} else if (obj['time'] === null) {
		this.vsWarn(new Error('object\'s "time" is null'),
		    'null "time"');
	} else {
		this.push(obj['time'].toString() + '\n');
	}

	setImmediate(callback);
};

main();
