# ChinaFactoryHost — 视觉一致性审计报告

**一句话结论**：令牌化程度比预期高得多（圆角 11 种取值 **全部**走 `var(--radius-*)`，阴影 40 处里 34 处走 `--shadow-*`，h2 主档 89 处实测完全一致）。真正的散值集中在 **4 处**：深色 band 上并存两套白、`✓` 勾号图标有 4 种尺寸 + 3 种光学偏移、卡片家族 padding 三档、深色 band 里 3/4 个容器漏了 `color` 声明（实测 1:1）。

- 审计脚本：`_audit-visual.mjs`（Node 22，仅内置模块；只读，不写 `src/`）
  - `node _audit-visual.mjs static` → `_av-static.txt`（CSS 字面量全量扫描）
  - `node _audit-visual.mjs runtime` → `_av-runtime.txt`（1440×900，16 条路由，CDP computed style）
  - `node _audit-visual.mjs type` → `_av-type.txt`（字号/行高/字距逐路由采样）
- 运行时方法：`_serve.mjs` 起静态服务 + headless Chrome（`Emulation.setDeviceMetricsOverride` 1440×900）+ `Runtime.evaluate` 读 computed style。**全部用数值判断，未依赖截图。**
- 覆盖：16 条路由 ×（卡片家族 10 类 / 按钮 4 变体 / 图标 7 组 / h1–h4 / 深色 band 三级灰度 / svg 基线）
- 与 `audit-interaction.md` 的分工：那份管**交互**（对比度是否达标、触控、过渡、`:active`、溢出）；本报告只管**一致性**（散值是否收敛、同类组件是否对齐）。凡那份已改过的（如 `.rail__fact` 改白、`.breadcrumb a` 加 `padding-block`），这里只标注"已修，勿回滚"，不重复建议。

---

## P1 — 明显不一致

### P1-1　深色 band 上并存两套白：`#FFFFFF` ×26 与 `--on-inverse-text` `#F5F2EE` ×11

| 白 | 值 | 出现次数 | 用在哪 |
|---|---|---|---|
| 字面量 | `#FFFFFF`（冷/纯白） | **26** | 深色 band 的**标题与强文本** |
| 令牌 | `--on-inverse-text` = `#F5F2EE`（暖奶油白） | **11** | 深色 band 的**正文级文本** |

同一个 footer 里两者直接相邻：

```
components.css:2136  .footer__col-title { color: #FFFFFF; }     ← 冷白
components.css:2157  .footer__fact-v    { color: var(--on-inverse-text); }  ← 暖奶油白 #F5F2EE
```

`#FFFFFF` 字面量的 26 处（`_av-static.txt` A1 段全量）：

```
components.css:82   .btn--second                    :85  .btn--second:hover
components.css:95   .hero-full .btn--primary        :111 .btn--whatsapp
components.css:112  .btn--whatsapp:hover            :418 .rail__lead
components.css:421  .rail a                         :422 .rail a:hover
components.css:430  .rail__fact                     :431 .rail__fact a
components.css:490  .over-hero .site-header__bar .burger
components.css:551  .site-footer .brand__mark       :552 .brand__word   :554 .brand__core
components.css:561  .site-footer .brand:hover …     :805 .hero--inverse h1, .hero--inverse .hero__lead
components.css:902  .hero-full__content h1          :1072 .trust-figure
components.css:1831 .cta--inverse h2                :2039 .map-region-t3 (fill)
components.css:2125 .site-footer h2                 :2136 .footer__col-title
components.css:2143 .footer__nav a:hover            :2223 .wa-fab
components.css:2305 .hero--inverse .btn--primary    :2311 .hero--inverse .btn--primary:hover
```

**同时还有两个死令牌**：

| 令牌 | 定义 | 直接引用次数（components.css + base.css） |
|---|---|---|
| `--text-on-dark` | `#F5F2EE`（tokens.css:141） | **0**（只通过 `--color-text-inverse` 别名间接用 1 次，803 行） |
| `--text-on-accent` | `#FFFFFF`（tokens.css:140） | **0** |

**改法**（零视觉变化，纯收敛）：

1. `tokens.css` 在 §9 段新增 `--on-inverse-text-strong: #FFFFFF;`
2. 把上面 26 处 `#FFFFFF` 替换为 `var(--on-inverse-text-strong)`（**`.btn--whatsapp` 111/112 除外——那是第三方品牌色，见文末"有意为之"**）
3. `--text-on-accent` 要么删掉，要么用它替掉 `--on-inverse-text-strong`（两者都是 `#FFFFFF`，可合二为一）

