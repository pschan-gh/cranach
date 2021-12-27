const indicatorButton = document.createElement('button');
indicatorButton.setAttribute('type', 'button');
indicatorButton.dataset['bsTarget'] = "#right_half";
indicatorButton.dataset['bsToggle'] = "tooltip";
indicatorButton.dataset['bsPlacement'] = "bottom";

function updateCarousel(slideNum) {
	// console.log('updateCarousel');

    let slides = document.querySelectorAll('#output > div.slide');

    if (slides === null) {
        return 0;
    }
	bootstrap.Carousel.getOrCreateInstance(document.querySelector('#right_half'), {
		dispose: true
	});

	// $('.tooltip').remove();
	// $('.carousel-indicators div.tooltip').remove();
	document.querySelector(".carousel-indicators").innerHTML = '';
	document.querySelector('.carousel-indicators').outerHTML = document.querySelector('.carousel-indicators').outerHTML;
	document.querySelector('.controls_container').outerHTML = document.querySelector('.controls_container').outerHTML;

    if (slides.length > 50) {
		carouselThreeSlides(slideNum, slides);
    } else {
		document.querySelectorAll('#output > div.slide').forEach(e => {
            e.classList.add('carousel-item');
            e.classList.remove('hidden');
        });
		let activeIndex = 0;
        slides.forEach((e, index) => {
            let button = indicatorButton.cloneNode(true);
            button.setAttribute('aria-label', `Slide ${e.getAttribute('slide')}`);
            button.setAttribute('title', `Slide ${e.getAttribute('slide')}`);
            button.dataset['bsSlideTo'] = `${index}`;

			// $(".carousel-indicators").append(`<button type="button" data-bs-target="#right_half" data-bs-slide-to="${index}" aria-label="Slide ${this.getAttribute('slide')}" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Slide ${this.getAttribute('slide')}"/>`);
			if (e.getAttribute('slide') == slideNum) {
				activeIndex = index;
                button.classList.add('active');
                button.setAttribute('aria-current', 'true');
			}
            document.querySelector(".carousel-indicators").appendChild(button);
		});
		document.querySelectorAll(".carousel-indicators button").forEach(e => {
	        bootstrap.Tooltip.getOrCreateInstance(e, {
	            delay: { "show": 0, "hide": 0 }
	        });
	    });
    }

    // tooltip({'delay': { show: 0, hide: 0 }});

	document.querySelector('#output > div.slide.carousel-item[slide="' + slideNum + '"]').classList.add('active');
    document.querySelector('#right_half .slide_number button').textContent = 'Slide ' + slideNum;
    document.querySelector('#right_half .slide_number button').setAttribute('slide', slideNum);

	new bootstrap.Carousel(document.querySelector('#right_half'));
	document.getElementById('right_half').classList.add('carousel', 'slide');
	document.querySelector('.carousel').removeEventListener('slid.bs.carousel', carouselSlideHandler);
    document.querySelector('.carousel').addEventListener('slid.bs.carousel', carouselSlideHandler);
}

function carouselThreeSlides(slideNum, slides) {

	let prevNum = ((slideNum - 2 + slides.length) % slides.length) + 1;
    let nextNum = slideNum == slides.length - 1 ? slides.length : (slideNum + 1) % slides.length;

	document.querySelector(".carousel-indicators").innerHTML = '';

	document.querySelectorAll('#output > div.slide:not([slide="' + slideNum + '"]').forEach(e => {
		e.classList.remove('carousel-item');
		e.classList.add('hidden');
	});
	document.querySelectorAll(`#output > div.slide[slide="${prevNum}"], #output > div.slide[slide="${slideNum}"], #output > div.slide[slide="${nextNum}"]`).forEach(e => {
		e.classList.add('carousel-item');
		e.classList.remove('hidden');
	});

	if (prevNum < slideNum) {
		let button = indicatorButton.cloneNode(true);
		button.setAttribute('aria-label', `Slide ${prevNum}`);
		button.setAttribute('title', `Slide ${prevNum}`);
		button.dataset['bsSlideTo'] = `0`;
		document.querySelector(".carousel-indicators").appendChild(button);
	}
	let button = indicatorButton.cloneNode(true);
	button.setAttribute('aria-label', `Slide ${slideNum}`);
	button.setAttribute('title', `Slide ${slideNum}`);
	button.dataset['bsSlideTo'] = `1`;
	button.classList.add('active');
	button.setAttribute('aria-current', "true");
	document.querySelector(".carousel-indicators").appendChild(button);
	if (nextNum > slideNum) {
		let button = indicatorButton.cloneNode(true);
		button.setAttribute('aria-label', `Slide ${nextNum}`);
		button.setAttribute('title', `Slide ${nextNum}`);
		button.dataset['bsSlideTo'] = `2`;
		document.querySelector(".carousel-indicators").appendChild(button);
	}
	document.querySelectorAll(".carousel-indicators button").forEach(e => {
		bootstrap.Tooltip.getOrCreateInstance(e, {
			delay: { "show": 0, "hide": 0 }
		});
	});
}

