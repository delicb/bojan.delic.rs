---
title: "Preparing for the Interview"
date: 2026-02-15
description:
  "How I approached interview preparation after a layoff, from deciding what I wanted to brushing up
  on system design and learning TypeScript."
tags: ["career", "interviews"]
draft: true
---

I got laid off recently. The product line was shut down, which is one of those things that just
happens. The silver lining was a transition period of a couple of months to keep the lights on and
handle knowledge transfer. That bought me time to job search without the pressure of an empty bank
account ticking down.

## Figuring Out What I Wanted

Before opening any job board, I sat down and decided what I was actually looking for. Over the years
I've held both technical and managerial positions (the full history is on my [resume](/resume/)).
This time I wanted to go back to a purely technical IC role. Partially because that's the kind of
work I enjoy the most, but also because I believe the most effective engineering leaders keep their
hands in the code and have a deep understanding of the problems being solved. So, I was looking for
Principal/Staff Engineer roles, or even Senior Engineer, since titles often do not reflect actual
work being done.

I've been fully remote since Covid and had no intention of changing that. Since I was already
location-independent, looking at international remote positions was the obvious move.

Beyond that, I had a short list of criteria: strong engineering culture, a product company rather
than an outsourcing shop, systems operating at meaningful scale, healthy finances, and no situation
where a single large customer dictates the roadmap. That last one is easy to underestimate until
you've lived it.

## Brushing Up

I hadn't interviewed in a long time. Some of the companies I found interesting used TypeScript,
which I'd never worked with. My background is Python and Go, so this was new territory. I picked up
TypeScript by building a small hobby project, leaning on the official docs and AI to accelerate the
learning curve. Both of those deserve their own posts. Picking up a new language is the easy part.
The time-consuming bit is figuring out the ecosystem and best practices.

## LeetCode? No Thanks

I made a deliberate choice to skip LeetCode preparation entirely.

These kinds of interviews feel obsolete to me. They're a skill you practice, much like cramming for
a math exam in college. You get good at the format, not necessarily at the job. The day-to-day
utility of inverting a binary tree on a whiteboard was already questionable before LLMs, and it's
even harder to justify now.

More importantly, I wanted to work somewhere that shares this view and reflects it in their
interview process. If a company's primary signal for engineering ability is algorithmic puzzles, we
probably disagree on enough other things that it wouldn't be a great fit anyway.

I'm fine with live coding as a sanity check, making sure a candidate can actually write code and
reason about a problem in real time. That's different from expecting someone to produce an optimal
dynamic programming solution in 20 minutes.

## System Design

System design was where I needed the most structured preparation. I'd never had a formal system
design interview before. Working on production systems for over a decade teaches you a lot of what's
relevant, but knowing the material and presenting it well within an hour-long interview are
different skills.

I needed to practice the format: how to scope a problem, what to focus on first, how to navigate
trade-offs out loud. I also wanted to run through common problem types, because coming up with a
solid solution under time pressure is harder when you've never thought about the problem before.
Take something like designing a timeline feed, the problem Twitter made famous. I'm confident I'd
get there eventually, but "eventually" doesn't fit in a 45-minute slot. Seeing the problem space
beforehand means you spend the interview demonstrating judgment instead of fumbling toward a first
draft.

