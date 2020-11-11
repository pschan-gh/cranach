# Cranach

The project aims to develop a scientific document system
which works out-of-the-box for rapid slideshow preparation and presentation.

It's designed mainly for Math and Science educators already well-versed in LaTeX.

It has the following components:

1. An lightweight XML-based document format (referred to as "cranach"), which aims to store both presentational and semantic information.  
    * Actual presentation is controlled by a separate XML stylesheet which is included in Item 3 (see below) or may be custom-provided.
    * It aims to support direct inclusion of HTML5 elements.
    * It aims to support direct inclusion of MathML elements, both presentational and semantic.

2. A high-level functional language (called "wb") which facilitates the creation of cranach files.
   * It is expected to readily accept LaTeX math typesetting commands and raw html elements.
   * Its syntax is designed to be easily mastered by users already moderately-versed in LaTeX.
   * Each wb file has no preamble, so multiple files may be concatenated seamlessly to form a larger wb file.
   * Each theorem-like statement is assigned an MD5 key generated from its content to facilitate labelling and referencing.

3. A frontend web-browser-oriented presentational system.  
   * It supports keyword/theorem/section hyper-referencing.
   * It features an Ace editor so users may directly render wb code to cranach and simultaneously to the browser frontend.
   * Users may export cranach file to LaTeX with a click on a button.
   * It has preliminary support for rendering latexml documents.
   * A significant portion of the frontend is devoted to presenting slideshows.

The project currently works on browsers with XSLTProcessor support, such as Chrome, Safari, and Firefox.
