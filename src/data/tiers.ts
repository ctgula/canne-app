export interface Strain {
  id: string;
  title: string;
  description?: string;
  img: string;
  thc?: string;
  cbd?: string;
  type?: 'sativa' | 'indica' | 'hybrid';
}

export interface Tier {
  slug: string;
  name: string;
  weight: string;
  price: number;
  color: {
    gradient: string;
    bg: string;
    border: string;
  };
  description: string;
  features: string[];
  premium?: boolean;
  strains: Strain[];
}

// Using placeholder images for our strains to match each tier's color theme
const placeholderImages = {
  pink: '/images/placeholder-pink.svg', // Pink theme for Starter tier
  violet: '/images/placeholder-violet.svg', // Violet theme for Classic tier
  black: '/images/placeholder-black.svg', // Black theme for Black tier
  indigo: '/images/placeholder-indigo.svg', // Indigo theme for Ultra tier
};

export const tiers: Tier[] = [
  {
    slug: 'starter',
    name: 'Starter',
    weight: '3.5g',
    price: 25,
    color: {
      gradient: 'from-pink-500 to-rose-500',
      bg: 'bg-pink-500',
      border: 'border-pink-500',
    },
    description: 'One exclusive digital art piece paired with a light complimentary gift of premium flower — just enough to vibe.',
    features: [
      'One exclusive digital art piece',
      '3.5g complimentary premium flower',
      'Light gift experience',
    ],
    strains: [
      {
        id: 'starter-1',
        title: 'Pink Dream',
        description: 'A sweet, fruity hybrid with relaxing effects',
        img: placeholderImages.pink,
        thc: '18%',
        cbd: '0.5%',
        type: 'hybrid'
      },
      {
        id: 'starter-2',
        title: 'Strawberry Haze',
        description: 'Energizing sativa with berry notes',
        img: placeholderImages.pink,
        thc: '20%',
        cbd: '0.2%',
        type: 'sativa'
      },
    ]
  },
  {
    slug: 'classic',
    name: 'Classic',
    weight: '7g',
    price: 45,
    color: {
      gradient: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-500',
      border: 'border-violet-500',
    },
    description: 'A digital art piece bundled with a more generous gift of premium cannabis — for longer sessions and better value.',
    features: [
        'One digital art piece',
        '7g complimentary premium flower',
        'More generous gift experience',
    ],
    strains: [
      {
        id: 'classic-1',
        title: 'Purple Punch',
        description: 'A dessert-like indica with grape candy aroma',
        img: placeholderImages.violet,
        thc: '22%',
        cbd: '0.1%',
        type: 'indica'
      },
      {
        id: 'classic-2',
        title: 'Violet Haze',
        description: 'Balanced hybrid with creative effects',
        img: placeholderImages.violet,
        thc: '19%',
        cbd: '0.3%',
        type: 'hybrid'
      },
    ]
  },
  {
    slug: 'black',
    name: 'Black',
    weight: '14g',
    price: 75,
    color: {
      gradient: 'from-gray-700 to-black',
      bg: 'bg-gray-800',
      border: 'border-gray-600',
    },
    description: 'One digital art piece that unlocks a double-sized gift of top-shelf flower — stronger strains, deeper experience.',
    features: [
        'One digital art piece',
        '14g top-shelf flower',
        'Double-sized gift experience',
        'Stronger strains',
    ],
    strains: [
      {
        id: 'black-1',
        title: 'Black Diamond',
        description: 'Premium indica with deep relaxation effects',
        img: placeholderImages.black,
        thc: '24%',
        cbd: '0.2%',
        type: 'indica'
      },
      {
        id: 'black-2',
        title: 'Midnight Express',
        description: 'Rich, earthy indica for evening enjoyment',
        img: placeholderImages.black,
        thc: '23%',
        cbd: '0.3%',
        type: 'indica'
      },
    ]
  },
  {
    slug: 'ultra',
    name: 'Ultra',
    weight: '28g',
    price: 140,
    color: {
      gradient: 'from-purple-500 to-indigo-600',
      bg: 'bg-indigo-600',
      border: 'border-indigo-500',
    },
    description: 'Our highest-tier digital art offering comes with a heavy, full-ounce gift of high-grade cannabis — elite quality, maximum generosity.',
    features: [
        'One premium digital art piece',
        '28g high-grade cannabis',
        'Maximum gift generosity',
        'Elite quality strains',
    ],
    premium: true,
    strains: [
      {
        id: 'ultra-1',
        title: 'Royal Purple',
        description: 'Exclusive hybrid with complex terpene profile',
        img: placeholderImages.indigo,
        thc: '26%',
        cbd: '0.4%',
        type: 'hybrid'
      },
      {
        id: 'ultra-2',
        title: 'Indigo Dream',
        description: 'Premium sativa for creative inspiration',
        img: placeholderImages.indigo,
        thc: '25%',
        cbd: '0.2%',
        type: 'sativa'
      },
    ]
  },
];
