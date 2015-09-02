#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#

#
# Copyright (c) 2015, Joyent, Inc.
#

#
# Makefile: top-level Makefile
#
# This Makefile contains only repo-specific logic and uses included makefiles
# to supply common targets (javascriptlint, jsstyle, restdown, etc.), which are
# used by other repos as well.
#

#
# Tools
#
CATEST		 = deps/catest/catest
NPM		 = npm

#
# Files
#
JSON_FILES	 = package.json
JS_FILES	:= $(shell find lib examples test -name '*.js')
JSL_FILES_NODE	 = $(JS_FILES)
JSSTYLE_FILES	 = $(JS_FILES)
JSL_CONF_NODE	 = tools/jsl.node.conf

.PHONY: all
all:
	$(NPM) install

.PHONY: test
test: | $(CATEST)
	$(CATEST) -a

$(CATEST): deps/catest/.git

include ./Makefile.targ