> 反过来做（把 26 处 `#FFFFFF` 改成现有的 `var(--on-inverse-text)`）**会改变观感**——那会把所有深色标题从纯白变成暖奶油白。不要这么改。

**影响范围**：页脚（21/21 路由）、`.cta--inverse`（13 路由）、hero（16 路由）、顶部 rail（21/21）。

---

### P1-2　同一个「✓ 已核验」勾号，在列表里出现 4 种尺寸 + 3 种光学偏移

同一语义、同一 `--color-verified`（绿）的勾号，实测渲染尺寸：

| 文件:行 | 选择器 | 尺寸 | `margin-top` | 列表字号 |
|---|---|---|---|---|
| components.css:937 | `.claims-strip__item svg` | **20×20** | **1px** | `--fs-body` |
| components.css:1480 | `.checklist__list svg` | **18×18** | 3px | `--fs-body` |
| components.css:1531 | `.redflags__list svg` | **18×18** | 3px | `--fs-body` |
| components.css:1026 | `.split-card__bullets svg` | **16×16** | 3px | `--fs-caption` |
| components.css:1237 | `.cmp-cell svg` | **16×16** | 3px | `--fs-caption` |
| components.css:1387 | `.step__evidence svg` | **16×16** | **4px** | `--fs-caption` |
| components.css:1149 | `.service-card__list svg` | **14×14** | **4px** | `--fs-caption` |
| components.css:1713 | `.case-card__result svg` | **14×14** | **4px** | `--fs-body-sm` |
| components.css:1812 | `.testimonial__verified svg` | **12×12** | — | `--fs-micro` |

运行时实测（`_av-runtime.txt` ICONS 段）确认这不是理论值：`list-item` 组在同一批路由里同时报出 `20x20`、`18x18`、`16x16`、`14x14`。

**改法**：收敛到两档 + 统一光学偏移。

```css
/* 正文级列表（--fs-body）：18px */
.checklist__list svg, .redflags__list svg,
.claims-strip__item svg { width: 18px; height: 18px; margin-top: var(--space-1); }  /* 4px */

/* 小字列表（--fs-caption / --fs-body-sm）：16px */
.split-card__bullets svg, .cmp-cell svg, .step__evidence svg,
.service-card__list svg, .case-card__result svg { width: 16px; height: 16px; margin-top: var(--space-1); }
```

`--space-1` = **4px**，正好是现在 `.step__evidence` / `.service-card__list` / `.case-card__result` 已经在用的值，所以只需要把 `1px` / `3px` 两档改成 4px，并把尺寸从 20/14 收到 18/16。
`.testimonial__verified svg` 的 12×12 是"已核验"徽标内的装饰勾，不是列表勾，**保留**。

**影响范围**：`/`、`/about/how-we-vet-factories/`、`/services/` 及 4 个服务页、`/case-studies/`、2 个案例页、`/destinations/*`、`/industries/*`。

---

### P1-3　卡片家族 padding 三档（最大差 8px），其中 `.split-card` 的 +4px 没有任何注释

1440 实测（`_av-runtime.txt` CARD FAMILY 段）：

| 组件 | 文件:行 | padding（上/右/下/左） | border-radius | 阴影 |
|---|---|---|---|---|
| `.service-card` | components.css:1100 | **24 / 24 / 24 / 24** | `--radius-lg` | `--shadow-card` |
| `.split-card` | components.css:960 **+ 961** | **28 / 24 / 24 / 24** | `--radius-lg` | `--shadow-card` |
| `.related-nav a` | components.css:2460 | **16 / 16 / 16 / 16** | `--radius-lg` | `--shadow-card` |
| `.case-card` | components.css:1697（在 `__body` 上） | 0（+ `__body` **20**） | `--radius-lg` | `--shadow-card` |
| `.fact` | components.css:2411 | 20 / 20 / 20 / 20 | `--radius-md` | 无 |
| `.checklist` | components.css:1465 | 20 / 24 / 24 / 24 | `--radius-md` | 无 |
| `.vet-link` | components.css:2379 | 20 / 24 / 20 / 24 | `--radius-md` | `--shadow-card` |

问题点：

1. **`components.css:961` `padding-top: calc(var(--space-6) + 4px)`** —— 让 `.split-card` 的上内边距比同级的 `.service-card` 多 4px，且**上下不对称**（28 / 24）。这一行没有注释，对比 `.checklist` 在 1463-1464 明确写了"Tighter top padding so the header rule reads as a caption bar"——`.split-card` 是同样的手法却没说明理由。`/` 首页上 `.service-card`（24）与 `.split-card`（28）同时出现。
   → **删掉 961 行**，与 `.service-card` 对齐。
