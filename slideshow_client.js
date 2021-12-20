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
	// hideAnnotate();
	let outputDiv = document.querySelector('#output');
	let slide = outputDiv.querySelector('div.slide.selected') != null ? outputDiv.querySelectorAll('div.slide.selected')[0] : outputDiv.querySelectorAll('div.slide')[0];

	slide.setAttribute('contentEditable', enableEdit);

	if (!enableEdit) {
		MathJax.texReset();

		// $('#output').css('display', '');
		// $('#output div.slide').css('display', '');

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
			expandCanvas(slide);
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
		item.scrollIntoView();
		if (text != '') {
			let sanitizedText = text.replace(/\r/ig, 'r').toLowerCase().replace(/[^a-z0-9]/ig, '');
			console.log(sanitizedText);
			// let $textItem = $item.find('*[text="' + text.replace(/[^a-zÀ-ÿ0-9\s\-\']/ig, '') + '"]').addClass('highlighted');
			let textItem = item.querySelector(`*[text="${sanitizedText}"]`);
			if (textItem !== null) {
				if (textItem.closest('.collapse, .hidden_collapse') !== null) {
					collapseToggle(slideNum, 'show');
				}
				textItem.scrollIntoView();
				textItem.classList.add('highlighted');
			}
		} else {
			if (item.closest('.collapse, .hidden_collapse') !== null) {
				collapseToggle(slideNum, 'show');
			}
			item.scrollIntoView();
			item.classList.add('highlighted');
		}

		if(document.getElementById('right_half').classList.contains('present')) {
			baseRenderer.then(cranach => {
				showSlide(slide, cranach);
			});
		}
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

	$(image).attr('src', $(image).attr('data-src'));
	$(image).on('load', function() {
		$(image).closest('.image').find('.loading_icon').hide();
		$(image).removeClass('loading');
		if ($(image).hasClass('exempt') || Math.max($(image).get(0).naturalWidth, $(image).get(0).naturalHeight) < 450) {
			return 1;
		}

		let image_width = $(image).closest('.image').css('width');

		$(image).closest('.image').css('height', '');
		$(image).closest('.dual-left').css('height', '');
		$(image).closest('.dual-right').css('height', '');

		let override = ($(image).closest('.image').css('width') !== null && typeof $(image).closest('.image').css('width') !== 'undefined' && Number.parseInt($(image).closest('.image').css('width').replace(/px$/, '') < 600))

		if(/svg/.test($(image).attr('src'))) {
			if (($(image).closest('.dual-left').length > 0) || ($(image).closest('.dual-right').length > 0)) {
				let width = 300;
				let height = 300;
				$(image).attr('width', width);
			} else if (!override) {
				let width = 450;
				let height = 450;
				$(image).closest('.image').css('width', '450');
				$(image).attr('width', width);
			} else {
				$(image).css('width', '100%');
			}
		} else if (!override) {
			$(image).removeAttr('style');
			$(image).removeAttr('width');
			$(image).removeAttr('height');

			let width = $(image).get(0).naturalWidth;
			let height = $(image).get(0).naturalHeight;

			if (width > height) {
				if (width > 600) {
					$(image).css('width', '100%');
					$(image).css('max-height', '100%');
				} else {
					$(image).css('max-width', '100%');
					$(image).css('height', 'auto');
				}
			} else {
				if (height > 560) {
					if (($(image).closest('.dual-left').length > 0) || ($(image).closest('.dual-right').length > 0)) {
						$(image).css('width', '100%');
						$(image).css('max-height', '100%');
					} else {
						if((typeof $(image).closest('.image').css('width') === 'undefined')|| ($(image).closest('.image').css('width') === false) || ($(image).closest('.image').css('width') === '0px') || (image_width == '600px')){
							$(image).css('height', '560px');
							$(image).css('width', 'auto');
						} else {
							$(image).css('height', 'auto');
							$(image).css('max-width', '100%');
						}
					}
				} else {
					if((typeof $(image).closest('.image').css('width') === 'undefined')|| ($(image).closest('.image').css('width') === false) || ($(image).closest('.image').css('width') === '0px')) {
						$(image).css('max-width', '100%');
						$(image).css('height', 'auto');
					} else {
						$(image).css('max-width', '100%');
						$(image).css('height', 'auto');
					}
				}
			}
		} else {
			if ($(image).css('width') == '' || typeof $(image).css('width') === 'undefined' || $(image).css('width') === false) {
				$(image).css('width', '100%');
			}
		}

		$(image).css('background', 'none');
		$(image).show();
	});
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

	$(slide).find('a.lcref').each(function() {
		$(this).attr('lcref', "");

		let label = $(this).attr('label');
		let md5 = $(this).attr('md5');
		let contentDir = cranach.attr['dir'];
		let rootURL = cranach.attr['rootURL'];


		if (cranach.hasXML) {
			contentDir = cranach.attr['xmlPath'].replace(/[^\/]+\.xml$/, '');
		} else if (cranach.hasWb) {
			contentDir = cranach.attr['wbPath'].replace(/[^\/]+\.wb$/, '');
		}

		let statementType = 'statement';
		if ($(this).attr('type').match(/proof|solution|answer/i)) {
			statementType = 'substatement';
		}
		if ($(this).attr('type').match(/figure/i)) {
			statementType = 'figure';
		}

		let lcref = '';
		if ($(this).attr('filename') == 'self') {
			if (cranach.hasXML) {
				lcref = rootURL + "?xml=" + cranach.attr['xmlPath'] + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
			} else {
				lcref = rootURL + "?wb=" + cranach.attr['wbPath'] + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
			}
		} else if ($(this).attr('src-filename')) {
			if ($(this).attr('src-filename').match(/\.xml$/)) {
				lcref = rootURL + "?xml=" + contentDir + '/' + $(this).attr('src-filename') + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
			} else {
				lcref = rootURL + "?wb=" + contentDir + '/' + $(this).attr('src-filename') + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
			}
		}

		$(this).attr('lcref', lcref + '&version=' +Math.random());

	});

	$(slide).find('a.href').each(function() {

		let label = $(this).attr('label');
		let serial = $(this).attr('serial');
		let md5 = $(this).attr('md5');
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
				let href = rootURL + "?xml=" + contentDir + '/' + $(this).attr('src-filename') + '&section=' + serial;
			} else {
				let href = rootURL + "?wb=" + contentDir + '/' + $(this).attr('src-filename') + '&section=' + serial;
			}
		}

		$(this).attr('target', '_blank');
		$(this).attr('href', href);

	});

}

function updateSlideClickEvent() {
	$('.output div.slide').off();
	$('.output div.slide').click(function() {
		let slideNum = $(this).attr('slide');
		let slide = this;
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
