<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xh="http://www.w3.org/1999/xhtml"
    xmlns:lml="http://dlmf.nist.gov/LaTeXML"
    xmlns:lv = "http://www.math.cuhk.edu.hk/~pschan/cranach"
    xmlns:m = "http://www.w3.org/1998/Math/MathML"
    >

    <xsl:strip-space elements="xh:* lv:newcol lv:collapse lv:title lv:slide"/>
    <xsl:preserve-space elements="xh:pre xh:textarea lv:paragraphs"/>

    <xsl:output method="html"/>

    <xsl:param name="contenturl" select="''" />
	<xsl:param name="contentdir" select="''" />

    <xsl:variable name="xh" select="'http://www.w3.org/1999/xhtml'"/>

    <xsl:template match="xh:*">
        <xsl:element name="{local-name()}" namespace="{$xh}">
            <xsl:copy-of select="@*[(name(.)!='environment') and (name(.)!='chapter_type')]"/>
            <xsl:apply-templates select="text()|comment()|*"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:document">
        <xsl:apply-templates select="*" />
    </xsl:template>

    <xsl:template match="lv:keywords" />

    <xsl:template match="lv:slides">
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:param name="chapter_title" select="@chapter_title"/>
        <xsl:param name="section" select="@section"/>
        <xsl:param name="section_title" select="@section_title"/>
        <xsl:param name="subsection" select="@subsection"/>
        <xsl:param name="subsection_title" select="@subsection_title" />
        <xsl:param name="subsubsection" select="@subsubsection"/>
        <xsl:apply-templates select="lv:slide">
            <xsl:with-param name="course" select="$course"/>
            <xsl:with-param name="chapter" select="$chapter"/>
            <xsl:with-param name="chapter_type" select="$chapter_type"/>
            <xsl:with-param name="chapter_title" select="$chapter_title"/>
            <xsl:with-param name="section" select="$section"/>
            <xsl:with-param name="section_title" select="$section_title"/>
            <xsl:with-param name="subsection" select="$subsection"/>
            <xsl:with-param name="subsection_title" select="@title"/>
            <xsl:with-param name="subsubsection" select="$subsubsection"/>
            <xsl:with-param name="subsubsection_title" select="@title"/>
        </xsl:apply-templates>
    </xsl:template>

    <xsl:template match="lv:slide">
        <xsl:variable name="slide">
            <xsl:number format="1" level="any" count="lv:slide"/>
        </xsl:variable>
        <div class="slide collapsed">
            <xsl:copy-of select="@*"/>
            <xsl:attribute name="id">
                <xsl:text>s</xsl:text>
                <xsl:value-of select="$slide"/>
            </xsl:attribute>
            <xsl:attribute name="slide">
                <xsl:value-of select="$slide"/>
            </xsl:attribute>
            <div wbtag="ignore">
                <div class="slide_number hidden" style="display:none">
                    <button class="plain_button slide_button">
                        <xsl:copy-of select="@*[name()!='wbtag']"/>
                        <xsl:text>Slide </xsl:text>
                        <xsl:value-of select="$slide"/>
                    </button>
                </div>
                <div class="slide_content">
                    <xsl:apply-templates select="*" />
                </div>
            </div>
        </div>
    </xsl:template>

    <xsl:template match="lv:figure">
		<xsl:variable name="chapter">
			<xsl:choose>
				<xsl:when test="ancestor::chapter">
					<xsl:value-of select="ancestor::lv:chapter/@num"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="@chapter"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="num">
			<xsl:choose>
				<xsl:when test="ancestor::chapter">
					<xsl:number level="any"  count="lv:chapter[@num=$chapter]//lv:figure"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="@num"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="serial">
			<xsl:choose>
				<xsl:when test="ancestor::chapter">
					<xsl:choose>
						<xsl:when test="ancestor::lv:chapter/@no_serial">
							<xsl:value-of select="@item"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="concat(ancestor::lv:chapter/@num, '.', $num)"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="@item"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<p wbtag="ignore"/>
		<div class='image'>
			<xsl:attribute name="class">
				<xsl:text>image</xsl:text>
			</xsl:attribute>
			<xsl:attribute name="wbtag">
				<xsl:value-of select="@wbtag"/>
			</xsl:attribute>
			<xsl:attribute name="wbname">
				<xsl:value-of select="name()"/>
			</xsl:attribute>
			<xsl:attribute name="serial">
				<xsl:value-of select="$serial"/>
			</xsl:attribute>
			<xsl:apply-templates select="lv:label"/>
			<xsl:apply-templates select="*[not(self::lv:caption) and not(self::lv:label)]"/>
			<xsl:apply-templates select="lv:caption">
				<xsl:with-param name="serial" select="$serial"/>
			</xsl:apply-templates>
		</div>
	</xsl:template>

	<xsl:template match="lv:caption">
		<xsl:param name="serial" select="''"/>
        <div wbtag="skip">
			<small class="caption" wbtag="ignore">
				<!-- <xsl:attribute name="wbtag">
				<xsl:value-of select="'caption'"/>
			    </xsl:attribute> -->
				<xsl:value-of select="concat('Figure ', $serial, ' ')"/>
				<!-- <xsl:apply-templates select="text()"/> -->
			</small>
			<small class="caption">
				<xsl:attribute name="wbtag">
					<xsl:value-of select="'caption'"/>
				</xsl:attribute>
				<!-- <xsl:value-of select="concat('Figure ', $serial, ' ')"/> -->
				<xsl:apply-templates select="text()"/>
			</small>
		</div>
	</xsl:template>

    <xsl:template match="lv:statement">
        <p wbtag="ignore"/>
        <div>
            <xsl:attribute name="class">
                <xsl:text>statement</xsl:text>
            </xsl:attribute>
            <xsl:attribute name="wbtag">
                <xsl:value-of select="@wbtag"/>
            </xsl:attribute>
            <xsl:attribute name="wbname">
                <xsl:value-of select="name()"/>
            </xsl:attribute>
            <xsl:attribute name="id">
                <xsl:value-of select="concat('statement', @chapter, '-', @num)"/>
            </xsl:attribute>
            <xsl:attribute name="type">
                <xsl:value-of select="@type"/>
            </xsl:attribute>
            <xsl:copy-of select="@*"/>
            <a target="_blank">
                <xsl:attribute name="href">
                    <xsl:value-of select="concat($contenturl, '&amp;', 'item=', @item)"/>
                </xsl:attribute>
                <xsl:copy-of select="@*"/>
                <xsl:attribute name="wbtag">
                    <xsl:text>ignore</xsl:text>
                </xsl:attribute>
                <h5 wbtag="ignore">
                    <span wbtag="ignore">
                        <xsl:value-of select="@course"/>
                    </span>
                </h5>
                <br/>
                <h5 wbtag="ignore">
                    <xsl:value-of select="@type"/>
                    <span style="margin-left:0.5em" wbtag="ignore">
                        <xsl:value-of select="@item"/>
                    </span>
                </h5>
                <xsl:apply-templates select="@title"/>
            </a>
            <br/>
            <xsl:apply-templates select="*[not(self::lv:title) and not(self::lv:label)]"/>
        </div>
    </xsl:template>

    <xsl:template match="lml:theorem">
        <p wbtag="ignore"/>
        <div>
            <xsl:copy-of select="@*"/>
            <button class="plain_button item_button" onmouseover="this.style.backgroundColor=''" onmouseout="this.style.backgroundColor=''">
                <!-- <xsl:copy-of select="@*"/> -->
                <xsl:attribute name="wbtag">
                    <xsl:text>ignore</xsl:text>
                </xsl:attribute>
                <h5 wbtag="ignore">
                    <xsl:value-of select="lml:title"/>
                </h5>
            </button>
            <!-- <xsl:apply-templates select="@title"/> -->

            <blockquote wbtag="skip">
                <xsl:apply-templates select="lml:para"/>
            </blockquote>
        </div>
    </xsl:template>

    <xsl:template match="@title">
        <div style="display:inline-block" wbtag='ignore'>
            <xsl:copy-of select="@*"/>
            <strong style="padding-left:0.5em;padding-right:0.5em">-</strong>
            <h5>
                <xsl:value-of select="."/>
            </h5>
        </div>
    </xsl:template>

    <!-- <xsl:template match="lv:substatement">
        <div>
            <xsl:attribute name="class">
                <xsl:text>substatement</xsl:text>
            </xsl:attribute>
            <xsl:attribute name="wbtag">
                <xsl:value-of select="@wbtag"/>
            </xsl:attribute>
            <xsl:attribute name="wbname">
                <xsl:value-of select="name()"/>
            </xsl:attribute>
            <xsl:attribute name="type">
                <xsl:value-of select="@type"/>
            </xsl:attribute>
            <xsl:copy-of select="@*"/>
            <h5 wbtag="ignore">
                <xsl:value-of select="@type"/>
                <span style="margin-left:0.5em">
                    <xsl:value-of select="@title"/>
                </span>
            </h5>
            <xsl:apply-templates select="title"/>
            <xsl:apply-templates select="*[not(self::title)]|text()"/>
        </div>
    </xsl:template> -->

    <xsl:template match="lv:course|lv:topic">
        <h2>
            <xsl:attribute name="metadata"/>
            <xsl:attribute name="wbtag">
                <xsl:value-of select="@wbtag"/>
            </xsl:attribute>
            <xsl:attribute name="chapter">
                <xsl:value-of select="@chapter"/>
            </xsl:attribute>
            <xsl:apply-templates select="text()|xh:br"/>
        </h2>
    </xsl:template>

    <xsl:template match="lv:week|lv:lecture">
        <h2>
            <xsl:attribute name="metadata"/>
            <xsl:choose>
                <xsl:when test="(@chapter_type)!=''">
                    <xsl:attribute name="chapter_type">
                        <xsl:value-of select="@chapter_type"/>
                    </xsl:attribute>
                </xsl:when>
            </xsl:choose>
            <xsl:attribute name="wbtag">
                <xsl:value-of select="@wbtag"/>
            </xsl:attribute>
            <xsl:attribute name="chapter">
                <xsl:value-of select="@chapter"/>
            </xsl:attribute>
            <xsl:value-of select="(@chapter_type)"/>
            <xsl:text> </xsl:text>
            <!-- <xsl:value-of select="@content"/> -->
            <xsl:apply-templates select="text()|xh:br"/>
        </h2>
    </xsl:template>

    <xsl:template match="lv:ref">
		<xsl:element name="a">
			<xsl:copy-of select="@*"/>
			<xsl:attribute name="src-chapter">
				<xsl:value-of select="@src-chapter"/>
			</xsl:attribute>
			<xsl:attribute name="item">
				<xsl:value-of select="@item"/>
			</xsl:attribute>
			<xsl:attribute name="type">
				<xsl:value-of select="@type"/>
			</xsl:attribute>
			<xsl:attribute name="class">
				<xsl:choose>
					<xsl:when test="@type!='Section'">
						<xsl:text>lcref</xsl:text>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text>href</xsl:text>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:attribute>
			<xsl:if test="@type='Section'">
				<xsl:value-of select="concat('Section ', @serial, ' (')"/>
			</xsl:if>
			<xsl:choose>
				<xsl:when test="@name">
					<xsl:value-of select="@name" />
				</xsl:when>
				<xsl:otherwise>
					<xsl:apply-templates select="lv:title"/>
				</xsl:otherwise>
			</xsl:choose>
			<xsl:if test="@type='Section'">
				<xsl:value-of select="')'"/>
			</xsl:if>
		</xsl:element>
	</xsl:template>


    <xsl:template match="lv:statement/lv:title">
        <div style="display:inline-block">
            <xsl:copy-of select="@*"/>
            <xsl:attribute name="wbtag">
                <xsl:value-of select="'transparent'"/>
            </xsl:attribute>
            <strong wbtag="ignore">&#160;-&#160;</strong>
            <xsl:element name="h5">
                <xsl:attribute name="wbtag">title</xsl:attribute>
                <xsl:apply-templates select="*[not(self::lv:label)]|text()"/>
            </xsl:element>
        </div>
    </xsl:template>

    <xsl:template match="lv:statement/lv:title[text()='.']" />

    <xsl:template match="lv:substatement">
        <div>
            <xsl:attribute name="class">
                <xsl:text>substatement</xsl:text>
            </xsl:attribute>
            <xsl:attribute name="wbtag">
                <xsl:value-of select="@wbtag"/>
            </xsl:attribute>
            <xsl:attribute name="wbname">
                <xsl:value-of select="name()"/>
            </xsl:attribute>
            <xsl:attribute name="type">
                <xsl:value-of select="@type"/>
            </xsl:attribute>
            <xsl:copy-of select="@*"/>
            <blockquote wbtag="skip">
                <a target="_blank">
                    <xsl:attribute name="href">
                        <xsl:value-of select="concat($contenturl, '&amp;', 'md5=', @md5)"/>
                    </xsl:attribute>
                    <xsl:copy-of select="@*"/>
                    <xsl:attribute name="wbtag">
                        <xsl:text>ignore</xsl:text>
                    </xsl:attribute>
                    <h5 wbtag="ignore">
                        <xsl:value-of select="@type"/>
                        <span style="margin-left:0.5em" wbtag="ignore">
                            <xsl:value-of select="@item"/>
                        </span>
                    </h5>
                    <xsl:apply-templates select="@title"/>
                </a>
                <!-- <xsl:element name="h5">
                    <xsl:attribute name="wbtag">ignore</xsl:attribute>
                    <xsl:attribute name="class">item_title</xsl:attribute>
                    <xsl:value-of select="@type"/>
                    <xsl:if test="lv:title">
                        <xsl:value-of select="'&#160;'"/>
                        <xsl:apply-templates select="lv:title"/>
                    </xsl:if>
                    <xsl:value-of select="'.'"/>
                </xsl:element> -->
                <xsl:apply-templates select="*[not(self::lv:title) and not(self::lv:label)]"/>
            </blockquote>
        </div>
    </xsl:template>

    <xsl:template match="lv:title[@scope='course']">
        <h1 class="course_title">
            <xsl:attribute name="wbtag">
                <xsl:value-of select="'course'"/>
            </xsl:attribute>
            <xsl:attribute name="type">
                <xsl:value-of select="'Course'"/>
            </xsl:attribute>
            <xsl:attribute name="course">
                <xsl:value-of select="@title"/>
            </xsl:attribute>
            <span wbtag="title" class="title">
                <xsl:apply-templates select="text()"/>
            </span>
        </h1>
    </xsl:template>

    <xsl:template match="lv:title[@scope='chapter']">
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:choose>
            <xsl:when test="ancestor::lv:chapter/@no_serial">
                <h2 class="chapter_title title">
                    <span wbtag="title" class="title">
                        <xsl:apply-templates select="text()|*"/>
                    </span>
                </h2>
            </xsl:when>
            <xsl:otherwise>
                <h2 class="chapter_title title">
                    <xsl:attribute name="serial">
                        <xsl:value-of select="ancestor::lv:chapter/@num"/>
                    </xsl:attribute>
                    <xsl:attribute name="wbtag">
                        <xsl:value-of select="@wbtag"/>
                    </xsl:attribute>
                    <xsl:attribute name="type">
                        <xsl:value-of select="ancestor::lv:chapter/@chapter_type"/>
                    </xsl:attribute>
                    <xsl:attribute name="chapter">
                        <xsl:value-of select="@chapter"/>
                    </xsl:attribute>
                    <span class="type">
                        <xsl:value-of select="ancestor::lv:chapter/@chapter_type"/>
                    </span>
                    <xsl:text> </xsl:text>
                    <span class="num">
                        <xsl:value-of select="ancestor::lv:chapter/@num"/>
                    </span>
                    <br wbtag="ignore"/>
                    <span wbtag="title" class="title">
                        <xsl:apply-templates select="text()|*"/>
                    </span>
                </h2>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="lv:topic[@scope='chapter']">
        <h3 class="topic">
            <xsl:copy-of select="@*" />
            <xsl:attribute name="wbtag">
                <xsl:value-of select="'topic'"/>
            </xsl:attribute>
            <xsl:attribute name="chapter">
                <xsl:value-of select="ancestor::lv:chapter/@num"/>
            </xsl:attribute>
            <xsl:apply-templates select="text()"/>
        </h3>
    </xsl:template>

    <xsl:template match="lv:title[@scope='section']">
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:param name="chapter_title" select="@chapter_title"/>
        <xsl:param name="section" select="@section"/>
        <xsl:param name="section_title" select="@section_title"/>
        <h3 wbtag="section" class="title">
            <xsl:variable name="serial">
                <xsl:value-of select="$chapter"/>
                <xsl:text>.</xsl:text>
                <xsl:value-of select="$section"/>
            </xsl:variable>
            <xsl:attribute name="serial">
                <xsl:value-of select="$serial"/>
            </xsl:attribute>
            <xsl:attribute name="type">
                <xsl:value-of select="'Section'"/>
            </xsl:attribute>
            <xsl:value-of select="$chapter"/>
            <xsl:text>.</xsl:text>
            <xsl:value-of select="$section"/>
            <xsl:text> </xsl:text>
            <span wbtag="title" class="title">
                <xsl:apply-templates select="*|text()"/>
            </span>
        </h3>
    </xsl:template>
    <xsl:template match="lv:title[@scope='subsection']">
        <xsl:param name="course" select="@course"/>
        <xsl:param name="chapter" select="@chapter"/>
        <xsl:param name="chapter_type" select="@chapter_type"/>
        <xsl:param name="chapter_title" select="@chapter_title"/>
        <xsl:param name="section" select="@section"/>
        <xsl:param name="section_title" select="@section_title"/>
        <xsl:param name="subsection" select="@subsection"/>
        <xsl:param name="subsection_title" select="@subsection_title"/>
        <h4 wbtag="subsection" class="title">
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
            <xsl:value-of select="$serial"/>
            <xsl:text> </xsl:text>
            <span wbtag="title" class="title">
                <xsl:apply-templates select="text()|*"/>
            </span>
        </h4>
    </xsl:template>

    <xsl:template match="lv:title[@scope='subsubsection']">
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
        <h5 wbtag="subsubsection" class="title">
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
            <span wbtag="title" class="title">
                <xsl:apply-templates select="text()|*"/>
            </span>
        </h5>
        <br/>
    </xsl:template>

    <xsl:template match="lv:href">
        <xsl:element name="a">
            <xsl:copy-of select="@*"/>
            <xsl:attribute name="target">
                <xsl:text>_blank</xsl:text>
            </xsl:attribute>
            <xsl:attribute name="href">
                <xsl:value-of select="@src"/>
            </xsl:attribute>
            <xsl:value-of select="@name"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:ref">
        <xsl:element name="a">
            <xsl:copy-of select="@*"/>
            <xsl:attribute name="src-chapter">
                <xsl:value-of select="@src-chapter"/>
            </xsl:attribute>
            <xsl:attribute name="item">
                <xsl:value-of select="@item"/>
            </xsl:attribute>
            <xsl:attribute name="type">
                <xsl:value-of select="@type"/>
            </xsl:attribute>
            <xsl:attribute name="class">
                <xsl:choose>
                    <xsl:when test="@item">
                        <xsl:text>lcref</xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:text>href</xsl:text>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            <xsl:if test="@type='Section'">
                <xsl:value-of select="concat('Section ', @serial, ' (')"/>
            </xsl:if>
            <xsl:choose>
                <xsl:when test="@name">
                    <xsl:value-of select="@name" />
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates select="lv:title"/>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:if test="@type='Section'">
                <xsl:value-of select="')'"/>
            </xsl:if>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:wiki">
        <xsl:element name="div">
            <xsl:attribute name="class">
                <xsl:value-of select="name()"/>
            </xsl:attribute>
            <xsl:value-of select="."/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:inline_keyword">
        <b wbtag="keyword">
            <xsl:value-of select="."/>
        </b>
    </xsl:template>

    <xsl:template match="lv:newcol|lv:collapse">
        <xsl:variable name="col">
            <xsl:number format="1" level="any" count="lv:newcol|lv:collapse"/>
        </xsl:variable>
        <!-- <a class="collapsea collapsed" contenteditable="false" data-toggle="collapse" aria-expanded="false" wbtag="ignore"> -->
        <!--     <xsl:attribute name="aria-controls">s<xsl:value-of select="$col"/><xsl:value-of select="@id" /></xsl:attribute> -->
        <!--     <xsl:attribute name="href">#s<xsl:value-of select="$col"/><xsl:value-of select="@id" /></xsl:attribute> -->
        <!--     ► -->
        <!-- </a> -->
        <!-- <div class="collapse"> -->
        <div>
            <xsl:attribute name="id">s<xsl:value-of select="$col"/><xsl:value-of select="@id" /></xsl:attribute>
            <xsl:attribute name="wbtag">
                <xsl:value-of select="@wbtag"/>
            </xsl:attribute>
            <xsl:apply-templates select="*|text()" />
        </div>
    </xsl:template>

    <xsl:template match="xh:iframe|xh:img">
        <xsl:element name="{local-name()}" namespace="{$xh}">
            <xsl:copy-of select="@*[(name(.)!='src') and (name(.)!='environment')]"/>
            <xsl:if test="@src">
                <xsl:attribute name="data-src">
                    <xsl:value-of select="@src"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:attribute name="rendered">0</xsl:attribute>
            <xsl:apply-templates select="text()|comment()|*"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="xh:li">
        <xsl:element name="{local-name()}" namespace="{$xh}">
            <xsl:copy-of select="@*[(name(.)!='environment') and (name(.)!='chapter_type')]"/>
            <!-- <xsl:apply-templates select="text()|comment()|*[not(self::lv:paragraphs)]|lv:paragraphs/text()"/> -->
            <xsl:apply-templates select="text()|comment()|*"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:math">
        <!-- <xsl copy-of select="current()"/> -->
        <xsl:element name="{name()}">
            <xsl:copy-of select="@*"/>
            <xsl:copy-of select="node()"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="lv:framebox">
        <div style="width:100%;text-align:center">
            <xsl:copy-of select="@wbtag"/>
            <div style="display:inline-block;border: 5px solid #428bc1;padding:10px">
                <xsl:apply-templates select="text()|comment()|*"/>
            </div>
        </div>
    </xsl:template>

    <xsl:template match="lv:center">
        <div style="display:table;width:100%;text-align:center;margin:auto;padding:1em" class="center">
            <xsl:copy-of select="@wbtag"/>
            <xsl:apply-templates select="text()|comment()|*"/>
        </div>
    </xsl:template>

    <xsl:template match="lv:left">
        <div style="display:table-cell;vertical-align:middle;padding:10px;width:50%;text-align:center" class="dual-left">
            <xsl:copy-of select="@wbtag"/>
            <xsl:apply-templates select="text()|comment()|*"/>
        </div>
    </xsl:template>

    <xsl:template match="lv:right">
        <div style="display:table-cell;vertical-align:middle;padding:10px;width:50%;text-align:center" class="dual-right">
            <xsl:copy-of select="@wbtag"/>
            <xsl:apply-templates select="text()|comment()|*"/>
        </div>
    </xsl:template>

    <xsl:template match="lv:qed">
        <div style='width:100%;text-align:right;color:#428bc1' wbtag="qed">&#x25fc;&#xFE0E;</div>
    </xsl:template>


    <xsl:template match="lv:col_ul">
        <ul wbtag="col_ul">
            <!-- <xsl:copy-of select="@*"/> -->
            <xsl:apply-templates select="lv:col_li"/>
        </ul>
    </xsl:template>

    <xsl:template match="lv:col_ol">
        <ol wbtag="col_ol">
            <!-- <xsl:copy-of select="@*"/> -->
            <xsl:apply-templates select="lv:col_li"/>
        </ol>
    </xsl:template>
    <xsl:template match="lv:col_li">
        <xsl:variable name="li">
            <xsl:number format="1" level="any" count="lv:col_li"/>
        </xsl:variable>
        <li wbtag="skip">
            <xsl:variable name="id">
                <xsl:value-of select="concat('s', $timestamp, $li)" />
            </xsl:variable>
            <a class="collapsea collapsed" contenteditable="false" data-toggle="collapse" aria-expanded="false" wbtag="ignore">
                <xsl:attribute name="aria-controls"><xsl:value-of select="$id" /></xsl:attribute>
                <xsl:attribute name="href">#<xsl:value-of select="$id" /></xsl:attribute>
                ►
            </a>
            <div class="collapse">
                <xsl:attribute name="id"><xsl:value-of select="$id" /></xsl:attribute>
                <xsl:attribute name="wbtag">
                    <xsl:value-of select="@wbtag"/>
                </xsl:attribute>
                <xsl:apply-templates select="*" />
            </div>
        </li>
    </xsl:template>

    <xsl:template match="lv:steps">
        <div wbtag="steps">
            <xsl:apply-templates select="*|text()" />
            <div style="text-align:right" wbtag="ignore">
                <button class="btn btn-outline-info btn-sm">
                    <xsl:attribute name="onclick">
                        <xsl:value-of select="concat('showStep(&quot;', @stepsid, '&quot;)')" />
                    </xsl:attribute>
                    <xsl:attribute name="id">
                        <xsl:value-of select="concat('next', @stepsid)" />
                    </xsl:attribute>
                    next
                </button>
                <button class="btn btn-outline-info btn-sm" style="margin-left:5px" disabled="true">
                    <xsl:attribute name="onclick">
                        <xsl:value-of select="concat('resetSteps(&quot;', @stepsid, '&quot;)')" />
                    </xsl:attribute>
                    <xsl:attribute name="id">
                        <xsl:value-of select="concat('reset', @stepsid)" />
                    </xsl:attribute>
                    reset
                </button>
            </div>
        </div>
    </xsl:template>

    <!-- <xsl:template match="lv:newline|xh:newline|newline"> -->
    <xsl:template match="lv:newline">
        <br wbtag="newline"/>
    </xsl:template>


    <xsl:template match="lv:para">
        <div wbtag="para">
            <xsl:apply-templates select="*|text()"/>
        </div>
    </xsl:template>

    <xsl:template match="lv:webwork">
        <div>
            <xsl:attribute name="class">
                <xsl:text>webwork</xsl:text>
            </xsl:attribute>
            <xsl:copy-of select="@*"/>
            <strong class="webwork_label print">WeBWorK</strong>
            <!-- <small class="light"> (powered by </small>
            <small><a target="_blank" href="https://libretexts.org/">LibreTexts</a></small>
            <small class="light">)</small> -->
            <div class="ww" style="overflow:auto">
                <xsl:attribute name="id">
                    <xsl:value-of select="concat('ww_inner_', @ww_id)" />
                </xsl:attribute>
                <!-- <img class="loading_icon exempt" src="icons/Loading_icon.gif"/> -->
                <div class="spinner-border text-secondary" style="margin:2em" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <iframe style="overflow-x:auto;overflow-y:hidden;display:none">
                    <xsl:attribute name="rendered">0</xsl:attribute>
                    <xsl:attribute name="data-src">
						<xsl:value-of select="concat('https://www.math.cuhk.edu.hk/~pschan/wwfwd/index.php?sourceFilePath=',@pg_file, '&amp;answersSubmitted=0&amp;problemSeed=123567890&amp;displayMode=MathJax&amp;courseID=daemon_course&amp;outputformat=simple')"/>
                        <!-- <xsl:value-of select="concat('https://webwork.math.cuhk.edu.hk/webwork2/html2xml?sourceFilePath=',@pg_file, '&amp;answersSubmitted=0&amp;problemSeed=123567890&amp;displayMode=MathJax&amp;courseID=daemon_course&amp;userID=daemon&amp;course_password=daemon&amp;outputformat=simple')"/> -->
                        <!-- <xsl:value-of select="concat('https://webwork.libretexts.org/webwork2/html2xml?sourceFilePath=',@pg_file, '&amp;answersSubmitted=0&amp;problemSeed=123567890&amp;displayMode=MathJax&amp;courseID=anonymous&amp;userID=anonymous&amp;course_password=anonymous&amp;showSummary=1&amp;language=en&amp;outputformat=libretexts')"/> -->
                    </xsl:attribute>
                </iframe>
            </div>
        </div>
        <br/>
    </xsl:template>

    <!-- <xsl:template match="lv:image">
        <xsl:element name="div">
            <xsl:attribute name="class">
                <xsl:text>image</xsl:text>
            </xsl:attribute>
            <xsl:copy-of select="@*[name(.)!='src']"/>
            <xsl:element name="img">
                <xsl:attribute name="wbtag">ignore</xsl:attribute>
                <xsl:copy-of select="@*[name(.)!='src']"/>
                <xsl:attribute name="rendered">0</xsl:attribute>
            </xsl:element>
        </xsl:element>
    </xsl:template> -->
    <xsl:template match="lv:image">
		<xsl:element name="div">
			<xsl:attribute name="class">
				<xsl:text>image</xsl:text>
			</xsl:attribute>
			<xsl:copy-of select="@*[name(.)!='src']"/>
			<xsl:element name="img">
				<xsl:attribute name="wbtag">ignore</xsl:attribute>
				<xsl:copy-of select="@*[name(.)!='src']"/>
				<xsl:attribute name="rendered">0</xsl:attribute>
				<xsl:choose>
					<xsl:when test="contains(@data-src, 'http')">
						<xsl:attribute name="data-src">
							<xsl:value-of select="@data-src"/>
						</xsl:attribute>
					</xsl:when>
					<xsl:otherwise>
						<xsl:attribute name="data-src">
							<xsl:value-of select="concat($contentdir, '/', @data-src)"/>
						</xsl:attribute>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:element>
		</xsl:element>
	</xsl:template>

    <!-- <xsl:template match="lv:paragraphs|*[@wbtag='paragraphs']"> -->
    <xsl:template match="lv:paragraphs">
        <!-- <xsl:text>&#x0A;</xsl:text> -->
        <!-- <xsl:apply-templates select="text()"/> -->
        <!-- <xsl:value-of select="normalize-space(./text())" disable-output-escaping="yes"/> -->
        <span class="paragraphs">
            <xsl:value-of select="text()" disable-output-escaping="yes"/>
        </span>
        <!-- <xsl:value-of select="text()" disable-output-escaping="yes"/> -->
    </xsl:template>

    <xsl:template match="lv:enumerate">
        <xsl:param name="context" select="''"/>
        <xsl:text>&#x0A;</xsl:text>
        <xsl:element name="ol" namespace="{$xh}">
            <xsl:copy-of select="@wbtag"/>
            <!-- <xsl:if test="$context!='enumerate'">
            <xsl:attribute name="type">1|a|i</xsl:attribute>
        </xsl:if> -->
        <xsl:apply-templates select="lv:item">
            <xsl:with-param name="context" select="local-name()"/>
        </xsl:apply-templates>
    </xsl:element>
    <xsl:text>&#x0A;</xsl:text>
