// Site content that changes over time. Edit here; the page rebuilds the lists on load.

window.LAB_WORK = [
  {
    name: 'ClockBase Agent',
    kind: 'AI agents',
    status: 'bioRxiv preprint',
    text: 'AI agents that score millions of public molecular profiles with aging clocks to find interventions that change biological age. One nominated compound, ouabain, was then tested in aged mice.',
    links: [['Platform', 'https://www.clockbase.org/'], ['Preprint', 'https://doi.org/10.1101/2023.02.28.530532']]
  },
  {
    name: 'HealthFlux',
    kind: 'World model',
    status: 'medRxiv preprint',
    text: 'A world model of human health. It learns how a person’s health state changes over time from clinical and molecular records.',
    links: [['Preprint', 'https://doi.org/10.64898/2026.09.19.26363460']]
  },
  {
    name: 'MethylGPT',
    kind: 'Foundation model',
    status: 'bioRxiv preprint',
    text: 'A foundation model for the DNA methylome. It learns reusable representations of methylation that support age prediction and imputation of missing values.',
    links: [['Code', 'https://github.com/albert-ying/MethylGPT'], ['Preprint', 'https://doi.org/10.1101/2024.10.30.621013']]
  },
  {
    name: 'Causality-enriched clocks',
    kind: 'Aging biomarkers',
    status: 'Nature Aging, 2024',
    text: 'Epigenetic clocks built from methylation sites with genetic evidence of a causal effect on aging-related traits. They distinguish changes inferred to be damaging from those inferred to be adaptive.',
    links: [['Paper', 'https://doi.org/10.1038/s43587-023-00557-0']]
  },
  {
    name: 'Biolearn',
    kind: 'Open-source library',
    status: 'Nature Aging, 2025',
    text: 'An open-source library for curating and evaluating aging biomarkers across cohorts, so that clocks can be compared on the same data.',
    links: [['Software', 'https://bio-learn.github.io/'], ['Paper', 'https://doi.org/10.1038/s43587-025-00987-y']]
  },
  {
    name: 'Autonomous Lab',
    kind: 'Software',
    status: 'Released 2026',
    text: 'An open-source MCP server in which AI agents take the roles of principal investigator and trainee and iterate on a project, while a person reviews and steers the work.',
    links: [['Site', 'https://autolab.kejunying.com'], ['Code', 'https://github.com/albert-ying/autonomous-lab']]
  }
];

