---
title: "理解 Next.js 16 的 Cache Components 与静态壳模型"
date: "2026-11-18"
updated: "2026-11-22"
tags:
  - "Next.js"
  - "前端架构"
draft: false
toc: true
comments: true
---
在很长一段时间里，App Router 的缓存心智模型让许多团队感到困惑：隐式缓存默认开启，路由级配置分散在不同常量里，一次无意中读取 `cookies()` 就可能让整个页面退回动态渲染。Next.js 16 将 **Cache Components** 作为核心能力推向前台，用更显式的边界重新定义了静态与动态的协作方式。

<!-- more -->

## 为什么需要新的缓存边界

过去我们习惯在「整页静态」与「整页动态」之间做二选一。只要页面里嵌入了一小块依赖请求头或用户状态的组件，整棵组件树往往会失去构建期预渲染的优势。

Cache Components 的核心思路恰恰相反：**尽可能扩大静态壳（Static Shell）的覆盖范围，只把真正依赖请求上下文的局部放进 `<Suspense>` 边界里流式补全。**

### 可预测计算与显式缓存

在启用 `cacheComponents: true` 后，构建器会对组件树中的每一处读取进行静态分析，主要分为三类：

| 数据来源 | 构建期行为 | 推荐处理方式 |
| --- | --- | --- |
| 模块导入、同步文件读取 | 自动进入静态壳 | 直接同步读取或纯计算 |
| 异步数据读取 / 昂贵编译 | 需显式声明生命周期 | 使用 `"use cache"` 与 `cacheLife` |
| `cookies()`、`headers()`、`searchParams` | 依赖运行时请求 | 推迟到子树并包裹 `<Suspense>` |

### 在静态内容站点中的实践

对于本地 Markdown 驱动的技术博客而言，读取文件本身是完全确定性的，但语法高亮（Shiki）和 AST 转换通常是异步管线。将编译函数标记为可缓存，可以既保留构建期全量静态生成，又避免重复编译开销：

```ts title="src/lib/markdown.ts"
import { cacheLife } from "next/cache";

export async function compileMarkdown(source: string) {
  "use cache";
  cacheLife("max");

  // 经过 remark / rehype / katex / shiki 静态编译为 HTML
  return renderPipeline(source);
}
```

## 动态路由与 `generateStaticParams`

当开启 Cache Components 后，动态段（例如 `/posts/[slug]`）需要特别注意两点：

1. `generateStaticParams()` 必须返回至少一条有效参数，帮助编译器在构建期验证页面树中不存在未声明的运行时读取。
2. 路由参数 `params` 在 Next.js 16 中始终是一个 `Promise`，在页面组件与 `generateMetadata` 中都需要先 `await` 再解构。

> 好的框架抽象应当让正确的路径成为阻力最小的路径。当静态与动态的边界在代码里清晰可见时，性能调优就不再依赖猜测。

## 小结

把文件读取保持同步与确定性、把异步编译放进显式 `"use cache"` 边界、把未知路由交给 `notFound()`，这套组合在 Next.js 16 下几乎零心智负担，也能充分发挥静态壳的瞬时加载优势。
