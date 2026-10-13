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
  { year: 2026, tag: 'ai', preprint: true,
    title: 'A world model simulates the latent dynamics of human health',
    authors: 'Wang, Z., Zhang, O., Wang, J., Jiang, Y., Ma, Z. C., …, Gladyshev, V. N., Wyss-Coray, T., Ying, K.',
    venue: 'medRxiv', url: 'https://doi.org/10.64898/2026.09.19.26363460' },
  { year: 2025, tag: 'ai', preprint: true,
    title: 'Autonomous AI agents discover aging interventions from millions of molecular profiles',
    authors: 'Ying, K., Tyshkovskiy, A., Moldakozhayev, A., …, Gladyshev, V. N.',
    venue: 'bioRxiv', url: 'https://doi.org/10.1101/2023.02.28.530532' },
  { year: 2024, tag: 'ai', preprint: true,
    title: 'MethylGPT: a foundation model for the DNA methylome',
    authors: 'Ying, K., Song, J., Cui, H., …, Gladyshev, V. N.',
    venue: 'bioRxiv', url: 'https://doi.org/10.1101/2024.10.30.621013' },
  { year: 2024, tag: 'aging', preprint: true,
    title: 'High-dimensional Ageome representations of biological aging across functional modules',
    authors: 'Ying, K., Tyshkovskiy, A., Chen, Q., …, Gladyshev, V. N.',
    venue: 'bioRxiv', url: 'https://doi.org/10.1101/2024.09.17.613599' },
  { year: 2026, tag: 'aging',
    title: 'Universal transcriptomic hallmarks of mammalian ageing and mortality',
    authors: 'Tyshkovskiy, A., Kholdina, D., Davitadze, M., …, Ying, K., …, Gladyshev, V. N.',
    venue: 'Nature', url: 'https://doi.org/10.1038/s41586-026-10542-3' },
  { year: 2026, tag: 'aging',
    title: 'An open competition for biomarkers of aging',
    authors: 'Ying, K., Paulson, S., Reinhard, J., …, Gladyshev, V. N.',
    venue: 'Nature Aging', url: 'https://doi.org/10.1038/s43587-026-01139-6' },
  { year: 2026, tag: 'aging',
    title: 'Integrative epigenetics and transcriptomics identify aging genes in human blood',
    authors: 'Moqri, M., Ying, K., Poganik, J., Herzog, C., …, Snyder, M. P., Gladyshev, V. N.',
    venue: 'Nature Communications', url: 'https://doi.org/10.1038/s41467-025-67369-1' },
  { year: 2026, tag: 'ai',
    title: 'Proteo-R1: reasoning foundation models for de novo protein design',
    authors: 'Wu, F., Xuan, W., Qi, H., …, Ying, K., …, Choi, Y.',
    venue: 'ICML', url: 'https://arxiv.org/abs/2605.02937' },
  { year: 2025, tag: 'aging',
    title: 'A unified framework for systematic curation and evaluation of aging biomarkers',
    authors: 'Ying, K., Paulson, S., Eames, A., Tyshkovskiy, A., …, Gladyshev, V. N.',
    venue: 'Nature Aging', url: 'https://doi.org/10.1038/s43587-025-00987-y' },
  { year: 2025, tag: 'aging',
    title: 'Disruption of the cerebrospinal fluid–plasma protein balance in cognitive impairment and aging',
    authors: 'Farinas, A., Rutledge, J., Bot, V. A., Western, D., Ying, K., …, Wyss-Coray, T.',
    venue: 'Nature Medicine', url: 'https://doi.org/10.1038/s41591-025-03831-3' },
  { year: 2024, tag: 'aging',
    title: 'Causal inference for epigenetic ageing',
    authors: 'Ying, K.',
    venue: 'Nature Reviews Genetics', url: 'https://doi.org/10.1038/s41576-024-00799-7' },
  { year: 2024, tag: 'aging',
    title: 'Causality-enriched epigenetic age uncouples damage and adaptation',
    authors: 'Ying, K., Liu, H., Tarkhov, A. E., Sadler, M. C., Lu, A. T., Moqri, M., Horvath, S., Kutalik, Z., Shen, X., Gladyshev, V. N.',
    venue: 'Nature Aging', url: 'https://doi.org/10.1038/s43587-023-00557-0' },
  { year: 2024, tag: 'aging',
    title: 'Depletion of loss-of-function germline mutations in centenarians reveals longevity genes',
    authors: 'Ying, K., Castro, J. P., Shindyapina, A. V., …, Gladyshev, V. N.',
    venue: 'Nature Communications', url: 'https://doi.org/10.1038/s41467-024-52967-2' },
  { year: 2024, tag: 'aging',
    title: 'Validation of biomarkers of aging',
    authors: 'Moqri, M., Herzog, C., Poganik, J. R., Ying, K., …, Ferrucci, L.',
    venue: 'Nature Medicine', url: 'https://doi.org/10.1038/s41591-023-02784-9' }
];
