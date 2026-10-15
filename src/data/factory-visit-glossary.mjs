// Editorial glossary: definitions and visible structured data share this source.
export const GLOSSARY_STAGES = [
  {
    "id": "stage-1",
    "number": "1",
    "title": "Who You Are Dealing With",
    "terms": [
      {
        "id": "factory",
        "title": "Factory",
        "chinese": "工厂 (gōngchǎng)",
        "definition": "A business that operates production equipment and employs or manages the people who make products.",
        "why": "Direct access to production can help you understand processes, quality and scheduling. The label “factory” alone does not establish where your order will be made.",
        "visit": "Ask to see the production floor, raw material area and finished goods area, not just the showroom. Check that the machines match your product.",
        "trap": "A tidy showroom and a few machines do not prove your order will be made there."
      },
      {
        "id": "trading-company",
        "title": "Trading Company",
        "chinese": "贸易公司 (màoyì gōngsī)",
        "definition": "A company that buys products from factories and resells them to you.",
        "why": "It can combine several products and handle small orders, but it adds a margin and usually does not control production.",
        "visit": "Ask who makes the product, who owns the moulds, who schedules production and who arranges shipment. Clarify the role of each business rather than judging by a single answer.",
        "trap": "The risk is not the trading company itself. It is not being told that is what you are dealing with."
      },
      {
        "id": "factory-trading-integrated",
        "title": "Factory-Trading Integrated",
        "chinese": "工贸一体 (gōngmào yītǐ)",
        "definition": "A company that runs its own factory and also has a trading or export arm.",
        "why": "It can be a strong partner, but the factory may make only part of what the company sells.",
        "visit": "Ask which products are made in-house and which are sourced elsewhere. Ask to see the line for your specific product.",
        "trap": "Seeing one product being made and assuming the whole catalogue is made there."
      },
      {
        "id": "subcontracting",
        "title": "Subcontracting",
        "chinese": "分包 / 外协 (fēnbāo / wàixié)",
        "definition": "A factory passes some processes, or a whole order, to another workshop.",
        "why": "Samples and bulk production may involve different sites or processes. Undisclosed changes can make quality and responsibility harder to track.",
        "visit": "Ask which processes, such as plating, painting or assembly, happen elsewhere. Agree which subcontractors or changes require your written approval before production.",
        "trap": "Visiting only the main factory while key steps happen elsewhere."
      },
      {
        "id": "business-licence-scope",
        "title": "Business Licence Scope",
        "chinese": "经营范围 (jīngyíng fànwéi)",
        "definition": "The list of activities a Chinese company is registered to carry out, shown on its business licence.",
        "why": "Manufacturing or processing activities in the registered scope are useful clues, but neither the wording nor a licence alone proves that a company makes your product.",
        "visit": "Compare the registered activities with the work you see on site. Check the company name and code in the National Enterprise Credit Information Publicity System, and clarify any different contracting or payment entity.",
        "trap": "Accepting a licence photo without checking that the company name matches the contract, invoice and bank account."
      },
      {
        "id": "unified-social-credit-code",
        "title": "Unified Social Credit Code",
        "chinese": "统一社会信用代码 (tǒngyī shèhuì xìnyòng dàimǎ)",
        "definition": "The 18-character identification number of a registered Chinese company, comparable to an ID number for the entity.",
        "why": "It identifies the registered entity for a company-record lookup. Registration alone does not establish production capability, creditworthiness or the suitability of a payment account.",
        "visit": "Ask for the code and check that it matches the licence, contract and invoice.",
        "trap": "Unexplained differences between the contracting, invoicing and payment entities. Ask how the entities are related before proceeding."
      }
    ]
  },
  {
    "id": "stage-2",
    "number": "2",
    "title": "What You See on Site",
    "terms": [
      {
        "id": "production-line",
        "title": "Production Line",
        "chinese": "生产线 / 产线 (shēngchǎnxiàn / chǎnxiàn)",
        "definition": "The sequence of machines and workstations where a product is made or assembled.",
        "why": "Observing the line helps you understand processes and capacity assumptions. A short walk-through does not establish sustained output.",
        "visit": "Look for your product or a similar one. Count active workers and machines, and ask what this line produces each day.",
        "trap": "Treating a brief demonstration as evidence of routine output. Ask about schedules and records as well as what is running."
      },
      {
        "id": "lead-time",
        "title": "Lead Time",
        "chinese": "交期 (jiāoqī)",
        "definition": "The agreed time between a defined starting event and a defined delivery milestone, such as deposit receipt to goods ready for shipment.",
        "why": "It affects your launch date, stock plan and cash flow. Agree the start and end points rather than relying on the number of days alone.",
        "visit": "Ask how many orders are in the queue, what the current capacity is and whether the quoted time includes inspection, packing and transport to the port.",
        "trap": "A lead time quoted for production only."
      },
      {
        "id": "chinese-new-year-shutdown",
        "title": "Chinese New Year Shutdown",
        "chinese": "春节停工 (chūnjié tínggōng)",
        "definition": "The period around Chinese New Year when factories and logistics providers close or run at reduced capacity.",
        "why": "Factories and logistics providers may slow down before the public holiday and recover gradually afterwards. Dates and recovery time vary by supplier.",
        "visit": "Ask for closing and restart dates, order cut-offs and the expected return to normal output. Work backwards from your delivery date and confirm the plan with the factory and logistics provider.",
        "trap": "Assuming workers are back on the first working day."
      },
      {
        "id": "factory-audit",
        "title": "Factory Audit",
        "chinese": "验厂 (yànchǎng)",
        "definition": "A structured review of a factory's capacity, management systems, quality control and compliance.",
        "why": "It gives you evidence beyond what the supplier says about itself.",
        "visit": "Decide what you need to verify, such as capacity, working conditions or quality processes, and whether a visit, a third-party audit or both fit your order.",
        "trap": "Treating a certificate or a staged visit as proof of everyday practice."
      },
      {
        "id": "pre-shipment-inspection",
        "title": "Pre-shipment Inspection",
        "chinese": "出货前检验 / 验货 (chūhuò qián jiǎnyàn / yànhuò)",
        "definition": "A check of finished goods before they leave the factory, covering quantity, quality and packaging.",
        "why": "It can identify problems before dispatch and inform an agreed payment or release decision. Sampling does not guarantee that every unit is defect-free.",
        "visit": "Agree the specification, defect categories, sampling plan and acceptance criteria with your inspection provider. Confirm its production-completion and packing requirements before booking; providers and orders differ.",
        "trap": "Treating a generic AQL number or an inspection booking as approval to pay or ship. Review the actual result against your agreed release conditions."
      }
    ]
  },
  {
    "id": "stage-3",
    "number": "3",
    "title": "What You Negotiate",
    "terms": [
      {
        "id": "moq-minimum-order-quantity",
        "title": "MOQ (Minimum Order Quantity)",
        "chinese": "起订量 (qǐdìngliàng)",
        "definition": "The smallest quantity a supplier agrees to supply for an order, product, colour or other specified variant.",
        "why": "It covers setup, materials and tooling, so it affects both unit price and how much stock you must hold.",
        "visit": "Ask what drives the MOQ for your product, such as materials, colours or packaging, and what changes if you reduce variants.",
        "trap": "Comparing MOQ figures without checking whether they apply per order, design, colour or packaging variant."
      },
      {
        "id": "sampling",
        "title": "Sampling",
        "chinese": "打样 (dǎyàng)",
        "definition": "Making a small number of samples before mass production to confirm appearance, size and function.",
        "why": "It lets you catch design and material problems before committing to a bulk order.",
        "visit": "Ask whether samples come from the production line or a separate sample room, and whether they use the same materials as bulk.",
        "trap": "A handmade sample that the production line cannot repeat."
      },
      {
        "id": "golden-sample",
        "title": "Golden Sample",
        "chinese": "封样 / 金样 (fēngyàng / jīnyàng)",
        "definition": "An approved reference sample used alongside the written specification to assess production goods.",
        "why": "It provides a shared physical reference for appearance and workmanship. It does not replace measurable specifications or agreed test requirements.",
        "visit": "Sign and date it, record the version and keep one copy each. Photograph it from every side.",
        "trap": "Approving a sample without identifying its version, materials and the written specification it represents."
      },
      {
        "id": "tooling-mold",
        "title": "Tooling (Mold)",
        "chinese": "模具 (mújù) · 开模 (kāimó): making new tooling",
        "definition": "The custom moulds or dies used to shape parts, common in plastic, die-cast and stamped products.",
        "why": "Custom tooling can involve a separate upfront cost and affect your ability to move production. Agree ownership, access and transfer conditions in writing.",
        "visit": "Ask to see existing tooling. Confirm who will own the new tooling, where it will be stored and who pays for repair and replacement.",
        "trap": "Paying a tooling fee without a written statement of ownership."
      },
      {
        "id": "tax-inclusive-vs-tax-exclusive-price",
        "title": "Tax-inclusive vs Tax-exclusive Price",
        "chinese": "含税价 / 不含税价 (hánshuì jià / bù hánshuì jià)",
        "definition": "Whether a quoted price includes Chinese VAT.",
        "why": "It changes what the quoted price covers. Invoicing and export arrangements depend on the transaction; confirm them with the supplier and your trade or tax adviser.",
        "visit": "Ask whether the price includes VAT, packaging and delivery to a named place, and which type of invoice you will receive.",
        "trap": "Comparing a tax-inclusive quote with a tax-exclusive one."
      }
    ]
  },
  {
    "id": "stage-4",
    "number": "4",
    "title": "How the Product Is Made",
    "terms": [
      {
        "id": "oem-original-equipment-manufacturer",
        "title": "OEM (Original Equipment Manufacturer)",
        "chinese": "代工 / 贴牌代工 (dàigōng / tiēpái dàigōng)",
        "definition": "In sourcing discussions, manufacturing to a buyer’s specified design or requirements, often under the buyer’s brand. Usage varies by supplier and industry.",
        "why": "Define who supplies the design, who may use it and who is responsible for each requirement. The OEM label alone does not settle those questions.",
        "visit": "Ask how the factory protects customer designs, who can access your files and whether it will sign a confidentiality agreement.",
        "trap": "Assuming the label OEM defines the design work, customisation or intellectual-property rights. Describe the actual scope in writing."
      },
      {
        "id": "odm-original-design-manufacturer",
        "title": "ODM (Original Design Manufacturer)",
        "chinese": "自主设计生产 (zìzhǔ shèjì shēngchǎn), commonly just \"ODM\"",
        "definition": "In sourcing discussions, a manufacturer offers a design that a buyer can select and adapt. The available changes depend on the supplier and product.",
        "why": "An existing design may reduce development work, but the base product may also be offered to other buyers.",
        "visit": "Ask what you can change, what exclusivity is possible and who owns the design.",
        "trap": "Assuming you own a design the factory developed."
      },
      {
        "id": "private-label",
        "title": "Private Label",
        "chinese": "贴牌 (tiēpái)",
        "definition": "Selling an existing product under your own brand name.",
        "why": "It can reduce development work when an existing product meets your needs, but may offer limited differentiation.",
        "visit": "Ask whether the factory can change packaging, materials or small features beyond the logo, and how many other buyers sell the same product.",
        "trap": "Believing a private label product is exclusive."
      }
    ]
  },
  {
    "id": "stage-5",
    "number": "5",
    "title": "What Can Go Wrong",
    "terms": [
      {
        "id": "not-as-sampled",
        "title": "Not as Sampled",
        "chinese": "货不对板 (huò bù duì bǎn)",
        "definition": "Bulk goods that do not match the approved sample or description.",
        "why": "A mismatch can lead to a dispute, especially when the approved reference and written requirements are unclear.",
        "visit": "Agree a written specification, a signed golden sample and an inspection plan before production starts.",
        "trap": "Discovering the difference only after the goods arrive."
      }
    ]
  }
];
