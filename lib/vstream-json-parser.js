/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2015, Joyent, Inc.
 */

/*
 * lib/format-json.js: JSON stream reader
 */

var mod_assert = require('assert');
var mod_stream = require('stream');
var mod_util = require('util');
var mod_jsprim = require('jsprim');
var mod_vstream = require('vstream');

/* Public interface */
module.exports = JsonParserStream;

/*
 * JsonParserStream
 *
 *	input:	object mode (strings)	lines of text, 1 JSON object per line
 *
 *	output:	object mode (objects)	plain JavaScript ojects
 */
function JsonParserStream(opts)
{
	var streamoptions;

	streamoptions = mod_jsprim.mergeObjects(opts,
	    { 'objectMode': true }, { 'highWaterMark': 0 });
	mod_stream.Transform.call(this, streamoptions);
	mod_vstream.wrapTransform(this, { 'name': 'json parser' });
}

mod_util.inherits(JsonParserStream, mod_stream.Transform);

JsonParserStream.prototype._transform = function (str, encoding, callback)
{
	var obj;

	mod_assert.equal('string', typeof (str));

	try {
		obj = JSON.parse(str);
	} catch (ex) {
		this.vsWarn(ex, 'invalid json');
		setImmediate(callback);
		return;
	}

	if (obj === null) {
		this.vsWarn(new Error('"null" is not allowed'), 'null value');
		setImmediate(callback);
		return;
	}

	this.push(obj);
	setImmediate(callback);
};
