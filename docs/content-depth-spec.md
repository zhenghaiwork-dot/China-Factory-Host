# 薄页扩写规格

> 面向执行者（内容构建 agent）的工作指令。
> 2026-09-20 由接线层实测数据反推；测量方法见文末「验收」。

## 一、为什么要扩写

站点现有 52 个路由，但 `<main>` 正文字符数分布极不均衡：

| 档位 | 页数 | 代表页 |
|---|---|---|
| 8000+ | 4 | `/about/how-we-vet-factories/` 9729、`/services/brand-sourcing-visit/` 8739、`/services/on-site-support/filming-coordination/` 8403、`/services/creator-factory-tour/` 8326 |
| 4000–6000 | 9 | `/industries/*`、`/destinations/*`、`/factory-visits/` |
| **1400–2100** | **14** | hub 页、指南页、转化页 |
| **819–952** | **7** | **4 个受众页 + 2 个工具页 + `/case-studies/`** |

最薄的 4 个受众页只有 **819 / 829 / 845 / 852** 字符（约 140 词），而且结构完全同模板：
H1 各不相同，H2 一律是 `What changes for X` + `Where X usually begin`。
这是文档第 9 行明确反对的形态——"为了覆盖关键词而批量生成同质页面"。

**在这批页面做实之前继续加页，只会把薄页从 7 个变成 23 个。**

---

## 二、需要扩写的清单

按优先级排序。字符数 = 当前 `<main>` 正文长度，目标值为下限。

### P0 — 受众页（4 个，最薄且完全同模板）

| 页面 | 当前 | 目标 |
|---|---|---|
| `/who-we-help/first-time-buyers/` | 819 | **≥ 3000** |
| `/who-we-help/creators/` | 829 | **≥ 3000** |
| `/who-we-help/procurement-teams/` | 845 | **≥ 3000** |
| `/who-we-help/brand-founders/` | 852 | **≥ 3000** |

### P0 — 主转化页

| 页面 | 当前 | 目标 | 备注 |
|---|---|---|---|
| `/plan-my-trip/` | 1463 | **≥ 2500** | 全站主转化页，目前比很多内容页还薄 |

### P1 — 工具页（2 个）

| 页面 | 当前 | 目标 | 备注 |
|---|---|---|---|
| `/tools/china-manufacturing-hub-finder/` | 943 | **≥ 2500** | 除文字外必须有真实可用的匹配逻辑 |
| `/tools/factory-visit-scorecard/` | 905 | **≥ 2500** | 同上 |

### P1 — hub 页（4 个）

| 页面 | 当前 | 目标 |
|---|---|---|
| `/case-studies/` | 877 | **≥ 2000** |
| `/destinations/` | 1428 | **≥ 2200** |
| `/industries/` | 1542 | **≥ 2200** |
| `/tools/` | 1771 | **≥ 2200** |

### P2 — 服务页与指南页（10 个）

| 页面 | 当前 | 目标 |
|---|---|---|
| `/guides/china-factory-visit-checklist/` | 946 | ≥ 3000 |
| `/guides/how-to-plan-a-china-factory-visit/` | 1170 | ≥ 3000 |
| `/guides/can-you-film-inside-a-chinese-factory/` | 1328 | ≥ 3000 |
| `/guides/factory-vs-trading-company-china/` | 1423 | ≥ 3000 |
| `/services/factory-matching/` | 1640 | ≥ 6000 |
| `/services/factory-visit-interpreter/` | 1753 | ≥ 6000 |
| `/services/existing-supplier-visits/` | 1782 | ≥ 6000 |
| `/how-it-works/` | 1808 | ≥ 3500 |
| `/services/factory-visit-planning/` | 1833 | ≥ 6000 |
| `/who-we-help/`（hub） | 1991 | ≥ 2200 |

> 服务页目标定 6000 是因为已有同类页（`/services/brand-sourcing-visit/` 8739）就是这个量级，
> 新服务页明显低于同组水准会被判为薄内容。

---

## 三、扩写方式：回答真问题，不要套句式

**这是本规格最关键的一条。**

上面 4 个受众页之所以雷同，不是因为字数少，而是因为它们是"同一个句式换了主语"生成的。
所以扩写时**禁止沿用 `What changes for X` / `Where X usually begin` 这类可替换模板**。

每页按下面「必须回答的问题清单」组织内容。问题是按页面角色定制的，不是通用的，
因此写出来的段落结构天然就会不同。

### `/who-we-help/first-time-buyers/` 必须回答

