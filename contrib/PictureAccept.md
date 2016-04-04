# PictureAccept

PictureAccept is a controller for sentence-picture matching tasks which was contributed by Alexandre Cremers.  It is based on the `Question` controller.

To use it, just put the file `PictureAccept.css` in the `css_includes` directory and the file `PictureAccept.js` in the `js_includes` directory.

The controller takes as arguments a sentence (`s`) and a list of url's which should link to pictures (`as`).  `as` can also be a list of lists, with each sublist containing a key and a url, as in the `Question` controller.  In this case, a response key is associated with each image.  If `as` is just a list of url's, participants will need to click on the pictures.

The result file contains a number indicating which picture was chosen (from 1 to n) and the time taken to answer.  This is also explained in the comments of the results file.

Example syntax with `A`, `S`, `D` being the response keys for pictures 1, 2, 3 respectively:

``` Javascript
["Example", "PictureAccept", {s: "The sentence you want to show",
                              as: [["A", "http://...picture1.png"],
                                   ["S", "http://...picture2.png"],
                                   ["D", "http://...picture3.png"]]}]
```

The width of the pictures is forced to be 16em in the file `PictureAccept.css` (`img` entry) and they always come with a black border.  You are free to modify this as needed, especially if you would like to include more than 3 pictures.  The pictures have to be hosted somewhere outside ibex farm.

This code is not thoroughly tested, so it may not work perfectly on all browsers, or if you try something too specific (many or big pictures ...).  You'd rather not look inside the .js file if you enjoy beautiful code as it is very unclean.  The `Question` controller was only minimally modified and there are a lot of things that are useless here.

You can see an example here: http://spellout.net/ibexexps/Emmanuel/Picture-Matching/experiment.html

Some related discussion can be found here: https://groups.google.com/d/msg/ibexexperiments/uFqpnT51m_w/mGZkS0EIh0QJ
