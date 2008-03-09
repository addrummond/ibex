#!/bin/sh

# This software is licensed under a BSD license; see the LICENSE file for details.

if [ ! -d dist ]; then
    mkdir dist
fi

O=`echo $PWD | awk 'BEGIN { FS="/"; } { print $NF }'`
cd ..

tar -cz $O/LICENSE $O/conf.js $O/css_includes/*.css $O/js_includes/*.js $O/json.js $O/json.py $O/main.js $O/mkdist.sh $O/server.py $O/server_conf.py $O/shuffle.js $O/experiment.html $O/util.js $O/util.py > $O/dist/webspr-${1}.tar.gz $O/example_lighttpd.conf
