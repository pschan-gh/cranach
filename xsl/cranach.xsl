<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl = "http://www.w3.org/1999/XSL/Transform"
    xmlns:xh = "http://www.w3.org/1999/xhtml"
    xmlns:lv = "http://www.math.cuhk.edu.hk/~pschan/cranach"
    xmlns:idx = "elephas_index"
    xmlns:m = "http://www.w3.org/1998/Math/MathML"
    >

  <!-- exclude-result-prefixes="lv" -->
    <!-- xmlns:xh="https://www.w3.org/TR/html51/" -->
    <!-- xmlns:xh="http://www.w3.org/1999/xhtml" -->
    <xsl:preserve-space elements="xh:pre"/>
    <xsl:output method="xml" indent="yes"/>

    <xsl:variable name="lv" select="'http://www.math.cuhk.edu.hk/~pschan/cranach'"/>
    <xsl:variable name="xh" select="'http://www.w3.org/1999/xhtml'"/>

    <xsl:template match="/">
        <xsl:element name="document" namespace="{$lv}">
            <xsl:apply-templates select="lv:root|lv:bare" />
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:*">
        <xsl:param name="slide"/>
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:param name="section" select="@section"/>
        <xsl:param name="subsection" select="@subsection"/>
        <xsl:param name="subsubsection" select="@subsubsection"/>
        <xsl:element name="{local-name()}" namespace="{$lv}">
            <xsl:attribute name="course">
                <xsl:value-of select="$course"/>
            </xsl:attribute>
            <xsl:attribute name="chapter">
                <xsl:value-of select="$chapter"/>
            </xsl:attribute>
            <xsl:attribute name="chapter_type">
                <xsl:value-of select="$chapter_type"/>
            </xsl:attribute>
            <xsl:attribute name="section">
                <xsl:value-of select="$section"/>
            </xsl:attribute>
            <xsl:attribute name="subsection">
                <xsl:value-of select="$subsection"/>
            </xsl:attribute>
            <xsl:attribute name="subsubsection">
                <xsl:value-of select="$subsubsection"/>
            </xsl:attribute>
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates select="*|text()|comment()">
                <xsl:with-param name="slide" select = "$slide" />
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="$chapter"/>
                <xsl:with-param name="chapter_type" select="$chapter_type"/>
                <xsl:with-param name="section" select="$section"/>
                <xsl:with-param name="subsection" select="$subsection"/>
                <xsl:with-param name="subsubsection" select="$subsubsection"/>
            </xsl:apply-templates>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:root[not(@query)]">
        <xsl:apply-templates select="*">
            <xsl:with-param name="environ" select="." />
        </xsl:apply-templates>
    </xsl:template>

    <xsl:template match="lv:root[@query]">
        <xsl:element name="bare" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates select="*[not(self::lv:statement) and not(self::lv:substatement)]"/>
            <xsl:if test="./lv:statement|./lv:substatement|./lv:webwork">
                <xsl:call-template name="keywords">
                    <xsl:with-param name="environ" select="." />
                    <xsl:with-param name="slide" select="'all'"/>
                    <xsl:with-param name="chapter" select="@chapter"/>
                    <xsl:with-param name="course" select="@course"/>
                </xsl:call-template>
                <xsl:element name="slides" namespace="{$lv}">
                    <xsl:copy-of select="@*"/>
                    <xsl:for-each select="lv:statement|lv:substatement|lv:webwork">
                        <xsl:element name="slide" namespace="{$lv}">
                            <xsl:copy-of select="@*"/>
                            <xsl:variable name="slide">
                                <xsl:number count="lv:root/lv:statement"/>
                            </xsl:variable>
                            <xsl:attribute name="wbtag">
                                <xsl:value-of select="'sep'"/>
                            </xsl:attribute>
                            <xsl:attribute name="slide">
                                <xsl:value-of select="$slide"/>
                            </xsl:attribute>
                            <xsl:attribute name="chapter">
                                <xsl:value-of select="@chapter"/>
                            </xsl:attribute>
                            <xsl:attribute name="course">
                                <xsl:value-of select="@course"/>
                            </xsl:attribute>
                            <xsl:attribute name="id">
                                <xsl:value-of select="concat('s', $slide)"/>
                            </xsl:attribute>
                            <xsl:call-template name="keywords">
                                <xsl:with-param name="environ" select="." />
                                <xsl:with-param name="slide" select="$slide" />
                            </xsl:call-template>
                            <xsl:copy-of select="."/>
                        </xsl:element>
                    </xsl:for-each>
                </xsl:element>
            </xsl:if>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:course">
        <xsl:element name="course" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
            <xsl:call-template name="keywords">
                <xsl:with-param name="environ" select="." />
                <xsl:with-param name="slide">all</xsl:with-param>
                <xsl:with-param name="course" select="@title"/>
            </xsl:call-template>
            <xsl:apply-templates select="lv:chapter|lv:week|lv:lecture|lv:section|lv:subsection|lv:subsubsection|lv:slides|lv:keywords|lv:title|lv:label|text()">
                <xsl:with-param name="environ" select="." />
                <xsl:with-param name="course" select="@title" />
            </xsl:apply-templates>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:chapter">
        <xsl:param name="course" />
        <xsl:element name="chapter" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
            <xsl:attribute name="course">
                <xsl:value-of select = "$course" />
            </xsl:attribute>
            <xsl:variable name="serial">
                <xsl:value-of select = "@num" />
            </xsl:variable>
            <xsl:attribute name="serial">
                <xsl:value-of select = "$serial" />
            </xsl:attribute>
            <xsl:call-template name="keywords">
                <xsl:with-param name="environ" select="." />
                <xsl:with-param name="slide">all</xsl:with-param>
                <xsl:with-param name="chapter" select="@num"/>
            </xsl:call-template>
            <xsl:apply-templates select="lv:section|lv:subsection|lv:subsubsection|lv:slides|lv:bare|lv:keywords|lv:title|lv:topic|lv:label|text()">
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="@num"/>
                <xsl:with-param name="chapter_type" select="@chapter_type"/>
                <xsl:with-param name="serial" select="$serial"/>
            </xsl:apply-templates>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:section">
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:variable name="section">
            <xsl:number level="any" count="lv:chapter//lv:section" from="lv:chapter"/>
        </xsl:variable>
        <xsl:element name="section" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
            <xsl:attribute name="course">
                <xsl:value-of select = "$course" />
            </xsl:attribute>
            <xsl:attribute name="chapter">
                <xsl:value-of select="$chapter"/>
            </xsl:attribute>
            <xsl:attribute name="num">
                <xsl:value-of select="$section"/>
            </xsl:attribute>
            <xsl:variable name="serial">
                <xsl:value-of select="$chapter"/>
                <xsl:text>.</xsl:text>
                <xsl:value-of select="$section"/>
            </xsl:variable>
            <xsl:attribute name="serial">
                <xsl:value-of select="$serial"/>
            </xsl:attribute>
            <xsl:apply-templates select="lv:subsection|lv:subsubsection|lv:slides|lv:bare|lv:keywords|lv:title|lv:label|text()">
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="$chapter"/>
                <xsl:with-param name="chapter_type" select="$chapter_type"/>
                <xsl:with-param name="section" select="$section"/>
                <xsl:with-param name="serial" select="$serial"/>
            </xsl:apply-templates>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:subsection">
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:param name="section" select="@section"/>
        <xsl:variable name="subsection">
            <xsl:number level="any" count="lv:section//lv:subsection" from="lv:section"/>
        </xsl:variable>
        <xsl:element name="subsection" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
            <xsl:attribute name="course">
                <xsl:value-of select = "$course" />
            </xsl:attribute>
            <xsl:attribute name="chapter">
                <xsl:value-of select="$chapter"/>
            </xsl:attribute>
            <xsl:attribute name="section">
                <xsl:value-of select="$section"/>
            </xsl:attribute>
            <xsl:attribute name="num">
                <xsl:value-of select="$subsection"/>
            </xsl:attribute>
            <xsl:variable name="serial">
                <xsl:value-of select="$chapter"/>
                <xsl:text>.</xsl:text>
                <xsl:value-of select="$section"/>
                <xsl:text>.</xsl:text>
                <xsl:value-of select="$subsection"/>
            </xsl:variable>
            <xsl:attribute name="serial">
                <xsl:value-of select="$serial"/>
            </xsl:attribute>
            <xsl:apply-templates select="lv:subsubsection|lv:slides|lv:bare|lv:keywords|lv:title|lv:label|text()">
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="$chapter"/>
                <xsl:with-param name="section" select="$section"/>
                <xsl:with-param name="subsection" select="$subsection"/>
                <xsl:with-param name="serial" select="$serial"/>
            </xsl:apply-templates>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:subsubsection">
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:param name="section" select="@section"/>
        <xsl:param name="subsection" select="@subsection"/>
        <xsl:variable name="subsubsection">
            <xsl:number level="any" count="lv:subsection//lv:subsubsection" from="lv:subsection"/>
        </xsl:variable>
        <xsl:element name="subsubsection" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
            <xsl:attribute name="course">
                <xsl:value-of select = "$course" />
            </xsl:attribute>
            <xsl:attribute name="chapter">
                <xsl:value-of select="$chapter"/>
            </xsl:attribute>
            <xsl:variable name="serial">
                <xsl:value-of select="$chapter"/>
                <xsl:text>.</xsl:text>
                <xsl:value-of select="$section"/>
                <xsl:text>.</xsl:text>
                <xsl:value-of select="$subsection"/>
                <xsl:text>.</xsl:text>
                <xsl:value-of select="$subsubsection"/>
            </xsl:variable>
            <xsl:attribute name="serial">
                <xsl:value-of select="$serial"/>
            </xsl:attribute>
            <xsl:apply-templates select="lv:slides|lv:bare|lv:keywords|lv:title|lv:label|text()">
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="$chapter"/>
                <xsl:with-param name="chapter_type" select="$chapter_type"/>
                <xsl:with-param name="section" select="$section"/>
                <xsl:with-param name="subsection" select="$subsection"/>
                <xsl:with-param name="subsubsection" select="$subsubsection"/>
                <xsl:with-param name="serial" select="$serial"/>
            </xsl:apply-templates>
        </xsl:element>
    </xsl:template>

    <xsl:template match="//idx:index">
    </xsl:template>

    <xsl:template match="lv:slides">
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:param name="section" select="@section"/>
        <xsl:param name="subsection" select="@subsection"/>
        <xsl:param name="subsubsection" select="@subsubsection"/>
        <xsl:element name="slides" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates select="lv:slide">
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="$chapter"/>
                <xsl:with-param name="chapter_type" select="$chapter_type"/>
                <xsl:with-param name="section" select="$section"/>
                <xsl:with-param name="subsection" select="$subsection"/>
                <xsl:with-param name="subsubsection" select="$subsubsection"/>
            </xsl:apply-templates>
        </xsl:element>
    </xsl:template>

    <xsl:template name="keywords">
        <xsl:param name="environ"/>
        <xsl:param name="slide"/>
        <xsl:param name="chapter" select="ancestor::lv:chapter/@num"/>
        <xsl:param name="course" select="ancestor::lv:course/@title"/>
        <xsl:element name="keywords" namespace="{$lv}">
            <xsl:attribute name="slide">
                <xsl:value-of select="$slide"/>
            </xsl:attribute>
            <xsl:attribute name="environ">
                <xsl:value-of select="local-name($environ)"/>
            </xsl:attribute>
            <xsl:attribute name="chapter">
                <xsl:value-of select="$chapter"/>
            </xsl:attribute>
            <xsl:attribute name="course">
                <xsl:value-of select="$course"/>
            </xsl:attribute>
            <xsl:for-each select="$environ//xh:b|$environ//xh:h1|$environ//xh:h2|$environ//xh:h3|$environ//xh:h4|$environ//xh:h5|$environ//lv:hc_keyword">
                <xsl:choose>
                    <xsl:when test="(not(contains(current(), 'Exercise'))) and (not(contains(current(), 'nswer'))) and (not(contains(current(), 'Terminology'))) and (not(contains(current()/@class, 'notkw')))">
                        <xsl:element name="keyword" namespace="{$lv}">
                            <xsl:attribute name="chapter">
                                <!-- <xsl:value-of select="ancestor::chapter/@num"/> -->
                                <xsl:value-of select="$chapter"/>
                            </xsl:attribute>
                            <xsl:attribute name="slide">
                                <xsl:value-of select="$slide"/>
                            </xsl:attribute>
                            <xsl:value-of select="*|text()|descendant::*/text()"/>
                        </xsl:element>
                    </xsl:when>
                </xsl:choose>
            </xsl:for-each>
            <xsl:for-each select="$environ//lv:statement[@title]">
                <xsl:element name="keyword" namespace="{$lv}">
                    <xsl:attribute name="chapter">
                        <!-- <xsl:value-of select="ancestor::chapter/@num"/> -->
                        <xsl:value-of select="$chapter"/>
                    </xsl:attribute>
                    <xsl:attribute name="slide">
                        <xsl:value-of select="$slide"/>
                    </xsl:attribute>
                    <xsl:value-of select="@title"/>
                </xsl:element>
            </xsl:for-each>
            <!-- <xsl:if test="./@title">
                <xsl:element name="keyword" namespace="{$lv}">
                    <xsl:attribute name="chapter">
                        <xsl:value-of select="$chapter"/>
                    </xsl:attribute>
                    <xsl:attribute name="slide">
                        <xsl:value-of select="$slide"/>
                    </xsl:attribute>
                    <xsl:value-of select="@title"/>
                </xsl:element>
            </xsl:if> -->
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:slide">
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:param name="section" select="@section"/>
        <xsl:param name="subsection" select="@subsection"/>
        <xsl:param name="subsubsection" select="@subsubsection"/>

        <xsl:variable name="slide">
            <xsl:number level="any" count="lv:root//lv:slide" from="lv:root"/>
        </xsl:variable>

        <xsl:element name="slide" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
            <xsl:attribute name="id">
                <xsl:text>s</xsl:text>
                <xsl:value-of select="$slide"/>
            </xsl:attribute>
            <xsl:attribute name="slide">
                <xsl:value-of select="$slide"/>
            </xsl:attribute>
            <xsl:attribute name="course">
                <xsl:value-of select = "ancestor::lv:course/@title" />
            </xsl:attribute>
            <xsl:attribute name="chapter">
                <xsl:choose>
                    <xsl:when test="ancestor::lv:chapter">
                        <xsl:value-of select = "ancestor::lv:chapter/@num" />
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select = "@chapter" />
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            <xsl:attribute name="section">
                <xsl:value-of select = "$section" />
            </xsl:attribute>
            <xsl:attribute name="subsection">
                <xsl:value-of select = "$subsection" />
            </xsl:attribute>
            <xsl:attribute name="subsubsection">
                <xsl:value-of select = "$subsubsection" />
            </xsl:attribute>
            <xsl:attribute name="chapter_type">
                <xsl:value-of select = "ancestor::lv:chapter/@chapter_type" />
            </xsl:attribute>
            <xsl:attribute name="chapter_title">
                <xsl:value-of select="ancestor::lv:chapter/@title"/>
            </xsl:attribute>
            <xsl:attribute name="section_title">
                <xsl:value-of select="ancestor::lv:section/@title"/>
            </xsl:attribute>


            <xsl:if test="position() = 1">
                <xsl:if test="not(lv:title)">
                    <xsl:apply-templates select="../../lv:title">
                        <xsl:with-param name="environ" select="."/>
                        <xsl:with-param name="slide" select="$slide"/>
                    </xsl:apply-templates>
                </xsl:if>
                <xsl:if test="not(lv:topic)">
                    <xsl:apply-templates select="../../lv:topic">
                        <xsl:with-param name="environ" select="."/>
                        <xsl:with-param name="slide" select="$slide"/>
                    </xsl:apply-templates>
                </xsl:if>
            </xsl:if>

            <xsl:call-template name="keywords">
                <xsl:with-param name="environ" select="." />
                <xsl:with-param name="slide" select="$slide" />
            </xsl:call-template>

            <xsl:apply-templates select="*[not(self::slide)]|text()|comment()">
                <xsl:with-param name="slide" select = "$slide" />
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="$chapter"/>
                <xsl:with-param name="chapter_type" select="$chapter_type"/>
                <xsl:with-param name="section" select="$section"/>
                <xsl:with-param name="subsection" select="$subsection"/>
                <xsl:with-param name="subsubsection" select="$subsubsection"/>
            </xsl:apply-templates>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:statement">
        <xsl:param name="slide" />
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:param name="section" select="@section"/>
        <xsl:param name="subsection" select="@subsection"/>
        <xsl:param name="subsubsection" select="@subsubsection"/>

        <xsl:variable name="num">
            <xsl:choose>
                <xsl:when test="ancestor::lv:chapter">
                    <xsl:number level="any" count="lv:chapter//lv:statement" from="lv:chapter"/>
                </xsl:when>
                <xsl:when test="ancestor::lv:course">
                    <xsl:number level="any" count="lv:course//lv:statement" from="lv:course"/>
                </xsl:when>
                <xsl:when test="ancestor::lv:bare">
                    <xsl:number level="any" count="lv:bare//lv:statement" from="bare" />
                </xsl:when>
                <xsl:otherwise>
                    <xsl:number level="any" count="lv:root//lv:statement" from="root" />
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:element name="statement" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
            <xsl:attribute name="num">
                <xsl:value-of select = "$num" />
            </xsl:attribute>
            <xsl:attribute name="course">
                <xsl:value-of select = "$course" />
            </xsl:attribute>
            <xsl:attribute name="chapter">
                <!-- <xsl:value-of select = "$chapter" /> -->
                <xsl:value-of select = "ancestor::lv:chapter/@num" />
            </xsl:attribute>
            <xsl:attribute name="chapter_type">
                <xsl:value-of select = "$chapter_type" />
            </xsl:attribute>
            <xsl:attribute name="slide">
                <xsl:choose>
                    <xsl:when test="@slide">
                        <xsl:value-of select="@slide"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="$slide"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            <xsl:choose>
                <xsl:when test="@refnum">
                    <xsl:attribute name="item">
                        <xsl:value-of select="@refnum"/>
                    </xsl:attribute>
                </xsl:when>
                <xsl:when test="ancestor::lv:chapter">
                    <xsl:attribute name="item">
                        <xsl:value-of select="concat($chapter, '.', $num)"/>
                    </xsl:attribute>
                </xsl:when>
                <xsl:when test="@chapter">
                    <xsl:attribute name="item">
                        <xsl:value-of select="concat(@chapter, '.', @num)"/>
                    </xsl:attribute>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:attribute name="item">
                        <xsl:value-of select="$num"/>
                    </xsl:attribute>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:apply-templates select="*|text()|comment()">
                <xsl:with-param name="slide" select = "$slide" />
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="$chapter"/>
                <xsl:with-param name="section" select="$section"/>
                <xsl:with-param name="subsection" select="$subsection"/>
                <xsl:with-param name="subsubsection" select="$subsubsection"/>
            </xsl:apply-templates>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:substatement">
        <xsl:param name="slide" />
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:param name="section" select="@section"/>
        <xsl:param name="subsection" select="@subsection"/>
        <xsl:param name="subsubsection" select="@subsubsection"/>

        <xsl:element name="substatement" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
            <xsl:attribute name="course">
                <xsl:value-of select = "$course" />
            </xsl:attribute>
            <xsl:attribute name="chapter">
                <xsl:value-of select = "ancestor::lv:chapter/@num" />
            </xsl:attribute>
            <xsl:attribute name="chapter_type">
                <xsl:value-of select = "$chapter_type" />
            </xsl:attribute>
            <xsl:attribute name="slide">
                <xsl:choose>
                    <xsl:when test="@slide">
                        <xsl:value-of select="@slide"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="$slide"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            <xsl:if test="@type='Proof'">
                <xsl:choose>
                    <xsl:when test="@of">
                        <xsl:attribute name="of">
                            <xsl:value-of select="@of"/>
                        </xsl:attribute>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:attribute name="of">
                            <xsl:value-of select="preceding::lv:statement[1]/@md5[last()]"/>
                        </xsl:attribute>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:if>
            <xsl:apply-templates select="*|text()|comment()">
                <xsl:with-param name="slide" select = "$slide" />
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="$chapter"/>
                <xsl:with-param name="section" select="$section"/>
                <xsl:with-param name="subsection" select="$subsection"/>
                <xsl:with-param name="subsubsection" select="$subsubsection"/>
            </xsl:apply-templates>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:figure">
        <xsl:param name="slide" />
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:param name="section" select="@section"/>
        <xsl:param name="subsection" select="@subsection"/>
        <xsl:param name="subsubsection" select="@subsubsection"/>

        <xsl:variable name="num">
            <xsl:choose>
                <xsl:when test="ancestor::lv:chapter">
                    <xsl:number level="any" count="lv:chapter//lv:figure" from="lv:chapter"/>
                </xsl:when>
                <xsl:when test="ancestor::lv:course">
                    <xsl:number level="any" count="lv:course//lv:figure" from="lv:course"/>
                </xsl:when>
                <xsl:when test="ancestor::lv:bare">
                    <xsl:number level="any" count="lv:bare//lv:figure" from="bare" />
                </xsl:when>
                <xsl:otherwise>
                    <xsl:number level="any" count="lv:root//lv:figure" from="root" />
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:element name="figure" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
            <xsl:attribute name="num">
                <xsl:value-of select = "$num" />
            </xsl:attribute>
            <xsl:attribute name="course">
                <xsl:value-of select = "$course" />
            </xsl:attribute>
            <xsl:attribute name="chapter">
                <!-- <xsl:value-of select = "$chapter" /> -->
                <xsl:value-of select = "ancestor::lv:chapter/@num" />
            </xsl:attribute>
            <xsl:attribute name="chapter_type">
                <xsl:value-of select = "$chapter_type" />
            </xsl:attribute>
            <xsl:attribute name="slide">
                <xsl:choose>
                    <xsl:when test="@slide">
                        <xsl:value-of select="@slide"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="$slide"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            <xsl:choose>
                <xsl:when test="@refnum">
                    <xsl:attribute name="item">
                        <xsl:value-of select="@refnum"/>
                    </xsl:attribute>
                </xsl:when>
                <xsl:when test="ancestor::lv:chapter">
                    <xsl:attribute name="item">
                        <xsl:value-of select="concat($chapter, '.', $num)"/>
                    </xsl:attribute>
                </xsl:when>
                <xsl:when test="@chapter">
                    <xsl:attribute name="item">
                        <xsl:value-of select="concat(@chapter, '.', @num)"/>
                    </xsl:attribute>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:attribute name="item">
                        <xsl:value-of select="$num"/>
                    </xsl:attribute>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:apply-templates select="*|text()|comment()">
                <xsl:with-param name="slide" select = "$slide" />
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="$chapter"/>
                <xsl:with-param name="section" select="$section"/>
                <xsl:with-param name="subsection" select="$subsection"/>
                <xsl:with-param name="subsubsection" select="$subsubsection"/>
                <xsl:with-param name="item" select="$num" />
            </xsl:apply-templates>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:caption">
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:param name="chapter_title" select="@chapter_title"/>
        <xsl:param name="section" select="@section"/>
        <xsl:param name="section_title" select="@section_title"/>
        <xsl:param name="subsection" select="@subsection"/>
        <xsl:param name="subsection_title" select="@subsection_title"/>
        <xsl:param name="subsubsection" select="@subsubsection"/>
        <xsl:param name="subsubsection_title" select="@subsubsection_title"/>
        <xsl:param name="slide"/>
        <xsl:param name="item"/>
        <xsl:element name="{local-name()}" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
            <xsl:attribute name="course">
                <xsl:value-of select = "$course" />
            </xsl:attribute>
            <xsl:attribute name="chapter">
                <xsl:value-of select = "$chapter" />
            </xsl:attribute>
            <xsl:attribute name="chapter_type">
                <xsl:value-of select = "ancestor::lv:chapter/@chapter_type" />
            </xsl:attribute>
            <xsl:attribute name="section">
                <xsl:value-of select = "$section" />
            </xsl:attribute>
            <xsl:attribute name="subsection">
                <xsl:value-of select = "$subsection" />
            </xsl:attribute>
            <xsl:attribute name="subsubsection">
                <xsl:value-of select = "$subsubsection" />
            </xsl:attribute>
            <xsl:attribute name="slide">
                <xsl:value-of select="$slide"/>
            </xsl:attribute>
            <xsl:attribute name="item">
                <xsl:value-of select="$item" />
            </xsl:attribute>
            <xsl:apply-templates select="*|text()|comment()">
                <xsl:with-param name="slide" select = "$slide" />
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="$chapter"/>
                <xsl:with-param name="chapter_type" select="$chapter_type"/>
                <xsl:with-param name="section" select="$section"/>
                <xsl:with-param name="subsection" select="$subsection"/>
                <xsl:with-param name="subsubsection" select="$subsubsection"/>
            </xsl:apply-templates>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:title|lv:topic">
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:param name="chapter_title" select="@chapter_title"/>
        <xsl:param name="section" select="@section"/>
        <xsl:param name="section_title" select="@section_title"/>
        <xsl:param name="subsection" select="@subsection"/>
        <xsl:param name="subsection_title" select="@subsection_title"/>
        <xsl:param name="subsubsection" select="@subsubsection"/>
        <xsl:param name="subsubsection_title" select="@subsubsection_title"/>
        <xsl:param name="serial" select="@serial"/>
        <xsl:param name="slide"/>
        <xsl:element name="{local-name()}" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
            <xsl:attribute name="course">
                <xsl:value-of select = "$course" />
            </xsl:attribute>
            <xsl:attribute name="chapter">
                <xsl:value-of select = "$chapter" />
            </xsl:attribute>
            <xsl:attribute name="chapter_type">
                <xsl:value-of select = "ancestor::lv:chapter/@chapter_type" />
            </xsl:attribute>
            <xsl:attribute name="section">
                <xsl:value-of select = "$section" />
            </xsl:attribute>
            <xsl:attribute name="subsection">
                <xsl:value-of select = "$subsection" />
            </xsl:attribute>
            <xsl:attribute name="subsubsection">
                <xsl:value-of select = "$subsubsection" />
            </xsl:attribute>
            <xsl:attribute name="serial">
                <xsl:value-of select = "$serial" />
            </xsl:attribute>
            <xsl:attribute name="slide">
                <xsl:value-of select="$slide"/>
            </xsl:attribute>
            <!-- <xsl:if test="local-name()='title'">
                <xsl:if test="../lv:label">
                    <xsl:for-each select="../lv:label">
                        <xsl:element name="label" namespace="{$lv}">
                            <xsl:copy-of select="@*"/>
                            <xsl:attribute name="course">
                                <xsl:value-of select = "$course" />
                            </xsl:attribute>
                            <xsl:attribute name="chapter">
                                <xsl:value-of select = "$chapter" />
                            </xsl:attribute>
                            <xsl:attribute name="chapter_type">
                                <xsl:value-of select = "ancestor::lv:chapter/@chapter_type" />
                            </xsl:attribute>
                            <xsl:attribute name="section">
                                <xsl:value-of select = "$section" />
                            </xsl:attribute>
                            <xsl:attribute name="subsection">
                                <xsl:value-of select = "$subsection" />
                            </xsl:attribute>
                            <xsl:attribute name="subsubsection">
                                <xsl:value-of select = "$subsubsection" />
                            </xsl:attribute>
                            <xsl:attribute name="slide">
                                <xsl:value-of select="$slide"/>
                            </xsl:attribute>
                            <xsl:copy-of select="./*|./text"/>
                        </xsl:element>
                    </xsl:for-each>
                </xsl:if>
            </xsl:if> -->
            <xsl:apply-templates select="*|text()|comment()">
                <xsl:with-param name="slide" select = "$slide" />
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="$chapter"/>
                <xsl:with-param name="chapter_type" select="$chapter_type"/>
                <xsl:with-param name="section" select="$section"/>
                <xsl:with-param name="subsection" select="$subsection"/>
                <xsl:with-param name="subsubsection" select="$subsubsection"/>
            </xsl:apply-templates>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:paragraphs">
        <xsl:apply-templates select="text()"/>
    </xsl:template>

    <xsl:template match="xh:*">
        <xsl:param name="slide"/>
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:param name="section" select="@section"/>
        <xsl:param name="subsection" select="@subsection"/>
        <xsl:param name="subsubsection" select="@subsubsection"/>
        <xsl:element name="{name()}" namespace="{$xh}">
            <xsl:copy-of select="@*[not(@environment) and not(@chapter_type)]"/>
            <!-- <xsl:copy-of select="@wbtag"/> -->
            <xsl:apply-templates select="*|text()|comment()">
                <xsl:with-param name="slide" select = "$slide" />
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="$chapter"/>
                <xsl:with-param name="chapter_type" select="$chapter_type"/>
                <xsl:with-param name="section" select="$section"/>
                <xsl:with-param name="subsection" select="$subsection"/>
                <xsl:with-param name="subsubsection" select="$subsubsection"/>
            </xsl:apply-templates>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:ref">
        <xsl:param name="course"/>
        <xsl:param name="chapter"/>
        <xsl:param name="slide"/>
        <xsl:element name="ref" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
            <xsl:attribute name="course">
                <xsl:value-of select="$course"/>
            </xsl:attribute>
            <xsl:attribute name="chapter">
                <xsl:value-of select="$chapter"/>
            </xsl:attribute>
            <xsl:attribute name="slide">
                <xsl:value-of select="$slide"/>
            </xsl:attribute>
            <xsl:choose>
                <!-- <xsl:when test="//lv:statement[(lv:label/@name=current()/@label) or (@md5=current()/@label)]">
                    <xsl:variable name="statement" select="//lv:statement[(lv:label/@name=current()/@label) or (@md5=current()/@label)]"/>
                    <xsl:attribute name="src-slide">
                        <xsl:value-of select="$statement/@slide"/>
                    </xsl:attribute>
                    <xsl:attribute name="src-course">
                        <xsl:value-of select="$statement/@course"/>
                    </xsl:attribute>
                    <xsl:attribute name="src-chapter">
                        <xsl:value-of select="$statement/ancestor::lv:chapter/@num"/>
                    </xsl:attribute>
                    <xsl:choose>
                        <xsl:when test="$statement/ancestor::lv:chapter">
                            <xsl:attribute name="item">
                                <xsl:value-of select="concat($statement/ancestor::lv:chapter/@num, '.', $statement/@num)"/>
                            </xsl:attribute>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:attribute name="item">
                                <xsl:value-of select="$statement/@num"/>
                            </xsl:attribute>
                        </xsl:otherwise>
                    </xsl:choose>
                    <xsl:attribute name="filename">
                        <xsl:text>self</xsl:text>
                    </xsl:attribute>
                    <xsl:attribute name="title">
                        <xsl:value-of select="$statement/title"/>
                    </xsl:attribute>
                    <xsl:attribute name="md5">
                        <xsl:value-of select="$statement/@md5"/>
                    </xsl:attribute>
                    <xsl:attribute name="class">
                        <xsl:text>knowl</xsl:text>
                    </xsl:attribute>
                    <xsl:attribute name="type">
                        <xsl:value-of select="$statement/@type"/>
                    </xsl:attribute>
                    <xsl:variable name="name">
                        <xsl:choose>
                            <xsl:when test="@name">
                                <xsl:value-of select="@name"/>
                            </xsl:when>
                            <xsl:when test="$statement/@title">
                                <xsl:value-of select="$statement/@title"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="concat($statement/@type, ' ', $statement/ancestor::lv:chapter/@num, '.', $statement/@num)"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:variable>
                    <xsl:element name="title" namespace="{$lv}">
                        <xsl:choose>
                            <xsl:when test="$statement/lv:title">
                                <xsl:copy-of select="$statement/lv:title/*|$statement/lv:title/text()"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="$name"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:element>
                </xsl:when> -->
                <xsl:when test="(//idx:label[@name=current()/@label]) or (//idx:branch[@md5=current()/@label])">
		  <xsl:variable name="label" select="(//idx:label[@name=current()/@label])|(//idx:branch[@md5=current()/@label])"/>
		  <!-- <xsl:choose> -->
		  <!--   <xsl:when test="//idx:label[@name=current()/@label]"> -->
                  <!--     <xsl:variable name="label" select="//idx:label[@name=current()/@label]"/> -->
		  <!--   </xsl:when> -->
		  <!--   <xsl:when test="//idx:branch[@md5=current()/@label]"> -->
		  <!--     <xsl:variable name="label" select="//idx:branch[@md5=current()/@label]"/> -->
		  <!--   </xsl:when> -->
		  <!-- </xsl:choose> -->
                    <xsl:attribute name="src-course">
                        <xsl:value-of select="$label/@course"/>
                    </xsl:attribute>
                    <xsl:attribute name="src-chapter">
                        <xsl:value-of select="$label/@chapter"/>
                    </xsl:attribute>
                    <xsl:attribute name="src-slide">
                        <xsl:value-of select="$label/@slide"/>
                    </xsl:attribute>
                    <xsl:attribute name="type">
                        <xsl:value-of select="$label/@type"/>
                    </xsl:attribute>
                    <xsl:if test="$label/@item">
                        <xsl:attribute name="item">
                            <xsl:value-of select="$label/@item"/>
                        </xsl:attribute>
                    </xsl:if>
                    <xsl:attribute name="src-filename">
                        <xsl:value-of select="$label/@filename"/>
                    </xsl:attribute>
                    <xsl:attribute name="md5">
                        <xsl:value-of select="$label/@md5"/>
                    </xsl:attribute>
                    <xsl:attribute name="class">
                        <xsl:text>knowl</xsl:text>
                    </xsl:attribute>
                    <!-- <xsl:attribute name="name">
                        <xsl:choose>
                            <xsl:when test="@name">
                                <xsl:value-of select="@name"/>
                            </xsl:when>
                            <xsl:when test="not($label/@title) or ($label/@title!='')">
                                <xsl:value-of select="$label/@title"/>
                            </xsl:when>
                            <xsl:otherwise>
                            <xsl:value-of select="concat($label/@type, ' ', $label/@item)"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:attribute> -->
                    <xsl:attribute name="serial">
                        <xsl:value-of select="$label/../@serial"/>
                    </xsl:attribute>
                    <xsl:element name="title" namespace="{$lv}">
                        <xsl:choose>
                            <xsl:when test="$label/../idx:title">
                                <xsl:copy-of select="$label/../idx:title/*|$label/../idx:title/text()"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="concat($label/@type, ' ', $label/@item)"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:element>
                </xsl:when>
                <xsl:otherwise>
		  <xsl:element name="title" namespace="{$lv}">
                    <xsl:text>UNDEFINED</xsl:text>
		  </xsl:element>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:keywords" />

    <xsl:template match="m:math">
        <xsl:element name="m:math" namespace="http://www.w3.org/1998/Math/MathML">
            <xsl:copy-of select="@*"/>
            <xsl:copy-of select="*"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="text()|comment()">
        <!-- <xsl:value-of select="." disable-output-escaping="yes" /> -->
        <xsl:copy-of select="current()"/>
    </xsl:template>

</xsl:stylesheet>
