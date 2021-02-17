function renderSlide(slide) {

    $(slide).find('img:not([src])').each(function() {
        imagePostprocess(this);
    });

    $(slide).find('iframe:not([src])').not(".webwork").each(function() {
        $(this).attr('src', $(this).attr('data-src')).show();
        var $iframe = $(this);
        $(this).css('background', 'none');
        $(this).iFrameResize({checkOrigin:false});
    });

    if ($(slide).hasClass("tex2jax_ignore")) {
        $(slide).removeClass("tex2jax_ignore");
        // MathJax.typesetPromise([slide]);
        typeset([slide]);
    }
}


function batchRender(slide) {
    renderSlide(slide);
    $(slide).nextAll('.slide.tex2jax_ignore:lt(1)').each(function() {
        renderSlide(this);
    });
    $(slide).prevAll('.slide.tex2jax_ignore:lt(1)').each(function() {
        renderSlide(this);
    });
}


function showStep(el) {
    var $parent = $(el).closest('div[wbtag="steps"]');
    var $stepsClass = $parent.find('.steps');

    if (typeof $parent.attr('stepId') == typeof undefined || $parent.attr('stepId') == null) {
        $parent.attr('stepId', 0);
    }
    var whichStep = $parent.attr('stepId');
    console.log('STEP: ' + whichStep + ', class LENGTH: ' + $stepsClass.length);

    if (whichStep < $stepsClass.length) {
        // stepsClass[whichStep].style.visibility = "visible";
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
    $parent = $(el).closest('div[wbtag="steps"]');
    $parent.find('button.next').attr('disabled', false);
    $parent.find('button.reset').attr('disabled', true);
    // $('.' + stepsId).css('visibility', 'hidden');
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
        $(' #right_half, #right_half *, #output *').css('background-color', '').css('color', '');
        $('#right_half').removeClass('dim');
        // $('#progress_container').removeClass('dim');
        $('.dim').first().removeClass('dimmed');
    } else {
        $('#right_half, #output').css('background-color', '#222').css('color', '#bbb');
        $('#right_half').addClass('dim');
        // $('#progress_container').addClass('dim');
        $('.dim').first().addClass('dimmed');
    }
}

function resizeFont(multiplier) {
    if (document.getElementById("output").style.fontSize == "") {
        document.getElementById("output").style.fontSize = "1.0em";
    }
    document.getElementById("output").style.fontSize = parseFloat(document.getElementById("output").style.fontSize) + 0.2*(multiplier) + "em";
}

function updateCarousel(slide) {

    var numOfSlides = $('#output div.slide').length;
    
    $(".carousel-indicators").html('');
    for (let i = 0; i < numOfSlides; i++) {
        $(".carousel-indicators").append('<button type="button" data-bs-target="#right_half" data-bs-slide-to="' + i + '" aria-label="Slide ' + (i + 1) + '" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Slide ' + (i + 1) + '">');
    }
    $(".carousel-indicators button").tooltip({'delay': { show: 0, hide: 0 }});
    
    $('.carousel-indicators button[data-bs-slide-to="' + (slide - 1) + '"]').addClass('active').attr('aria-current', "true");
    
}

function showDivs(n, cranach) {

    $('#right_half').addClass('slide');
    $('#output').addClass('carousel-inner');
    $('#output div.slide').addClass('carousel-item');
    // $('div.progress_container').addClass('carousel-indicators');
    // $('.controls_container').show();
    // $('div.progress').show();
    
    updateCarousel(n);
    
    var $slides = $('#output > .slide');

    if ($slides.length == null || $slides.length == null < 1) {
        return 0;
    }

    let index = (parseInt(n) + $slides.length) % $slides.length;
    index = index == 0 ? $slides.length : index;

    var $slide = $('#s' + index);
    
    $slide.addClass('active');

    $('.carousel').carousel('pause');
    $('#right_half .slide_number button').text('Slide ' + index);
    $('#right_half .slide_number button').attr('slide', index);
}