1. 第一次来的人最常犯的 3–5 个错误，要具体到行为（例：把 5 家工厂排进一天；把义乌市场的摊位当成工厂；到了才让工厂准备样品间）。
2. 首次行程合理的天数与每天工厂数量上限，以及为什么是这个数。
3. 签证 / 支付 / 网络 / 住宿哪些必须提前解决，哪些可以落地解决。
4. 首次买家的典型期望偏差：MOQ、打样周期、报价有效期。
5. 我们在首次行程里具体做什么（可逐日写）。
6. **什么情况下我们会劝你先别来**（例如只是想在阿里巴巴上比价、还没确定品类）。

### `/who-we-help/brand-founders/` 必须回答

1. 私标（private label）的真实门槛：MOQ、模具费、包装起订量分别卡在哪一步。
2. 从打样到量产的现实周期，以及哪些环节最容易拖。
3. 品牌方最常踩的坑（把包装厂当产品厂、商标与备案、配方与包材分属两家厂）。
4. 小批量试单到底能不能做，边界在哪。
5. 我们在其中具体承担什么，不承担什么。

### `/who-we-help/procurement-teams/` 必须回答

1. 一份可比较的 RFQ 需要哪些字段（给字段清单，不是泛泛说"要详细"）。
2. 评分卡怎么定权重，不同品类权重的差异。
3. 一天 realistically 能看几家，管理层会议安排在第几天。
4. 我们做的现场核查与社会合规审厂（audit）的区别——链到 `/guides/factory-visit-vs-audit-vs-inspection/`。
5. 交付物清单：报告里到底有什么（链到 `/tools/factory-visit-scorecard/`）。

### `/who-we-help/creators/` 必须回答

1. 拍摄许可的真实边界：工厂有权拒绝、车间禁拍区的常见范围、需要提前多久申请。
   提前期必须引用 `FILMING_LEAD_TIME` 常量（见第五节）。
2. 能拍什么、不能拍什么（产线、工人肖像、客户产品、模具）。
3. 素材交付方式、保密协议的现实情况。
4. 现场电力、网络、设备进场的具体限制。
5. 我们在拍摄协调里做什么（链到 `/services/on-site-support/filming-coordination/`）。

### 工具页额外要求

`/tools/` 下两个页面不能只是"介绍一个工具"的文字页：
- `china-manufacturing-hub-finder`：必须有可用的匹配逻辑（品类 → 材料 → 数量 → 定制程度 → 建议区域 + 候选路线）。
  至少覆盖文档列出的主要产业带，给出一个能跑通的判定表或交互。
- `factory-visit-scorecard`：必须给出可下载/可打印的评分维度（文档要求"六个维度"），并说明每个维度怎么打分。

### 各页共同的收尾要求

每页结尾必须给出该角色/话题下的**下一步**，并至少链向：
- 一个服务页
- 一个相关指南或工具页
- `/plan-my-trip/` 或 `/contact/`（转化出口）

---

## 四、禁止事项

1. **禁止编造数字。** 价格、天数、MOQ、周期——要么引用 `src/data/site.ts` 的常量，
   要么写成带条件的区间并说明前提，要么留占位并标注 `data-placeholder`（照项目现有做法）。
   没有依据的精确数字是最快毁掉可信度的方式。
2. **禁止跨页复制段落。** 每个 H2 下的内容必须是该页独有的。
   验收时会检查同类页面之间是否有重复 H2 与重复整段。
3. **禁止泛泛而谈。** "我们提供专业的服务""丰富的经验"这类句子不计入实质内容，也不要写。
4. **禁止为了凑字数注水。** 目标值是下限不是 KPI；如果某个问题确实没有可公开的信息，
   就明确写边界（"这取决于 X，我们不公开 Y"），而不是编。
5. **不要新增 CSS class。** 只用现有组件（见第五节）。

---

## 五、技术约束（违反会导致构建失败）

1. 构建命令必须是 `CODEBUDDY_SAFE_DELETE_ENABLED=0 npx astro build`
   （不加前缀会因沙箱拦截 dist 清空而 exit 非 0，那是环境问题不是代码问题）。
2. `trailingSlash: 'always'` —— 站内 href 一律以 `/` 结尾。
3. Astro 7 用 Rust 编译器，所有标签必须闭合。
4. **不要在内联属性表达式里写模板字符串**（会报 `CompilerError: Unexpected token`）——
   先在 frontmatter 算好常量再引用。
