#!/bin/sh

# This software is licensed under a BSD license; see the LICENSE file for details.

if [ ! -d dist ]; then
    mkdir dist
fi

O=`echo $PWD | awk 'BEGIN { FS="/"; } { print $NF }'`
cd ..

tar -cz $O/LICENSE $O/www/conf.js $O/css_includes/*.css $O/js_includes/*.js $O/data_includes/*.js $O/www/json.js $O/mkdist.sh $O/www/server.py $O/server_conf.py $O/www/shuffle.js $O/www/experiment.html $O/www/overview.html $O/www/util.js $O/example_lighttpd.conf $O/docs/manual.txt $O/other_includes/main.js > $O/dist/webspr-${1}.tar.gz 
