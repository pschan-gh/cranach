<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:xh="http://www.w3.org/1999/xhtml"
	xmlns:lv="http://www.math.cuhk.edu.hk/~pschan/cranach"
	>
	<xsl:output method="text" encoding="UTF-8"/>

	<xsl:strip-space elements="lv:* xh:*"/>
	<xsl:preserve-space elements="xh:textarea xh:pre lv:paragraphs"/>

	<xsl:param name="contenturldir"></xsl:param>

	<xsl:template match="/">
		<xsl:apply-templates select="lv:document" />
	</xsl:template>

	<xsl:template match="lv:document">
		<xsl:text>\documentclass[a4paper,12pt]{report}</xsl:text>
		<xsl:call-template name="latex-preamble" />
		<xsl:text>\begin{document}&#xa;</xsl:text>
		<xsl:apply-templates select="lv:course|lv:week|lv:lecture|lv:chapter|lv:section|lv:subsection|lv:subsubsection|lv:slides|lv:bare" />
		<!-- <xsl:text>&#xa;\quad\\\hrule\quad\\</xsl:text> -->
		<!-- <xsl:apply-templates select="lv:slides/lv:slide"/> -->
		<xsl:text>&#xa;\end{document}</xsl:text>
	</xsl:template>

<xsl:template name="latex-preamble">
\usepackage[T1]{fontenc}
\usepackage{times}
\usepackage{amsthm}
\usepackage{amscd,amssymb,stmaryrd}
\usepackage{amsmath}
\usepackage{graphicx}
\usepackage{fancybox}
\usepackage{amstext}
\usepackage{color}
\usepackage{mathtools}
\usepackage{pdflscape}
\usepackage{listings}
\usepackage{epic,eepic}
\usepackage{fancyhdr}
\usepackage{hyperref}
\usepackage[capitalise]{cleveref}
\usepackage{tikz}
<!-- \usepackage{booktabs} -->

\newcounter{statement}
\numberwithin{statement}{chapter}

\newtheorem{thm}[statement]{Theorem}
\newtheorem{prop}[statement]{Proposition}
\newtheorem{defn}[statement]{Definition}
\newtheorem{lemma}[statement]{Lemma}
\newtheorem{claim}[statement]{Claim}
\newtheorem{cor}[statement]{Corollary}
\newtheorem{fact}[statement]{Fact}
\newtheorem{example}[statement]{\bf Example}
\newtheorem{eg}[statement]{\bf Example}
\newtheorem{ex}[statement]{\bf Exercise}
\newtheorem*{notation}{\bf Notation}
\newtheorem*{sol}{\bf Solution}
\newtheorem*{remark}{\bf Remark}
\numberwithin{equation}{chapter}
\numberwithin{section}{chapter}
\numberwithin{subsection}{section}
<!-- \renewcommand{\thesubsection}{} -->
\renewcommand{\thesection}{\thechapter.\arabic{section}}
\renewcommand{\thesubsection}{\thesection.\arabic{subsection}}

