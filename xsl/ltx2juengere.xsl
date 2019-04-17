<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xh="http://www.w3.org/1999/xhtml"
    xmlns:lv="http://www.math.cuhk.edu.hk/~pschan/cranach"
    xmlns:ltx="http://dlmf.nist.gov/LaTeXML"
    xmlns:m     = "http://www.w3.org/1998/Math/MathML"
    >

  <!-- <xsl:import href="LaTeXML-math-xhtml.xsl"/> -->
  <xsl:import href="LaTeXML-common.xsl"/>

    <xsl:variable name="lv" select="'http://www.math.cuhk.edu.hk/~pschan/cranach'"/>
    <xsl:variable name="xh" select="'http://www.w3.org/1999/xhtml'"/>

    <xsl:preserve-space elements="xh:pre ltx:*"/>
    <!-- <xsl:strip-space elements="*"/> -->
    <xsl:output method="xml" />

    <xsl:template match="ltx:document">
        <xsl:element name="root" namespace="{$lv}">
            <xsl:element name="slides" namespace="{$lv}">
                <xsl:element name="slide" namespace="{$lv}">
                    <xsl:apply-templates select="*[not(self::ltx:course) and not(self::ltx:chapter) and not(self::ltx:section) and not(self::ltx:subsection) and not(self::ltx:subsubsection)]">
                        <xsl:with-param name="context" select="local-name()" />
                    </xsl:apply-templates>
                </xsl:element>
            </xsl:element>
            <xsl:apply-templates select="ltx:course|ltx:chapter|ltx:section|ltx:subsection|ltx:subsubsection"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="ltx:course">
        <xsl:element name="{local-name()}" namespace="{$lv}">
            <xsl:attribute name="wbtag">
                <xsl:value-of select="local-name()"/>
            </xsl:attribute>
            <xsl:element name="slides" namespace="{$lv}">
                <xsl:element name="slide" namespace="{$lv}">
                    <xsl:apply-templates select="*[not(self::ltx:chapter) and not(self::ltx:section) and not(self::ltx:subsection) and not(self::ltx:subsubsection)]">
                        <xsl:with-param name="context" select="local-name()" />
                    </xsl:apply-templates>
                </xsl:element>
            </xsl:element>
            <xsl:apply-templates select="ltx:chapter|ltx:section|ltx:subsection|ltx:subsubsection"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="ltx:chapter">
        <xsl:variable name="refnum">
            <xsl:value-of select="./ltx:tags/ltx:tag[@role='refnum']/text()"/>
        </xsl:variable>
        <xsl:variable name="typerefnum">
            <xsl:apply-templates select="ltx:tags/ltx:tag[@role='typerefnum']"/>
        </xsl:variable>
        <xsl:variable name="chapter_type">
            <xsl:choose>
                <xsl:when test="$refnum!=''">
                    <xsl:value-of select="substring-before($typerefnum, $refnum)"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$typerefnum"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:element name="{local-name()}" namespace="{$lv}">
            <xsl:attribute name="wbtag">
                <xsl:value-of select="local-name()"/>
            </xsl:attribute>
            <xsl:attribute name="num">
                <xsl:value-of select="$refnum"/>
            </xsl:attribute>
            <xsl:attribute name="chapter_type">
                <xsl:value-of select="$chapter_type"/>
            </xsl:attribute>
            <xsl:element name="title" namespace="{$lv}">
                <xsl:attribute name="chapter_type">
                    <xsl:value-of select="$chapter_type"/>
                </xsl:attribute>
                <xsl:attribute name="chapter">
                    <xsl:value-of select="$refnum"/>
                </xsl:attribute>
            </xsl:element>
            <xsl:element name="slides" namespace="{$lv}">
                <xsl:element name="slide" namespace="{$lv}">
                    <xsl:apply-templates select="*[not(self::ltx:section) and not(self::ltx:subsection) and not(self::ltx:subsubsection)]">
                        <xsl:with-param name="context" select="local-name()" />
                    </xsl:apply-templates>
                </xsl:element>
            </xsl:element>
            <xsl:apply-templates select="ltx:section|ltx:subsection|ltx:subsubsection"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="ltx:section">
        <xsl:element name="{local-name()}" namespace="{$lv}">
            <xsl:attribute name="wbtag">
                <xsl:value-of select="local-name()"/>
            </xsl:attribute>
            <xsl:element name="slides" namespace="{$lv}">
                <xsl:element name="slide" namespace="{$lv}">
                    <xsl:apply-templates select="*[not(self::ltx:subsection) and not(self::ltx:subsubsection)]">
                        <xsl:with-param name="context" select="local-name()" />
                    </xsl:apply-templates>
                </xsl:element>
            </xsl:element>
            <xsl:apply-templates select="ltx:subsection|ltx:subsubsection"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="ltx:subsection">
        <xsl:element name="{local-name()}" namespace="{$lv}">
            <xsl:attribute name="wbtag">
                <xsl:value-of select="local-name()"/>
            </xsl:attribute>
            <xsl:element name="slides" namespace="{$lv}">
                <xsl:element name="slide" namespace="{$lv}">
                    <xsl:apply-templates select="*[ not(self::ltx:subsubsection)]">
                        <xsl:with-param name="context" select="local-name()" />
                    </xsl:apply-templates>
                </xsl:element>
            </xsl:element>
            <xsl:apply-templates select="ltx:subsubsection"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="ltx:subsubsection">
        <xsl:element name="{local-name()}" namespace="{$lv}">
            <xsl:attribute name="wbtag">
                <xsl:value-of select="local-name()"/>
            </xsl:attribute>
            <xsl:element name="slides" namespace="{$lv}">
                <xsl:element name="slide" namespace="{$lv}">
                    <xsl:apply-templates select="*[ not(self::ltx:subsubsection)]">
                        <xsl:with-param name="context" select="local-name()" />
                    </xsl:apply-templates>
                </xsl:element>
            </xsl:element>
        </xsl:element>
    </xsl:template>

    <xsl:template match="ltx:title">
        <xsl:param name="context"/>
        <xsl:element name="{local-name()}" namespace="{$lv}">
            <xsl:attribute name="wbtag">
                <xsl:value-of select="title"/>
            </xsl:attribute>
            <xsl:attribute name="scope">
                <xsl:value-of select="$context"/>
            </xsl:attribute>
            <xsl:apply-templates select="*|text()"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="ltx:theorem">
        <xsl:variable name="typerefnum">
            <xsl:apply-templates select="ltx:tags/ltx:tag[@role='typerefnum']"/>
        </xsl:variable>
        <xsl:variable name="refnum">
            <xsl:value-of select="ltx:tags/ltx:tag[@role='refnum']"/>
        </xsl:variable>
        <xsl:variable name="type">
            <xsl:choose>
                <xsl:when test="$refnum!=''">
                    <xsl:value-of select="substring-before($typerefnum, $refnum)"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$typerefnum"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:element name="statement" namespace="{$lv}">
            <xsl:attribute name="type">
                <xsl:value-of select="$type"/>
            </xsl:attribute>
            <xsl:attribute name="wbtag">
                <xsl:value-of select="concat(translate(substring($type, 1, 1), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), substring($type, 2))"/>
            </xsl:attribute>
            <xsl:attribute name="refnum">
                <xsl:value-of select="$refnum"/>
            </xsl:attribute>
            <xsl:attribute name="typerefnum">
                <xsl:value-of select="$typerefnum"/>
            </xsl:attribute>
            <xsl:attribute name="serial">
                <xsl:value-of select="./ltx:tags/ltx:tag[@role='refnum']/text()"/>
            </xsl:attribute>
            <xsl:apply-templates select="*[not(self::ltx:tags)]|text()"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="ltx:tags/ltx:tag[@role='typerefnum']">
        <xsl:copy>
            <xsl:apply-templates select=".//text()"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="ltx:proof">
        <xsl:variable name="type">
            <xsl:value-of select="'Proof'"/>
        </xsl:variable>
        <xsl:element name="substatement" namespace="{$lv}">
            <xsl:attribute name="type">
                <xsl:value-of select="$type"/>
            </xsl:attribute>
            <xsl:attribute name="wbtag">
                <xsl:value-of select="concat(translate(substring($type, 1, 1), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), substring($type, 2))"/>
            </xsl:attribute>
            <xsl:attribute name="serial">
                <xsl:value-of select="./ltx:tags/ltx:tag[@role='refnum']/text()"/>
            </xsl:attribute>
            <xsl:apply-templates select="*[not(self::ltx:title)]|text()"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="ltx:tags|ltx:tag"/>
    <xsl:template match="ltx:toctitle"/>

    <xsl:template match="ltx:p">
      <xh:p>
	<xsl:apply-templates select="*|text()"/>
      </xh:p>
    </xsl:template>

    <xsl:template match="ltx:Math[@mode='inline']">
        <xsl:text>$</xsl:text>
        <xsl:value-of select="@tex"/>
        <xsl:text>$</xsl:text>
    </xsl:template>

    <xsl:template match="ltx:equation">
        <xsl:choose>
            <xsl:when test="ltx:tags">
                <xsl:text>\begin{equation}</xsl:text>
                <xsl:apply-templates select="ltx:Math[@mode='display']" />
                <xsl:text>\end{equation}</xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>\[</xsl:text>
                <xsl:apply-templates select="ltx:Math[@mode='display']" />
                <xsl:text>\]</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="ltx:Math[@mode='display']">
        <xsl:value-of select="@tex"/>
    </xsl:template>

    <xsl:template match="ltx:para">
        <xsl:apply-templates select="*|text()"/>
    </xsl:template>

    <xsl:template match="ltx:text[@font='bold']">
      <xsl:element name="xh:b" namespace="{$xh}">
        <xsl:apply-templates select="*|text()"/>
      </xsl:element>
    </xsl:template>

    <xsl:template match="ltx:*">
        <xsl:element name="{local-name()}" namespace="{$lv}">
            <xsl:apply-templates select="*|text()"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="text()|comment()">
        <xsl:copy-of select="current()"/>
    </xsl:template>


    <!-- LATEXML -->

    <xsl:param name="MathML_NAMESPACE">http://www.w3.org/1998/Math/MathML</xsl:param>

  <!-- Use MathML (if available in source) -->
  <xsl:param name="USE_MathML">true</xsl:param>
  <!-- If NOT using MathML, should we avoid using images to represent pure numbers? -->
  <xsl:param name="USE_NUMBER_IMAGES">false</xsl:param>

  <!-- The namespace to use on MathML elements (typically MathML_NAMESPACE or none) -->
  <!--
      <xsl:param name="mml_ns">
      <xsl:value-of select="f:if($USE_NAMESPACES,$MathML_NAMESPACE,'')"/>
      </xsl:param>
  -->
  <xsl:param name="mml_ns">
      <xsl:value-of select="$MathML_NAMESPACE"/>
  </xsl:param>

  <!-- <xsl:strip-space elements="ltx:Math"/> -->

  <xsl:template match="ltx:Math">
    <xsl:choose>
      <!-- Prefer MathML, if allowed -->
      <!-- <xsl:when test="m:math and $USE_MathML"> -->
      <xsl:when test="$USE_MathML">
        <xsl:apply-templates select="." mode="as-MathML"/>
      </xsl:when>
      <!-- Optionally avoid using images for pure numbers -->
      <xsl:when test="not($USE_NUMBER_IMAGES) and ltx:XMath[count(*)=1][ltx:XMTok[1][@role='NUMBER']]">
        <xsl:value-of select="ltx:XMath/ltx:XMTok/text()"/>
      </xsl:when>
      <xsl:when test="not($USE_NUMBER_IMAGES) and
                      ltx:XMath[count(*)=1][ltx:XMApp[count(*)=2
                                        and ltx:XMTok[1][@meaning='minus']
                                        and ltx:XMTok[2][@role='NUMBER']]]">
        <xsl:value-of select="concat('&#x2212;',ltx:XMath/ltx:XMApp/ltx:XMTok[2]/text())"/>
      </xsl:when>
      <!-- If we reach any Math nested within Math, just copy as-is (should be appropriate target)-->
      <xsl:when test="ancestor::ltx:Math">
        <xsl:apply-templates mode='copy-foreign'/>
      </xsl:when>
      <!-- Or use images for math (Ugh!)-->
      <xsl:when test="@imagesrc">
        <xsl:apply-templates select="." mode="as-image"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates select="." mode="as-MathML"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="ltx:Math" mode="as-image">
    <xsl:element name="img" namespace="{$xh}">
      <xsl:call-template name="add_id"/>
      <xsl:call-template name="add_attributes">
        <xsl:with-param name="extra_style">
          <xsl:if test="@imagedepth">
            <xsl:value-of select="concat('vertical-align:-',@imagedepth,'px')"/>
          </xsl:if>
        </xsl:with-param>
      </xsl:call-template>
      <xsl:attribute name="src">
        <xsl:value-of select="f:url(@imagesrc)"/>
      </xsl:attribute>
      <xsl:if test="@imagewidth">
        <xsl:attribute name="width">
          <xsl:value-of select="@imagewidth"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@imageheight">
        <xsl:attribute name="height">
          <xsl:value-of select="@imageheight"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@tex">
        <xsl:attribute name="alt">
          <xsl:value-of select="@tex"/>
        </xsl:attribute>
      </xsl:if>
    </xsl:element>
  </xsl:template>

  <xsl:template match="ltx:Math" mode="as-TeX">
    <xsl:element name="span" namespace="{$xh}">
      <xsl:call-template name="add_id"/>
      <xsl:call-template name="add_attributes">
      </xsl:call-template>
      <xsl:value-of select="@tex"/>
    </xsl:element>
  </xsl:template>

  <!-- Top level generated m:math element gets id & class from ltx:Math
       If the ltx:Math/m:math had any of those, they got lost! -->
  <xsl:template match="ltx:Math" mode="as-MathML">
    <xsl:element name="math" namespace="{$mml_ns}">
      <!-- copy id, class, style from PARENT ltx:Math -->
      <xsl:call-template name="add_id"/>
      <xsl:call-template name="add_attributes"/>
      <!-- but copy OTHER m:math attributes -->
      <xsl:for-each select="m:math/@*">
        <xsl:apply-templates select="." mode="copy-attribute"/>
      </xsl:for-each>
      <xsl:apply-templates select="m:math/*"/>
    </xsl:element>
  </xsl:template>

  <!-- Copy MathML, as is -->
  <xsl:template match="m:*">
    <xsl:element name="{local-name()}" namespace="{$mml_ns}">
      <xsl:for-each select="@*">
        <xsl:apply-templates select="." mode="copy-attribute"/>
      </xsl:for-each>
      <xsl:choose>
        <!-- If annotation-xml in a DIFFERENT namespace, copy as foreign markup -->
        <xsl:when test="local-name()='annotation-xml'
                        and not(namespace-uri(child::*) = $MathML_NAMESPACE)">
          <xsl:apply-templates mode='copy-foreign'/>
        </xsl:when>
        <!-- otherwise, process more mathml -->
        <xsl:otherwise>
          <xsl:apply-templates/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:element>
  </xsl:template>

  <!-- If we hit MathML while copying "foreign" markup, resume as above -->
  <xsl:template match="m:*" mode="copy-foreign">
    <xsl:apply-templates/>
  </xsl:template>

</xsl:stylesheet>
