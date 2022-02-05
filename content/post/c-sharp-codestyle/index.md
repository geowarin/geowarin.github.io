---
title: "C# code style"
url: "c-sharp-code-style"
date: 2022-02-05T02:12:39+01:00
tags: []
summary: Use editor config files to enforce your code style automatically!
cover:
    image: images/cover.png
    relative: true
    linkFullImages: true
---

I've begun coding in C# both as a gamedev hobbyist and at my new job.

I have a java and javascript background, where we have tools to ensure a
consistent code style between projects, like [prettier](https://prettier.io/).

I was a bit surprised that most C# project do not seem to adhere to common, explicitly stated rules or,
at least, did not seem to enforce any via tooling.

Rider, my favorite editor, does not have a clear-cut convention to apply on all projects.
Instead, it tries to automatically detect the current project's code style and adhere to it,
which does not help.

## Existing code styles

### Microsoft

Microsoft has [some guidelines](https://docs.microsoft.com/en-us/dotnet/standard/design-guidelines/naming-guidelines),
but I found them a bit lacking. 

Roslyn has [a strict code style](https://github.com/dotnet/corefx/blob/master/Documentation/coding-guidelines/coding-style.md).
They are enforced via their [code formatter](https://github.com/dotnet/codeformatter).

They also have an [.editorconfig file](https://github.com/dotnet/roslyn/blob/main/.editorconfig).

#### Roslyn code style's summary:

- 4 spaces indentation
- `_camelCase` for private fields
- `readonly` where applicable
- use `var` only when usage is obvious
- `PascalCase` for constant 
- use braces for `if`/`else` blocks except when they all fit on a single line
- new lines before braces

These rules are common in most C# projects I've read.

### Google

Google has a [different code style](https://google.github.io/styleguide/csharp-style.html), which
tries to remove ambiguities from the official Microsoft guidelines.

#### Google code style's summary:

- 2 spaces indentation
- `_camelCase` for every "privatish" field (`private`, `internal`, etc.)
- `PascalCase` for everything `public`
- `I` prefix for interfaces
- use `var` only when usage is obvious
- Always use braces, even when optional
- **NO** new lines before braces

My personal preferences goes to google's because I like braces for clarity.

As a java and javascript developer, new lines before braces trigger me a little 😀.

And, perhaps more importantly, naming rules for `public` vs `private` stuff are not ambiguous
and simple to follow.

## Tooling via editor config

Both Visual Studio and Rider support coding style via editorconfig:

 - [Rider](https://www.jetbrains.com/help/rider/2021.3/Using_EditorConfig.html)
 - [Visual Studio](https://docs.microsoft.com/en-us/visualstudio/ide/code-styles-and-code-cleanup?view=vs-2022)

I stumbled upon a great [medium article](https://jonjam.medium.com/c-code-style-using-editorconfig-9d38de65527d) by Jonathan Harrison
that gave me a simple base to work on.

In summary, it allows you to define styles:

```config
dotnet_naming_style.pascal_case_style.capitalization = pascal_case
                    
dotnet_naming_style.lower_camel_case_style.required_prefix = _
dotnet_naming_style.lower_camel_case_style.capitalization = camel_case
```

You can then use those styles in rules that have this form `<kind>.<name>.<prop>` where the
name is defined by you:

```config
# Names of private, protected, internal and protected internal fields and properties: _camelCase
dotnet_naming_rule.private_rule.severity = warning
dotnet_naming_rule.private_rule.symbols = private_fields
dotnet_naming_rule.private_rule.style = lower_camel_case_style
dotnet_naming_symbols.private_fields.applicable_kinds = field
dotnet_naming_symbols.private_fields.applicable_accessibilities = private, protected, internal, protected_internal, private_protected

# Use PascalCase for public fields
dotnet_naming_rule.pascal_case_for_public_fields.severity = warning
dotnet_naming_rule.pascal_case_for_public_fields.symbols = public_fields
dotnet_naming_rule.pascal_case_for_public_fields.style = pascal_case_style
dotnet_naming_symbols.public_fields.applicable_kinds = field
dotnet_naming_symbols.public_fields.applicable_accessibilities = public
```

See [the documentation](https://docs.microsoft.com/en-us/dotnet/fundamentals/code-analysis/style-rules/language-rules#net-style-rules).


I created my personal editorconfig, trying to enforce google rules:

https://gist.github.com/geowarin/03a8133c10bc4f103dda3167f7502feb

It's probably not 100% correct, but I'll try to update it as I go.

## Conclusion

Tooling is crucial to have a homogenous code style in your projects.

I know that most C# devs will be horrified by my personal code style but this is
irrelevant. What's important is to have a code style and be consistent.

I now have an `.editorconfig` file that I can drop in my projects. It is applied automatically
when I format my code.

This is enough for my side projects, but there are other tools that might be interesting
to look at in the future:

- [dotnet format](https://github.com/dotnet/format)
- [CSharpier](https://github.com/belav/csharpier) 

There also seems to be [a way](https://docs.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props#enforcecodestyleinbuild) 
to enforce code style in the dotnet build.

C# aficionados, I'm curious to hear your thoughts! Do you have a code style in your projects?
Do you have tools to enforce them?