<!-- \renewcommand{\thesection}{} -->
</xsl:template>

	<xsl:template match="*">
		<xsl:apply-templates select="*|text()" />
	</xsl:template>

	<xsl:template match="lv:course">
		<xsl:text>&#xa;</xsl:text>
		<xsl:value-of select="concat('\title{', ./lv:title/text() , '}')"/>
		<xsl:apply-templates select="lv:week|lv:lecture|lv:chapter|lv:section|lv:subsection|lv:subsubsection|lv:slides" />
	</xsl:template>

	<xsl:template match="lv:week|lv:lecture|lv:chapter">
		<xsl:text>&#xa;</xsl:text>
		<xsl:value-of select="concat('\setcounter{chapter}{', ./@num, '}')"/>
		<xsl:text>\setcounter{section}{0}&#xa;\setcounter{subsection}{0}&#xa;\setcounter{statement}{0}&#xa;</xsl:text>
		<xsl:text>\chapter*{</xsl:text>
		<xsl:value-of select="concat(ancestor::lv:course/@title, ' ', @chapter_type, ' ', @num)"/>
		<xsl:apply-templates select="lv:title"/>
		<xsl:text>}</xsl:text>
		<!-- <xsl:text>{\bf Topics: }</xsl:text> -->
		<xsl:if test="lv:topic">
			<xsl:text>&#xa;</xsl:text>
			<xsl:apply-templates select="lv:topic" />
			<xsl:text>\quad\newline\hrule\quad\newline</xsl:text>
		</xsl:if>
		<xsl:apply-templates select="lv:section|lv:subsection|lv:subsubsection|lv:slides" />
	</xsl:template>

	<xsl:template match="lv:topic" >
		<xsl:text>{\Large </xsl:text>
		<xsl:apply-templates select="*|text()" />
		<xsl:text>}</xsl:text>
		<xsl:if test="position() != last()">
			<xsl:text>, </xsl:text>
		</xsl:if>
	</xsl:template>

	<xsl:template match="lv:section|lv:subsection|lv:subsubsection">
		<xsl:text>&#xa;</xsl:text>
		<!-- <xsl:value-of select="concat('\', local-name(), '{', @serial)"/> -->
		<xsl:value-of select="concat('\', local-name(), '{')"/>
		<xsl:apply-templates select="lv:title"/>
		<xsl:text>}</xsl:text>
		<xsl:apply-templates select="lv:subsection|lv:subsubsection|lv:slides" />
	</xsl:template>

	<xsl:template match="lv:bare">
		<xsl:text>&#xa;</xsl:text>
		<xsl:apply-templates select="*" />
	</xsl:template>

	<xsl:template match="lv:slides">
		<xsl:apply-templates select="lv:slide" />
	</xsl:template>

	<xsl:template match="lv:slide">
		<xsl:apply-templates select="*[not(self::lv:topic)]" />
	</xsl:template>

	<xsl:template match="lv:keywords|lv:keyword|lv:hc_keyword|lv:title"/>

	<xsl:template match="xh:a">
		<xsl:value-of select="concat('\href{',  @href, '}{')"/>
		<xsl:apply-templates select="*|text()|comment()" />
		<xsl:text>}</xsl:text>
	</xsl:template>

	<xsl:template match="lv:paragraphs" >
	<xsl:if test="not(preceding-sibling::lv:inline_keyword or preceding-sibling::lv:ref or parent::lv:title) and preceding-sibling::lv:*[@wbtag!='']">
		<xsl:text>&#xa;</xsl:text>
	</xsl:if>
	<xsl:apply-templates select="text()|comment()" />
</xsl:template>

<xsl:template match="lv:newcol|lv:collapse">
	<xsl:text>&#xa;</xsl:text>
	<!-- <xsl:apply-templates select="*[not(self::lv:paragraphs)]|lv:paragraphs/text()" /> -->
	<xsl:apply-templates select="*" />
</xsl:template>

<xsl:template match="lv:statement|lv:substatement">
	<xsl:text>&#xa;</xsl:text>
	<xsl:text>\begin{</xsl:text>
	<xsl:value-of select="@wbtag"/>
	<xsl:text>}</xsl:text>
	<xsl:choose>
		<xsl:when test="@title">
			<xsl:text>[</xsl:text>
			<xsl:value-of select="@title"/>
			<xsl:text>]</xsl:text>
		</xsl:when>
	</xsl:choose>
	<!-- <xsl:text>&#xa;</xsl:text> -->
	<xsl:choose>
		<xsl:when test="@label">
			<xsl:text>&#xa;\label{</xsl:text>
			<xsl:value-of select="@label"/>
			<xsl:text>}</xsl:text>
		</xsl:when>
	</xsl:choose>
	<xsl:apply-templates select="*|comment()" />
	<xsl:text>&#xa;\end{</xsl:text>
	<xsl:value-of select="@wbtag"/>
	<xsl:text>}</xsl:text>
</xsl:template>

<xsl:template match="lv:section/lv:title|lv:subsection/lv:title|lv:subsubsection/lv:title">
	<xsl:apply-templates select="*|comment()">
	</xsl:apply-templates>
</xsl:template>

<xsl:template match="ul|lv:ul|xh:ul|lv:col_ul|lv:itemize">
	<xsl:text>&#xa;</xsl:text>
	<xsl:text>\begin{itemize}</xsl:text>
	<xsl:apply-templates select="*" />
	<xsl:text>&#xa;</xsl:text>
	<xsl:text>&#xa;\end{itemize}</xsl:text>
