---
title: "Digital Substations: Pros And Cons"
slug: "digital-substations-pros-and-cons"
description: "In modern technology, there is a clear emphasis on digital technology. Various systems acquire the ability to be remotely controlled and can exchange…"
descriptionGenerated: true
publishDate: "2024-01-22T07:46:10Z"
modifiedDate: "2026-01-08T09:06:58Z"
author: "Steven"
categories: ["cable", "electrical"]
tags: []
primaryCategory: "cable"
featuredImage: "/wp-content/uploads/2024/01/Digital-substations.webp"
featuredImageAlt: "Digital substations"
featuredImageWidth: 500
featuredImageHeight: 254
ogImage: "/wp-content/uploads/2024/01/Digital-substations.webp"
draft: false
format: "html"
sourceWordPressId: 1071
---

<p>In modern technology, there is a clear emphasis on digital technology. Various systems acquire the ability to be remotely controlled and can exchange data with each other. Take, for example, a “smart home”.</p>

<p>I have talked about a smart home more than once on the blog, here is a recent example about maintaining the temperature in the house using Wi-Fi, an application on the phone and cloud storage.</p>

<p>However, for such important facilities as substations, digitalization opens up both great opportunities and great risks.&nbsp;The field is at the peak of technology and is constantly evolving, so only specialists with complete knowledge in various fields can understand all the features.</p>

<p>Let's figure it out too.</p>

<h2><strong>How is the substation arranged</strong><strong>?</strong></h2>

<p>Before you begin to understand what a digital substation (DSS) is, I suggest you familiarize yourself with what basic elements an AC electrical transformer substation consists of, and what systems are there.&nbsp;Since this topic is very voluminous, I will talk in general terms.</p>

<blockquote class="wp-block-quote"><p>There is an opinion: A substation is a TRANSFORMER.&nbsp;The digital substation will be invented immediately after the invention of the digital transformer.&nbsp;In the meantime, a play on fashionable words.</p>

<figure class="wp-block-image size-large is-resized"><img decoding="async" loading="lazy" width="1024" height="520" src="/wp-content/uploads/2024/01/PS-110-kV-1024x520.webp" alt="" class="wp-image-1072" style="aspect-ratio:1;width:758px;height:auto"/><figcaption class="wp-element-caption">Substation 110 kV</figcaption></figure>
</blockquote>

<p>The heart of the substation is the power transformer, which converts alternating electrical current from one voltage to another. There are step-down and step-up substations.</p>

<p>Of course, to operate, the transformer needs electrical energy, which is supplied through the switchgear.&nbsp;The switchgear is designed for receiving and distributing electricity and contains various switching devices, buses, current and voltage transformers, protection systems, metering systems, control devices and various auxiliary systems.</p>

<p>Also, through the switchgear, the converted voltage from the transformer is supplied to the outgoing lines. There are open (ORU) and closed (CLD) switchgear.</p>

<figure class="wp-block-image aligncenter size-full"><img decoding="async" loading="lazy" width="500" height="371" src="/wp-content/uploads/2024/01/Open-switchgear-at-the-substation-OSU.webp" alt="" class="wp-image-1074"/></figure>

<h2><strong>How does relay protection work?</strong></h2>

<p>To quickly identify and disconnect damaged sections of an electrical installation, relay protection and automation (RPA) is used. Speaking in general terms, the workflow looks like this.</p>

<blockquote class="wp-block-quote"><p>Looking ahead: the main difference between a digital substation and a “regular” one is the element base of relay protection and automation, digital communication between elements (including through fiber-optic lines), and the absence of operational personnel.</p>
</blockquote>

<p>Relay protection constantly monitors a certain area.&nbsp;For this purpose, signals from current transformers (CTs) and voltage transformers (VTs) are supplied to the measuring elements.&nbsp;The use of CTs and VTs allows you to reduce voltage and continuously measure parameters.</p>