2. **`.related-nav a` 16px vs `.service-card` 24px = 8px**，两者同为 `--radius-lg` + `--shadow-card` + `--shadow-card-hover` 的白卡。
   → 若"小导航卡"是刻意定位，请在该块加一行注释说明（像 `.fact`/`.checklist` 那样）；否则改 `var(--space-5)`（20px）。

> `--radius-md` 那一档的 20 / 20-24 / 20-24 差异是**刻意的**（components.css:1460-1462 有注释说明三块要互相区分），见文末"不要动"。

---

### P1-4　4 个深色 band 里只有 1 个写了 `color`，另外 3 个实测自身文字 1:1

`components.css:2253-2271` 的语义变量重映射块列出了 4 个 selector：

```css
.section--inverse, .hero--inverse, .cta--inverse, .hero-full {   /* 2253-2256 */
  --color-text: var(--on-inverse-text);  …                        /* 2257 */
}
```

但真正的 `color` 声明只在 2273-2277 给 `.section--inverse` 写了：

```css
.section--inverse { background: var(--color-surface-inverse); color: var(--on-inverse-text); }  /* 2275 */
```

运行时实测（`_av-runtime.txt` DARK BAND 段，16 条路由）：

```
.cta--inverse   color=rgb(26, 25, 23)  bg=rgb(26, 25, 23)  contrast=1      ← 自己是黑字黑底
.hero-full      color=rgb(26, 25, 23)  bg=rgb(26, 25, 23)  contrast=1      ← 同样
```

目前没有裸 `<p>` 直接挂在 `.cta--inverse` / `.hero-full` 下（子元素的 `.lead` / `.cta__micro` / `h1` / `h2` 都有显式色），所以还没出可见故障——但任何新加的无 class 文本放进这两个 band 就是**完全不可见**。

**改法**：把 2275 的 `color: var(--on-inverse-text);` 提到 2253-2256 的共享块里（紧跟 2257 的 `--color-text` 之后即可，或直接写 `color: var(--on-inverse-text);`）。一行，零视觉变化（对 `.section--inverse` 而言值完全相同）。

**影响范围**：`.cta--inverse`（13 路由）、`.hero--inverse`、`.hero-full`（`/` 等）。

---

## P2 — 建议收敛

### P2-1　`.btn` 在 1440 下有三套尺寸/字号，且页头档没有注释说明

1440 实测（`_av-runtime.txt` BUTTONS 段，16 路由）：

| 位置 | 文件:行 | 高度 | font-size | padding | 命中 |
|---|---|---|---|---|---|
| 页头 `.site-header__actions .btn` | components.css:711-712 | **44px** | **16px**（`--fs-body-sm`） | `0 / 16px` | 16/16 |
| 页面 `.btn--primary` / `.btn--second` / `.btn--secondary` | components.css:35（`padding`）、55（`min-height`） | **50px** | **18px**（`--fs-body` = 1rem） | `0 / 24px` | 16/16 |
| 底栏 `.wa-bar .btn` | components.css:2203 | 44px（1440 下隐藏） | **14px**（`--fs-caption`） | `0 / 24px` | 移动端 |

同一个 `.btn--primary`，在页头是 44px/16px、在页面是 50px/18px——**同一个 class 读起来像两个控件**。页头做紧凑档是常见做法，但这里没有任何注释，无法判断是有意还是漂移。

**改法**：抽成显式的 `.btn--sm { min-height: 44px; font-size: var(--fs-body-sm); padding: 0 var(--space-4); }` 给页头用，并在 711 附近加一行注释说明"页头走紧凑档是刻意的"。

### P2-2　绿色 hover 光晕用了两个不同 alpha，同一个绿色写了两遍

```
components.css:87    .btn--second:hover               box-shadow: 0 6px 16px rgba(22, 101, 52, 0.30)
components.css:2312  .hero--inverse .btn--primary:hover box-shadow: 0 6px 16px rgba(22, 101, 52, 0.35)
```

`rgba(22,101,52,…)` = `--green-700`（`#166534`），两处是**同一个按钮**（`.hero--inverse .btn--primary` 在 2304-2307 复刻了 `.btn--second` 的 green-700/800 配色），光晕透明度却差 0.05。

**改法**：`tokens.css` §19 段新增 `--shadow-accent-green: 0 6px 16px rgba(22, 101, 52, 0.32);`，两处统一引用。（品牌红的对应物 `--shadow-accent` 已经是令牌，见 435 行——绿色没有。）

### P2-3　裸字号 7 处，其中 2 处与注释自相矛盾