</xsl:template>

<xsl:template match="ol|lv:ol|xh:ol|lv:col_ol|lv:enumerate">
	<xsl:text>&#xa;</xsl:text>
	<xsl:text>\begin{enumerate}</xsl:text>
	<xsl:apply-templates select="*" />
	<xsl:text>&#xa;</xsl:text>
	<xsl:text>&#xa;\end{enumerate}</xsl:text>
</xsl:template>

<xsl:template match="li|lv:li|xh:li|lv:col_li|lv:item">
	<xsl:text>&#xa;</xsl:text>
	<xsl:text>\item</xsl:text>
	<!-- <xsl:text>&#xa;</xsl:text> -->
	<xsl:apply-templates select="text()|*" />
</xsl:template>

<xsl:template match="lv:webwork">
	<xsl:text>&#xa;</xsl:text>
	<xsl:text>{\bf WeBWork}</xsl:text>
</xsl:template>

<xsl:template match="xh:h1">
	<xsl:text>&#xa;</xsl:text>
	<xsl:text>\chapter{</xsl:text>
	<xsl:apply-templates select="text()|*" />
	<xsl:text>}&#xa;</xsl:text>
</xsl:template>
<xsl:template match="xh:h2">
	<xsl:text>\quad\\\hrule&#xa;\quad\\&#xa;</xsl:text>
	<xsl:text>\section*{</xsl:text>
	<xsl:apply-templates select="text()|*" />
	<xsl:apply-templates select="lv:title"/>
	<xsl:text>}&#xa;</xsl:text>
</xsl:template>
<xsl:template match="xh:h3">
	<xsl:text>\quad\\\hrule&#xa;\quad\\&#xa;</xsl:text>
	<xsl:text>\subsection*{</xsl:text>
	<xsl:apply-templates select="text()|*" />
	<xsl:text>}&#xa;</xsl:text>
</xsl:template>
<xsl:template match="xh:h4">
	<!-- <xsl:text>&#xa;</xsl:text> -->
	<xsl:text>\subsubsection*{</xsl:text>
	<xsl:apply-templates select="text()|*" />
	<xsl:text>}&#xa;</xsl:text>
</xsl:template>
<xsl:template match="xh:h5">
	<!-- <xsl:text>&#xa;</xsl:text> -->
	<xsl:text>\textbf{</xsl:text>
	<xsl:apply-templates select="text()|*" />
	<xsl:text>}&#xa;</xsl:text>
</xsl:template>

<xsl:template match="lv:newline">
	<xsl:text>&#xa;</xsl:text>
	<xsl:text>&#xa;</xsl:text>
</xsl:template>

<xsl:template match="xh:hr">
	<xsl:text>&#xa;\quad\\\hrule&#xa;\quad\\&#xa;</xsl:text>
</xsl:template>


<xsl:template match="xh:u">
	<!-- <xsl:text> </xsl:text> -->
	<xsl:text> \underline{ </xsl:text>
	<xsl:apply-templates select="*|text()" />
	<xsl:text>} </xsl:text>
</xsl:template>

<xsl:template match="xh:b|xh:strong|lv:inline_keyword">
	<xsl:if test="not(contains(@style, 'display:none'))">
		<xsl:text>{\bf </xsl:text>
		<xsl:apply-templates select="*|text()" />
		<xsl:text>}</xsl:text>
	</xsl:if>
</xsl:template>

<xsl:template match="xh:em|xh:i">
	<xsl:if test="not(contains(@style, 'display:none'))">
		<xsl:text>{\it </xsl:text>
		<xsl:apply-templates select="*|text()" />
		<xsl:text>}</xsl:text>
	</xsl:if>
</xsl:template>

<xsl:template match="*[@class='image']">
	<xsl:text>&#xa;\begin{center}</xsl:text>
	<xsl:apply-templates select="*|text()" />
	<xsl:text>&#xa;\end{center}</xsl:text>
</xsl:template>

<xsl:template match="lv:href">
	<xsl:value-of select="concat('\href{', @src, '}{', @name, '}')"/>
</xsl:template>

