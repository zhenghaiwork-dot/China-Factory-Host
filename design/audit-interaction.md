# ChinaFactoryHost 交互 / 视觉细节审计报告

**一句话结论**：21 条路由（1440×900 + 触控 390×844）全部实测，共 **6 类问题、涉及 21/21 条路由**——其中 1 个 WCAG AA 对比度硬伤（顶部红色 rail 文字 2.72:1，全站 21 条路由命中）、2 条路由在 390px 横向溢出、触控目标 6 类普遍偏小；过渡与 `:active` 有 5 处明确的「糙感」缺口。**焦点可见性和图片 alt 已确认完全没问题，不要动。**

- 审计脚本：`_audit-interaction.mjs`（Node 22，仅内置模块；启 `_serve.mjs` + headless Chrome CDP）
- 原始数据：`_audit-interaction.json` / `_audit-interaction.txt`（按路由 + 去重聚合双份）
- 复跑：`node _audit-interaction.mjs`（约 60s，输出重定向到文件再读）
- 覆盖：21 条路由 × 3,266 个可见文本节点（对比度）+ 247 次真实 Tab 焦点采样 + 41 个唯一触控元素 + CSSOM 全量（719 条规则）
- 未改动任何源码；本报告是唯一新增的交付物

---

## P0 — 可用性 / 合规风险

### P0-1　顶部红色 rail 的次要文字对比度只有 2.72:1（要求 4.5:1）

| 项 | 实测 |
|---|---|
| 出现页面 | **21/21**（`/`、`/about/`、`/about/how-we-vet-factories/`、`/case-studies/`、`/case-studies/sample-creator-yiwu/`、`/case-studies/appliance-shortlist-ningbo/`、`/contact/`、`/destinations/`、4 个目的地页、2 个行业页、`/privacy/`、`/services/`、4 个服务页、`/404.html`） |
| 元素 selector | `div.rail__facts > span.rail__fact`（及 `.rail__fact a`） |
| 文本 | `"China Time GMT+8"`、`"Response within one business day"` 等（每页 2 处） |
| 实测值 | 前景 `#b4b9c3` / 背景 `#d0202a` → **2.72:1**；font-size 14.6px、font-weight 500 → 非大文本，阈值 4.5:1 |

**根因**：`src/styles/tokens.css:222` 的 `--on-inverse-text-secondary: #B4B9C3` 注释写的「8.92:1」是相对**近黑底 #1A1917** 算的（同文件 221 行 `--on-inverse-text` 同此）。但 `src/styles/components.css:376` 的 `.rail` 背景是 `var(--color-accent)` = 牛血红 `#D0202A`，这个 token 挪到红底上就崩了。

**改法**（选一，不要改 token 本身——其他反色区块还靠它在近黑底上工作）：
- `src/styles/components.css:407` `.rail__fact { color: var(--on-inverse-text-secondary); }` 和 `:408` `.rail__fact a` → 改成 `#FFFFFF`（5.35:1）或 `rgba(255,255,255,0.92)`（≈4.6:1，刚过线、视觉更柔）
- 更干净：新增 `--on-accent-text-secondary: #FFFFFF`，只给 rail 用

---

### P0-2　390px 下 2 条路由横向溢出（页面可左右拖动）

| 路由 | clientWidth | scrollWidth | 溢出 | 越界元素数 |
|---|---|---|---|---|
| `/destinations/` | 390 | **458** | +68px | 14 |
| `/industries/beauty-packaging/` | 390 | **426** | +36px | 17 |

越界元素（两条路由同构）：
```
div.split-7-5 > div                L=20 R=458 w=438   pos=static
div > h1                           L=20 R=458 w=438
div > p.lead.hero__lead            L=20 R=458 w=438
div > div.btn-row                  L=20 R=458 w=438
div.btn-row > a.btn.btn--primary   L=20 R=458 w=438   white-space=nowrap
div.split-7-5 > div.hero__media    L=20 R=458 w=438
```

**根因**：`src/styles/components.css:45` `.btn { white-space: nowrap; }` 不允许换行，而这两页的 hero CTA 文案很长（`/destinations/` 是 `"Tell us your category — we'll name the city"`，`/industries/beauty-packaging/` 是 `"Plan a beauty & packaging factory visit"`）。按钮的 min-content 宽度（438 / 406px）通过 grid 子项默认的 `min-width: auto` 顶穿了 350px 的容器。1440 下 delta=0，只有 390 触发——所以是纯移动端问题。

**改法**：
1. `src/styles/base.css:195` `.split-7-5` 增加 `> * { min-width: 0; }`（阻断 min-content 顶穿，最小侵入）
2. 或在 ≤480px 断点给 `.btn` 放开 `white-space: normal`（注意：`components.css:44` 的注释说明 nowrap 是为了避免移动端「药丸按钮换行变成两个 chip」，所以优先选方案 1，或只给 `.btn-row--stack .btn` 放行换行并同时缩短文案）

---

### P0-3　触控目标 < 44px（390×844），6 类、41 个唯一元素，21/21 路由命中