function print(promise) {

    $('html').css('position', 'relative');

    if($('#right_half').hasClass('overview') || $('#right_half').hasClass('compose') || $('#right_half').hasClass('info') ) {
        $('#print_content').html('');
        $('#print_content').append($('#output').clone());
        promise.then(el => {
            $('#print_content').find('.slide.tex2jax_ignore').each(function() {
                $(this).removeClass('tex2jax_ignore');
            });
            MathJax.typesetPromise().then(el => {
                $('#print_content').find('.steps').css('visibility', 'visible');
            });
        });
    } else if($('#right_half').hasClass('present')){
        $('.title_box').first().clone().appendTo($('#print_content'));
        $('#print_content').find('.title_box').css('font-size', '0.5em');
        $('#print_content').find('.title_box').css('padding-bottom', '1em');
        $('#print_content').find('.title_box').find('h3').css('color', '#888');
        $('#print_content').append($('#s' + slideIndex).html());
    }

    $('#print').show();

    $('#container').hide();

    $('#print_content').removeClass('text');
    $('#print_content').addClass('output_dual');
    $('#print_content').find('.slide').css('display', 'block');
    $('#print_content').find('.slide').css('height', 'auto');
    $('#print_content').find('img:not([src])').each(function() {
        imagePostprocess(this);
    });
    $('#print_content').find('.slide').show();

    $('#print_content').find('.statement').after('<hr/>');
    $('#print_content').find('.substatement').after('<hr/>');

    $('#print_content').find('.separator').html(".&nbsp&nbsp&nbsp&nbsp.&nbsp&nbsp&nbsp&nbsp.&nbsp&nbsp&nbsp&nbsp.");
    $('#print_content').find('blockquote').each(function() {
        $(this).after($(this).html());
        $(this).remove();
    });
    $('#print_content').find('.collapsea').hide();
    $('#print_content').find('.collapse').show();

}

function removeTypeset() { // i.e. Show LaTeX source

        console.log('removeTypset called ' + slideIndex);
        // var jax = MathJax.getAllJax('s' + slideIndex);
        var jax = MathJax.getAllJax();
        showTexFrom(jax);
        MathJax.typesetClear();
}

function showTexSource(showSource, editor) {
    $('#output').attr('contentEditable', showSource);
    $('.slide_content *, .paragraphs').css('border', '').css('padding', '');
    $('.paragraphs').css('color', '').css('font-family', '');
    if (!showSource) {
        MathJax.startup.document.state(0);
        MathJax.texReset();

        var oldElems = document.getElementById('output').getElementsByClassName("latexSource");
        // var oldElems = document.getElementById('s' + slideIndex).getElementsByClassName("latexSource");

        for(var i = oldElems.length - 1; i >= 0; i--) {
            var oldElem = oldElems.item(i);
            var parentElem = oldElem.parentNode;
            var innerElem;

            var textNode = document.createTextNode(oldElem.textContent);
            parentElem.insertBefore(textNode, oldElem);
        }

        $('.latexSource').remove();

        MathJax.startup.promise.then(() => {
            $('.slide').addClass('tex2jax_ignore');
            $('.slide').removeClass('edit');
            renderSlide($('#s' + slideIndex)[0]);
        });
        editor.container.style.pointerEvents="auto";
        editor.container.style.opacity = 1; // or use svg filter to make it gray
        editor.renderer.setStyle("disabled", false);
        editor.focus();
    } else {
        $('.slide[slide="' + slideIndex + '"]').find('.slide_content *:not([wbtag=ignore]):not([wbtag=skip]):not([wbtag=transparent]):not([class=paragraphs])').css('border', '1px solid grey').css('padding', '1px');
        $('.slide[slide="' + slideIndex + '"]').find('.paragraphs').css('color', 'grey').css('font-family', 'monospace');
        removeTypeset();
        $('.slide[slide="' + slideIndex + '"]').addClass('edit');
        editor.container.style.pointerEvents="none";
        editor.container.style.opacity=0.5; // or use svg filter to make it gray
        editor.renderer.setStyle("disabled", true);
        editor.blur();
    }

}

