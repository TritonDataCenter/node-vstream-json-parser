/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2015, Joyent, Inc.
 */

/*
 * tst.jsonparser.js: basic test of json parser stream
 */

var mod_assert = require('assert');
var JsonParserStream = require('../lib/vstream-json-parser');
var stream = new JsonParserStream();
var warnings, objects;
var done = false;

process.on('exit', function () {
	mod_assert.ok(done, 'premature exit');
});

warnings = [];
objects = [];
stream.on('warn', function (context, kind, error) {
	warnings.push({
	    'context': context,
	    'kind': kind,
	    'error': error
	});
});

stream.on('data', function (obj) {
	objects.push(obj);
});

stream.on('end', function () {
	mod_assert.equal(warnings.length, 2);
	mod_assert.equal(warnings[0].context.label(),
	    'json parser input 3: value \'null\'');
	mod_assert.equal(warnings[0].kind, 'null value');
	mod_assert.equal(warnings[0].error.message, '"null" is not allowed');
	mod_assert.equal(warnings[1].context.label(),
	    'json parser input 5: value \'{\'');
	mod_assert.equal(warnings[1].kind, 'invalid json');
	mod_assert.equal(warnings[1].error.message,
	    'Unexpected end of input');

	mod_assert.deepEqual(objects, [
	    {},
	    { 'a': 'b' },
	    { 'a': 'b', 'c': null },
	    { 'poochie': 'dog' }
	]);

	done = true;
	console.log('TEST PASSED');
});

stream.write('{}');
stream.write('{ "a": "b" }');
stream.write('null');
stream.write('{ "a": "b", "c": null }');
stream.write('{');
stream.end('{ "poochie": "dog" }');
