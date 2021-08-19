function scrollToLine(editor, slide) {
    // var slideLine = Array();
    lines = editor.getSession().doc.getAllLines();
    let isComment = false;
    let slideCount = 0;
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].match(/\<\!\-\-/g)) {
            isComment = true;
        }
        if (lines[i].match(/\-\-\>/g)) {
            isComment = false;
        }

        if (!isComment) {
            if (lines[i].match(/^@(slide|sep|course|chapter|lecture|week|section|subsection|subsubsection)/) && !lines[i].match(/\<\!\-\-.*?\-\-\>/)) {
                slideCount++;
            }
        }
        if (slideCount == slide) {
            editor.gotoLine(i + 1);
            break;
        }
    }

}


function updateSlideClickEvent(cranach) {

    // $('.slide').hover(function() {
    //     $('#output_icon_container').show();
    // });

    $('.slide').off();
    $('.slide').click(function() {
        
        // console.log('SLIDE CLICKED');        
        
        var slideElement = this;
        
        if (typeof editor !== typeof undefined) {
            scrollToLine(editor, $(slideElement).attr('canon_num'));
        }

        $('*[text]').removeClass('highlighted');
        $('button').removeClass('highlighted');
        $('.item_button').css('background-color', '');
        $(this).find('.loading_icon').hide();

        $('.separator').css('font-weight', 'normal');
        $('.separator').find('a').css('color', 'pink');

        $(this).find('.separator').css('font-weight', 'bold');
        $(this).find('.separator').find('a').css('color', 'red');

        $(this).find('iframe:not([src])').each(function() {
            $(this).attr('src', $(this).attr('data-src')).show();
            $(this).iFrameResize({checkOrigin:false});
            // iFrameResize({ log: true }, this);
        });

        if (!$(this).hasClass('selected')) {
            if (cranach.attr['editMode']) {
                $('#edit_button').click();
            }
            if (!$(slideElement).hasClass('edit')) {
                batchRender(slideElement);
            }
            var course = $(this).attr('course');
            var chapterType = $(this).attr('chapter_type');
            var chapter = $(this).attr('chapter');
            var slide = +$(this).attr('slide');
            var statements = new Array();

            updateTitle(slideElement);
            
            var url = cranach.attr['contentURL'];
            var urlSlide = cranach.attr['contentURL'] +  '&query=' + cranach.attr['query'] + '&slide=' + slide;

            $('.url.share_text.slide_info').html(urlSlide);

            $('#url_open').attr('href', urlSlide);

            $('.hyperlink.share_text.slide_info').html('<a href="' + urlSlide + '" target="_blank" title="Course:' + course + '">' + 'Chapter ' + chapter + ' Slide ' + slide + '</a>');

            $('.hyperref.share_text.slide_info').html('\\href{' + urlSlide.replace('#', '\\#') + '}{Chapter ' + chapter + ' Slide ' + slide + '}');

            $('#slide_info').show();

            if ($('.current_chapter').first().text() != $(slideElement).attr('chapter')) {
                $('#info_statements .chapter').hide();
                $('#info_statements .chapter[chapter="' + $(slideElement).attr('chapter') + '"]').show();
            }

            if ($(this).find('a.collapsea[aria-expanded="false"]').length) {
                $('#uncollapse_button').text('Uncollapse');
            } else {
                $('#uncollapse_button').text('Collapse');
            }
            $('#output div.slide').removeClass('selected');
            $(this).addClass('selected');
        }        
    });

}

var timer = null;
function updateScrollEvent(cranach) {
    $('#output').off();
    
    // https://stackoverflow.com/questions/4620906/how-do-i-know-when-ive-stopped-scrolling
    $('.output:visible').on('scroll', function() {
        if(timer !== null) {
            clearTimeout(timer);
        }
        timer = window.setTimeout(function() {
            $('.output:visible .slide.tex2jax_ignore').each(function() {
                if (isElementInViewport(this)) {
                    batchRender(this);
                };
            });
        }, 15*100);
    });

}