function showXML(docCranach) {
    $('#source_text').val('');
    $('#source_text').val(new XMLSerializer().serializeToString(docCranach));
    $('#wb_modal').find('button.save').attr('ext', 'xml');
    $('#wb_modal').find('.modal-title').html('Cranach XML');

}

function showTexFrom(jax) {
    for (var i = jax.length - 1, m = -1; i > m; i--) {
        var jaxNode = jax[i].start.node, tex = jax[i].math;

        if (jax[i].display) {
            if (!tex.match(/^\s*\\(begin{equation|(begin{align(\*)?})|begin{multline|begin{eqnarray)/)) {
            // if (!tex.match(/^\s*\\begin(?!{split)/))  {
                tex = "\\["+tex+"\\]";
            }
        } else {tex = "$"+tex+"$"}

        var $preview = $('<span class="latexSource tex2jax_ignore"></span>');
        $preview.html(tex);
        if (jax[i].display) {
            $preview.css('display', 'block');
        }

        jaxNode.parentNode.insertBefore($preview[0], jaxNode);
        jaxNode.remove();
    }
}

function showJaxSource(outputId) {

    var jax = MathJax.getAllJax(outputId);

    showTexFrom(jax);

    MathJax.typesetClear();

    var clone = document.getElementById(outputId).cloneNode(true);

    var oldElems = clone.getElementsByClassName("latexSource");

    for(var i = oldElems.length - 1; i >= 0; i--) {
        var oldElem = oldElems.item(i);
        var parentElem = oldElem.parentNode;
        var innerElem;

        while (innerElem = oldElem.firstChild)
        {
            // insert all our children before ourselves.
            parentElem.insertBefore(innerElem, oldElem);
        }
        parentElem.removeChild(oldElem);
    }

    var editedContent = clone.innerHTML;

    var body = new DOMParser().parseFromString(editedContent, 'text/html');

    var bodyString = new XMLSerializer().serializeToString(body);
    var body = new DOMParser().parseFromString(bodyString, "application/xml");
    return body;
}

function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}

function collapseToggle(slideIndex) {

    var $slide = $('#s' + slideIndex);

    if ($slide.hasClass('collapsed')) {
        $slide.removeClass('collapsed');
        $slide.find('.collapse').addClass('show');        
        $slide.find('a.collapsea').attr('aria-expanded', 'true');
        $('#uncollapse_button').text('Collapse');
    } else {
        $slide.find('.collapse').removeClass('show');
        $slide.addClass('collapsed');
        $slide.find('a.collapsea').attr('aria-expanded', 'false');
        $('#uncollapse_button').text('Uncollapse');
    }
}

function focusOn($item, text) {
    let $slide = $item.closest('div.slide').first();
    let slideNum = $slide.attr('slide');
    if ($slide.hasClass('collapsed')) {
        collapseToggle(slideNum);
    }
    // $slide.click();

    if (text!= '') {
        $('#output').scrollTo($item);
        $item.find('*[text=' + text.replace(/[^a-zA-Z0-9\-]/g, '') + ']').addClass('highlighted');
    } else {
        $('#output').scrollTo($item, 150);
    }
    if($('#right_half').hasClass('present')) {
        baseRenderer.then(cranach => {
            showDivs(slideNum, cranach);
        });
    }
}

function jumpToSlide($output, $slide) {
    $output.scrollTo($slide);
    if($('#right_half').hasClass('present')) {
        baseRenderer.then(cranach => {
            showDivs($slide.attr('slide'), cranach);
        });
    }
}

function highlight(item) {
    $('.item_button').css('background-color', '');
    $('div[item="' + item + '"]').find("button").first().css('background-color', '#ff0');

}
function imagePostprocess(image) {

    if ($(image).hasClass('exempt')) {
        $(image).attr('src', $(image).attr('data-src'));
        return 1;
    }

    $(image).attr('src', $(image).attr('data-src'));

    var image_width = $(image).closest('.image').css('width');

    $(image).closest('.image').css('height', '');
    $(image).closest('.dual-left').css('height', '');
    $(image).closest('.dual-right').css('height', '');

    var override = !((typeof $(image).closest('.image').css('width') === typeof undefined)|| ($(image).closest('.image').css('width') === false) || ($(image).closest('.image').css('width') === '0px') || (image_width == '600px'));

    if ($(image).hasClass('exempt')) {
        override = true;
    }

    if(/svg/.test($(image).attr('src'))) {
        if (($(image).closest('.dual-left').length > 0) || ($(image).closest('.dual-right').length > 0)) {
            var width = 300;
            var height = 300;
            $(image).attr('width', width);
        } else if (!override) {
            var width = 450;
            var height = 450;
            $(image).closest('.image').css('width', '450');
            $(image).attr('width', width);
        } else {
            $(image).css('width', '100%');
        }
    } else if (!override) {
        $(image).removeAttr('style');
        $(image).removeAttr('width');
        $(image).removeAttr('height');
        var width = $(image).get(0).naturalWidth;
        var height = $(image).get(0).naturalHeight;

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
                    if((typeof $(image).closest('.image').css('width') === typeof undefined)|| ($(image).closest('.image').css('width') === false) || ($(image).closest('.image').css('width') === '0px') || (image_width == '600px')){
                        $(image).css('height', '560px');
                        $(image).css('width', 'auto');
                    } else {
                        $(image).css('height', 'auto');
                        $(image).css('max-width', '100%');
                    }
                }
            } else {
                if((typeof $(image).closest('.image').css('width') === typeof undefined)|| ($(image).closest('.image').css('width') === false) || ($(image).closest('.image').css('width') === '0px')) {
                    $(image).css('max-width', '100%');
                    $(image).css('height', 'auto');
                } else {
                    $(image).css('max-width', '100%');
                    $(image).css('height', 'auto');
                }
            }
        }
    } else {
        if ($(image).css('width') == '' || typeof $(image).css('width') === typeof undefined || $(image).css('width') === false) {
            $(image).css('width', '100%');
        }
    }

    $(image).css('background', 'none');
    $(image).show();

}

