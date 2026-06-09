const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedCMSData() {
  try {
    console.log('Seeding CMS data...\n');
    
    // 1. Update Organization with phone2 and officeHours
    const org = await prisma.organization.findFirst();
    if (org) {
      await prisma.organization.update({
        where: { id: org.id },
        data: {
          phone2: '+234 809 814 0576',
          officeHours: 'Mon – Fri: 08:00 – 18:00 WAT',
        },
      });
      console.log('✓ Updated Organization with phone2 and officeHours');
    }
    
    // 2. Seed Team Members
    const teamMembers = [
      { firstName: 'Alexander', lastName: 'Vance', title: 'Chief Executive Officer', bio: 'Former Ministry of Defense network architect with 20+ years in sovereign infrastructure engineering. Pioneered zero-trust frameworks across multiple national government deployments.', tags: 'Strategy, Public Sector, Infrastructure', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander+Vance&backgroundColor=7a0100&backgroundType=solid', sortOrder: 0 },
      { firstName: 'Sarah', lastName: 'Chen', title: 'Chief Technology Officer', bio: 'ISO 27001 Lead Auditor and pioneer of zero-trust public network integration. Expert in AI-driven compliance automation and cryptographic data governance.', tags: 'AI & ML, Security, Compliance', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah+Chen&backgroundColor=a1140a&backgroundType=solid', sortOrder: 1 },
      { firstName: 'James', lastName: 'Okafor', title: 'Director of Operations', bio: 'Enterprise-scale automation specialist who architected Tier-1 sovereign clouds across EMEA. Drives operational excellence across all CLUKSTARS client engagements.', tags: 'Operations, Cloud, Automation', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James+Okafor&backgroundColor=00897B&backgroundType=solid', sortOrder: 2 },
      { firstName: 'Priya', lastName: 'Patel', title: 'Head of Compliance', bio: 'SOC3 automation developer ensuring continuous regulatory alignment across all deployments. Deep expertise in GDPR, HIPAA, and Nigeria Data Protection Regulation.', tags: 'GDPR, HIPAA, NDPR', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya+Patel&backgroundColor=fdd663&backgroundType=solid', sortOrder: 3 },
      { firstName: 'Emeka', lastName: 'Adeyemi', title: 'Head of Public Sector', bio: '15+ years leading digital transformation programs within Nigerian federal ministries and state government agencies. Bridges policy and technology with precision.', tags: 'E-Governance, Policy, Nigeria', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emeka+Adeyemi&backgroundColor=27c93f&backgroundType=solid', sortOrder: 4 },
      { firstName: 'Lena', lastName: 'Braun', title: 'Lead Infrastructure Engineer', bio: 'Specialist in renewable energy systems integration, EV infrastructure, and port & marine technology deployments across West and Central Africa.', tags: 'Energy, Marine, Hardware', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lena+Braun&backgroundColor=ff5f56&backgroundType=solid', sortOrder: 5 },
    ];
    
    for (const tm of teamMembers) {
      await prisma.teamMember.upsert({
        where: { id: `team-${tm.firstName.toLowerCase()}-${tm.lastName.toLowerCase()}` },
        update: tm,
        create: { ...tm, id: `team-${tm.firstName.toLowerCase()}-${tm.lastName.toLowerCase()}` },
      });
    }
    console.log(`✓ Seeded ${teamMembers.length} team members`);
    
    // 3. Seed Case Studies
    const caseStudies = [
      {
        title: 'National Health Record Digitization',
        slug: 'national-health-record-digitization',
        client: 'Ministry of Health',
        sector: 'Public Sector',
        excerpt: 'Deployed 80+ cryptographic state health record nodes with zero-trust access controls, processing 2M+ citizen records with 100% audit compliance.',
        result: 'Deployed 80+ cryptographic state health record nodes with zero-trust access controls, processing 2M+ citizen records with 100% audit compliance.',
        metrics: JSON.stringify([{ val: '80+', label: 'Nodes Deployed' }, { val: '2M+', label: 'Records Secured' }, { val: '100%', label: 'Audit Compliance' }]),
        tags: 'Healthcare, Zero-Trust, E-Governance',
        status: 'PUBLISHED',
      },
      {
        title: 'Central Banking Payment Gateway',
        slug: 'central-banking-payment-gateway',
        client: 'National Treasury Authority',
        sector: 'Finance',
        excerpt: 'Architected secure, audited payment infrastructure processing millions of daily sovereign transactions with end-to-end encryption and real-time fraud detection.',
        result: 'Architected secure, audited payment infrastructure processing millions of daily sovereign transactions.',
        metrics: JSON.stringify([{ val: '5M+', label: 'Daily Transactions' }, { val: '0', label: 'Security Incidents' }, { val: '99.99%', label: 'Uptime SLA' }]),
        tags: 'Fintech, Sovereign Finance, Compliance',
        status: 'PUBLISHED',
      },
      {
        title: 'Smart Transport Ticketing System',
        slug: 'smart-transport-ticketing',
        client: 'Metropolitan Transport Authority',
        sector: 'Infrastructure',
        excerpt: 'Integrated 50+ ticketing gateways with federated SSO, real-time analytics, and contactless payment across the entire metropolitan transit network.',
        result: 'Integrated 50+ ticketing gateways with federated SSO and real-time analytics.',
        metrics: JSON.stringify([{ val: '50+', label: 'Gateways' }, { val: '1.2M', label: 'Daily Riders' }, { val: '4.8★', label: 'Citizen Rating' }]),
        tags: 'Smart City, SSO, Analytics',
        status: 'PUBLISHED',
      },
      {
        title: 'AI-Driven Revenue Assurance Platform',
        slug: 'ai-revenue-assurance',
        client: 'Federal Revenue Service',
        sector: 'Public Sector',
        excerpt: 'Deployed a machine-learning tax compliance engine that improved revenue collection accuracy by 34% and eliminated manual reconciliation bottlenecks.',
        result: 'Improved revenue collection accuracy by 34% with ML-driven compliance.',
        metrics: JSON.stringify([{ val: '34%', label: 'Revenue Increase' }, { val: '90%', label: 'Automation Rate' }, { val: '12mo', label: 'Deployment' }]),
        tags: 'AI/ML, Revenue, Automation',
        status: 'PUBLISHED',
      },
    ];
    
    for (const cs of caseStudies) {
      await prisma.caseStudy.upsert({
        where: { slug: cs.slug },
        update: cs,
        create: { ...cs, id: `case-${cs.slug}` },
      });
    }
    console.log(`✓ Seeded ${caseStudies.length} case studies`);
    
    // 4. Seed Homepage Stats
    const homepageStats = [
      { number: '300', symbol: '+', label: 'Solution Touchpoints', explanationTitle: 'Global Sovereign Touchpoints', explanationText: 'Clukstars integration architecture actively routes, secures, and audits critical transactional touchpoints across multiple public endpoints:', highlights: JSON.stringify(['120+ Active G-Cloud Sovereign database bridges', '80+ Healthcare cryptographic state health record nodes', '50+ Transport authority ticketing gateways', '50+ Federated enterprise SSO API secure endpoints']), sortOrder: 0 },
      { number: '6', symbol: '+', label: 'Industries Served', explanationTitle: 'Federal & Enterprise Sectors', explanationText: 'We engineer custom compliant systems for industries requiring absolute sovereignty, resilience, and strict policy boundary validation:', highlights: JSON.stringify(['Public Sector, Ministries & Municipalities', 'Healthcare Networks & Emergency Services', 'Central Banks & Sourcing Treasuries', 'National Transport & Infrastructure authorities', 'Sovereign Energy Grids & Utility controllers', 'Secure Customs Operations']), sortOrder: 1 },
      { number: '20', symbol: 'years', label: 'Combined Expertise', italicText: 'years', explanationTitle: 'Elite Sourcing Pedigree', explanationText: 'Clukstars Limited architecture team is composed of seasoned tech authorities holding deep security clearance backgrounds:', highlights: JSON.stringify(['Ex-Ministry of Defense network engineers', 'ISO 27001 Lead Auditors & SOC3 automation developers', 'Architects of Tier-1 sovereign clouds at scale', 'Pioneers of early zero-trust public networks integration']), sortOrder: 2 },
    ];
    
    for (const stat of homepageStats) {
      await prisma.homepageStat.upsert({
        where: { id: `stat-${stat.sortOrder}` },
        update: stat,
        create: { ...stat, id: `stat-${stat.sortOrder}` },
      });
    }
    console.log(`✓ Seeded ${homepageStats.length} homepage stats`);
    
    // 5. Seed About Values
    const aboutValues = [
      { icon: 'Shield', title: 'Sovereign by Design', description: 'Every system we build is architected from the ground up with zero-trust principles, ensuring data sovereignty and absolute security compliance.', sortOrder: 0 },
      { icon: 'Lightbulb', title: 'Innovation at Scale', description: 'Our 300+ deployment-ready touchpoints allow us to rapidly bring cutting-edge AI and automation solutions to life across complex, multi-sector environments.', sortOrder: 1 },
      { icon: 'Globe', title: 'West Africa Focus', description: 'Deep-rooted understanding of the Nigerian and West African regulatory, cultural, and infrastructure landscape — enabling solutions that truly fit.', sortOrder: 2 },
      { icon: 'Users', title: 'People-First Impact', description: 'We build technology that serves real people — from citizens accessing government services to clinicians in digital health networks.', sortOrder: 3 },
    ];
    
    for (const val of aboutValues) {
      await prisma.aboutValue.upsert({
        where: { id: `value-${val.sortOrder}` },
        update: val,
        create: { ...val, id: `value-${val.sortOrder}` },
      });
    }
    console.log(`✓ Seeded ${aboutValues.length} about values`);
    
    // 6. Seed About Stats
    const aboutStats = [
      { number: '20+', label: 'Years Combined Expertise', sortOrder: 0 },
      { number: '300+', label: 'Solution Touchpoints', sortOrder: 1 },
      { number: '6+', label: 'Industries Served', sortOrder: 2 },
      { number: '100%', label: 'Client Retention Rate', sortOrder: 3 },
    ];
    
    for (const stat of aboutStats) {
      await prisma.aboutStat.upsert({
        where: { id: `about-stat-${stat.sortOrder}` },
        update: stat,
        create: { ...stat, id: `about-stat-${stat.sortOrder}` },
      });
    }
    console.log(`✓ Seeded ${aboutStats.length} about stats`);
    
    // 7. Seed Service Categories & Services
    const serviceCategories = [
      {
        name: 'Public Sector Transformation',
        description: 'AI-driven e-governance platforms, digital identity systems, and revenue assurance solutions designed for federal ministries, state governments, and municipal authorities across West Africa.',
        icon: 'Monitor',
        sortOrder: 0,
        services: [
          {
            title: 'E-Governance Platforms',
            description: 'End-to-end digital government infrastructure including citizen portals, document management systems, inter-agency data exchange, and automated workflow engines.',
            icon: 'Monitor',
            sortOrder: 0,
            features: ['AI Governance', 'Digital Identity', 'Revenue Assurance', 'Policy Automation'],
          },
          {
            title: 'Smart City Solutions',
            description: 'Integrated urban management platforms covering traffic analytics, public safety systems, smart utility metering, and municipal service automation.',
            icon: 'Cpu',
            sortOrder: 1,
            features: ['Urban Analytics', 'Traffic Management', 'Public Safety', 'Smart Utilities'],
          },
        ],
      },
      {
        name: 'Private Sector Innovation',
        description: 'Enterprise digital transformation services, business intelligence platforms, and AI-driven automation solutions for corporate and commercial clients.',
        icon: 'GraphUp',
        sortOrder: 1,
        services: [
          {
            title: 'Enterprise Digital Transformation',
            description: 'Comprehensive modernization of enterprise IT systems including cloud migration, workflow automation, legacy system integration, and AI-powered business process optimization.',
            icon: 'Briefcase',
            sortOrder: 0,
            features: ['Cloud Migration', 'Workflow Automation', 'Enterprise AI', 'Data Modernization'],
          },
          {
            title: 'Business Intelligence & Analytics',
            description: 'Advanced analytics platforms delivering real-time dashboards, predictive modeling, market intelligence, and fraud detection for data-driven decision making.',
            icon: 'GraphUp',
            sortOrder: 1,
            features: ['Predictive Analytics', 'Real-time Dashboards', 'Market Intelligence', 'Fraud Detection'],
          },
        ],
      },
      {
        name: 'Infrastructure & Security',
        description: 'Tier-1 sovereign cloud infrastructure, zero-trust security meshes, and resilient network architecture designed for mission-critical government and enterprise operations.',
        icon: 'Shield',
        sortOrder: 2,
        services: [
          {
            title: 'Sovereign Cloud Infrastructure',
            description: 'Nationally-hosted cloud platforms with tier-1 data centers, edge computing nodes, disaster recovery, and full data sovereignty compliance.',
            icon: 'Cpu',
            sortOrder: 0,
            features: ['Tier-1 Data Centers', 'Network Architecture', 'Disaster Recovery', 'Edge Computing'],
          },
          {
            title: 'Zero-Trust Security Mesh',
            description: 'Comprehensive cybersecurity framework implementing zero-trust architecture, continuous threat monitoring, advanced encryption, and regulatory compliance enforcement.',
            icon: 'Shield',
            sortOrder: 1,
            features: ['Identity Management', 'Threat Detection', 'Advanced Encryption', 'Compliance Monitoring'],
          },
        ],
      },
      {
        name: 'Compliance & Risk Automation',
        description: 'Automated compliance management platforms, risk assessment frameworks, and audit-ready systems ensuring continuous alignment with regulatory requirements.',
        icon: 'FileCheck',
        sortOrder: 3,
        services: [
          {
            title: 'Regulatory Compliance Automation',
            description: 'End-to-end compliance automation covering ISO 27001, GDPR, NDPR, HIPAA, and SOC 3 — with continuous monitoring and auto-generated audit trails.',
            icon: 'FileCheck',
            sortOrder: 0,
            features: ['ISO 27001', 'GDPR', 'NDPR', 'SOC 3'],
          },
          {
            title: 'Risk Management Framework',
            description: 'Enterprise risk management platforms enabling real-time risk assessment, automated audit workflows, policy governance, and incident response orchestration.',
            icon: 'Network',
            sortOrder: 1,
            features: ['Risk Assessment', 'Audit Automation', 'Policy Management', 'Incident Response'],
          },
        ],
      },
    ];

    for (const cat of serviceCategories) {
      const { services, ...catData } = cat;
      const createdCat = await prisma.serviceCategory.upsert({
        where: { name: catData.name },
        update: catData,
        create: Object.assign({}, catData, { id: 'svc-cat-' + catData.name.toLowerCase().replace(/\s+/g, '-') }),
      });
      for (const svc of services) {
        const { features, ...svcData } = svc;
        const svcId = 'svc-' + svc.title.toLowerCase().replace(/\s+/g, '-');
        const createdSvc = await prisma.service.upsert({
          where: { id: svcId },
          update: Object.assign({}, svcData, { categoryId: createdCat.id }),
          create: Object.assign({}, svcData, { id: svcId, categoryId: createdCat.id }),
        });
        for (let i = 0; i < features.length; i++) {
          const featId = 'feat-' + svc.title.toLowerCase().replace(/\s+/g, '-') + '-' + i;
          await prisma.serviceFeature.upsert({
            where: { id: featId },
            update: { label: features[i], sortOrder: i },
            create: { id: featId, label: features[i], sortOrder: i, serviceId: createdSvc.id },
          });
        }
      }
    }
    console.log('✓ Seeded 4 service categories with 8 services');
    
    // 8. Seed Global Blocks
    const globalBlocks = [
      {
        name: 'technological-edge',
        type: 'custom',
        content: JSON.stringify([
          { title: 'End-to-End Delivery', desc: 'Hands-on project supervision from initial concept through full-scale deployment and post-launch support.' },
          { title: 'Implementation-Ready Portfolio', desc: 'Over 300 solution touchpoints rapidly deployable to address diverse and complex client needs.' },
          { title: 'Future-Proof Innovation', desc: 'Continuously enhanced with the latest AI, machine learning, and data security advancements.' },
          { title: 'Cross-Industry Intelligence', desc: 'Deep domain expertise across government, oil & gas, healthcare, finance, and industrial sectors.' },
        ]),
      },
      {
        name: 'why-partner',
        type: 'custom',
        content: JSON.stringify([
          { icon: 'Star', title: 'Proven Track Record', desc: 'Decades of successful high-stakes project delivery across government and enterprise clients in Nigeria and West Africa.' },
          { icon: 'Clock', title: 'Speed to Market', desc: 'Our implementation-ready portfolio of 300+ touchpoints means solutions can be rapidly deployed to address your most urgent needs.' },
          { icon: 'Eye', title: 'Total Transparency', desc: 'We believe in open communication and hands-on project governance — you always know exactly where your investment stands.' },
        ]),
      },
    ];
    
    for (const block of globalBlocks) {
      await prisma.globalBlock.upsert({
        where: { name: block.name },
        update: block,
        create: { ...block, id: `block-${block.name}` },
      });
    }
    console.log(`✓ Seeded ${globalBlocks.length} global blocks`);
    
    console.log('\n✅ CMS data seeding complete!');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seedCMSData();