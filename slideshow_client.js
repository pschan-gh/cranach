function splitScreen() {
	if (document.querySelector('.carousel-item') != null) {
		hideCarousel();
	} else {
		document.querySelector('#container').classList.remove('wide');
		document.querySelector('.pane').classList.add('info');
	}
}

function removeTypeset(el) { // i.e. Show LaTeX source
	MathJax.startup.promise.then(() => {
		let jax = MathJax.startup.document.getMathItemsWithin(el);
		showTexFrom(jax);
		MathJax.typesetClear([el]);
	});
}

function renderTexSource(slide) {

	let oldElems = slide.getElementsByClassName("latexSource");

	for(let i = oldElems.length - 1; i >= 0; i--) {
		let oldElem = oldElems.item(i);
		let parentElem = oldElem.parentNode;
		let innerElem;

		let textNode = document.createTextNode(oldElem.textContent);
		parentElem.insertBefore(textNode, oldElem);
		parentElem.removeChild(oldElem);
	}

	slide.querySelectorAll('.latexSource').forEach(e => e.remove());
}

function inlineEdit(enableEdit, editor) {
	let outputDiv = document.getElementById('output');
	let slide = outputDiv.querySelector('div.slide.selected') !== null ? outputDiv.querySelector('div.slide.selected') : outputDiv.querySelector('#output > div.slide');

	slide.setAttribute('contentEditable', enableEdit);

	if (!enableEdit) {
		MathJax.texReset();

		renderSlide(slide);

		editor.container.style.pointerEvents="auto";
		editor.container.style.opacity = 1; // or use svg filter to make it gray
		editor.renderer.setStyle("disabled", false);
		adjustHeight();
	} else {
		removeTypeset(slide);
		slide.classList.add('edit');
		slide.classList.remove('tex2jax_ignore');

		editor.container.style.pointerEvents="none";
		editor.container.style.opacity=0.5; // or use svg filter to make it gray
		editor.renderer.setStyle("disabled", true);
		editor.blur();
	}

}

