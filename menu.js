$(function() {
	// https://stackoverflow.com/questions/4305726/hide-div-element-with-jquery-when-mouse-isnt-moving-for-a-period-of-time
	var menu_timer = null;
	$('#right_half').first().each(function() {
		$('#right_half').off();
		$('#right_half').mousemove(function() {
			clearTimeout(menu_timer);
			$(".present .menu_container .navbar-nav, .present .controls, .present .slide_number").not('.hidden').fadeIn();
			$('.present .controls.carousel-indicators').css('display', 'flex');
			menu_timer = setTimeout(function () {
				$(".present .menu_container.fadeout .navbar-nav, .controls, .present .active .slide_number").not('.hidden').fadeOut();
				$(".controls, .present .active .slide_number").not('.hidden').fadeOut();
			}, 1000);
		})
	});
	
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
