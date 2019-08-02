<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:xh="http://www.w3.org/1999/xhtml"
    xmlns:lv="http://www.math.cuhk.edu.hk/~pschan/cranach"
	xmlns:ltx="http://dlmf.nist.gov/LaTeXML"
	xmlns:idx = "elephas_index"
	xmlns:m = "http://www.w3.org/1998/Math/MathML"
    exclude-result-prefixes="xh"
	>


<!-- <xsl:strip-space elements="*"/> -->
 <xsl:preserve-space elements="xh:pre"/>

  <xsl:output method="html" />

  <xsl:param name="timestamp" select="'0'" />

  <xsl:variable name="xh" select="'http://www.w3.org/1999/xhtml'"/>

  <xsl:template match="/">
      <xsl:apply-templates select="lv:document" />
  </xsl:template>

  <xsl:template match="lv:document">
    <xsl:call-template name="toc" />
    <xsl:apply-templates select="*" />
  </xsl:template>

  <xsl:template name="toc">
      <ul id="toc_src">
          <xsl:for-each select="lv:bare|lv:course|lv:chapter|lv:section|lv:subsection">
              <xsl:call-template name="toc_entry">
                  <xsl:with-param name="course" select="ancestor::lv:course/@course"/>
                  <xsl:with-param name="chapter" select="@chapter"/>
                  <xsl:with-param name="section" select="@section"/>
                  <xsl:with-param name="subsection" select="@subsection"/>
                  <xsl:with-param name="counter" select="@num"/>
              </xsl:call-template>
        </xsl:for-each>
    </ul>
  </xsl:template>

  <xsl:template name="toc_entry">
      <xsl:param name="course" select="@course"/>
      <xsl:param name="chapter" select="@chapter"/>
      <xsl:param name="section" select="@section"/>
      <xsl:param name="subsection" select="@subsection"/>
      <xsl:param name="counter" select="''"/>

      <xsl:variable name="dot">
          <xsl:choose>
              <xsl:when test="$counter!=''">
                  <xsl:value-of select="'.'"/>
              </xsl:when>
              <xsl:otherwise>
                  <xsl:value-of select="''"/>
              </xsl:otherwise>
          </xsl:choose>
      </xsl:variable>

      <li>
          <a href="#">
              <xsl:attribute name="class">
                  <xsl:value-of select="local-name()"/>
              </xsl:attribute>
              <xsl:attribute name="course">
                  <xsl:value-of select="$course"/>
              </xsl:attribute>
              <xsl:attribute name="chapter">
                  <xsl:value-of select="$chapter"/>
              </xsl:attribute>
              <xsl:attribute name="section">
                  <xsl:value-of select="$section"/>
              </xsl:attribute>
              <xsl:attribute name="subsection">
                  <xsl:value-of select="$subsection"/>
              </xsl:attribute>
              <xsl:attribute name="{local-name()}">
                  <xsl:value-of select="@num"/>
              </xsl:attribute>
              <xsl:if test="local-name()!='bare'">
                  <!-- <xsl:value-of select="concat(local-name(), ' ', $counter, ' ', @title, ' ' , @topic)"/> -->
                  <xsl:value-of select="concat(local-name(), ' ', $counter)"/>
                  <xsl:apply-templates select="lv:title//text()">
                      <xsl:with-param name="course" select="ancestor::lv:course/@title"/>
                      <xsl:with-param name="chapter" select="ancestor::lv:chapter/@num"/>
                      <xsl:with-param name="section" select="ancestor::lv:section/@num"/>
                      <xsl:with-param name="subsection" select="ancestor::lv:subsection/@num"/>
                      <xsl:with-param name="subsubsection" select="ancestor::lv:subsubsection/@num"/>
                      <xsl:with-param name="toc" select="'true'"/>
                  </xsl:apply-templates>
              </xsl:if>
          </a>
          <ul>
              <xsl:for-each select="lv:bare|lv:course|lv:chapter|lv:section|lv:subsection">
                  <xsl:call-template name="toc_entry">
                      <xsl:with-param name="course" select="ancestor::lv:course/@title"/>
                      <xsl:with-param name="chapter" select="ancestor::lv:chapter/@num"/>
                      <xsl:with-param name="section" select="ancestor::lv:section/@num"/>
                      <xsl:with-param name="subsection" select="ancestor::lv:subsection/@num"/>
                      <xsl:with-param name="counter" select="concat($counter, $dot, @num)"/>
                  </xsl:call-template>
              </xsl:for-each>
          </ul>
      </li>
  </xsl:template>

  <xsl:template match="lv:bare">
      <xsl:apply-templates select="*">
          <xsl:with-param name="chapter" select="@num"/>
          <xsl:with-param name="course" select="@course"/>
          <xsl:with-param name="chapter" select="@chapter"/>
      </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="lv:course">
    <xsl:apply-templates select="lv:chapter|lv:section|lv:subsection|lv:subsubsection|lv:slides|lv:keywords">
        <xsl:with-param name="course" select="@title"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="lv:topic">
    <h2>
      <xsl:attribute name="metadata"/>
      <xsl:attribute name="wbtag">
        <xsl:value-of select="'topic'"/>
      </xsl:attribute>
      <xsl:attribute name="chapter">
        <xsl:value-of select="@chapter"/>
      </xsl:attribute>
      <xsl:apply-templates select="text()|xh:br"/>
    </h2>
  </xsl:template>

  <xsl:template match="lv:chapter">
      <xsl:param name="course" select="@course"/>
      <xsl:apply-templates select="lv:section|lv:subsection|lv:subsubsection|lv:slides|lv:keywords">
      <xsl:with-param name="course" select="$course"/>
      <xsl:with-param name="chapter" select="@num"/>
      <xsl:with-param name="chapter_type" select="@chapter_type"/>
      <xsl:with-param name="chapter_title" select="@title"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="lv:section">
    <xsl:param name="course" select="@course"/>
    <xsl:param name="chapter" select="@chapter"/>
    <xsl:param name="chapter_type" select="@chapter_type"/>
    <xsl:param name="chapter_title" select="@chapter_title"/>
    <xsl:variable name="section">
      <xsl:number level="any" count="lv:chapter//lv:section"
                  from="lv:chapter"/>
    </xsl:variable>
    <xsl:apply-templates select="lv:subsection|lv:subsubsection|lv:slides">
      <xsl:with-param name="course" select="$course"/>
      <xsl:with-param name="chapter" select="$chapter"/>
      <xsl:with-param name="chapter_type" select="$chapter_type"/>
      <xsl:with-param name="chapter_title" select="$chapter_title"/>
      <xsl:with-param name="section" select="$section"/>
      <xsl:with-param name="section_title" select="@title"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="lv:subsection">
    <xsl:param name="course" select="@course"/>
    <xsl:param name="chapter" select="@chapter"/>
    <xsl:param name="chapter_type" select="@chapter_type"/>
    <xsl:param name="chapter_title" select="@chapter_title"/>
    <xsl:param name="section" select="@section"/>
    <xsl:param name="section_title" select="@section_title"/>
    <xsl:variable name="subsection">
        <xsl:number level="any" count="lv:section//lv:subsection" from="lv:section"/>
    </xsl:variable>
    <xsl:apply-templates select="lv:subsubsection|lv:slides">
      <xsl:with-param name="course" select="$course"/>
      <xsl:with-param name="chapter" select="$chapter"/>
      <xsl:with-param name="chapter_type" select="$chapter_type"/>
      <xsl:with-param name="chapter_title" select="$chapter_title"/>
      <xsl:with-param name="section" select="$section"/>
      <xsl:with-param name="section_title" select="$section_title"/>
      <xsl:with-param name="subsection" select="$subsection"/>
      <xsl:with-param name="subsection_title" select="@title"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="lv:subsubsection">
    <xsl:param name="course" select="@course"/>
    <xsl:param name="chapter" select="@num"/>
    <xsl:param name="chapter_type" select="@chapter_type"/>
    <xsl:param name="chapter_title" select="@chapter_title"/>
    <xsl:param name="section" select="@section"/>
    <xsl:param name="section_title" select="@section_title"/>
    <xsl:param name="subsection" select="@subsection"/>
    <xsl:param name="subsection_title" select="@subsection_title" />
    <xsl:variable name="subsubsection">
      <xsl:number level="any" count="lv:subsection//lv:subsubsection"
                  from="lv:subsection"/>
    </xsl:variable>
    <xsl:apply-templates select="lv:slides">
      <xsl:with-param name="course" select="$course"/>
      <xsl:with-param name="chapter" select="$chapter"/>
      <xsl:with-param name="chapter_type" select="$chapter_type"/>
      <xsl:with-param name="chapter_title" select="$chapter_title"/>
      <xsl:with-param name="section" select="$section"/>
      <xsl:with-param name="section_title" select="$section_title"/>
      <xsl:with-param name="subsection" select="$subsection"/>
      <xsl:with-param name="subsection_title" select="$subsection_title"/>
      <xsl:with-param name="subsubsection" select="$subsubsection"/>
      <xsl:with-param name="subsubsection_title" select="@title"/>
    </xsl:apply-templates>
  </xsl:template>


  <xsl:template match="lv:slides">
      <xsl:param name="course" select="@course"/>
      <xsl:param name="chapter" select="@num"/>
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
    <xsl:variable name="slide">
      <xsl:number format="1" level="any" count="lv:slide"/>
    </xsl:variable>
    <div class="slide collapsed tex2jax_ignore">
      <xsl:attribute name="id">
        <xsl:text>s</xsl:text>
        <xsl:value-of select="$slide"/>
      </xsl:attribute>
      <xsl:attribute name="slide">
        <xsl:value-of select="$slide"/>
      </xsl:attribute>
      <xsl:attribute name="course">
          <xsl:choose>
              <xsl:when test="@course">
                  <xsl:value-of select="@course"/>
              </xsl:when>
              <xsl:otherwise>
                  <xsl:value-of select="$course"/>
              </xsl:otherwise>
          </xsl:choose>
      </xsl:attribute>
      <xsl:attribute name="chapter_type">
          <xsl:choose>
              <xsl:when test="@chapter_type">
                  <xsl:value-of select="@chapter_type"/>
              </xsl:when>
              <xsl:otherwise>
                  <xsl:value-of select="$chapter_type"/>
              </xsl:otherwise>
          </xsl:choose>
      </xsl:attribute>
      <xsl:attribute name="chapter">
          <xsl:choose>
              <xsl:when test="@chapter">
                  <xsl:value-of select="@chapter"/>
              </xsl:when>
              <xsl:otherwise>
                  <xsl:value-of select="$chapter"/>
              </xsl:otherwise>
          </xsl:choose>
      </xsl:attribute>
      <xsl:attribute name="chapter_title">
        <xsl:value-of select="$chapter_title"/>
      </xsl:attribute>
      <xsl:attribute name="section">
        <xsl:value-of select="$section"/>
      </xsl:attribute>
      <xsl:attribute name="section_title">
        <xsl:value-of select="$section_title"/>
      </xsl:attribute>
      <xsl:attribute name="subsection">
        <xsl:value-of select="$subsection"/>
      </xsl:attribute>
      <xsl:attribute name="subsection_title">
        <xsl:value-of select="$subsection_title"/>
      </xsl:attribute>
      <xsl:attribute name="subsubsection">
        <xsl:value-of select="$subsubsection"/>
      </xsl:attribute>
      <xsl:attribute name="wbtag">
          <xsl:value-of select="@wbtag"/>
      </xsl:attribute>
      <div class="slide_container" wbtag="ignore">
        <div class="slide_number">
          <button class="plain_button slide_button">
            <!-- <xsl:copy-of select="@*[name()!='wbtag']"/> -->
            <xsl:text>Slide </xsl:text>
            <xsl:value-of select="$slide"/>
          </button>
        </div>
        <div class="separator" style="position:relative; width:100%; height:1.5em; text-align:center;" wbtag="ignore">
            <xsl:attribute name="slide">
                <xsl:value-of select="$slide"/>
            </xsl:attribute>
            <hr style="border-top:2px dotted pink" />
            <div style="position:absolute;top:-0.75em;left:0;width:100%;text-align:center">
                <a href="javascript:void(0)" style="font-size:1em;background-color:white;color:pink">
                    <xsl:value-of select="concat(' slide ', $slide, ' ')"/>
                </a>
            </div>
            <div style="width:100%;text-align:right;margin-top:-0.75em;font-size:2em">
                <button href="#" class="plain_button collapse_icon" style="float:right" wbtag="ignore">
                  <xsl:attribute name="onclick">
                    <xsl:value-of select="concat('collapseToggle(', $slide, ')')"/>
                  </xsl:attribute>
                <xsl:value-of select="'&#x21f3;'"/>
		</button>
            </div>
        </div>
        <div class="slide_content">
          <xsl:apply-templates select="*|text()">
            <xsl:with-param name="context" select="'inline'"/>
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
            <xsl:with-param name="slide" select="$slide"/>
          </xsl:apply-templates>
        </div>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="lv:statement">
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
	  <xsl:number level="any"  count="lv:chapter[@num=$chapter]//lv:statement"/>
	</xsl:when>
	<xsl:otherwise>
	  <xsl:value-of select="@num"/>
	</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="item">
      <xsl:choose>
          <xsl:when test="ancestor::chapter">
              <xsl:value-of select="concat(ancestor::lv:chapter/@num, '.', $num)"/>
          </xsl:when>
          <xsl:otherwise>
              <xsl:value-of select="@item"/>
          </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <p wbtag="ignore"/>
    <div>
      <xsl:copy-of select="@*"/>
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
        <xsl:value-of select="concat('item', $item)"/>
      </xsl:attribute>
      <xsl:attribute name="item">
        <xsl:value-of select="$item"/>
      </xsl:attribute>
      <xsl:attribute name="type">
        <xsl:value-of select="@type"/>
      </xsl:attribute>
      <button class="plain_button item_button" onmouseover="this.style.backgroundColor=''" onmouseout="this.style.backgroundColor=''">
        <xsl:copy-of select="@*"/>
        <xsl:attribute name="wbtag">
          <xsl:text>ignore</xsl:text>
        </xsl:attribute>
        <xsl:element name="h5">
            <xsl:attribute name="class">item_title</xsl:attribute>
            <xsl:attribute name="wbtag">ignore</xsl:attribute>
            <xsl:choose>
                <xsl:when test="not(@typerefnum)">
                    <xsl:value-of select="@type"/>
                    <span style="padding-left:0.5em; padding-right:0.5em" wbtag="ignore">
                        <xsl:value-of select="concat($item, '')"/>
                    </span>
                </xsl:when>
                <xsl:otherwise>
                    <span style="padding-right:0.5em" wbtag="ignore">
                        <xsl:value-of select="concat(@typerefnum, '')"/>
                    </span>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:element>
      </button>
      <xsl:apply-templates select="lv:label"/>
      <xsl:apply-templates select="lv:title"/>
      <blockquote wbtag="skip">
        <xsl:apply-templates select="*[not(self::lv:title) and not(self::lv:label)]|text()"/>
      </blockquote>
    </div>
  </xsl:template>

  <xsl:template match="lv:label">
      <span wbtag="label" style="display:none">
          <xsl:copy-of select="@*"/>
      </span>
  </xsl:template>

  <xsl:template match="lv:statement/lv:title[text()!='.']">
    <div style="display:inline-block" wbtag='ignore'>
      <xsl:copy-of select="@*"/>
      <strong> - </strong>
      <xsl:element name="h5">
          <xsl:attribute name="class">custom_title</xsl:attribute>
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
        <xsl:element name="h5">
            <xsl:attribute name="wbtag">ignore</xsl:attribute>
            <xsl:attribute name="class">item_title</xsl:attribute>
            <xsl:value-of select="@type"/>
            <!-- <span style="margin-left:0.5em">
            <xsl:value-of select="@title"/>
        </span> -->
          <xsl:apply-templates select="lv:title"/>
          <xsl:value-of select="'.'"/>
      </xsl:element>
        <xsl:apply-templates select="*[not(self::lv:title) and not(self::lv:label)]|text()"/>
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
          <span class="title">
              <xsl:apply-templates select="text()"/>
          </span>
      </h1>
  </xsl:template>

  <xsl:template match="lv:title[@scope='chapter']">
    <h2 class="chapter_title title">
        <xsl:variable name="serial">
            <xsl:value-of select="ancestor::lv:chapter/@num"/>
        </xsl:variable>
        <xsl:attribute name="serial">
            <xsl:value-of select="$serial"/>
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
      <span class="title">
        <xsl:apply-templates select="text()|*"/>
      </span>
    </h2>
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
    <xsl:param name="course"/>
    <xsl:param name="chapter"/>
    <xsl:param name="chapter_type"/>
    <xsl:param name="chapter_title"/>
    <xsl:param name="section"/>
    <xsl:param name="section_title"/>
    <xsl:param name="subsection"/>
    <xsl:param name="subsection_title"/>
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
        <span class="title">
            <xsl:apply-templates select="*|text()"/>
        </span>
    </h3>
  </xsl:template>
  <xsl:template match="lv:title[@scope='subsection']">
    <xsl:param name="course"/>
    <xsl:param name="chapter"/>
    <xsl:param name="chapter_type"/>
    <xsl:param name="chapter_title"/>
    <xsl:param name="section"/>
    <xsl:param name="section_title"/>
    <xsl:param name="subsection"/>
    <xsl:param name="subsection_title"/>
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
      <span class="title">
          <xsl:apply-templates select="text()|*"/>
      </span>
    </h4>
  </xsl:template>

  <xsl:template match="lv:title[@scope='subsubsection']">
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
        <span class="title">
            <xsl:apply-templates select="text()|*"/>
        </span>
    </h5>
    <br/>
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
                      <xsl:text>knowl</xsl:text>
                  </xsl:when>
                  <xsl:otherwise>
                      <xsl:text>href</xsl:text>
                  </xsl:otherwise>
              </xsl:choose>
          </xsl:attribute>
          <xsl:if test="@type='Section'">
              <xsl:value-of select="concat('Section ', @serial, ' (')"/>
          </xsl:if>
          <xsl:apply-templates select="lv:title"/>
          <xsl:if test="@type='Section'">
              <xsl:value-of select="')'"/>
          </xsl:if>
          <!-- <xsl:choose>
              <xsl:when test="@name and not(@name='')">
                  <xsl:value-of select="@name"/>
              </xsl:when>
              <xsl:when test="@title and not(@title='')">
                  <xsl:value-of select="@title"/>
              </xsl:when>
              <xsl:otherwise>
                  <xsl:value-of select="concat(@type, ' ', @item)"/>
              </xsl:otherwise>
          </xsl:choose> -->
      </xsl:element>
  </xsl:template>

  <xsl:template match="lv:keywords">
    <xsl:param name="slide" select="'all'"/>
    <xsl:param name="chapter" select="@chapter"/>
    <xsl:element name="div">
      <xsl:copy-of select="@*"/>
      <xsl:attribute name="class">
        <xsl:value-of select="name()"/>
      </xsl:attribute>
      <xsl:attribute name="wbtag">
        <xsl:text>ignore</xsl:text>
      </xsl:attribute>
      <xsl:attribute name="chapter">
        <xsl:value-of select="$chapter"/>
      </xsl:attribute>
      <xsl:attribute name="course">
        <xsl:value-of select="@course"/>
      </xsl:attribute>
      <xsl:attribute name="slide">
        <xsl:value-of select="$slide"/>
      </xsl:attribute>
      <xsl:comment/>
      <xsl:apply-templates select="lv:keyword[not(.=preceding-sibling::lv:keyword)]">
        <xsl:with-param name="slide" select="$slide"/>
      </xsl:apply-templates>
    </xsl:element>
  </xsl:template>

  <xsl:template match="lv:toc">
    <h5>
      <xsl:value-of select="concat(@chapter_type, ' ', @num)"/>
    </h5>
  </xsl:template>

  <xsl:template match="lv:keyword">
    <xsl:param name="slide" select="'all'"/>
    <button type="button" class="btn btn-outline-info btn-sm btn_keyword" style="margin-left:5px;margin-top:5px" data-html="true" data-container="body" data-toggle="popover"  data-placement="bottom" slide="$slide">
      <xsl:attribute name="wbtag">
        <xsl:text>ignore</xsl:text>
      </xsl:attribute>
      <xsl:attribute name="src">
        <xsl:value-of select="text()"/>
      </xsl:attribute>
      <xsl:variable name="apos">&apos;</xsl:variable>
      <xsl:variable name="keyword">
        <xsl:value-of select="text()"/>
      </xsl:variable>
      <!-- <xsl:if test="$slide='all'"> -->
        <xsl:attribute name="data-content">
          <xsl:for-each select="//lv:keyword[@chapter=./@chapter][@slide!='all'][text()=$keyword]">
            <xsl:variable name="focus">focusOn('<xsl:value-of select="@slide"/>', '<xsl:value-of select="translate($keyword, $apos, '')"/>')</xsl:variable>
            <xsl:value-of select="concat('&lt;a class=&quot;dropdown-item&quot; href=&quot;javascript:void(0)&quot;  onclick=&quot;', $focus, '&quot; &gt;', 'Slide ', @slide,  '&lt;/a&gt;')"/>
          </xsl:for-each>
        </xsl:attribute>
      <xsl:value-of select="text()"/>
    </button>
  </xsl:template>

  <xsl:template match="lv:wiki">
    <xsl:element name="div">
      <xsl:attribute name="class">
        <xsl:value-of select="name()"/>
      </xsl:attribute>
      <xsl:value-of select="."/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="lv:hc_keyword">
    <b class="hidden">
      <xsl:copy-of select="@*"/>
      <xsl:value-of select="."/>
    </b>
  </xsl:template>

  <xsl:template match="lv:newcol|lv:collapse">
    <xsl:variable name="col">
      <xsl:number level="any" count="lv:newcol|lv:collapse"/>
    </xsl:variable>
    <xsl:variable name="id">
      <xsl:value-of select="concat('c', $timestamp, $col)" />
    </xsl:variable>
    <!-- <a class="collapsea collapsed" contenteditable="false" data-toggle="collapse" aria-expanded="false" wbtag="ignore" xmlns="http://www.w3.org/1999/xhtml"> -->
    <a class="collapsea collapsed" contenteditable="false" data-toggle="collapse" aria-expanded="false" wbtag="ignore">
      <xsl:attribute name="aria-controls">
          <xsl:value-of select="$id"/>
      </xsl:attribute>
      <xsl:attribute name="href">
          <xsl:value-of select="concat('#', $id)" />
      </xsl:attribute>
      ►
  </a>
    <div class="collapse" xmlns="http://www.w3.org/1999/xhtml">
        <xsl:attribute name="id">
            <xsl:value-of select="$id"/>
        </xsl:attribute>
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
      <xsl:apply-templates select="text()|comment()|*"/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="xh:*[not(self::xh:iframe) and not(self::xh:img) and not(self::xh:br)]">
    <xsl:element name="{local-name()}" namespace="{$xh}">
      <xsl:copy-of select="@*[(name(.)!='environment') and (name(.)!='chapter_type')]"/>
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

  <xsl:template match="lv:newline|xh:br">
      <br wbtag="newline"/>
  </xsl:template>

  <!-- <xsl:template match="lv:newline">
      <xsl:element name="br" namespace="{$xh}">
          <xsl:attribute name="wbtag">
              <xsl:value-of select="'newline'"/>
          </xsl:attribute>
      </xsl:element>
  </xsl:template> -->

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
      <div class="ww" style="overflow:auto">
	<xsl:attribute name="id">
          <xsl:value-of select="concat('ww_inner_', @ww_id)" />
	</xsl:attribute>
	<img class="loading_icon exempt" src="icons/Loading_icon.gif"/>
	<iframe style="overflow-x:auto;overflow-y:hidden;display:none">
          <xsl:attribute name="rendered">0</xsl:attribute>
          <xsl:attribute name="data-src">
            <xsl:value-of select="concat('http://localhost/webwork2/html2xml?sourceFilePath=',@pg_file, '&amp;answersSubmitted=0&amp;problemSeed=123567890&amp;displayMode=MathJax&amp;courseID=daemon&amp;userID=daemon&amp;course_password=daemon&amp;outputformat=simple')"/>
          </xsl:attribute>
	</iframe>
      </div>
    </div>
  </xsl:template>

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
          </xsl:element>
      </xsl:element>
  </xsl:template>

  <xsl:template match="lv:paragraphs">
    <xsl:apply-templates select="text()"/>
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

  <xsl:template match="text()">
    <xsl:value-of select="." disable-output-escaping="yes" />
  </xsl:template>

  <xsl:template match="comment()">
    <xsl:copy-of select="current()"/>
    <!-- <xsl:value-of select="." disable-output-escaping="yes" /> -->
  </xsl:template>

</xsl:stylesheet>
