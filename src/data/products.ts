/**
 * products.ts — single source of truth for the three product pages.
 *
 * EDIT HERE when the owner adjusts a product line. The pages at
 * src/pages/products/[slug].astro are generated from this list at build time;
 * the home Products section and the hero produce pills link to the same
 * slugs. Every image path points at a real file in /public/assets/images.
 */
export interface Product {
  slug: string;
  name: string;
  eyebrow: string;
  headline: string;
  lede: string;
  hero: { src: string; alt: string; caption: string };
  facts: { label: string; value: string }[];
  chapters: { title: string; copy: string }[];
  closing: string;
}

export const PRODUCTS: Product[] = [
  {
    slug: 'gum-arabic',
    name: 'Gum arabic',
    eyebrow: 'Register 01 · Flagship',
    headline: 'The acacia gives what no other tree gives.',
    lede: 'Raw, kibbled and mechanically processed gum arabic from Acacia Senegal and Acacia Seyal, with quality control and traceability from the tree to the buyer.',
    hero: {
      src: '/assets/images/quality-house-arabic-gum-powder-150g.webp',
      alt: 'Quality House Arabic Gum Powder, 150 g retail pack, produced in Khartoum',
      caption: 'Fig. 3A·01 — Arabic gum powder · 150 g pack · Khartoum',
    },
    facts: [
      { label: 'Species', value: 'Acacia Senegal & Acacia Seyal' },
      { label: 'Grades', value: 'Raw, kibbled and mechanically processed' },
      { label: 'Origin', value: 'Sudan, Port Sudan export' },
      { label: 'Control', value: 'Inspection, sampling and traceability' },
    ],
    chapters: [
      {
        title: 'What it is',
        copy: 'Gum arabic is the natural resin of the acacia tree: tapped by hand, cured in the sun, and graded by colour and clarity. Sudan is the world’s historic source of the gum.',
      },
      {
        title: 'How we control it',
        copy: 'Material is inspected and sampled at origin, then kibbled or mechanically processed to the grade a buyer specifies. What is inspected is documented; what is documented can be traced.',
      },
      {
        title: 'How it ships',
        copy: 'Bagged and containerised at Port Sudan, with export documentation travelling with the shipment so the buyer knows exactly what was loaded and when.',
      },
    ],
    closing:
      'Tell us the grade, the volume and the destination port. We will respond with what we can verify and supply.',
  },
  {
    slug: 'cotton',
    name: 'Cotton',
    eyebrow: 'Register 02 · Origins',
    headline: 'White gold, classed and documented.',
    lede: 'Superintending, sampling, reweighing, classing, testing, inspection, trading and export of Sudanese cotton, the full chain under one house.',
    hero: {
      src: '/assets/images/heritage-cotton-port.webp',
      alt: 'Baled cotton slung for loading among the cranes at Port Sudan',
      caption: 'Fig. 3B·01 — Baled cotton at the port · Port Sudan',
    },
    facts: [
      { label: 'Chain', value: 'Superintending → classing → export' },
      { label: 'Testing', value: 'Sampling, reweighing, classing, inspection' },
      { label: 'Origin', value: 'Sudan, Port Sudan export' },
      { label: 'Control', value: 'Documented at every stage' },
    ],
    chapters: [
      {
        title: 'At the field',
        copy: 'Cotton is sampled and supervised from the field stage: the earlier the chain is controlled, the fewer the surprises at the port.',
      },
      {
        title: 'At the classing house',
        copy: 'Classing and testing separate the crop by grade. The results are documented before any bale is committed to a buyer.',
      },
      {
        title: 'At the port',
        copy: 'Bales are reweighed, inspected and loaded at Port Sudan with export documentation travelling with the shipment.',
      },
    ],
    closing:
      'Tell us the grade, the volume and the destination port. We will respond with what we can verify and supply.',
  },
  {
    slug: 'seeds',
    name: 'Seeds',
    eyebrow: 'Register 03 · Improved & hybrid',
    headline: 'Better seed, better harvest.',
    lede: 'Improved and hybrid seeds, producer access to technical knowledge, and support for agricultural productivity across Sudan.',
    hero: {
      src: '/assets/images/seeds-mix.webp',
      alt: 'Improved and hybrid seed varieties',
      caption: 'Fig. 3C·01 — Seed varieties at the house · Sudan',
    },
    facts: [
      { label: 'Varieties', value: 'Improved and hybrid' },
      { label: 'Access', value: 'Producer access to technical knowledge' },
      { label: 'Origin', value: 'Sudan' },
      { label: 'Control', value: 'Quality tested and documented' },
    ],
    chapters: [
      {
        title: 'What we supply',
        copy: 'Improved and hybrid seed varieties selected for Sudanese growing conditions, with the technical knowledge a producer needs to use them well.',
      },
      {
        title: 'Why it matters',
        copy: 'Seed is the first control point of the harvest. Better seed, correctly used, raises productivity before any other input is spent.',
      },
      {
        title: 'How we support it',
        copy: 'We pair the seed with producer support (guidance on planting, handling and expectations) so the improvement reaches the field, not just the catalogue.',
      },
    ],
    closing:
      'Tell us the crop, the volume and the region. We will respond with what we can verify and supply.',
  },
];