</xsl:template>

<xsl:template match="lv:itemize">
    <xsl:param name="context" select="''"/>
    <xsl:text>&#x0A;</xsl:text>
    <xsl:element name="ul" namespace="{$xh}">
        <xsl:copy-of select="@wbtag"/>
        <xsl:apply-templates select="lv:item">
            <xsl:with-param name="context" select="local-name()"/>
        </xsl:apply-templates>
    </xsl:element>
    <xsl:text>&#x0A;</xsl:text>
</xsl:template>

<xsl:template match="lv:item">
    <xsl:param name="context" select="''"/>
    <xsl:text>&#x0A;</xsl:text>
    <xsl:element name="li" namespace="{$xh}">
        <xsl:copy-of select="@wbtag"/>
        <xsl:apply-templates select="*">
            <xsl:with-param name="context" select="$context"/>
        </xsl:apply-templates>
    </xsl:element>
    <xsl:text>&#x0A;</xsl:text>
</xsl:template>

<xsl:template match="lv:escaped">
    <xsl:element name="span" namespace="{$xh}">
        <xsl:copy-of select="@*"/>
        <xsl:attribute name="class">
            <xsl:value-of select="'escaped'"/>
        </xsl:attribute>
        <xsl:value-of select="concat('@', @argument)"/>
    </xsl:element>
