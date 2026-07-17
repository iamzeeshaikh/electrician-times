---
title: "Earthing Systems Explained: TN, TT and IT Networks"
slug: "earthing-systems-explained-tn-tt-it"
description: "TN-S, TN-C-S, TT and IT describe how a supply is earthed — and they decide how fault current gets back to the source. A plain-language tour of the IEC earthing systems."
seoTitle: "Earthing Systems Explained: TN, TT and IT - Electrician Times"
seoDescription: "TN-S, TN-C-S, TT and IT describe how a supply is earthed and how fault current returns to the source. A plain-language tour of the IEC earthing systems."
focusKeyword: "earthing systems"
publishDate: "2026-07-17T07:20:00Z"
modifiedDate: "2026-07-17T07:20:00Z"
author: "Steven"
categories: ["electrical", "wiring"]
tags: []
primaryCategory: "electrical"
featuredImage: "/wp-content/uploads/2024/01/Review-of-PUE-standards-for-grounding-loop.webp"
featuredImageAlt: "Grounding loop conductors at a building"
featuredImageWidth: 740
featuredImageHeight: 486
draft: false
format: "html"
faq:
  - question: "What do the letters in TN-S and TT mean?"
    answer: "The first letter describes how the supply source is earthed (T = directly earthed). The second describes how the installation's exposed metalwork is earthed: N means via the supply's neutral point, T means via its own local earth electrode. Additional letters describe whether neutral and protective functions are combined (C) or separate (S)."
  - question: "Which earthing system is best?"
    answer: "Each is a trade-off. TN systems give low-impedance fault paths that trip breakers fast; TT relies on RCDs because the earth path has higher impedance; IT maximises continuity of supply for special locations like operating theatres. The 'best' system is the one your network provides, installed and protected correctly."
  - question: "How do I know which earthing system my house has?"
    answer: "You generally can't tell safely by looking — the answer lives at the service head and main earthing terminal. An electrician can identify it during an inspection, and it will usually be recorded on your installation's paperwork."
---

<p>Every electrical installation has to answer one deceptively simple question: <em>when something goes wrong and current escapes to exposed metal, how does it get back to the source fast enough to trip the protection?</em> The internationally used answer is a family of "earthing systems" with cryptic names — TN-S, TN-C-S, TT, IT — defined in the IEC's wiring standards and adopted, with local variations, across much of the world.</p>

<p>This site has covered the practical side in <a href="/a-comprehensive-guide-to-installing-protective-grounding/">installing protective grounding</a> and <a href="/do-it-yourself-grounding-device-in-a-private-house/">grounding electrodes for private houses</a>; this article gives you the map those articles fit into.</p>

<h2>Decoding the letters</h2>
<ul>
<li><strong>First letter — the source:</strong> T (from French <em>terre</em>) means the transformer's neutral point is connected directly to earth. I means it is isolated from earth, or earthed only through a high impedance.</li>
<li><strong>Second letter — your installation:</strong> N means exposed metalwork is connected back to the source's earthed neutral point via a conductor. T means it is connected to a local earth electrode of its own.</li>
<li><strong>Suffixes:</strong> S means the neutral (N) and protective earth (PE) are Separate conductors; C means they are Combined into one conductor (PEN).</li>
</ul>

<h2>TN-S: separate neutral and earth all the way</h2>
<p>The supply provides five conductors in three-phase form (or three in single-phase): phases, neutral, and a dedicated protective earth running back to the transformer. A fault to metalwork sees a low-impedance metallic loop, drives a large fault current, and the <a href="/understanding-circuit-breakers-types-and-functions/">circuit breaker</a> trips quickly.</p>
<p><strong>Strengths:</strong> clean, predictable, no fault current flowing through combined conductors. <strong>Weaknesses:</strong> an extra conductor to run, and the earth path depends entirely on that conductor's integrity.</p>

<h2>TN-C and TN-C-S: the combined PEN conductor</h2>
<p>In TN-C the neutral and protective earth are one conductor (PEN) throughout — rare inside modern buildings. Far more common is <strong>TN-C-S</strong>: combined out in the distribution network, then split into separate N and PE at the service entrance. In the UK this arrangement is known as PME (protective multiple earthing).</p>
<p><strong>Strengths:</strong> economical for the network, low-impedance fault path. <strong>The known weakness:</strong> everything hangs on the PEN conductor. If it breaks in the network, exposed metalwork in the installation can rise to dangerous voltage — which is why regulations hedge TN-C-S with extra bonding requirements and restrict it for special situations such as some outdoor and vehicle-supply installations. Those detailed rules are jurisdiction-specific; this is firmly electrician territory.</p>

<h2>TT: your own earth electrode</h2>
<p>The source is earthed, and your installation has its own earth electrode — rods, tapes or a <a href="/review-of-pue-standards-for-grounding-loop/">grounding loop</a> — with no metallic earth conductor from the supply. Fault current must return through the general mass of earth, so it is far smaller than in TN systems; often too small to trip an ordinary breaker.</p>
<p>That is why TT installations lean on <strong>residual current devices</strong>: an RCD detects a few tens of milliamps of leakage regardless of how weak the earth path is. If your installation is TT, working RCDs aren't an upgrade — they're the design. (See our comparison of <a href="/rcd-vs-rcbo-vs-gfci-differences/">RCD, RCBO and GFCI protection</a>.)</p>
<p><strong>Typical use:</strong> rural supplies, overhead networks, countries where the distributor doesn't export an earth.</p>

<h2>IT: isolated from earth on purpose</h2>
<p>In an IT system the source is unearthed or earthed through a deliberately high impedance. A single fault to earth produces almost no fault current — the system keeps running, an insulation-monitoring device raises an alarm, and maintenance finds the fault before a <em>second</em> one develops. That continuity is why IT systems serve hospitals' operating theatres, some industrial processes and other places where an unplanned trip is worse than a fault.</p>
<p>The price is complexity: insulation monitoring, trained staff and strict rules about clearing the first fault promptly.</p>

<h2>Comparison at a glance</h2>
<table>
<thead>
<tr><th>System</th><th>Earth path for a fault</th><th>Main protection</th><th>Typical setting</th></tr>
</thead>
<tbody>
<tr><td>TN-S</td><td>Dedicated PE conductor to source</td><td>Overcurrent devices (fast trip)</td><td>Urban networks, newer installations</td></tr>
<tr><td>TN-C-S (PME)</td><td>PEN conductor, split at entry</td><td>Overcurrent devices + bonding rules</td><td>Very common in modern distribution</td></tr>
<tr><td>TT</td><td>Local electrode through soil</td><td>RCDs (mandatory in practice)</td><td>Rural/overhead supplies</td></tr>
<tr><td>IT</td><td>Almost none on first fault</td><td>Insulation monitoring + planned maintenance</td><td>Hospitals, critical industry</td></tr>
</tbody>
</table>

<h2>Why you should care which one you have</h2>
<p>The earthing system decides what "safe" looks like for everything downstream: whether RCDs are optional or essential, how bonding must be done, what happens during a network fault, and how additions like EV chargers or outbuilding supplies must be designed. It's determined by your electricity network and verified at your service entrance — not something to guess from an article. If you don't know what your installation uses, that's a good question for your next electrical inspection.</p>

<div class="callout" role="note"><p><strong>Safety note:</strong> earthing terminology here follows IEC usage; national standards implement it with local rules and exceptions that change over time. Nothing in this overview replaces the judgement of a licensed electrician working to your local regulations.</p></div>