function updateTitle(slide) {

    var index = $(slide).attr('slide');

    var course = $(slide).attr('course') ? $(slide).attr('course') : '';
    var chapterType = $(slide).attr('chapter_type') ? $(slide).attr('chapter_type'):'';
    var chapter = $(slide).attr('chapter') ? $(slide).attr('chapter') : '';
    var section = $(slide).attr('section') ? $(slide).attr('section') : '';
    var subsection = $(slide).attr('subsection') ? $(slide).attr('subsection') : '';
    var subsubsection = $(slide).attr('subsubsection') ? $(slide).attr('subsubsection') : '';

    var topics = '';

    $('#toc a').removeClass('highlighted');
    $('#toc a.chapter[chapter="' + chapter + '"]').addClass('highlighted');
    $('#toc a.section[chapter="' + chapter + '"][section="' + section + '"]').addClass('highlighted');
    $('#toc a.subsection[chapter="' + chapter + '"][section="' + section + '"][subsection="' + subsection + '"]').addClass('highlighted');
    $('#toc a.subsubsection[chapter="' + chapter + '"][section="' + section + '"][subsection="' + subsection + '"][subsubsection="' + subsubsection + '"]').addClass('highlighted');

    $('.topic[chapter="' + chapter + '"]').each(function(index, element) {
        if (index > 0) {
            topics += ', ';
        }
        topics += $(this).html();
    });

    var chapterTitle = $(slide).attr('chapter_title') ? $(slide).attr('chapter_title') : $(slide).prevAll('[chapter_title!=""]:first').attr('chapter_title');

    chapterTitle = chapterTitle ? chapterTitle : '';

    var section = $(slide).attr('section') ?  chapter + '.' + $(slide).attr('section') : '';

    var sectionTitle = $('a.section.highlighted').find('span.title').html();

    sectionTitle = sectionTitle ? sectionTitle : '';

    $('.current_course').html(course);
    $('.current_chapter').html(chapterType + ' ' + chapter);
    $('.current_chapter_title').html(chapterTitle);
    $('.current_topics').html(topics);

    if (section != '') {
        $('.current_section').html('Section ' + section + '<br/>' + sectionTitle);
    } else {
        $('.current_section').html('');
    }
    $('.current_slide').html('Slide ' + index);
    if (course != '' || chapter != '' || topics != '') {
        $('title').text(course);
    }

    $('#info_half div.keywords[environ="course"], div.keywords[environ="root"]').show();
    $('#info_half div.keywords[environ="chapter"][chapter="' + chapter + '"][slide="all"]').show();

    $('#info_half div.keywords[slide!="all"]').hide();
    $('#info_half div.keywords[chapter="' + chapter + '"][slide="' + index + '"]').show();
    // typeset([document.getElementById('left_half')]);

}