function updateToc(cranach) {
    console.log('UPDATING TOC');
    var url = cranach.attr['contentURL'];

    $('.toc').each(function() {
        $('#toc').html('').append($('#output').find('.toc_src').first());
    });
    $('#output').find('.toc_src').hide();

    $('.toc').find('a').find('span.serial').each(function() {
        var string = $(this).text();
        $(this).text(string.charAt(0).toUpperCase() + string.slice(1));
    });

    $('#info_statements').html('');
    $('.toc').find('a.chapter').each(function() {
        let chapter = $(this).attr('chapter');
        let statements = new Array();
        $("#output div[wbname='statement'][chapter='" + chapter + "']").each(function() {
            if (!($(this).attr('type') in statements)) {
                statements[$(this).attr('type')] = '';
            }

            var serial = $(this).attr('item');
            var $item = $('div[serial="' + $(this).attr('item') + '"]').closest('div.statement').first();
            var slide = $item.closest('.slide').attr('slide');

            statements[$(this).attr('type')] += "<a style='margin:1px 10px 1px 10px;' class='info_statements_num' serial='" + serial + "' href='javascript:void(0)'>" + serial + "</a>";
        });
        var html = '';        
        for (var key in statements) {
            html += '<br/><a class="info_statements" target="_blank" href="' + url + '&query=//lv:statement[@chapter=' + chapter + ' and @type=%27' + key + '%27]">' + key + '</a><em> ' + statements[key] + '</em>';
        }

        $('#info_statements').append('<div class="statements chapter" chapter="' + chapter + '" style="display:none">' + html + '</div>');
        let $item;
        $('#info_statements').find('.info_statements_num').click(function() {
            $item = $('.item_title[serial="' + $(this).attr('serial') + '"]').first();
            focusOn($item, '');
            highlight($(this).attr('serial'));
        });

        var $slide = $('.slide[chapter="' + $(this).attr('chapter') + '"]').first();
        $(this).click(function() {
            jumpToSlide($('#output'), $slide);
        });
    });
    // console.log($('#info_statements')[0]);

    $('.toc').find('a.section').each(function() {
        var $slide = $('.slide[section="' + $(this).attr('section') + '"][chapter="' + $(this).attr('chapter') + '"]').first();
        $(this).click(function() {
            // $('#output').scrollTo($slide);
            jumpToSlide($('#output'), $slide);
            $slide.click();
        });
    });
    $('.toc a.subsection').each(function() {
        var $slide = $('.slide[subsection="' + $(this).attr('subsection') + '"][section="' + $(this).attr('section') + '"][chapter="' + $(this).attr('chapter') + '"]').first();
        $(this).click(function() {
            jumpToSlide($('#output'), $slide);
            $slide.click();
        });
    });
    MathJax.startup.promise = typeset([document.getElementById('toc')]);
}

function updateKeywords() {
    $('#info_keywords_course').html('');
    $('div.keywords[slide="all"][environ="course"]').each(function() {
        if ($('#info_keywords_course')) {
            $('#info_keywords_course').append($(this));
        } else {
            $(this).hide();
        }
    });
    $('div.keywords[slide="all"][environ="root"]').each(function() {
        if ($('#info_keywords_course')) {
            $('#info_keywords_course').append($(this));
        } else {
            $(this).hide();
        }
    });
    $('#info_keywords_chapter').html('');
    $('div.keywords[slide="all"][environ="chapter"]').each(function() {
        if ($('#info_keywords_chapter')) {
            $('#info_keywords_chapter').append($(this));
        } else {
            $(this).hide();
        }
    });
    if ($('#slide_keywords')) {
        $('#slide_keywords').html('').append($('div.keywords[slide!="all"]'));
    } else {
        $(this).hide();
    }
}

function updateSlideSelector(cranach) {

    try {
        var numOfSlides = cranach.attr['cranachDoc'].getElementsByTagName('slide').length;
    } catch(error) {
        return 0;
    }
    $("#slide_sel").html('');
    for (let i = 1; i <= numOfSlides; i++) {
        var o = new Option(i.toString(), i);
        $("#slide_sel").append(o);
    }
    $('#slide_sel').on('change', function() {
        console.log('JUMPING TO SLIDE: ' + $(this).val());
        jumpToSlide($('#output'), $('#s' + $(this).val()));
    });
}

function updateRefs(cranach) {
    
    $('a.lcref').each(function() {
        $(this).attr('lcref', "");
        
        var label = $(this).attr('label');
        var md5 = $(this).attr('md5');
        
        var contentDir = cranach.attr['dir'];
        var rootURL = cranach.attr['rootURL'];
        if (cranach.hasXML) {
            contentDir = cranach.attr['xmlPath'].replace(/[^\/]+\.xml$/, '');
        } else if (cranach.hasWb) {
            contentDir = cranach.attr['wbPath'].replace(/[^\/]+\.wb$/, '');
        }
        
        let statementType = 'statement';
        if ($(this).attr('type').match(/proof|solution|answer/i)) {
            statementType = 'substatement';
        }
        if ($(this).attr('type').match(/figure/i)) {
            statementType = 'figure';
        }
        
        var rootURL = cranach.attr['rootURL'];
        if ($(this).attr('filename') == 'self') {
            if (cranach.hasXML) {
                var lcref = rootURL + "?xml=" + cranach.attr['xmlPath'] + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
            } else {
                var lcref = rootURL + "?wb=" + cranach.attr['wbPath'] + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
            }
        } else if ($(this).attr('src-filename')) {
            if ($(this).attr('src-filename').match(/\.xml$/)) {
                var lcref = rootURL + "?xml=" + contentDir + '/' + $(this).attr('src-filename') + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
            } else {
                var lcref = rootURL + "?wb=" + contentDir + '/' + $(this).attr('src-filename') + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
            }
        }
        
        $(this).attr('lcref', lcref + '&version=' +Math.random());
        
    });
                    
    $('a.href').each(function() {
                    
        var label = $(this).attr('label');
        var serial = $(this).attr('serial');
        var md5 = $(this).attr('md5');
        var contentDir = ''
        
        var rootURL = cranach.attr['rootURL'];
        if (cranach.hasXML) {
            contentDir = cranach.attr['xmlPath'].replace(/[^\/]+\.xml$/, '');
        } else if (cranach.hasWb) {
            contentDir = cranach.attr['wbPath'].replace(/[^\/]+\.wb$/, '');
        }
        
        if ($(this).attr('filename') == 'self') {
            if (cranach.hasXML) {
                var href = rootURL + "?xml=" + cranach.attr['xmlPath'] + '&section=' + serial;
            } else {
                var href = rootURL + "?wb=" + cranach.attr['wbPath'] + '&section=' + serial;
            }
        } else {
            if (cranach.hasXML) {
                var href = rootURL + "?xml=" + contentDir + '/' + $(this).attr('src-filename') + '&section=' + serial;
            } else {
                var href = rootURL + "?wb=" + contentDir + '/' + $(this).attr('src-filename') + '&section=' + serial;
            }
        }
        
        $(this).attr('target', '_blank');
        $(this).attr('href', href);
        
    });
    
}

