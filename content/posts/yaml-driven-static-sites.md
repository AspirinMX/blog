---
title: "为什么我把博客的每个页面都做成 YAML 驱动"
date: "2024-10-15"
tags:
  - "工程实践"
  - "静态站点"
draft: false
toc: true
comments: true
---
搭建个人博客最常遇到的问题并不是「第一版写不出来」，而是半年后想加一个项目条目、改一下导航顺序或补一个独立页面时，发现文案、路由和样式全耦合在 TSX 组件里。把每个页面抽象成「Markdown 文件 + YAML 模板声明」，能让内容维护回归最轻的纯文本体验。

<!-- more -->

## 区分「内容数据」与「展示模板」

在博客系统里，真正需要写代码的其实只是有限的几种展示骨架：

1. `home`：展示导语与带摘要截断的文章流。
2. `archive`：按年份分组的极简标题索引。
3. `project`：结构化项目清单。
4. `about` / `page`：通用的长文展示页。

只要建立一张清晰的模板分发注册表，页面本身就退化成了声明式文件：

```yaml title="content/pages/projects.md"
---
title: "项目"
slug: "projects"
template: project
nav:
  show: true
  label: "项目"
  order: 3
projects:
  - name: "墨笺 Blog"
    year: "2026"
    status: "维护中"
    summary: "极简黑白纸墨风个人技术博客。"
---
```

## 用 Schema 校验兜底配置错误

配置化的最大风险是手写 YAML 时字段拼错或类型不符，导致页面在运行时静默出错。在内容加载层引入 `zod` Schema 校验后，只要字段不合规，构建期就会立刻精确报出文件路径和出错字段，兼顾了纯文本编辑的自由度与类型安全。

## 长期可维护性

五年之后，前端框架可能已经换了两代，但 `content/` 目录下的纯文本 Markdown 与 YAML 文件依然完整可读、零迁移成本。这也是静态技术博客最迷人的地方。