</xsl:template>

<xsl:template match="math">
    <!-- <xsl copy-of select="current()"/> -->
    <xsl:element name="{name()}">
        <xsl:copy-of select="@*"/>
        <xsl:copy-of select="node()"/>
    </xsl:element>
</xsl:template>

<xsl:template match="framebox">
    <div style="width:100%;text-align:center">
        <div style="display:inline-block;border: 5px solid #428bc1;padding:10px">
            <xsl:apply-templates select="text()|comment()|*"/>
        </div>
    </div>
</xsl:template>

<xsl:template match="lv:qed">
    <div style='width:100%;text-align:right;color:#428bc1' wbtag="qed">&#x25fc;&#xFE0E;</div>
</xsl:template>

<!-- <xsl:template match="xh:hr|xh:br">
<xsl:element name="{local-name()}" />
</xsl:template> -->

<xsl:template match="lv:col_ul">
    <ul wbtag="col_ul">
        <!-- <xsl:copy-of select="@*"/> -->
        <xsl:apply-templates select="lv:col_li|lv:col_ul|lv:col_ol"/>
    </ul>
</xsl:template>

<xsl:template match="lv:col_ol">
    <ol wbtag="col_ol">
        <!-- <xsl:copy-of select="@*"/> -->
        <xsl:apply-templates select="lv:col_li|lv:col_ul|lv:col_ol"/>
    </ol>