<xsl:template match="lv:ref">
	<xsl:choose>
		<xsl:when test="@filename='self'">
			<xsl:value-of select="concat('\cref{', @label, '}')"/>
		</xsl:when>
		<xsl:otherwise>
			<xsl:choose>
				<xsl:when test="@type='Section'">
					<xsl:value-of select="concat('\href{', $contenturldir, '/' , @src-filename, '&amp;section=', @serial, '}')"/>
					<xsl:value-of select="concat('{Section ', @serial)" />
					<xsl:if test="lv:title">
						<xsl:value-of select="concat(' (', lv:title/text(), ')')"/>
					</xsl:if>
					<xsl:text>}</xsl:text>
				</xsl:when>
				<xsl:otherwise>
					<xsl:choose>
						<xsl:when test="not(@name)">
							<xsl:value-of select="concat('\href{', $contenturldir, '/' , @src-filename, '&amp;slide=', @src-slide, '\#item', @item, '}{', lv:title/text(), '}')"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="concat('\href{', $contenturldir, '/' , @src-filename, '&amp;slide=', @src-slide, '\#item', @item, '}{', @name, '}')"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template match="xh:br">
	<xsl:text>&#xa;&#xa;</xsl:text>
</xsl:template>

<xsl:template match="xh:pre">
	<xsl:text>&#xa;\begin{verbatim}</xsl:text>
	<xsl:apply-templates select="text()" />
	<xsl:text>&#xa;\end{verbatim}</xsl:text>
</xsl:template>

<xsl:template match="lv:escaped">
	<xsl:text>@</xsl:text>
	<xsl:value-of select="@argument"/>
</xsl:template>

<xsl:template match="text()" >
	<!-- <xsl:value-of select="normalize-space(.)" /> -->
	<xsl:value-of select="." />
</xsl:template>

<xsl:template match="comment()" >
</xsl:template>

<xsl:template match="xh:table[not(./xh:tbody)]|xh:tbody">
	<xsl:text>\begin{center}&#10;</xsl:text>
	<xsl:text>\begin{tabular}{|</xsl:text>

	<xsl:for-each select="xh:thead/xh:tr[1]/*|xh:tr[1]/*">
		<xsl:choose>
			<xsl:when test="@colspan">
				<xsl:for-each select="(//*)[position()&lt;=current()/@colspan]">|c|</xsl:for-each>
			</xsl:when>
			<xsl:otherwise>c|</xsl:otherwise>
		</xsl:choose>
	</xsl:for-each>
	<xsl:text>}&#10;</xsl:text>


	<xsl:for-each select="xh:thead/xh:tr">
		<xsl:text>\hline&#10;</xsl:text>
		<xsl:for-each select="xh:td|xh:th">
			<xsl:if test="self::th|self::td">\bfseries </xsl:if>
			<xsl:apply-templates />
			<xsl:if test="position() != last()">
				<xsl:text>&amp;</xsl:text>
			</xsl:if>
		</xsl:for-each>
		<xsl:text>\\\hline&#10;</xsl:text>
	</xsl:for-each>

	<xsl:for-each select="xh:tr|xh:tbody/xh:tr">
		<!-- <xsl:if test="position() != 1">
		<xsl:text>\hline&#10;</xsl:text>
	</xsl:if> -->

	<xsl:text>\hline&#10;</xsl:text>

	<xsl:for-each select="xh:td|xh:th">
		<xsl:if test="self::th">\bfseries </xsl:if>
		<xsl:apply-templates />
		<xsl:if test="position() != last()">
			<xsl:text>&amp;</xsl:text>
		</xsl:if>
	</xsl:for-each>

	<xsl:if test="position()!=last()"> \\&#10;</xsl:if>
</xsl:for-each>

<xsl:text>\\\hline&#10;</xsl:text>
<xsl:text>&#xa;\end{tabular}&#10;</xsl:text>
<xsl:text>&#xa;\end{center}</xsl:text>

</xsl:template>

<xsl:template match="xh:table[./xh:tbody]">
	<xsl:apply-templates select="xh:tbody"/>
</xsl:template>

<xsl:template match="xh:img">
	<xsl:text>IMAGE</xsl:text>
</xsl:template>

</xsl:stylesheet>
