# Cranach

The project aims to develop a scientific document system with the following components:

1. An XML-based document format (referred to as "cranach"), which stores both presentational *and* semantic information.  
    * Actual presentation is controlled by a separate XML stylesheet which is included in Item 3 (see below) or may be custom-provided.
    * It aims to support direct inclusion of HTML5 elements.
    * It aims to support direct inclusion of MathML elements, both presentational and semantic.

2. A high-level functional language (called "wb") which facilitates the creation of cranach files.
   * It is expected to readily accept LaTeX math typesetting commands and raw html elements.
   * Its syntax is designed to be easily mastered by users already moderately-versed in LaTeX.
   * Each wb file has no preamble, so multiple files may be concatenated seamlessly to form a larger wb file.
   * Each theorem-like statement is assigned an MD5 key generated from its content to facilitate labelling and referencing.

3. A web-browser-based presentation system.  
   * It supports keyword/theorem/section hyper-referencing. 
   * It features an Ace editor so users may directly render wb code to Cranach and simultaneously to the browser frontend.
   * Users may export Cranach files to LaTeX with a click on a button.  This is a work in progress, many latex features, in particular        the inclusion of figures, have not been implemented.
   * It has preliminary support for rendering latexml (https://dlmf.nist.gov/LaTeXML/) documents.

The project currently works on browsers with XSLTProcessor support, such as Chrome, Safari, and Firefox.

## Musings

The author of this project is not a professional programmer.  The published code is at best an amateur effort.  This project is initiated partly to reflect the author's views on the features of a proper scientific document system.  Namely:
   
   * A proper delineation between semantics and representation.
   * Ease of use while retaining semantic support.
   * The document should be stored in human-readable format.  It should also be readable by machine in a way that semantic information      may be easily extracted.
   * The rendering and viewing of the document should require no dedicated software beyond most widely distributed web browsers.         
   * XML is a powerful language, but its demand on well-formedness may prove too discouraging to the casual document preparer (who no doubt has other priorities such as teaching and research). A "middle-man" language like Wb is meant to ensure that the resulting XML document is well-formed, that no open tag is left unclosed. Machines should serve humans, not the other way round.
   * The full range of of XML features, such as xpath, should be taken advantage of. 
   
