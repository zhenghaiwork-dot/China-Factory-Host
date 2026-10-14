import { HUB_REVIEWED } from './hub-sources.ts';

export const PRODUCT_CATEGORIES = [
  { id: 'gifts-home', label: 'Gifts, toys & daily goods' },
  { id: 'electronics', label: 'Electronics & smart hardware' },
  { id: 'appliances', label: 'Small home appliances' },
  { id: 'beauty', label: 'Beauty & packaging' },
  { id: 'textiles', label: 'Fabrics & textiles' },
  { id: 'furniture', label: 'Furniture & chairs' },
] as const;

export const SOURCING_MODES = {
  unknown: 'Not sure yet', stock: 'Buy an existing product', label: 'Add my brand to an existing product',
  custom: 'Develop or change the product', components: 'Source a part or manufacturing process',
} as const;
export type SourcingMode = keyof typeof SOURCING_MODES;

export interface HubRecommendation {
  hub: string;
  role: string;
  reason: string;
  fit: string;
  caution: string;
  sourceIds: string[];
}
export interface MaterialOption { id: string; label: string; note: string; }
export interface SourcingProduct {
  id: string;
  name: string;
  category: typeof PRODUCT_CATEGORIES[number]['id'];
  aliases: string[];
  description: string;
  unit: 'pieces' | 'metres';
  modes: SourcingMode[];
  materials: MaterialOption[];
  recommendations: HubRecommendation[];
  /** Explicit reviewed branches; quantity deliberately cannot choose a branch. */
  modeRecommendations?: Partial<Record<SourcingMode, HubRecommendation[]>>;
  modeNotes: Partial<Record<SourcingMode, string>>;
  prepare: string[];
  questions: string[];
  boundary: string;
  industryHref: string;
  reviewed: string;
}

const GOODS = '/industries/toys-gifts-commodities/';
const TEXTILES = '/industries/textiles-fabrics/';
const APPLIANCES = '/industries/small-home-appliances/';
const BEAUTY = '/industries/beauty-packaging/';
const FURNITURE = '/industries/furniture-home-furnishing/';
const ELECTRONICS = '/industries/electronics-smart-hardware/';
const standardModes: SourcingMode[] = ['unknown', 'stock', 'label', 'custom'];
const manufacturingModes: SourcingMode[] = ['unknown', 'custom', 'components'];
const standardNotes = {
  stock: 'Ask which exact SKUs are available now, who supplies them and whether repeat orders will use the same specification.',
  label: 'Request a branded sample and separate minimum quantities for the product, decoration and packaging.',
  custom: 'Send a drawing or reference sample. Confirm development responsibilities, sample approval and ownership of any tooling before ordering.',
};
function rec(hub: string, role: string, reason: string, sourceIds: string[], fit: string, caution: string): HubRecommendation {
  return { hub, role, reason, sourceIds, fit, caution };
}
const yiwuRec = (product: string) => rec('yiwu', 'Market suppliers; trace the manufacturer before booking a factory visit',
  `Yiwu’s market operator lists ${product} among its categories.`, ['yiwu'],
  'Compare existing designs and ask sellers about the exact specification and manufacturer.',
  'A market stall can be a trader or a manufacturer’s sales outlet. Verify where production actually happens.');
const mouldRec = rec('huangyan', 'Injection mould makers and moulding partners',
  'Huangyan’s district programme identifies local mould and moulding enterprises.', ['huangyan'],
  'Investigate tooling and plastic-part manufacturing against a defined drawing or sample.',
  'Confirm who designs the tool, who owns it and who runs production. A mould maker may not supply finished goods.');
const fabricRec = rec('keqiao', 'Fabric suppliers; identify the mill and finishing partner',
  'Keqiao’s public sourcing-event records include apparel, home and knitted fabrics.', ['fabric'],
  'Compare fabric construction and samples, then identify who makes or finishes the cloth.',
  'A fabric trader may source from several mills. Ask about the mill for your exact fabric and batch.');
