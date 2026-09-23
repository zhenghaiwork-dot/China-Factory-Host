# ChinaFactoryHost.com — 内容地图 Gap 对照

> 来源：`D:\Downloads\ChinaFactoryHost.com SEO 与 GEO 完整内容地图.md`
> 生成：2026-09-19 · 对照基线：当前站点（19 个可见页 + API + 404）
> 用途：把「SEO/GEO 内容地图」的 P0 首发清单逐条对照现有站点，标记
> 已有 / 待建 / 需拆分 / 需 301 映射，作为建页执行路线图。
>
> **配套文档：`docs/content-depth-spec.md`（薄页扩写规格）。**
> 2026-09-20 实测发现：站点已扩到 52 路由，但 `<main>` 正文最薄的 7 页只有
> 819–952 字符，4 个受众页完全同模板。**在建新页之前先把这批做实**——
> 本文档管「还缺哪些页」，那份管「已有的页够不够实」。

## 当前路由盘点

## 当前路由盘点

- `/` 首页
- `/about/` · `/about/how-we-vet-factories/`
- `/case-studies/`（7 篇 `[slug]`，field-notes 风格）
- `/contact/`
- `/destinations/` + `yiwu` · `ningbo-hangzhou` · `shenzhen` · `guangzhou-dongguan`
- `/industries/beauty-packaging/` · `/industries/toys-gifts-commodities/`
- `/privacy/`
- `/services/` + `brand-sourcing-visit` · `creator-factory-tour` · `on-site-support`（+ `filming-coordination`）
- `/api/inquiry`（接口，非页面）
- `404`

## 一、已有，直接对应 ✅

| 文档 P0 | 现有 |
|---|---|
| `/` | 首页 |
| `/destinations/yiwu/` | 同 |
| `/destinations/shenzhen/` | 同 |
| `/case-studies/`（field-notes 风格） | 同 |
| `/about/` · `/contact/` | 同 |

## 二、已有但需 301 映射（文档 URL → 现有 URL）

> **2026-09-21 最终拍板（用户）：不拆、不改名。现有 URL 为准。**
>
> 本节经历过方向反转，**以此条为准**：
>
> | 时间 | 决策 | 状态 |
> |---|---|---|
> | 最初 | 现有 URL 作 canonical，文档 URL 301 过来 | **最终采用** |
> | 2026-09-20 | 反转为「文档 URL 作 canonical，现有 URL 301」 | 已作废 |
> | 2026-09-21 | **不拆、不改名**，维持现有 URL | **现行** |
>
> 维持现有 URL 的三条理由：
>
> 1. **内链已打通，改名代价高**：53 个路由、200+ 条正文内链。改名要同步修改所有指向旧
>    URL 的页面，而本项目**没有 git 仓库**——漏改即死链，且无法回滚。
> 2. **拆分必然造薄页**：`ningbo` / `hangzhou` 拆开需要杭州的独立内容，而两地实际是同一趟
>    行程（现有页行程本就是 3–5 天跨两城）；拆开既造薄页，又让买家以为要跑两趟。
>    `guangzhou-dongguan`、`beauty-packaging`、`toys-gifts-commodities` 同理。
> 3. **文档自身矛盾**：它第 9 行写「不要为覆盖关键词批量生成同质页面」，但规划的这套拆分
>    恰恰是在为关键词拆页。
>
> 下表三条 301 **保持不变**——它们的方向本来就是「旧路径 → 现有路径」，与
> 「现有 URL 为准」一致，无需改动。

| 文档 URL | 现有（canonical） | 状态 |
|---|---|---|
| `/services/supplier-verification/` | `/about/how-we-vet-factories/` | 已配置 301 |
| `/services/on-site-factory-support/` | `/services/on-site-support/` | 已配置 301 |
| `/services/factory-filming-coordination/` | `/services/on-site-support/filming-coordination/` | 已配置 301 |

