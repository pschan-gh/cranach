function updateCarousel(slideNum) {

	new bootstrap.Carousel($('#right_half')[0], {
		dispose : true,
	});
	$('.tooltip').remove();

	$('#carousel div.slide')
	.removeClass('hidden')
	.addClass('carousel-item');

	$('.carousel-indicators div.tooltip').remove();
	$(".carousel-indicators").html('');

	let i;
	let currentIndex = -1;
	$('#carousel .carousel-item').each(function(index) {
		i = parseInt($(this).attr('slide'));
		$(".carousel-indicators").append('<button type="button" data-bs-target="#right_half" data-bs-slide-to="' + index + '" aria-label="Slide ' + i + '" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Slide ' + i + '">');
		if (i == slideNum) {
			currentIndex = index;
		}
	});
	if (currentIndex != -1) {
		$('.carousel-indicators button[data-bs-slide-to="' + currentIndex + '"]').addClass('active').attr('aria-current', "true");
	}
	$(".carousel-indicators button").tooltip({'delay': { show: 0, hide: 0 }});

	$('#carousel div.slide[slide="' + slideNum + '"]').addClass('active');

	new bootstrap.Carousel($('#right_half')[0], {
		keyboard: false,
		interval: false
	});
}

function updateCarouselSlide() {

	if ($('#carousel:visible').length == 0) {
		return 1;
	}

	MathJax.startup.promise.then(() => {
		$('#carousel div.slide.active > .slide_container > .slide_content').css('padding-bottom', '');
		let content = $('#carousel div.slide.active .slide_content').first()[0];
		let $mathJaxContent = $('#carousel div.slide.active .slide_content .MathJax');

		$mathJaxContent.each(function() {
			if (!this.style.fontSize.match(/em$/)) {
				this.style.fontSize = "1.2em";
			}
		});

		let bufferedWidth = 0;
		while (content.scrollWidth > content.clientWidth
			&& content.scrollWidth != bufferedWidth
			&& parseFloat($mathJaxContent.first()[0].style.fontSize.replace(/em$/, '')) > 0.8) {
			bufferedWidth = content.scrollWidth;
			$mathJaxContent.each(function() {
				this.style.fontSize = (parseFloat(this.style.fontSize.replace(/em$/, '')) - 0.1).toString() + 'em';
				// resizeFont(-0.5, content);
			});
		}
		adjustHeight();
		// $('#carousel div.slide.active > .slide_container > .slide_content').css('padding-bottom', '15em');
	});
}

function showSlide(slide, cranach) {
	$('.pane').removeClass('info')
	.removeClass('overview')
	.removeClass('compose')
	.addClass('present');

	$('#right_half').addClass('slide').addClass('present');

	$('.lcref-output').remove();

	let $slide = $(slide);

	let $slides = $('#output > .slide');

	if ($slides.length == null || $slides.length == 0) {
		return 0;
	}

	$('#output a.collapsea').removeAttr('data-bs-toggle');

	let slideNum = parseInt($slide.attr('slide'));
	let prevNum = ((slideNum - 2 + $slides.length) % $slides.length) + 1;
	let nextNum = slideNum == $slides.length - 1 ? $slides.length : (slideNum + 1) % $slides.length;


	$('#carousel.present').removeClass('carousel-inner');
	$('#carousel .slide').removeClass('carousel-item');

	$('#carousel div.slide').remove();
	MathJax.startup.promise.then(() => {
		if ($slides.length > 50) {
			removeTypeset($('#output').find('div.slide[slide="' + slideNum + '"]').first()[0]);
			let $cloneCurrent = $('#output').find('div.slide[slide="' + slideNum + '"]').first().clone(true, true);
			$cloneCurrent.appendTo($('#carousel'));

			removeTypeset($('#output').find('div.slide[slide="' + prevNum + '"]').first()[0]);
			let $clonePrev = $('#output').find('div.slide[slide="' + prevNum + '"]').first().clone(true, true);
			$('#carousel').prepend($clonePrev);

			removeTypeset($('#output').find('div.slide[slide="' + nextNum + '"]').first()[0]);
			let $cloneNext = $('#output').find('div.slide[slide="' + nextNum + '"]').first().clone(true, true);
			$cloneNext.appendTo($('#carousel'));
		} else {
			removeTypeset($('#output')[0]);
			$('#output div.slide').clone(true, true).appendTo($('#carousel'));
		}
		updateCarousel(slideNum);
		$slide = $('#carousel div.slide[slide="' + slideNum + '"]');

		$('.slide_number button').text('Slide ' + slideNum);
		$('.slide_number button').attr('slide', slideNum);

		if ($slide.find('a.collapsea[aria-expanded="false"]').length) {
			$('#uncollapse_button').text('Uncollapse');
		} else {
			$('#uncollapse_button').text('Collapse');
		}
		$('#uncollapse_button').off();
		$('#uncollapse_button').click(function() {
			collapseToggle(slideNum);
		});
		cranach.then(renderer => {
			updateModal(renderer);
		});

		$('#output').attr('data-selected-slide', slideNum);
		MathJax.startup.document.state(0);
		MathJax.texReset();
		MathJax.typesetClear();
		batchRender($('#carousel div.slide.active').first()[0]);
		updateCarouselSlide();
	});
}

