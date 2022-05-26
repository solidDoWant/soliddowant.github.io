---
title: "Modding in C# Part 2: Background Research"
tags:
 - Modding in C#
 - Modding
---

For the remainder of this series I will demonstrate how to build a modding system for .NET games. In this article I pick a specific game to build this support for, and I will cover initial research that needed to accomplish this. I'll also go over some of the tools used throughout the project. While this series will target a specific application utilizing a specific engine and specific language, most of the topics and techniques covered should be generally applicable to any program. 

The game I'll be targeting for this demonstration will be "[Untitled Goose Game](https://goose.game/)", specifically the Steam release for PC. To start off, there are several questions I need to answer before diving in and writing any code:
<!-- no toc -->
- [Do the legal agreement(s) between you and the publisher/developer support decompilation/reverse engineering and modification of the game?](#do-the-legal-agreements-between-you-and-the-publisherdeveloper-support-decompilationreverse-engineering-and-modification-of-the-game)
- [Does a modding community for the game already exist? If so, what tools are there?](#does-a-modding-community-for-the-game-already-exist-if-so-what-tools-are-there)
- [Is the game's code AOT compiled, JIT compiled, or interpreted?](#is-the-games-code-aot-compiled-jit-compiled-or-interpreted)
- [What language(s) are compatible with the game?](#what-languages-are-compatible-with-the-game)
- [What runtime and runtime versions does the game support?](#what-runtime-and-runtime-versions-does-the-game-support)
- [What engine and version is the game built for?](#what-engine-and-version-is-the-game-built-for)
- [Where is the game's code and what tools exist for reverse engineering it?](#where-is-the-games-code-and-what-tools-exist-for-reverse-engineering-it)

## Do the legal agreement(s) between you and the publisher/developer support decompilation/reverse engineering and modification of the game?
TODO

## Does a modding community for the game already exist? If so, what tools are there?
An established modding community can often provide tools and information that makes it easier to complete your goals. Additionally, while it may be a good learning experience, reinventing the wheel by making new tools for the sake of making new tools fragments the community.

Let's do a quick Google search to see what (if any) mods exist for Untitled Goose Game:
![Google search fo mods](/assets/images/2022-02-25-modding-in-c_sharp-2/research-1.png)

The first link is to Nexus Mods, a popular site for distributing mods. Let's see what's available:
![Nexus Mods](/assets/images/2022-02-25-modding-in-c_sharp-2/research-2.png)

Lets take a look at the first mod, [Psychedelic Goose](https://www.nexusmods.com/untitledgoosegame/mods/1). This mod changes the color of your goose every time you honk. Nexus Mods has a nice feature where developers can list dependencies, and end users can see both the software's dependencies, as well as it's dependents.

![Psychedelic Goose requirements](/assets/images/2022-02-25-modding-in-c_sharp-2/research-3.png)

There are two requirements: [BepInEx](https://github.com/BepInEx/BepInEx) and [Vortex](https://www.nexusmods.com/site/mods/1). Vortex is a Nexus Mod's "mod manager", a program that can download and install mods for end users. It's not of much use to mod makers. BepInEx is a mod loader and framework for Unity and XNA Framework games. I'll cover BepInEx in more detail in the next article in this series. Normally you'd probably want to use this tool for making mods, but seeing how the intent of this series is to cover how to build a tool like BepInEx, I'll ignore it.

To answer the original question, it looks like there isn't much of a pre-existing modding community for this game. I was able to find three mods in total, and they all had similar dependencies which are not relevant to our use case.

## Is the game's code AOT compiled, JIT compiled, or interpreted?
This is important in determining how much effort our project will take. While not impossible, AOT compiled code can take _significantly_ longer to reverse engineer than JIT compiled or interpreted code.

Let's start off by installing the game and locating it's files. I've purchased it on Steam so I'll go through their platform. After it's installed, you can right click on the game and click "Browse local files" to see where it installed to.

![Steam](/assets/images/2022-02-25-modding-in-c_sharp-2/research-4.png)

![Local files](/assets/images/2022-02-25-modding-in-c_sharp-2/research-5.png)

There are several files in this folder that mention Unity which by itself provides a lot of information. However, we're going to ignore that to demonstrate how you would answer the question without knowing anything about Unity. There's a nice, aptly named `file` utility for Linux that can tell us a lot about a file. I'll use it now to examine the files in the game's root folder. You can (very) easily run Linux on Windows 10 or newer by installing the Windows Subsystem for Linux by running `wsl --install`, and then `wsl` to start a Bash console. Running `find . -maxdepth 1 -exec file {} \;` produces the following output:

![File info](/assets/images/2022-02-25-modding-in-c_sharp-2/research-6.png)

The directories and text files don't give us much information. The DLLs and executables are show to be compiled to machine code, however. Not a great sign for us. That being said, they look much too small to contain the entire game's code (shown via `ls -lah`).

![File sizes](/assets/images/2022-02-25-modding-in-c_sharp-2/research-7.png)

Lets dig into some of the folders and check on the files inside. The `./Untitled_Data/Managed` folder has 160 files in it, mostly DLLs.

![./Untitled_Data/Managed folder](/assets/images/2022-02-25-modding-in-c_sharp-2/research-8.png)

The DLLs are all .NET assemblies, as shown by `find . -name "*.dll" -exec file {} \;`:

![.NET assemblies](/assets/images/2022-02-25-modding-in-c_sharp-2/research-9.png)

This is great. .NET assemblies are JIT compiled, and are trivial to decompile back into source code, making the game easier to reverse engineer.

To answer the original question, the game's launcher (`Untitled.exe` in the game's root folder) is AOT compiled, but the bulk of the game's code is JIT compiled.

## What language(s) are compatible with the game?
This should be easier to answer than the prior questions due to our previous legwork. The launcher is compiled to x86-64 machine code, meaning that any language that compiles or assembles to x86-64 machine code (x86-64 assembly, C, C++, Go, Rust, etc.) can be injected into the exe. Similarly, as the bulk of the game's code is composed of .NET assemblies, any language that can compile to [Common Intermediate Language (CIL)](https://en.wikipedia.org/wiki/Common_Intermediate_Language) can be injected into the DLL. This includes C#, F#, Visual Basic, and [others as outlined here](https://microsoft.fandom.com/wiki/Microsoft_.NET_Languages).

## What runtime and runtime versions does the game support?
Finding compatible languages is only half the picture. The other half is determining what versions are supported, and what runtime versions are supported.

To do this I'm going to use [dnSpy](https://github.com/dnSpy/dnSpy/releases), a tool fo viewing information about and decompiling .NET assemblies. The tool is no longer maintained and has a few issues, but it also has a few features that other don't (more on this later).

I've installed the tool and loaded the `Assembly-CSharp.dll` file from `.\Untitled_Data\Managed`. Looking under `Assembly-CSharp (0.0.0.0) > Assembly-CSharp.dll > PE > Storage Signature`, you can see that "VersionString" is set to a value of `"v4.0.30319\0\0"`.

![Assembly-CSharp version string](/assets/images/2022-02-25-modding-in-c_sharp-2/research-10.png)

This version is the .NET CLR version required to load and run the code in the assembly (technically in the `Assembly-CSharp.dll` module specifically).

I couldn't find documentation on what .NET Framework version requires what .NET CLR version anywhere so I did some testing. Other versions may be supported, but I was able to confirm that the assemblies built targeting a .NET Framework version below 4.0 can run on CLR version v2.0.50727. Assemblies targeting .NET Framework 4.0 - 4.8 can run on CLR version v4.0.30319.

Based on the above research, I can conclude that the game supports CLR version v4.0.30319, which corresponds to .NET Framework versions 4.0 - 4.8.

## What engine and version is the game built for?
The files in the game's root folder and the game's file structure is pretty indicative of the engine it's using. `UnityCrashHandler64.exe` is a dead giveaway that the game utilizes [Unity](https://unity.com/) for it's engine. Unity is a very popular game engine that is used to create games of all types for most platforms. In my experience, Unity games are structured as follows:

```
<Game root>
├── MonoBleedingEdge (newer versions of Unity only)
│   └── <Miscellaneous Mono folders>
├── <Game name>_Data
│   ├── Managed
│   │   ├── Assembly-CSharp.dll (the bulk of the game logic code is here)
│   │   ├── Assembly-CSharp-firstpass.dll (game code from third party assets and plugins that the developers used)
│   │   └── <Other DLLs> (these are assemblies referenced by the above two DLLs)
│   ├── Mono (older versions of Unity only)
│   ├── Plugins
│   │   └── <DLLs> (these are assemblies from third party plugins that the developers used)
│   ├── Resources
│   │   ├── unity default resources ("Standard" Unity assets such as shaders)
│   │   └── unity_default_extra (I haven no idea what this is) 
│   ├── StreamingAssets (optional, see https://docs.unity3d.com/Manual/StreamingAssets.html)
│   │   └── <Miscellaneous game-specific asset files>
│   └── <Resource and asset bundles, ending in *.assets or .assets.resS>
├── <Version specific DLLs and EXEs>
└── <Game name>.exe (this is Unity version, specific, but NOT game specific. More on this in future articles)
```

In addition to the files above, newer versions of Unity may store data in `%USERPROFILE%\LocalLow\<developer name>\<game name>`.

![LocalLow data](/assets/images/2022-02-25-modding-in-c_sharp-2/research-11.png)

Lastly, most Unity games log to a file called `output_log.txt`. Newer versions of Unity place this file in the LocalLow path, while older versions place this file under `<Game root>\<Game name>_Data`. If you can't find this file, make sure that you've opened the game at least once after installing it and check again. This file contains lots of useful information about the game, and can be written to for debugging purposes after we get to the point where we can inject code into the game.

![The output_log.txt file](/assets/images/2022-02-25-modding-in-c_sharp-2/research-12.png)

As shown in the first line of the file, the game uses Unity engine version 2018.4.1f1.

## Where is the game's code and what tools exist for reverse engineering it?
In Unity games, the bulk of the game logic is usually stored in the `Assembly-CSharp.dll` file described in the previous section. For other games you may wish to use the Linux `strings` utility on executables and libraries you found in the previous step to figure out which files have game code in them. For example, if you knew a game had a feature or function with a specific "keyword" in it, you could run `find . -name "*.dll" -exec strings {} \; | grep "keyword"` to find files that may contain relevant code.

As shown previously, the game is written in a language that compiles to CIL. The game could have been written in any language that supports this, but in this case the specific language doesn't matter. All languages that can compile to CIL should be interoperable with each other. However, we'll be using C# as it is the most common compiled-to-CIL language, and has the largest ecosystem built around it.

There are several tools available for reverse engineering, disassembling, and decompiling .NET Assemblies:

### ILDASM
[ILDASM](https://docs.microsoft.com/en-us/previous-versions/dotnet/netframework-2.0/f7dy01k1(v=vs.80)?redirectedfrom=MSDN) is a program that comes installed with Visual Studio that can be used to disassemble an entire assembly human-readable CIL/MSIL instructions. It's not very user friendly, but it usually works pretty well.

### ILSpy
[ILSpy](https://github.com/icsharpcode/ILSpy) is an open source .NET assembly decompiler and browser. It has the following features:
* Assembly browsing
* Assembly decompiling to C#
* Visual Studio project creation from decompiled assembly
* PDB generation
* [Plugin support](https://github.com/icsharpcode/ILSpy/wiki/Plugins)

### .NET Reflector
Personally, I don't think [.NET Reflector](https://github.com/icsharpcode/ILSpy/wiki/Plugins) is very good. It's UI is a bit dated and clunky, it doesn't have feature parity with the alternatives listed here, and it costs $115/user. Only mentioning this one for completeness' sake.

### dnSpy
[dnSpy](https://github.com/dnSpy/dnSpy) is a fantastic tool built on top of the ILSpy decompiler engine. Unfortunately it's no longer maintained, but it provides more features than any of the other options on here. It does have a few quirks though. It can do everything ILSpy can do, plus:
* Full debugging of .NET Framework and Unity game assemblies ([some changes required for Unity games](https://github.com/dnSpy/dnSpy/wiki/Debugging-Unity-Games))
* Editing assemblies in-place, both via C# code and CIL

### dotPeek
[dotPeek](https://www.jetbrains.com/decompiler/) is my personal favorite. While it doesn't have dnSpy's debugger, it's got some nice quality of life features that dnSpy doesn't have. It has feature parity with ILSpy. Additionally, while it is closed source, it's free.

## Wrap up
To finish out this article I wanted to cover one last thing: why I chose Untitled Goose Game. Untitled Goose Game is a popular indie game written in C# for a modern version of Unity with little to no existing modding community. Scanning through it's code base shows that the developers have done a fairly good job writing good, clean code, which should make it easier to develop for. Lastly, I haven't written mods for Untitled Goose Game before and I wanted to ensure I documented every step, making sure I didn't skip any that I may have prior knowledge about due to previous work with a game.

The next post in this series will outline mod loaders - what they are and how they work.