I also had specific gaps I wanted to fill. Real-time systems, for instance. I understood the
principles but hadn't worked with the concrete technologies. I looked at some free resources but
ultimately paid for a [HelloInterview](https://www.hellointerview.com/) subscription, which turned
out to be worth it for the structure alone.

In total, I spent about two weeks preparing. Not full-time. A couple of hours a day. A friend and I
ran mock system design sessions using [Excalidraw](https://excalidraw.com/), which ended up being
the same tool I used in the actual interviews.

Beyond interview prep, I genuinely learned patterns I hadn't encountered before. Time well invested.
The knowledge doesn't expire after the interview. It's there for whenever a real-world problem calls
for it.

## The Initial Calls

Every process started with one or more calls with a recruiter or hiring manager. A walk through my
experience, what the team looks like, why they're hiring, how they work. These weren't formalities.
They felt like real gates, and they were also where I learned the most about the company: team size,
financial health, level of maturity. Salary expectations usually came up here too. Some companies
asked for a number, some offered a range upfront. I appreciated the latter.

## Live Coding

This was the part I was most nervous about. Not because I can't code, but because I can't even type
properly when someone is watching over my shoulder. Two of the interviews had live coding in
TypeScript, a language I wasn't fluent in, which didn't help. That turned out to be less of a
problem than I expected. The interviewers were great about it and didn't fixate on syntax, helping
me out on small things that would have taken ten seconds to search.

All three live coding sessions were different, which was interesting in itself.

### The Take-Home with a Twist

I got the task upfront and was told to use whatever resources I wanted to prepare, AI explicitly
included. The problem was engaging and deceptively simple on the surface, with plenty of room to
expand into. I spent nearly a full day implementing, reimplementing, and refining my solution.

During the actual interview, the coding part lasted maybe ten minutes. I walked through my thinking,
which approaches I considered, which one I chose, and why. Partway through the code, they stopped
me: they could see I'd thought about it and could code, so we shifted to discussing potential
expansions. The interview turned into a verbal system design session. I liked this format the most.
It removed the usual edge by giving you time to think beforehand, it was genuinely fun, and I think
it gives interviewers a richer signal than watching someone sweat through syntax under a timer.

### The Two-Hour Work Simulation

The task was deliberately vague, a couple of lines describing a problem from the company's domain.
It was up to me to use any resource available (Google, AI, and the interviewers themselves) to fill
in the gaps, learn the terminology, and figure out what to build. I asked a lot of questions, and
they answered. The point was asking the right ones. Sometimes they'd steer me by asking questions
back, not always expecting an answer, but nudging me toward discovering something on my own.

The first fifteen minutes were intense. The problem was unfamiliar and someone was watching me
fumble through it. After that initial stretch, I settled in and actually enjoyed it. It felt like a
realistic preview of what the first weeks on the job would be like.

### The Straightforward Modeling Exercise

The simplest of the three, modeling a small system that was a subset of the company's actual
product. No AI, no Googling, TypeScript required. I knew enough to solve it, but didn't have every
generics syntax detail memorized. I explained what I was trying to do, and the interviewer helped
with the specifics. Since I'd been upfront about TypeScript not being my primary stack, this wasn't
held against me. The coding itself was more of a sanity check, because it was paired with a system
design interview the same day, and if both went well, the next step was a paid trial, which carried
the most weight in their process.

## Interviewing the Company

Throughout all of this, I was evaluating the companies as much as they were evaluating me. The
interview process itself was the clearest signal. What skills did they test for? Did the tasks
reflect actual work, or were they performative? How fast did they respond after each round? A
company that takes two weeks to schedule a follow-up is telling you something about how they
operate.

The type of coding challenge said a lot too. The ones that gave me room to ask questions, explore
the problem, and show judgment felt like places where engineers are trusted to think. The ones that
locked everything down and measured speed felt like places where output is measured in lines of
code.

## How It Landed

I ended up with three offers. The one I accepted was from the first company I applied to, and the
only one I had specifically targeted. The other two came through LinkedIn outreach and my
professional network.

Those weren't the only companies I pursued. A few others I'd specifically targeted never went
anywhere. Some rejected my CV outright, others weren't hiring in my timezone. Getting past that
initial barrier is harder than it sounds. Having a referral from someone inside the company makes a
real difference at that stage, often the difference between a silent rejection and an actual
screening call. After that first conversation, though, it stops mattering. You're on your own.

Looking back, the preparation mattered more than I expected, but not just for the reasons I assumed
going in. The system design practice filled real gaps in my knowledge. The live coding sessions
turned out to be the most enjoyable interviews I've ever had. And going through different interview
formats gave me a surprisingly clear signal about which companies I'd actually want to work at. The
ones with thoughtful processes tended to be thoughtful about other things too.

The layoff forced a reset I wouldn't have chosen on my own, at least at that point in time. But
having that transition period, time to decide what I wanted, learn a new language, practice system
design without rushing, meant I could be genuinely selective instead of just grateful for the first
yes. I knew what I was looking for before I started.
