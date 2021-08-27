function saveText(text, renderer, ext) {
    var dummyLink = document.createElement('a');
    uriContent = "data:application/octet-stream," + encodeURIComponent(text);
    dummyLink.setAttribute('href', uriContent);
    
    var filename = renderer.attr['localName'];
    console.log(filename);
    dummyLink.setAttribute('download', filename.replace(/\.[^\.]+$/, '') + '.' + ext);
    dummyLink.click();
}

function saveWb(editor, renderer) {
    saveText(editor.session.getValue(), renderer, 'wb');
}

function collectNewcommands(str) {
    var commandsStr = '';
    var obj = new Object();
    var commands = str.match(/(\\(re)?newcommand{.*?}(?:\[\d+\])*{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{[^{}]*}))*}))*}))+})/g);
    console.log(commands);
    
    if (commands == null || typeof commands == typeof undefined) {
        return '';
    }
    for (var i = 0; i < commands.length; i++) {
        var matches = commands[i].match(/\\(?:re)?newcommand{(.*?)}((?:\[\d+\])*{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{[^{}]*}))*}))*}))+})/);
        console.log(matches);
        obj[matches[1]] = matches[2];
    }
    console.log(obj);
    
    for (const property in obj) {
        commandsStr += '\\newcommand{' + property + '}' + obj[property] + "\n";
    }
    console.log(commandsStr);
    return commandsStr;
}

function showLatex(el) {
    $('.modal-footer').find('.btn').hide();
    $('.modal-footer').find('.btn.save').show();
    
    var xsltProcessor = new XSLTProcessor();
    $('#wb_modal').find('button.save').attr('ext', 'tex');
    $('#wb_modal').find('.modal-title').html('LaTeX');
    
    var docCranach = el.attr['cranachDoc'];
    var contentURLDir = el.attr['contentURLDir'];
    var contentURL = el.attr['contentURL'];
    
    $.ajax({
        url: 'xsl/cranach2latex.xsl?' + 'version=' + Math.random(),
        dataType: 'xml'
    })
    .done(function(xsl) {
        var oParser = new DOMParser();
        var xml = new XMLSerializer().serializeToString(docCranach);
        xml = xml.replace(/&lt;(div|table|thead|tr|td|th|a)\s*.*?&gt;/g, '<$1>');
        xml = xml.replace(/&lt;\/(div|table|thead|tr|td|th|a)\s*&gt;/g, '</$1>');
        xml = xml.replace(/#/g, '\#');
        report(xml);
        var xmlDOM = oParser.parseFromString(xml, "application/xml");
        xsltProcessor.importStylesheet(xsl);
        xsltProcessor.setParameter('', 'contenturldir', contentURLDir);
        xsltProcessor.setParameter('', 'contenturl', contentURL);
        fragment = xsltProcessor.transformToFragment(xmlDOM, document);
        report(fragment);
        fragmentStr = new XMLSerializer().serializeToString(fragment);
        $('#source_text').val('');
        var latex = fragmentStr.replace(/\n\n\n*/g, "\n\n")
        .replace(/\n(\ )*/g, "\n")
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/\<!--.*?--\>/g, '')
        .replace(/&amp;/g, "&")
        .replace(/\\class{.*?}/g, '')
        .replace(/\\cssId{.*?}/g, '')
        .replace(/&ocirc/g, '\\^o');
        var tmp = el.macrosString + "\n" +  latex;
        latex = collectNewcommands(tmp) + latex.replace(/(\\newcommand{.*?}(?:\[\d+\])*{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{[^{}]*}))*}))*}))+})/g, '')
        // .replace(/\$\n+\$/g, '')
        .replace(/section{\s*(.*?)\s*}/g, "section{$1}");
        $('#source_text').val(latex);
    });
}

function showXML(el) {
    $('.modal-footer').find('.btn').hide();
    $('.modal-footer .github').css('display', 'inline-block')
    $('.modal-footer').find('.btn.commit').show();
    $('.modal-footer').find('.btn.save').show();
    $('.modal-footer').find('.btn.render').show();
    
    $('#source_text').val('');
    $('#wb_modal').find('button.save').attr('ext', 'xml');
    $('#wb_modal').find('.modal-title').text('Cranach XML');
    $('#source_text').val(new XMLSerializer().serializeToString(el.attr['cranachDoc']));
}

