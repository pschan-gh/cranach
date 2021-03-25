<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xh="http://www.w3.org/1999/xhtml"
    xmlns:idx = "http://www.math.cuhk.edu.hk/~pschan/elephas_index"
    xmlns:lv = "http://www.math.cuhk.edu.hk/~pschan/cranach"
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
        <xsl:variable name="root">
            <xsl:choose>
                <xsl:when test="@filename!='self'">
                    <xsl:value-of select="concat($contenturldir, '/', @filename)" />
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$contenturl" />
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <li>
            <a target="_blank">
                <xsl:attribute name="href">                    
                    <xsl:choose>
                        <xsl:when test="@referrer-md5">
                            <xsl:value-of select="concat($root, '&amp;item=', @referrer-md5)" />
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="concat($root, '&amp;slide=', @slide)" />
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:attribute>                
                <xsl:choose>
                    <xsl:when test="@referrer-environment='Proof'">
                        <xsl:variable name="referrer-md5">
                            <xsl:value-of select="./@referrer-md5"/>
                        </xsl:variable>
                        <xsl:variable name="referrer" select="//*[@md5=$referrer-md5][1]"/>
                        <xsl:value-of select="concat(@course, ' Chapter ', @chapter, ' ', $referrer/@type, ' of ', $referrer/@of-item)" />                        
                    </xsl:when>
                    <xsl:when test="@referrer-md5">
                        <xsl:variable name="referrer-md5">
                            <xsl:value-of select="./@referrer-md5"/>
                        </xsl:variable>
                        <xsl:variable name="referrer" select="//*[@md5=$referrer-md5][1]"/>
                        <xsl:value-of select="concat(@course, ' Chapter ', @chapter, ' ', $referrer/@type, ' ' , $referrer/@item)" />
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="concat(@course, ' Chapter ', @chapter, ' Slide ', @slide)" />
                    </xsl:otherwise>
                </xsl:choose>
            </a>
        </li>
    </xsl:template>

</xsl:stylesheet>
