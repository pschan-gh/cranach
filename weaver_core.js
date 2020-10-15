var xh_prefix = '';
const htmlElements = /pre|table|tbody|thead|th|tr|td|i|em|p|a|b|strong|u|h\d|div|img|center|script|iframe|blockquote|ol|ul|li|sup|code|hr|span|iframe|br|hr|textarea/;

const htmlRe = new RegExp('\\<(?:' + htmlElements.source + ')(?:\\s+(?:.|\n)*?|)\\/*\\>', 'i');
const htmlCloseRe = new RegExp('\\<\\/(?:' + htmlElements.source +')(?:\\s+.*?|)\\>', 'i');

const nested = /((?:([^{}]*)|(?:{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{[^{}]*}))*}))*}))+)/;

// const mainTokensRe = new RegExp('(\\<\\!\\-\\-)|(\\-\\-\\>)|(@@\\w+)|(@nstep)|(@(?:(?!nstep)[a-zA-Z\*]+)(?:{\\n*' + nested.source + '\\n*})?(?:\\[.*?\\])?)|(' + htmlRe.source + ')|(' + htmlCloseRe.source + ')|((?:\\s|\\n)*((?!\\<\\/*(' + htmlElements.source + ')|@|\\<\\!\\-\\-|\\-\\-\\>).|\\n)+)', 'g');

const mainTokensRe = new RegExp('(\\<\\!\\-\\-)|(\\-\\-\\>)|(@@\\w+)|(@(?:[a-zA-Z\*]+)(?:{\\n*' + nested.source + '\\n*})?(?:\\[.*?\\])?)|(' + htmlRe.source + ')|(' + htmlCloseRe.source + ')|((?:\\s|\\n)*((?!\\<\\/*(' + htmlElements.source + ')|@|\\<\\!\\-\\-|\\-\\-\\>).|\\n)+)', 'g');


var dictionary = {
    "@thm": "Theorem",
    "@prop": "Proposition",
    "@lemma": "Lemma",
    "@cor": "Corollary",
    "@defn": "Definition",
    "@claim": "Claim",
    "@fact": "Fact",
    "@remark": "Remark",
    "@eg" : "Example",
    "@ex" : "Exercise",
    "@proof": "Proof",
    "@ans": "Answer",
    "@sol": "Solution",
    "@notation": "Notation",
    "@paragraphs": "Paragraphs",
    "@col": "col",
    "@newcol": "newcol"
};

var environs = ["statement", "substatement", "newcol", "col_ul", "col_ol", "enumerate", "itemize", "framebox", "center", "left", "right", "title", "figure"];
var chapterType = "Chapter";
var course='';
var topic='';
var step = 0;

var secNums = {
    'chapter' : 1,
    'section' : 1,
    'subsection': 1,
    'subsubsection' : 1,
    'statement': 1,
    'figure': 1,
    'slide': 1
}

