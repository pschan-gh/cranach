$(function() {
	$('.carousel').on('slid.bs.carousel', function () {
		$('#right_half .slide_number button').text('Slide ' + $('.carousel-item.active').attr('slide'));
		$('#right_half .slide_number button').attr('slide', $('.carousel-item.active').attr('slide'));
		
		let $slide = $('.output.present:visible div.slide.active').first();
		$slide.addClass('selected');
		let slideNum = parseInt($slide.attr('slide'));
		
		$('#output .slide.selected').removeClass('selected');
		$('#output div.slide[slide="' + slideNum + '"]').addClass('selected');
		
		batchRender($slide[0]);
		adjustHeight($slide[0]);
		updateCanvas($slide[0]);
				
		let $slides = $('#output > .slide');
		
		let prevNum = ((slideNum - 2 + $slides.length) % $slides.length) + 1;
		let nextNum = slideNum + 1 % $slides.length;
		
		$('#carousel.present').removeClass('carousel-inner');
		
		// updateCarousel(parseInt(slideNum));
		if ($slides.length > 50) {
			$('#carousel .slide').removeClass('carousel-item');
			$('#carousel .slide').not('.slide[slide="' + slideNum + '"]').remove();
			if ($('#carousel .slide[slide="' + prevNum + '"]').length == 0) {
				$('#carousel').prepend($('#output .slide[slide="' + prevNum + '"]').first().clone(true));
			}
			if ($('#carousel .slide[slide="' + nextNum + '"]').length == 0) {
				$('#output .slide[slide="' + nextNum + '"]').first().clone(true).appendTo($('#carousel'));;        
			}
		}
		$('#carousel .slide').removeClass('hidden').addClass('carousel-item');            
		updateCarousel(parseInt(slideNum));
		$('.carousel').carousel('pause');
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
