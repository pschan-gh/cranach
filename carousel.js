function updateCarousel(slideNum) {
	// console.log('updateCarousel');

	let $slides = $('#output > div.slide');

    if ($slides.length == null || $slides.length == 0) {
        return 0;
    }

    let prevNum = ((slideNum - 2 + $slides.length) % $slides.length) + 1;
    let nextNum = slideNum == $slides.length - 1 ? $slides.length : (slideNum + 1) % $slides.length;

	$('.tooltip').remove();
	$('.carousel-indicators div.tooltip').remove();
	$(".carousel-indicators").html('');

    if ($slides.length > 50) {
		$('#output > div.slide').removeClass('carousel-item').addClass('hidden');
		$('#output > div.slide[slide="' + slideNum + '"]').addClass('carousel-item').removeClass('hidden');
		$('#output > div.slide[slide="' + prevNum + '"]').addClass('carousel-item').removeClass('hidden');
		$('#output > div.slide[slide="' + nextNum + '"]').addClass('carousel-item').removeClass('hidden');

		if (prevNum < slideNum) {
			$(".carousel-indicators").append(`<button type="button" data-bs-target="#right_half" data-bs-slide-to="0" aria-label="Slide ${prevNum}" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Slide ${prevNum}">`);
		}
		$(".carousel-indicators").append(`<button type="button" data-bs-target="#right_half" data-bs-slide-to="1" aria-label="Slide ${slideNum}" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Slide ${slideNum}">`);
		if (nextNum > slideNum) {
			$(".carousel-indicators").append(`<button type="button" data-bs-target="#right_half" data-bs-slide-to="2" aria-label="Slide ${nextNum}" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Slide ${nextNum}">`);
		}
		$('.carousel-indicators button[data-bs-slide-to="1"]').addClass('active').attr('aria-current', "true");
    } else {
		$('#output > div.slide').addClass('carousel-item').removeClass('hidden');
		let activeIndex = 0;
		$slides.each(function(index) {
			$(".carousel-indicators").append(`<button type="button" data-bs-target="#right_half" data-bs-slide-to="${index}" aria-label="Slide ${this.getAttribute('slide')}" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Slide ${this.getAttribute('slide')}"/>`);
			if (this.getAttribute('slide') == slideNum) {
				activeIndex = index;
			}
		});
		$(`.carousel-indicators button[data-bs-slide-to="${activeIndex}"]`)
		.addClass('active')
		.attr('aria-current', "true");
    }

	$(".carousel-indicators button").tooltip({'delay': { show: 0, hide: 0 }});

	$('#output > div.slide.carousel-item[slide="' + slideNum + '"]').addClass('active');
    $('#right_half .slide_number button').text('Slide ' + $('.carousel-item.active').attr('slide'));
    $('#right_half .slide_number button').attr('slide', $('.carousel-item.active').attr('slide'));

	$('#right_half').addClass('carousel').addClass('slide');
}

function updateCarouselSlide() {
	// console.log('updateCarouselSlide');
	if ($('.carousel-item').length == 0) {
		return 1;
	}

	$('#output > div.slide.active .slide_container > .slide_content').css('padding-bottom', '');
	let content = $('#output > div.slide.active .slide_content').first()[0];
	let $mathJaxContent = $('#output > div.slide.active .slide_content .MathJax');

	$mathJaxContent.each(function() {
		if (!this.style.fontSize.match(/em$/)) {
			this.style.fontSize = "1.2em";
		}
	});

	let bufferedWidth = 0;
	MathJax.startup.promise.then(() => {
		while (content.scrollWidth > content.clientWidth
			&& content.scrollWidth != bufferedWidth
			&& parseFloat($mathJaxContent.first()[0].style.fontSize.replace(/em$/, '')) > 0.8) {
				console.log('adjusting width');
				bufferedWidth = content.scrollWidth;
				$mathJaxContent.each(function() {
					this.style.fontSize = (parseFloat(this.style.fontSize.replace(/em$/, '')) - 0.1).toString() + 'em';
					// resizeFont(-0.5, content);
				});
		}
		adjustHeight();
	});
}

