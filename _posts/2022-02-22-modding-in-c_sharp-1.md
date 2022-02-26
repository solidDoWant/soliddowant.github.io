---
title: "Modding in C# Part 1: Modding Basics"
tags:
 - Modding in C#
 - Modding
---

In this series I am going to cover (nearly) everything I know regarding writing mods for .NET games. I've written and contributed to several mods over the years for different games, including [Minecraft](https://www.minecraft.net/en-us/store/minecraft-java-edition), [Planetbase](https://store.steampowered.com/app/403190/Planetbase/), [Bloons Tower Defense 6](https://store.steampowered.com/app/960090/Bloons_TD_6/), and [Spiritfarer](https://store.steampowered.com/app/972660/Spiritfarer_Farewell_Edition/). This series will primarily focus on buildings mods and modding support from scratch for [Unity](https://unity.com/)-based video games. This post will detail broad topics regarding modding applicable to all software.

## What is modding?
In regards to software, "modding" is the act of changing a piece of software (usually closed source) to change it's behavior. This can range from changing the color of text somewhere to replacing a core feature of the software.

This includes:
* Adding an extension to block ads in your browser
* Adding new maps and models to a video game
* Circumventing copyright protection and licensing requirements
* Fixing bugs and other issues

## As an end user, why should I care about modding?
In short, it allows you to have the features and bug fixes you want without depending on the software developer(s) who wrote the program. If you are a software developer, you make these changes by creating a mod. If you are not a software developer, you can achieve the same results by installing mods that mod makers (often termed "modders") create.

## As an end user, how can I create mods?
First and foremost, look for an existing modding community and existing mod support for the program of your choice. While adding modding support to an application is possible, it's not a trivial task for an end user. Try not to reinvent the wheel, and use existing tools if they suite your needs.

