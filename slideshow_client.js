function removeTypeset(el) { // i.e. Show LaTeX source

        let jax = MathJax.startup.document.getMathItemsWithin($('#output')[0]);
        showTexFrom(jax);
        // MathJax.typesetClear([el]);
        MathJax.typesetClear();
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
            
    $(slide).find('.latexSource').remove();
}

function showTexSource(showSource, editor) {    
    let $slide = $('#output div.slide.selected').length > 0 ? $('#output div.slide.selected').first() : $('#output div.slide').first();
    
    $slide.attr('contentEditable', showSource);
    $slide.find('.slide_content *, .paragraphs').css('border', '').css('padding', '');
    $slide.find('.paragraphs').css('color', '').css('font-family', '');
    
    if (!showSource) {
        
        MathJax.startup.document.state(0);
        MathJax.texReset();
        // MathJax.typesetClear();
        // renderTexSource($slide[0]);
        
        $('#output div.slide').addClass('tex2jax_ignore');
        if ($('.carousel-item').length > 0) {
            $('#output').css('display', '');            
            $('#output div.slide').css('display', '');
            $('#carousel').css('display', '');
            $('#carousel div.slide.selected').html($slide.html());
            $('#carousel div.slide.selected').addClass('tex2jax_ignore');
            $('#carousel div.slide[slide="' + $slide.attr('slide') + '"]').first().each(function() {            
                renderSlide(this);
            });
        } else {
            renderSlide($slide[0]);
        }
            
        editor.container.style.pointerEvents="auto";
        editor.container.style.opacity = 1; // or use svg filter to make it gray
        editor.renderer.setStyle("disabled", false);
        editor.focus();
        
    } else {
        if ($('.carousel-item').length) {
            $('#output div.slide').hide();
            $('#output div.slide').removeClass('tex2jax_ignore');
            $('#output').show();
            $('#carousel').hide();
            $slide.show();
        }
        $slide.find('.slide_content *:not([wbtag=ignore]):not([wbtag=skip]):not([wbtag=transparent]):not([class=paragraphs])').css('border', '1px solid grey').css('padding', '1px');
        $slide.find('.paragraphs').css('color', 'grey').css('font-family', 'monospace');
        removeTypeset($slide[0]);
        $slide.addClass('edit').addClass('tex2jax_ignore');        
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

        let $preview = $('<span class="latexSource tex2jax_ignore"></span>');
        $preview.html(tex);
        if (jax[i].display) {
            $preview.css('display', 'block');
        }

        jaxNode.parentNode.insertBefore($preview[0], jaxNode);
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

    $(slide).find('a.collapsea').attr('data-bs-toggle', 'collapse');
    $(slide).find('.hidden_collapse').removeClass('hidden_collapse').addClass('collapse');
    
    $(slide).find('img:not([src])').each(function() {
        imagePostprocess(this);
    });
     
    // $(slide).find('iframe:not([src])').not(".webwork").each(function() {
    //     $(this).attr('src', $(this).attr('data-src')).show();
    //     let $iframe = $(this);
    //     $(this).css('background', 'none');
    //     $(this).iFrameResize({checkOrigin:false});
    // });

    renderTexSource(slide);
    $(slide).find('.latexSource').remove();
    if ($(slide).hasClass("tex2jax_ignore")) {
        $(slide).removeClass("tex2jax_ignore");        
        typeset([slide]).then(() => {
            adjustHeight(slide);
        });
    }    
}

function batchRender(slide) {        
    $(slide).nextAll('div.slide.tex2jax_ignore:lt(1)').each(function() {
        renderSlide(this);
    });
    $(slide).prevAll('div.slide.tex2jax_ignore:lt(1)').each(function() {
        renderSlide(this);
    });
    renderSlide(slide);
}

function adjustHeight(slide) {
    // let $output = $('.output.present:visible');
    let $output = $('#carousel');
    if (!$output.length) {
        return 0;
    }
    
    $(slide).find('.slide_content').css('padding-bottom', '');
    if ($output[0].scrollHeight >  $output.innerHeight() || $output.hasClass('annotate')) {
        $output.css('display', 'block');
        $(slide).find('.slide_content').css('padding-bottom', '15em');
    } else {
        $output.css('display', '');
    }
}

function showStep(el) {
    let $parent = $(el).closest('div[wbtag="steps"]');
    let $stepsClass = $parent.find('.steps');

    if (typeof $parent.attr('stepId') == 'undefined' || $parent.attr('stepId') == null) {
        $parent.attr('stepId', 0);
    }
    let whichStep = $parent.attr('stepId');
    
    if (whichStep < $stepsClass.length) {
        $parent.find('#step' + whichStep).css('visibility', 'visible');
        whichStep++;
    }

    if (whichStep >= $stepsClass.length) {
        $parent.find('button.next').attr('disabled', true);
    }

    $parent.find('button.reset').attr('disabled', false);

    $parent.attr('stepId', whichStep);

}
//
//  Enable the step button and disable the reset button.
//  Hide the steps.
//
function resetSteps(el) {
    let $parent = $(el).closest('div[wbtag="steps"]');
    $parent.find('button.next').attr('disabled', false);
    $parent.find('button.reset').attr('disabled', true);
    $parent.find('.steps').css('visibility', 'hidden');
    $parent.attr('stepId', 0);
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

function resizeFont(multiplier) {
    if (document.getElementsByTagName("html")[0].style.fontSize == "") {
        document.getElementsByTagName("html")[0].style.fontSize = "1.0em";
    }
    document.getElementsByTagName("html")[0].style.fontSize = parseFloat(document.getElementsByTagName("html")[0].style.fontSize) + 0.2*(multiplier) + "em";
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



function collapseToggle(slideNum) {

    let $slides = $('.output div.slide[slide="' + slideNum + '"]');
    
    $slides.find('a.collapsea').attr('data-bs-toggle', 'collapse');
    $slides.find('.hidden_collapse').removeClass('hidden_collapse').addClass('collapse');
    
    $slides.each(function() {
        let $slide = $(this);
        if ($slide.hasClass('collapsed')) {
            $slide.removeClass('collapsed');
            $slide.find('.collapse').collapse('show');
            $('#uncollapse_button').text('Collapse');
        } else {
            $slide.addClass('collapsed');
            $slide.find('.collapse').collapse('hide');
            $('#uncollapse_button').text('Uncollapse');
        }
    });
}

function focusOn($item, text) {
    let $slide = $item.closest('div.slide').first();
    let slideNum = $slide.attr('slide');
    if ($slide.hasClass('collapsed')) {
        collapseToggle(slideNum);
    }
    
    if (text!= '') {
        $('.output:visible').scrollTo($item);
        $item.find('*[text=' + text.replace(/[^a-zA-Z0-9\-]/g, '') + ']').addClass('highlighted');
    } else {
        $('.output:visible').scrollTo($item, 150);
    }
    if($('#right_half').hasClass('present')) {
        baseRenderer.then(cranach => {
            showDivs($slide[0], cranach);
        });
    }
}

function jumpToSlide($output, $slide) {
    $output.scrollTo($slide);
    if($('#right_half').hasClass('present')) {
        baseRenderer.then(cranach => {
            showDivs($slide[0], cranach);
        });
    }
}

function highlight(item) {
    $('.item_button').css('background-color', '');
    $('div[item="' + item + '"]').find("button").first().css('background-color', '#ff0');

}
function imagePostprocess(image) {
    
    $(image).removeClass('loading');
    $(image).attr('src', $(image).attr('data-src'));
    $(image).on('load', function() {
        console.log($(image).attr('src'));
        if ($(image).hasClass('exempt') || Math.max($(image).get(0).naturalWidth, $(image).get(0).naturalHeight) < 450) {
            $(image).css('background', 'none');
            $(image).show();
            console.log($(image).attr('src') + ' OK');
            return 1;
        }

        let image_width = $(image).closest('.image').css('width');
        
        $(image).closest('.image').css('height', '');
        $(image).closest('.dual-left').css('height', '');
        $(image).closest('.dual-right').css('height', '');
    
        let override = ($(image).closest('.image').css('width') !== null && typeof $(image).closest('.image').css('width') !== 'undefined' && Number.parseInt($(image).closest('.image').css('width').replace(/px$/, '') < 600))
        // let override = false;
        
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
            // console.log('Adjusting ' + $(image).attr('src') + ' ' + width + ' ' + height);
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
            rect.top <= $(window).height()
        )
        ||
        (
            rect.bottom >= 0  &&
            rect.bottom <= $(window).height()
        )

    );
}