// tag: 'ai' (models and agents) or 'aging' (aging biology and biomarkers)
window.LAB_PUBS = [
  { year: 2026, tag: 'ai', preprint: true, img: 'assets/img/paper-00.webp', finding: "HealthFlux is a pan-modal world model trained on 502,166 UK Biobank participants. It treats health as a single hidden state that keeps evolving between observations and is updated whenever a new measurement arrives, such as a blood test, diagnosis, molecular profile or brain and body MRI, and from that state it predicts 1,256 diseases and death over twenty years.",
    title: 'A world model simulates the latent dynamics of human health',
    authors: 'Wang, Z., Zhang, O., Wang, J., Jiang, Y., Ma, Z. C., …, Gladyshev, V. N., Wyss-Coray, T., Ying, K.',
    venue: 'medRxiv', url: 'https://doi.org/10.64898/2026.09.19.26363460' },
  { year: 2025, tag: 'ai', preprint: true, img: 'assets/img/paper-01.webp', finding: "ClockBase Agent uses specialized AI agents to reanalyze millions of public human and mouse methylation and RNA-seq samples with over 40 aging clocks. Across 43,602 intervention-control comparisons, the agents found more than 500 interventions that significantly reduce biological age. One top candidate, ouabain, reduced frailty progression and neuroinflammation and improved cardiac function in aged mice.",
    title: 'Autonomous AI agents discover aging interventions from millions of molecular profiles',
    authors: 'Ying, K., Tyshkovskiy, A., Moldakozhayev, A., …, Gladyshev, V. N.',
    venue: 'bioRxiv', url: 'https://doi.org/10.1101/2023.02.28.530532' },
  { year: 2024, tag: 'ai', preprint: true, img: 'assets/img/paper-02.webp', finding: "MethylGPT is a transformer foundation model trained on about 154,000 human DNA methylation profiles across tissues and 49,156 CpG sites. It learns biologically meaningful representations of CpG sites and reconstructs methylation values accurately even when up to 70% of the data are missing.",
    title: 'MethylGPT: a foundation model for the DNA methylome',
    authors: 'Ying, K., Song, J., Cui, H., …, Gladyshev, V. N.',
    venue: 'bioRxiv', url: 'https://doi.org/10.1101/2024.10.30.621013' },
  { year: 2024, tag: 'aging', preprint: true, img: 'assets/img/paper-03.webp', finding: "Ageome estimates the epigenetic age of thousands of molecular pathways at once in mice and humans, which shows that an organism's functional modules age at different rates and have different biological ages; this view captures more of aging than a single clock estimate.",
    title: 'High-dimensional Ageome representations of biological aging across functional modules',
    authors: 'Ying, K., Tyshkovskiy, A., Chen, Q., …, Gladyshev, V. N.',
    venue: 'bioRxiv', url: 'https://doi.org/10.1101/2024.09.17.613599' },
  { year: 2026, tag: 'aging', img: 'assets/img/paper-04.webp', finding: "Integrating more than 11,000 transcriptomes from more than 25 tissues of mouse, rat, macaque and human, the study builds biomarkers of age and expected mortality and finds conserved transcriptomic signatures of ageing and mortality, including CDKN1A and LGALS3. These signatures are organized into modules (inflammation, interferon signalling, mitochondrial function, chromatin modification and extracellular matrix), and interventions affect the modules differently.",
    title: 'Universal transcriptomic hallmarks of mammalian ageing and mortality',
    authors: 'Tyshkovskiy, A., Kholdina, D., Davitadze, M., …, Ying, K., …, Gladyshev, V. N.',
    venue: 'Nature', url: 'https://doi.org/10.1038/s41586-026-10542-3' },
  { year: 2026, tag: 'aging', img: 'assets/img/paper-05.webp', finding: "In the Biomarkers of Aging Challenge, an open two-phase competition on blinded blood DNA-methylation and proteomic data from 500 Mass General Brigham Biobank participants, architecturally diverse team models roughly halved the age-prediction error of the best published clock, and a proteomic model predicted all-cause mortality better than GrimAge.",
    title: 'An open competition for biomarkers of aging',
    authors: 'Ying, K., Paulson, S., Reinhard, J., …, Gladyshev, V. N.',
    venue: 'Nature Aging', url: 'https://doi.org/10.1038/s43587-026-01139-6' },
  { year: 2026, tag: 'aging', img: 'assets/img/paper-06.webp', finding: "Integrating age-related DNA methylation changes with age-related gene expression changes in blood identifies multi-omic aging genes. These genes are enriched for adaptive immune functions, replicate more robustly across diverse populations, and associate more strongly with aging-related outcomes than genes found from either data type alone.",
    title: 'Integrative epigenetics and transcriptomics identify aging genes in human blood',
    authors: 'Moqri, M., Ying, K., Poganik, J., Herzog, C., …, Snyder, M. P., Gladyshev, V. N.',
    venue: 'Nature Communications', url: 'https://doi.org/10.1038/s41467-025-67369-1' },
  { year: 2026, tag: 'ai', img: 'assets/img/paper-07.webp', finding: "Proteo-R1 splits protein design in two: a multimodal language model reads sequence, structure and text to name the few residues that govern binding, and those residues are then held fixed as hard constraints while a diffusion model generates the surrounding sequence and structure.",
    title: 'Proteo-R1: reasoning foundation models for de novo protein design',
    authors: 'Wu, F., Xuan, W., Qi, H., …, Ying, K., …, Choi, Y.',
    venue: 'ICML', url: 'https://arxiv.org/abs/2605.02937' },
  { year: 2025, tag: 'aging', img: 'assets/img/paper-08.webp', finding: "Biolearn, an open-source framework, evaluates 39 aging biomarkers on standardized data from over 20,000 individuals and shows that a clock's accuracy at predicting chronological age does not correlate with its ability to predict mortality, so the best biomarker depends on the outcome of interest.",
    title: 'A unified framework for systematic curation and evaluation of aging biomarkers',
    authors: 'Ying, K., Paulson, S., Eames, A., Tyshkovskiy, A., …, Gladyshev, V. N.',
    venue: 'Nature Aging', url: 'https://doi.org/10.1038/s43587-025-00987-y' },
  { year: 2025, tag: 'aging', img: 'assets/img/paper-09.webp', finding: "In paired CSF and plasma samples from 2,171 older adults, CSF-to-plasma ratios rose with age for 848 proteins and fell for 64, which points to a brain barrier system that becomes leakier selectively by protein; higher ratios of some peripherally derived proteins went with preserved cognition, and genetic loci shaped the ratios of 241 proteins.",
    title: 'Disruption of the cerebrospinal fluid–plasma protein balance in cognitive impairment and aging',
    authors: 'Farinas, A., Rutledge, J., Bot, V. A., Western, D., Ying, K., …, Wyss-Coray, T.',
    venue: 'Nature Medicine', url: 'https://doi.org/10.1038/s41591-025-03831-3' },
  { year: 2024, tag: 'aging', img: 'assets/img/paper-10.webp', finding: "This Tools of the Trade article describes epigenome-wide Mendelian randomization, which uses inherited genetic variants to test which DNA methylation sites in an epigenetic clock have potential causal links to lifespan and healthspan.",
    title: 'Causal inference for epigenetic ageing',
    authors: 'Ying, K.',
    venue: 'Nature Reviews Genetics', url: 'https://doi.org/10.1038/s41576-024-00799-7' },
  { year: 2024, tag: 'aging', img: 'assets/img/paper-11.webp', finding: "Epigenome-wide Mendelian randomization identifies CpG sites that are putatively causal for aging traits, some damaging and some protective, and these sites are used to build separate DamAge and AdaptAge clocks that track detrimental and adaptive methylation changes, respectively.",
    title: 'Causality-enriched epigenetic age uncouples damage and adaptation',
    authors: 'Ying, K., Liu, H., Tarkhov, A. E., Sadler, M. C., Lu, A. T., Moqri, M., Horvath, S., Kutalik, Z., Shen, X., Gladyshev, V. N.',
    venue: 'Nature Aging', url: 'https://doi.org/10.1038/s43587-023-00557-0' },
  { year: 2024, tag: 'aging', img: 'assets/img/paper-12.webp', finding: "Whole-exome sequencing of Ashkenazi Jewish cohorts showed that centenarians carry an 11-22% lower burden of rare loss-of-function mutations than controls (a pattern also seen in their offspring), and gene-level analysis with Mendelian randomization and multi-omic analyses identified RGP1, PCNX2 and ANO9 as longevity genes.",
    title: 'Depletion of loss-of-function germline mutations in centenarians reveals longevity genes',
    authors: 'Ying, K., Castro, J. P., Shindyapina, A. V., …, Gladyshev, V. N.',
    venue: 'Nature Communications', url: 'https://doi.org/10.1038/s41467-024-52967-2' },
  { year: 2024, tag: 'aging', img: 'assets/img/paper-13.webp', finding: "There is no consensus on how omic biomarkers of aging should be validated, so the authors review how well these biomarkers predict aging outcomes in population studies, discuss the problems of comparing them and generalizing across populations, and recommend validation steps to support clinical translation and their use in gerotherapeutic trials.",
    title: 'Validation of biomarkers of aging',
    authors: 'Moqri, M., Herzog, C., Poganik, J. R., Ying, K., …, Ferrucci, L.',
    venue: 'Nature Medicine', url: 'https://doi.org/10.1038/s41591-023-02784-9' }
];