function carouselSlideHandler() {
	console.log('carousel slide event');
	document.querySelector('#right_half .slide_number button').textContent = 'Slide ' + document.querySelector('.carousel-item.active').getAttribute('slide');
	document.querySelector('#right_half .slide_number button').setAttribute('slide', document.querySelector('.carousel-item.active').getAttribute('slide'));

	let slide = document.querySelector('#output > div.carousel-item.active');
	let slideNum = parseInt(slide.getAttribute('slide'));
	document.querySelector('#output > div.slide[slide="' + slideNum + '"]').classList.add('selected');

	let slides = document.querySelectorAll('#output > div.slide');
	let prevNum = ((slideNum - 2 + slides.length) % slides.length) + 1;
	let nextNum = slideNum == slides.length - 1 ? slides.length : (slideNum + 1) % slides.length;

	if (slides.length > 50) {
		carouselThreeSlides(slideNum, slides);
	}
	document.getElementById('output').dataset.selectedSlide = slideNum;
}

function updateCarouselSlide(slide, content = null) {
	// console.log('updateCarouselSlide');
	if (!document.querySelector('#output').classList.contains('present')) {
		return 1;
	}

	let outerContent = slide.querySelector(':scope > .slide_container > .slide_content');

	outerContent.style['padding-bottom'] = '';

	let bufferedWidth = 0;
	MathJax.startup.promise.then(() => {
		let mathJaxContentList = content == null ? outerContent.querySelectorAll('.MathJax') : content.querySelectorAll('.MathJax');

		if (mathJaxContentList != null) {
			mathJaxContentList.forEach(e => {
				if (!e.style.fontSize.match(/em$/)) {
					e.style.fontSize = "1.2em";
				}
			});
			while (outerContent.scrollWidth > outerContent.clientWidth
				&& outerContent.scrollWidth != bufferedWidth
				&& parseFloat(mathJaxContentList[0].style.fontSize.replace(/em$/, '')) > 0.8) {
					console.log('adjusting width');
					bufferedWidth = outerContent.scrollWidth;
					mathJaxContentList.forEach(e => {
						e.style.fontSize = (parseFloat(e.style.fontSize.replace(/em$/, '')) - 0.1).toString() + 'em';
					});
			}
		}
		adjustHeight();
	});
}

function showSlide(slide, cranach) {
	console.log('showSlide');
	if (slide == null) {
        if (document.querySelector('div.slide.selected') !== null) {
            slide = document.querySelector('div.slide.selected');
        } else {
            slide = document.querySelector('#output > div.slide');
        }
    }
    document.querySelectorAll('.pane').forEach(e => e.classList.remove('info', 'overview', 'compose'));
	document.querySelectorAll('.pane').forEach(e => e.classList.add('present'));
	document.getElementById('output').classList.add('present');

    let slideNum = parseInt(slide.getAttribute('slide'));

	updateCarousel(slideNum);
	updateCarouselSlide(slide);

    cranach.then(renderer => {
        updateModal(renderer);
    });
}

function hideCarousel() {
    if ($('.output.present:visible').first().hasClass('annotate')) {
        hideAnnotate();
    }

    $('#container').removeClass('wide');
    $('.present')
	// .removeClass('slide')
    .removeClass('present')
    .removeClass('overview')
    .addClass($('#left_half')
    .attr('mode'));

	$('#output > div.slide')
    .removeClass('carousel-item')
    .removeClass('active')
    .removeClass('hidden')
    .addClass('tex2jax_ignore');
    $('.controls').addClass('hidden');
    $('#output .slide_content').css('padding-bottom', '');

    $('#output > div.slide.selected')[0].scrollIntoView();

    $('.separator').css('font-weight', 'normal');
    $('.separator').find('a').css('color', 'pink');

    $('.slide.selected').find('.separator').css('font-weight', 'bold');
    $('.slide.selected').find('.separator').find('a').css('color', 'red');

}

function adjustHeight() {
	let $output = $('#output');
	if ($('.carousel-item').length == 0) {
		 return 1;
	}
	let $slide = $(`#output > div.slide[slide="${$('#output').attr('data-selected-slide')}"]`);
	$slide.find('.slide_content').css('padding-bottom', '');
	if ($slide[0].scrollHeight >  $output.innerHeight() || $output.hasClass('annotate')) {
		$output.css('display', 'block');
	} else {
		$output.css('display', '');
	}
}

function hideAnnotate() {
	$('canvas').hide();
	$('canvas').closest('div.slide').find('.canvas-controls .disable').click();
	$('.output:visible').removeClass('annotate');
	$('#right_half').removeClass('annotate');
}

