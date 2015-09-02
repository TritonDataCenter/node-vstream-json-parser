<!--
    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->

<!--
    Copyright (c) 2015, Joyent, Inc.
-->

# vstream-based JSON parser

## Synopsis

    var JsonParserStream = require('vstream-json-parser');
    var stream = new JsonParserStream();
    stream.end('{ "hello": "world" }');
    console.error(stream.read());

This prints:

    { hello: 'world' }

For a more complete example, see below.

## Description

This module provides a Node _object-mode_ Transform stream.

**Inputs:** chunks of UTF8 text, each representing a JSON object.  The common
use-case is to parse newline-separated JSON objects.  You can do this by piping
your input to an [lstream](https://github.com/tjfontaine/node-lstream) and
piping that to this stream.  There's an example below.

**Outputs:** plain JavaScript objects, the result of parsing each input as JSON.

**Error handling:** This module follows the Joyent Best Practices for [Error
Handling in Node.js](https://www.joyent.com/developers/node/design/errors).
There are two operational errors associated with this stream:

*  an input object could not be parsed as JSON
*  an input object was parsed and had the value `null`

These are _not_ emitted as `error` events, since they would be fatal to the
stream.  Instead, these are emitted as a warning via the
[vstream](https://github.com/joyent/node-vstream) interface.  See the example
below for details.

The only supported constructor argument is an optional object of stream options.
The values in this object are passed to the Node `Stream` constructor, so this
allows you to set things like `highWaterMark`.  The `objectMode` property is
always overridden to `true`.

**Runtime notes**: This class executes transformations synchronously, but never
processes more than one input during a single tick in order to preserve liveness
(i.e., to allow other events to be processed, even when a lot of inputs have
been read).

The default `highWaterMark` is `0`, meaning that the only data buffered are
objects currently being processed.  This class can be used to process large
streams of data with a small amount of memory usage.

Objects with value `null` are ignored, because Node does not provide a way to
emit them, nor do readers have a way of receiving them.  (Emitting `null` would
end the stream, and getting `null` from `read()` means end-of-stream.)


## Full example: command-line program to extract fields from JSON objects

For a full example, see `examples/extracttime.js`.  This example is a very
simple tool that reads newline-separated JSON on stdin, extracts the field
"time" from each one, and prints it out.  If you were really doing this, you'd
probably want to check out [json](https://github.com/trentm/json).  But this
example includes error handling and is quite short.

As sample input, try passing it a
[bunyan](https://github.com/trentm/node-bunyan) log.  Or try a file like this:

    $ cat input 
    { "time": "now" }
    { "time": null }
    { "time
    { "time": "today" }
    { "notime": "tomorrow" }
    { "time": "yesterday" }

On that input, it emits this on stdout:

    now
    today
    yesterday

and this on stderr:

    warn: extractor input 2 from json parser input 2: value { time: null }: object's "time" is null
    warn: json parser input 3: value '{ "time': Unexpected token t
    warn: extractor input 4 from json parser input 5: value { notime: 'tomorrow' }: object has no "time"

