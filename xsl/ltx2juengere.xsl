<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xh="http://www.w3.org/1999/xhtml"
    xmlns:lv="http://www.math.cuhk.edu.hk/~pschan/cranach"
    xmlns:ltx="http://dlmf.nist.gov/LaTeXML"
    xmlns:m     = "http://www.w3.org/1998/Math/MathML"
    >

  <xsl:import href="LaTeXML-block-xhtml.xsl"/>
  <xsl:import href="LaTeXML-common.xsl"/>

    <xsl:variable name="lv" select="'http://www.math.cuhk.edu.hk/~pschan/cranach'"/>
    <xsl:variable name="xh" select="'http://www.w3.org/1999/xhtml'"/>

    <xsl:preserve-space elements="xh:pre ltx:*"/>
    <xsl:strip-space elements="ltx:Math"/>
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
                <xsl:value-of select="ltx:title/text()"/>
            </xsl:element>
            <!-- <xsl:element name="title" namespace="{$lv}">
                <xsl:attribute name="chapter_type">
                    <xsl:value-of select="$chapter_type"/>
                </xsl:attribute>
                <xsl:attribute name="chapter">
                    <xsl:value-of select="$refnum"/>
                </xsl:attribute>
            </xsl:element> -->
            <xsl:if test="@labels">
                  <xsl:element name="label" namespace="{$lv}">
                      <xsl:attribute name="name">
                          <xsl:value-of select="substring(@labels, 7)"/>
                      </xsl:attribute>
                  </xsl:element>
            </xsl:if>
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
            <xsl:element name="title" namespace="{$lv}">
                <xsl:value-of select="ltx:title/text()"/>
            </xsl:element>
            <xsl:if test="@labels">
                <xsl:element name="label" namespace="{$lv}">
                    <xsl:attribute name="name">
                        <xsl:value-of select="substring(@labels, 7)"/>
                    </xsl:attribute>
                </xsl:element>
            </xsl:if>
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
            <xsl:element name="title" namespace="{$lv}">
                <xsl:value-of select="ltx:title/text()"/>
            </xsl:element>
            <xsl:if test="@labels">
                <xsl:element name="label" namespace="{$lv}">
                    <xsl:attribute name="name">
                        <xsl:value-of select="substring(@labels, 7)"/>
                    </xsl:attribute>
                </xsl:element>
            </xsl:if>
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
            <xsl:if test="./ltx:title">
                <xsl:element name="title" namespace="{$lv}">
                    <xsl:value-of select="ltx:title/text()"/>
                </xsl:element>
            </xsl:if>
            <xsl:if test="@labels">
                <xsl:element name="label" namespace="{$lv}">
                    <xsl:attribute name="name">
                        <xsl:value-of select="substring(@labels, 7)"/>
                    </xsl:attribute>
                </xsl:element>
            </xsl:if>
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
            <xsl:if test="@labels">
                <xsl:element name="label" namespace="{$lv}">
                    <xsl:attribute name="name">
                        <xsl:value-of select="substring(@labels, 7)"/>
                    </xsl:attribute>
                </xsl:element>
            </xsl:if>
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

    <xsl:template match="ltx:ref">
        <xsl:element name="ref" namespace="{$lv}">
            <xsl:attribute name="wbtag">
                <xsl:value-of select="local-name()"/>
            </xsl:attribute>
            <xsl:attribute name="label">
                <xsl:value-of select="substring(@labelref, 7)"/>
            </xsl:attribute>
        </xsl:element>
    </xsl:template>

    <xsl:template match="ltx:p">
      <xh:p>
	<xsl:apply-templates select="*|text()"/>
      </xh:p>
    </xsl:template>

    <xsl:template match="ltx:Math">
        <xsl:text>$</xsl:text>
        <xsl:value-of select="@tex"/>
        <xsl:text>$</xsl:text>
    </xsl:template>

    <xsl:template match="ltx:Math[@mode='inline']">
        <xsl:text>$</xsl:text>
        <xsl:value-of select="@tex"/>
        <xsl:text>$</xsl:text>
    </xsl:template>

    <xsl:template match="ltx:Math[@mode='display' and not(contains(@class, 'ltx_eqn_cell'))]">
        <xsl:text>$\displaystyle </xsl:text>
        <xsl:value-of select="@tex"/>
        <xsl:text>$</xsl:text>
    </xsl:template>

    <xsl:template match="ltx:para">
        <xsl:apply-templates select="*|text()"/>
    </xsl:template>

    <xsl:template match="ltx:text[@font='bold']">
      <xsl:element name="xh:b" namespace="{$xh}">
        <xsl:apply-templates select="*|text()"/>
      </xsl:element>
    </xsl:template>

    <!-- <xsl:template match="ltx:*">
        <xsl:element name="{local-name()}" namespace="{$lv}">
            <xsl:apply-templates select="*|text()"/>
        </xsl:element>
    </xsl:template> -->

    <xsl:template match="text()|comment()">
        <xsl:copy-of select="current()"/>
    </xsl:template>


    <!-- LATEXML -->

    <xsl:param name="MathML_NAMESPACE">http://www.w3.org/1998/Math/MathML</xsl:param>

  <!-- Use MathML (if available in source) -->
  <xsl:param name="USE_MathML">true</xsl:param>
  <!-- If NOT using MathML, should we avoid using images to represent pure numbers? -->
  <xsl:param name="USE_NUMBER_IMAGES">false</xsl:param>


  <xsl:param name="mml_ns">
      <xsl:value-of select="$MathML_NAMESPACE"/>
  </xsl:param>

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