</xsl:template>
<xsl:template match="lv:col_li">
    <xsl:variable name="li">
        <xsl:number format="1" level="any" count="lv:col_li"/>
    </xsl:variable>
    <li wbtag="skip">
        <!-- <xsl:attribute name="wbtag">
        <xsl:value-of select="@wbtag"/>
    </xsl:attribute> -->
    <!-- <a class="collapsea collapsed" contenteditable="false" data-toggle="collapse" aria-expanded="false" wbtag="ignore"> -->
    <!--     <xsl:attribute name="aria-controls">s<xsl:value-of select="$li"/><xsl:value-of select="@id" /></xsl:attribute> -->
    <!--     <xsl:attribute name="href">#s<xsl:value-of select="$li"/><xsl:value-of select="@id" /></xsl:attribute> -->
    <!--     ► -->
    <!-- </a> -->
    <!-- <div class="collapse"> -->
    <div>
        <xsl:attribute name="id">s<xsl:value-of select="$li"/><xsl:value-of select="@id" /></xsl:attribute>
        <xsl:attribute name="wbtag">
            <xsl:value-of select="@wbtag"/>
        </xsl:attribute>
        <xsl:apply-templates select="*|text()" />
    </div>
</li>
</xsl:template>

<xsl:template match="lv:steps">
    <div wbtag="steps">
        <xsl:apply-templates select="*|text()" />
        <div style="text-align:right" wbtag="ignore">
            <button class="btn btn-outline-info btn-sm">
                <xsl:attribute name="onclick">
                    <xsl:value-of select="concat('showStep(&quot;', @stepsid, '&quot;)')" />
                </xsl:attribute>
                <xsl:attribute name="id">
                    <xsl:value-of select="concat('next', @stepsid)" />
                </xsl:attribute>
                next
            </button>
            <button class="btn btn-outline-info btn-sm" style="margin-left:5px" disabled="true">
                <xsl:attribute name="onclick">
                    <xsl:value-of select="concat('resetSteps(&quot;', @stepsid, '&quot;)')" />
                </xsl:attribute>
                <xsl:attribute name="id">
                    <xsl:value-of select="concat('reset', @stepsid)" />
                </xsl:attribute>
                reset
            </button>
        </div>
    </div>
