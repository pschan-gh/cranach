<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xh="http://www.w3.org/1999/xhtml"
    >
    <!-- xmlns:xh="https://www.w3.org/TR/html51/" -->
    <!-- exclude-result-prefixes="xhtml" -->
    <!-- exclude-result-prefixes="xh" -->

    <xsl:output method="xml" />
    <xsl:output indent="yes"/>

    <xsl:strip-space elements="*"/>
    <xsl:preserve-space elements="xh:pre"/>

    <xsl:template match="/">
        <xsl:element name="root">
            <xsl:element name="slides">
                <xsl:apply-templates select="xh:html/xh:body/xh:div[contains(@class, 'slide')]"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>

    <xsl:template match="xh:html/xh:body/xh:div[contains(@class, 'slide')]" >
        <xsl:element name="slide">
            <xsl:copy-of select="@course"/>
            <xsl:copy-of select="@week"/>
            <xsl:copy-of select="@lecture"/>
            <xsl:copy-of select="@chapter"/>
            <xsl:copy-of select="@wbtag"/>
            <xsl:copy-of select="@slide"/>
            <xsl:copy-of select="@id"/>
            <xsl:apply-templates select="xh:div[@class='slide_container']/xh:div[@class='slide_content']/xh:*|xh:div[@class='slide_container']/xh:div[@class='slide_content']/text()"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="xh:span[@class='escaped']" >
        <xsl:value-of select="concat('@', text())"/>
    </xsl:template>

    <xsl:template match="xh:*[not(@wbtag)]">
      <xsl:element name="xh:{local-name()}">
          <xsl:copy-of select="@*"/>
          <xsl:apply-templates select="*|text()|comment()" />
      </xsl:element>
    </xsl:template>

    <xsl:template match="*[@wbtag='ignore']" />
    <xsl:template match="xh:*[@class='knowl-output']" />

    <xsl:template match="xh:*[@wbtag='skip']">
        <xsl:apply-templates select="*|text()" />
    </xsl:template>

    <xsl:template match="xh:*[@wbtag and @wbtag!='ignore' and @wbtag!='webwork' and @wbtag!='wb_image' and @wbtag!='paragraphs' and @wbtag!='newline' and @wbtag!='skip' and not(@metadata) and @wbtag!='qed' and @wbtag!='']">
        <xsl:element name="{@wbtag}">
            <xsl:copy-of select="@wbtag"/>
            <xsl:copy-of select="@label"/>
            <xsl:copy-of select="@name"/>
            <xsl:copy-of select="@id"/>
            <xsl:copy-of select="@href"/>
            <xsl:apply-templates select="*|text()" />
        </xsl:element>
    </xsl:template>

    <xsl:template match="xh:*[@wbtag = 'course']|xh:*[@wbtag = 'chapter']|xh:*[@wbtag = 'section']|xh:*[@wbtag = 'subsection']|xh:*[@wbtag = 'subsubsection']">
        <xsl:element name="{@wbtag}">
            <xsl:copy-of select="@wbtag"/>
            <xsl:copy-of select="@label"/>
            <xsl:copy-of select="@id"/>
            <xsl:copy-of select="@href"/>
            <xsl:if test="./xh:span[@class='title']">
                <xsl:element name="argument">
                    <xsl:value-of select="./xh:span[@class='title']/text()" />
                </xsl:element>
                <xsl:element name="title">
                    <xsl:apply-templates select="./xh:span[@class='title']/text()|./xh:span[@class='title']/*" />
                </xsl:element>
            </xsl:if>
        </xsl:element>
    </xsl:template>

    <xsl:template match="xh:*[@wbtag = 'week']|xh:*[@wbtag = 'lecture']|xh:*[@wbtag = 'chapter']">
        <xsl:element name="{@wbtag}">
            <xsl:copy-of select="@wbtag"/>
            <xsl:copy-of select="@label"/>
            <xsl:copy-of select="@id"/>
            <xsl:copy-of select="@href"/>
            <xsl:attribute name="chapter_type">
                <xsl:value-of select="@wbtag" />
            </xsl:attribute>
            <xsl:if test="./xh:span[@class='num']">
                <xsl:element name="argument">
                    <xsl:value-of select="./xh:span[@class='num']/text()" />
                </xsl:element>
            </xsl:if>
        </xsl:element>
    </xsl:template>

    <xsl:template match="xh:*[@wbtag = 'setchapter' or @wbtag='href']">
        <xsl:element name="{@wbtag}">
            <xsl:copy-of select="@*"/>
            <xsl:element name="argument">
                <xsl:value-of select="@argument" />
            </xsl:element>
        </xsl:element>
    </xsl:template>

    <xsl:template match="xh:*[@wbtag='newline' or @wbtag='para' or local-name()='br']" >
      <xsl:element name="newline"/>
    </xsl:template>

    <xsl:template match="xh:span[@wbtag='paragraphs']" >
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:element name="{@wbtag}">
            <xsl:attribute name="wbtag">
                <xsl:text>paragraphs</xsl:text>
            </xsl:attribute>
            <!--    <xsl:text>&#xa;</xsl:text> -->
            <xsl:apply-templates select="text()|comment()|*"/>
            <!-- <xsl:text>&#xa;</xsl:text> -->
        </xsl:element>
    </xsl:template>

    <xsl:template match="xh:div[@wbtag='center' or @wbtag='left' or @wbtag='right']" >
        <xsl:element name="{@wbtag}">
            <xsl:copy-of select="@wbtag"/>
            <xsl:apply-templates select="text()|comment()|*"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="xh:div[@wbname='statement' or @wbname='substatement']">
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:element name="{@wbname}">
            <xsl:copy-of select="@course"/>
            <xsl:copy-of select="@week"/>
            <xsl:copy-of select="@lecture"/>
            <xsl:copy-of select="@chapter"/>
            <xsl:copy-of select="@num"/>
            <xsl:copy-of select="@type"/>
            <xsl:copy-of select="@title"/>
            <xsl:copy-of select="@wbtag"/>
            <xsl:if test=".//*[@class='custom_title']">
                <xsl:element name="title">
                    <xsl:text>&#xa;</xsl:text>
                    <xsl:copy-of select=".//*[@class='custom_title']/*|.//*[@class='custom_title']/text()"/>
                </xsl:element>
            </xsl:if>
            <xsl:apply-templates select="text()|*"/>
            <!-- <xsl:text>&#xa;</xsl:text> -->
        </xsl:element>
    </xsl:template>

    <xsl:template match="xh:div[@wbtag='webwork']" >
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:element name="{@wbtag}">
            <xsl:copy-of select="@ww_id"/>
            <xsl:copy-of select="@pg_file"/>
        </xsl:element>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>

    <xsl:template match="xh:div[@wbtag='wb_image']" >
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:element name="{@wbtag}">
            <xsl:copy-of select="@data-src"/>
        </xsl:element>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>

    <xsl:template match="xh:div[@wbtag='qed']" >
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:element name="qed"/>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>

    <xsl:template match="xh:*[@wbtag='topic']">
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:element name="{@wbtag}">
            <xsl:copy-of select="@wbtag"/>
            <argument>
                <xsl:apply-templates select="*|text()" />
            </argument>
        </xsl:element>
    </xsl:template>


    <xsl:template match="xh:*[@wbtag='separator']" />

    <xsl:template match="text()" >
      <xsl:value-of select="." disable-output-escaping="no"/>
    </xsl:template>

    <xsl:template match="comment()" >
        <xsl:comment>
            <xsl:value-of select="." disable-output-escaping="no"/>
        </xsl:comment>
    </xsl:template>
</xsl:stylesheet>