function hideCarousel() {
	if ($('.output.present:visible').first().hasClass('annotate')) {
		hideAnnotate();
	}

	$('#container').removeClass('wide');
	$('.present')
	.removeClass('present')
	.removeClass('overview')
	.addClass($('#left_half')
	.attr('mode'));

	$('.carousel.slide').removeClass('slide');

	$('.output div.slide')
	.removeClass('carousel-item')
	.removeClass('active')
	.removeClass('hidden')
	.addClass('tex2jax_ignore');
	$('.controls').hide();
	$('#output .slide_content').css('padding-bottom', '');
	// $('#output').scrollTo($('.slide.selected'));

	$('.slide.selected')[0].scrollIntoView();
	$('#carousel div.slide').remove();
	$('#carousel').hide();

	$('.separator').css('font-weight', 'normal');
	$('.separator').find('a').css('color', 'pink');

	$('.slide.selected').find('.separator').css('font-weight', 'bold');
	$('.slide.selected').find('.separator').find('a').css('color', 'red');

	MathJax.startup.document.state(0);
	MathJax.texReset();
	MathJax.typesetClear();

	batchRender($('#output div.slide[slide="' + $('#output').attr('data-selected-slide') + '"]').first()[0]);
}

function adjustHeight() {
	let $output = $('#carousel');
	if (!$output.length) {
		 return 0;
	}
	$(`#carousel div.slide[slide="${$('#output').attr('data-selected-slide')}"]`).find('.slide_content').css('padding-bottom', '');
	// $('#carousel div.slide.active > .slide_container > .slide_content').css('padding-bottom', '15em');
	if ($output[0].scrollHeight >  $output.innerHeight() || $output.hasClass('annotate')) {
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
		// $('canvas').closest('div.slide').find('.canvas-controls .disable').click();
		// $('canvas').closest('div.slide').find('.canvas-controls').hide();
		// $('.output:visible').removeClass('annotate');
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

$(function() {
	$('.carousel').on('slid.bs.carousel', function () {
		$('#right_half .slide_number button').text('Slide ' + $('.carousel-item.active').attr('slide'));
		$('#right_half .slide_number button').attr('slide', $('.carousel-item.active').attr('slide'));

		let $slide = $('.output.present:visible div.slide.active').first();
		$slide.addClass('selected');
		let slideNum = parseInt($slide.attr('slide'));

		$('#output .slide.selected').removeClass('selected');
		$('#output div.slide[slide="' + slideNum + '"]').addClass('selected');

		let $slides = $('#output > div.slide');
		$slides.find('a.collapsea').removeAttr('data-bs-toggle');
		$slides.find('.collapse').removeClass('collapse').addClass('hidden_collapse');

		let prevNum = ((slideNum - 2 + $slides.length) % $slides.length) + 1;
		let nextNum = slideNum == $slides.length - 1 ? $slides.length : (slideNum + 1) % $slides.length;

		$('#carousel.present').removeClass('carousel-inner');

		MathJax.startup.promise.then(() => {

			if ($slides.length > 50) {
				$('#carousel .slide').not('.slide[slide="' + slideNum + '"]').remove();

				if ($('#carousel div.slide[slide="' + prevNum + '"]').length == 0) {
					removeTypeset($('#output').find('div.slide[slide="' + prevNum + '"]').first()[0]);
					let $clonePrev = $('#output').find('div.slide[slide="' + prevNum + '"]').first().clone(true, true);
					$('#carousel').prepend($clonePrev);
				}
				if ($('#carousel div.slide[slide="' + nextNum + '"]').length == 0) {
					removeTypeset($('#output').find('div.slide[slide="' + nextNum + '"]').first()[0]);
					let $cloneNext = $('#output').find('div.slide[slide="' + nextNum + '"]').first().clone(true, true);
					$('#carousel').append($cloneNext);
				}
			}

			// $('.carousel').carousel('pause');

			$('#output').attr('data-selected-slide', slideNum);
			updateCarousel(slideNum);
			// updateCarouselSlide();
		});
	});
	$('.carousel').on('shown.bs.collapse', 'div.collapse', function() {
		updateCarouselSlide();
	});
	$('.carousel').on('hidden.bs.collapse', 'div.collapse', function() {
		updateCarouselSlide();
	});

	$('#carousel').scroll(function(event) {
		let element = event.target;
		if(element.scrollHeight - element.scrollTop === element.clientHeight) {
			$('#carousel div.slide.active > .slide_container > .slide_content').css('padding-bottom', '15em');
		}
	});

	$('#carousel')[0].addEventListener('wheel', function(event) {
		let element = $('#carousel')[0];
		if (event.deltaY > 0) {
			if(element.scrollHeight - element.scrollTop === element.clientHeight) {
				$('#carousel div.slide.active > .slide_container > .slide_content').css('padding-bottom', '15em');
			}
		}
	});
});