| 文件:行 | 选择器 | 当前 | 建议 |
|---|---|---|---|
| components.css:402 | `.rail` | `0.8125rem`（= **14.625px**，不在阶梯上） | `var(--fs-caption)`（14px）或 `var(--fs-body-sm)`（16px） |
| components.css:531 | `.brand__word` | `15px` | `var(--fs-body-sm)`（16px） |
| components.css:550 | `.brand__word`（`@media ≥1024`） | `17px` | `var(--fs-h5)`（18px） |
| components.css:1358 | `.step__num` | `15px` | `var(--fs-body-sm)`（16px） |
| components.css:1363 | `.step__num`（`@media ≥768`） | `18px` | `var(--fs-body)` |
| components.css:1806 | `.testimonial__initial` | `16px` | `var(--fs-body-sm)` |
| components.css:2042 | `.map-label` | `11px` | `var(--map-code-size)`（同为 11px，tokens.css:477） |
| components.css:39 / 55 | `.btn` | `1rem` | `var(--fs-body)`（同值） |

**`.rail` 那处最值得改**：`components.css:398-400` 的注释写的是"Body face, **13px**, **normal** tracking"，而实际代码是 `0.8125rem` = **14.625px**、`letter-spacing: 0.02em`。**注释与代码已经漂移了**。

### P2-4　离阶梯间距 8 处（其中 3 处是上一轮触控补丁引入的）

| 文件:行 | 选择器 | 值 | 建议 |
|---|---|---|---|
| components.css:790 | `.breadcrumb a` | `padding-block: 11px` | `var(--space-3)`（12px）→ 命中区 23+24 = **47px**，仍 ≥44 |
| components.css:2178 | `.footer__wa a` | `padding-block: 11px` | `var(--space-3)`（12px） |
| components.css:1030 | `.split-card__bullets a` | `padding-block: 13px` | `var(--space-4)`（16px）→ 18+32 = 50px；改 `--space-3` 会掉到 42px，**不够 44** |
| components.css:586 | `.nav-trigger` | `gap: 6px` | `var(--space-1)`（4px）或 `var(--space-2)`（8px） |
| components.css:1620 | `.chip` | `gap: 6px` | 同上 |
| components.css:418 | `.rail__lead` | `padding-block: 10px` | `var(--space-3)`（12px） |
| components.css:2230 | `.wa-fab svg` | `margin: 0 14px` | `var(--space-3)`（12px）或 `var(--space-4)`（16px） |

> 前 3 个 11/13px 是 `audit-interaction.md` P0-3/P2-3 的修复值——是为了把 23px/18px 的元素凑到 44px 触控目标算出来的（23+2×11=45、18+2×13=44）。**改的时候必须重新验算命中区 ≥44px**，别只做机械替换。

### P2-5　标题字距仍按衬线体校准，但 display 早已换成 sans

`tokens.css:20-25` 明确写了 display 已经改成 **sans**（"Display is therefore the same sans stack as body"），但 `tokens.css:321-324` 的字距令牌**还是按衬线体写的**，注释甚至还留着"serif wants ~0"：

```css
--ls-hero: -0.004em;   /* serif wants ~0, not the sans −0.03 */   ← tokens.css:321
--ls-h1:   -0.003em;   /* tokens.css:323 */
--ls-h2:   -0.002em;   /* tokens.css:324 */
--ls-h3:   0;          /* tokens.css:325 */
```

1440 实测（`_av-type.txt`）：

| 元素 | font-size | letter-spacing（实测） | 相对字号 |
|---|---|---|---|
| `h1` | 63px | **−0.189px** | −0.003em |
| `h1.display-xl` | 72px | **−0.216px** | −0.003em |
| `h2` | 35px | **−0.070px** | −0.002em |
| `h3` | 25px | `normal` | 0 |
| `p`（正文） | 18px | `normal` | 0 |

即：**63px 的粗体 sans 标题，字距只收紧了 0.19 像素**——和正文基本没有区别。粗体无衬线在 40px 以上通常需要 −0.015em ~ −0.03em（63px 下约 −0.9 ~ −1.9px）才会显得紧实，现在是"标题比正文还松"的观感。

**改法**（连同 321 行那句过期注释一起改）：

```css
--ls-hero: -0.020em;   /* sans display: ~-1.3px @63px, ~-1.4px @72px */
--ls-h1:   -0.020em;
--ls-h2:   -0.015em;   /* 35px → ~-0.5px */
--ls-h3:   -0.010em;
```

这是个**视觉判断项**，建议改完在 1440 下 eyeball 一次 hero 再定；先改注释避免下一个人继续按衬线体理解。

### P2-6　`.eyebrow` 没写 `line-height`，12px 标签用了正文的 1.65 行高