</xsl:template>

<xsl:template match="lv:newline">
    <span wbtag="newline" class="newline"></span>
</xsl:template>

<xsl:template match="lv:webwork">
    <xsl:element name="div">
        <xsl:attribute name="class">
            <xsl:text>webwork</xsl:text>
        </xsl:attribute>
        <xsl:copy-of select="@*"/>
        <strong class="print">WeBWork </strong>
        <!-- <xsl:value-of select="(@pg_file)"/> -->
    </xsl:element>
</xsl:template>

<xsl:template match="lv:wb_image">
    <xsl:element name="div">
        <xsl:attribute name="class">
            <xsl:text>image</xsl:text>
        </xsl:attribute>
        <xsl:copy-of select="@*"/>
        <xsl:element name="img">
            <xsl:attribute name="wbtag">ignore</xsl:attribute>
            <xsl:attribute name="src">
                <xsl:value-of select="@data-src"/>
            </xsl:attribute>
        </xsl:element>
    </xsl:element>
</xsl:template>

<xsl:template match="lv:enumerate">
    <xsl:param name="context" select="''"/>
    <xsl:text>&#x0A;</xsl:text>
    <xsl:element name="ol" namespace="{$xh}">
        <xsl:copy-of select="@wbtag"/>
        <!-- <xsl:if test="$context!='enumerate'">
        <xsl:attribute name="type">1|a|i</xsl:attribute>
    </xsl:if> -->
    <xsl:apply-templates select="lv:item">
        <xsl:with-param name="context" select="local-name()"/>
    </xsl:apply-templates>
