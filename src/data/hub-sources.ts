/** Public evidence for regional activity, not supplier endorsements or live quotes.
 * Read alongside docs/manufacturing-hub-finder-handoff.md before editing. */
export interface HubSource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  supports: string;
  limitation: string;
  reviewed: string;
}

export const HUB_DATA_VERSION = '2026-10-14.1';
export const HUB_REVIEWED = '2026-10-14';

export const HUB_SOURCES: Record<string, HubSource> = {
  yiwu: {
    id: 'yiwu', title: 'Yiwu market categories', publisher: 'Chinagoods · China Commodities City Group',
    url: 'https://en.chinagoods.com/?language=default',
    supports: 'The market operator lists stationery, festival goods, toys and household goods in Yiwu.',
    limitation: 'Market listings do not establish where a seller manufactures, or its MOQ.', reviewed: HUB_REVIEWED,
  },
  huangyan: {
    id: 'huangyan', title: 'Huangyan mould industry pilot enterprises', publisher: 'Huangyan district government',
    url: 'https://www.zjhy.gov.cn/art/2024/7/24/art_1621869_59110425.html',
    supports: 'A district programme identifies local mould and moulding enterprises.',
    limitation: 'Programme participation does not prove a supplier can make your part.', reviewed: HUB_REVIEWED,
  },
  flask: {
    id: 'flask', title: 'Vacuum flask production investment disclosure', publisher: 'Zhejiang Haers · listed-company disclosure',
    url: 'https://static.cninfo.com.cn/finalpage/2025-03-06/1222722096.PDF',
    supports: 'The company disclosure describes Yongkang as a vacuum flask manufacturing base.',
    limitation: 'This is regional background, not a recommendation of the company or an order offer.', reviewed: HUB_REVIEWED,
  },
  fans: {
    id: 'fans', title: 'Cixi fan and heater manufacturing example', publisher: 'Ningbo Nice / Cixi Will · manufacturer',
    url: 'https://nice.ltd/',
    supports: 'A manufacturer publishes fan and heater products and a Cixi factory address.',
    limitation: 'Supplier self-description shows a research lead; capacity and certifications need independent checks.', reviewed: HUB_REVIEWED,
  },
  heaters: {
    id: 'heaters', title: 'Cixi heater manufacturer listing', publisher: 'China Chamber of Commerce for Import and Export of Machinery and Electronic Products',
    url: 'https://cixi.cccme.org.cn/shop/cx012/index.aspx',
    supports: 'The chamber lists a Cixi manufacturer of heaters.',
    limitation: 'A directory entry is not an audit or a current quotation.', reviewed: HUB_REVIEWED,
  },
  blenders: {
    id: 'blenders', title: 'Cixi blender manufacturer listing', publisher: 'China Chamber of Commerce for Import and Export of Machinery and Electronic Products',
    url: 'https://cixi.cccme.org.cn/shop/cccme10258/index.aspx',
    supports: 'The chamber lists blenders and food processors from a Cixi manufacturer.',
    limitation: 'Confirm the exact model, actual factory and current production arrangements.', reviewed: HUB_REVIEWED,
  },
  pcb: {
    id: 'pcb', title: 'Bao’an PCB industry overview', publisher: 'Bao’an district · Shenzhen government',
    url: 'https://www.sz.gov.cn/szzt2010/yhyshj/yszx/content/post_12911509.html',
    supports: 'Bao’an describes a PCB manufacturing cluster with several board technologies.',
    limitation: 'Board fabrication, assembly and testing are separate capabilities to verify.', reviewed: HUB_REVIEWED,
  },
  hardware: {
    id: 'hardware', title: 'Shenzhen strategic industry clusters', publisher: 'Commerce Bureau of Shenzhen',
    url: 'https://www.sz.gov.cn/en_szgov/business/key/content/post_11575453.html',
    supports: 'Shenzhen identifies intelligent terminals and smart sensors among its industry clusters.',
    limitation: 'An industry cluster does not establish readiness to develop an individual device.', reviewed: HUB_REVIEWED,
  },
  cosmetics: {
    id: 'cosmetics', title: 'Baiyun cosmetics manufacturing supervision', publisher: 'Guangzhou Administration for Market Regulation',
    url: 'https://scjgj.gz.gov.cn/zwdt/gzdt/content/post_9769294.html',
    supports: 'The regulator identifies a concentration of cosmetics producers in Baiyun.',
    limitation: 'You must check production scope, product suitability and destination-market requirements.', reviewed: HUB_REVIEWED,
  },
  packaging: {
    id: 'packaging', title: 'Guangzhou cosmetics supply-chain policy', publisher: 'Guangzhou Administration for Market Regulation',
    url: 'https://scjgj.gz.gov.cn/zwdt/xwfbt/content/post_8840771.html',
    supports: 'Guangzhou supports cosmetics raw-material and packaging manufacturing alongside beauty production.',
    limitation: 'A packaging contact may source glass or plastic elsewhere; ask who makes each component.', reviewed: HUB_REVIEWED,
  },
  fabric: {
    id: 'fabric', title: 'Keqiao fabric sourcing event', publisher: 'Keqiao district government',
    url: 'https://wz.kq.gov.cn/art/2024/3/21/art_1613601_58944655.html',
    supports: 'Local suppliers exhibit apparel, home and sports fabrics, including knitted fabrics.',
    limitation: 'Fabric sourcing does not establish garment production or in-house weaving and finishing.', reviewed: HUB_REVIEWED,
  },
  curtains: {
    id: 'curtains', title: 'China Textile City 2025 annual report', publisher: 'Zhejiang China Textile City Group · market operator',
    url: 'https://static.cninfo.com.cn/finalpage/2026-04-23/1225148475.PDF',
    supports: 'The operator describes fabric markets and a finished-curtain exhibition and trading area.',
    limitation: 'Confirm whether the contact sells fabric, makes curtains or arranges outsourced production.', reviewed: HUB_REVIEWED,
  },
  furniture: {
    id: 'furniture', title: 'Shunde town industry profiles', publisher: 'Shunde government employment portal',
    url: 'https://sdjyt.shunde.gov.cn/m/static.php?act=zjfc',
    supports: 'Lecong has a furniture trading market; Longjiang has furniture manufacturing activity.',
    limitation: 'A showroom address does not establish a production address or factory ownership.', reviewed: HUB_REVIEWED,
  },
  chairs: {
    id: 'chairs', title: 'Anji government work report 2025', publisher: 'Anji county government',
    url: 'https://www.anji.gov.cn/art/2025/6/4/art_1229518589_4009420.html',
    supports: 'Anji identifies its chair industry and export development.',
    limitation: 'Check the exact chair model, mechanisms, testing and actual production site.', reviewed: HUB_REVIEWED,
  },
};
