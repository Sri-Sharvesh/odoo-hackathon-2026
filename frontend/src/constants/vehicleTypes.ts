import type { Option } from '@/types/common'

// TODO(api): the spec doesn't define a fixed vehicle-category list — replace with a
// backend-driven lookup if/when vehicle types become server-configurable.
export const VEHICLE_TYPE_OPTIONS: Option[] = [
  { label: 'Truck', value: 'truck' },
  { label: 'Van', value: 'van' },
  { label: 'Pickup', value: 'pickup' },
  { label: 'Trailer', value: 'trailer' },
  { label: 'Bus', value: 'bus' },
]
