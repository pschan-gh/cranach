MathJax = {
	startup: {
		typeset: false,
		ready() {
			typeset = function (doms) {
				MathJax.startup.promise = MathJax.startup.promise
				.then(() => {return MathJax.typesetPromise(doms)})
				.catch((err) => console.log('Typeset failed: ' + err.message));
				return MathJax.startup.promise;
			};
			MathJax.getAllJax = function (name) {
				let list = Array.from(MathJax.startup.document.math);
				if (!name) return list;
				let container = document.getElementById(name);
				if (!container) return list;
				let filtered = list.filter((node) => container.contains(node.start.node));
				return filtered;
			};
			MathJax.startup.defaultReady();
			MathJax.startup.promise.then(() => {
		        console.log('MathJax initial typesetting complete');
		        // let cranach is now a promise
		        $('.icon.latex, .icon.xml').hide();
		        baseRenderer = new Cranach(window.location.href).setup().then(cranach => {
		            let output = cranach.bare ?  $('body')[0] : document.getElementById('output');
		            return cranach.render(output)
		            .then(renderer => {
		                if (renderer.bare) {
		                    return renderer;
		                }
		                return renderer.displayIndexDocToHtml(document.getElementById('index'))
		                .then(renderer => {
		                    if (renderer.bare) {
		                        return renderer;
		                    }
		                    postprocess(renderer);
		                    convertCranachDocToWb(renderer.attr['cranachDoc'], editor);
		                    $('#render_sel').prop('disabled', false);
		                    $('#wb_button').prop('disabled', false);
		                    return renderer;
		                })
		            });
		        });
		    });	
		}
	},
	loader: {
		load: ['output/svg', '[tex]/ams', '[tex]/newcommand', '[tex]/html', '[tex]/extpfeil', '[tex]/color', '[tex]/mathtools']
	},
	tex: {
		inlineMath: [['$','$'], ['\\(','\\)']],
		processEnvironments: true,
		processEscapes: true,
		processRefs: true,
		tags: "ams",
		packages: ['base', 'ams', 'newcommand', 'html', 'extpfeil', 'color', 'mathtools']
	},
	options: {
		ignoreHtmlClass: "tex2jax_ignore",
		skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'annotation', 'annotation-xml']
	},
	svg: {
		scale: 1,                      // global scaling factor for all expressions
		minScale: .5,                  // smallest scaling factor to use
		mtextInheritFont: false,       // true to make mtext elements use surrounding font
		merrorInheritFont: true,       // true to make merror text use surrounding font
		mathmlSpacing: false,          // true for MathML spacing rules, false for TeX rules
		skipAttributes: {},            // RFDa and other attributes NOT to copy to the output
		exFactor: .5,                  // default size of ex in em units
		displayAlign: 'center',        // default for indentalign when set to 'auto'
		displayIndent: '0',            // default for indentshift when set to 'auto'
		fontCache: 'local',            // or 'global' or 'none'
		localID: null,                 // ID to use for local font cache (for single equation processing)
		internalSpeechTitles: true,    // insert <title> tags with speech content
		titleID: 0                     // initial id number to use for aria-labeledby titles
	}
};