同一个视觉角色（12px 大写 micro-label，`--fs-label` + `--ls-label` + `uppercase`）在两处渲染出**两套字重和行高**：

| 选择器 | 文件:行 | font-weight | line-height（实测） | 行盒高 |
|---|---|---|---|---|
| `.eyebrow` | base.css:211-222 | **600**（`--fw-semibold`） | **19.801px**（1.65 = `--lh-body`，继承来的） | 19.8px |
| `.footer__col-title`（是 `h2`） | components.css:2129-2137 | **700**（`--fw-bold`） | **15.601px**（1.30 = `--lh-label`） | 15.6px |

差 **4.2px** 的行盒高、差一级字重。

**改法**：`base.css` 的 `.eyebrow` 块补两行：

```css
font-weight: var(--fw-bold);      /* 与 .footer__col-title 对齐 */
line-height: var(--lh-label);     /* 12px 大写标签不该用 --lh-body 1.65 */
```

**影响范围**：`.eyebrow` 出现在 16/16 路由（"Next step" / "At a glance" / "Sample structure" 等）。

### P2-7　被覆盖成 21px 的 `h2` 有两套字重/行高

21px（`--fs-h4`）的 `h2` 在两处出现，参数不同：

| 选择器 | 文件:行 | font-weight | line-height（实测） | 路由 |
|---|---|---|---|---|
| `.channel__title` | components.css:2004 | **600**（`--fw-semibold`） | **25.62px**（1.22，继承 `h2` 的 `--lh-h2`） | `/contact/` |
| `.form-shell--compact h2` | components.css:1951 | **700**（继承 `h2`） | **27.72px**（1.32 = `--lh-h4`） | `/destinations/yiwu/`、`/industries/beauty-packaging/`、`/services/on-site-support/` |

**改法**：`components.css:2004` 的 `.channel__title` 补 `line-height: var(--lh-h4);`，字重二选一（建议统一 `--fw-bold`，与另一处一致）。

### P2-8　卡片 hover 位移：`.case-card` 是 −4px，其余全是 −3px

| 选择器 | 文件:行 | `transform` |
|---|---|---|
| `.split-card:hover` | components.css:995 | `translateY(-3px)` |
| `.service-card:hover` | components.css:1111 | `translateY(-3px)` |
| `.pillar:hover` | components.css:2429 | `translateY(-3px)` |
| `.related-nav a:hover` | components.css:2474 | `translateY(-3px)` |
| **`.case-card:hover`** | **components.css:1676** | **`translateY(-4px)`** |

1px 的差异在并排卡片上能看出来（`/case-studies/` 同时有 `.case-card` 和 `.related-nav a`）。**改法**：1676 行改成 `translateY(-3px)`。

### P2-9　`#DFE4EB` 单点色（`.btn--primary` 在浅底 hero 上的按下态）

`components.css:97` `.hero-full .btn--primary:active { background: #DFE4EB; }` —— 全站唯一的这个色，最接近的令牌是 `--ink-150` `#DBE0EA` 或 `--surface-sunken` `#EFF2F4`，都不相等。

**改法**：`tokens.css` 新增一个按下态令牌（如 `--action-bg-pressed-on-light: #DFE4EB`）后引用，或直接改用 `var(--ink-150)`（`#DBE0EA`，差 5/4/5，肉眼不可辨）。

### P2-10　`.brand__word` 的 `letter-spacing: -0.015em` 是硬编码

`components.css:533`。全站 55 处 `letter-spacing` 里有 51 处走 `--ls-*`（`--ls-label` / `--ls-micro` / `--ls-mono-tag`），只有 4 处裸值：

```
components.css:315  0.01em    .photo-slot__note
components.css:404  0.02em    .rail
components.css:533  -0.015em  .brand__word
components.css:1070 -0.01em   .trust-figure
components.css:2042/2056/2071/2084  0.08em / 0.04em / 0.02em / 0.08em   (CoverageMap 内 4 处)
```

前 4 处是组件级微调，可保留；CoverageMap 那 4 处（2043/2057/2072/2084）是同一个 SVG 里的一组值，建议并为 `--map-label-ls`。优先级最低。

---

## 已经很一致、**不要动**的项

1. **border-radius：11 种取值全部走 `var(--radius-*)`，没有一处裸 px。**
   `--radius-md` ×15（659/1251/1311/1458/1512/1594/1736/1933/1949/1991/2030/2100/2377/2409/2421）、`--radius-lg` ×12（627/830/958/1098/1190/1569/1659/1720/1786/1942/2218/2459）、`--radius-xs` ×4、`--radius-circle` ×4、`--radius-sm` ×4、`--radius-pill` ×1、`--radius-none` ×1、`--track-radius-card` ×1、`--track-media-radius` ×1。
   只有 3 处写裸 `0`（1485 `.checklist--plain`、1800 `.testimonial__avatar .photo-slot`、2442 `.note-strip`）和 1 处 `calc(var(--radius-lg) - 1px)`（1695 `.case-card__media`）——**渲染结果与令牌完全等价**，改了没有收益。
