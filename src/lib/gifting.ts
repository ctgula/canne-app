export type TierName = 'Starter' | 'Classic' | 'Black' | 'Ultra';

export type TierInfo = {
  oneLiner: string;
  items: string[];
};

const giftingMap: Record<TierName, TierInfo> = {
  Starter: {
    oneLiner: 'Single digital print + complimentary top-shelf gift • 3.5g flower',
    items: [
      'Single digital print',
      'Complimentary top-shelf gift',
      '3.5g complimentary flower',
    ],
  },
  Classic: {
    oneLiner: 'Double art series + two curated gifts • 7g flower',
    items: [
      'Double art series with signature',
      'Two curated gifts',
      '7g complimentary flower',
    ],
  },
  Black: {
    oneLiner: 'Limited collection prints + four premium gifts • 14g premium flower',
    items: [
      'Limited collection prints',
      'Four premium gifts',
      '14g premium flower',
    ],
  },
  Ultra: {
    oneLiner: 'Exclusive gallery pieces + eight premium selections • 28g premium flower • Premium badge',
    items: [
      'Exclusive gallery pieces',
      'Eight premium selections',
      '28g premium flower collection',
      'Premium tier badge',
    ],
  },
};

export function getTierInfo(tierDisplayOrRaw: string | null | undefined): TierInfo | null {
  const name = (tierDisplayOrRaw || '').toString().trim();
  // Accept either Title Case (display_tier) or lowercase raw tier
  const normalized: TierName | null =
    name === 'Starter' || name.toLowerCase() === 'starter' ? 'Starter' :
    name === 'Classic' || name.toLowerCase() === 'classic' ? 'Classic' :
    name === 'Black' || name.toLowerCase() === 'black' ? 'Black' :
    name === 'Ultra' || name.toLowerCase() === 'ultra' ? 'Ultra' :
    null;
  return normalized ? giftingMap[normalized] : null;
}
