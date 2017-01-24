---
categories: []
comments: false
date: 2017-01-24T14:05:36+01:00
draft: false
showcomments: false
showpagemeta: true
slug: ""
tags: []
title: ligno
---

Ligno is async structured logging library `GoLang`. 

Main idea behind ligno is that when application needs to log something, there
is no need to block that call until log message is sent to file or network. All
that needs to be done is to schedule message for handling and let the program
continue its normal execution.

Check out the [source](https://github.com/delicb/ligno).
