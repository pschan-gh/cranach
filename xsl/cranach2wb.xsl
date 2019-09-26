<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xh="http://www.w3.org/1999/xhtml"
    xmlns:lv="http://www.math.cuhk.edu.hk/~pschan/cranach"
    xmlns:m     = "http://www.w3.org/1998/Math/MathML"
    exclude-result-prefixes="xh"
    >

    <xsl:preserve-space elements="xh:*"/>
    <!-- <xsl:strip-space elements="*"/> -->
    <xsl:output method="xml" />

    <xsl:template match="/">
        <xsl:apply-templates select="lv:document" />
    </xsl:template>

    <xsl:template match="lv:document">
        <xsl:apply-templates select="*|text()" />
    </xsl:template>

    <xsl:template match="lv:keywords" />
    <xsl:template match="lv:title" />

    <xsl:template match="lv:slides" >
        <xsl:apply-templates select="*|text()" />
    </xsl:template>

    <xsl:template match="lv:slide[not(@wbtag)]">
      <xsl:apply-templates select="*[not(self::lv:topic)]|text()" />
    </xsl:template>

    <xsl:template match="lv:slide[@wbtag]" >
        <xsl:value-of select="concat('&#xa;', '@', name(), '&#xa;')" />
        <xsl:apply-templates select="*|text()" />
    </xsl:template>

    <xsl:template match="lv:qed" >
        <xsl:value-of select="concat('&#xa;', '@', name(), '&#xa;')" />
    </xsl:template>

    <xsl:template match="lv:col|lv:newcol" >
        <xsl:value-of select="concat('&#xa;', '@', name())" />
        <xsl:apply-templates select="*|text()" />
        <xsl:text>&#xa;@endcol</xsl:text>
    </xsl:template>

    <xsl:template match="lv:collapse" >
      <xsl:text>&#xa;@col&#xa;</xsl:text>
        <xsl:apply-templates select="*|text()" />
    </xsl:template>

    <xsl:template match="lv:statement|lv:substatement">
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@', @wbtag)"/>
        <xsl:choose>
            <xsl:when test="@label!=''">
                <xsl:text>&#xa;</xsl:text>
                <xsl:value-of select="concat('@label{', @label, '}')"/>
            </xsl:when>
        </xsl:choose>
        <xsl:choose>
            <xsl:when test="./lv:title">
                <xsl:text>&#xa;</xsl:text>
                <xsl:value-of select="concat('@title{', ./lv:title/text(), '}')"/>
            </xsl:when>
        </xsl:choose>
        <xsl:text>&#xa;</xsl:text>
        <xsl:apply-templates select="*[not(self::lv:title)]|text()" />
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@end</xsl:text>
    </xsl:template>

    <xsl:template match="lv:steps">
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@', @wbtag)"/>
        <xsl:text>&#xa;</xsl:text>
        <xsl:apply-templates select="*|text()" />
        <xsl:text>@endsteps</xsl:text>
        <xsl:text>&#xa;</xsl:text>
    </xsl:template>

    <xsl:template match="lv:col_ul">
        <xsl:text>&#xa;@ul</xsl:text>
        <xsl:apply-templates select="*|text()" />
        <xsl:text>&#xa;@endul</xsl:text>
    </xsl:template>
    <xsl:template match="lv:col_ol">
        <xsl:text>&#xa;@ol</xsl:text>
        <xsl:apply-templates select="*|text()" />
        <xsl:text>&#xa;@endol</xsl:text>
    </xsl:template>
    <xsl:template match="lv:col_li">
        <xsl:text>&#xa;@li&#xa;</xsl:text>
        <xsl:apply-templates select="*|text()" />
    </xsl:template>

    <xsl:template match="lv:itemize|lv:enumerate">
      <xsl:value-of select="concat('&#xa;', '@', local-name())"/>
      <xsl:apply-templates select="*|text()" />
      <xsl:value-of select="concat('&#xa;', '@end', local-name())"/>
    </xsl:template>

    <xsl:template match="lv:item">
      <xsl:value-of select="concat('&#xa;', '@', local-name(), '&#xa;')"/>
      <xsl:apply-templates select="*|text()" />
    </xsl:template>


    <xsl:template match="lv:webwork">
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@', name(), '{', @pg_file , '}')"/>
    </xsl:template>

    <xsl:template match="lv:wb_image">
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@image', '{', @data-src , '}')"/>
    </xsl:template>

    <xsl:template match="lv:hc_keyword">
        <xsl:value-of select="concat('@', 'keyword', '{')" /><xsl:value-of select="."/><xsl:text>} </xsl:text>
    </xsl:template>

    <xsl:template match="lv:ref">
        <xsl:value-of select="concat(' @ref{', @label, '}')"/>
    </xsl:template>


    <xsl:template match="lv:course|lv:chapter|lv:section|lv:subsection|lv:subsubsection">
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@</xsl:text>
        <xsl:value-of select="@wbtag"/>
        <xsl:if test="./lv:title">
            <xsl:text>{</xsl:text>
            <xsl:value-of select="lv:title/text()"/>
            <xsl:text>}</xsl:text>
        </xsl:if>
        <xsl:apply-templates select="*|text()" />
    </xsl:template>

    <xsl:template match="lv:setchapter|lv:href">
        <xsl:value-of select="concat('@', @wbtag, '{', @argument, '}')"/>
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
    </xsl:template>

    <xsl:template match="lv:topic">
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@topic</xsl:text>
        <xsl:text>{</xsl:text>
        <xsl:value-of select="text()"/>
        <xsl:text>}</xsl:text>
    </xsl:template>

    <xsl:template match="lv:chapter[@wbtag='week' or @wbtag='lecture']">
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@</xsl:text>
        <xsl:value-of select="@wbtag"/>
        <xsl:if test="@num">
            <xsl:text>{</xsl:text>
            <xsl:value-of select="@num"/>
            <xsl:text>}</xsl:text>
        </xsl:if>
        <xsl:text>&#xa;</xsl:text>
        <xsl:apply-templates select="*|text()" />
    </xsl:template>

    <xsl:template match="xh:li|xh:hr">
        <xsl:text>&#xa;</xsl:text>
        <xsl:element name="{local-name()}">
            <xsl:copy-of select="@*[name(.)!='environment']"/>
            <xsl:apply-templates select="*|text()" />
        </xsl:element>
    </xsl:template>

    <xsl:template match="xh:*[not(@class='escaped') and not(@wbtag='newline') and not(self::xh:li) and not(self::xh:hr)]">
        <xsl:element name="{local-name()}">
            <xsl:copy-of select="@*[name(.)!='environment']"/>
            <xsl:apply-templates select="*|text()" />
        </xsl:element>
    </xsl:template>

    <xsl:template match="xh:span[@class='escaped']" >
        <xsl:value-of select="concat('@', text())"/>
    </xsl:template>

    <xsl:template match="xh:br[@wbtag='newline']|lv:newline">
        <xsl:text>&#xa;</xsl:text>
        <xsl:text>@newline</xsl:text>
        <xsl:text>&#xa;</xsl:text>
    </xsl:template>

    <xsl:template match="lv:center|lv:left|lv:right" >
        <xsl:value-of select="concat('&#xa;', '@', @wbtag)"/>
        <xsl:apply-templates select="*|text()" />
        <xsl:value-of select="concat('&#xa;', '@end', @wbtag)"/>
    </xsl:template>

    <xsl:template match="text()" >
        <xsl:value-of select="." />
        <!-- <xsl:value-of select="." disable-output-escaping="yes"/> -->
    </xsl:template>

    <xsl:template match="comment()" >
        <xsl:comment>
            <xsl:value-of select="." />
        </xsl:comment>
    </xsl:template>

</xsl:stylesheet>
