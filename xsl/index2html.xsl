<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:xh="http://www.w3.org/1999/xhtml"
	xmlns:idx = "http://www.math.cuhk.edu.hk/~pschan/elephas_index"
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
		</xsl:if>
		<xh:a namespace="http://www.w3.org/1999/xhtml" tabindex="0" role="button" class="btn btn-outline-info btn-sm btn_keyword index" data-bs-trigger="focus" data-bs-html="true" data-bs-toggle="popover" data-bs-placement="bottom" style="margin:2.5px">
			<xsl:apply-templates select="idx:branch[@keyword]"/>
			<xsl:value-of select="idx:branch[1]/text()"/>
		</xh:a>
		<xsl:text> </xsl:text>
	</xsl:template>

	<xsl:template match="idx:branch[@keyword]">
		<xsl:variable name="apos">&apos;</xsl:variable>
		<xsl:variable name="keyword">
			<xsl:value-of select="@keyword"/>
		</xsl:variable>
		<a class="dropdown-item hidden" target="_blank">
			<xsl:attribute name="slide">
				<xsl:value-of select="@slide"/>
			</xsl:attribute>
			<xsl:attribute name="href">
				<xsl:value-of select="concat($contenturldir, '/', ./@filename, '&amp;slide=', @slide, '&amp;keyword=', @keyword)"/>
			</xsl:attribute>
			<xsl:value-of select="concat('Chapter ', @chapter)"/>
		</a>
	</xsl:template>

</xsl:stylesheet>
