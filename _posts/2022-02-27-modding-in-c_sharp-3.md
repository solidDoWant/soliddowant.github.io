---
title: "Modding in C# Part 3: Mod Loaders and Patching"
tags:
 - Modding in C#
 - Modding
---

Now that we've figured out the basics of how [Untitled Goose Game](https://goose.game/) runs, we can start building a mod loader. We'll split this into two parts. The first is a "patcher" type application that will inject hooks into the game. The second is an assembly that is loaded by those hooks, which in turn loads other mods. In this post I'll cover building out the patcher application.

## Program execution flow
Mods are typically loaded by a "mod loader" (creative name, right?). Mod loaders will typically read a file containing mods, load the mods into the program space in some manner, and initialize them. They may also provide library functions for the mods, load required assets, and provide features to the end user such as mod configuration. Similar to hypervisors, Mod loaders typically fall into two types depending on whether the mod loader or targeted program executes first.

### Type 1 mod loaders
The end user launches a type 1 mod loader, which then launch the program. The mod loader will either read the program's code and edit it before launch, or it will inject code into the program's memory space directly after launching it. The changed code will typically in turn load mods into the program. Type 1 mod loaders are typically written by a third party (usually end users), rather than the developers who wrote the program.

#### Type 1 mod loader process
![Type 1 mod loader process](/assets/images/2022-02-27-modding-in-c_sharp-3/type_1_mod_loader.svg?sanitize=true)

### Type 2 mod loaders
Type 2 mod loaders differ from Type 1 in that the mod loading code is already a part of the program's code. Programs that support mod loading out of the box (i.e. browsers via plugins, office software suites via extensions) typically utilize a built-in Type 2 mod loader. This makes it simple for the end user as they don't have to do anything different from normal. They simply run the program and mods are (or can be) loaded without any user intervention. While third parties can create Type 2 mod loaders for a program, they typically require an additional "patcher" or installation program to inject the mod loader code into the targeted program.

#### Type 2 mod loader process
![Type 2 mod loader process](/assets/images/2022-02-27-modding-in-c_sharp-3/type_2_mod_loader.svg?sanitize=true)

## Existing Unity mod loader projects
We'll be building our own mod loader from scratch here in a moment, but there are several other projects that can do this. Here's a few you might want to look into:
* [BepInEx](https://github.com/BepInEx/BepInEx)
* [Unity Mod Manager](https://github.com/newman55/unity-mod-manager)
* [MonoMod](https://github.com/MonoMod/MonoMod)

## Building the mod loader
For this project I'll be building a Type 1 mod loader, separated into a patcher launch application and a library to contain the mod loading code.

To start out I'll setup and start Visual Studio. I'm using the community edition of 2022, but anything back to about 2015 should work. The following components need to be installed:
* .NET Framework 4.8 SDK
* .NET Framework 4.8 targeting pack
* C# and Visual Basic Roslyn compilers
* MSBuild
* Just-In-Time debugger
* .NET profiling tools
* C# and Visual Basic
* InteliCode (optional)
* .NET desktop development workload

If you have a license, [ReSharper](https://www.jetbrains.com/resharper/) is an excellent extension by the folks who make dotPeek that can help assist with development.

After launching Visual Studio I create a new `Windows Forms App (.NET Framework)` project. Because this will be the patcher launch application it doesn't really matter if I use .NET Framework, .NET Core, or .NET 5/6 for this part. I'm sticking with Framework just to keep things consistent. Same thing with Windows Forms App vs WPF - it's just a matter of preference.

![Project config](/assets/images/2022-02-27-modding-in-c_sharp-3/project-config-1.png)

Next, I'll name the project "Launcher" and the solution "UGG-Framework (short for Untitled Goose Game Framework), targeting .NET Framework 4.8. The location is left up to personal preference.

![Solution config](/assets/images/2022-02-27-modding-in-c_sharp-3/project-config-2.png)

Hitting "Create" will open up the new solution. The first thing we'll want to do is close the form designer tab that pops up, right click on the solution, and hit "New Project...".

![Solution config](/assets/images/2022-02-27-modding-in-c_sharp-3/project-config-3.png)

This new project will house our mod loader assembly. This time the project type that we choose is important. I'm going to select `Class Library (.NET Framework)` as this project type will compile to an assembly that is interoperable with the base game.

![Class library project config](/assets/images/2022-02-27-modding-in-c_sharp-3/project-config-4.png)

I'll name the project "UGG-Framework", and put it under the solution's folder. It is important to target a .NET Framework version compatible with the CLR version that we found in the [last post](/2022/02/25/modding-in-c_sharp-2#what-runtime-and-runtime-versions-does-the-game-support). In this case the latest version ().NET Framework 4.8) should work, so I'll choose that.

![Class library project config](/assets/images/2022-02-27-modding-in-c_sharp-3/project-config-5.png)

Hitting "Create" adds the new project.

The bulk of this post will be building the patcher to inject our code into the base game. However, to do that, we first need to create some code to inject. I'm going to delete the default file (`Class1.cs`) and add a new class called `ModLoader`. As the name would suggest, this file will hold most of our mod loader code. Inside I'll add a single static method, `public static void Load()`. The patcher will add a call to this method, which will then branch out and handle loading everything else.

Unity provides a simple way to log debug information to the `output_log.txt` file found in the [previous part](/2022/02/25/modding-in-c_sharp-2#what-engine-and-version-is-the-game-built-for). To use it we'll need to add a reference to Unity. For newer versions the `Debug` class is usually in the `UnityEngine.CoreModule.dll` assembly. Older versions may have it in `UnityEngine.dll`. I'll add a reference by right clicking on the project references and hitting "Add Reference...".

![Adding a reference](/assets/images/2022-02-27-modding-in-c_sharp-3/reference-1.png)

I hit the "Browse" button at the bottom. This opens up a file selection dialog where I can navigate to the `<game's root directory>\Untitled_Data\Managed`. From there I double click on `UnityEngine.CoreModule.dll` and hit "Ok", adding the reference to the project.

![The added reference](/assets/images/2022-02-27-modding-in-c_sharp-3/reference-2.png)

From there I add a single line to the `Load` function, resulting in the below class definition:

```
using UnityEngine;

namespace UGG_Framework
{
    public class ModLoader
    {
        public static void Load()
        {
            Debug.Log("Hello World");
        }
    }
}
```

Simple, right? One thing to note is that there is a `Debug` class in `System.Diagnostics`. Visual Studio sometimes likes to import that namespace instead of `UnityEngine`. If you're having trouble getting something to log, you might check your `using` statements.

There's one last step we'll take for the UGG-Framework project in this post. While not strictly necessary, it's a great quality of life feature. Right click on the project and select "Properties" at the bottom.

![Project properties](/assets/images/2022-02-27-modding-in-c_sharp-3/build-step-1.png)

From there I navigate to the "Build Events" section of the tab that pops up, and add the following line to the Post-build events, and hit `ctrl+s` to save:

`copy $(TargetDir)$(TargetFileName) "C:\Program Files (x86)\Steam\steamapps\common\Untitled Goose Game\Untitled_Data\Managed"`

![Adding copy build step](/assets/images/2022-02-27-modding-in-c_sharp-3/build-step-2.png)

This will copy the built assembly to the `Managed` folder on every build, making it available for the game's assembly resolver to load on startup. This can be verified by hitting `ctrl+shift+b` to build the project, then checking the `Managed` folder:

![Verifying the build output](/assets/images/2022-02-27-modding-in-c_sharp-3/build-step-3.png)

