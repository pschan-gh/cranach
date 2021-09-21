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
	let lcref = $el.attr("lcref");
	// the uid is necessary if we want to reference the same content several times
	let uid = $el.attr("lcref-uid");
	let output_id = 'lcref-output-' + uid;

	let thislcrefid = 'kuid-' + uid;


	if ($(`#${output_id}`).length > 0) {
		$(`#${thislcrefid}`).slideToggle("fast");
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
		let $lcrefContent = $(
			`<div class="lcref-output" id="${thislcrefid}">`
			+ `<div class="lcref">`
			+ `<div class="lcref-content" id="${output_id}">loading ${lcref}</div>`
			+ `<div class='lcref-footer'>${lcref}</div>`
			+ `</div></div>`
		);

		if ($el.nextAll('.paragraphs').length > 0) {
			$el.nextAll('.paragraphs').first().after($lcrefContent);
		} else {
			$el.after($lcrefContent);
		}
		let $lcrefOutput = $(`#${output_id}`);
		let url = $el.attr('lcref');
		let params = url.match(/\?(.*?)(#|$)/);
		let urlParams = new URLSearchParams(params[1]);
		let pathname = urlParams.has('wb') ? urlParams.get('wb') : urlParams.get('xml');
		if (pathname.match(/\/local$/)) {
			baseRenderer.then(baseDoc => {
				new Cranach(url).setup().then(cranach => {
					return cranach.setCranachDoc(baseDoc.attr['cranachDoc']).setIndexDoc(baseDoc.attr['indexDoc']).setBare().setOutput($lcrefOutput[0]).render();
				}).then(cranach => {
					renderElement($lcrefContent);
				});
			});
		} else {
			new Cranach(url).setup().then(cranach => {
				return cranach.setBare().xmlDocQueryAndRender($lcrefOutput[0]);
			}).then(cranach => {
				renderElement($lcrefContent);
			});
		}
		// $el.addClass("active");
		$lcrefContent.slideDown("slow", function() {
			adjustHeight();
		});

		document.getElementById(thislcrefid).tabIndex = 0;
		document.getElementById(thislcrefid).focus();
		lcref_focus_stack_uid.push(uid);
		lcref_focus_stack.push($el);
		$("a[lcref]").attr("href", "");
		// }
	}
} //~~ end click handler for *[lcref] elements

function renderElement($lcrefContent) {
	$lcrefContent.find('img').each(function() {
		imagePostprocess($(this));
	});
	$lcrefContent.find('iframe:not([src])').each(function() {
		$(this).attr('src', $(this).attr('data-src')).show();
		var $iframe = $(this);
		$(this).iFrameResize({checkOrigin:false});
	});
	typeset([$lcrefContent[0]]);
}


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