按「实例数 × 路由数」排序（已排除正文行内链接，每条路由平均排除 19 个内联链接）：

| 元素 | 实测尺寸 | 实例 | 命中路由 | 建议改的文件:行 |
|---|---|---|---|---|
| `a.brand`（页头 + 页脚 logo） | 165×**28** | 42 | 21/21 | `components.css` `.brand` 块加 `padding-block: 8px`（不动 28px 视觉高度） |
| `a.link-arrow`（各类 CTA 箭头链接） | 高 **22–30**（如 `div.service-card__cta > a.link-arrow` 192×26、`p.split-card__cta > a.link-arrow` 279×30、`p.redflags__foot > a.link-arrow` 266×22） | 32 | 10 | `components.css:1116` `.link-arrow` 块加 `min-height: 44px`（已是 inline-flex + align-items:center，加最小高度即可） |
| `a.rail__lead`（顶部 rail 主链接） | 350×**24** | 21 | 21/21 | `components.css:401` 加 `padding-block: 10px` |
| `span.footer__wa > a`（"Ask us for our number"） | 150×**23** | 21 | 21/21 | `.footer__wa a` 加 `padding-block: 10px` |
| `li > a`（面包屑） | 42–106×**23** | 14 | 13 | `components.css:752` `.breadcrumb a` 加 `padding-block: 10px` |
| `.site-header__actions .btn`（页头 CTA "Plan my visit"） | 124×**40** | 21 | 21/21 | `components.css:678` `min-height: 40px` → `44px`（下一行 679 的 ≥1024 断点已经是 44px，只差移动档） |

> 注：`label.radio-chip > input` 这类视觉隐藏的原生控件已改按其 `<label>` 命中区测量，实测均 ≥44px，**无问题**（见文末）。

---

## P1 — 明显糙感

### P1-1　`.link-arrow` hover 变色是硬跳变（完全无 transition）

- 出现页面：**11 条路由**——`/`、`/about/how-we-vet-factories/`、4 个目的地页、`/services/`、`/services/brand-sourcing-visit/`、`/services/on-site-support/`、`/services/on-site-support/filming-coordination/`、`/404.html`
- 实测：`transition-duration = 0s`、`transition-property = all`（即浏览器默认值，没写过渡）；hover 改 `color`
- 现有代码只给箭头图标写了过渡：`components.css:1123` `.link-arrow svg { transition: transform ... }`——所以**图标平滑位移，文字颜色瞬变**，两者不同步，正是「糙」的来源
- **改法**：`src/styles/components.css:1116` 的 `.link-arrow { ... }` 块内加一行
  ```css
  transition: color var(--duration-instant) var(--ease-out);
  ```
  （顺带：`components.css:653` 还有一条早期 `.link-arrow { font-size; color }` 定义，可合并进 1116 块消除双定义）

### P1-2　`.footer__nav a` hover 无过渡

- 出现页面：**21/21**（页脚导航每条路由都在）
- 实测：`transition-duration = 0s`；`components.css:2075` `.footer__nav a:hover { color: #FFFFFF; ... }`
- **改法**：`components.css:2074` `.footer__nav a { ... }` 加 `transition: color var(--duration-instant) var(--ease-out);`

### P1-3　按下反馈（`:active`）大面积缺失——按下去没有任何变化

全站 CSSOM 里只有 **4 条** `:active` 规则，且只覆盖主按钮：

```
.btn--primary:active            { background: var(--action-bg-pressed); ... transform: translateY(0); box-shadow: none; }
.btn--second:active             { transform: translateY(0); box-shadow: none; }
.hero-full .btn--primary:active { color: ...; background: rgb(223,228,235); }
.hero--inverse .btn--primary:active { box-shadow: none; transform: translateY(0); }
```

未覆盖（数字 = 命中该元素的路由数）：

| 元素 | 路由数 | 建议改的文件:行 |
|---|---|---|
| `.nav-trigger`（下拉触发按钮） | 21 | `components.css:573` 附近加 `:active { color: var(--color-accent); }` |
| `.nav-link`（主导航链接） | 21 | `components.css:667` 附近加 `:active { opacity: .7; }` |
| `.btn--secondary`（描边按钮） | 17 | `components.css:90` 加 `:active { background: var(--color-surface-sunken); }` |
| `.related-nav a` | 13 | `components.css:2381` 块加 `:active { transform: translateY(-1px); }` |
| `.link-arrow` | 11 | `components.css:1116` 块加 `:active { opacity: .7; }` |
| `.faq-item__q`（FAQ 折叠条） | 5 | `components.css:1692` 加 `:active { background: var(--surface-sunken); }` |
| `.service-card` | 4 | `components.css:1049` 块加 `:active { transform: translateY(-1px); }` |
| `.split-card` | 2 | `components.css:915` 块加 `:active { transform: translateY(-1px); }` |
| `.case-card` | 2 | `components.css:1596` 块加 `:active { transform: translateY(-1px); }` |

