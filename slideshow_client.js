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
    // console.log(`initiating collapse on ${slide.getAttribute('slide')}.`);
    slide.querySelectorAll('.hidden_collapse').forEach(e => {
		e.classList.add('collapse');
		e.classList.remove('hidden_collapse');
		e.addEventListener('shown.bs.collapse', function() {
			updateCarouselSlide(slide, e);
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

	baseRenderer.then(cranach => {
		updateRefs(slide, cranach)
	});

	renderTexSource(slide);
	slide.querySelectorAll('.latexSource').forEach(e => e.remove());
	slide.classList.remove("tex2jax_ignore");
	MathJax.startup.promise = typeset([slide]);
}

function batchRender(slide) {
	// console.log('batchRender');
	renderSlide(slide.nextSibling);
	renderSlide(slide.previousSibling);
	renderSlide(slide);
}

function updateSlideContent(slide, carousel = false) {
	console.log('updateSlideContent');
	console.log(slide);
    document.querySelectorAll(`#output > div.slide`).forEach(e => e.classList.remove('selected', 'active'));
    slide.classList.add('selected', 'active');
	batchRender(slide);
	slide.querySelectorAll('iframe.hidden').forEach(e => {
		if (e.closest('div.comment') !== null) {
			return 0;
		}
		e.src = e.getAttribute('data-src');
		e.classList.remove('hidden');
		e.style.display = '';
		iFrameResize({ log: false, checkOrigin:false }, e);

	});

	document.querySelector('#uncollapse_button').textContent = slide.classList.contains('collapsed') ? 'Uncollapse' : 'Collapse';

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
	MathJax.startup.promise.then(() => {
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
	});
}

function focusOn(item, text = '') {

	let slide = item.closest('div.slide');
	if (slide === null) {
		return 0;
	}

	let slideNum = slide.getAttribute('slide');
	renderSlide(slide);

	MathJax.startup.promise.then(() => {
		if (text != '') {
			let sanitizedText = text.replace(/\r/ig, 'r').toLowerCase().replace(/[^a-z0-9]/ig, '');
			console.log(sanitizedText);
			// let $textItem = $item.find('*[text="' + text.replace(/[^a-zÀ-ÿ0-9\s\-\']/ig, '') + '"]').addClass('highlighted');
			let textItem = item.querySelector(`*[text="${sanitizedText}"]`);
			// textItem.scrollIntoView();
			if (textItem !== null) {
				if (textItem.closest('.collapse, .hidden_collapse') !== null) {
					collapseToggle(slideNum, 'show');
				}
				textItem.classList.add('highlighted');
			}
		} else {
			if (item.closest('.collapse, .hidden_collapse') !== null) {
				collapseToggle(slideNum, 'show');
			}
			item.classList.add('highlighted');
		}
		item.scrollIntoView();


		// if(document.getElementById('right_half').classList.contains('present')) {
		// 	baseRenderer.then(cranach => {
		// 		showSlide(slide, cranach);
		// 	});
		// }
	});
}

function jumpToSlide(output, slide) {
	slide.scrollIntoView();
	if(document.getElementById('right_half').classList.contains('present')) {
		baseRenderer.then(cranach => {
			showSlide(slide, cranach);
		});
	}
}

function highlight(item) {
	document.querySelectorAll('.highlighted').forEach(e => e.classList.remove('highlighted'));
	document.querySelector(`div[item="${item}"] button`).classList.add('highlighted');

}
function imagePostprocess(image) {

	// $(image).attr('src', $(image).attr('data-src'));
	image.src = image.dataset.src;
	image.onload = function() {
		// $(image).closest('.image').find('.loading_icon').hide();
        if (image.closest('.image') !== null && image.closest('.image').querySelector('.loading_icon') !== null) {
            image.closest('.image').querySelector('.loading_icon').classList.add('hidden');
        }
		image.classList.remove('loading');
		if (image.classList.contains('exempt') || Math.max(image.naturalWidth, image.naturalHeight) < 450) {
			return 1;
		}

        let override = false;
        if (image.closest('.image') !== null) {
            let image_width = image.closest('.image').style.width;

            if (image.closest('.image') !== null) {
                image.closest('.image').style.height = '';
            }
            if (image.closest('.dual-left') !== null) {
                image.closest('.dual-left').style.height = '';
            }
            if (image.closest('.dual-right') !== null) {
                image.closest('.dual-right').style.height = '';
            }

            override = (image.closest('.image').style.width !== null && typeof image.closest('.image').style.width !== 'undefined' && Number.parseInt(image.closest('.image').style.width.replace(/px$/, '') < 600))
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
			image.removeAttribute('style');
			image.removeAttribute('width');
			image.removeAttribute('height');

			let width = image.naturalWidth;
			let height = image.naturalHeight;

			if (width > height) {
				if (width > 600) {
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
						if ((typeof image.closest('.image').style.width === 'undefined')|| (image.closest('.image').style.width === false) || (image.closest('.image').style.width === '0px') || (image_width == '600px')){
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
					// if ((typeof image.closest('.image').style.width === 'undefined')|| (image.closest('.image').style.width === false) || (image.closest('.image').style.width === '0px')) {
					// 	$(image).css('max-width', '100%');
					// 	$(image).css('height', 'auto');
					// } else {
					// 	$(image).css('max-width', '100%');
					// 	$(image).css('height', 'auto');
					// }
				}
			}
		} else {
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
		if (e.getAttribute('type').match(/proof|solution|answer/i)) {
			statementType = 'substatement';
		}
		if (e.getAttribute('type').match(/figure/i)) {
			statementType = 'figure';
		}

		let lcref = '';
		if (e.getAttribute('filename') == 'self') {
			if (cranach.hasXML) {
				lcref = rootURL + "?xml=" + cranach.attr['xmlPath'] + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
			} else {
				lcref = rootURL + "?wb=" + cranach.attr['wbPath'] + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
			}
		} else if (e.getAttribute('src-filename')) {
			if (e.getAttribute('src-filename').match(/\.xml$/)) {
				lcref = rootURL + "?xml=" + contentDir + '/' + e.getAttribute('src-filename') + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
			} else {
				lcref = rootURL + "?wb=" + contentDir + '/' + e.getAttribute('src-filename') + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
			}
		}

		e.setAttribute('lcref', lcref + '&version=' + Math.random());
	});

	slide.querySelectorAll('a.href').forEach(e => function() {

		let label = e.getAttribute('label');
		let serial = e.getAttribute('serial');
		let md5 = e.getAttribute('md5');
		let contentDir = ''

		let rootURL = cranach.attr['rootURL'];
		if (cranach.hasXML) {
			contentDir = cranach.attr['xmlPath'].replace(/[^\/]+\.xml$/, '');
		} else if (cranach.hasWb) {
			contentDir = cranach.attr['wbPath'].replace(/[^\/]+\.wb$/, '');
		}

		let href = '';
		if ($(this).attr('filename') == 'self') {
			if (cranach.hasXML) {
				let href = rootURL + "?xml=" + cranach.attr['xmlPath'] + '&section=' + serial;
			} else {
				let href = rootURL + "?wb=" + cranach.attr['wbPath'] + '&section=' + serial;
			}
		} else {
			if (cranach.hasXML) {
				let href = rootURL + "?xml=" + contentDir + '/' + e.getAttribute('src-filename') + '&section=' + serial;
			} else {
				let href = rootURL + "?wb=" + contentDir + '/' + e.getAttribute('src-filename') + '&section=' + serial;
			}
		}

		e.setAttribute('target', '_blank');
		e.setAttribute('href', href);

	});

}

function updateSlideClickEvent() {
	$('.output > div.slide').off();
	$('.output > div.slide').click(function() {
		let slideNum = $(this).attr('slide');
		let slide = this;
		// $('div.slide').removeClass('selected');
		// $(this).addClass('selected');
		$('*[text]').removeClass('highlighted');
		$('button').removeClass('highlighted');
		$('.item_button').css('background-color', '');

		$('.separator').css('font-weight', 'normal');
		$('.separator').find('a').css('color', 'pink');

		$(slide).find('.separator').css('font-weight', 'bold');
		$(slide).find('.separator').find('a').css('color', 'red');
		if (slideNum != $('#output').attr('data-selected-slide') || !$('#output').is("[data-selected-slide]")) {
			$('#output').attr('data-selected-slide', slideNum);
		}
	});
}

let timer = null;
function updateScrollEvent() {
	$('#output').off();

	// https://stackoverflow.com/questions/4620906/how-do-i-know-when-ive-stopped-scrolling
	$('.output:visible').on('scroll', function() {
		if(timer !== null) {
			clearTimeout(timer);
		}
		timer = window.setTimeout(function() {
			$('div.slide.tex2jax_ignore:visible').each(function() {
				if (isElementInViewport(this)) {
					batchRender(this);
				};
			});
		}, 15*100);
	});
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

	document.querySelector('#uncollapse_button').addEventListener('click', () => {
        collapseToggle(document.querySelector('#output').getAttribute('data-selected-slide'));
    });
});