function postprocess(cranach) {
    console.log('POSTPROCESS CALLED');
    $('.icon.xml, .icon.latex').show();    

    updateSlideClickEvent(cranach);
    updateRefs(cranach);    
    updateScrollEvent(cranach);
    updateToc(cranach);
    updateKeywords();
    updateSlideSelector(cranach);
    updateTitle($('.output:visible div.slide.selected')[0] || $('.output:visible div.slide:lt(1)')[0]);    
        
    console.log(cranach);        
    
    $(function() {
        MathJax.startup.promise.then(() => {
            MathJax.startup.document.state(0);
            MathJax.texReset();
            return;
        }).then(() => {
            return MathJax.tex2chtmlPromise(cranach.macrosString);
        }).then(() => {
            $('.output:visible .slide').each(function() {
                if (isElementInViewport(this)) {
                    batchRender(this);                    
                }
            });
        });

        $('#output').find('b:not([text]), h5:not([text]), h4:not([text]), h3:not([text]), h2:not([text]), h1:not([text])').each(function() {
            var text = $(this).text();
            $(this).attr('text', text.replace(/[^a-zA-Z0-9À-ÿ\-]/g, ''));
        });

        // https://stackoverflow.com/questions/13202762/html-inside-twitter-bootstrap-popover
        $("[data-bs-toggle=popover]").popover({
            html : true,
            content: function() {
                html = 'Loading...';
                return html;
            }
        });
        $('[data-bs-toggle="popover"]').on('shown.bs.popover', function() {
            $('.popover-body').each(function() {
                let id = $(this).closest('.popover').attr('id');
                console.log(id);
                var popoverBody = this;
                $(popoverBody).html('');
                $('[aria-describedby="' + id + '"]').find('a.dropdown-item').each(function() {
                    console.log(this);
                    $(popoverBody).append($(this).clone().removeClass('hidden'));
                    console.log(popoverBody);
                });
            });
        });

        if (cranach.attr['selectedItem']) {
            console.log('SELECTED ITEM: ' + cranach.attr['selectedItem']);

            $item = $('.item_title[serial="' + cranach.attr['selectedItem'] + '"], .item_title[md5="' + cranach.attr['selectedItem'] + '"], .label[name="' + cranach.attr['selectedItem'] + '"]').first().closest('.item_title');

            $('#output').scrollTo($item);
            $item.addClass('highlighted');
        } else if (cranach.attr['selectedSection']) {
            var $section = $('.section_title[serial="' + cranach.attr['selectedSection'] + '"], .label[name="' + cranach.attr['selectedSection'] + '"]').first().closest('.section_title').first();
            var $selectedSlide = $section.closest('.slide');
            $('#output').scrollTo($section);
            $section.addClass('highlighted');
        } else {
            var $selectedSlide = $('.slide[slide="' + cranach.attr['selectedSlide']  + '"], .label[name="' + cranach.attr['selectedSlide'] + '"]').first().closest('.slide');
            console.log('SCROLLING TO SLIDE ' + cranach.attr['selectedSlide']);
            $('#output').scrollTo($selectedSlide);
            // $selectedSlide.click();
        }        

        if (cranach.attr['selectedKeyword']) {
            console.log('SELECTED KEYWORD: ' + cranach.attr['selectedKeyword']);
            focusOn($selectedSlide, cranach.attr['selectedKeyword'].replace(/\s/g, ''));
        }                
        
        if (cranach.attr['lectureMode']) {   
			console.log('LECTURE MODE');     
			$('[data-lecture-skip="true"]').addClass('lecture_skip');
		}
        
        $('#loading_icon').hide();
        $('#right_half .navbar').show();
        if (cranach.attr['present']) {
        	console.log('PRESENT MODE');
        	$('#present_button').click();
        }
    });    
}
