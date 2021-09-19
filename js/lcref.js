/*
* lcref - Feature Demo for lcrefs
* Copyright (C) 2011  Harald Schilly
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* 4/11/2012 Modified by David Guichard to allow inline lcref code.
* Sample use:
*      This is an <a lcref="" class="internal"
*      value="Hello World!">inline lcref.</a>
*/

/*  8/14/14  Modified by David Farmer to allow lcref content to be
*  taken from the element with a given id.
*
* The syntax is <a lcref="" class="id-ref" refid="proofSS">Proof</a>
*/

/* javascript code for the lcref features
* global counter, used to uniquely identify each lcref-output element
* that's necessary because the same lcref could be referenced several times
* on the same page */
var lcref_id_counter = 0;

var lcref_focus_stack_uid = [];
var lcref_focus_stack = [];

function lcref_click_handler($el) {
    // the lcref attribute holds the id of the lcref
    var lcref_id = $el.attr("lcref");
    // the uid is necessary if we want to reference the same content several times
    var uid = $el.attr("lcref-uid");
    var output_id = '#lcref-output-' + uid;
    var $output_id = $(output_id);
    // create the element for the content, insert it after the one where the
    // lcref element is included (e.g. inside a <h1> tag) (sibling in DOM)
    var idtag = "id='"+output_id.substring(1) + "'";
    var kid   = "id='kuid-"+ uid + "'";
    // if we already have the content, toggle visibility

    // Note that for tracking lcrefs, this setup is not optimal
    // because it applies to open lcrefs and also lcrefs which
    // were opened and then closed.
    if ($output_id.length > 0) {
        thislcrefid = "kuid-"+uid
        $("#kuid-"+uid).slideToggle("fast");
        if($el.attr("replace")) {
            $($el.attr("replace")).slideToggle("fast");
        }

        this_lcref_focus_stack_uidindex = lcref_focus_stack_uid.indexOf(uid);

        if($el.hasClass("active")) {
            if(this_lcref_focus_stack_uidindex != -1) {
                lcref_focus_stack_uid.splice(this_lcref_focus_stack_uidindex, 1);
                lcref_focus_stack.splice(this_lcref_focus_stack_uidindex, 1);
            }
        }
        else {
            lcref_focus_stack_uid.push(uid);
            lcref_focus_stack.push($el);
            document.getElementById(thislcrefid).focus();
        }

        $el.toggleClass("active");

        // otherwise download it or get it from the cache
    } else {
        // where_it_goes is the location the lcref will appear *after*
        // lcref is the variable that will hold the content of the output lcref
        var where_it_goes = $el;
        var lcref = "<div class='lcref-output' "+kid+"><div class='lcref'><div class='lcref-content' " +idtag+ ">loading '"+lcref_id+"'</div><div class='lcref-footer'>"+lcref_id+"</div></div></div>";

        // addafter="#id" means to put the lcref after the element with that id
        if($el.attr("addafter")) {
            where_it_goes = $($el.attr("addafter"));
        } else if($el.attr("replace")) {
            where_it_goes = $($el.attr("replace"));
        } else if($el.hasClass("kohere")) {
            where_it_goes = $el;
        } else {
            // otherwise, typically put it after the nearest enclosing block element

            // check, if the lcref is inside a td or th in a table
            if($el.parent().is("td") || $el.parent().is("th") ) {
                // assume we are in a td or th tag, go 2 levels up
                where_it_goes = $el.parent().parent();
                var cols = $el.parent().parent().children().length;
                lcref = "<tr><td colspan='"+cols+"'>"+lcref+"</td></tr>";
            } else if ($el.parent().is("li")) {
                where_it_goes = $el.parent();
            }
            // not sure it is is worth making the following more elegant
            else if ($el.parent().parent().is("li")) {
                where_it_goes = $el.parent().parent();
                // the '.is("p")' is for the first paragraph of a theorem or proof
            } else if ($el.parent().css('display') == "block" || $el.parent().is("p") || $el.parent().hasClass("hidden-lcref-wrapper") || $el.parent().hasClass("kohere")) {
                where_it_goes = $el.parent();
            } else if ($el.parent().parent().css('display') == "block" || $el.parent().parent().is("p") || $el.parent().parent().hasClass("hidden-lcref-wrapper") || $el.parent().parent().hasClass("kohere")) {
                where_it_goes = $el.parent().parent();
            } else {
                //  is this a reasonable last case?
                //  if we omit the else, then if goes after $el
                where_it_goes = $el.parent().parent().parent();
            }

        }

        // now that we know where the lcref goes, insert the lcref content
        if($el.attr("replace")) {
            where_it_goes.before(lcref);
        }
        else {
            where_it_goes.after(lcref);
        }

        // "select" where the output is and get a hold of it
        var $output = $(output_id);
        var $lcref = $("#kuid-"+uid);
        $output.addClass("loading");
        $lcref.hide();

        // DRG: inline code
        if ($el.hasClass('internal')) {
            $output.html($el.attr("value"));
            //    } else if ($el.attr("class") == 'id-ref') {
        } else if ($el.hasClass('id-ref')) {
            //get content from element with the given id
            $output.html($("#".concat($el.attr("refid"))).html());
        } else {
            var url = lcref_id;
            var params = url.match(/\?(.*?)(#|$)/);
            var urlParams = new URLSearchParams(params[1]);
            var pathname = urlParams.has('wb') ? urlParams.get('wb') : urlParams.get('xml');
            if (pathname.match(/\/local$/)) {
                baseRenderer.then(baseDoc => {
                    new Cranach(url).setup().then(cranach => {
                        return cranach.setCranachDoc(baseDoc.attr['cranachDoc']).setIndexDoc(baseDoc.attr['indexDoc']).setBare().setOutput($output[0]).render();
                    }).then(cranach => {
                        renderElement($lcref);
                    });
                });
            } else {
                console.log(pathname);
                new Cranach(url).setup().then(cranach => {
                    return cranach.setBare().xmlDocQueryAndRender($output[0]);
                }).then(cranach => {
                    renderElement($lcref);
                });
            }
        };

        // we have the lcref content, and put it hidden in the right place,
        // so now we show it

        $lcref.hide();

        $el.addClass("active");
        // if we are using MathJax, then we reveal the lcref after it has finished rendering the contents
        if(window.MathJax == undefined) {
            $lcref.slideDown("slow");
        } else {
            $lcref.addClass("processing");
            $lcref.removeClass("processing");
            $lcref.slideDown("slow");

            if($el.attr("replace")) {
                var the_replaced_thing = $($el.attr("replace"));
                the_replaced_thing.hide("slow");
            }

            var thislcrefid = 'kuid-'.concat(uid)
            document.getElementById(thislcrefid).tabIndex=0;
            document.getElementById(thislcrefid).focus();
            lcref_focus_stack_uid.push(uid);
            lcref_focus_stack.push($el);
            $("a[lcref]").attr("href", "");
        }
    }
} //~~ end click handler for *[lcref] elements

function renderElement($lcref) {
	$lcref.find('img').each(function() {
        imagePostprocess($(this));
    });
    $lcref.find('iframe:not([src])').each(function() {
        $(this).attr('src', $(this).attr('data-src')).show();
        var $iframe = $(this);
        $(this).iFrameResize({checkOrigin:false});
    });
    typeset([$lcref[0]]);
}

/** register a click handler for each element with the lcref attribute
* @see jquery's doc about 'live'! the handler function does the
*  download/show/hide magic. also add a unique ID,
*  necessary when the same reference is used several times. */
$(function() {
    $("body").on("click", "a[lcref]", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var $lcref = $(this);
        if(!$lcref.attr("lcref-uid")) {
            $lcref.attr("lcref-uid", lcref_id_counter);
            lcref_id_counter++;
        }
		lcref_click_handler($lcref, evt);
    });
    $("a[lcref]").attr("href", "");
});
