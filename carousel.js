function updateCarousel(slideNum) {

	$('div.tooltip').remove();

	let numOfSlides = $('#carousel div.slide').length;

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
	let nextNum = slideNum + 1 % $slides.length;

	$('#carousel.present').removeClass('carousel-inner');
	$('#carousel .slide').removeClass('carousel-item');

	// let jax = MathJax.startup.document.getMathItemsWithin(document.getElementById('output'));
	// showTexFrom(jax);

	removeTypeset(document.getElementById('output'));
	let clone = document.getElementById('output').cloneNode(true);
	// MathJax.startup.document.state(0);
	// MathJax.texReset();
	// MathJax.typesetClear();
	// updateCollapseAttr(clone, 'carousel');

	$('#carousel div.slide').remove();
	if ($slides.length > 50) {
		$(clone).find('.slide[slide="' + slideNum + '"]').first().appendTo($('#carousel'));
		$('#carousel').prepend($(clone).find('.slide[slide="' + prevNum + '"]').first());
		$(clone).find('.slide[slide="' + nextNum + '"]').first().appendTo($('#carousel'));
	} else {
		$(clone).find('div.slide').appendTo($('#carousel'));
	}

	$('#carousel div.slide')
	.removeClass('hidden')
	.addClass('carousel-item')
	.addClass('tex2jax_ignore');

	$slide = $('#carousel div.slide[slide="' + slideNum + '"]');
	updateCarousel(slideNum);
	$slide.addClass('active');

	// batchRender($slide[0]);

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
	clone.remove();
	$('#output').attr('data-selected-slide', slideNum);
}

function hideCarousel() {
	$('#container').removeClass('wide');
	$('.present')
		.removeClass('present')
		.removeClass('overview')
		.addClass($('#left_half')
		.attr('mode'));

	// if( $('#output').hasClass('annotate') ){
	// 	annotate();
	// }
	// $('#output').removeClass('carousel-inner');
	$('.carousel.slide').removeClass('slide');
	$('.output div.slide')
		.removeClass('carousel-item')
		.removeClass('active')
		.removeClass('hidden')
		.addClass('tex2jax_ignore');
	$('.controls').hide();
	$('#output .slide_content').css('padding-bottom', '');
	// $('#output').scrollTo($('.slide.selected'));

	$('#carousel .slide.selected a.collapsea').each(function() {
		$('#output #' + $(this).attr('aria-controls')).collapse($(this).attr('aria-expanded') == 'true' ? 'show' : 'hide');
	});

	$('.slide.selected')[0].scrollIntoView();
	$('#carousel div.slide').remove();
	$('#carousel').hide();

	$('.separator').css('font-weight', 'normal');
    $('.separator').find('a').css('color', 'pink');

    $('.slide.selected').find('.separator').css('font-weight', 'bold');
	$('.slide.selected').find('.separator').find('a').css('color', 'red');

	// MathJax.startup.document.state(0);
	// MathJax.texReset();
	// MathJax.typesetClear();
}

function duplicateCollapse(carouselSlide, slide) {
	$(carouselSlide).find('a.collapsea').each(function() {
		$(slide).find('a.collapsea[aria-controls="' + $(this).attr('aria-controls').replace(/^carousel-/, '') + '"]')
		.attr('aria-expanded', $(this).attr('aria-expanded'));

		$(slide).find('#' + $(this).attr('aria-controls').replace(/^carousel-/, ''))
		.collapse($(this).attr('aria-expanded') == 'true' ? 'show' : 'hide');
	});
}

function updateCollapseAttr(element, type = 'carousel') {
	if (type == 'carousel') {
		$(element).find('a.collapsea').each(function() {
			if (!$(this).attr('aria-controls').match(/^carousel/)) {
				$(this).attr('aria-controls', 'carousel-' + $(this).attr('aria-controls'));
				$(this).attr('href', '#' + $(this).attr('aria-controls'));
			}
		});
		$(element).find('div.collapse').each(function() {
			if (!$(this).attr('id').match(/^carousel/)) {
				$(this).attr('id', 'carousel-' + $(this).attr('id'));
			}
		});
	} else {
		$(element).find('a.collapsea').each(function() {
			$(this).attr('aria-controls', $(this).attr('aria-controls').replace(/^carousel-/, ''));
			$(this).attr('href', '#' + $(this).attr('aria-controls'));
		});
		$(element).find('div.collapse').each(function() {
			$(this).attr('id', $(this).attr('id').replace(/^carousel-/, ''));
		});
	}
}

function annotate() {

    if ($('.output.present:visible').first().hasClass('annotate')) {
        $('canvas').hide();
        $('canvas').closest('div.slide').find('.canvas-controls .disable').click();
        $('canvas').closest('div.slide').find('.canvas-controls').hide();$('.output:visible').removeClass('annotate')
        $('.output:visible').removeClass('annotate');
    } else {
        $('.output.present:visible').first().addClass('annotate');
        $('.carousel').attr('data-bs-touch', "false");
    }
    let slide = $('.output.present:visible div.slide.active')[0];
    updateCanvas(slide);

}

function updateCanvas(slide) {
    if ($('.output.present:visible').first().hasClass('annotate')) {
        $('.canvas-controls').show();
        if (!$(slide).find('canvas').length) {
            addCanvas(slide);
        }
        $(slide.cfd.canvas).show();
    } else {
        if ($(slide).find('canvas').length) {
            $('.canvas-controls').hide();
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
		let nextNum = slideNum + 1 % $slides.length;

		$('#carousel.present').removeClass('carousel-inner');


		if ($slides.length > 50) {
			removeTypeset(document.getElementById('output'));

			let clone = document.getElementById('output').cloneNode(true);
			$('#carousel .slide').not('.slide[slide="' + slideNum + '"]').remove();
			if ($('#carousel .slide[slide="' + prevNum + '"]').length == 0) {
				$('#carousel').prepend($(clone).find('.slide[slide="' + prevNum + '"]').first());
			}
			if ($('#carousel .slide[slide="' + nextNum + '"]').length == 0) {
				$(clone).find('.slide[slide="' + nextNum + '"]').first().appendTo($('#carousel'));
			}
		}
		// $('#carousel .slide').removeClass('hidden').addClass('carousel-item');

		$('.carousel').carousel('pause');

        // $slide.addClass('tex2jax_ignore');
		$('#output').attr('data-selected-slide', slideNum);
		// updateSlideContent($slide[0]);
        // baseRenderer.then(cranach => {
		// 	updateSlideInfo($slide[0], cranach);
		// 	updateModal(cranach);
		// });
	});
	$('.carousel').on('shown.bs.collapse', 'div.collapse', function() {
		let $slide = $('.output.present:visible div.slide.active');
		adjustHeight($slide[0]);
	});
	$('.carousel').on('hidden.bs.collapse', 'div.collapse', function() {
		let $slide = $('.output.present:visible div.slide.active');
		adjustHeight($slide[0]);
	});
});
