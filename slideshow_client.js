function renderSlide(slide) {
    if ($(slide).hasClass("tex2jax_ignore")) {
        $(slide).removeClass("tex2jax_ignore");

        if (cranach.macros) {
            MathJax.Hub.Queue(
                ["Typeset", MathJax.Hub,cranach.macros],
                ["PreProcess", MathJax.Hub, slide],
                ["Reprocess", MathJax.Hub, slide],
                ["Typeset", MathJax.Hub, slide]
            );
        } else {
            MathJax.Hub.Queue(
                ["PreProcess", MathJax.Hub, slide],
                ["Reprocess", MathJax.Hub, slide],
                ["Typeset", MathJax.Hub, slide]
            );
        }
    }

    // MathJax.Hub.Queue(["Typeset",MathJax.Hub,slide]);
    $(slide).find('img[rendered="0"]').each(function() {
        imagePostprocess(this);
        $(this).attr('rendered', 1);
    });
    $(slide).find('iframe').each(function() {
        $(this).attr('src', $(this).attr('data-src')).show();
        var $iframe = $(this);
        $(this).iFrameResize({checkOrigin:false});
    });

    $(slide).find('img.loading_icon').hide();
}

var whichSteps = {};
function showStep(stepsId) {
    var stepsClass = document.getElementsByClassName(stepsId);

    if (whichSteps[stepsId] == null) {
        whichSteps[stepsId] = 0;
    }
    var whichStep = whichSteps[stepsId];
    // var step = stepsId + '.' + whichStep;
    console.log('STEP: ' + whichStep + ', class LENGTH: ' + stepsClass.length);
    if (whichStep < stepsClass.length/2) {
        stepsClass[whichStep].style.visibility = "visible";
        whichStep++;
    }

    if (!stepsClass[whichStep]) {
        document.getElementById("next"+stepsId).disabled = true;
    }
    document.getElementById("reset"+stepsId).disabled = false;
    whichSteps[stepsId] = whichStep;

}
//
//  Enable the step button and disable the reset button.
//  Hide the steps.
//
function resetSteps(stepsId) {
    document.getElementById("next"+stepsId).disabled = false;
    document.getElementById("reset"+stepsId).disabled = true;
    var i = 0;
    var step;
    $('.' + stepsId).css('visibility', 'hidden');
    whichSteps[stepsId] = 0;
}
function hide(pressed) {
    element = document.getElementById('cover_half');
    element.style.display="block";

    if(pressed) {
        $('#container').css('height', '50%');
        $('.slide_button').addClass('hide');
    } else {
        $('.slide_container').css('position', '');
        unhide();
    }

}

function unhide() {
    element = document.getElementById('cover_half');
    element.style.display="none";
    document.getElementById('output').style.height="100%";
    document.getElementById('unhide').style.display="none";

    $('#container').css('position', '');
    $('#container').css('height', '');
    $('.slide_button').removeClass('hide');

}

function dim() {
    document.body.style.background = "#000";
    var i;
    var x = document.getElementsByClassName("page");
    x[0].style.background="#000";
    var x = document.getElementById("text");
    x.style.background="#000";
    x.style.color="#999";
}

function resizeFont(multiplier) {
    if (document.getElementById("output").style.fontSize == "") {
        document.getElementById("output").style.fontSize = "1.0em";
    }
    document.getElementById("output").style.fontSize = parseFloat(document.getElementById("output").style.fontSize) + 0.2*(multiplier) + "em";
}

function plusDivs(n) {

    if(editMode) {
        $('#edit_button').click();
    }

    slideIndex = parseInt(slideIndex) + parseInt(n);

    if (n > 0) {
        $("#output").animate({marginLeft:"-100%"}, 150, "linear", function() {$("#output").css({marginLeft: ''});showDivs(slideIndex);});
    } else {
        $("#output").animate({marginLeft:"100%"}, 150, "linear", function() {$("#output").css({marginLeft: ''});showDivs(slideIndex);});
    }

}

