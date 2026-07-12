import type { Option } from '@/types/common'

// TODO(api): replace with a backend-driven lookup if expense categories become configurable.
export const EXPENSE_CATEGORY_OPTIONS: Option[] = [
  { label: 'Toll', value: 'toll' },
  { label: 'Parking', value: 'parking' },
  { label: 'Fine', value: 'fine' },
  { label: 'Insurance', value: 'insurance' },
  { label: 'Other', value: 'other' },
]