// https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
function isElementInViewport (el) {

    var rect = el.getBoundingClientRect();

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

function updateSlideProgress(index, refresh) {
    if (refresh) {
        $('#slide_progress tbody tr').html('');
        var numSlides = document.getElementsByClassName('slide').length;
        var spacing = Math.min(3, 5*20/numSlides);
        for (var i = 0; i < numSlides; i++) {
            $('#slide_progress tbody tr').append('<td num="' + (+i + 1) + '" style="border-left-width:' + spacing + 'px; border-right-width: ' + spacing + 'px;"></td>');
        }
    }
    $('#slide_progress td').each(function() {
        // $(this).css('background-color', $(this).attr('num') <= slideIndex ? '#ccc' : '#eee');
        if ($(this).attr('num') <= index) {
            $(this).removeClass('future').addClass('past');
        } else {
            $(this).removeClass('past').addClass('future');
        }
    });
}

function updateModalRefby(md5String, cranach) {
    var contentURLDir = cranach.attr['contentURLDir'];
    var contentURL = cranach.attr['contentURL'];
    console.log('CONTENTURL ' + contentURL);
    $.ajax({
        url:  cranach.attr['dir'] + '/' + cranach.attr['index'],
        dataType: "xml"
    })
    .done(function(index) {
        $.ajax({
            url: 'xsl/refby2html.xsl'
        })
        .done(function(xsl) {
            var xsltProcessor = new XSLTProcessor();
            xsltProcessor.importStylesheet(xsl);
            xsltProcessor.setParameter('', 'md5', md5String);
            xsltProcessor.setParameter('', 'contenturldir', contentURLDir);
            xsltProcessor.setParameter('', 'contenturl', contentURL);
            console.log('REFBY2HTML PRETRANSFORM');
            fragment = xsltProcessor.transformToFragment(index,document);
            console.log('REFBY2HTML');
            fragmentStr = new XMLSerializer().serializeToString(fragment);
            console.log(fragmentStr);
            $('.modal_refby').html(fragmentStr).show();
        })
    })
    .fail(function() {
        console.log("INDEX FILE DOESN'T EXIST");
        return 0;
    });
}

function updateModalProofs(md5String, cranach) {
    var contentURLDir = cranach.attr['contentURLDir'];
    $.ajax({
        url:  cranach.attr['dir'] + '/' + cranach.attr['index'],
        dataType: "xml"
    })
    .done(function(index) {
        var queryString = '//idx:branch[@type="Proof"][@ofmd5="' + md5String + '"]';
        console.log(queryString);
        var iterator = index.evaluate(queryString, index, nsResolver, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null );
        console.log(iterator);
        try {
            var thisNode = iterator.iterateNext();

            var html = '';
            var index = 1;
            while (thisNode) {
                if (html != '') {
                    html += ', ';
                }
                html += '<a target="_blank" href="' + contentURLDir + '/' + thisNode.getAttribute('filename') + '&item=' + thisNode.getAttribute('md5') + '">' + index + '</a>';
                index++;
                thisNode = iterator.iterateNext();
            }
            if (html != '') {
                $('.modal_proofs').html('<br/><strong>Proofs</strong>: ' + html).show();
            } else {
                $('.modal_proofs').html(html).hide();
            }
        }
        catch (e) {
            alert( 'Error: Document tree modified during iteration ' + e );
        }
    })
    .fail(function() {
        console.log("INDEX FILE DOESN'T EXIST");
        return 0;
    });
}
