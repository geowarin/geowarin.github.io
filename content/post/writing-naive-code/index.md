---
title: "Writing naive code"
date: 2022-11-17T12:56:42+01:00
tags: []
summary: Is writing naive code the best way to write code?
cover:
    image: images/cover.png
    relative: true
    linkFullImages: true
---

I stumbled on this article on reddit:

[No architecture is better than bad architecture - r/programming](https://libreddit.spike.codes/r/programming/comments/ywwxrd/no_architecture_is_better_than_bad_architecture/)

The article explains three things:
- No abstraction is better than the wrong abstraction, which I tend to agree with
- No design is faster than good design, which is more controversial
- Write naive code first and then identify patterns to base your architecture of off.

The last idea is not novel, but I personally agree with it for multiple reasons:

- Naive code is easier to write: it prevents the writer's block when you begin working on a new feature
- Naive code is easier to understand: anyone, you or your teammates can understand and refactor it when needed


The most interesting thing about this article, though, is the broader topic it refers to: is naive code good code?

Reflecting on this topic is at the heart of the profession, but I've personally been thinking a lot about this lately.

Having to work with a couple of juniors, I have to explain why a particular piece of code is better than another
and this is no easy task.

Like wine tasting, code tasting is something that seems to be acquired mostly through experience.

---

Other users of reddit had interesting references as well.

[u/loup-vaillant](https://libreddit.spike.codes/user/loup-vaillant) writes:

> That reminds me of Ousterhout's [Philosophy of Software Design](https://www.youtube.com/watch?v=bmSAYlu0NcY), and Casey Muratori's [semantic compression](https://caseymuratori.com/blog_0015).

The first link is [a talk by John Ousterhout](https://www.youtube.com/watch?v=bmSAYlu0NcY), Professor a Standford.

He states that the most important thing in all computer science is "problem decomposition": 
how do you chop a complicated problem into pieces that you can build independently. 

His approach is to teach students the principles of software design, a topic that is unfortunately not taught enough because
it requires teachers with a sizeable coding experience in the industry as opposed to mostly academic research and papers.

[His book](https://www.goodreads.com/en/book/show/39996759-a-philosophy-of-software-design) sounds like an interesting read
and certainly one I would like to discuss with my teammates.

I also liked what he said about talent being overrated and that "10x programmers" are hard workers and not just "gifted".

Ousterhout also makes the distinction between "tactical" and "strategic" programming.
He coined a name for programmers who write 80% correct code very fast: "tactical tornadoes".
The kind of developers that managers like because they deliver faster, but that their teammates hate
because they have to clean up their mess afterwards.


The second link on [semantic compression](https://caseymuratori.com/blog_0015) makes the same conclusion that writing good
code is a matter of experience and that it's hard to convey.

> I suspect this has something to do with the fact that good programming seems very straightforward once you know
> how to do it, unlike, say, a fancy math technique that retains its sexiness and makes you want to spend the time to post about it.
> So, although I don’t have any data to back this up, I strongly suspect that experienced programmers rarely spend time
> posting about how they program because they just don’t think it’s anything special.

The article also dunks on upfront "OOP design" (UML and co) as a non-productive way of thinking about code, which I enjoyed.

Most importantly, it takes a real world example of a "semantic compression", a refactoring where
transforming a naive, repeated, pattern leads to better code.

---

[u/eternaloctober](https://libreddit.spike.codes/user/eternaloctober) writes:

> I always think of this silly list from "Why bad scientific code beats code following "best practices"" [https://yosefk.com/blog/why-bad-scientific-code-beats-code-following-best-practices.html](https://yosefk.com/blog/why-bad-scientific-code-beats-code-following-best-practices.html)

This article explains that the code written by scientists is often more enjoyable to work with than code written
by "professional" programmers because it doesn't try to be too clever for its own good.

---

[u/shevy-java](https://libreddit.spike.codes/user/shevy-java) writes:

> It's a bit like the Worse is Better article.
>
> [https://dreamsongs.com/WorseIsBetter.html](https://dreamsongs.com/WorseIsBetter.html)
>
> It reminded me a bit of this story:
>
> [https://www.folklore.org/StoryView.py?story=Make\_a\_Mess,\_Clean\_it\_Up!.txt](https://www.folklore.org/StoryView.py?story=Make_a_Mess,_Clean_it_Up!.txt)
>
> I highly recommend people to read it, from the pre 1983 era. IMO this is also an example why "Worse is Better" is, oddly enough, actually better than the perceived "perfection" being better. It has to do with non-linear thinking.

I really like that Richard Gabriel, the author of "worse is better", a cheeky argument that worse code leads to better results,
still has conflicted thoughts about the very proposition he coined 20 years after the fact.

Is worse really better? Should you write naive code on purpose? Should you dumb yourself down to write the most basic
code every time?

It certainly reminded me of "Kernighan's Law":

> Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly
> as possible, you are, by definition, not smart enough to debug it.

Like everything in engineering, writing naive code seems to a balancing act between too dumb and too smart, which
would certainly explain why finding the right cursor is so hard.

---

Note:

Ousterhout talks about [David Parnas' publication](https://www.researchgate.net/profile/David-Parnas/publication/200085877_On_the_Criteria_To_Be_Used_in_Decomposing_Systems_into_Modules/links/55956a7408ae99aa62c72622/On-the-Criteria-To-Be-Used-in-Decomposing-Systems-into-Modules.pdf)
as very influential.
