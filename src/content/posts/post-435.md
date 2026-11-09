---
title: "使用开源项目搭建自用图床"
date: 2023-05-23T15:27:34.000Z
url: /posts/435.html
categories: ["服务器折腾那些事"]
tags: ["图床", "服务器"]
---

**1.前言**

图床就是用来存放图片的空间，同时允许外链到其他网站。由于写博客的需求，我们需要将图片置于服务器中才能正常显示，但是Wordpress自带的媒体库实在是难用，因而我决定自己在服务器中搭建一个自用的图床。

首先我们得找到一个合适的开源项目（别问，问就是博主太菜没办法自己写~），百般挑选下我选择了兰空图床，项目地址附上：[lsky-org/lsky-pro: ☁️兰空图床(Lsky Pro) - Your photo album on the cloud. (github.com)](https://github.com/lsky-org/lsky-pro)

之后的搭建过程就全傻瓜式了~

**2.搭建**

博主的服务器管理使用的是宝塔面板，之后的步骤也以宝塔为范例

首先先在项目地址下载release版本

*（图片已失效）*<!-- 原图: http://image.penguinway.space/i/2023/05/23/646cd75ddc6f6.png -->

然后想一个好听的地址，比如本人的是[https://image.penguinway.space](https://image.penguinway.space/)

在域名解析控制台上配置好域名解析，然后在宝塔上建站，记得创建数据库。

记得安装要求哦~

*（图片已失效）*<!-- 原图: http://image.penguinway.space/i/2023/05/23/646cd87e7bf16.png -->

对应的PHP模块可以在宝塔的PHP管理上找到。具体在软件商店>php*.*(版本号)>设置>安装拓展/禁用函数

*（图片已失效）*<!-- 原图: http://image.penguinway.space/i/2023/05/23/646cd9403e4d3.png -->

随后将网站的运行目录设置为public

*（图片已失效）*<!-- 原图: http://image.penguinway.space/i/2023/05/23/646cda240c760.png -->

访问设置好的网站地址，就会进入安装界面~~（图片就不放出了~~）

随后待安装检测通过后跟着提示，进行数据库的设置和管理员账号的设置，最后一切完成后就可以享受自建图床的快乐啦~
