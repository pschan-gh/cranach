<?php
$actual_link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
$id = uniqid();
?>
<html>
<head>
    <!-- 
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
    --> 
    <script src="js/jquery.min.js"/>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.min.js" integrity="sha256-u6BamZiW5tCemje2nrteKC2KoLIKX9lKPSpvCkOhamw=" crossorigin="anonymous"></script>
    <script type="text/javascript" src="weaver_core.js"></script>
    <script type="text/javascript" src="weaver.js"></script>
    <script type="text/javascript" src="cranach_bare.js"></script>
        <script type="text/x-mathjax-config">
      MathJax.Hub.Config({
      skipStartupTypeset: false,
      tex2jax: {
      inlineMath: [['$','$'], ['\\(','\\)']],
      processEnvironments: true,
      processEscapes: true,
      ignoreClass: "tex2jax_ignore"
      },
      MathML: {
      extensions: ["content-mathml.js"]
      },
      TeX: {
      equationNumbers: {autoNumber: "ams"}
      }
     });
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML" type="text/javascript"></script>
</head>
<body>
    <div id="query_container_<?php echo $id; ?>">
    </div>
</body>

<script type="text/javascript">
// var fullURL = top.location.href;
var fullURL = decodeURIComponent('<?php echo rawurlencode($actual_link); ?>');
var $jq = jQuery.noConflict();
var baseURL = fullURL.replace(/cranach_bare\.php/, '').replace(/&query=.*?$/, '').replace(/\#$/, '');

var cranach_bare = new Cranach(baseURL, '<?php echo $id; ?>');
console.log(cranach_bare.baseURL);
console.log('ID: ' + cranach_bare.id);
console.log('FULL URL: ' + fullURL);
var urlParams = new URLSearchParams(fullURL.match(/\?(.*?)$/)[1]);
console.log(urlParams.toString());
if(urlParams.has('wb') || urlParams.has('xml')) {
    var pathname = urlParams.has('wb') ? urlParams.get('wb') : urlParams.get('xml');
    var dir = pathname.match(/(^.*)\/(?:.*?)\.(?:wb|xml)/)[1];
    console.log('DIR: ' + dir);
    cranach_bare.attr['dir'] = dir;
    cranach_bare.hasWb = urlParams.has('wb');
    cranach_bare.hasXML = urlParams.has('xml');

    if (urlParams.has('wb')) {
        cranach_bare.attr['wbPath'] = pathname;
    } else {
        cranach_bare.attr['xmlPath'] = pathname;
    }

    if (urlParams.has('query')) {
        console.log('HAS QUERY');
        var query = urlParams.get('query');
        console.log('QUERY: ' + query);
        cranach_bare.hasQuery = true;
        cranach_bare.attr['query'] = query;
    }
}
cranach_bare.render();
$jq(function() {
    MathJax.Hub.Queue(
        ["Typeset", MathJax.Hub, document]
    );
});
</script>
</html>