5. 文案中的响应时间、报告交付时间、拍摄提前期**必须引用 `src/data/site.ts` 常量**：
   `REPLY_TIME` / `REPLY_TIME_SHORT` / `REPLY_TIME_PROMISE` / `REPLY_TIME_MICRO`、
   `REPORT_TURNAROUND` / `REPORT_TURNAROUND_SHORT` / `REPORT_TURNAROUND_PROMISE`、
   `FILMING_LEAD_TIME` / `FILMING_LEAD_TIME_SHORT`。**不得硬编码数字。**
6. 只使用已有组件与 class：`Section`、`SectionHead`、`PhotoSlot`、`Icon`、`ServiceCard`、
   `VetLink`、`RelatedNav`、`Checklist`、`Caveat`、`FAQ`、`ProcessSteps`、`FactGrid`、
   `ComparisonTable`、`Timeline`、`NoteStrip`、`Testimonial`、`spec-list`、`related-nav`、
   `btn-row`、`btn`、`link-arrow`。**不要写内联 style，不要引入不存在的新 class。**
7. 不要修改 `src/styles/*.css`、`src/data/site.ts`、`src/components/*`,
   以及 `src/pages/guides/`、`src/pages/tools/`、`src/pages/who-we-help/` 三个目录下的
   `index.astro`（hub 页，接线层已建）。**本项目没有 git 仓库，覆盖无法恢复。**
8. 改动前先 Read 一遍目标文件——可能有别人在并发编辑。

---

## 六、验收

执行方自测，接线层复核。

1. `CODEBUDDY_SAFE_DELETE_ENABLED=0 npx astro build` → exit 0。
2. 每页 `<main>` 正文字符数达到第二节目标值。测量脚本思路：
   取 `dist/client/**/index.html`，截取 `<main>…</main>`，去掉 `<script>`，
   去掉所有标签，合并空白后计字符数。
   （本机 shell PATH 常损坏，用 PowerShell + `node xxx.cjs` 跑；`.mjs` 会被当 ESM，
   `require` 不可用。）
3. 同类页面之间无重复 H2、无重复整段。
4. `node _audit-interaction.mjs` → 对比度 0、触控 0、溢出 0、焦点 0 缺失。
   （该脚本已改为自动扫描 `dist/client`，新增页会自动纳入。）
5. 全文 grep 检查：响应/报告/拍摄时间均为常量输出，无裸数字。

---

## 七、做完之后 —— 方向已于 2026-09-20 修正

**这批页面做实后，不要立刻建新页。**

扩写完成后实测（53 路由）：

| 指标 | 实测 |
|---|---|
| 「内容内链」< 5 条的页面 | **48 / 53** |
| 正文内链为 0 的页面 | **13** |
| 叶子内容页最高内链数 | 4，且**几乎全部来自 related-nav 入口块** |

即：字数已经达标，但**正文句子里几乎没有上下文锚文本**。此时继续新建页面，
只会把「互不相认的页面」从 48 个放大到 56 个，而这正是 GEO 最吃亏的地方
（AI 读正文时看不到语义关联）。连接性的边际收益远高于页面数量。

### 修正后的优先级

1. **上下文内链补齐**（最高优先级）
   - 叶子内容页正文内链 ≥ 6 条，hub 页 ≥ 8 条；指向 `/contact/`、`/plan-my-trip/` 不计入。
   - 链接必须是**正文句子里的描述性锚文本**。
     **禁止**在页尾另起「Related links」区块充数——那只是 related-nav 的复制品。
   - 同一页内同一目标不超过 2 次；每页链接覆盖 ≥ 3 个不同目录。
2. **结构化数据**（组件层改动，由接线层执行）
   - `src/components/FAQ.astro` 改为输出 FAQPage schema —— 一次覆盖 15 页，当前仅首页有。
   - 8 个 `/services/**` 加 Service schema（当前全站为零）。
3. **三个 hub 扩写** —— 接线层已于 2026-09-20 完成：
   `/tools/` 1771→3268、`/who-we-help/` 1991→3495、`/guides/` 2103→3485，
   各带 6–8 条正文内链。**不在本规格执行方的任务范围内。**

### 上述全部做完后

再回到 `docs/content-gap.md` 补缺失集群，顺序：
`/itineraries/`（8 个行程页，与现有页面零重叠，文档判定 GEO 价值最高）
→ `/who-we-help/` 补 3 个（ecommerce-sellers / importers-wholesalers / product-engineering-teams）
→ `/tools/` 补 4 个 → `/sourcing-scenarios/`（**需先定与 `/services/` 的边界**）。