const furnitureRec = rec('longjiang', 'Furniture manufacturers and material suppliers',
  'Shunde’s town profiles identify furniture manufacturing in Longjiang.', ['furniture'],
  'Investigate production, materials and custom specifications with confirmed factory appointments.',
  'Supplier capability depends on the specific furniture construction. Check the production address separately from the showroom.');
const furnitureMarketRec = rec('lecong', 'Furniture showrooms and trading suppliers',
  'Shunde’s town profiles identify a furniture trading market in Lecong.', ['furniture'],
  'Compare existing collections and finishes before tracing the chosen product to its manufacturer.',
  'Seeing a product in a showroom does not establish that it is manufactured there.');

export const SOURCING_PRODUCTS: SourcingProduct[] = [
  {
    id: 'seasonal-decorations', name: 'Seasonal & party decorations', category: 'gifts-home',
    aliases: ['christmas decorations', 'party supplies', 'festival decorations', 'wedding decorations', 'seasonal gifts'],
    description: 'Existing party, festival and decorative gift products.', unit: 'pieces', modes: standardModes, materials: [],
    recommendations: [yiwuRec('festival and wedding goods')], modeNotes: standardNotes,
    prepare: ['Product photos, dimensions and intended use.', 'Design assortment, packaging and quantity per design.', 'Delivery deadline and destination market.'],
    questions: ['Who manufactures this exact design, and at what address?', 'Is the quoted item stock or made to order?', 'What changes when the design, material or packaging changes?'],
    boundary: 'Electrical decorations, food-contact items and children’s products need their own product-specific checks. A custom design may require a different production cluster.', industryHref: GOODS, reviewed: HUB_REVIEWED,
  },
  {
    id: 'stationery', name: 'Pens & office stationery', category: 'gifts-home', aliases: ['stationery', 'pens', 'office supplies', 'school supplies', 'notebooks'],
    description: 'Existing pens, paper and school or office stationery.', unit: 'pieces', modes: standardModes, materials: [],
    recommendations: [yiwuRec('office stationery')], modeNotes: standardNotes,
    prepare: ['Item list, sample or product photo.', 'Ink, paper, dimensions and branding requirements.', 'Quantity per item and packaging format.'],
    questions: ['Which company makes the pen or paper product?', 'Can you approve the actual ink, paper and print sample?', 'Are product and print minimum quantities quoted separately?'],
    boundary: 'A new mechanism, specialised ink or a custom paper construction needs a manufacturing brief before selecting a factory.', industryHref: GOODS, reviewed: HUB_REVIEWED,
  },
  {
    id: 'stock-toys', name: 'Existing toy designs', category: 'gifts-home', aliases: ['toys', 'plush toys', 'toy', 'stock toys', 'dolls'],
    description: 'Compare existing toys; identify the actual maker and materials.', unit: 'pieces', modes: ['unknown', 'stock', 'label'], materials: [],
    recommendations: [yiwuRec('toys')], modeNotes: { stock: standardNotes.stock, label: 'Branding can change the product’s testing and packaging requirements. Confirm the exact model and manufacturer before ordering.' },
    prepare: ['Exact toy type, intended age group and reference photos.', 'Material, size, packaging and destination market.', 'Quantity per model and intended branding.'],
    questions: ['Does each test report identify this exact product and material?', 'Who makes it, and can you visit their workshop?', 'Will branding or a material change require further testing?'],
    boundary: 'New toy development is not covered by this existing-design entry. Define the material, mechanism and age group before planning manufacturing visits.', industryHref: GOODS, reviewed: HUB_REVIEWED,
  },
  {
    id: 'plastic-household-goods', name: 'Plastic storage & household goods', category: 'gifts-home',
    aliases: ['storage boxes', 'plastic containers', 'plastic storage', 'organisers', 'organizers', 'plastic household goods', 'pet bowls'],
    description: 'Storage containers and similar moulded household products.', unit: 'pieces', modes: standardModes,
    materials: [
      { id: 'pp-pe', label: 'PP or PE plastic', note: 'Specify the resin grade, intended use and dimensions. Ask which material is used in the quoted sample.' },
      { id: 'other-resin', label: 'Another or specialised resin', note: 'Name the resin and required properties. Confirm the factory can process it before selecting tooling.' },
    ],
    recommendations: [yiwuRec('daily household goods')], modeRecommendations: { custom: [mouldRec] },
    modeNotes: { ...standardNotes, custom: 'A changed shape can require a new mould. Start with tooling and moulding capability, rather than assuming a market supplier can develop it.' },
    prepare: ['Dimensions, drawing or a physical reference sample.', 'Material, load, food-contact or pet-use requirements.', 'Quantity per size or colour, packaging and tooling budget if relevant.'],
    questions: ['Who makes the tool and who moulds the part?', 'Who owns the tool, and what happens if production moves?', 'What is the MOQ for each size, colour and resin?'],
    boundary: 'Material suitability and testing depend on intended use. A household-goods listing is not evidence of food-contact or toy compliance.', industryHref: GOODS, reviewed: HUB_REVIEWED,
  },
  {
    id: 'injection-moulds', name: 'Injection moulds & plastic parts', category: 'gifts-home',
    aliases: ['injection molds', 'injection moulds', 'plastic parts', 'plastic tooling', 'custom plastic', 'plastic enclosure'],
    description: 'Tool development and moulded parts, before finished-product sourcing.', unit: 'pieces', modes: manufacturingModes,
    materials: [
      { id: 'standard-resin', label: 'Standard thermoplastic', note: 'Specify the resin, part size and surface finish so the tool and moulding process can be assessed together.' },
      { id: 'engineering-resin', label: 'Engineering resin', note: 'Provide the exact grade and operating conditions. Ask about processing experience, shrinkage and dimensional checks.' },
    ], recommendations: [mouldRec],
    modeNotes: { custom: standardNotes.custom, components: 'Separate the tool quotation from part production, assembly and packing. Identify the responsible company at each stage.' },
    prepare: ['CAD files or dimensioned drawings, tolerances and reference sample.', 'Resin grade, finish, application and expected production volume.', 'Tool ownership, maintenance and production-transfer requirements.'],
    questions: ['Which operations are in-house and which are subcontracted?', 'What are the tool acceptance and part inspection criteria?', 'Can the tool run at another agreed production site?'],
    boundary: 'The right mould shop depends on part size, precision and material. A moulding partner is not automatically a finished-product assembler.', industryHref: GOODS, reviewed: HUB_REVIEWED,
  },
  {
    id: 'vacuum-flasks', name: 'Stainless vacuum flasks & tumblers', category: 'gifts-home',
    aliases: ['vacuum flask', 'insulated bottle', 'water bottle', 'thermos', 'tumbler', 'stainless bottle', 'drinkware'],
    description: 'Stainless insulated drinkware, including branded existing designs.', unit: 'pieces', modes: standardModes, materials: [],
    recommendations: [rec('yongkang', 'Stainless vacuum drinkware manufacturers',
      'A listed-company disclosure identifies Yongkang as a vacuum flask manufacturing base.', ['flask'],
      'Investigate insulated stainless drinkware against a defined body, lid and finish.',
      'Plastic bottles, glass containers and single-wall vessels need separate product matching.')], modeNotes: standardNotes,
    prepare: ['Capacity, dimensions, body and liner material specification.', 'Lid type, insulation expectations, finish and logo artwork.', 'Quantity per colour and destination market.'],
    questions: ['Who forms, welds and vacuum-tests the body?', 'Can you approve the exact liner, lid, gasket and finish sample?', 'Which tests and traceability records cover this model?'],
    boundary: 'Confirm food-contact suitability for every component and the exact destination market. Regional production does not guarantee product performance.', industryHref: GOODS, reviewed: HUB_REVIEWED,
  },
  {
    id: 'electric-fans', name: 'Electric fans & air circulators', category: 'appliances',
    aliases: ['electric fan', 'desk fan', 'stand fan', 'tower fan', 'air circulator', 'fans'],
    description: 'Household fans and air-circulation appliances.', unit: 'pieces', modes: standardModes, materials: [],
    recommendations: [rec('cixi', 'Fan manufacturers with assembly and product testing',
      'A Cixi manufacturer publishes fan products and its local production address.', ['fans'],
      'Investigate an existing fan platform or a defined fan development brief.', 'Confirm the motor, power supply and testing arrangements for the exact model.')], modeNotes: standardNotes,
    prepare: ['Fan type, dimensions, airflow and noise targets.', 'Voltage, plug, controls and intended destination market.', 'Branding, packaging and quantity per model.'],
    questions: ['Which motor and controller are used in the sample?', 'Who assembles and tests the final product?', 'Do product reports cover the exact voltage and model offered?'],
    boundary: 'Industrial ventilation, air conditioners and air purifiers are different products. Confirm the exact appliance before arranging a visit.', industryHref: APPLIANCES, reviewed: HUB_REVIEWED,
  },
  {
    id: 'electric-heaters', name: 'Portable electric heaters', category: 'appliances',
    aliases: ['heater', 'space heater', 'ptc heater', 'fan heater', 'radiator', 'electric heaters'],
    description: 'Portable household electric heating appliances.', unit: 'pieces', modes: standardModes, materials: [],
    recommendations: [rec('cixi', 'Electric heater manufacturers',
      'The chamber’s Cixi directory includes heater manufacturing.', ['heaters', 'fans'],
      'Investigate the heating format and safety design required by your brief.', 'A heater catalogue does not establish that every listed model is made in-house.')], modeNotes: standardNotes,
    prepare: ['Heater format, power, dimensions and controls.', 'Voltage, plug and required safety features.', 'Destination market, quantities and packaging.'],
    questions: ['Who makes the heating element and assembles the appliance?', 'How are overheat and other specified safety functions tested?', 'Which exact model is identified on the product test documents?'],
    boundary: 'Heating appliances require product-specific safety evaluation. The finder supplies a research starting point, not a safety approval.', industryHref: APPLIANCES, reviewed: HUB_REVIEWED,
  },
  {
    id: 'blenders', name: 'Blenders & food processors', category: 'appliances',
    aliases: ['blender', 'food processor', 'juicer', 'mini blender', 'kitchen blender'],
    description: 'Motor-driven kitchen appliances, with food-contact parts.', unit: 'pieces', modes: standardModes, materials: [],
    recommendations: [rec('cixi', 'Blender and food-processor manufacturers',
      'The chamber lists a Cixi producer of blenders and food processors.', ['blenders'],
      'Investigate an existing appliance platform or a defined motor-and-container design.', 'Verify the exact container material and how assembly and testing are performed.')], modeNotes: standardNotes,
    prepare: ['Appliance function, capacity, power and duty cycle.', 'Container and blade materials, controls and destination market.', 'Quantity per model, branding and packaging.'],
    questions: ['Which operations and components are made at this site?', 'How are blade, motor and interlock functions tested?', 'Which food-contact and electrical documents cover the sample?'],
    boundary: 'A product-family listing does not prove that a particular model meets your food-contact or electrical requirements.', industryHref: APPLIANCES, reviewed: HUB_REVIEWED,
  },
  {
    id: 'pcb', name: 'Printed circuit boards (PCB / PCBA)', category: 'electronics',
    aliases: ['pcb', 'pcba', 'circuit board', 'printed circuit boards', 'smt', 'board assembly'],
    description: 'Bare-board fabrication and assembly services to investigate separately.', unit: 'pieces', modes: manufacturingModes, materials: [],
    recommendations: [rec('baoan', 'PCB fabricators; separately confirm assembly and test partners',
      'Bao’an’s government describes local PCB manufacturing activity.', ['pcb'],
      'Investigate board fabrication against your files and technical requirements.', 'Bare-board fabrication does not establish SMT assembly, component sourcing or final testing capability.')],
    modeNotes: { custom: 'Provide the board specification and design files. Ask separately about fabrication, component sourcing, assembly and test.', components: 'State whether you need bare boards, assembled boards or a specific process. These are different quotations.' },
    prepare: ['Gerber or equivalent fabrication files, stack-up and tolerances.', 'BOM and approved substitutions if assembly is needed.', 'Quantity, prototype requirements and test plan.'],
    questions: ['Where is this board technology actually fabricated?', 'Who sources components and runs assembly?', 'How are substitutions, traceability and test failures controlled?'],
    boundary: 'Highly specialised substrates or board technologies need technical confirmation before choosing a production site.', industryHref: ELECTRONICS, reviewed: HUB_REVIEWED,
  },
  {
    id: 'smart-hardware', name: 'Smart devices & connected hardware', category: 'electronics',
    aliases: ['smart hardware', 'iot', 'smart device', 'connected device', 'wearable', 'smart sensor'],
    description: 'Devices combining electronics, enclosure, firmware and testing.', unit: 'pieces', modes: standardModes, materials: [],
    recommendations: [rec('shenzhen', 'Device developers, electronics manufacturers and assembly partners',
      'Shenzhen’s commerce bureau identifies intelligent terminals and smart sensors as local industry clusters.', ['hardware'],
      'Investigate the technical stages your device needs, from design to final assembly.', 'Identify who owns the design and software; a catalogue seller may not be the developer.')], modeNotes: standardNotes,
    prepare: ['Required functions, connectivity and power requirements.', 'Development stage, design files or a working reference sample.', 'Destination market, test requirements and expected quantities.'],
    questions: ['Who is responsible for firmware, enclosure and final assembly?', 'Which design and software rights transfer to you?', 'How is the complete device tested and supported?'],
    boundary: 'The device may need suppliers outside this city. Define the technical brief before assuming one company can deliver every stage.', industryHref: ELECTRONICS, reviewed: HUB_REVIEWED,
  },
  {
    id: 'cosmetic-packaging', name: 'Cosmetic bottles, jars & closures', category: 'beauty',
    aliases: ['cosmetic bottle', 'cosmetic packaging', 'plastic bottle', 'glass bottle', 'jar', 'pump', 'cap', 'empty bottles'],
    description: 'Empty beauty containers and closures; distinguish sourcing from component manufacture.', unit: 'pieces', modes: standardModes,
    materials: [
      { id: 'plastic', label: 'Plastic container', note: 'Specify the resin, decoration and closure. Ask who moulds each component and whether tooling is existing or new.' },
      { id: 'glass', label: 'Glass container', note: 'Ask where the glass body is formed. A Guangzhou packaging supplier may source glass elsewhere and handle decoration or packing locally.' },
    ],
    recommendations: [rec('baiyun', 'Beauty packaging suppliers; trace body and closure manufacturers',
      'Guangzhou’s regulator describes packaging as part of its cosmetics supply-chain development.', ['packaging'],
      'Investigate packaging sourcing alongside the beauty supply chain.', 'Confirm the actual container-production address. This starting point does not imply local glass melting or every packaging process.')],
    modeNotes: { ...standardNotes, custom: 'Quote the body, closure, decoration and tooling separately. Confirm which supplier is responsible for fit and compatibility.' },
    prepare: ['Container volume, dimensions, material and reference sample.', 'Neck finish, pump or closure and decoration artwork.', 'Formula compatibility needs and quantities per component.'],
    questions: ['Who forms the body, makes the closure and decorates the container?', 'Can the assembled packaging be tested with your actual formula?', 'Which component sets the MOQ and lead time?'],
    boundary: 'This entry concerns empty packaging. For formulation and filling, select the separate cosmetics entry.', industryHref: BEAUTY, reviewed: HUB_REVIEWED,
  },
  {
    id: 'cosmetic-filling', name: 'Cosmetic formulation & filling', category: 'beauty',
    aliases: ['cosmetics', 'skincare', 'serum', 'cream', 'cosmetic filling', 'private label beauty'],
    description: 'Formulation, mixing and filling, with packaging checked separately.', unit: 'pieces', modes: ['unknown', 'label', 'custom'], materials: [],
    recommendations: [rec('baiyun', 'Cosmetics producers with the relevant formulation and filling scope',
      'Guangzhou’s regulator identifies a concentration of cosmetics producers in Baiyun.', ['cosmetics'],
      'Investigate the product type and production processes required by your brief.', 'Confirm licences, process scope and the actual production site. A filling plant may not develop the formula.')],
    modeNotes: { label: 'Ask what can change on the existing formula, what testing applies and how packaging is selected.', custom: 'Agree formulation ownership, development stages and approval criteria before discussing a production order.' },
    prepare: ['Product type, desired performance and formula constraints.', 'Reference sample, packaging format and destination market.', 'Quantity and responsibilities for development, testing and registration.'],
    questions: ['Which formulation, mixing and filling operations are performed here?', 'Who arranges compatibility, stability and product testing?', 'What production scope and market requirements apply to this product?'],
    boundary: 'Product registration and market compliance require appropriate specialist advice. The finder does not certify a product or a plant.', industryHref: BEAUTY, reviewed: HUB_REVIEWED,
  },
  {
    id: 'woven-fabric', name: 'Woven apparel fabric', category: 'textiles',
    aliases: ['fabric', 'woven fabric', 'apparel fabric', 'cloth', 'dress fabric', 'garment fabric'],
    description: 'Cloth for garments, bought as fabric rather than finished clothing.', unit: 'metres', modes: ['unknown', 'stock', 'custom'], materials: [],
    recommendations: [fabricRec], modeNotes: { stock: 'Check available colours, usable width and whether repeat orders come from the same construction and finish.', custom: 'For custom weaving, dyeing or printing, identify the mill and each finishing partner. Ask minimum metres per construction and colour.' },
    prepare: ['Fibre composition, weave, weight and usable width.', 'Sample, colour standard, finish and intended garment.', 'Metres per colour, delivery needs and destination market.'],
    questions: ['Who weaves, dyes and finishes this fabric?', 'Is the sample stock, a prior batch or a proposed development?', 'What minimum metres apply per colour and construction?'],
    boundary: 'If you need completed garments, a fabric supplier is only one stage of your supply chain. Garment manufacturing is not covered by this entry.', industryHref: TEXTILES, reviewed: HUB_REVIEWED,
  },
  {
    id: 'knitted-fabric', name: 'Knitted & stretch fabric', category: 'textiles',
    aliases: ['knit fabric', 'knitted fabric', 'jersey', 'stretch fabric', 'sports fabric'],
    description: 'Knitted cloth for apparel or other specified applications.', unit: 'metres', modes: ['unknown', 'stock', 'custom'], materials: [],
    recommendations: [fabricRec], modeNotes: { stock: 'Check composition, stretch and recovery on the actual available batch.', custom: 'Specify knitting construction and finishing requirements. Confirm the knitting and finishing sites and minimum quantities.' },
    prepare: ['Composition, construction, weight, width and stretch requirement.', 'Reference sample, colour and end use.', 'Expected metres per colour and required performance tests.'],
    questions: ['Which mill knits the cloth and where is it finished?', 'What shrinkage, recovery or pilling checks are agreed?', 'Will the production batch match the approved sample?'],
    boundary: 'Fabric capability does not establish cut-and-sew garment production. Technical performance must be agreed and tested for the intended use.', industryHref: TEXTILES, reviewed: HUB_REVIEWED,
  },
  {
    id: 'curtain-fabric', name: 'Curtain & furnishing fabric', category: 'textiles',
    aliases: ['curtain fabric', 'curtains', 'furnishing fabric', 'home textile fabric', 'drapery'],
    description: 'Curtain and furnishing cloth; clarify whether finished curtains are needed.', unit: 'metres', modes: ['unknown', 'stock', 'custom'], materials: [],
    recommendations: [rec('keqiao', 'Fabric traders and identified weaving or finishing partners',
      'China Textile City’s operator reports fabric markets and curtain trading activity.', ['curtains', 'fabric'],
      'Compare fabric and ask whether the supplier also provides cutting, sewing and finishing.', 'A cloth quotation and a finished-curtain quotation cover different work.')],
    modeNotes: { stock: 'Confirm width, pattern repeat and available colour batches before calculating the order.', custom: 'Define colour, construction and finish. Ask separately about fabric production and any cutting or sewing.' },
    prepare: ['Composition, usable width, weight and reference sample.', 'Pattern repeat, light-control or other performance requirements.', 'Metres per design or colour; finished dimensions if sewing is needed.'],
    questions: ['Does the quotation cover fabric or completed curtains?', 'Who weaves and finishes the fabric?', 'How are colour batches and agreed performance checked?'],
    boundary: 'Furniture upholstery or commercial projects may need different performance tests. Specify the end use before booking a mill visit.', industryHref: TEXTILES, reviewed: HUB_REVIEWED,
  },
  {
    id: 'office-chairs', name: 'Office & desk chairs', category: 'furniture',
    aliases: ['office chair', 'desk chair', 'ergonomic chair', 'mesh chair', 'gaming chair', 'chairs'],
    description: 'Office seating, with mechanisms and test requirements specified.', unit: 'pieces', modes: standardModes, materials: [],
    recommendations: [rec('anji', 'Chair manufacturers and seating-component suppliers',
      'Anji’s government work report identifies the local chair industry.', ['chairs'],
      'Investigate office seating against a defined mechanism, material and construction.', 'Check the exact model and who makes the mechanism, base and gas lift.')], modeNotes: standardNotes,
    prepare: ['Chair reference, dimensions, adjustments and load requirement.', 'Mechanism, base, upholstery or mesh specification.', 'Destination market, test requirements and quantities per model.'],
    questions: ['Which components are made in-house and which are purchased?', 'Do test documents cover this exact chair configuration?', 'Can you approve a complete production-representative sample?'],
    boundary: 'A different mechanism, base or upholstery can change performance. Other seating types need their own product matching.', industryHref: FURNITURE, reviewed: HUB_REVIEWED,
  },
  {
    id: 'sofas', name: 'Sofas & upholstered furniture', category: 'furniture',
    aliases: ['sofa', 'couch', 'upholstered furniture', 'living room furniture', 'sofas'],
    description: 'Finished collections or production against a specified frame and upholstery.', unit: 'pieces', modes: standardModes,
    materials: [
      { id: 'fabric', label: 'Fabric upholstery', note: 'Specify the fabric, abrasion expectations, colour and destination-market requirements. Confirm the fabric source.' },
      { id: 'leather', label: 'Leather or coated upholstery', note: 'Specify the exact material and grade. Ask for a labelled sample rather than accepting a general “leather” description.' },
    ],
    recommendations: [furnitureRec, furnitureMarketRec], modeRecommendations: { stock: [furnitureMarketRec], custom: [furnitureRec] },
    modeNotes: standardNotes,
    prepare: ['Dimensions, frame construction and reference design.', 'Foam, upholstery, finish and packaging specification.', 'Destination market, quantity per model and sample requirements.'],
    questions: ['Where is the frame made and the furniture upholstered?', 'Which materials and construction match the quotation?', 'Can you inspect the actual production site before ordering?'],
    boundary: 'Lecong is useful for collection comparison; Longjiang is a manufacturing research direction. Confirm every factory appointment before travelling.', industryHref: FURNITURE, reviewed: HUB_REVIEWED,
  },
];