function Stack(node, doc) {
    // var namespace = namespace || 'http://www.math.cuhk.edu.hk/~pschan/cranach';
    // var node = node || doc.createElementNS(namespace, name);

    this.doc = doc;
    this.parent = null;
    this.node = node;
    // report(node);
    try {
        this.node.setAttribute("environment", "");
    } catch(err)
    {}
    // this.node.setAttribute("xmlns", "http://www.math.cuhk.edu.hk/~pschan/cranach");
    this.node.textContent = "";
    this.words = [];
    this.is_comment = false;
    this.html_environments = [];
    this.stepsID = 0;
    this.course = '';
    this.chapterType = '';
    // this.wwID = 0;

    this.addChild = function(name, namespace) {
        var namespace = namespace || 'http://www.math.cuhk.edu.hk/~pschan/cranach';
        // report('ADDING ' + name + ' with NS: ' + namespace);
        var parent = this;
        while (parent.node.nodeName.match(/PARAGRAPHS/i)) {
            parent = parent.close();
        }
        var child = new Stack(this.doc.createElementNS(namespace, name));
        // report(parent.node.nodeName + ' ADDING: ' + name);
        if (environs.includes(name)) {
            child.node.setAttribute("environment", name);
        } else {
            child.node.setAttribute("environment", parent.getEnvironment());
        }

        child.doc = parent.doc;
        child.words = parent.words;
        child.html_environments = parent.html_environments;
        child.stepsID = parent.stepsID;
        child.is_comment = parent.is_comment;
        child.course = parent.course;
        child.chapterType = parent.chapterType;
        child.parent = parent;

        child.node.setAttribute('chapter_type', child.chapterType);

        return child;
    }

    this.addNode = function(node) {
        var parent = this;
        while (parent.node.nodeName.match(/PARAGRAPHS/i)) {
            parent = parent.close();
        }
        var child = new Stack(node);
        var name = node.nodeName;
        // report(parent.node.nodeName + ' ADDING: ' + name);
        if (environs.includes(name)) {
            child.node.setAttribute("environment", name);
        } else {
            child.node.setAttribute("environment", parent.getEnvironment());
        }

        child.doc = parent.doc;
        child.words = parent.words;
        child.html_environments = parent.html_environments;
        child.stepsID = parent.stepsID;
        child.is_comment = parent.is_comment;
        child.course = parent.course;
        child.chapterType = parent.chapterType;
        child.parent = parent;

        return child;
    }

    this.loadOptions = function(options) {
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                report('SETATTRIBUTE: ' + key + " -> " + options[key]);
                this.node.setAttribute(key, options[key]);
            }
        }
    }

    this.addComment = function(text) {
        var parent = this;
        while (parent.node.nodeName.match(/PARAGRAPHS/i)) {
            parent = parent.close();
        }
        var child = new Stack(this.doc.createComment(text));

        child.doc = parent.doc;
        child.words = parent.words;
        child.html_environments = parent.html_environments;
        child.stepsID = parent.stepsID;
        child.is_comment = parent.is_comment;
        child.course = parent.course;
        child.chapterType = parent.chapterType;
        child.parent = parent;

        return child;
    }

    this.close = function() {
        if (this.parent != null) {
            if (this.node.nodeName.match(/statement|figure/i)) {
                var strippedText = this.node.textContent.replace(/[^a-zA-Z0-9]/g, '')
                if (strippedText != '') {
                    var textMD5 = md5(strippedText);
                    // report("STATEMENT STRIPPED TEXT: " + strippedText);
                    this.node.setAttribute('md5', textMD5);
                }
            }
            this.parent.node.appendChild(this.node);
            this.parent.words = this.words;
            this.parent.html_environments = this.html_environments;
            this.parent.stepsID = this.stepsID;
            this.parent.is_comment = this.is_comment;
            this.parent.course = this.course;
            this.parent.chapterType = this.chapterType;
            // report('CLOSING TO: ' + this.parent.node.nodeName);
            return this.parent;
        } else {
            return this;
        }
    }

    this.hasParent = function(regex) {
        var failsafe = 0;
        var aux = this;
        while((!aux.node.nodeName.match(regex)) && !(aux.node.nodeName.match(/root/i)) && (failsafe < 50)) {
            aux = aux.parent;
            failsafe++;
        }
        return aux.node.nodeName.match(regex);
    }

    this.getParent = function(regex) {
        var failsafe = 0;
        var aux = this;
        while((!aux.node.nodeName.match(regex)) && !(aux.node.nodeName.match(/root/i)) && (failsafe < 50)) {
            aux = aux.parent;
            failsafe++;
        }
        return aux;
    }

    this.closeTo = function(regex) {
        var failsafe = 0;
        var aux = this;
        // report("IN CLOSETO REGEX: " + this.node.nodeName + ' '  + regex);
        while((!aux.node.nodeName.match(/root/i)) && (failsafe < 100) && !aux.node.nodeName.match(regex)) {
            failsafe++;
            aux = aux.close();
            // report('CLOSE TO: ' + aux.node.nodeName);
        }
        return aux;
    }

    this.setAttribute = function(attr, value) {
        this.node.setAttribute(attr, value);
        return this;
    }

    this.getEnvironment = function() {
        return this.node.getAttribute("environment");
    }

    this.getNode = function() {
        return this.node;
    }

    this.weave = function() {
        var originalWord = this.words.shift();


        var verbatim = this.node.nodeName.match(/(script|textarea)/i);
        if (verbatim) {
            report('DEFAULT: ' + originalWord);
            if (!originalWord.match(new RegExp('</' + verbatim[1] + '>', 'i'))) {
                originalWord = originalWord.replace(/@@(\w+)/g, "@$1");
                this.node.textContent += originalWord;
                return this;
            }
        } else {
            if (originalWord.match(/^\n$/)) {
                return this;
            }
            originalWord = originalWord.replace(/@@(\w+)/g, "@escaped{$1}");
        }

        report('WEAVING: ' + originalWord);

        word = originalWord.trim();

        var word = originalWord.trim();
        var child = this;

        if (word.match(/^\<\!\-\-/)) {
            // report('IS COMMENT');
            while (child.node.nodeName.match(/PARAGRAPHS/i)) {
                child = child.close();
            }
            child = child.addComment('');
            child.is_comment = true;
            return child;
        }

        if (word.match(/\-\-\>/)) {
            // report('END COMMENT');
            // report(child.parent.node.nodeName);
            child = child.close();
            child.is_comment = false;
            return child;
        } else if (child.is_comment) {
            // report('APPENDING TO COMMENT: ' + originalWord);
            child.node.textContent += originalWord;
            return child;
        }

        // var htmlMatches = word.match(/\<([a-z0-9]+)(.*?)/i);
        var htmlTagRe = new RegExp('\\<(' + htmlElements.source + ')(\\s+(?:.|\n)*|)\\/*\\>', 'i');
        var htmlMatches = word.match(htmlTagRe);
        if (htmlMatches) {
            // report('WORD: ' + word);
            report('HTML TAG: ' + htmlMatches[1]);
            if (htmlMatches[1].match(/^li$/i)) {
                child = child.closeTo(/ol|ul/i);
            }

            var tag = htmlMatches[1];
            if (htmlMatches.length > 2) {
                var parameters = htmlMatches[2];
            } else {
                var parameters = ''
            }

            if (htmlMatches[1].match(/^tr|tbody|thead$/i)) {
                var domString = '<table><' + htmlMatches[1]+ parameters + '></tr></table>';
            } else if (htmlMatches[1].match(/^td|th$/i)) {
                var domString = '<table><tr><' + htmlMatches[1]+ parameters + '></td></tr></table>';
            } else {
                var domString = '<' + xh_prefix + htmlMatches[1]+ parameters + '></' + xh_prefix + htmlMatches[1] + '>';
            }
            var htmlDom = new DOMParser().parseFromString(domString, 'text/html');
            var node = htmlDom.getElementsByTagName(xh_prefix + htmlMatches[1])[0];
            // node.setAttribute('xmlns', "http://www.w3.org/1999/xhtml"); //xmldom xmlserializer bug workaround
            // var node = document.createElementNS("http://www.w3.org/1999/xhtml",tag);
            // node.outerHTML = '<' + tag + ' ' + parameters + '></' + tag + '>';

            child = child.addNode(node);
            report(child.node.nodeName + ' ' + child.node.namespaceURI);

            if (word.match(/\/\>$/) || htmlMatches[1].match(/^(img|hr|br)$/i)) {
                child = child.close();
                // report('TAG CLOSED');
                // child = child.addChild('paragraphs');
            }
            return child;
        } else {
            var htmlTagCloseRe = new RegExp('\\<\\/(' + htmlElements.source +')(\\s+.*?|)\\>', 'i');
            var htmlMatches = word.match(htmlTagCloseRe);
            if(htmlMatches) {
                var re = new RegExp(xh_prefix + htmlMatches[1], 'i');
                child = child.closeTo(re);
                report('TAG CLOSED');
                // report(child.node);
                // report(child.node.textContent);
                child = child.close();
                return child;
            }
        }

        // report('WORD SWITCH :' + word);

        var argument = '';
        var options = null;
        var matches = word.match(/^(@[a-zA-Z\*]+)(?:{((?:.|\n)*?)})?(?:\[(.*?)\])?$/);

        if (matches) {
            word = matches[1];
            var tagname = word.substr(1);
            if (matches[2]) {
                argument = matches[2].trim();
                report('ARGUMENT IS: ' + argument);
            }
            if (matches[3]) {
                try {
                    options = JSON.parse('{' + matches[3].trim().replace(/'/g, '"') + '}');
                    report('OPTIONS');
                    for (var key in options) {
                        if (options.hasOwnProperty(key)) {
                            report(key + " -> " + options[key]);
                        }
                    }
                } catch(e) {
                    options = JSON.parse('{"name":"' + matches[3].trim() + '"}');
                }
            }
        }
        // console.log(word);
        // console.log(argument);
        switch(word) {
            case "@course":
            // var re = new RegExp(word + '{(.*?)}');
            // var match = originalWord.trim().match(re)[1];
            if (argument != this.course) {
                secNums['chapter'] = 1;
                child = addSection('course', argument, child, options);
                child.node.setAttribute('course', argument);
                child.node.setAttribute('title', argument);
                course = argument;
            }
            break;
            case '@setchapter':
            secNums['chapter'] = argument;
            child = child.addChild('setchapter');
            child.node.setAttribute('wbtag', tagname);
            child.node.setAttribute('argument', argument);
            child = child.close();
            break;
            case '@chapter':
            case '@section':
            case '@subsection':
            case '@subsubsection':
            child = addSection(tagname, argument, child, options);
            break;
            case '@week':
            chapterType = "Week";
            secNums['chapter'] = +argument;
            child = addSection('week', '', child, options);
            break;
            case '@lecture':
            chapterType = "Lecture";
            secNums['chapter'] = +argument;
            child = addSection('lecture', '', child, options);
            break;
            case '@chapter_type':
            parent = child.closeTo(/chapter/i);
            parent.node.setAttribute("chapter_type", argument);
            chapterType = argument;
            break;
            case '@slide':
            child = child.closeTo(/SLIDES|section|chapter|course|root/i);
            if (!child.node.nodeName.match(/SLIDES/i)) {
                child = child.addChild('slides');
            }
            child = child.addChild('slide');
            child.node.setAttribute("wbtag", tagname);
            child.node.setAttribute("canon_num", secNums['slide']);
            secNums['slide']++;
            break;
            case '@enumerate':
            while (child.node.nodeName.match(/PARAGRAPHS/i)) {
                child = child.close();
            }
            child = child.addChild(tagname);
            child.node.setAttribute("wbtag", tagname);
            break;
            case '@itemize':
            while (child.node.nodeName.match(/PARAGRAPHS/i)) {
                child = child.close();
            }
            child = child.addChild(tagname);
            child.node.setAttribute("wbtag", tagname);
            break;
            case "@item":
            child = child.closeTo(/enumerate|itemize|slide/i);
            child = child.addChild(tagname);
            child.node.setAttribute("wbtag", tagname);
            break;
            case '@newcol':
            case '@collapse':
            case '@col':
            while (child.node.nodeName.match(/PARAGRAPHS/i)) {
                child = child.close();
            }
            if ((word == '@newcol') || (child.getEnvironment() != 'newcol')) {
                var tagname = 'newcol';
            }  else {
                var tagname = 'collapse';
            }
            child = child.addChild(tagname);
            child.node.setAttribute("wbtag", tagname);
            break;
            case '@endcol':
            child = child.closeTo(/newcol/i).close();
            break;
            case "@ul":
            case "@ol":
            child = child.addChild('col_' + tagname);
            child.node.setAttribute("wbtag", 'col_' + tagname);
            break;
            case "@li":
            child = child.closeTo(/col_ul|col_ol/i);
            child = child.addChild('col_' + tagname);
            child.node.setAttribute("wbtag", 'col_' + tagname);
            break;
            case "@endul":
            case "@endol":
            child = child.closeTo(/col_ul|col_ol/i).close();
            break;
            case "@ex":
            case "@eg":
            case "@fact":
            case "@defn":
            case "@thm":
            case "@prop":
            case "@cor":
            case "@lemma":
            case "@claim":
            case "@remark":
            case "@proof":
            case "@sol":
            case "@ans":
            case "@notation":
            if (word.match(/@(proof|sol|ans|notation|remark)/i)) {
                var statement = 'substatement';
            } else {
                var statement = 'statement';
            }
            if (child.node.nodeName.match(/PARAGRAPHS/i)) {
                child = child.close();
            }
            var parent = child;
            child = parent.addChild(statement);
            child.node.setAttribute('type', dictionary[word.trim()]);
            child.node.setAttribute("wbtag", tagname);
            if (!word.match(/@(proof|sol|ans|notation|remark)/i)) {
                child.node.setAttribute("num", secNums['statement']++);
            }
            break;
            case "@figure":
            if (child.node.nodeName.match(/PARAGRAPHS/i)) {
                child = child.close();
            }
            var parent = child;
            child = parent.addChild('figure');
            child.node.setAttribute("wbtag", tagname);
            child.node.setAttribute("type", 'Figure');
            child.node.setAttribute("num", secNums['figure']++);
            break;
            case "@of":
            var match = originalWord.trim().match(/@of{(.*?)}/)[1];
            parent = child.closeTo(/substatement/i);
            parent.node.setAttribute("of", match);
            break;
            case "@title":
            if (child.node.nodeName.match(/paragraphs/i)) {
                child = child.close();
            }
            // if (child.node.nodeName.match(/statement|substatement|chapter|section|subsection|subsubsection/i)) {
            if (argument) {
                child.node.setAttribute("title", argument.replace(/[^a-zÀ-ÿ0-9\s\-\']/ig, ''));
                var title = child.addChild("title");
                title.node.textContent += argument.trim();
                // title.node.setAttribute('scope', parent.node.nodeName);
                title.node.setAttribute('wbtag', child.node.nodeName);
                // child = child.closeTo(/title|slide/i).close();
                title.close();
            } else {
                child = child.addChild("title");
                // child.node.setAttribute('scope', parent.node.nodeName);
                child.node.setAttribute('wbtag', child.node.nodeName);
            }
            // } else {
            //     child = child.addChild("paragraphs");
            //     child.node.textContent += "ERROR? " + originalWord;
            //     child = child.close();
            // }
            break;
            case "@endtitle":
            if (!environs.includes(child.getEnvironment())) {
                break;
            }
            parent = child.getParent(/statement|substatement|chapter|section|subsection|subsubsection/i);
            parent.node.setAttribute("title", child.node.textContent.replace(/[^a-zÀ-ÿ0-9\s\-\']/ig, ''));
            child = child.closeTo(/title|slide/i).close();
            break;
            case "@caption":
            // parent = child.getParent(/figure/i);
            if (child.node.nodeName.match(/PARAGRAPHS/i)) {
                child = child.close();
            }
            var match = originalWord.trim().match(/@caption{(.*?)}/);
            if (match) {
                // parent.node.setAttribute("title", match[1].replace(/[^a-z0-9\s\']/ig, ''));
                child = child.addChild("caption");
                child.node.textContent += match[1];
                child = child.close();
            }
            break;
            case "@framebox":
            child = child.addChild("framebox");
            child.node.setAttribute("wbtag", "framebox");
            break;
            case "@endenumerate":
            if (!environs.includes(child.getEnvironment())) {
                break;
            }
            child = child.closeTo(/enumerate|slide/i).close();
            break;
            case "@enditemize":
            if (!environs.includes(child.getEnvironment())) {
                break;
            }
            child = child.closeTo(/itemize|slide/i).close();
            break;
            case "@end":
            if (!environs.includes(child.getEnvironment())) {
                break;
            }
            // var re = new RegExp(child.getEnvironment(), 'i');
            child = child.closeTo(/statement|substatement|enumerate|itemize|center|left|right|slide|framebox|figure/i).close();
            break;
            case "@center":
            child = child.addChild("center");
            child.node.setAttribute("wbtag", "center");
            break;
            case "@endcenter":
            if (!environs.includes(child.getEnvironment())) {
                break;
            }
            child = child.closeTo(/center|slide/i).close();
            break;
            case "@left":
            child = child.addChild("left");
            child.node.setAttribute("wbtag", "left");
            break;
            case "@endleft":
            if (!environs.includes(child.getEnvironment())) {
                break;
            }
            child = child.closeTo(/left|slide/i).close();
            break;
            case "@right":
            if (child.getEnvironment().match(/left/i)) {
                child = child.closeTo(/left/i).close();
            }
            child = child.addChild("right");
            child.node.setAttribute("wbtag", "right");
            break;
            case "@endright":
            if (!environs.includes(child.getEnvironment())) {
                break;
            }
            child = child.closeTo(/right|slide/i).close();
            break;
            case "@image":
            child = child.addChild("image");
            child.node.setAttribute("data-src", argument);
            child.node.setAttribute("wbtag", "image");
            child = child.close();
            break;
            case "@webwork":
            child = child.addChild("webwork");
            child.node.setAttribute("wbtag", "webwork");
            child.node.setAttribute("pg_file", argument);
            child = child.close();
            break;
            case "@wiki":
            child = child.addChild("wiki");
            child.node.setAttribute("wbtag", tagname);
            child.node.textContent += argument;
            child = child.close();
            break;
            case "@topic":
            var ancestorNode = child.getParent(/chapter|course/i);
            if (!ancestorNode.node.nodeName.match(/chapter|course/i)) {
                break;
            }
            var topics = ancestorNode.node.getAttribute('topic');
            if (typeof topics != typeof undefined && topics != null && topics != '') {
                ancestorNode.node.setAttribute('topic', topics + ', ' + argument);
            } else {
                ancestorNode.node.setAttribute('topic', argument);
            }
            var aux = ancestorNode.addChild("topic");
            aux.node.setAttribute('scope', 'chapter');
            aux.node.textContent += argument;
            aux = aux.close();
            break;
            case "@steps":
            child.stepsID++;
            step = 0;
            while (child.node.nodeName.match(/PARAGRAPHS/i)) {
                child = child.close();
            }
            child = child.addChild("steps");
            child.node.setAttribute('wbtag', 'steps');
            child.node.setAttribute("stepsid", 'steps' + child.stepsID);
            break;
            case "@nstep":
            console.log('NSTEP: ' + argument);
            // var insert = '\\class{steps' + child.stepsID + ' steps step' + step + '}';
            var insert = '\\class{steps}{\\cssId{step' + step + '}{' + argument + '}}';
            step++;
            child.node.textContent += insert;
            break;
            case "@endsteps":
            child = child.closeTo(/steps/i).close();
            break;
            case "@endproof":
            case "@qed":
            child = child.addChild("qed");
            child = child.close();
            break;
            case "@break":
            break;
            case "@newline":
            while (child.node.nodeName.match(/PARAGRAPHS/i)) {
                child = child.close();
            }
            child = child.addChild("newline");
            child = child.close();
            break;
            case"@para":
            child = child.addChild("para");
            child.node.setAttribute("wbtag", tagname);
            break;
            case "@label":
            var parent = child.closeTo(/statement|course|chapter|section|subsection|subsubsection|figure/i);
            // var parent = child.closeTo(/statement|slide|figure/i);
            // parent.node.setAttribute('label', argument);
            var label = parent.addChild("label");
            label.node.setAttribute('wbtag', tagname);
            label.node.setAttribute('name', argument);
            label.node.setAttribute('type', parent.node.getAttribute('type'));
            label.close();
            break;
            case "@ref":
            while (child.node.nodeName.match(/PARAGRAPHS/i)) {
                child = child.close();
            }
            child = child.addChild("ref");
            var matches = originalWord.match(/@ref{(.*?)}(\[(.*?)\])*/);
            if(matches) {
                if(matches[1]) {
                    child.node.setAttribute('label', matches[1]);
                }
                if (options != null) {
                    child.loadOptions(options);
                }
                // if(matches[2]) {
                //     child.node.setAttribute('name', matches[2].substring(1, matches[2].length-1));
                // } else {
                //     child.node.setAttribute('name', '');
                // }
            }
            child.node.setAttribute('wbtag', 'ref');
            child = child.close();
            break;
            case "@href":
            child = child.addChild("href");
            var matches = originalWord.match(/@href{(.*?)}(\[(.*?)\])*/);
            if(matches) {
                if(matches[1]) {
                    child.node.setAttribute('src', matches[1]);
                }
                if(matches[2]) {
                    child.node.setAttribute('name', matches[2]);
                } else {
                    child.node.setAttribute('name', matches[1]);
                }
            }
            child.node.setAttribute('wbtag', 'href');
            child.node.setAttribute('argument', argument);
            child = child.close();
            break;
            case "@keyword":
            if (child.node.nodeName.match(/PARAGRAPHS/i)) {
                child = child.close();
            }
            child = child.addChild('inline_keyword');
            child.node.textContent += argument;
            child = child.close();
            break;
            case "@keyword*":
            var slide = child.getParent(/slide/i);
            var kw = slide.addChild("hc_keyword");
            kw.node.setAttribute("wbtag", "hc_keyword");
            kw.node.setAttribute("class", "hidden");
            kw.node.textContent += argument;
            kw.close();
            break;
            case "@escaped":
            if (!child.node.nodeName.match(/script|textarea/i)) {
                child = child.addChild('escaped');
                child.node.setAttribute('wbtag', 'escaped');
                child.node.setAttribute('argument', argument);
                child = child.close();
                break;
            } else {
                originalWord = '@' + argument;
            }
            default:
            report('DEFAULT: ' + originalWord);
            if (originalWord.match(/@@\w+/)) {
                originalWord = originalWord.replace(/@@/, '@');
            }
            if (!child.node.nodeName.match(/^(script|textarea|steps|table|tbody)$/i)) {
                var chunks = originalWord.split(/(?:\s*\n\s*)(?:\s*\n\s*)+/);
                report(chunks);
                var chunk;
                if (originalWord.match(/^\s*\n\s*\n\s*/)) {
                    child = child.addChild('newline').close();
                }
                for (var i = 0; i < chunks.length; i++){
                    // chunk = chunks[i].replace(/(^\n+)|(\n+$)/g, '');
                    if (!child.node.nodeName.match(/title/i)) {
                        chunk = chunks[i].replace(/(^\n+)|(\n+$)/g, ' ');
                    } else {
                        chunk = chunks[i].replace(/(^\n+)|(\n+$)/g, '');
                    }
                    if (chunk != '') {
                        report('CHUNK: ' + chunk);
                        if (!child.node.nodeName.match(/PARAGRAPHS/i)) {
                            if (child.node.nodeName.match(/root|course|chapter|section/i)) {
                                child = child.addChild('slides').addChild('slide');
                                child.node.setAttribute("canon_num", secNums['slide']);
                                secNums['slide']++;
                            }
                            child = child.addChild("paragraphs");
                            child.node.setAttribute("wbtag", "paragraphs");
                        }
                        child.node.textContent += chunk;
                        child = child.close();
                        if (i < chunks.length - 1) {
                                child = child.addChild('newline').close();
                            // if (child.node.nodeName.match(new RegExp(htmlElements.source, 'i'))) {
                            //     var htmlDom = new DOMParser().parseFromString('<br wbtag="newline"/>', 'text/html');
                            //     var node = htmlDom.getElementsByTagName('br')[0];
                            //     child = child.addNode(node).close();
                            // } else {
                            //     child = child.addChild('newline').close();
                            // }
                        } else if (originalWord.match(/\n\s*\n\s*$/)) {
                            child = child.addChild('newline').close();
                        }
                    }
                }
            } else {
                if (!child.node.nodeName.match(/^(table|tbody)$/i)) {
                    child.node.textContent += originalWord;
                }
            }

            // report('DEFAULT TEXTCONTENT: ' + child.node.textContent);
            break;
        }

        return child;
    }

}

function addSection(sectionType, title, child, options) {
    var stackName = sectionType;
    var chapterType = '';
    //var title = title.replace(/^\n*/g, '').replace(/\n*$/g, '');
    // report('ADDING SECTION: '+ sectionType + ' ' + title + ' ' + child.node.nodeName);
    switch(sectionType) {
        case 'subsubsection':
        child = child.closeTo(RegExp('^(subsection|section|chapter|course|root)$', 'i'));
        if (!(child.node.nodeName.match(/^subsection$/i))) {
            child = addSection('subsection', '', child, options).closeTo(RegExp('^subsection$', 'i'));
        }
        break;
        case 'subsection':
        child = child.closeTo(RegExp('^(section|chapter|course|root)$', 'i'));
        if (!(child.node.nodeName.match(/^section$/i))) {
            child = addSection('section', '', child, options).closeTo(RegExp('^section$', 'i'));
        }
        break;
        case 'section':
        child = child.closeTo(RegExp('^(chapter|course|root)$', 'i'));
        if (!(child.node.nodeName.match(/^chapter$/i))) {
            child = addSection('chapter', '', child, options).closeTo(RegExp('^chapter$', 'i'));
        }
        break;
        case 'week':
        case 'lecture':
        case 'chapter':
        child = child.closeTo(RegExp('course|root', 'i'));
        if (!(child.node.nodeName.match(/course/i))) {
            child = addSection('course', '', child, options).closeTo(RegExp('course', 'i'));
        }
        stackName = 'chapter';
        break;
        case 'course':
        child = child.closeTo(/root/i);
        break;
    }

    child = child.addChild(stackName);
    if (!stackName.match(/section/i)) {
        child.node.setAttribute('type', stackName.charAt(0).toUpperCase() + stackName.slice(1));
    } else {
        child.node.setAttribute('type', 'Section');
    }
    if (sectionType.match(/chapter|week|lecture/i)) {
        child.node.setAttribute('chapter_type', sectionType.charAt(0).toUpperCase() + sectionType.slice(1));
    }


    child.node.setAttribute("wbtag", sectionType);
    if(stackName.match(/week|lecture|chapter/)) {
        secNums['statement'] = 1;
        child.node.setAttribute("num", secNums[stackName]++);
    }

    if (((typeof title != typeof undefined) && title != '' && title != null) || stackName.match(/chapter|course/i)) {
        child.node.setAttribute("title", title.replace(/[^a-zÀ-ÿ0-9\s\-]/ig,''));
        child = child.addChild('title');
        child.node.textContent = title;
        child.node.setAttribute("wbtag", sectionType);
        child.node.setAttribute("scope", stackName);
        child = child.closeTo(RegExp(stackName, 'i'));
    }

    child.loadOptions(options);
    child = child.addChild('slides').addChild('slide');
    child.node.setAttribute("canon_num", secNums['slide']);
    child.node.setAttribute("scope", sectionType);
    // child.node.setAttribute("custom_num", 'none');
    secNums['slide']++;
    return child;
}