统一原则：卡片类 hover 是 `translateY(-4px)`，`:active` 收到 `-1px`（比 hover 收敛但不到 0），配合已有的 `transition: transform` 就能读出「按下去 → 弹起来」的手感。

---

## P2 — 锦上添花

### P2-1　卡片 hover 改了 `color`，但 transition 列表里没有 `color`

- `.related-nav a`（**13 条路由**）：`transition-property = border-color, box-shadow, transform`（220ms），而 `components.css:2396` `.related-nav a:hover` 还改了 `color` → 边框/阴影/位移平滑，文字颜色瞬变
- `.case-card`（**2 条路由**：`/case-studies/`、`/services/creator-factory-tour/`）：`transition-property = border-color, box-shadow, transform`；卡片本身是 `<a>`，被全局 `a:hover` 改了 `color` → 同样瞬变
- **改法**：`components.css:2381`（`.related-nav a`）和 `components.css:1596`（`.case-card`）的 `transition` 列表各补一项 `color var(--duration-fast) var(--ease-out)`

### P2-2　`.breadcrumb a` hover 无过渡

- 出现页面：**13 条路由**（`components.css:752-753`）
- **改法**：`components.css:752` 加 `transition: color var(--duration-instant) var(--ease-out);`

### P2-3　`/services/` 卡片正文里的内嵌链接只有 18px 高

- 元素：`ul.split-card__bullets > li > span > a`（如 "Creator factory tour" 133×18、"How we vet factories" 140×18），6 个实例，仅 `/services/`
- 说明：这些是夹在正文/列表文字里的行内链接，按「排除正文行内链接」的规则本可豁免，我保留在此供你判断
- **改法**（若要做）：给 `.split-card__bullets a` 加 `padding-block: 6px; display: inline-block;`

---

## 已确认没问题的项（不要再花时间）

1. **焦点可见性：完全达标，不要动。** 用真实 Tab 键走查（不是 `el.focus()`——程序化聚焦下 Chrome 的 `:focus-visible` 恒为 false，会得出完全错误的结论），21 条路由共 **247 次采样**：
   - **0 个**元素缺失可见焦点环，全部为 `outline: 2px solid rgb(208, 32, 42)`
   - `:focus-visible` 命中率 100%（247/247）
   - 覆盖到 skip-link、rail 链接、logo、nav-trigger、下拉项、主/次按钮、hero CTA、split/service/case 卡片、面包屑、FAQ summary、radio-chip、input/select/textarea、related-nav、404 动作区
   - CSSOM 里有 9 条 `:focus` 规则、4 条 `:focus-visible` 规则，**没有任何 `outline: none` 抹除规则**
2. **1440×900 横向溢出：21/21 路由 delta = 0。** 溢出只存在于 390px 的 2 条路由（见 P0-2）。
3. **图片 alt：0 问题。** 全站只有 1 个 `<img>`（在 `/`），无缺失 alt、无空 alt、无 "placeholder/unsplash/sample" 之类占位文案。
4. **主要按钮/卡片的 hover 过渡都已覆盖**——`.btn` / `.btn--primary` / `.btn--second` / `.btn--secondary` / `.btn--whatsapp`（150ms）、`.service-card` / `.split-card` / `.related-nav a` / `.case-card`（220ms）、`.nav-link` / `.nav-trigger`（80ms）、`.chip` / `.wa-fab` / `.faq-item__q`。
   > 我第一版脚本曾把 `.btn`、`.service-card`、`.faq-item__q` 等误报为「background/color 未覆盖」——原因是拿 cssText 做子串匹配，`border-color` 被当成 `color`、`--color-surface-subtle` 被当成 `color`。已改为枚举 CSSOM 声明名并把 `border-*-color` / `background` 归一后比对，这些误报已清除。**如果你看到别的工具报这几项，是误报。**
5. **表单控件在 390 下都达标**：`radio-chip` 的隐藏 `input` 按其 `<label>` 命中区测量，均 ≥44px。
6. **over-hero 页头的文字对比度不是问题**：`/` 的页头（logo/nav/CTA）叠在 hero 图层上，祖先链没有背景色，脚本会穿透 `elementsFromPoint` 采样其下方真实绘制层；首版曾误报为「#f5f2ee on #ffffff = 1.12:1」，修正后已排除。

---

## 建议修复顺序

1. **P0-1**（一行改色，全站 21 路由受益，唯一的 AA 合规风险）
2. **P0-2**（`.split-7-5 > * { min-width: 0 }` 一行，修掉 2 条路由的移动端拖动）
3. **P0-3** 里的 `.site-header__actions .btn`（678 行 `40px → 44px`，一行）和 `.link-arrow` 的 `min-height`（1116 行，一行）——这两处占触控问题的绝大多数实例
4. **P1-1 / P1-2**（各加一行 transition，`link-arrow` 那处对「糙感」改善最明显，因为现在图标动、文字不动）
5. **P1-3** `:active`（按上表批量补，卡片类统一 `translateY(-1px)`）
6. P2 三项有余力再做