</xsl:element>
<xsl:text>&#x0A;</xsl:text>
</xsl:template>

<xsl:template match="lv:itemize">
    <xsl:param name="context" select="''"/>
    <xsl:text>&#x0A;</xsl:text>
    <xsl:element name="ul" namespace="{$xh}">
        <xsl:copy-of select="@wbtag"/>
        <xsl:apply-templates select="lv:item">
            <xsl:with-param name="context" select="local-name()"/>
        </xsl:apply-templates>
    </xsl:element>
    <xsl:text>&#x0A;</xsl:text>
</xsl:template>

<xsl:template match="lv:item">
    <xsl:param name="context" select="''"/>
    <xsl:text>&#x0A;</xsl:text>
    <xsl:element name="li" namespace="{$xh}">
        <xsl:copy-of select="@wbtag"/>
        <xsl:apply-templates select="*|text()">
            <xsl:with-param name="context" select="$context"/>
        </xsl:apply-templates>
    </xsl:element>
    <xsl:text>&#x0A;</xsl:text>
</xsl:template>

<xsl:template match="m:math">
    <xsl:element name="math" namespace="http://www.w3.org/1998/Math/MathML">
        <xsl:copy-of select="@*"/>
        <xsl:copy-of select="*"/>
    </xsl:element>
</xsl:template>


<xsl:template match="lv:slide//text()|lml:slide//text()">
    <xsl:element name="span">
        <xsl:attribute name="wbtag">
            <xsl:text>paragraphs</xsl:text>
        </xsl:attribute>
        <xsl:value-of select="." disable-output-escaping="yes" />
    </xsl:element>
</xsl:template>

<xsl:template match="comment()">
    <xsl:copy-of select="current()"/>
    <!-- <xsl:value-of select="." disable-output-escaping="yes" /> -->
</xsl:template>
<xsl:template match="lv:comment">
	<xsl:comment>
		<xsl:copy-of select="current()"/>
		<!-- <xsl:value-of select="." disable-output-escaping="yes" /> -->
	</xsl:comment>
</xsl:template>
</xsl:stylesheet>
