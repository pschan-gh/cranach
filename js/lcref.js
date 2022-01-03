/*
* lcref - Feature Demo for lcrefs
*
* Based primarily on the work on Knowl by:
*
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
*/

/* javascript code for the lcref features
* global counter, used to uniquely identify each lcref-output element
* that's necessary because the same lcref could be referenced several times
* on the same page */

let lcref_id_counter = 0;

const lcref_focus_stack_uid = [];
const lcref_focus_stack = [];

function lcref_click_handler(el) {
	let lcref = el.getAttribute("lcref");
	let uid = el.getAttribute("lcref-uid");
	let output_id = 'lcref-output-' + uid;


	let lcrefid = 'kuid-' + uid;
	const lcrefContainer = document.querySelector(`#${lcrefid}`);
	if (lcrefContainer !== null) {
		if (lcrefContainer.classList.contains('hidden')) {
			expandLcref(lcrefContainer);
		} else {
			lcrefContainer.style.height = '0px';
			lcrefContainer.classList.add('hidden');
		}
		// lcrefContainer.style.height = '0px';
		// document.querySelector(`#${lcrefid}`).slideToggle("fast", function() {
		// 	if ($('#' + lcrefid).is(":visible")) {
		// 		document.getElementById(lcrefid).scrollIntoView();
		// 	} else {
		// 		el.scrollIntoView();
		// 	}
		// });
		if (document.getElementById(lcrefid).offsetParent !== null) {
			document.getElementById(lcrefid).scrollIntoView();
		} else {
			el.scrollIntoView();
		}

		this_lcref_focus_stack_uidindex = lcref_focus_stack_uid.indexOf(uid);

		if(el.classList.contains("active")) {
			if(this_lcref_focus_stack_uidindex != -1) {
				lcref_focus_stack_uid.splice(this_lcref_focus_stack_uidindex, 1);
				lcref_focus_stack.splice(this_lcref_focus_stack_uidindex, 1);
			}
		}
		else {
			lcref_focus_stack_uid.push(uid);
			lcref_focus_stack.push(el);
			document.getElementById(lcrefid).scrollIntoView();
		}

	} else {
		const lcrefContainer = document.createElement('div');
		lcrefContainer.id = lcrefid;
		lcrefContainer.classList.add('lcref-output', 'hidden');
		lcrefContainer.innerHTML = `<div class="lcref">`
		+ `<div class="lcref-content" id="${output_id}">loading ${lcref}</div>`
		+ `<div class='lcref-footer'>${lcref}</div>`
		+ `</div></div>`;
		lcrefContainer.style.transition = 'height 0.35s ease-in-out';

		if (el.closest('.paragraphs') !== null) {
			el.closest('.paragraphs').after(lcrefContainer);
		} else {
			el.after(lcrefContainer);
		}
		const lcrefOutput = lcrefContainer.querySelector('.lcref-content');
		const url = el.getAttribute('lcref');
		const params = url.match(/\?(.*?)(#|$)/);
		const urlParams = new URLSearchParams(params[1]);
		const pathname = urlParams.has('wb') ? urlParams.get('wb') : urlParams.get('xml');

		if (pathname.match(/\/local$/)) {
			baseRenderer.then(baseDoc => {
				new Cranach(url).setup().then(cranach => {
					return cranach.setCranachDoc(baseDoc.attr['cranachDoc']).setIndexDoc(baseDoc.attr['indexDoc']).setBare().setOutput(lcrefOutput).render();
				}).then(cranach => {
					renderElement(lcrefContainer);
				});
			});
		} else {
			new Cranach(url).setup().then(cranach => {
				return cranach.setBare().xmlDocQueryAndRender(lcrefOutput);
			}).then(cranach => {
				renderElement(lcrefContainer);
			});
		}

		// $lcrefContainer.slideDown("slow", function() {
		// 	if ($('.carousel-item').length > 0) {
		// 		adjustHeight();
		// 		document.getElementById(lcrefid).scrollIntoView();
		// 	}
		// });
		if (document.querySelector('.carousel-item') !== null) {
			adjustHeight();
			document.getElementById(lcrefid).scrollIntoView();
		}

		document.getElementById(lcrefid).tabIndex = 0;
		document.getElementById(lcrefid).focus();
		lcref_focus_stack_uid.push(uid);
		lcref_focus_stack.push(el);
		document.querySelectorAll("a[lcref]").forEach(a => a.setAttribute("href", ""));
	}
} //~~ end click handler for *[lcref] elements

function renderElement(lcrefContainer) {
	lcrefContainer.querySelectorAll('img').forEach(el => imagePostprocess(el));
	lcrefContainer.querySelectorAll('iframe:not([src])').forEach(el => {
		el.src = el.dataset.src;
		el.style.display = 'block';
		el.classList.remove('hidden');
		iFrameResize({ checkOrigin:false}, el)
	});
	typeset([lcrefContainer]);
	if (document.querySelector('#output').classList.contains('present')) {
		updateCarouselSlide(document.querySelector('#output > div.slide.active'));
	}
	expandLcref(lcrefContainer);
}

function expandLcref(lcrefContainer) {
	MathJax.startup.promise.then(() => {
		lcrefContainer.style.height = 'auto';
		lcrefContainer.classList.remove('hidden');
		const clientHeight = lcrefContainer.clientHeight;
		lcrefContainer.style.height = '0px';

		setTimeout(function () {
			lcrefContainer.style.height = clientHeight + 'px';
		}, 0);
	});
}

// document.addEventListener('DOMContentLoaded', () => {
// 	document.querySelectorAll("body [lcref]").forEach(el => {
// 		el.addEventListener('click', function(evt) {
// 			evt.preventDefault();
// 			evt.stopPropagation();
// 			const lcref = evt.target;
// 			if(!lcref.hasAttribute("lcref-uid")) {
// 				lcref.setAttribute("lcref-uid", lcref_id_counter);
// 				lcref_id_counter++;
// 			}
// 			lcref_click_handler(lcref, evt);
// 		});
// 		el.setAttribute("href", "");
// 	});
// });
