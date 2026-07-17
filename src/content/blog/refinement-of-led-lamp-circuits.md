---
title: "Refinement Of LED Lamp Circuits"
slug: "refinement-of-led-lamp-circuits"
description: "We will talk about modern LED light bulbs, which have now become more affordable. The ideas for improving LED lamps outlined in the article will be…"
descriptionGenerated: true
publishDate: "2024-01-22T09:23:30Z"
modifiedDate: "2026-01-08T09:06:56Z"
author: "Steven"
categories: ["led"]
tags: []
primaryCategory: "led"
featuredImage: "/wp-content/uploads/2024/01/Refinement-Of-LED-Lamp-Circuits.webp"
featuredImageAlt: "Refinement Of LED Lamp Circuits"
featuredImageWidth: 815
featuredImageHeight: 543
ogImage: "/wp-content/uploads/2024/01/Refinement-Of-LED-Lamp-Circuits.webp"
draft: false
format: "html"
sourceWordPressId: 1089
---

<p>We will talk about modern LED light bulbs, which have now become more affordable. The ideas for improving LED lamps outlined in the article will be useful to avid DIYers. First, let's look at the design and later modifications.</p>

<p>The modern design of lamps resulted from the evolution of designers' attempts to make the light bulb accessible and as efficient as possible, and now this design is the most common.</p>

<h2>Comparison of principles for constructing LED lamp circuits</h2>

<p>The most common type is a non-isolated driver; its circuit is made using a pulsed-down converter.</p>

<p>The use of such a driver in an LED light bulb has several advantages compared to other circuits:</p>

<p>good stability of the output current over a wide range of supply voltage, complete absence of ripple, compared to a circuit with a capacitor ballast.</p>

<p>higher efficiency compared to isolated and linear drivers.&nbsp;The output voltage of such a driver is much higher than that of isolated drivers.&nbsp;To obtain a given power, LEDs with several crystals in one housing are used, which allows you to increase the voltage and reduce the current in the circuit, the efficiency is increased by reducing losses in the power circuit.</p>

<p>smaller size and cost compared to an isolated driver, since the inductor is smaller than a transformer for the same power. Due to the peculiarity of the circuit, the inductor does not need to digest all the power, unlike a transformer in an isolated driver, less material is needed for its manufacture.</p>

<h2>Disassembling an LED light bulb</h2>

<p>The lamp body is made of composite material, which serves as a heat sink for the LEDs. It is quite easy to disassemble light bulbs from different manufacturers. The diffuser is held around the perimeter by latches and silicone. We pry it with a knife and cut the sealant in a circle, the diffuser cap is removed with some effort.</p>

<p>The board with diodes can be pressed or screwed, the contacts can be soldered or removable. With a screwed board everything is simple, but with a pressed one you will have to tinker. I usually manage to pry out the board with a flat-head screwdriver, but every time, with different manufacturers, this is not always possible without damaging the case at all; sometimes a piece of plastic breaks off, which can then be glued back if necessary.</p>

<h2>Let's see how an LED light bulb works</h2>

<p>Now you can look at all the details of the lamp and what it is made of.&nbsp;Lamp developers have incorporated certain characteristics into the design of the lamp, namely the current through the LEDs, which is determined by several requirements, such as temperature conditions, brightness and power consumption, lamp life and the ratio of price and all these characteristics.</p>

<p>We will not consider the theory of a global conspiracy of manufacturers, according to which manufacturers are interested in making unreliable things, my opinion is that this is a myth, everything is dictated by marketing and consumers, and manufacturers do what is ordered from them, what sells well, which means they are always looking for a middle ground between reliability and price. In our realities, usually cheaper goods win in sales, in the end we have what we have.</p>

<p>During operation, after turning on the light bulb, the LED crystals are heated and thermal expansion occurs. The conductive leads from the crystals are made in the form of thin threads of gold, since gold is a very ductile metal and tolerates deformation well without breaking. The expansion coefficient of the crystals and other materials of the LED construction is not the same; over time, from turning the light bulb on and off, thermal deformation destroys the terminal of the LED crystal or its mounting location, the circuit breaks and the lamp fails.</p>

<h2>Refinement of the lamp to increase service life</h2>

<p>The first modification is to reduce the current through the LEDs, which can significantly extend the life of the lamp, while the brightness of the glow inevitably decreases.&nbsp;The decrease in brightness when reducing the current through the LEDs does not occur linearly, with some lag, so that by reducing the current an additional increase in the efficiency of the LED is achieved, which in turn further reduces the temperature of the crystals, with this modification we kill two birds with one stone.</p>

<p>To illustrate the efficiency of the LED and losses in the form of heat, a graph of the dependence of the current through the LED and the brightness of the glow is given, which shows a nonlinear dependence.</p>

<h2>LED night light with low brightness</h2>

<p>The third modification is to add an additional function - a night light. I have such a lamp installed in a dark corridor and it is convenient; at night there is enough light to pass through.</p>

<p>The circuit works like this: A voltage divider is formed, one of the divider resistors is in the switch, and the second is in the lamp.&nbsp;Power comes to the lamp but with a lower voltage thanks to the divider.&nbsp;To start the driver, the voltage is not enough, the current flows through the circuit through the divider resistors and LEDs, the lamp glows with low brightness, which will depend on the resistance of the resistors.</p>

<p>In some drivers (not all, it’s worth trying at the beginning without a trimmer), you will have to place a 100 kOhm trimmer resistor in parallel with the ceramic capacitor of the chip’s power supply filter to adjust the supply voltage and avoid the effect of the lamp blinking in night light mode when the driver chip tries to start.</p>

<h2>Smooth increase in brightness when turned on</h2>

<p>The second modification allows you to turn on the lamp smoothly, for example, for use in the bedroom.</p>

<p>To do this, you need to connect a posistor (positive temperature thermistor, or PTC thermistor) in parallel with all or most of the LEDs.</p>

<p>The circuit works simply: While the posistor is cold, its resistance is minimal and current flows through part of the LEDs and the posistor and gradually warm it up. As it warms up, the resistance gradually increases and smoothly turns on the remaining LEDs in the circuit - the brightness gradually increases.</p>
