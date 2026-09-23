# ChinaFactoryHost — 品牌命名建议

生成时间：2026-09-19 · 查询方式：RDAP 实时注册状态（rdap.org）+ 竞品名检索

## 一、域名实测状态（证据）

| 域名 | 状态 | 备注 |
|---|---|---|
| bootsonthefloor.com | **FREE** | 首选候选可用 |
| shopfloorchina.com | **FREE** | 可用（但锁 China） |
| chinafactoryfloor.com | **FREE** | 可用（太长） |
| verifyfloor.com | **FREE** | 可用（偏工具感） |
| floorguests.com | **FREE** | 可用（主客关系弱） |
| thelinefloor.com / openlinefloor.com / floorverified.com | FREE | 备选 |
| groundcrew.com | TAKEN | 且有 4 家同名不同行业公司（AU 品牌工作室 / US 园林 / 芝加哥拆除 / 澳洲土壤），商标风险高 |
| theshopfloor.com | TAKEN | 已有持有者 |
| realfloor.com / truefloor.com / floorline.com / plantfloor.com / sourcefloor.com / floorproof.com / factorypass.com / walkthefloor.com / bootsontheground.com / thefactoryfloor.com / chinafloor.com / industryfloor.com / floorkey.com / linelevel.com / factorykey.com | TAKEN | 不可用 |

## 二、现有名 ChinaFactoryHost 的判断

**优点**：SEO 精准（China + factory 品类词），一眼看懂。
**问题**：
1. 四个词，口头传播成本高 —— 这是一个创作者要在镜头里念出来给观众听的名字。
2. `Host` 歧义：web hosting / 主持人 / 招待，第一次听到容易误判行业。
3. 泛词组合不可独占，和竞品（China Business Solution、LeelineGroup、OGPS Group、ForeignGo）同一类 SEO 堆词风格。
4. 地理锁死：将来扩到越南/印度要再换一次。

## 三、推荐（Top 3）

| # | 品牌名 | 域名 | 为什么适合 | 风险 |
|---|---|---|---|---|
| 1 | **Boots on the Floor** | bootsonthefloor.com（FREE） | ① idle-domain 已被证 (<24h)② 英语母语者一听就懂 ="真人到场" ③ 对 creator 场景是天然口号（要在视频里说、要有画面）④ 不带 China，可扩到其他国家 | 稍长；可能造成 bootsonthefloor / boots-on-the-floor 拼写疑虑 |
| 2 | **ShopFloor** (+ China) | shopfloorchina.com（FREE） | 采购专业术语 "shop floor"=生产现场，在采购/工厂这群人里是最权威的词，SEO 也不错 | "China" 锁地；shopfloor.com 已被占，只能用带 China 的变体 |
| 3 | **The Floor Line** / openlinefloor | thelinefloor.com（FREE） | "line"=产线，同时暗示 "过程、流程"，短、易读 | 记忆点弱于 Boots on the Floor |

## 四、决策：URL 不改（域名已确定），结论改为「这个名字怎么用」

用户在 19:27 拍板：**chinafactoryhost.com 保留**。上面第三节的改名建议作废，
但「让名字更好用」的三件事仍然成立，其中第一件已落地：

### 4.1 已落地 — 字标三段式切分（2026-09-19）

原本整个品牌名是一串 15px 驼峰 `ChinaFactoryHost`，眼睛读成三个泛词，
而**唯一的红色落在 "Host" 上**——品牌唯一的红色被用来强调最容易被误读成
「虚拟主机 hosting」的那个音节。现在改为：

| 片段 | 颜色 | 字重 | 语义角色 |
|---|---|---|---|
| China | 次要墨色 #4A4642 | 400 | 是背景信息，不是卖点，让它后退 |
| **Factory** | 主墨色 #1A1917 | **700** | 这门生意讲的就是它，最重 |
| Host | 品牌红 #D0202A | 600 | 我们在做什么——带你进去、陪着你 |

浅色页头与深色页脚两档都已 Montgomery 数值验证（对比度：白底 9:1、#1A1917 上 5.4:1）。
改动落在：`Header.astro` / `Footer.astro` / `components.css` 的 `.brand__geo|core|host`，
**注意**：任何深色落点的覆盖规则必须把这**三个** span 都写上，否则新加的 span 不会被父规则带到
（这正是当初 `.brand__host` 在 hero scrim 上隐形的老坑）。

### 4.2 待选 — 一句 tagline（未落地，等你挑）

名字不改的情况下，解释「Host 是什么」的成本可以由一句副标承担。候选：
1. `Factory visits, hosted.` —— 最短，重复词根形成记忆点
2. `On the floor, with you.` —— 强调陪伴与现场，更有人味，适合 creator
3. `We take you inside.` —— 动作感最强，但略像旅行社

### 4.3 规范 — 一律连写

全站已统一为连写 `ChinaFactoryHost`（已核验：无 `China Factory Host` 分写出现），
新页面、邮件签名、社媒简介都照此写。

## 五、若将来决定改名的落地清单（存档）
1. 立即注册域名 + 同名社媒/YouTube/X 用户名（creator 传播依赖用户名一致）
2. 商标：先查 USPTO / EUIPO 同名服务业类目（域名空≠商标空）
3. 代码侧改动：`src/data/site.ts` 的 `SITE` / `SITE_URL`、public 下的 favicon.svg / og-default.svg、文案与 alt 中的品牌提及
4. Logo 重做
