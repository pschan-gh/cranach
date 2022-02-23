<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:xh = "http://www.w3.org/1999/xhtml"
	xmlns:lv = "http://www.math.cuhk.edu.hk/~pschan/cranach"
	xmlns:idx = "http://www.math.cuhk.edu.hk/~pschan/elephas_index"
	xmlns="http://www.math.cuhk.edu.hk/~pschan/elephas_index"
	>

	<xsl:output method="xml" />
	<xsl:output indent="yes"/>

	<xsl:key name="keyword_branches" match="//idx:branch[@keyword]|//idx:keyword|//lv:keyword" use="@keyword"/>
	<xsl:key name="keyword_branches_slide" match="//idx:branch[@keyword]|//idx:keyword|//lv:keyword" use="concat(@file_md5, '-', @slide, '-', @keyword)"/>

	<xsl:key name="statement_branches" match="
		//idx:branch[@md5]|
		//idx:statement[@md5]|
		//idx:substatement[@md5]|
		//idx:figure[@md5]|
		//lv:statement[@md5]|
		//lv:substatement[@md5]|
		//lv:figure[@md5]" use="@md5"
	/>

	<!-- <xsl:key name="ref_branches" match="//idx:refby[@md5]|//idx:ref[@md5]" use="concat(@file_md5, '-', @slide, '-', @md5)"/> -->
	<!-- <xsl:key name="ref_branches" match="//idx:ref[@referrer-md5]|//lv:ref[@referrer-md5]" use="@referrer-md5"/> -->

	<xsl:template match="/">
		<document>
			<index>
				<xsl:apply-templates select="
					//idx:keyword[@keyword and generate-id() = generate-id(key('keyword_branches', @keyword)[1])]|
					//idx:branch[@keyword and generate-id() = generate-id(key('keyword_branches', @keyword)[1])]|
					//lv:keyword[@keyword and generate-id() = generate-id(key('keyword_branches', @keyword)[1])]
					"/>
				<xsl:apply-templates select="
					//idx:branch[@md5 and (generate-id() = generate-id(key('statement_branches', @md5)[1]))]|
					//idx:statement[@md5 and (generate-id() = generate-id(key('statement_branches', @md5)[1]))]|
					//idx:substatement[@md5 and (generate-id() = generate-id(key('statement_branches', @md5)[1]))]|
					//lv:statement[@md5 and (generate-id() = generate-id(key('statement_branches', @md5)[1]))]|
					//lv:substatement[@md5 and (generate-id() = generate-id(key('statement_branches', @md5)[1]))]|
					//idx:figure[@md5 and (generate-id() = generate-id(key('statement_branches', @md5)[1]))]|
					//lv:figure[@md5 and (generate-id() = generate-id(key('statement_branches', @md5)[1]))]
				"/>
				<xsl:apply-templates select="/idx:preindex/idx:ref|/idx:preindex/lv:ref|//idx:ref|//lv:ref"/>
				<xsl:apply-templates select="
					//idx:ref[@referrer-md5 and (generate-id() = generate-id(key('ref_branches', @referrer-md5)[1]))]|
					//lv:ref[@referrer-md5 and (generate-id() = generate-id(key('ref_branches', @referrer-md5)[1]))]"/>
				<!-- <xsl:apply-templates select="//idx:label|//lv:label"/> -->
				<xsl:apply-templates select="
					//idx:course|
					//idx:chapter|
					//idx:section|
					//idx:subsection|
					//idx:subsubsection|
					//lv:course|
					//lv:chapter|
					//lv:section|
					//lv:subsection|
					//lv:subsubsection
				"/>
			</index>
		</document>
	</xsl:template>

	<xsl:template match="idx:branch[@keyword]|idx:keyword|lv:keyword">
		<entry>
			<xsl:variable name="keyword">
				<xsl:value-of select="@keyword"/>
			</xsl:variable>
			<xsl:attribute name="keyword">
				<xsl:value-of select="@keyword"/>
			</xsl:attribute>
			<xsl:for-each select="
				//idx:branch[@keyword=$keyword and (generate-id() = generate-id(key('keyword_branches_slide', concat(@file_md5, '-', @slide, '-', @keyword))[1]))]|
				//idx:keyword[@keyword=$keyword and (generate-id() = generate-id(key('keyword_branches_slide', concat(@file_md5, '-', @slide, '-', @keyword))[1]))]|
				//lv:keyword[@keyword=$keyword and (generate-id() = generate-id(key('keyword_branches_slide', concat(@file_md5, '-', @slide, '-', @keyword))[1]))]">
				<branch>
					<xsl:copy-of select="@*"/>
					<xsl:copy-of select="text()"/>
				</branch>
			</xsl:for-each>
		</entry>
	</xsl:template>

	<xsl:template match="idx:branch[@md5]|idx:statement[@md5]|idx:substatement[@md5]|lv:statement[@md5]|lv:substatement[@md5]|idx:figure[@md5]|lv:figure[@md5]">
		<entry>
			<xsl:variable name="md5" select="@md5"/>
			<xsl:attribute name="md5">
				<xsl:value-of select="$md5"/>
			</xsl:attribute>
			<xsl:copy-of select="@*"/>
			<xsl:for-each select="key('statement_branches', @md5)">
				<branch>
					<xsl:copy-of select="@*"/>
					<xsl:if test="@of">
						<xsl:variable name="of" select="@of"/>
						<xsl:attribute name="ofmd5">
							<xsl:value-of select="@ofmd5|(//idx:statement[idx:label/@name = $of]|//lv:statement[lv:label/@name = $of]|//lv:*[@md5=$of])/@md5"/>
						</xsl:attribute>
					</xsl:if>
					<xsl:apply-templates select="idx:label|lv:label"/>
					<xsl:apply-templates select="idx:title|lv:title"/>
				</branch>
			</xsl:for-each>
		</entry>
	</xsl:template>

	<xsl:template match="//idx:course|//idx:chapter|//idx:section|//idx:subsection|//idx:subsubsection|//lv:course|//lv:chapter|//lv:section|//lv:subsection|//lv:subsubsection">
		<xsl:element name="{local-name()}" namespace="http://www.math.cuhk.edu.hk/~pschan/elephas_index">
			<xsl:copy-of select="@*"/>
			<xsl:apply-templates select="idx:label|lv:label"/>
			<xsl:apply-templates select="idx:title|lv:title"/>
		</xsl:element>
	</xsl:template>

	<xsl:template match="idx:label|lv:label">
		<xsl:element name="label" namespace="http://www.math.cuhk.edu.hk/~pschan/elephas_index">
			<xsl:copy-of select="../@*"/>
			<xsl:copy-of select="@*"/>
		</xsl:element>
	</xsl:template>

	<xsl:template match="idx:title|lv:title">
		<xsl:element name="title" namespace="http://www.math.cuhk.edu.hk/~pschan/elephas_index">
			<xsl:copy-of select="@*"/>
			<xsl:apply-templates select="*|text()"/>
		</xsl:element>
	</xsl:template>

	<xsl:template match="idx:ref|lv:ref">
		<xsl:element name="ref" namespace="http://www.math.cuhk.edu.hk/~pschan/elephas_index">
			<xsl:copy-of select="@*"/>
			<xsl:apply-templates select="key('ref_branches', @referrer-md5)[1]/*|key('ref_branches', @referrer-md5)[1]/text()"/>
		</xsl:element>
	</xsl:template>

	<xsl:template match="text()">
        <xsl:value-of select="." disable-output-escaping="no" />
	</xsl:template>

</xsl:stylesheet>