function showSlide(slide, cranach) {
	console.log('showSlide');
    $('.pane').removeClass('info')
    .removeClass('overview')
    .removeClass('compose')
    .addClass('present');

    $('#output').addClass('present');

    let $slide = $(slide);
	$slide.addClass('selected');
	let slideNum = parseInt($slide.attr('slide'));

	updateCarousel(slideNum);
	updateCarouselEvent();

    cranach.then(renderer => {
        updateModal(renderer);
    });

	// $('#output').attr('data-selected-slide', slideNum);
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
    $('.controls').hide();
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
	$('.canvas-controls .expand').click(function() {
		slide.cfd.disableDrawingMode();
		// https://stackoverflow.com/questions/331052/how-to-resize-html-canvas-element
		let oldCanvas = slide.cfd.canvas.toDataURL("image/png");
		let img = new Image();
		img.src = oldCanvas;
		img.onload = function (){
			$(slide.cfd.canvas).first()[0].width = $('.output.present:visible').first()[0].scrollWidth;
			$(slide.cfd.canvas).first()[0].height = $('.output.present:visible').first()[0].scrollHeight;
			let ctx = slide.cfd.canvas.getContext('2d');
			ctx.drawImage(img, 0, 0);
			slide.cfd.enableDrawingMode();
			slide.cfd.setDraw();
		}
	});
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

	let width = $('.output.present:visible').first()[0].scrollWidth;
	let height = $('.output.present:visible').first()[0].scrollHeight;

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

function updateCarouselEvent() {
	$(function() {
		$('.carousel').on('slid.bs.carousel', function () {
			$('#right_half .slide_number button').text('Slide ' + $('.carousel-item.active').attr('slide'));
			$('#right_half .slide_number button').attr('slide', $('.carousel-item.active').attr('slide'));

			let $slide = $('#output > div.carousel-item.active').first();
			let slideNum = parseInt($slide.attr('slide'));
			$('#output > div.slide[slide="' + slideNum + '"]').addClass('selected');

			let $slides = $('#output > div.slide');
			let prevNum = ((slideNum - 2 + $slides.length) % $slides.length) + 1;
			let nextNum = slideNum == $slides.length - 1 ? $slides.length : (slideNum + 1) % $slides.length;

			if ($slides.length > 50) {
				$('.tooltip').remove();
				$('.carousel-indicators div.tooltip').remove();
				$(".carousel-indicators").html('');

				$('#output > div.slide').not('.slide[slide="' + slideNum + '"]').removeClass('carousel-item').addClass('hidden');
				$(`#output > div.slide[slide="${prevNum}"]`).addClass('carousel-item').removeClass('hidden');
				$(`#output > div.slide[slide="${nextNum}"]`).addClass('carousel-item').removeClass('hidden');

				if (prevNum < slideNum) {
					$(".carousel-indicators").append(`<button type="button" data-bs-target="#right_half" data-bs-slide-to="0" aria-label="Slide ${prevNum}" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Slide ${prevNum}"">`);
				}
				$(".carousel-indicators").append(`<button type="button" data-bs-target="#right_half" data-bs-slide-to="1" aria-label="Slide ${slideNum}" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Slide ${slideNum}"">`);
				if (nextNum > slideNum) {
					$(".carousel-indicators").append(`<button type="button" data-bs-target="#right_half" data-bs-slide-to="2" aria-label="Slide ${nextNum}" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Slide ${nextNum}"">`);
				}
				$('.carousel-indicators button[data-bs-slide-to="1"]').addClass('active').attr('aria-current', "true");
				$(".carousel-indicators button").tooltip({'delay': { show: 0, hide: 0 }});
			}
			$('#output').attr('data-selected-slide', slideNum);
		});

		$('.carousel').on('shown.bs.collapse', 'div.collapse', function() {
			updateCarouselSlide();
		});
		$('.carousel').on('hidden.bs.collapse', 'div.collapse', function() {
			updateCarouselSlide();
		});

	});
}
$(function() {
	$('#output.present').scroll(function(event) {
		let element = event.target;
		if(element.scrollHeight - element.scrollTop === element.clientHeight) {
			$('#output > div.slide.active > .slide_container > .slide_content').css('padding-bottom', '15em');
		}
	});

	$('#output')[0].addEventListener('wheel', function(event) {
		let element = $('#output')[0];
		if (event.deltaY > 0) {
			if(element.scrollHeight - element.scrollTop === element.clientHeight) {
				$('#output div.slide.active > .slide_container > .slide_content').css('padding-bottom', '15em');
			}
		}
	});
});