2. **box-shadow：40 处声明里 34 处走令牌。** `--shadow-card` ×12、`--shadow-card-hover` ×7、`--shadow-md` ×3、`--shadow-sticky` ×1、`--shadow-focus` ×1、`--shadow-lg` ×1、`none` ×9。剩下 6 处全部是有意的，见下一节。
3. **`h2` 主档完全一致：89 处采样，全部 `34.9992px / 42.699px / -0.0699984px / 700`。** 16 条路由无一处偏离。
4. **`.section-head` 间距完全一致：68 处采样，`margin-bottom: 32px`、`padding-bottom: 0`、`gapToNext = 32px`。**（唯一一个 `gapToNext = -133.1` 是首页 Coverage 区块，下一个兄弟元素在 grid 里排到了上方，是布局结构不是间距问题。）
5. **深色 band 的三级灰度差已经拉开，不要调。** 1440 实测：
   - 一级（标题）：`#FFFFFF` on `#1A1917` = **17.57:1**（35px/700）
   - 二级（正文/lead）：`#B4B9C3` = **8.92:1**（24px）
   - 三级（micro/法律）：`#8A8F99` = **5.41:1**（14px）
   三级之间 1.97× / 1.65× 递减，层级清晰。（这一条与 P1-1 不冲突：P1-1 说的是"第一级内部混了两种白"，不是说灰度差不够。）
6. **亚像素边框：没有。** CSS 里 14 处显式边框宽度全部是整数（`1px` ×12、`2px` ×1、`3px` ×1）；运行时 4000 个元素扫描，**0 个** computed border-width 是 `0.x px`。
7. **列表/卡片内 `svg` 的垂直对齐：没有真实偏移。** 16 条路由共约 150 个采样，真实偏差最大 **1.5px**（`claims-strip__item`，icon 20px vs 文本 23px）。唯一报 >2px 的 2 例（`/industries/beauty-packaging/`，`deltaMid = -12.8`）是**测量假阳性**：那个 `li` 的文本是两行以上（txtH = 45.6px，svgH = 18px），拿两个包围盒的中线比必然偏 —— 不是真的没对齐。不要改。
8. **卡片顶部大图标三处完全一致**：`.split-card__icon svg`（1009）、`.service-card__icon svg`（1132）、`.channel__icon svg`（2002）全部 `40×40` + `stroke-width: 1.5`。这是站点最一致的一组图标，别动。
9. **`--fs-*` 整体纪律很好**：156 处 `font-size` 里 149 处走 `var(--fs-*)` / `var(--map-*)`，只有 7 处裸值（见 P2-3）。
10. **焦点可见性、`:active`、触控、过渡、溢出** —— `audit-interaction.md` 已覆盖并复测通过，本报告不重复。

---

## 判断为「有意为之、不该改」的项