function showDivs(n) {

    $('.slide_mask').hide();

    var i;
    var x = document.getElementsByClassName("slide");

    if(x == null) {
        return 0;
    }

    slideIndex = (parseInt(n) + x.length) % x.length;
    slideIndex = slideIndex == 0 ? x.length : slideIndex;

    var $slide = $('#s'+slideIndex);
    updateTitle($slide[0]);

    if ($slide.hasClass('all')) {
        $('#s'+slideIndex+' .collapse').collapse('hide');
        $slide.addClass('collapsed');
        $slide.removeClass('all');
    }

    if ($('#s' + slideIndex).hasClass('collapsed')) {
        $('#uncollapse_button').text('Uncollapse');
    } else {
        $('#uncollapse_button').text('Collapse');
    }

    $('.slide').hide();

    var $slide = $('#s' + slideIndex);
    if ($slide != null) {

        $slide.css('display', "table-cell");
        $slide.css('vertical-align', "middle");

        console.log('RENDER SLIDE: ' + slideIndex);
        renderSlide($slide[0]);
        renderSlide($slide.prev('.slide')[0]);
        renderSlide($slide.next('.slide')[0]);
    }

    updateSlideProgress(slideIndex, false);
}

function print() {

    $('html').css('position', 'relative');

    if(mode == 'dual' || mode == 'compose') {
        $('#print_content').html($('#output').html());
        $('#print_content').find('.slide.tex2jax_ignore').each(function() {
            renderSlide(this);
        });
    } else if(mode == 'present'){
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

    $('#print_content').find('.steps').css('visibility', 'visible');

}

function collapseToggle(slideIndex) {

    var $slide = $('#s' + slideIndex);

    if ($slide.hasClass('collapsed')) {
        $('#s'+slideIndex+' .collapsea').each(function () {
            if($(this).hasClass('collapsed')) {
                $(this).click();
            }
        });
        $slide.removeClass('collapsed');
        $('#uncollapse_button').text('Collapse');
    } else {
        $('#s'+slideIndex+' .collapsea').each(function () {
            if(!$(this).hasClass('collapsed'))
            $(this).click();
        });
        $slide.addClass('collapsed');
        $('#uncollapse_button').text('Uncollapse');
    }
}

function removeTypeset() { // i.e. Show LaTeX source

    console.log('removeTypset called ' + slideIndex);
    var HTML = MathJax.HTML;

    // if(!showall) {
    //     var jax = MathJax.Hub.getAllJax('s' + slideIndex);
    // } else {
    //     var jax = MathJax.Hub.getAllJax();
    // }
    var jax = MathJax.Hub.getAllJax('s' + slideIndex);

    for (var i = jax.length - 1, m = -1; i > m; i--) {
        var script = jax[i].SourceElement(), tex = jax[i].originalText;
        var display = 0;

        if (script.type.match(/display/)) {
            display = 1;
            if (!tex.match(/begin{equation}|begin{align}|begin{multline}/))
            tex = "\\["+tex+"\\]";
        } else {tex = "$"+tex+"$"}

        if (typeof jax[i] != typeof undefined) {
            try {
                jax[i].Remove();
            } catch(err) {
                console.log(err);
            }
        }
        var preview = script.previousSibling;
        if (preview && preview.className === "MathJax_Preview") {
            preview.parentNode.removeChild(preview);
        }

        preview = HTML.Element("span",{className:"latexSource"},[tex]);
        if (display == 1) {
            preview.style.display = "block";
        }
        script.parentNode.insertBefore(preview,script);
        script.parentNode.removeChild(script);
    }

    // document.getElementById('source_button').disabled = false;

}

function showTexSource(show) {
    var oldElems = document.getElementById('output').getElementsByClassName("latexSource");


    for(var i = oldElems.length - 1; i >= 0; i--) {
        var oldElem = oldElems.item(i);
        var parentElem = oldElem.parentNode;
        var innerElem;

        while (innerElem = oldElem.firstChild)
        {
            parentElem.insertBefore(innerElem, oldElem);
        }
        parentElem.removeChild(oldElem);
    }


    if (!show) {
        MathJax.Hub.Queue(
            ["PreProcess", MathJax.Hub, document.getElementById('s' + slideIndex)],
            function () {
                if (MathJax.InputJax.TeX.resetEquationNumbers) {
                    MathJax.InputJax.TeX.resetEquationNumbers();
                }
            },
            // ["resetEquationNumbers", MathJax.InputJax.TeX],
            ["Typeset", MathJax.Hub, document.getElementById('s' + slideIndex)],
        );
        editor.container.style.pointerEvents="auto";
        editor.container.style.opacity=1; // or use svg filter to make it gray
        editor.renderer.setStyle("disabled", false);
        editor.focus();
    } else {
        removeTypeset();
        editor.container.style.pointerEvents="none";
        editor.container.style.opacity=0.5; // or use svg filter to make it gray
        editor.renderer.setStyle("disabled", true);
        editor.blur();
    }

    document.getElementById('output').contentEditable = show;
    // document.getElementById('edit_button').className = show ? 'btn btn-danger btn-sm menu_button' : 'btn btn-outline-info btn-sm menu_button';

}

function showXML(docCranach) {
    $('#source_text').val('');
    $('#source_text').val(new XMLSerializer().serializeToString(docCranach));
    $('#wb_modal').find('button.save').attr('ext', 'xml');
    $('#wb_modal').find('.modal-title').html('Cranach XML');

}

function showJaxSource(elementId) {
    var jax = MathJax.Hub.getAllJax(elementId);

    for (var m = -1, i = jax.length - 1; i > m; i--) {
        var script = jax[i].SourceElement(), tex = jax[i].originalText;
        var display = 0;

        if (script.type.match(/display/)) {
            display = 1;
            if (!tex.match(/begin{equation}/))
            tex = "\\["+tex+"\\]";
        } else {tex = "$"+tex+"$"}

        if (typeof jax[i] != typeof undefined) {
            try {
                jax[i].Remove();
            } catch(err) {
                console.log(err);
            }
        }
        var preview = script.previousSibling;
        if (preview && preview.className === "MathJax_Preview") {
            preview.parentNode.removeChild(preview);
        }

        preview = MathJax.HTML.Element("span",{className:"latexSource"},[tex]);
        if (display == 1) {
            preview.style.display = "block";
        }
        script.parentNode.insertBefore(preview,script);
        script.parentNode.removeChild(script);
    }

    var theContent = document.getElementById('output');

    var clone = theContent.cloneNode(true);

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
    // var body = new DOMParser().parseFromString(editedContent, 'application/xml');


    var bodyString = new XMLSerializer().serializeToString(body);
    var body = new DOMParser().parseFromString(bodyString, "application/xml");

    // console.log("SOURCE NODE: ");
    // console.log(body);
    return body;
}

function commitWb() {
    var body = showJaxSource('output');
    $.ajax({
        url: 'xsl/html2juengere.xsl',
        success: function(xsl) {
            var xsltProcessor = new XSLTProcessor();
            xsltProcessor.importStylesheet(xsl);
            console.log(body);
            fragment = xsltProcessor.transformToFragment(body,document);
            console.log('HTML2PRELOVU');
            fragmentStr = new XMLSerializer().serializeToString(fragment);
	    console.log(fragmentStr);

            $('#source_text').val('');
            var xml = fragmentStr;

            var xmlDOM = new DOMParser().parseFromString(xml, 'text/xml');

            var xsltProcessor = new XSLTProcessor();

            $.ajax({
                url: 'xsl/juengere2wb.xsl',
                success: function(xsl) {
                    console.log('PRECRANACH2WB');
                    console.log(xmlDOM);
                    xsltProcessor.importStylesheet(xsl);
                    fragment = xsltProcessor.transformToFragment(xmlDOM,document);
                    console.log(fragment);
                    fragmentStr = new XMLSerializer().serializeToString(fragment);
                    console.log(fragmentStr);
                    var processedStr = fragmentStr
                        .replace(/\n(\s|\n|\r)*/g, "\n")
                        .replace(/(\s*@newline\s*)+/g, "\n\n")
                        .replace(/&amp;/g, '&')
                        .replace(/(?:\s|\n)*@slide(?:\s|\n)*@((course|lecture|week|chapter|section|subsection|subsubsection|topic){.*?})/g, "@$1")
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&')
                        .replace(/&apos;/g, "'")
                        .replace(/^\n*/, '')
                        .replace(/@(section|subsection|subsubsection)\n@title\n*((?:.|\n)*?)\n@endtitle/g, "@$1{$2}");
                    editor.setValue(processedStr, 1);
                    resetHighlight();
                    showTexSource(false);
                    $('#output .slide').addClass('tex2jax_ignore');
                    postprocess();
                }
            });
        }
    });
}

function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}

