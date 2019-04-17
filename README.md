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

3. A frontend web-browser-oriented presentation system.  
   * It supports keyword/theorem/section hyper-referencing. 
   * It features an Ace editor so users may directly render wb code to cranach and simultaneously to the browser frontend.
   * Users may export cranach file to LaTeX with a click on a button.
   * It has preliminary support for rendering latexml documents.

The project currently works on browsers with XSLTProcessor support, such as Chrome, Safari, and Firefox.

## Musings

The author of this project is not a professional programmer.  The published code is at best an amateur effort.  This project is initiated partly to reflect the author's views on the features of a proper scientific document system.  Namely:
   
   * A proper delineation between semantics and representation.
   * Ease of use while retaining semantic support. For example, each new section in the document may be indicated with      "@section{SECTIONAME}" but also with <h3>    SECTIONNAME    </h3>.
   * The document should be stored in both human-readable format.  It should be also be readable by machine in a way that semantic information may be easily extracted.
   * In the author's view there is a down side to having *too many* features in a typesetting system.  If possible user-defined macros should be kept to a minimum.
   * XML is a powerful language, but its demand on well-formedness may prove too uncomfortable for most casual document preparers.  A "middle-man" language like Wb is meant to ensure that the resulting XML document is well-formed, that no open tag is left unclosed.  Machines should serve humans, not the other way round.
   
