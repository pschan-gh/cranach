<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xh="http://www.w3.org/1999/xhtml"
    >
    <!-- xmlns:xh="https://www.w3.org/TR/html51/" -->
    <!-- xmlns:xh="http://www.w3.org/1999/xhtml" -->

    <!-- <xsl:strip-space elements="lv:*"/> -->

    <xsl:preserve-space elements="xh:pre"/>

    <xsl:output method="xml" />

    <xsl:template match="/">
        <xsl:for-each select="//slides/slide">
            <xsl:if test="position() != 1">
                <xsl:text>&#xa;</xsl:text>
            </xsl:if>
            <xsl:if test="@wbtag='slide'">
                <xsl:text>@slide&#xa;</xsl:text>
            </xsl:if>
            <xsl:apply-templates select="*|text()" />
        </xsl:for-each>
    </xsl:template>

    <xsl:template match="paragraphs" >
        <xsl:apply-templates select="*|text()" />
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>

    <xsl:template match="center|left|right" >
        <xsl:value-of select="concat('&#xa;', '@', @wbtag)"/>
        <xsl:apply-templates select="*|text()" />
        <xsl:value-of select="concat('&#xa;', '@end', @wbtag)"/>
    </xsl:template>

    <xsl:template match="col|newcol" >
        <xsl:value-of select="concat('&#xa;', '@', name())" />
        <xsl:text>&#xa;</xsl:text>
        <xsl:apply-templates select="*|text()" />
        <xsl:text>&#xa;@endcol&#xa;</xsl:text>
    </xsl:template>

    <xsl:template match="collapse" >
      <xsl:text>&#xa;@col&#xa;</xsl:text>
        <xsl:apply-templates select="*|text()" />
    </xsl:template>

    <xsl:template match="statement|substatement">
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@', @wbtag)"/>
        <xsl:text>&#xa;</xsl:text>
        <xsl:apply-templates select="*|text()" />
        <xsl:text>@end</xsl:text>
        <xsl:text>&#xa;</xsl:text>
    </xsl:template>


    <xsl:template match="title">
        <xsl:text>&#xa;@title</xsl:text>
        <xsl:apply-templates select="*|text()" />
        <xsl:text>&#xa;@endtitle&#xa;</xsl:text>
    </xsl:template>

    <xsl:template match="steps">
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@', @wbtag)"/>
        <xsl:text>&#xa;</xsl:text>
        <xsl:apply-templates select="*|text()" />
        <xsl:text>@endsteps</xsl:text>
        <xsl:text>&#xa;</xsl:text>
    </xsl:template>

    <xsl:template match="col_ul">
        <xsl:text> @ul&#xa;</xsl:text>
        <xsl:apply-templates select="*|text()" />
        <xsl:text>@endul&#xa;</xsl:text>
    </xsl:template>

    <xsl:template match="col_ol">
        <xsl:text> @ol&#xa;</xsl:text>
        <xsl:apply-templates select="*|text()" />
        <xsl:text>&#xa;@endol</xsl:text>
    </xsl:template>
    <xsl:template match="col_li">
        <xsl:text>@li&#xa;</xsl:text>
        <xsl:apply-templates select="*|text()" />
    </xsl:template>

    <xsl:template match="itemize|enumerate">
      <xsl:value-of select="concat('&#xa;', '@', local-name())"/>
      <xsl:apply-templates select="*|text()" />
      <xsl:value-of select="concat('&#xa;', '@end', local-name())"/>
    </xsl:template>

    <xsl:template match="item">
      <xsl:value-of select="concat('&#xa;', '@', local-name(), '&#xa;')"/>
      <xsl:apply-templates select="*|text()" />
    </xsl:template>

    <xsl:template match="webwork">
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@', name(), '{', @pg_file , '}')"/>
    </xsl:template>

    <xsl:template match="wb_image">
        <xsl:text>&#xa;</xsl:text>
        <xsl:value-of select="concat('@image', '{', @data-src , '}')"/>
    </xsl:template>

    <xsl:template match="hc_keyword">
        <xsl:value-of select="concat('@', 'keyword', '{')" /><xsl:value-of select="."/><xsl:text>} </xsl:text>
    </xsl:template>

    <xsl:template match="ref">
        <xsl:value-of select="concat(' @ref{', @label, '}')"/>
    </xsl:template>

    <xsl:template match="newline">
      <xsl:text>&#xa;@newline&#xa;</xsl:text>
    </xsl:template>

    <xsl:template match="xh:*[not(self::xh:ul) and not(self::xh:ol) and  not(self::xh:li)]">
        <xsl:element name="{local-name()}">
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates select="*|text()" />
        </xsl:element>
    </xsl:template>

    <xsl:template match="xh:ul|xh:ol|xh:li">
        <xsl:text>&#xa;</xsl:text>
        <xsl:element name="{local-name()}">
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates select="*|text()" />
            <xsl:text>&#xa;</xsl:text>
        </xsl:element>
    </xsl:template>

    <xsl:template match="course|topic|chapter|week|lecture|setchapter|href">
        <xsl:text>@</xsl:text>
        <xsl:value-of select="@wbtag"/>
        <xsl:if test="argument">
            <xsl:text>{</xsl:text>
            <xsl:value-of select="argument/text()"/>
            <xsl:text>}</xsl:text>
        </xsl:if>
    </xsl:template>

    <xsl:template match="section|subsection|subsubsection">
        <xsl:text>@</xsl:text>
        <xsl:value-of select="@wbtag"/>
        <!-- <xsl:if test="argument">
            <xsl:text>{</xsl:text>
            <xsl:value-of select="argument/text()"/>
            <xsl:text>}</xsl:text>
        </xsl:if> -->
        <xsl:apply-templates select="text()|*[not(self::argument)]"/>
    </xsl:template>

    <xsl:template match="label">
        <xsl:text>&#xa;@</xsl:text>
        <xsl:value-of select="concat(@wbtag, '{', @name, '}&#xa;')"/>
    </xsl:template>

    <xsl:template match="text()" >
        <xsl:value-of select="." />
    </xsl:template>

    <xsl:template match="comment()" >
        <xsl:comment>
            <xsl:value-of select="." />
        </xsl:comment>
    </xsl:template>

</xsl:stylesheet>
