<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/rss">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="channel/title"/> — RSS Feed</title>
        <style>
          :root { color-scheme: light; }
          * { box-sizing: border-box; }
          body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                 color: #1d2b38; background: #f4f7fa; line-height: 1.65; }
          .wrap { max-width: 44rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
          .banner { background: linear-gradient(140deg, #16324a, #2b4f6b); color: #dce8f2;
                    border-radius: 12px; padding: 1.6rem 1.75rem; box-shadow: 0 10px 30px rgba(20,41,60,.18); }
          .banner h1 { margin: 0 0 .4rem; font-family: Georgia, serif; color: #fff; font-size: 1.6rem; }
          .banner p { margin: .3rem 0; color: #c3d4e2; }
          .banner code { display: inline-block; background: rgba(255,255,255,.12); border-radius: 6px;
                         padding: .2rem .55rem; color: #ffc79e; font-size: .95rem; word-break: break-all; }
          .banner a { color: #ffb27d; font-weight: 700; }
          .readers { font-size: .9rem; color: #9db4c6; margin-top: .8rem; }
          h2.list-title { font-family: Georgia, serif; color: #1f3b52; margin: 2.25rem 0 1rem;
                          padding-bottom: .5rem; border-bottom: 2px solid #dbe4ec; }
          .item { background: #fff; border: 1px solid #dbe4ec; border-radius: 10px;
                  padding: 1.1rem 1.3rem; margin-bottom: .9rem; box-shadow: 0 1px 3px rgba(20,41,60,.07); }
          .item a { color: #1f3b52; font-weight: 700; text-decoration: none; font-size: 1.06rem; }
          .item a:hover { color: #c95511; text-decoration: underline; }
          .item .date { display: block; font-size: .82rem; color: #55677a; margin: .25rem 0 .4rem; }
          .item p { margin: 0; font-size: .93rem; color: #55677a; }
          .home { display: inline-block; margin-top: 1.5rem; font-weight: 700; color: #2b5f87; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="banner">
            <h1><xsl:value-of select="channel/title"/> — RSS Feed</h1>
            <p><strong>This is a web feed,</strong> not a broken page. Copy this URL into any RSS reader to
               get every new article automatically:</p>
            <p><code><xsl:value-of select="channel/atom:link/@href"/></code></p>
            <p class="readers">Popular free readers: Feedly, Inoreader, NetNewsWire (Mac/iOS), Thunderbird —
               open the app, choose “Add feed / Follow”, and paste the URL above.</p>
          </div>
          <h2 class="list-title">Latest articles in this feed</h2>
          <xsl:for-each select="channel/item">
            <div class="item">
              <a><xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
                <xsl:value-of select="title"/></a>
              <span class="date"><xsl:value-of select="pubDate"/></span>
              <p><xsl:value-of select="description"/></p>
            </div>
          </xsl:for-each>
          <a class="home"><xsl:attribute name="href"><xsl:value-of select="channel/link"/></xsl:attribute>
            ← Back to <xsl:value-of select="channel/title"/></a>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
