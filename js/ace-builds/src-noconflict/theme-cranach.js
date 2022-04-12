ace.define("ace/theme/cranach",[], function(require, exports, module) {

exports.isDark = false;
exports.cssClass = "ace-cranach";
exports.cssText = ".ace-cranach .ace_gutter {\
background: #55626c;\
color: #bbb\
}\
.ace-cranach .ace_print-margin {\
width: 1px;\
background: #e8e8e8\
}\
.ace-cranach {\
    background: #55626c;\
    color: #ddd;\
    font-family: inherit;\
}\
.ace-cranach .ace_cursor {\
    color:#fff;\
\/*border-left: 5px solid #fff\ *\/\
}\
.ace-cranach .ace_overwrite-cursors .ace_cursor {\
    color:#fff;\
border-left: 0px;\
border-bottom: 5px solid #fff\
}\
.ace-cranach .ace_marker-layer .ace_selection {\
background: hsla(0,0%,100%,0.25)\
}\
.ace-cranach.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #f3f2f3;\
}\
.ace-cranach .ace_marker-layer .ace_step {\
background: rgb(198, 219, 174)\
}\
.ace-cranach .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid rgba(0, 0, 0, 0.33);\
}\
.ace-cranach .ace_marker-layer .ace_active-line {\
background: rgba(232, 242, 254, 0.15)\
}\
.ace-cranach .ace_gutter-active-line {\
background-color: rgba(232, 242, 254, 0.15)\
}\
.ace-cranach .ace_marker-layer .ace_selected-word {\
border: 1px solid rgba(100, 50, 208, 0.27)\
}\
.ace-cranach .ace_invisible {\
color: #BFBFBF\
}\
.ace-cranach .ace_fold {\
background-color: rgba(2, 95, 73, 0.97);\
border-color: rgba(15, 0, 9, 1.0)\
}\
.ace-cranach .ace_wbtag {\
color: #bfb;\
font-weight: 100;\
}\
.ace_wbkeyword {\
color: #ffb;\
}\
.ace-cranach .ace_sep {\
color: #000;\
background-color: #fbb;\
}\
.ace-cranach .ace_sep::before {\
    content: '';\
    position:absolute;\
    clear:left;\
    width: 100%;\
    display:inline-block;\
    border-bottom: 2.5px dotted #fbb\
}\
.ace-cranach .ace_col {\
color: #0ef;\
}\
.ace-cranach .ace_col::before {\
}\
.ace-cranach .ace_keyword {\
color: #baf;\
rbackground-color: rgba(163, 170, 216, 0.055)\
}\
.ace-cranach .ace_constant.ace_language {\
color: #baf;\
rbackground-color: rgba(189, 190, 130, 0.059)\
}\
.ace-cranach .ace_constant.ace_numeric {\
color: #baf;\
rbackground-color: rgba(119, 194, 187, 0.059)\
}\
.ace-cranach .ace_constant.ace_character,\
.ace-cranach .ace_constant.ace_other {\
color: #baf;\
rbackground-color: rgba(127, 34, 153, 0.063)\
}\
.ace-cranach .ace_support.ace_function {\
color: #baf;\
rbackground-color: rgba(189, 190, 130, 0.039)\
}\
.ace-cranach .ace_support.ace_class {\
color: #baf;\
rbackground-color: rgba(239, 106, 167, 0.063)\
}\
.ace-cranach .ace_storage {\
color: #baf;\
rbackground-color: rgba(139, 93, 223, 0.051)\
}\
.ace-cranach .ace_invalid {\
color: #DFDFD5;\
rbackground-color: #CC1B27\
}\
.ace-cranach .ace_latex {\
    font-family: inherit;\
color: #ebb;\
rbackground-color: rgba(170, 175, 219, 0.035)\
}\
.ace-cranach .ace_comment {\
font-family: inherit;\
color: #ebb;\
text-decoration: line-through;\
rbackground-color: rgba(95, 15, 255, 0.0078)\
}\
.ace-cranach .ace_entity.ace_name.ace_function,\
.ace-cranach .ace_variable {\
color: #bbb;\
rbackground-color: rgba(34, 255, 73, 0.12)\
}\
.ace-cranach .ace_variable.ace_language {\
color: #316fcf;\
rbackground-color: rgba(58, 175, 255, 0.039)\
}\
.ace-cranach .ace_variable.ace_parameter {\
font-style: italic;\
color: #0ff;\
rbackground-color: rgba(5, 214, 249, 0.043)\
}\
.ace-cranach .ace_entity.ace_other.ace_attribute-name {\
color: rgba(73, 70, 194, 0.93);\
rbackground-color: rgba(73, 134, 194, 0.035)\
}\
.ace-cranach .ace_entity.ace_name.ace_tag {\
color: #3976a2;\
rbackground-color: rgba(73, 166, 210, 0.039)\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
                (function() {
                    ace.require(["ace/theme/cranach"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