| 文件:行 | 值 | 为什么不该改 |
|---|---|---|
| components.css:75 | `rgba(208, 32, 42, 0.28)`（`.btn--primary:hover` 光晕） | 品牌红 `#D0202A` 的投影色，`tokens.css:435` 的 `--shadow-accent` 用的是同一个 `rgba(208,32,42,…)`，注释已说明"≤1 per page"。**保留。** |
| components.css:111 / 112 | `#FFFFFF`（`.btn--whatsapp`） | WhatsApp 第三方品牌色配套文字色（`--color-whatsapp` `#0F7A63`，white 5.27:1）。**不属于站点色系。** |
| components.css:396 | `rgba(255, 255, 255, 0.82)`（`.rail`） | 红底 rail 上柔化过的白，刻意不刺眼。 |
| components.css:264 / 266 | `#000` + `rgba(0, 0, 0, 0.40)`（`.photo-slot__mark`） | `mask-image` 渐变的遮罩通道，不是颜色使用。 |
| components.css:243 | `rgba(26, 25, 23, 0.055)`（`--slot-line`） | 局部自定义属性，本身就是一层令牌化。 |
| components.css:421 / 422 / 430 / 431 | `#FFFFFF`（`.rail a` / `.rail__fact`） | **这是 `audit-interaction.md` P0-1 的修复结果**（原来是 `--on-inverse-text-secondary` `#B4B9C3`，在红底上只有 2.72:1）。**不要回滚成 rgb(180,185,195)。** |
| components.css:790 / 2178 / 1030 | `padding-block: 11px / 11px / 13px` | 同样是 `audit-interaction.md` P0-3 / P2-3 的修复值，为凑 44px 触控目标反推出来的。改动前必须重算命中区（见 P2-4）。 |
| components.css:1460-1465 | `.checklist` 无阴影 + 20/24 上下不等 padding | 注释明确："this block sits next to `.vet-link` (shadowed) and `.fact` (filled tile) — shadow is reserved for things you can act on"。**三个块刻意长得不一样。** |
| components.css:1540-1546 | `.caveat` 虚线 + 方角 + ochre 底 | 注释明确："the only dashed grammar on the site"，刻意与 checklist / quote 区分。 |
| components.css:1545 / 1485 / 2442 | `border-radius: 0` | 走的是 `--radius-none` 语义（虽然写的是裸 0），是上述"刻意区分"的一部分。 |
| components.css:611 / 703 | `inset 0 -3px 0 var(--color-accent)` | 当前页导航下划线，用 inset 阴影做 3px 下划线是刻意手法，不是"该用 border"。 |
| components.css:251 | `inset 0 0 0 1px var(--slot-edge)` | photo-slot 的内描边，同上。 |
| tokens.css:11-14 | `--space-*` 与 `--header-h` / `--rail-h` 用 px 而非 rem | 文件头注释已说明：间距不随 root font-size 缩放，避免整站重排。**不要"修"成 rem。** |

---

## 建议修复顺序

1. **P1-4**（一行：把 `color: var(--on-inverse-text)` 从 2275 提到 2253 的共享块）—— 唯一一处可能让文字完全不可见的隐患，零视觉风险。
2. **P1-2**（勾号图标尺寸收敛到 18/16 两档 + `margin-top: var(--space-1)`）—— 视觉收益最大，8 行 CSS。
3. **P1-3**（删 `components.css:961` 一行；`.related-nav a` 加注释或改 20px）—— 首页同页可见。
4. **P1-1**（新增 `--on-inverse-text-strong: #FFFFFF`，批量替换 25 处字面量）—— 纯收敛，零视觉变化，但改动面大，建议放最后单独一个 commit。
5. **P2-5**（字距令牌，含 321 行过期注释）与 **P2-6**（`.eyebrow` 行高）—— 这两项是"糙感"最直接的来源，但涉及视觉判断，改完建议 eyeball 一次。
6. 其余 P2 项按上表逐个收敛。

---

## 复跑

```bash
cd D:\china-factory-host
node _audit-visual.mjs static  > _av-static.log  2>&1
node _audit-visual.mjs runtime > _av-runtime.log 2>&1   # 约 90s，自启 _serve.mjs + headless Chrome
node _audit-visual.mjs type    > _av-type.log    2>&1
```

输出落在 `_av-static.txt` / `_av-runtime.txt` / `_av-type.txt`。脚本只读，不写 `src/`。
（PowerShell stdout 会被吞，必须重定向到文件再读——这是本机已知问题。）

---

# 实施记录（2026-09-20）

按上面「建议修复顺序」执行完毕。**每一条在改之前都先验证了审计的判断**，其中两条
被证实是误判或需要改法，已按下表处理。

## 已落地

| 项 | 做法 | 复测证据 |
|---|---|---|
| **P1-4** | `color: var(--on-inverse-text)` 从 `.section--inverse` 提到 2253 的四选择器共享块 | `.cta--inverse` 对比度 **1 → 15.74**；全站采样最低值 5.41 |
| **P1-2** | 勾号收敛到 18px（正文级）/ 16px（小字级）两档，`margin-top` 统一 `var(--space-1)` | runtime 只报 `18x18 \| 16x16`（原 20/18/16/14 四档） |
| **P1-3** | `.split-card` 的 +4px 挪进 `--creator` / `--buyer`；`.related-nav a` 加注释保留 16px | 带 modifier 实测 28px、不带 24px；`.service-card` 24px |
| **P1-1** | 新增 `--on-inverse-text-strong: #FFFFFF`，替换 **21 处**字面量；退役死令牌 `--text-on-accent` | static 只剩 5 处 `#FFFFFF`，全部在「有意为之」清单内 |
| **P2-5** | 字距令牌按 sans 重校（hero/h1 −0.020em、h2 −0.015em、h3 −0.010em），321 行过期注释一并改 | h1 63px 实测 **−1.26px**（原 −0.189px）；h2 −0.52px；h3 −0.25px |
| **P2-6** | `.eyebrow` 补 `font-weight: 700` + `line-height: var(--lh-label)`；顺带修 `.nav-menu__title` / `.mobilenav__label`（同类 12px 标签，审计未列） | 两类标签行盒 19.8px → **15.6px**，与 `.footer__col-title` 完全一致 |
| **P2-8** | `.case-card:hover` −4px → −3px | 与 `.split-card` / `.service-card` / `.pillar` / `.related-nav a` 对齐 |
| **P2-2** | 新增 `--shadow-accent-green`（alpha 取 0.30/0.35 中值 0.32），两处引用 | 绿色光晕单一来源 |
| **P2-3** | 7 处裸字号上阶梯；`.rail` 注释与代码漂移（写 13px、实为 14.625px）已纠正 | 156 处 font-size 全部走令牌 |
| **P2-7 / P2-9** | `.channel__title` 补 `line-height` 并统一 700；`#DFE4EB` → `var(--ink-150)` | 与 `.form-shell--compact h2` 对齐 |
| **P2-4（部分）** | `.nav-trigger` / `.chip` 的 `gap: 6px` → `--space-2`；`.wa-fab svg` `margin: 0 14px` → `--space-3`（必须 12px：FAB 固定 52px，16px 会溢出） | 见下「未改」 |

