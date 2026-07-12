import type { Option } from '@/types/common'

// TODO(api): replace with a backend-driven lookup if licence categories become configurable.
export const LICENSE_CATEGORY_OPTIONS: Option[] = [
  { label: 'LMV — Light Motor Vehicle', value: 'LMV' },
  { label: 'HMV — Heavy Motor Vehicle', value: 'HMV' },
  { label: 'HGV — Heavy Goods Vehicle', value: 'HGV' },
  { label: 'PSV — Passenger Service Vehicle', value: 'PSV' },
  { label: 'Trailer', value: 'Trailer' },
]
