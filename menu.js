function updateSlideSelector() {
	if ($("#slide_sel").length == 0) {
		return 0;
	}
	let numOfSlides = 0;
	try {
		numOfSlides = $('#output div.slide').length;
	} catch(error) {
		return 0;
	}
	$("#slide_sel").html('');
	for (let i = 1; i <= numOfSlides; i++) {
		let o = new Option(i.toString(), i);
		$("#slide_sel").append(o);
	}
	$('#slide_sel').on('change', function() {
		console.log('JUMPING TO SLIDE: ' + $(this).val());
		jumpToSlide($('#output'), $('#s' + $(this).val()));
	});
}

function hide() {
	$('#cover_half').show();
	$('#container').css('height', '50%');
	$('.slide_button').addClass('hide');

}

function unhide() {
	$('#cover_half').hide();
	$('#container').css('position', '');
	$('#container').css('height', '');
	$('.slide_button').removeClass('hide');

}

function dim() {
	if ($('.dim').first().hasClass('dimmed')) {
		$(' #right_half, #right_half *, .output:visible *').css('background-color', '').css('color', '');
		$('#right_half').removeClass('dim');
		$('.dim').first().removeClass('dimmed');
		$('#right_half').addClass('carousel-dark');
	} else {
		$('#right_half, .output:visible').css('background-color', '#222').css('color', '#bbb');
		$('#right_half').addClass('dim');
		$('.dim').first().addClass('dimmed');
		$('#right_half').removeClass('carousel-dark');
	}
}

function resizeFont(multiplier, element = $('.output:visible').first()[0]) {

	if (element.style.fontSize == "") {
		element.style.fontSize = "1.0em";
	}
	element.style.fontSize = parseFloat(element.style.fontSize) + 0.2*(multiplier) + "em";

}

// function print(promise) {
//
//     $('html').css('position', 'relative');
//
//     if($('#right_half').hasClass('overview') || $('#right_half').hasClass('compose') || $('#right_half').hasClass('info') ) {
//         $('#print_content').html('');
//         $('#print_content').append($('#output').clone());
//         promise.then(el => {
//             $('#print_content').find('.slide.tex2jax_ignore').each(function() {
//                 $(this).removeClass('tex2jax_ignore');
//             });
//             MathJax.typesetPromise().then(el => {
//                 $('#print_content').find('.steps').css('visibility', 'visible');
//             });
//         });
//     } else if($('#right_half').hasClass('present')){
//         $('.title_box').first().clone().appendTo($('#print_content'));
//         $('#print_content').find('.title_box').css('font-size', '0.5em');
//         $('#print_content').find('.title_box').css('padding-bottom', '1em');
//         $('#print_content').find('.title_box').find('h3').css('color', '#888');
//         $('#print_content').append($('.output:visible div.slide.selected').html());
//     }
//
//     $('#print').show();
//
//     $('#container').hide();
//
//     $('#print_content').removeClass('text');
//     $('#print_content').addClass('output_dual');
//     $('#print_content').find('.slide').css('display', 'block');
//     $('#print_content').find('.slide').css('height', 'auto');
//     $('#print_content').find('img:not([src])').each(function() {
//         imagePostprocess(this);
//     });
//     $('#print_content').find('.slide').show();
//
//     $('#print_content').find('.statement').after('<hr/>');
//     $('#print_content').find('.substatement').after('<hr/>');
//
//     $('#print_content').find('.separator').html(".&nbsp&nbsp&nbsp&nbsp.&nbsp&nbsp&nbsp&nbsp.&nbsp&nbsp&nbsp&nbsp.");
//     $('#print_content').find('blockquote').each(function() {
//         $(this).after($(this).html());
//         $(this).remove();
//     });
//     $('#print_content').find('.collapsea').hide();
//     $('#print_content').find('.collapse').show();
//     $('#print_content').find('.hidden_collapse').show();
// }

$(function() {
	let menuObserver = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type == "attributes") {
				if ( mutation.attributeName == 'data-content-url' ) {
					updateSlideSelector();
				}
			}
		});
	});

	menuObserver.observe(document.getElementById('output'), {
		attributes: true,
	});

	// https://stackoverflow.com/questions/4305726/hide-div-element-with-jquery-when-mouse-isnt-moving-for-a-period-of-time
	// let menu_timer = null;
	// $('#right_half').first().each(function() {
	// 	$('#right_half').off();
	// 	$('#right_half').mousemove(function() {
	// 		clearTimeout(menu_timer);
	// 		$(".present .menu_container .navbar-nav, .present .controls, .present .slide_number").not('.hidden').fadeIn();
	// 		$('.present .controls.carousel-indicators').css('display', 'flex');
	// 		menu_timer = setTimeout(function () {
	// 			$(".present .menu_container.fadeout .navbar-nav, .controls, .present .active .slide_number").not('.hidden').fadeOut();
	// 			$(".controls, .present .active .slide_number").not('.hidden').fadeOut();
	// 		}, 1000);
	// 	})
	// });

	$('.present #menu_container').first().each(function() {
		$(this).find(".navbar-nav, .present .slide_number").not('.hidden').off();
		$(this).find(".navbar-nav, .present .slide_number").not('.hidden').mouseover(function() {
			$('#right_half').off('mousemove');
			clearTimeout(menu_timer);
			$(this).show();
		});
		$(this).find(".navbar-nav, .present .slide_number").not('.hidden').mouseout(function() {
			clearTimeout(menu_timer);
			$('#right_half').off('mousemove');
			$('#right_half').mousemove(function() {
				clearTimeout(menu_timer);
				$(".present .menu_container .navbar-nav, .present .controls, .present .slide_number").not('.hidden').fadeIn();
				$('.present .controls.carousel-indicators').css('display', 'flex');
				menu_timer = setTimeout(function () {
					$(".present .menu_container.fadeout .navbar-nav, .present .slide_number").not('.hidden').fadeOut();
					$(".controls").hide();
				}, 1000);
			})
		});
	});

	$('.controls').off();
	$('.controls').on('mouseover', function() {
		$('#right_half').off('mousemove');
		clearTimeout(menu_timer);
		$(this).show();
	});
	$('.controls').on('mouseout', function() {
		clearTimeout(menu_timer);
		$('#right_half').off('mousemove');
		$('#right_half').mousemove(function() {
			clearTimeout(menu_timer);
			$(".present .menu_container .navbar-nav, .present .controls, .present .slide_number").not('.hidden').fadeIn();
			$('.present .controls.carousel-indicators').css('display', 'flex');
			menu_timer = setTimeout(function () {
				$(".present .menu_container.fadeout .navbar-nav, .present .slide_number").fadeOut();
				$(".controls").hide();
			}, 1000);
		})
	});

	$('input.lecture_mode').change(function() {
		if (this.checked) {
			$('[data-lecture-skip="true"]').addClass('lecture_skip');
		} else {
			$('[data-lecture-skip="true"]').removeClass('lecture_skip');
		}
	});

	$('#latex_icon').click(function() {
		$('#text_modal').modal('toggle');
		baseRenderer.then(cranach => {
			showLatex(cranach);
		});
	});
	$('#beamer_icon').click(function() {
		$('#text_modal').modal('toggle');
		baseRenderer.then(cranach => {
			showLatex(cranach, 'beamer');
		});
	});
	$('#xml_icon').click(function() {
		baseRenderer.then(cranach => {
			$('#text_modal').modal('toggle');
			showXML(cranach);
		});
	});

	$('#xmlInput').change(function() {
		baseRenderer = openXML(baseRenderer, this);
	});

});