function focusOn(slide, text) {
    if ($('#s' + slide).hasClass('collapsed')) {
        collapseToggle(slide);
    }
    $('#s' + slide).click();

    if (text!= '') {
        $('#output').scrollTo('#s' + slide);
        $('#s' + slide + ' *[text=' + text.replace(/[^a-zA-Z0-9]/g, '') + ']').addClass('highlighted');
    } else {
        $('#output').scrollTo('#s' + slide, 150);
    }
}

function highlight(item) {
    $('.item_button').css('background-color', '');
    $('div[item="' + item + '"]').find("button").first().css('background-color', '#ff0');

}

function imagePostprocess(image) {

    if ($(image).hasClass('exempt')) {
        return 1;
    }

    $(image).attr('src', $(image).attr('data-src'));

    var image_width = $(image).closest('.image').css('width');

    $(image).closest('.image').css('background', '');
    $(image).closest('.image').css('height', '');
    $(image).closest('.dual-left').css('background', '');
    $(image).closest('.dual-left').css('height', '');
    $(image).closest('.dual-right').css('background', '');
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

    var sectionTitle = $(slide).attr('section_title') ? $(slide).attr('section_title') : $(slide).prevAll('[section_title!=""]:first').attr('section_title');

    sectionTitle = sectionTitle ? sectionTitle : '';

    $('.current_course').text(course);
    $('.current_chapter').text(chapterType + ' ' + chapter);
    $('.current_chapter_title').text(chapterTitle);
    $('.current_topics').text(topics);

    if (section != '') {
        $('.current_section').html('Section ' + section + '<br/>' + sectionTitle);
    } else {
        $('.current_section').html('');
    }
    $('.current_slide').html('Slide ' + index);
    if (course != '' || chapter != '' || topic != '') {
        $('title').text(course);
    }


    $('div.keywords').hide();
    $('div.keywords[environ="course"], div.keywords[environ="root"]').each(function(){
        $(this).show();
    });
    $('div.keywords[environ="chapter"][chapter="' + chapter + '"][slide="all"]').each(function(){
        $(this).show();
    });

    $('div.keywords[slide!="all"]').hide();
    $('div.keywords[chapter="' + chapter + '"][slide="' + index + '"]').show();

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

function updateSlideProgress(slideIndex, refresh) {
    if (refresh) {
        $('#slide_progress tbody tr').html('');
        var numSlides = document.getElementsByClassName('slide').length;
        var spacing = Math.min(3, 5*20/numSlides);
        for (var i = 0; i < numSlides; i++) {
            $('#slide_progress tbody tr').append('<td num="' + (+i + 1) + '" style="border-left:' + spacing + 'px solid #fff;border-right: ' + spacing + 'px solid #fff;background-color:#eee;height:7px;"></td>');
        }
    }
    $('#slide_progress td').each(function() {
        $(this).css('background-color', $(this).attr('num') <= slideIndex ? '#ccc' : '#eee');
    });
    // $('#slide_progress td').css('background-color', '#eee');
    // $('#slide_progress').find('td[num="' + slideIndex + '"]').css('background-color', '#ccc');

}

function updateModalRefby(md5String) {
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

function updateModalProofs(md5String) {
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
                console.log('SUBSTATEMENT: ' + thisNode.getAttribute('md5') );
                // html += '<li><a target="_blank" knowl="' + cranach.rootURL + '/cranach_bare.php?xml=' + cranach.attr['dir'] + '/'+ thisNode.getAttribute('filename') + '&query=//lv:substatement[@of=\'' + md5String + '\']"><strong>Proof</strong></a></li>';
                // html += '<li><a target="_blank" href="' + contentURLDir + '/' + thisNode.getAttribute('filename') + '&query=//lv:substatement[@of=\'' + md5String + '\']"><strong>Proof</strong></a></li>';
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
