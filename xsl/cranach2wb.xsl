<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xh="http://www.w3.org/1999/xhtml"
    xmlns:lv="http://www.math.cuhk.edu.hk/~pschan/cranach"
    xmlns:m     = "http://www.w3.org/1998/Math/MathML"
    exclude-result-prefixes="xh"
    >

    <xsl:strip-space elements="xh:* lv:title lv:*"/>
    <xsl:preserve-space elements="xh:textarea xh:pre lv:paragraphs"/>
    <xsl:output method="xml" />

    <xsl:template match="/">
        <xsl:apply-templates select="lv:document" />
    </xsl:template>

    <xsl:template match="lv:document">
        <xsl:apply-templates select="*" />
    </xsl:template>

    <xsl:template match="lv:keywords" />

    <xsl:template match="lv:title">
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@title{</xsl:text>
        <xsl:apply-templates select="*|text()" />
        <xsl:text>}</xsl:text>
    </xsl:template>

    <xsl:template match="lv:slides" >
        <xsl:apply-templates select="*" />
    </xsl:template>

    <xsl:template match="lv:slide[not(@wbtag)]">
      <xsl:apply-templates select="*[not(self::lv:topic) and not(self::lv:title)]" />
    </xsl:template>

    <xsl:template match="lv:slide[@wbtag]" >
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@', name())" />
        <xsl:if test="@data-lecture-skip='true'">
            <xsl:text>&#xa;</xsl:text>
            <xsl:text>@skip</xsl:text>
        </xsl:if>
        <xsl:apply-templates select="*" />
    </xsl:template>

    <xsl:template match="lv:qed" >
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@', name())" />
    </xsl:template>

    <xsl:template match="lv:col|lv:newcol" >
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@', name())" />
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:apply-templates select="*|text()" />
        <xsl:text>&#xa;@endcol</xsl:text>
    </xsl:template>

    <xsl:template match="lv:collapse" >
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@col</xsl:text>
        <xsl:apply-templates select="*|text()" />
    </xsl:template>

    <xsl:template match="lv:statement|lv:substatement">
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@', @wbtag)"/>
        <xsl:if test="@data-lecture-skip='true'">
            <xsl:text>&#xa;</xsl:text>
            <xsl:text>@skip</xsl:text>
        </xsl:if>
        <!-- <xsl:choose> -->
            <!-- <xsl:if test="./lv:title"> -->
                <!-- <xsl:text>&#xa;</xsl:text>
                <xsl:text>@title{</xsl:text> -->
                <!-- <xsl:value-of select="concat('@title{', ./lv:title/text(), '}')"/> -->
                <!-- <xsl:apply-templates select="./lv:title/*|./lv:title/text()" /> -->
                <!-- <xsl:apply-templates select="./lv:title" /> -->
                <!-- <xsl:text>}</xsl:text> -->
                <!-- <xsl:text>&#xa;</xsl:text> -->
            <!-- </xsl:if>             -->
        <!-- </xsl:choose> -->
        <xsl:apply-templates select="./lv:title" />
        <xsl:apply-templates select="*[not(self::lv:title)]" />
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@end</xsl:text>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>

    <xsl:template match="lv:of-title"/>

    <xsl:template match="lv:steps">
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@', @wbtag)"/>
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:apply-templates select="*|text()" />
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@endsteps</xsl:text>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>

    <xsl:template match="lv:col_ul">
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@ul</xsl:text>
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:apply-templates select="*|text()" />
        <xsl:text>&#xa;@endul</xsl:text>
    </xsl:template>
    <xsl:template match="lv:col_ol">
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@ol</xsl:text>
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:apply-templates select="*|text()" />
        <xsl:text>&#xa;@endol</xsl:text>
    </xsl:template>
    <xsl:template match="lv:col_li">
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@li</xsl:text>
        <xsl:apply-templates select="*|text()" />
    </xsl:template>

    <xsl:template match="lv:itemize|lv:enumerate">
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@', local-name())"/>
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:apply-templates select="*|text()" />
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@end', local-name())"/>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>

    <xsl:template match="lv:item">
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@', local-name())"/>
        <xsl:apply-templates select="*|text()" />
    </xsl:template>


    <xsl:template match="lv:webwork">
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@', name(), '{', @pg_file , '}')"/>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>

    <xsl:template match="lv:wb_image">
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@image', '{', @data-src , '}')"/>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>
    <xsl:template match="lv:image">
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@image', '{', @data-src , '}')"/>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>
    <xsl:template match="lv:figure">
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@', @wbtag)"/>
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:choose>
            <xsl:when test="./lv:caption">
                <xsl:text>&#xa;</xsl:text>
                <xsl:text>@caption{</xsl:text>
                <xsl:apply-templates select="./lv:caption/*|./lv:caption/text()" />
                <xsl:text>}</xsl:text>                
            </xsl:when>
        </xsl:choose>
        <xsl:apply-templates select="*[not(self::lv:caption)]" />
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@end</xsl:text>
    </xsl:template>

    <xsl:template match="lv:ref">
        <xsl:value-of select="concat('@ref{', @label, '}')"/>
    </xsl:template>

    <xsl:template match="lv:course|lv:chapter|lv:section|lv:subsection|lv:subsubsection">
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@</xsl:text>
        <xsl:value-of select="@wbtag"/>
        <xsl:text>{</xsl:text>
        <xsl:apply-templates select="./lv:title/*|./lv:title/text()" />
        <xsl:text>}</xsl:text>
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:apply-templates select="*[not(self::lv:title)]" />
    </xsl:template>

    <xsl:template match="lv:setchapter|lv:href">
        <xsl:if test="parent::*[@wbtag]">
            <xsl:text>&#xa;</xsl:text>
        </xsl:if>
        <xsl:value-of select="concat('@', @wbtag, '{', @argument, '}')"/>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>

    <xsl:template match="lv:bare">
        <xsl:apply-templates select="*|text()" />
    </xsl:template>

    <xsl:template match="lv:label">
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@label</xsl:text>
        <xsl:text>{</xsl:text>
        <xsl:value-of select="@name"/>
        <xsl:text>}</xsl:text>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>

    <xsl:template match="lv:topic">
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@topic</xsl:text>
        <xsl:text>{</xsl:text>
        <xsl:value-of select="text()"/>
        <xsl:text>}</xsl:text>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>


    <xsl:template match="lv:chapter[@wbtag='week' or @wbtag='lecture']">
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@</xsl:text>
        <xsl:value-of select="@wbtag"/>
        <xsl:choose>
            <xsl:when test="@num">
                <xsl:text>{</xsl:text>
                <xsl:value-of select="@num"/>
                <xsl:text>}</xsl:text>
            </xsl:when>
        </xsl:choose>
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:apply-templates select="*|text()" />
    </xsl:template>

    <xsl:template match="lv:escaped" >
        <xsl:value-of select="concat('@escaped{', @argument, '}')"/>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>

    <xsl:template match="lv:inline_keyword" >
        <xsl:if test="not(preceding-sibling::lv:paragraphs) and not(preceding-sibling::xh:*)">
            <xsl:text>&#xa;</xsl:text>
        </xsl:if>
        <xsl:value-of select="concat('@keyword{', ./text(), '}')"/>
    </xsl:template>

    <xsl:template match="lv:hc_keyword">
        <xsl:if test="not(preceding-sibling::lv:paragraphs) and not(preceding-sibling::xh:*)">
            <xsl:text>&#xa;</xsl:text>
        </xsl:if>
        <xsl:value-of select="concat('@keyword*{', ./text(), '}')"/>
    </xsl:template>


    <xsl:template match="xh:li|xh:hr">
        <xsl:text>&#xa;</xsl:text>
        <xsl:element name="{local-name()}">
            <xsl:copy-of select="@*[name(.)!='environment']"/>
            <xsl:apply-templates select="*|text()" />
        </xsl:element>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>

    <xsl:template match="xh:*[not(@class='escaped') and not(@wbtag='newline') and not(self::xh:li) and not(self::xh:hr)]">
        <xsl:if test="not(preceding-sibling::lv:paragraphs) and not(preceding-sibling::xh:*)">
            <xsl:text>&#xa;</xsl:text>
        </xsl:if>
        <xsl:element name="{local-name()}">
            <xsl:copy-of select="@*[name(.)!='environment' and name(.)!='text']"/>
            <xsl:apply-templates select="*|text()" />
        </xsl:element>
        <!-- <xsl:if test="not(following-sibling::lv:inline_keyword) and not(following-sibling::lv:ref) and following-sibling::*[@wbtag]">
            <xsl:text>&#xa;</xsl:text>
        </xsl:if> -->
    </xsl:template>

    <xsl:template match="*[@wbtag='paragraphs']|lv:paragraphs">
        <xsl:if test="(parent::*[@wbtag] or parent::lv:slide or preceding-sibling::*[@wbtag]) and not(preceding-sibling::lv:inline_keyword) and not(preceding-sibling::*[@wbtag='ref']) and not(preceding-sibling::xh:i) and not(preceding-sibling::xh:em) and not(preceding-sibling::xh:b) and not(preceding-sibling::xh:strong) and not(parent::lv:title)">
            <xsl:text>&#xa;</xsl:text>
        </xsl:if>
        <!-- <xsl:apply-templates select="*|text()|comment()" /> -->
        <xsl:apply-templates select="text()" />
    </xsl:template>
    
    <xsl:template match="lv:comment">
        <xsl:text>&#xa;&lt;!--</xsl:text>
        <xsl:apply-templates select="*|text()" />
        <xsl:text>--&gt;&#xa;</xsl:text>
    </xsl:template>


    <xsl:template match="xh:span[@class='escaped']" >
        <xsl:text>@</xsl:text>
        <xsl:apply-templates select="*|text()" />
        <xsl:value-of select="concat('@', text())"/>
    </xsl:template>

    <xsl:template match="xh:br[@wbtag='newline']|lv:newline|xh:newline|newline">
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@newline</xsl:text>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>

    <xsl:template match="lv:center|lv:left|lv:right" >
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@', @wbtag)"/>
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:apply-templates select="*|text()" />
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@end', @wbtag)"/>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>

    <xsl:template match="xh:table[contains(@class, 'ltx_eqn_table')]">
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>\begin{align*}&#10;</xsl:text>
        <xsl:for-each select=".//xh:tr">
            <xsl:for-each select="./xh:td[position()!=last()]">
                <xsl:if test="position() != 1 and position() != 2">
                    <xsl:text>&amp;</xsl:text>
                </xsl:if>
                <xsl:variable name="length" select="string-length(.//text())"/>
                <xsl:value-of select="substring(.//text(),2,($length - 2))"/>
            </xsl:for-each>
            <xsl:if test="position()!=last()"> \\&#10;</xsl:if>
        </xsl:for-each>
        <xsl:text>&#10;\end{align*}&#10;</xsl:text>
    </xsl:template>

    <xsl:template match="text()" >
        <!-- <xsl:value-of select="normalize-space(.)" /> -->
        <xsl:value-of select="." />
        <!-- <xsl:value-of select="." disable-output-escaping="yes"/> -->
    </xsl:template>

    <xsl:template match="comment()" >
        <xsl:comment>
            <xsl:value-of select="." />
        </xsl:comment>
    </xsl:template>

</xsl:stylesheet>
