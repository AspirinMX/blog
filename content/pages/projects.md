---
title: "项目"
slug: "projects"
template: project
nav:
  show: true
  label: "项目"
  order: 3
description: "持续维护的开源工具、模板与小规模实验，全部通过本页 YAML 配置。"
projects:
  - name: "墨笺 Blog"
    year: "2026"
    status: "维护中"
    summary: "基于 Next.js 16 与思源宋体的极简黑白纸墨风技术博客引擎，支持全页面 YAML 模板化配置、KaTeX 与 `/` 快捷键检索。"
    stack:
      - "Next.js"
      - "TypeScript"
      - "Tailwind CSS"
      - "Unified"
    links:
      - label: "源码"
        href: "https://github.com/AspirinMX/blog"
      - label: "说明"
        href: "/about"
  - name: "TypeLens"
    year: "2026"
    status: "实验"
    summary: "面向中文长文与技术文档的轻量网页排版检查脚本，自动检测孤字、行宽、中英文混排间距与等宽数字对齐。"
    stack:
      - "TypeScript"
      - "CSS"
      - "AST"
    links:
      - label: "源码"
        href: "https://github.com/AspirinMX/typelens"
  - name: "DiffLedger"
    year: "2025"
    status: "维护中"
    summary: "面向终端工作流的静态变更审计工具，将 Git 历史按模块复杂度与回滚风险整理为可读 Markdown 报告。"
    stack:
      - "Rust"
      - "CLI"
      - "Git"
    links:
      - label: "源码"
        href: "https://github.com/AspirinMX/diffledger"
      - label: "文档"
        href: "https://example.com/diffledger"
  - name: "TinyNote Sync"
    year: "2024"
    status: "已归档"
    summary: "基于纯文本文件夹与本地索引的零云端依赖 Markdown 笔记同步守护进程。"
    stack:
      - "Go"
      - "SQLite"
      - "Markdown"
    links:
      - label: "源码"
        href: "https://github.com/AspirinMX/tinynote-sync"
---
以下清单由 `content/pages/projects.md` 中的 YAML 直接生成，新增项目只需追加条目即可。
