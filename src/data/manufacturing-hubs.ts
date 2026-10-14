export interface ManufacturingHub {
  id: string;
  name: string;
  chinese: string;
  province: string;
  href: string;
}

export const MANUFACTURING_HUBS: Record<string, ManufacturingHub> = {
  yiwu: { id: 'yiwu', name: 'Yiwu', chinese: '义乌', province: 'Zhejiang', href: '/destinations/yiwu/' },
  huangyan: { id: 'huangyan', name: 'Huangyan, Taizhou', chinese: '台州黄岩', province: 'Zhejiang', href: '/destinations/zhejiang/canton-fair-to-zhejiang-factory-visits/' },
  yongkang: { id: 'yongkang', name: 'Yongkang', chinese: '永康', province: 'Zhejiang', href: '/destinations/zhejiang/canton-fair-to-zhejiang-factory-visits/' },
  cixi: { id: 'cixi', name: 'Cixi, Ningbo', chinese: '宁波慈溪', province: 'Zhejiang', href: '/destinations/ningbo-hangzhou/' },
  baoan: { id: 'baoan', name: 'Bao’an, Shenzhen', chinese: '深圳宝安', province: 'Guangdong', href: '/destinations/shenzhen/' },
  shenzhen: { id: 'shenzhen', name: 'Shenzhen', chinese: '深圳', province: 'Guangdong', href: '/destinations/shenzhen/' },
  baiyun: { id: 'baiyun', name: 'Baiyun, Guangzhou', chinese: '广州白云', province: 'Guangdong', href: '/destinations/guangzhou-dongguan/' },
  keqiao: { id: 'keqiao', name: 'Keqiao, Shaoxing', chinese: '绍兴柯桥', province: 'Zhejiang', href: '/destinations/shaoxing-keqiao/' },
  longjiang: { id: 'longjiang', name: 'Longjiang, Shunde, Foshan', chinese: '佛山顺德龙江', province: 'Guangdong', href: '/destinations/foshan-shunde/' },
  lecong: { id: 'lecong', name: 'Lecong, Shunde, Foshan', chinese: '佛山顺德乐从', province: 'Guangdong', href: '/destinations/foshan-shunde/' },
  anji: { id: 'anji', name: 'Anji, Huzhou', chinese: '湖州安吉', province: 'Zhejiang', href: '/destinations/zhejiang/canton-fair-to-zhejiang-factory-visits/' },
};
