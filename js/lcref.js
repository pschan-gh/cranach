/*
* Lcref
*
* Derived from the work on Knowl by:
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

/* Requires Bootstrap v5 */

let lcref_id_counter = 0;
const lcref_focus_stack_uid = [];
const lcref_focus_stack = [];

function lcref_click_handler(el) {
	let lcref = el.getAttribute("lcref");
	let uid = el.getAttribute("lcref-uid");
	let output_id = 'lcref-output-' + uid;


	let lcrefid = 'kuid-' + uid;

    el.dataset.bsToggle = 'collapse';
    el.setAttribute('href', `#${lcrefid}`);

	const lcrefContainer = document.querySelector(`#${lcrefid}`);
	if (lcrefContainer !== null) {
        // lcrefContainer.querySelector('.icon.loading').classList.add('hidden');
        bootstrap.Collapse.getOrCreateInstance(lcrefContainer).toggle();
	} else {
		const lcrefContainer = document.createElement('div');
		lcrefContainer.id = lcrefid;
		lcrefContainer.classList.add('lcref-output', 'collapse');
		lcrefContainer.innerHTML = `<div class="lcref">`
		+ `<div class="spinner-border icon loading" role="status" style="display:block; margin:30px auto; opacity:0.25; width: 75px; height: 75px;">`
        + `<span class="visually-hidden">Loading...</span>`
        + `</div>`
        + `<div class="lcref-content hidden" style="overflow-y:hidden" id="${output_id}">`
        + `</div>`
		+ `<div class='lcref-footer'>${lcref}</div>`
		+ `</div></div>`;
        lcrefContainer.style.transition = 'height 0.5s ease-in-out';

        findNeighbor(el).after(lcrefContainer);
        lcrefContainer.addEventListener('hidden.bs.collapse', function () {
			adjustHeight();
            el.scrollIntoView( {block: "center", behavior: "smooth"} );
        });
        lcrefContainer.addEventListener('shown.bs.collapse', function () {
			adjustHeight();
			lcrefContainer.scrollIntoView( {block: "center", behavior: "smooth"} );
        });

        bootstrap.Collapse.getOrCreateInstance(lcrefContainer).toggle();

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

		// document.getElementById(lcrefid).tabIndex = 0;
		// document.getElementById(lcrefid).focus();
		// lcref_focus_stack_uid.push(uid);
		// lcref_focus_stack.push(el);
		// document.querySelectorAll("a[lcref]").forEach(a => a.setAttribute("href", ""));
	}
}

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
	// toggleLcref(lcrefContainer);
    MathJax.startup.promise.then(() => {
        lcrefContainer.querySelector('.icon.loading').classList.add('hidden');
        lcrefContainer.querySelector('.lcref-content').classList.remove('hidden');
		adjustHeight();
		lcrefContainer.scrollIntoView( {block: "center", behavior: "smooth"} );
    });
}

function findNeighbor(el) {
    let sibling = el;
    let paragraph = null;

    let counter = 0;

    while (sibling.nextElementSibling !== null && counter++ < 10) {
        sibling = sibling.nextElementSibling;
		if (sibling.nodeName == 'BR') {
			return sibling;
		}
        if (sibling.classList.contains('paragraphs')) {
            paragraph = sibling;
        }
    }

    if (paragraph == null) {
        if (el.closest('.paragraphs') !== null) {
            return el.closest('.paragraphs');
        } else {
            return el;
        }
    } else {
        return paragraph;
    }
}