<p>When the controlled value exceeds the limits of the established range (set), the relay is activated and switches contacts, launching a certain algorithm. As a result of these actions, the logical part gives a command to a specific switching device, thereby preventing the development of an accident.</p>

<p>To indicate the operation of a certain protection, an indicator relay is used, as well as a sound and light alarm.</p>

<p>As an example of a relay protection and automation system, we will consider the operation of overcurrent protection (MCP) on an outgoing line in a network with an isolated neutral, with a one-way power supply.</p>

<h2><strong>Relay protection and automation on controllers</strong></h2>

<p>Existing types of protection can be implemented both on relays and microcontrollers. Such devices are currently the next stage in the development of protection and allow the implementation of additional functions and modes in one device.</p>

<h2><strong>Electricity metering</strong></h2>

<p>One of the important functions of any substation is electricity metering. Nowadays it is already difficult to find induction electricity meters. Modern electronic meters are used at substations. At the same time, the devices can operate either autonomously or combined into a system (AIMS KUE - automated information and measurement system for energy resources accounting).</p>

<h2><strong>How is a digital substation different from a conventional substation?</strong></h2>

<p>Even the presence of modern microprocessor-based relay protection devices and electronic energy metering devices does not make an ordinary substation a digital substation. After all, operating personnel are required to service such a substation.</p>

<h2><strong>CPS in the world</strong></h2>

<p>The first sign of widespread implementation of the central substation was the launch of the TVA Bradley 500 kV substation in the USA in 2008. This project was considered a practical test of solutions and compatibility of components from different manufacturers, taking into account the requirements of the IEC 61850 standard.</p>

<p>Based on the results of operating the DSP, conclusions were drawn about the need to improve compatibility testing systems for individual devices. An unexpected problem emerged - although the devices formally complied with the standards, in practice, it turned out that different manufacturers interpreted their requirements in their way.</p>

<p>The following year, 2009, the Alcala de Henares CPS was launched in the capital of Spain, Madrid. During its construction, the experience of American colleagues was taken into account. A feature of this DSP was the use of interface devices with switching devices, the data from which was transmitted via fibre-optic communication to the switch.</p>

<p>However, the PRC managed to take a leading position in the world, thanks to the commissioning of as many as 70 central processing stations in 2009. By the end of 2013, the number of digital substations reached 893. In addition, only products from local manufacturers were used in these substations.</p>

<h2><strong>Disadvantages of digital substations</strong></h2>

<p>Unfortunately, the issues of standardization of such software have not yet been fully resolved. Each large network organization (not to mention countries) has its own understanding of such systems and its own characteristics regarding technologies, local standards and power distribution systems. And this imposes restrictions on the development and implementation of new DSPs - after all every DSP needs to be designed from scratch.</p>

<p>In addition, the issue of training operational and maintenance personnel, as well as maintainability and interchangeability of DSP components, is extremely important.</p>

<p>The transition to automated telecontrol must increase cybersecurity risks. After all, hacking control networks of central security stations can become the target of hackers, and then a blackout is not far away.</p>

<p>If we look into the future, the current political situation requires the use of domestic solutions in both the software and hardware parts of the DSP. If Russia can fully resolve the issues of import substitution and the supply of high-tech equipment, in the future we will see the widespread development of digital production centers.</p>

<figure class="wp-block-image aligncenter size-full"><img decoding="async" loading="lazy" width="500" height="322" src="/wp-content/uploads/2024/01/Equipment-of-JINGUYUAN-substation-in-China.webp" alt="" class="wp-image-1075"/></figure>

<h2>Conclusion</h2>

<p>It should be noted that digitalization should not be the final goal, because it is a continuous process of improving both software and hardware components.</p>

<p>Widespread implementation of digital power stations will also make it possible to solve problems of identifying various patterns of electricity consumption and generation using Big Data systems.&nbsp;Ultimately, this will reduce the costs of generating and transmitting electricity, as well as increase the reliability of power supply.</p>