function initGhDialog(editor) {
    
    $('#gh_modal .feedback .message').html('');
    
    let contentURL = window.location.href;
    let params = window.location.href.match(/\?(.*?)(#|$)/);
    
    let urlParams = new URLSearchParams(params[1]);
    let pathname = urlParams.has('wb') ? urlParams.get('wb') : urlParams.get('xml');
    let localFilenameRoot = pathname.match(/(local|([^\/]+))\.(?:wb|xml)$/)[1];
    
    let ghRepoUsername;
    let ghRepo;
    
    console.log(contentURL);
    let gh_match = contentURL.match(/raw\.githubusercontent.com\/(.*?)\/(.*?)\//);    
    if (gh_match) {
        ghRepoUsername = gh_match[1];
        ghRepo = gh_match[2];
    } else {
        gh_match = contentURL.match(/([^\/]+)\/([^\/]+)\.(xml|wb)/);
        ghRepoUsername = 'ENTER USERNAME';
        ghRepo = gh_match ? gh_match[1] : '';
    }
    
    console.log(ghRepoUsername + ' ' + ghRepo);
    
    $('#ghRepo').val(ghRepo);
    $('#ghRepoUsername').val(ghRepoUsername);
    $('#localFilenameRoot').text(localFilenameRoot);
    $('#gh_modal button.commit').hide();
    
    
    let message = '';
    message = "Updating .wb";
    let $wb_msg = $('<div><code>' + message + '</code></div>').appendTo( $('#gh_modal .feedback .message') );
    
    commitWb(editor);
    
    message += "&nbsp; &#x2713;";
    $wb_msg.find('code').html(message);
    message = "Updating .xml";
    $wb_msg = $('<div><code>' + message + '</code></div>').appendTo( $('#gh_modal .feedback .message') );
    var baseRenderer = new Cranach(window.location.href).setup({'query':''}).then(cranach => {
        console.log(cranach);
        MathJax.typesetClear();
        return cranach.setOutput(document.getElementById('output')).renderWb(editor.getValue());
    }).then(cranach => {
        postprocess(cranach);
        let cranach_text = new XMLSerializer().serializeToString(cranach.attr['cranachDoc']);
        let index_text = new XMLSerializer().serializeToString(cranach.attr['indexDoc']);
        $('#cranach_text').val(cranach_text);
        $('#index_text').val(index_text);
        message += "&nbsp; &#x2713;";
        $wb_msg.find('code').html(message);
        $('#gh_modal button.commit').show();
    });
    
}

// function showIndex(promise) {
//     $('.modal-footer').find('.btn').hide();
//     $('.modal-footer').find('.btn.save').show();
//     $('.modal-footer').find('.btn.update-index').show();
//     $('.modal-footer').find('.btn.load-index').show();
//     $('#wb_modal').find('button.save').attr('ext', 'xml');
//     $('#wb_modal').find('.modal-title').text('Index XML');
// 
//     $('#source_text').val('');
//     promise.then(el => {
//         if (el.attr['indexDoc']) {
//             $('#source_text').val(new XMLSerializer().serializeToString(el.attr['indexDoc']));
//         }
//     });
// }

function openWb(filePath) {
    
    var file    = filePath.files[0];
    var reader  = new FileReader();
    
    console.log('READER');
    console.log(file);
    
    reader.addEventListener("load", function () {
        console.log('READER RESULT');
        console.log(reader.result);
        editor.setValue(reader.result, 1);
    }, false);
    
    if (file) {
        // https://stackoverflow.com/questions/857618/javascript-how-to-extract-filename-from-a-file-input-control
        var fullPath = filePath.value;
        if (fullPath) {
            var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
            var filename = fullPath.substring(startIndex);
            if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
                filename = filename.substring(1);
            }
        }
        reader.readAsText(file);
    }
}


function openXML(renderer, filePath) {
    let file    = filePath.files[0];
    let filename = '';
    let reader  = new FileReader();
    $('.progress-bar').css('width', '20%').attr('aria-valuenow', '20');
    $('#loading_icon').show();
    console.log(filePath);
    if (file) {
        // https://stackoverflow.com/questions/857618/javascript-how-to-extract-filename-from-a-file-input-control
        let fullPath = filePath.value;
        if (fullPath) {
            let startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
            filename = fullPath.substring(startIndex);
            if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
                filename = filename.substring(1);
            }
        }
    }
    console.log(filename);
    reader.addEventListener("load", function () {
        $('.progress-bar').css('width', '50%').attr('aria-valuenow', '50');
        let cranachDoc = new DOMParser().parseFromString(reader.result, "application/xml");
        baseRenderer = renderer.then(cranach => {
            $('.progress-bar').css('width', '75%').attr('aria-valuenow', '75');            
            cranach.attr['localName'] = filename;
            cranach.attr['cranachDoc'] = cranachDoc;
            MathJax.startup.document.state(0);
            MathJax.texReset();
            MathJax.typesetClear();
            return cranach.displayCranachDocToHtml();            
        }).then(cranach => {
            postprocess(cranach);            
            convertCranachDocToWb(cranach.attr['cranachDoc'], editor);
            
            $('#loading_icon').hide();
            return cranach;
        });
    }, false);
    
    reader.readAsText(file);
    
}

$(function() {
    baseRenderer.then(cranach => {        
        $('.modal .btn.save').click(function() {
            saveText($('#source_text').val(), cranach, $(this).attr('ext'));
        });
    });
});
