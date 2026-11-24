---
title: "技术写作中的数学表达：KaTeX 排版与注意力机制笔记"
date: "2026-08-24"
tags:
  - "数学排版"
  - "深度学习"
draft: false
toc: true
comments: true
---
写算法与系统原理笔记时，用纯 ASCII 凑公式往往既难读又容易引入歧义。借助服务端编译的 KaTeX，我们可以在静态 HTML 里直接嵌入清晰的行内公式如 $O(n \log n)$ 与缩放点积注意力公式，而不在浏览器里运行沉重的排版脚本。

<!-- more -->

## 从点积相似度到缩放注意力

在 Transformer 架构中，查询矩阵 $Q \in \mathbb{R}^{n \times d_k}$、键矩阵 $K \in \mathbb{R}^{m \times d_k}$ 与值矩阵 $V \in \mathbb{R}^{m \times d_v}$ 之间的核心运算可以写为：

$$
\operatorname{Attention}(Q, K, V) = \operatorname{softmax}\!\left(\frac{Q K^{\top}}{\sqrt{d_k}}\right) V
$$

### 为什么要除以 $\sqrt{d_k}$

假设 $q$ 与 $k$ 的每个分量相互独立，均值为 $0$、方差为 $1$，那么它们的内积 $q \cdot k = \sum_{i=1}^{d_k} q_i k_i$ 满足：

$$
\mathbb{E}[q \cdot k] = 0, \qquad \operatorname{Var}(q \cdot k) = d_k
$$

当维度 $d_k$ 较大时，内积的幅值会随 $\sqrt{d_k}$ 增长，导致 $\operatorname{softmax}$ 进入梯度极小的饱和区。引入因子 $\frac{1}{\sqrt{d_k}}$ 可以把方差重新拉回 $1$，稳定反向传播的数值尺度[^1]。

### 频域直觉与欧拉公式

除了线性代数，信号处理中的连续傅里叶变换也常在工程文章中出现：

$$
\hat{f}(\xi) = \int_{-\infty}^{\infty} f(x)\, e^{-2\pi i x \xi}\, \mathrm{d}x
$$

配合思源宋体正文阅读时，将块级公式设置为适度上下留白并允许横向平滑滚动，能够避免窄屏设备（如 390px 手机屏幕）出现页面被公式撑爆的问题。

## 数值实现验证

下面是一段极简的 TypeScript 示意代码，用来演示带数值稳定性平移的 `softmax` 计算：

```ts title="softmax.ts"
export function softmax(logits: number[]): number[] {
  const maxVal = Math.max(...logits);
  const exps = logits.map((x) => Math.exp(x - maxVal));
  const sum = exps.reduce((acc, v) => acc + v, 0);
  return exps.map((v) => v / sum);
}
```

## 排版细节备忘

- 行内公式尽量保持紧凑，复杂分式与求和符号放到独立块级公式中。
- 在服务端通过 `remark-math` + `rehype-katex` 预编译为 HTML，客户端只需引入一份 `katex.min.css`，首屏即可直接渲染，彻底消除公式闪烁。

[^1]: 参见 Vaswani 等人 2017 年论文《Attention Is All You Need》第 3.2.1 节关于缩放因子的推导说明。
