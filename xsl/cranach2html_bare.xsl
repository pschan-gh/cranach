<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xh="http://www.w3.org/1999/xhtml"
    xmlns:lml="http://dlmf.nist.gov/LaTeXML"
    xmlns:lv = "http://www.math.cuhk.edu.hk/~pschan/cranach"
    >
<!-- xmlns="elephas" -->
    <xsl:output method="html"/>

    <xsl:template match="lv:document|lml:document">
        <xsl:apply-templates select="*" />
    </xsl:template>

    <xsl:template match="lv:slides">
        <xsl:apply-templates select="lv:slide"/>
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
        <div class="slide_container" wbtag="ignore">
                <div class="slide_number">
                    <button class="plain_button slide_button">
                        <xsl:copy-of select="@*[name()!='wbtag']"/>
                        <xsl:text>Slide </xsl:text>
                        <xsl:value-of select="$slide"/>
                    </button>
                </div>
                <div class="slide_content">
                    <xsl:apply-templates select="*|xh:*|lml:para|text()" />
                </div>
            </div>
        </div>
    </xsl:template>

    <xsl:template match="lml:tags"/>

    <xsl:template match="lml:Math[@mode='inline']">
        <xsl:text>$</xsl:text>
        <xsl:value-of select="@tex"/>
        <xsl:text>$</xsl:text>
    </xsl:template>

    <xsl:template match="lml:equation">
        <xsl:choose>
            <xsl:when test="lml:tags">
                <xsl:text>\begin{equation}</xsl:text>
                <xsl:apply-templates select="lml:Math[@mode='display']" />
                <xsl:text>\end{equation}</xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>\[</xsl:text>
                <xsl:apply-templates select="lml:Math[@mode='display']" />
                <xsl:text>\]</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="lml:Math[@mode='display']">
        <xsl:value-of select="@tex"/>
    </xsl:template>

    <xsl:param name="contenturl"/>

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
		<xsl:value-of select="concat($contenturl, '&amp;', 'slide=', @slide)"/>
	      </xsl:attribute>
              <xsl:copy-of select="@*"/>
                <xsl:attribute name="wbtag">
                    <xsl:text>ignore</xsl:text>
                </xsl:attribute>
                <h5 wbtag="ignore">
                    <xsl:value-of select="@type"/>
                    <span style="margin-left:0.5em" wbtag="ignore">
		      <xsl:value-of select="@item"/>
                      <!-- <xsl:value-of select="@chapter"/> -->
                      <!-- <xsl:text>.</xsl:text> -->
                      <!-- <xsl:value-of select="@num"/> -->
                    </span>
                </h5>
            <xsl:apply-templates select="@title"/>
	    </a>
            <blockquote wbtag="skip">
                <xsl:apply-templates select="*|text()"/>
            </blockquote>
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
                <h5 wbtag="ignore">
                    <xsl:value-of select="@type"/>
                    <span style="margin-left:0.5em">
                        <xsl:value-of select="@title"/>
                    </span>
                </h5>
                <xsl:apply-templates select="title"/>
                <xsl:apply-templates select="*[not(self::title)]|text()"/>
            </blockquote>
        </div>
    </xsl:template>

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
        <xsl:choose>
            <xsl:when test="//lv:statement[@label=current()]">
                <xsl:element name="a">
                    <xsl:copy-of select="@*"/>
                    <xsl:attribute name="chapter">
                        <xsl:value-of select="//lv:statement[@label=current()]/@chapter"/>
                    </xsl:attribute>
                    <xsl:attribute name="num">
                        <xsl:value-of select="//lv:statement[@label=current()]/@num"/>
                    </xsl:attribute>
                    <xsl:attribute name="class">
                        <xsl:text>knowl</xsl:text>
                    </xsl:attribute>
                    <xsl:value-of select="concat(//lv:statement[@label=current()]/@type, ' ', //lv:statement[@label=current()]/@chapter, '.', //lv:statement[@label=current()]/@num)"/>
                </xsl:element>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>UNDEFINED</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="lv:keywords">
        <xsl:element name="div">
            <xsl:attribute name="class">
                <xsl:value-of select="name()"/>
            </xsl:attribute>
            <xsl:attribute name="wbtag">
    	      <xsl:text>ignore</xsl:text>
    	    </xsl:attribute>
            <xsl:copy-of select="@*"/>
            <xsl:comment/>
            <xsl:apply-templates select="lv:keyword"/>
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

    <xsl:template match="lv:keyword">
        <span class="keyword">
            <xsl:copy-of select="@*"/>
	    <xsl:attribute name="src">
	      <xsl:value-of select="."/>
	    </xsl:attribute>
        <xsl:attribute name="wbtag">
	      <xsl:text>ignore</xsl:text>
	    </xsl:attribute>
            <xsl:value-of select="."/>
        </span>
    </xsl:template>

    <xsl:template match="lv:hc_keyword">
        <b class="hidden">
            <xsl:copy-of select="@*"/>
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

    <xsl:template match="lv:paragraphs|lml:para">
        <div class="markdown">
            <xsl:attribute name="wbtag">
                <xsl:text>paragraphs</xsl:text>
            </xsl:attribute>
            <xsl:apply-templates select="text()|comment()|*"/>
        </div>
    </xsl:template>

    <xsl:template match="xh:*">
        <xsl:element name="{local-name()}">
          <xsl:copy-of select="@*"/>
            <xsl:apply-templates select="text()|comment()|*"/>
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
</xsl:stylesheet>
