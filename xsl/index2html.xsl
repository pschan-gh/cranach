<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xh="http://www.w3.org/1999/xhtml"
    xmlns:idx = "elephas_index"
    >

    <xsl:strip-space elements="*"/>
    <xsl:output method="html"/>

    <xsl:param name="contenturldir"></xsl:param>

    <xsl:variable name="letter">abcdefghijklmnopqrstuvwxyz</xsl:variable>

    <xsl:template match="idx:index">
        <xsl:call-template name="iterate">
            <xsl:with-param name="string" select="$letter"/>
        </xsl:call-template>
    </xsl:template>

    <xsl:template name="iterate">
        <xsl:param name="string"/>
        <xsl:param name="length" select="1" />

        <xsl:variable name="lowercase" select="'abcdefghijklmnopqrstuvwxyz'" />
        <xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'" />

        <xsl:if test="string-length($string)">

            <xsl:variable name="char" select="substring($string, 1, 1)" />
            <!-- <xsl:if test="$char!='a'">
                <br/><br/>
            </xsl:if> -->

            <strong><xsl:value-of select="translate($char, $lowercase, $uppercase)" /></strong>
            <br/>
            <xsl:apply-templates select="idx:entry[@keyword and contains($char, substring(@keyword, 1, 1))]">
                <xsl:sort select="@keyword"/>
            </xsl:apply-templates>
            <br/><br/>
            <xsl:call-template name="iterate">
                <xsl:with-param name="string" select="substring-after($string, $char)" />
            </xsl:call-template>
        </xsl:if>
    </xsl:template>

    <xsl:template match="idx:entry[@keyword]">
        <xsl:if test="position()!=1">
            <!-- <br/> -->
        </xsl:if>
        <button namespace="http://www.w3.org/1999/xhtml" type="button" class="btn btn-outline-info btn-sm btn_keyword" style="margin-left:5px;margin-top:5px" data-html="true" data-container="body" data-toggle="popover"  data-placement="bottom">
            <xsl:attribute name="data-content">
                <xsl:apply-templates select="idx:branch[@keyword]"/>
            </xsl:attribute>
            <xsl:value-of select="idx:branch[1]/text()"/>
        </button>
        <xsl:text> </xsl:text>
    </xsl:template>

    <xsl:template match="idx:branch[@keyword]">
            <xsl:if test="position()!=1"><xsl:text>&lt;br/&gt;</xsl:text></xsl:if>
                <xsl:text>&lt;a target="_blank" href ="</xsl:text><xsl:value-of select='$contenturldir' />/<xsl:value-of select="./@filename" /><xsl:text>&amp;slide=</xsl:text><xsl:value-of select="@slide"/><xsl:text>"&gt;Chapter </xsl:text><xsl:value-of select="@chapter" /><xsl:text>&lt;/a&gt;</xsl:text>
    </xsl:template>

</xsl:stylesheet>