function showAnnotate() {
	$('#right_half').addClass('annotate');
	$('.output.present:visible').first().addClass('annotate');
	$('.carousel').attr('data-bs-touch', "false");
}

function annotate() {
	if ($('.output.present:visible').first().hasClass('annotate')) {
		hideAnnotate();
	} else {
		showAnnotate();
	}
	updateCanvas($('.output.present:visible div.slide.active')[0]);
}

function expandCanvas(slide, scale = 1) {
	if (!document.querySelector('#output').classList.contains('annotate')) {
		return 0;
	}

	slide.cfd.disableDrawingMode();
	// https://stackoverflow.com/questions/331052/how-to-resize-html-canvas-element
	let oldCanvas = slide.cfd.canvas.toDataURL("image/png");
	let img = new Image();
	img.src = oldCanvas;
	img.onload = function (){
		MathJax.startup.promise.then(() => {
			let output = document.getElementById('output');
			// slide.cfd.canvas.style.top = -parseInt(slide.cfd.canvas.closest('.slide.carousel-item').getBoundingClientRect().top);
			slide.cfd.canvas.width = output.scrollWidth;
			slide.cfd.canvas.height = output.scrollHeight*scale;
			let ctx = slide.cfd.canvas.getContext('2d');
			ctx.drawImage(img, 0, 0);
			slide.cfd.enableDrawingMode();
			slide.cfd.setDraw();
		});
	}
}

function updateCanvas(slide) {
	if ($('.carousel-item').length == 0) {
		return 0;
	}
	if ($('.output.present:visible').first().hasClass('annotate')) {
		if (!$(slide).find('canvas').length) {
			addCanvas(slide);
		}
		$(slide).find('canvas').show();
	} else {
		if ($(slide).find('canvas').length) {
			$(slide).find('canvas').hide();
		}
		return 1;
	}
	$('.canvas-controls').find('*').off();
	// $('.canvas-controls .annotate').off();
	$('.canvas-controls .clear').click(function() {
		$(slide).find('canvas').remove();
		addCanvas(slide);
	});
	// $('.canvas-controls .expand').off();
	$('.canvas-controls .expand').click(function() {expandCanvas(slide, 1.1);});
	// $('.canvas-controls .disable').off();
	$('.canvas-controls .disable').click(function() {
		slide.cfd.disableDrawingMode();
		$(slide.cfd.canvas).css('z-index', 0);
		$('.canvas-controls .nav-link').not('.enable').addClass('disabled');
		$('.canvas-controls .enable').removeClass('disabled');
		// $('.carousel').attr('data-bs-touch', "true");
	});
	// $('.canvas-controls .erase').off();
	$('.canvas-controls .erase').click(function() {
		slide.cfd.setErase();
		$('.canvas-controls .nav-link').removeClass('disabled');
		$(this).addClass('disabled');
	});
	// $('.canvas-controls .enable').off();
	$('.canvas-controls .enable').click(function() {
		slide.cfd.enableDrawingMode();
		$(slide.cfd.canvas).show();
		$(slide.cfd.canvas).css('z-index', 999);
		slide.cfd.setDraw();
		$('.canvas-controls .nav-link').removeClass('disabled');
		$(this).addClass('disabled');
	});
	$('.canvas-controls .undo').click(() => slide.cfd.undo());
	$('.canvas-controls .redo').click(() => slide.cfd.redo());
	$('.canvas-controls .red').click(() => slide.cfd.setDrawingColor([255, 0, 0]));
	$('.canvas-controls .green').click(() => slide.cfd.setDrawingColor([0, 180, 0]));
	$('.canvas-controls .blue').click(() => slide.cfd.setDrawingColor([0, 0, 255]));
	$('.canvas-controls .orange').click(() => slide.cfd.setDrawingColor([255, 128, 0]));
	$('.canvas-controls .black').click(() => slide.cfd.setDrawingColor([0, 0, 0]));

	$('.canvas-controls .disable').click();
}

function clearAllCanvas() {
	if (window.confirm("Are you sure?")) {
		hideAnnotate();
		$('canvas').remove();
	}
}

function addCanvas(slide) {
	if ($(slide).find('canvas').length || !$(slide).closest('.output.present:visible').hasClass('present')) {
		return 0;
	}
	let output = document.getElementById('output');
	let width = output.scrollWidth;
	let height = output.scrollHeight - 5;

	slide.cfd = new CanvasFreeDrawing.default({
		elementId: slide.id,
		width: width,
		height: height,
		showWarnings: true,
	});
	slide.cfd.setLineWidth(2);
	slide.redrawCount = $(slide).find('.annotate.redraw-count').first()[0];
	slide.cfd.on({ event: 'redraw', counter: 0 }, () => {
		slide.redrawCount.innerText = parseInt(slide.redrawCount.innerText) + 1;
	});
}
