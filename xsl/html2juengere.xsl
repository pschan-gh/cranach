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

    <!-- <xsl:strip-space elements="*"/> -->
    <xsl:preserve-space elements="xh:pre xh:span xh:textarea xh:script"/>

    <xsl:variable name="lv" select="'http://www.math.cuhk.edu.hk/~pschan/cranach'"/>
    <xsl:variable name="xh" select="'http://www.w3.org/1999/xhtml'"/>

    <xsl:template match="*[@wbtag and @wbtag!='ignore' and @wbtag!='webwork' and @wbtag!='wb_image' and @wbtag!='paragraphs' and @wbtag!='newline' and @wbtag!='skip' and @wbtag!='keyword' and @wbtag!='transparent' and not(@metadata) and @wbtag!='qed' and @wbtag!='']">
        <xsl:element name="{@wbtag}" namespace="{$lv}">
            <xsl:copy-of select="@wbtag"/>
            <xsl:copy-of select="@label"/>
            <xsl:copy-of select="@name"/>
            <xsl:copy-of select="@id"/>
            <xsl:copy-of select="@href"/>
            <xsl:apply-templates select="*|text()" />
        </xsl:element>
    </xsl:template>

    <!-- <xsl:template match="*[@wbtag]">
        <xsl:element name="{@wbtag}" namespace="{$lv}">
            <xsl:copy-of select="@wbtag"/>
            <xsl:copy-of select="@label"/>
            <xsl:copy-of select="@name"/>
            <xsl:copy-of select="@id"/>
            <xsl:copy-of select="@href"/>
            <xsl:apply-templates select="*|text()" />
        </xsl:element>
    </xsl:template> -->

    <xsl:template match="//xh:body">
        <xsl:element name="root" namespace="{$lv}">
            <xsl:apply-templates select="xh:div[contains(@class, 'slide')]"/>
        </xsl:element>
    </xsl:template>

    <!-- <xsl:template match="/">
        <xsl:element name="root" namespace="{$lv}">
            <xsl:element name="slides" namespace="{$lv}">
                <xsl:apply-templates select="xh:body/xh:div[contains(@class, 'slide')]"/>
            </xsl:element>
        </xsl:element>
    </xsl:template> -->


    <xsl:template match="xh:*[not(self::xh:body) and not(self::xh:img) and not(@wbtag)]">
      <xsl:element name="xh:{local-name()}">
          <xsl:copy-of select="@*"/>
          <xsl:apply-templates select="*|text()|comment()" />
      </xsl:element>
    </xsl:template>

    <xsl:template match="xh:img">
      <xsl:element name="xh:{local-name()}">
          <xsl:copy-of select="@*[name()!='data-src']"/>
          <xsl:apply-templates select="*|text()|comment()" />
      </xsl:element>
    </xsl:template>

    <xsl:template match="xh:div[contains(@class, 'slide')]" >
        <xsl:element name="slide" namespace="{$lv}">
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

    <!-- <xsl:template match="*[@wbtag]">
        <xsl:element name="{@wbtag}" namespace="{$lv}">
            <xsl:copy-of select="@wbtag"/>
            <xsl:copy-of select="@label"/>
            <xsl:copy-of select="@name"/>
            <xsl:copy-of select="@id"/>
            <xsl:copy-of select="@href"/>
            <xsl:apply-templates select="*|text()" />
        </xsl:element>
    </xsl:template> -->

    <xsl:template match="xh:span[@class='escaped']" >
        <xsl:value-of select="concat('@', normalize-space(text()))"/>
    </xsl:template>


    <xsl:template match="*[@wbtag='ignore']" />
    <xsl:template match="xh:*[@class='knowl-output']" />

    <xsl:template match="*[@wbtag='skip']">
        <xsl:apply-templates select="*|text()" />
    </xsl:template>

    <xsl:template match="*[@wbtag='transparent']">
        <xsl:apply-templates select="*|text()" />
    </xsl:template>

    <xsl:template match="*[@wbtag = 'week']|*[@wbtag = 'lecture']">
        <xsl:element name="chapter" namespace="{$lv}">
            <xsl:copy-of select="@wbtag"/>
            <xsl:copy-of select="@label"/>
            <xsl:copy-of select="@id"/>
            <xsl:copy-of select="@href"/>
            <xsl:attribute name="chapter_type">
                <xsl:value-of select="@wbtag" />
            </xsl:attribute>
            <xsl:if test="./xh:span[@class='num']">
                <xsl:attribute name="num">
                    <xsl:value-of select="./xh:span[@class='num']"/>
                </xsl:attribute>
            </xsl:if>
        </xsl:element>
    </xsl:template>

    <xsl:template match="*[@wbtag='ref']">
        <xsl:element name="{@wbtag}" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="*[@wbtag = 'setchapter' or @wbtag='href']">
        <xsl:element name="{@wbtag}" namespace="{$lv}">
            <xsl:copy-of select="@*"/>
             <xsl:element name="argument" namespace="{$lv}">
                <xsl:value-of select="@argument" />
            </xsl:element>
        </xsl:element>
    </xsl:template>

    <!-- <xsl:template match="*[@wbtag='newline' or @wbtag='para' or local-name()='br']" >
      <xsl:element name="newline" namespace="{$lv}"/>
    </xsl:template> -->

    <xsl:template match="*[@wbtag='newline' or @wbtag='para']" >
      <xsl:element name="newline" namespace="{$lv}"/>
    </xsl:template>

    <xsl:template match="*[local-name()='br' and not(@wbtag)]" >
      <xsl:element name="br" namespace="{$xh}"/>
    </xsl:template>

    <xsl:template match="xh:span[@wbtag='paragraphs']" >
        <xsl:element name="{@wbtag}" namespace="{$lv}">
            <xsl:attribute name="wbtag">
                <xsl:text>paragraphs</xsl:text>
            </xsl:attribute>
            <xsl:apply-templates select="text()|comment()|*"/>
            <!-- <xsl:text>&#xa;</xsl:text> -->
        </xsl:element>
    </xsl:template>

    <xsl:template match="xh:div[@wbtag='center' or @wbtag='left' or @wbtag='right']" >
         <xsl:element name="{@wbtag}" namespace="{$lv}">
            <xsl:copy-of select="@wbtag"/>
            <xsl:apply-templates select="text()|comment()|*"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="xh:div[@wbname='statement' or @wbname='substatement']">
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:element name="{@wbname}" namespace="{$lv}">
            <xsl:copy-of select="@course"/>
            <xsl:copy-of select="@week"/>
            <xsl:copy-of select="@lecture"/>
            <xsl:copy-of select="@chapter"/>
            <xsl:copy-of select="@num"/>
            <xsl:copy-of select="@type"/>
            <xsl:copy-of select="@title"/>
            <xsl:copy-of select="@wbtag"/>
            <xsl:apply-templates select="text()|*"/>
            <!-- <xsl:text>&#xa;</xsl:text> -->
        </xsl:element>
    </xsl:template>

    <!-- <xsl:template match="*[@class='custom_title']" >
        <xsl:element name="title" namespace="{$lv}">
            <xsl:apply-templates select="*|text()" />
        </xsl:element>
    </xsl:template>

    <xsl:template match="*[@wbtag='label']" >
        <xsl:element name="label" namespace="{$lv}">
            <xsl:apply-templates select="*|text()" />
        </xsl:element>
    </xsl:template> -->


    <xsl:template match="xh:div[@wbtag='webwork']" >
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:element name="{@wbtag}" namespace="{$lv}">
            <xsl:copy-of select="@ww_id"/>
            <xsl:copy-of select="@pg_file"/>
        </xsl:element>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>

    <xsl:template match="xh:div[@wbtag='wb_image']" >
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:element name="{@wbtag}" namespace="{$lv}">
            <xsl:copy-of select="@data-src"/>
        </xsl:element>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>

    <xsl:template match="xh:div[@wbtag='qed']" >
        <!-- <xsl:text>&#xa;</xsl:text> -->
        <xsl:element name="qed" namespace="{$lv}"/>
        <!-- <xsl:text>&#xa;</xsl:text> -->
    </xsl:template>

    <xsl:template match="*[@wbtag='topic']">
        <!-- <xsl:text>&#xa;</xsl:text> -->
         <xsl:element name="{@wbtag}" namespace="{$lv}">
            <xsl:copy-of select="@wbtag"/>
            <xsl:apply-templates select="*|text()" />
        </xsl:element>
    </xsl:template>

    <xsl:template match="*[@wbtag='keyword']">
        <xsl:element name="inline_keyword" namespace="{$lv}">
           <xsl:value-of select="./text()" disable-output-escaping="no"/>
       </xsl:element>
    </xsl:template>

    <xsl:template match="*[@wbtag='separator']" />

    <xsl:template match="*[@class='paragraphs']">
        <xsl:element name="paragraphs" namespace="{$lv}">
            <xsl:apply-templates select="*|text()" />
        </xsl:element>
    </xsl:template>

    <xsl:template match="text()" >
      <!-- <xsl:value-of select="normalize-space(.)" disable-output-escaping="no"/> -->
      <xsl:value-of select="." disable-output-escaping="no"/>
    </xsl:template>

    <xsl:template match="comment()" >
        <xsl:comment>
            <xsl:value-of select="." disable-output-escaping="no"/>
        </xsl:comment>
    </xsl:template>
</xsl:stylesheet>
