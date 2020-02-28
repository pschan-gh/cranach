<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xh="http://www.w3.org/1999/xhtml"
    xmlns:idx = "http://www.math.cuhk.edu.hk/~pschan/elephas_index"
    >

    <xsl:strip-space elements="*"/>
    <xsl:output method="html"/>

    <xsl:param name="contenturldir"></xsl:param>
    <xsl:param name="contenturl"></xsl:param>
    <xsl:param name="md5"></xsl:param>

    <xsl:template match="/">
        <!-- <xsl:if test="//idx:branch[@md5=$md5]/idx:refby"> -->
        <xsl:if test="//idx:ref[@md5=$md5]">
            <br/>
            <strong>Referenced by:</strong>
            <ul>
                <!-- <xsl:apply-templates select="//idx:branch[@md5=$md5]/idx:refby"/> -->
                <xsl:apply-templates select="/idx:document/idx:index/idx:ref[@md5=$md5]"/>
            </ul>
        </xsl:if>
    </xsl:template>

    <xsl:template match="idx:ref">
        <li>
            <a target="_blank">
                <xsl:attribute name="href">
                    <xsl:choose>
                        <xsl:when test="@filename!='self'">
                            <xsl:value-of select="concat($contenturldir, '/', @filename, '&amp;slide=', @slide)" />
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="concat($contenturl, '&amp;slide=', @slide)" />
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:attribute>
                <xsl:value-of select="concat(@course, ' Chapter ', @chapter, ' Slide ', @slide)" />
            </a>
        </li>
    </xsl:template>

</xsl:stylesheet>
