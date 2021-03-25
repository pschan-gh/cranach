<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl = "http://www.w3.org/1999/XSL/Transform"
    xmlns:xh = "http://www.w3.org/1999/xhtml"
    xmlns:lv = "http://www.math.cuhk.edu.hk/~pschan/cranach"
    xmlns:idx = "http://www.math.cuhk.edu.hk/~pschan/elephas_index"
    xmlns:m = "http://www.w3.org/1998/Math/MathML"
    >

    <!-- exclude-result-prefixes="lv" -->
    <!-- xmlns:xh="https://www.w3.org/TR/html51/" -->
    <!-- xmlns:xh="http://www.w3.org/1999/xhtml" -->

    <!-- <xsl:strip-space elements="lv:newcol"/> -->
    <xsl:preserve-space elements="xh:pre lv:paragraphs"/>
    <xsl:output method="xml" indent="yes"/>

    <xsl:variable name="lv" select="'http://www.math.cuhk.edu.hk/~pschan/cranach'"/>
    <xsl:variable name="xh" select="'http://www.w3.org/1999/xhtml'"/>

    <xsl:template match="/">
        <xsl:element name="document" namespace="{$lv}">
            <xsl:apply-templates select="lv:root|lv:bare" />
        </xsl:element>
    </xsl:template>

    <xsl:template match="xh:*">
        <xsl:param name="slide"/>
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:param name="section" select="@section"/>
        <xsl:param name="subsection" select="@subsection"/>
        <xsl:param name="subsubsection" select="@subsubsection"/>
        <xsl:param name="item" />
        <xsl:element name="{local-name()}" namespace="{$xh}">
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

    <xsl:template match="lv:*|xh:*[@wbtag]">
        <xsl:param name="slide"/>
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:param name="section" select="@section"/>
        <xsl:param name="subsection" select="@subsection"/>
        <xsl:param name="subsubsection" select="@subsubsection"/>
        <xsl:param name="item" />
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
            <xsl:apply-templates select="lv:section|lv:subsection|lv:subsubsection|lv:slides|lv:bare|lv:keywords|lv:title|lv:topic|lv:label|lv:title|text()">
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="@num"/>
                <xsl:with-param name="chapter_type" select="@chapter_type"/>
                <xsl:with-param name="serial" select="$serial"/>
                <xsl:with-param name="scope" select="local-name()"/>
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
            <xsl:if test="./lv:slides/lv:slide/lv:title">
                <xsl:if test="not(./lv:title)">
                    <xsl:apply-templates select="./lv:slides/lv:slide/lv:title">
                        <xsl:with-param name="course" select="$course"/>
                        <xsl:with-param name="chapter" select="$chapter"/>
                        <xsl:with-param name="chapter_type" select="$chapter_type"/>
                        <xsl:with-param name="section" select="$section"/>
                        <xsl:with-param name="serial" select="$serial"/>
                        <xsl:with-param name="scope" select="local-name()"/>
                    </xsl:apply-templates>
                </xsl:if>
            </xsl:if>
            <xsl:apply-templates select="lv:subsection|lv:subsubsection|lv:slides|lv:bare|lv:keywords|lv:label|lv:title|text()">
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="$chapter"/>
                <xsl:with-param name="chapter_type" select="$chapter_type"/>
                <xsl:with-param name="section" select="$section"/>
                <xsl:with-param name="serial" select="$serial"/>
                <xsl:with-param name="scope" select="local-name()"/>
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
            <xsl:if test="./lv:slides/lv:slide/lv:title">
                <xsl:if test="not(./lv:title)">
                    <xsl:apply-templates select="./lv:slides/lv:slide/lv:title">
                        <xsl:with-param name="course" select="$course"/>
                        <xsl:with-param name="chapter" select="$chapter"/>
                        <xsl:with-param name="chapter_type" select="$chapter_type"/>
                        <xsl:with-param name="section" select="$section"/>
                        <xsl:with-param name="serial" select="$serial"/>
                        <xsl:with-param name="scope" select="local-name()"/>
                    </xsl:apply-templates>
                </xsl:if>
            </xsl:if>
            <xsl:apply-templates select="lv:subsubsection|lv:slides|lv:bare|lv:keywords|lv:label|lv:title|text()">
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="$chapter"/>
                <xsl:with-param name="section" select="$section"/>
                <xsl:with-param name="subsection" select="$subsection"/>
                <xsl:with-param name="serial" select="$serial"/>
                <xsl:with-param name="scope" select="local-name()"/>
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
            <xsl:if test="./lv:slides/lv:slide/lv:title">
                <xsl:if test="not(./lv:title)">
                    <xsl:apply-templates select="./lv:slides/lv:slide/lv:title">
                        <xsl:with-param name="course" select="$course"/>
                        <xsl:with-param name="chapter" select="$chapter"/>
                        <xsl:with-param name="chapter_type" select="$chapter_type"/>
                        <xsl:with-param name="section" select="$section"/>
                        <xsl:with-param name="serial" select="$serial"/>
                        <xsl:with-param name="scope" select="local-name()"/>
                    </xsl:apply-templates>
                </xsl:if>
            </xsl:if>
            <xsl:apply-templates select="lv:slides|lv:bare|lv:keywords|lv:label|lv:title|text()">
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="$chapter"/>
                <xsl:with-param name="chapter_type" select="$chapter_type"/>
                <xsl:with-param name="section" select="$section"/>
                <xsl:with-param name="subsection" select="$subsection"/>
                <xsl:with-param name="subsubsection" select="$subsubsection"/>
                <xsl:with-param name="serial" select="$serial"/>
                <xsl:with-param name="scope" select="local-name()"/>
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
        <xsl:param name="scope" select="@scope"/>
        <xsl:element name="slides" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates select="lv:slide">
                <xsl:with-param name="course" select="$course"/>
                <xsl:with-param name="chapter" select="$chapter"/>
                <xsl:with-param name="chapter_type" select="$chapter_type"/>
                <xsl:with-param name="section" select="$section"/>
                <xsl:with-param name="subsection" select="$subsection"/>
                <xsl:with-param name="subsubsection" select="$subsubsection"/>
                <xsl:with-param name="scope" select="$scope"/>
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
            <xsl:for-each select="$environ//xh:h1|$environ//xh:h2|$environ//xh:h3|$environ//xh:h4|$environ//xh:h5|$environ//lv:hc_keyword|$environ//lv:inline_keyword">
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
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:slide">
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:param name="section" select="@section"/>
        <xsl:param name="subsection" select="@subsection"/>
        <xsl:param name="subsubsection" select="@subsubsection"/>
        <xsl:param name="scope" select="@scope"/>

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
                <xsl:with-param name="scope" select="$scope"/>
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
            <xsl:variable name="item">
                <xsl:choose>
                    <xsl:when test="@refnum">
                        <xsl:value-of select="@refnum"/>
                    </xsl:when>
                    <xsl:when test="ancestor::lv:chapter">
                        <xsl:value-of select="concat($chapter, '.', $num)"/>
                    </xsl:when>
                    <xsl:when test="@chapter">
                        <xsl:value-of select="concat(@chapter, '.', @num)"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="$num"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <xsl:attribute name="item">
                <xsl:value-of select="$item"/>
            </xsl:attribute>
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
            <xsl:choose>
                <xsl:when test="@type='Proof'">
                    <xsl:variable name="of">
                        <xsl:choose>
                            <xsl:when test="@of">
                                <xsl:value-of select="@of"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="preceding::lv:statement[1]/@md5[last()]"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:variable>
                    <xsl:attribute name="of">
                        <xsl:value-of select="$of"/>
                    </xsl:attribute>
                    <xsl:choose>
                        <xsl:when test="(//idx:label[@name=$of]) or (//idx:branch[@md5=$of])">
                            <xsl:variable name="branch" select="(//idx:label[@name=$of]/parent::node()|//idx:branch[@md5=$of])[1]"/>
                            <xsl:attribute name="of-src-course">
                                <xsl:value-of select="$branch/@course"/>
                            </xsl:attribute>
                            <xsl:attribute name="of-src-chapter">
                                <xsl:value-of select="$branch/@chapter"/>
                            </xsl:attribute>
                            <xsl:attribute name="of-src-slide">
                                <xsl:value-of select="$branch/@slide"/>
                            </xsl:attribute>
                            <xsl:attribute name="of-type">
                                <xsl:value-of select="$branch/@type"/>
                            </xsl:attribute>
                            <xsl:if test="$branch/@item">
                                <xsl:attribute name="of-item">
                                    <xsl:value-of select="$branch/@item"/>
                                </xsl:attribute>
                            </xsl:if>
                            <xsl:attribute name="of-src-filename">
                                <xsl:value-of select="$branch/@filename"/>
                            </xsl:attribute>
                            <xsl:variable name="ofmd5">
                                <xsl:value-of select="$branch/@md5"/>
                            </xsl:variable>                        
                            <xsl:attribute name="ofmd5">
                                <xsl:value-of select="$ofmd5"/>
                            </xsl:attribute>
                            <xsl:attribute name="of-serial">
                                <xsl:value-of select="$branch/@serial"/>
                            </xsl:attribute>
                            <xsl:element name="of-title" namespace="{$lv}">
                                <xsl:choose>
                                    <xsl:when test="$branch/idx:title">
                                        <xsl:copy-of select="($branch/idx:title/*)|($branch/idx:title/text())"/>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <xsl:value-of select="concat($branch/@type, ' ', $branch/@item)"/>
                                    </xsl:otherwise>
                                </xsl:choose>
                            </xsl:element>
                            <xsl:if test="./lv:title">
                                <xsl:element name="title" namespace="{$lv}">
                                    <xsl:text>[</xsl:text>
                                    <!-- <xsl:value-of select="concat('[', ./lv:title/text(), ']')"/> -->
                                    <xsl:apply-templates select="./lv:title/*|./lv:title/text()"/>
                                    <xsl:text>]</xsl:text>
                                </xsl:element>
                            </xsl:if>
                        </xsl:when>
                        <xsl:otherwise>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:when>
                <xsl:otherwise>
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
        <xsl:param name="scope" select="@scope"/>
        <xsl:param name="slide"/>
        <xsl:element name="{local-name()}" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
            <xsl:attribute name="scope">
                <xsl:value-of select="$scope" />
            </xsl:attribute>
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

    <xsl:template match="lv:label">
        <xsl:element name="label" namespace="{$lv}">
            <xsl:copy-of select="@wbtag"/>
            <xsl:copy-of select="@label"/>
            <xsl:copy-of select="@name"/>
            <xsl:copy-of select="@type"/>
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
            <xsl:if test="ancestor::lv:statement or ancestor::lv:substatement">
                <xsl:attribute name="referrer-type">
                    <xsl:value-of select="(ancestor::lv:statement|ancestor::lv:substatement)[1]/@type"/>
                </xsl:attribute>
                <xsl:attribute name="referrer-md5">
                    <xsl:value-of select="(ancestor::lv:statement|ancestor::lv:substatement)[1]/@md5"/>
                </xsl:attribute>
                <xsl:attribute name="referrer-environment">
                    <xsl:value-of select="(ancestor::lv:statement|ancestor::lv:substatement)[1]/@type"/>
                </xsl:attribute>
                <!-- <xsl:if test="ancestor::lv:substatement[@type='Proof']">
                    <xsl:variable name="substatement" select="ancestor::lv:substatement"/>
                    <xsl:variable name="referrer-of">
                        <xsl:choose>
                            <xsl:when test="$substatement/@of">
                                <xsl:value-of select="$substatement/@of"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="$substatement/preceding::lv:statement[1]/@md5[last()]"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:variable>
                    <xsl:attribute name="referrer-of">
                        <xsl:value-of select="$referrer-of" />
                    </xsl:attribute>
                    <xsl:attribute name="referrer-of-item">
                        <xsl:value-of select="(//idx:label[@name=$referrer-of]/parent::node()|//idx:branch[@md5=$referrer-of])[1]/@item"/>
                    </xsl:attribute>
                </xsl:if> -->
            </xsl:if>
            <xsl:choose>
                <xsl:when test="(//idx:label[@name=current()/@label]) or (//idx:branch[@md5=current()/@label])">
                    <xsl:variable name="branch" select="(//idx:label[@name=current()/@label]/parent::node()|//idx:branch[@md5=current()/@label])[1]"/>
                    <xsl:attribute name="src-course">
                        <xsl:value-of select="$branch/@course"/>
                    </xsl:attribute>
                    <xsl:attribute name="src-chapter">
                        <xsl:value-of select="$branch/@chapter"/>
                    </xsl:attribute>
                    <xsl:attribute name="src-slide">
                        <xsl:value-of select="$branch/@slide"/>
                    </xsl:attribute>
                    <xsl:attribute name="type">
                        <xsl:value-of select="$branch/@type"/>
                    </xsl:attribute>
                    <xsl:if test="$branch/@item">
                        <xsl:attribute name="item">
                            <xsl:value-of select="$branch/@item"/>
                        </xsl:attribute>
                    </xsl:if>
                    <xsl:attribute name="src-filename">
                        <xsl:value-of select="$branch/@filename"/>
                    </xsl:attribute>
                    <xsl:attribute name="md5">
                        <xsl:value-of select="$branch/@md5"/>
                    </xsl:attribute>
                    <xsl:attribute name="class">
                        <xsl:text>lcref</xsl:text>
                    </xsl:attribute>
                    <xsl:attribute name="serial">
                        <xsl:value-of select="$branch/@serial"/>
                    </xsl:attribute>
                    <xsl:element name="title" namespace="{$lv}">
                        <xsl:choose>
                            <xsl:when test="$branch/idx:title">
                                <xsl:copy-of select="($branch/idx:title/*)|($branch/idx:title/text())"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="concat($branch/@type, ' ', $branch/@item)"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:element>
                    <!-- <xsl:if test="$branch/lv:title">
                        <xsl:element name="src-title" namespace="{$lv}">
                            <xsl:text>[</xsl:text>
                            <xsl:apply-templates select="./lv:title/*|./lv:title/text()"/>
                            <xsl:text>]</xsl:text>
                        </xsl:element>
                    </xsl:if> -->
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

    <xsl:template match="text()">
        <xsl:value-of select="." disable-output-escaping="no" />
        <!-- <xsl:copy-of select="current()"/> -->
    </xsl:template>
    
    <xsl:template match="comment()">
        <!-- <xsl:element name="paragraphs" namespace="{$lv}"> -->
            <xsl:comment>
                <xsl:value-of select="." disable-output-escaping="no" />
            </xsl:comment>
        <!-- </xsl:element> -->
    </xsl:template>

</xsl:stylesheet>
