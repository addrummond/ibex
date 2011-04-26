#!/bin/sh

# This software is licensed under a BSD license; see the LICENSE file for details.

echo
echo "*** Remember to run server.py with the --genhtml option if necessary. ***"
echo

if [ ! -d dist ]; then
    mkdir dist
fi

OO=$PWD
O=`echo $PWD | awk 'BEGIN { FS="/"; } { print $NF }'`
cd ..

NO=/tmp/ibex-${1}
cp -XR $O $NO

cd /tmp
NO=ibex-${1}

# To save space on the Ibex farm server, we omit non-essential files from the archive.
# To generate the slim distribution tarball:
#
#    SLIM=1 sh mkdist.sh dist
OPTIONALS=""
if [ ! $SLIM ]; then
   OPTIONALS="$NO/LICENSE $NO/README $NO/mkdist.sh $NO/example_lighttpd.conf $NO/docs/manual.txt $NO/GoCoWiToTex.hs"
fi

tar -cz $OPTIONALS $NO/www/conf.js $NO/www/jsDump.js $NO/css_includes/*.css $NO/js_includes/*.js $NO/data_includes/*.js $NO/www/json.js $NO/www/server.py $NO/server_conf.py $NO/www/shuffle.js $NO/www/jquery*.js $NO/www/PluginDetect.js $NO/www/experiment.html $NO/www/overview.html $NO/www/util.js $NO/www/backcompatcruft.js $NO/other_includes/main.js $NO/chunk_includes/*.html > $OO/dist/ibex-${1}.tar.gz 