If you need to add mod support to a third party program you need to have an understanding of the below:
* How the program works and what it does
* How applications of the same "type" (SaaS, video game, desktop program, etc.) are structured and how they work
* How to write code in a language that is compatible with your targeted program
* How the [runtime](https://en.wikipedia.org/wiki/Runtime_system) of your chosen program and language works
* How modding "systems" work

Creating a new modding system for a program is analogous to a video game engine and a video game. While there is overlap, the first requires a solid understanding of what's happening behind the scenes (rendering, physics, I/O, etc.) rather than how to make content and implement mechanics (including models, textures, game logic, etc.). If you have an understanding of the background knowledge required, this series will walk through how to put that information together to build a new modding system.

## As a software developer, why should I care about modding?
Modding can be an excellent tool to increase user engagement and build a community. It allows end users to fix their own problems and build the features they want. This means that, as a developer, you can focus on other goals while essentially churning out new features and bug fixes by proxy. Ultimately, it increases your revenue. Here's how:

### It builds a community
It can be difficult to market your software and gather interest when starting out. The software market is huge and getting noticed by potential customers can be a difficult and costly endeavor. Building a community helps keep end users interested while expanding your MVP, and helps you gather feedback from the people using your product so that you can figure out what works and what doesn't. Modders naturally build a community around your software to share mods, and information on how to create them. 

### It increases end user engagement
Have you ever used a piece of software for an extended period of time, found a problematic bug or needed new feature, and eventually abandoned the software in favor of something better? Maybe it was a file format that a modeling tool couldn't export to, maybe it was lack of configurability in a report generator, or maybe it was a lack of content in a video game. By allowing for mods, end users can fix these problems themselves as they see fit. Even if you as a developer are planning on addressing these issues in your software down the road, this allows users to fix the problems right away, for free, allowing you to focus on higher priority tasks (more on this next).

### It helps you determine where you (or your team) should focus your effort
Mods can help you gauge demand and gather feedback for potential changes without directly engaging with end users. Take a hypothetical situation where you have the bandwidth to either rebuild your software's user interface, or add a new core feature. You can gather metrics from your software's modding community to help determine where you focus your effort. How many mods exist that are similar to this change? How many downloads do they have? What features do they have in common? What user feedback do they have? All of this information and more is available when you have an active modding community.

### It increases your revenue
The existence of mods enables end users to get the product that they want with minimal effort on your part. This greatly widens your product's target audience, and allows you to beat out the competition by reaching feature parity on the features your potential customers care about. At the extreme end this is analogous to a program and an operating system. A program is typically written to perform one primary task, such as a calculator or word processor. The earliest computers ran one program at a time. An operating system, on the other hand, may not have all the features of a specific program, but by proxy it has the feature set of all the software that an end user installs on it.

## As a software developer, what can I do to help enable modding?
There are several different ways you can enable or support some form of modding. Ultimately it comes down to how much effort you want to put into it. While there are many benefits, there is no such thing as a free lunch.

### Add first class support
Typically the best possible thing you can do is add first class support for the feature. This means implementing a mod loader of some form, and providing support for the feature. You don't need to support issues with specific mods, but you should support the mod loader and (ideally) be able to provide documentation, examples, and answer questions regarding how internal systems work. How exactly your mod loader is implemented is highly specific to what functionality you want to support, and what your program model is. For example, it may be fairly simple [in-program scripting](https://www.spaceengineerswiki.com/Programming_Guide) (using a language like LUA or JavaScript), [loading packages containing code and assets](https://developer.chrome.com/docs/extensions/mv3/getstarted/), or [loading pre-compiled code and executing whatever is in it](https://forum.kerbalspaceprogram.com/index.php?/topic/153765-getting-started-the-basics-of-writing-a-plug-in/). Some programs (typically games) are even built as a "base program" and a mod loader, and all the application-specific code and assets are loaded as a mod. [Skyrim](https://elderscrolls.bethesda.net/en/skyrim) and [Factorio](https://www.factorio.com/) are good examples of this.

### Keep a stable API
This one should be pretty obvious and straightforward. Changing the methods (in a non-backwards compatible way) that mods use will typically break or cause bugs in mods. There are several approaches to solving this problem. Ideally APIs can be versioned so that mods can target a specific version or set of versions. The mod loader can then check for mod compatibility and warn the user about incompatible mods. Failing API-specific versioning, the same can be applied to the program version. [Rimworld](https://rimworldgame.com/) implements this functionality well.

### Work with leaders in the modding community
As the modding community around your program grows, typically a few projects will surface that are significantly (directly or indirectly) more popular than the rest. These are often third-party mod loaders or libraries that large sections of the modding community depend on (see [XKCD 2347](https://xkcd.com/2347/)). Like many software projects, maintaining these mod projects can often be a arduous and thankless task. Over time breaking changes in your code base that affects these projects can cause modder attrition, leading to the maintainers of those mods to abandon their projects. This inevitably fragments your user base as end users will stay on a specific version. In turn, this will result in you getting bug reports for old and unsupported versions. Minecraft and by extension Minecraft's Forge mod loader is an example of breaking changes causing attrition and community fragmentation. See [this post written by a well-known mod maker](https://www.reddit.com/r/Minecraft/comments/2buks8/eli5_why_do_mods_break_after_an_update/cj950b2/) for details. Communicating planned changes that may cause community leaders headaches (instead of just springing the change on them) can go a long way to keeping people engaged in the community.

### Write clean and extensible code
By definition mods make changes to your software. Mod authors write code around your code base, adding features and changing things in ways you've likely never thought of, but they (typically) have little to no ability to directly change your code. When developing your code, put yourselves in mod maker's shoes and consider the following: you've started a new software engineering job and told to add a new feature to one of the company's products. You've given no instructions on how the product works (though you have probably used it before), and are told to add the feature _without modifying the existing code, less one hook to call your code_. Could you do it? The answer probably depends on what feature you're trying to add, how easy it is to figure understand the code base, and how extensible it is. How long it would take you to implement said feature is usually a function of how messy your code base is. This is the situation most mod makers are in. 

[This article series](https://medium.com/@benjishults/extensible-design-with-spring-8e7e392ea077) outlines a few ways you can make your code extensible. Something else more mod-making specific to consider is access modifiers. Most language with access modifiers allow for reading and writing `private` and `internal` properties via reflection, but said access is usually significantly (often 100x) slower than calling the properties directly. If you're unsure whether or not a mod maker would want to read or write a property, it's usually better to mark it as `protected` or `public` instead.

Lastly, writing clean code both makes it easier to extend, and easier to learn. If your functions are 200 lines long, mod authors may end up copy/pasting functionality when attempting to alter the flow control for that function. Additionally, breaking up those large functions, classes, and other programming structures makes it easier to figure out what code corresponds to what functionality. It's significantly easier to understand 15 functions that draw parts of a GUI than it is to understand one function that draws 15 parts of a GUI.

### Keep your dependencies updated
Aside from the usual reason (new features, bug fixes, security patches), keeping your dependencies up to date can be very helpful to mod makers. This applies not just to your "typical" software library dependencies that may come from a package manager like NPM or NuGet, but also the engine (in the case of video games) and runtime (in the case of JIT compiled or interpreted languages). With enough effort modders can _usually_ bump the version of typical dependencies, but bumping engine and runtime versions can be nigh impossible without the full program code and asset source. Keeping your dependencies up to date usually allows mod makers to use a broader range of third party libraries without running into unfixable compatibility issues. Older games utilizing Unity often have this issue. [Unity did not support .NET Framework 4 until Unity engine version 2018.1](https://docs.microsoft.com/en-us/visualstudio/gamedev/unity/unity-scripting-upgrade), leaving developers on .NET Framework 3.5 or 2.0 (not Core). As a result, it is much more difficult to integrate newer libraries into older games where their developer has not upgraded to a newer Unity and .NET version.

### Pick a language that can (easily) be decompiled
This is primarily for software developers who want to allow end users to develop mod support for their application rather than write it themselves. If your program uses an ahead of time (AOT) compiled (i.e. written in C, C++,  Rust, Go, etc.) then it can be difficult (though by no means impossible) for mod makers to figure out how your application works and in turn write mods for it. While there are other disadvantages (primarily execution speed for functionally equivalent code), JIT compiled and interpreted languages are much easier to reverse engineer than AOT compiled code. Picking a language such as C#, Java, JavaScript, or Python significantly lowers the barrier of entry for writing mods, and forming a community.

### Don't obfuscate your code
Given the previous section this one should be pretty clear. Obfuscation is usually implemented to prevent reverse engineering and add "security", which is orthogonal to modding as modding typical requires reverse engineering. Additionally, to quote NIST, ["System security should not depend on the secrecy of the implementation or its components."](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-123.pdf) In other words, security by obscurity, and therefore obfuscation, is no security at all.

### Don't be actively hostile towards modding
If there is one thing to take away from this article it's this: don't try and hamper modding efforts. There are obviously some exceptions to this, but don't:
* Write a license agreement that prohibits changes
* Pursue legal action against mod makers
* Change your code base with the intent to make it harder for mod makers to maintain their projects

Piracy and mods designed and distributed to remove licensing requirements are clear exceptions to this. .

## What's next?
The next post in this series will outline mod loaders - what they are and how they work.