## 改法与审计不同（已核实）

1. **P1-3 没有直接删 `padding-top: calc(var(--space-6) + 4px)`。**
   核实发现 `.split-card::before` 是一根 4px 顶部色条（`position:absolute`，不占布局流），
   那 +4px 是**补偿**，不是漂移——删掉会让文字离色条只剩 20px，比 `.service-card` 的 24px 更挤。
   但同时发现 `src/pages/index.astro:386` 的 `.split-card` **没有 modifier**，色条透明却照样吃 +4px。
   → 最终把补偿挪进 `--creator` / `--buyer` 两个 modifier：带条的 28px、不带条的 24px。

2. **P2-1（`.btn` 页头紧凑档）未改。** 抽 `.btn--sm` 会牵动 21 条路由的页头按钮，
   而 44px/16px 与 50px/18px 的差异本身没有可见缺陷——只加了注释级说明的收益不抵风险。

## 未改（有理由）

- `.breadcrumb a` / `.footer__wa a` / `.split-card__bullets a` 的 `padding-block: 11px / 11px / 13px`
  —— 是为凑 44px 触控目标**反推**出来的，改成阶梯值必须重算命中区。审计自己也把它们列在
  「不要动」清单里。
- `.btn--whatsapp` / `.wa-fab` 的白（第三方品牌色）、`.map-region-t3` 的 `fill`、
  `.hero-full .btn--primary` 的 `background` —— 都不是「深色 band 上的文字白」，不参与 P1-1。

## 顺带发现并修掉的两个真实缺陷（审计报告没列）

1. **页脚链接 1.88:1。** `.site-footer` 声明了自己的 `color`，但没重映射 `--color-link`，
   于是任何没单独设色的 `<a>`（实测是 `.footer__wa a`，21/21 路由）落到
   `base.css` 的 `a { color: var(--color-link) }` = `--ink-700` #4A4642，在 #1A1917 上
   **1.88:1**，基本不可见。→ 按本项目「谁有底，谁负责自己的文字色」的原则，在
   `.site-footer` 上重映射 `--color-link` / `--color-link-hover`（不只是补一个选择器）。
   复测 **7.79:1**。
2. **`.rail__lead` 触控目标掉到 43px。** 把 `.rail` 从 `0.8125rem`(14.625px) 换到
   `--fs-caption`(14px) 后行盒变矮，24.1+20=44.1 → 23.1+20=**43.1**。
   → `padding-block` 10px → `var(--space-3)`(12px)，回到 47.1px。
   另补 `.breadcrumb a { padding-inline: 2px }`：最短的面包屑标签 "About" 只有 42px 宽，
   高度早就够 45px，卡的是**宽度**。

## 复测（21 路由，1440×900 + 390×844）

| 指标 | 改前 | 改后 |
|---|---|---|
| 对比度 < 4.5 | 0 | **0** |
| 触控 < 44px（非行内） | 7 → 2 | **0** |
| 焦点缺失（247 次真实 Tab） | 0 | **0** |
| 横向溢出 | 0 | **0** |
| hover 无过渡（硬跳变） | 0 | **0** |
| `:active` 规则 | 13 | **13** |
| 深色 band 最低对比度 | 1.88（页脚链接）/ 1（band 自身） | **5.41** |
| 列表勾号档位 | 4 档（20/18/16/14） | **2 档（18/16）** |
| 12px 大写标签行盒 | 两套（19.8 / 15.6） | **一套（15.6）** |