**301 机制已实测可用**（2026-09-20）：`astro.config.mjs` 的 `redirects` 不会在
`dist/client` 生成静态桩页，而是编进 `dist/server/entry.mjs`，由 Node server 在运行时响应。
实测 `PORT=4420 node dist/server/entry.mjs` 后
`curl -I /services/supplier-verification/` → **HTTP 301 → /about/how-we-vet-factories/**。
注意：**只有在 Astro Node server 下才生效**；用纯静态服务器托管时这些路径会 404。

## 三、已有但需拆分（合并页 → 独立页）

> **2026-09-21 拍板：不拆。** 下表仅记录文档规划，**不执行**。理由见第二节。
> 若将来某地的独立内容确实积累到能撑起一整页（而不是把现有页拆成两半），
> 再单独评估——那时是新页，不是拆分。

| 现有合并页 | 文档拆成 |
|---|---|
| `/destinations/ningbo-hangzhou/` | `ningbo` + `hangzhou` |
| `/destinations/guangzhou-dongguan/` | `guangzhou` + `dongguan`（+ 新增 `foshan-shunde`） |
| `/industries/beauty-packaging/` | `beauty-personal-care`(P1) + `packaging-printing`(P1) |
| `/industries/toys-gifts-commodities/` | `toys`(P1) + `small-commodities-gifts`(P0) |

## 四、真正空白，需新建 🆕

- **顶层枢纽**：`/factory-visits/` · `/china-sourcing-trips/` · `/sourcing-support/` · `/how-it-works/` · `/pricing/` · `/faq/` · `/plan-my-trip/`
- **服务页**：`existing-supplier-visits` · `factory-matching` · `factory-visit-planning` · `factory-visit-interpreter`
- **目的地**：`zhejiang`（总页）· `shaoxing-keqiao` · `foshan-shunde`
- **行业**：`/industries/`（**索引页缺失**）· `electronics-smart-hardware` · `textiles-fabrics` · `furniture-home-furnishing` · `small-home-appliances`
- **受众**：`/who-we-help/first-time-buyers` · `brand-founders` · `procurement-teams` · `creators`
- **指南**：`how-to-plan-a-china-factory-visit` · `china-factory-visit-checklist` · `factory-vs-trading-company` · `factory-visit-vs-audit-vs-inspection` · `can-you-film-inside-a-chinese-factory`
- **工具**：`china-manufacturing-hub-finder` · `factory-visit-scorecard`

## 五、现有站有、文档未列

- `/privacy/`（文档要 terms / privacy / cookies 三件，现仅 privacy）
- `/api/inquiry`

## 关键发现

1. `/industries/` 索引页不存在 —— 导航有「Industries」下拉但无 hub 页（`/destinations/` 有索引，`/industries/` 没有）。
2. 无独立 `pricing` / `how-it-works` / `faq` —— 询盘前的信任页全部缺失。
3. 无 `zhejiang` 总页、无 `who-we-help` 受众分流。

## 执行顺序

1. **第一批（枢纽 + 信任，动线闭环）**：`/industries/` · `/factory-visits/` · `/china-sourcing-trips/` · `/how-it-works/` · `/pricing/` · `/faq/` · `/plan-my-trip/`
2. **第二批（空白强意图服务）**：`existing-supplier-visits` · `factory-matching` · `factory-visit-planning` · `interpreter`
3. **第三批（拆分 / 改名）**：目的地与行业拆分，需先定 URL 策略（重命名 vs 301）
4. **第四批（内容型）**：`who-we-help/*` · `guides/*` · `tools/*`

## 执行进度（2026-09-19 · 已全部完成）

**已建（28 个新页）**

- 枢纽/信任：`/factory-visits/` · `/china-sourcing-trips/` · `/industries/` · `/how-it-works/` · `/pricing/` · `/faq/` · `/plan-my-trip/`
- 服务：`/services/existing-supplier-visits/` · `factory-matching` · `factory-visit-planning` · `factory-visit-interpreter`
- 目的地：`/destinations/zhejiang/` · `shaoxing-keqiao` · `foshan-shunde`
- 行业：`/industries/electronics-smart-hardware/` · `small-home-appliances` · `textiles-fabrics` · `furniture-home-furnishing`
- 受众：`/who-we-help/first-time-buyers` · `brand-founders` · `procurement-teams` · `creators`
- 指南：`/guides/how-to-plan-a-china-factory-visit` · `china-factory-visit-checklist` · `factory-vs-trading-company-china` · `factory-visit-vs-audit-vs-inspection` · `can-you-film-inside-a-chinese-factory`
- 工具：`/tools/china-manufacturing-hub-finder` · `factory-visit-scorecard`

**301 映射（4 条）**：`/services/supplier-verification/` → how-we-vet · `/services/on-site-factory-support/` → on-site-support · `/services/factory-filming-coordination/` → filming-coordination · `/sourcing-support/` → `/services/`

## 照片占位状态（2026-09-21 · 全量铺满完成）

**口径修正**：占位实测 **75 个 / 50 路由**（此前"450 个"为统计错误，勿再引用）。

**最终状态：74 个真实照片 / 50 个路由，空底片仅剩 1 个，全站同页重复 0。**

- 资产：`public/images/onsite/onsite-01..10.jpg` + `@700.jpg` 两档（mozjpeg q78，共 ~1.4MB）
- 单一事实源：`src/data/onsite-photos.ts`（尺寸表 + alt + `pickPhoto` 确定性随机 +
  `pickUnique(seeds, exclude)` 同页去重）
- 调用层：页面写 `<PhotoSlot><OnsitePhoto id="NN" /></PhotoSlot>`，或交给共享组件
  （DestinationPage / IndustryPage / Timeline / CaseCard / [slug] 画廊）按 seed 自动分配
- 跨块协调：页面用 `exclude` 把 hero 已占用的照片传给 Timeline / CaseCard，
  保证一页之内同一张图不出现两次（`_dupcheck2.cjs` 程序化验证）
- `PhotoSlot` 有 child 时不输出 `data-placeholder`，上线前 grep 只找到真空位

**唯一保留的空位**：`/about/how-we-vet-factories/` 的 `VETTING-CHECKLIST-COVER`
（--doc 竖版 1:1.414，横幅照片裁进去会毁掉构图，需要真正的封面设计稿）。

**alt 文案**只描述画面可见内容，不断言城市/工厂。用户已确认照片的肖像/版权授权；
未来替换为按城市/行业精确匹配的照片时，只需更新 `onsite-photos.ts` 的表与文件。

**有意保留合并页（未拆分，遵循「不应拆页」规则）**：`ningbo-hangzhou` · `guangzhou-dongguan` · `beauty-packaging` · `toys-gifts-commodities`（拆分留待数据证明意图分化后再做）

站点从 19 个可见页增长到约 47 页。