function showTexFrom(jax) {
	for (let i = jax.length - 1, m = -1; i > m; i--) {
		let jaxNode = jax[i].start.node, tex = jax[i].math;

		if (jax[i].display) {
			if (!tex.match(/^\s*\\(begin{equation|(begin{align(\*)?})|begin{multline|begin{eqnarray)/)) {
				tex = "\\["+tex+"\\]";
			}
		} else {tex = "$"+tex+"$"}

		let preview = document.createElement('span');
		preview.classList.add('latexSource', 'tex2jax_ignore');
		preview.textContent = tex;
		if (jax[i].display) {
			preview.style.display = 'block';
		}

    jaxNode.parentNode.insertBefore(preview, jaxNode);
		jaxNode.remove();
	}
}

function showJaxSource(outputId) {

	let jax = MathJax.startup.document.getMathItemsWithin(document.getElementById(outputId));

	showTexFrom(jax);

	let clone = document.getElementById(outputId).cloneNode(true);

	let oldElems = clone.getElementsByClassName("latexSource");

	for(let i = oldElems.length - 1; i >= 0; i--) {
		let oldElem = oldElems.item(i);
		let parentElem = oldElem.parentNode;
		let innerElem;

		while (innerElem = oldElem.firstChild)
		{
			// insert all our children before ourselves.
			parentElem.insertBefore(innerElem, oldElem);
		}
		parentElem.removeChild(oldElem);
	}

	let editedContent = clone.innerHTML;

	let body = new DOMParser().parseFromString(editedContent, 'text/html');

	let bodyString = new XMLSerializer().serializeToString(body);
	body = new DOMParser().parseFromString(bodyString, "application/xml");
	return body;
}

function renderSlide(slide) {
	if (slide == null) {
        return 0;
	}
	// console.log('renderSlide');

	slide.querySelectorAll('.hidden_collapse').forEach(e => {
		e.classList.add('collapse');
		e.classList.remove('hidden_collapse');
		e.addEventListener('shown.bs.collapse', function() {
			updateCarouselSlide(slide, e);
			MathJax.startup.promise.then(() => {
				if (typeof focusOnItem !== 'undefined' && focusOnItem !== null) {
					focusOnItem.scrollIntoView( {block: "center", behavior: "smooth"} );
				}
				const sanitizedText = focusOnText.replace(/\r/ig, 'r').toLowerCase().replace(/[^a-z0-9]/ig, '');
				const textItems = slide.querySelectorAll(`*[text="${sanitizedText}"]`);
				if (textItems.length > 0) {
					textItems[0].scrollIntoView( {block: "center", behavior: "smooth"} );
				}
				// window.requestAnimationFrame( () => {
				// 	focusOnItem = null;
				// 	focusOnText = '';
				// });
			});
		});
		e.addEventListener('hidden.bs.collapse', function() {
			updateCarouselSlide(slide);
		});
	});
	slide.querySelectorAll('a.collapsea').forEach(e => {
		e.setAttribute('data-bs-toggle', 'collapse');
	});

	slide.querySelectorAll('img:not([src])').forEach(e => {
		imagePostprocess(e);
	});

	renderTexSource(slide);
	slide.querySelectorAll('.latexSource').forEach(e => e.remove());
	slide.classList.remove("tex2jax_ignore");
	MathJax.startup.promise = typeset([slide]);
	MathJax.startup.promise.then(() => {
		baseRenderer.then(cranach => {
			updateRefs(slide, cranach);
		});
	});
}

function batchRender(slide) {
	// console.log('batchRender');
	renderSlide(slide.nextSibling);
	renderSlide(slide.previousSibling);
	renderSlide(slide);
}

function updateSlideContent(slide, carousel = false) {
	// console.log('updateSlideContent');
	document.querySelectorAll(`#output > div.slide`).forEach(e => e.classList.remove('selected', 'active'));
    slide.classList.add('selected', 'active');
	batchRender(slide);
	slide.querySelectorAll('iframe.hidden').forEach(e => {
		if (e.closest('div.comment') !== null) {
			return 0;
		}
		e.onload = adjustHeight;
		e.src = e.getAttribute('data-src');
		e.classList.remove('hidden');
		e.style.display = '';
		iFrameResize({ log: false, checkOrigin:false }, e);
	});

	document.querySelectorAll('#uncollapse_button').forEach(el => el. textContent =
		slide.classList.contains('collapsed') ? 'Uncollapse' : 'Collapse');

	slide.querySelectorAll('.loading_icon').forEach(e => e.classList.add('hidden'));

	if (carousel) {
		slide.classList.add('active');
		updateCanvas(slide);
		updateCarouselSlide(slide);
	}
}

function showStep(el) {
	let parent = el.closest('div[wbtag="steps"]');
	let stepsClass = parent.querySelectorAll('.steps');

	if (stepsClass == null) {
        return 0;
	}

	if (!parent.hasAttribute('stepId')) {
		parent.setAttribute('stepId', 0);
	}
	let whichStep = parent.getAttribute('stepId');

	if (whichStep < stepsClass.length) {
		parent.querySelector('#step' + whichStep).classList.add('shown');
		whichStep++;
	}

	if (parent.querySelector('#step' + whichStep) == null) {
		let button = parent.querySelector('button.next');
		button.setAttribute('disabled', true);
		button.classList.remove('btn-outline-info');
		button.classList.add('btn-outline-secondary');
	}

	parent.querySelector('button.reset').removeAttribute('disabled');
	parent.setAttribute('stepId', whichStep);
}
//
//  Enable the step button and disable the reset button.
//  Hide the steps.
//
function resetSteps(el) {
	let parent = el.closest('div[wbtag="steps"]');
	let button = parent.querySelector('button.next');
	button.removeAttribute('disabled');
	button.classList.add('btn-outline-info');
	button.classList.remove('btn-outline-secondary');

	parent.querySelector('button.reset').setAttribute('disabled', "");
	parent.querySelectorAll('.steps').forEach(e => e.classList.remove('shown'));
	parent.setAttribute('stepId', 0);
}

function collapseToggle(slideNum, forced = '') {

	let slide = document.querySelector('.output div.slide[slide="' + slideNum + '"]');

	if (forced == 'show' || (forced == '' && slide.classList.contains('collapsed'))) {
		slide.querySelectorAll('a.collapsea[aria-expanded="false"]').forEach(e => {
			bootstrap.Collapse
			.getOrCreateInstance(
				document.querySelector(e.getAttribute('href'))
			).toggle();
		});
		document.getElementById('uncollapse_button').textContent = 'Collapse';
		slide.classList.remove('collapsed');

	} else {
		slide.querySelectorAll('a.collapsea[aria-expanded="true"]').forEach(e => {
			bootstrap.Collapse.getOrCreateInstance(
				document.querySelector(e.getAttribute('href'))
			).toggle();
		});
		document.getElementById('uncollapse_button').textContent = 'Uncollapse';
		slide.classList.add('collapsed');
	}
}

function focusOn(item, text = '') {

	const slide = item.closest('div.slide');
	if (slide === null) {
		return 0;
	}

	const slideNum = slide.getAttribute('slide');

	item.scrollIntoView( {block: "center", behavior: "smooth"} );

	focusOnItem = item;
	focusOnText = text;
	renderSlide(slide);
	window.requestAnimationFrame(() => {
		MathJax.startup.promise.then(() => {
			if (focusOnText != '') {
				console.log(focusOnText);
				const sanitizedText = text.replace(/\r/ig, 'r').toLowerCase().replace(/[^a-z0-9]/ig, '');
				const textItems = item.querySelectorAll(`*[text="${sanitizedText}"]`);
				if (textItems.length > 0) {
					textItems.forEach(item => item.classList.add('highlighted'));
					if (textItems[0].closest('.collapse, .hidden_collapse') !== null) {
						collapseToggle(slideNum, 'show');
					} else {
						item.scrollIntoView( {block: "center", behavior: "smooth"} );
					}
				}
			} else {
				item.classList.add('highlighted');
				if (item.closest('.collapse, .hidden_collapse') !== null) {
					collapseToggle(slideNum, 'show');
				}
			}
			window.requestAnimationFrame(() => {
				focusOnItem = null;
				focusOnText = '';
			});
		});
	});
}

function jumpToSlide(output, slide) {
	slide.scrollIntoView();
	window.requestAnimationFrame(() => {
		baseRenderer.then(cranach => {
			slide.scrollIntoView();
			if ( document.getElementById('right_half').classList.contains('present') ) {
				showSlide(slide, cranach);
			}
		});
	});
}

function highlight(item) {
	document.querySelectorAll('.highlighted').forEach(e => e.classList.remove('highlighted'));
	document.querySelector(`div[item="${item}"] button`).classList.add('highlighted');

}
function imagePostprocess(image) {

	image.classList.add('hidden');
	image.src = image.dataset.src;
	image.onload = function() {
		if (image.closest('.image') !== null && image.closest('.image').querySelector('.loading_icon') !== null) {
            image.closest('.image').querySelector('.loading_icon').classList.add('hidden');
        }
		image.classList.remove('loading');
		// if (image.classList.contains('exempt') || Math.max(image.naturalWidth, image.naturalHeight) < 450) {
		if (image.classList.contains('exempt')) {
			image.classList.remove('hidden');
			return 1;
		}

        let override = false;
        if (image.closest('.image') !== null) {

			override =
			image.closest('.image').style.width !== null &&
			typeof image.closest('.image').style.width !== 'undefined';
			// && Number.parseInt(image.closest('.image').style.width.replace(/px$/, '') < 600)
        }

		let width;
		let height;
		if (/svg/.test(image.src)) {
			if ((image.closest('.dual-left') !== null) || (image.closest('.dual-right') !== null)) {
				width = 300;
				height = 300;
				image.style.width = width;
			} else if (!override) {
				width = 450;
				height = 450;
                if (image.closest('.image') !== null) {
                    image.closest('.image').style.width = 450;
                }
				image.setAttribute('width', width);
			} else {
				image.style.width = '100%';
			}
		} else if (!override) {
			// image.removeAttribute('style');
			image.removeAttribute('width');
			image.removeAttribute('height');

			let width = image.naturalWidth;
			let height = image.naturalHeight;

			if (width > height) {
				if (width >= 600) {
					image.style.width = '100%';
					image.style['max-height'] = '100%';
				} else {
					image.style['max-width'] =  '100%';
					image.style.height = 'auto';
				}
			} else {
				if (height > 560) {
					if ((image.closest('.dual-left') !== null) || (image.closest('.dual-right') !== null)) {
						image.style.width = '100%';
						image.style['max-height'] = '100%';
					} else {
						// if ((typeof image.closest('.image').style.width === 'undefined')|| (image.closest('.image').style.width === false) || (image.closest('.image').style.width === '0px') || (image.width == '600px')){
							if ((typeof image.closest('.image').style.width === 'undefined')){
							image.style['height'] = '560px';
							image.style['width'] = 'auto';
						} else {
							image.style['height'] = 'auto';
							image.style['max-width'] = '100%';
						}
					}
				} else {
					image.style['max-width'] = '100%';
					image.style['height'] = 'auto';
				}
			}
		} else {
			image.removeAttribute('width');
			image.removeAttribute('height');

			if (image.style['width'] == '' || typeof image.style['width'] === 'undefined' || image.style['width'] === false) {
				image.style['width'] = '100%';
			}
		}

		image.style['background'] = 'none';
		image.classList.remove('hidden');
	}
}


// https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
function isElementInViewport (el) {

	let rect = el.getBoundingClientRect();

	return (
		(
			rect.top >= 0  &&
			rect.top <= window.innerHeight
		)
		||
		(
			rect.bottom >= 0  &&
			rect.bottom <= window.innerHeight
		)

	);
}

function updateRefs(slide, cranach) {

	slide.querySelectorAll('a.lcref').forEach(e => {
		e.setAttribute('lcref', "");

		let label = e.getAttribute('label');
		let md5 = e.getAttribute('md5');
		let contentDir = cranach.attr['dir'];
		let rootURL = cranach.attr['rootURL'];


		if (cranach.hasXML) {
			contentDir = cranach.attr['xmlPath'].replace(/[^\/]+\.xml$/, '');
		} else if (cranach.hasWb) {
			contentDir = cranach.attr['wbPath'].replace(/[^\/]+\.wb$/, '');
		}

		let statementType = 'statement';

		if (e.hasAttribute('type')) {
			if (e.getAttribute('type').match(/proof|solution|answer/i)) {
				statementType = 'substatement';
			}
			if (e.getAttribute('type').match(/figure/i)) {
				statementType = 'figure';
			}
		}

		let lcref = '';
		if (e.getAttribute('filename') == 'self') {
			if (cranach.hasXML) {
				lcref = rootURL + "?xml=" + cranach.attr['xmlPath'] + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
			} else {
				lcref = rootURL + "?wb=" + cranach.attr['wbPath'] + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
			}
		} else if (e.hasAttribute('src-filename')) {
			if (e.getAttribute('src-filename').match(/\.xml$/)) {
				lcref = rootURL + "?xml=" + contentDir + '/' + e.getAttribute('src-filename') + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
			} else {
				lcref = rootURL + "?wb=" + contentDir + '/' + e.getAttribute('src-filename') + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
			}
		}

		e.setAttribute('lcref', lcref + '&version=' + Math.random());
	});

	slide.querySelectorAll('[lcref]:not(.updated)').forEach(el => {
		el.addEventListener('click', function(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			if(!el.hasAttribute("lcref-uid")) {
				el.setAttribute("lcref-uid", lcref_id_counter);
				lcref_id_counter++;
			}
			lcref_click_handler(el);
		});
		el.removeAttribute("href");
		el.classList.add('updated');
	});

	slide.querySelectorAll('a.href').forEach(a => {

		const label = a.getAttribute('label');
		const serial = a.getAttribute('serial');
		const filename = a.getAttribute('filename');
		const srcFilename = a.getAttribute('src-filename');
		const md5 = a.getAttribute('md5');
		let contentDir = ''

		let rootURL = cranach.attr['rootURL'];
		if (cranach.hasXML) {
			contentDir = cranach.attr['xmlPath'].replace(/[^\/]+\.xml$/, '');
		} else if (cranach.hasWb) {
			contentDir = cranach.attr['wbPath'].replace(/[^\/]+\.wb$/, '');
		}

		let href = rootURL;
		if (filename == 'self') {
			href += cranach.hasXML ? `?xml=${cranach.attr['xmlPath']}` :  `?wb=${cranach.attr['wbPath']}`;
			href += `&section=${serial}`;
		} else {
			href += cranach.hasXML ? `?xml=` : `?wb=`;
			href += `${contentDir}/${srcFilename}&section=${serial}`;
		}

		a.setAttribute('target', '_blank');
		a.setAttribute('href', href);

	});

}

function updateSlideClickEvent() {
	const output = document.getElementById('output');
	document.querySelectorAll('.output > div.slide').forEach( ( div, index ) => {
		div.addEventListener('click', () => {
			let slideNum = div.getAttribute('slide');

			document.querySelectorAll('.highlighted[text], button.highlighted').forEach(e => e.classList.remove('highlighted'));

			if (!div.classList.contains('selected')) {
				output.dataset.selectedSlide = slideNum;
			}
			// if (slideNum != output.dataset.selectedSlide || !('selectedSlide' in output.dataset) ||
			// (output.querySelector(':scope > div.slide.selected') === null && index == 0)) {
			// 	output.dataset.selectedSlide = slideNum;
			// }
		});
	});
}

let timer = null;
function updateScrollEvent() {
		// https://stackoverflow.com/questions/4620906/how-do-i-know-when-ive-stopped-scrolling
	document.querySelector('.output').addEventListener('scroll', () => {
		if(timer !== null) {
			clearTimeout(timer);
		}
		timer = window.setTimeout(function() {
			document.querySelectorAll('#right_half:not(.carousel) .output > div.slide.tex2jax_ignore').forEach( div => {
				if (isElementInViewport(div)) {
					batchRender(div);
				};
			});
		}, 15*100);
	});
}

function selectSlide(slide) {
	if (slide !== null) {
		document.querySelector('.output').dataset.selectedSlide = slide.getAttribute('slide');
	}
}

document.addEventListener('DOMContentLoaded', () => {
	let slideObserver = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type == "attributes") {
				if (mutation.attributeName == 'data-selected-slide') {
					let slide = document.querySelector(`.output div.slide[slide="${document.querySelector('#output').getAttribute('data-selected-slide')}"]`);
					// console.log('mutation');
					updateSlideContent(slide, document.querySelectorAll('.carousel-item') !== null);
				}
			}
		});
	});
	slideObserver.observe(document.getElementById('output'), {
		attributes: true,
	});

	document.querySelectorAll('#uncollapse_button').forEach(el => el.addEventListener('click', () =>
        collapseToggle(document.querySelector('#output').getAttribute('data-selected-slide'))
    ));
});
