import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useCreateTrip } from '@/hooks/useTrips'
import { ApiError } from '@/services/api/errors'
import type { Option } from '@/types/common'
import type { Driver } from '@/types/driver'
import { VehicleStatus } from '@/types/enums'
import type { Vehicle } from '@/types/vehicle'
import { isDriverDispatchable } from '@/utils/driverRules'
import { driverStatusMeta, vehicleStatusMeta } from '@/utils/statusPresentation'

const numberField = () =>
  z.coerce
    .number()
    .refine((v) => !Number.isNaN(v), { message: 'Enter a valid number' })
    .positive('Must be greater than 0')

const tripFormSchema = z.object({
  source: z.string().trim().min(1, 'Source is required'),
  destination: z.string().trim().min(1, 'Destination is required'),
  vehicleId: z.string().min(1, 'Select a vehicle'),
  driverId: z.string().min(1, 'Select a driver'),
  cargoWeightKg: numberField(),
  plannedDistanceKm: numberField(),
})

type TripFormInput = z.input<typeof tripFormSchema>
type TripFormOutput = z.output<typeof tripFormSchema>

const emptyValues: TripFormInput = {
  source: '',
  destination: '',
  vehicleId: '',
  driverId: '',
  cargoWeightKg: 0,
  plannedDistanceKm: 0,
}

function vehicleOptions(vehicles: Vehicle[]): Option[] {
  return vehicles.map((v) => {
    const eligible = v.status === VehicleStatus.Available
    const reason = eligible ? '' : ` (${vehicleStatusMeta[v.status].label})`
    return {
      label: `${v.registrationNumber} — ${v.model}, max ${v.maxLoadCapacityKg} kg${reason}`,
      value: v.id,
      disabled: !eligible,
    }
  })
}

function driverOptions(drivers: Driver[]): Option[] {
  return drivers.map((d) => {
    const eligible = isDriverDispatchable(d)
    const reason = eligible ? '' : ` (${driverStatusMeta[d.status].label})`
    return {
      label: `${d.name} — ${d.licenseNumber}${reason}`,
      value: d.id,
      disabled: !eligible,
    }
  })
}

export interface TripFormDialogProps {
  open: boolean
  onClose: () => void
  vehicles: Vehicle[]
  drivers: Driver[]
}

/** Create dialog for a new (Draft) trip. Ineligible vehicles/drivers are shown but
 *  disabled with the reason; cargo-vs-capacity is checked against the selected vehicle. */
export function TripFormDialog({ open, onClose, vehicles, drivers }: TripFormDialogProps) {
  const createTrip = useCreateTrip()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<TripFormInput, unknown, TripFormOutput>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (open) reset(emptyValues)
  }, [open, reset])

  const onSubmit = handleSubmit(async (values) => {
    const vehicle = vehicles.find((v) => v.id === values.vehicleId)
    if (vehicle && values.cargoWeightKg > vehicle.maxLoadCapacityKg) {
      setError('cargoWeightKg', {
        message: `Cannot exceed ${vehicle.maxLoadCapacityKg} kg for the selected vehicle.`,
      })
      return
    }
    try {
      await createTrip.mutateAsync(values)
      onClose()
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof TripFormInput, { message })
        }
        return
      }
      setError('root', {
        message: error instanceof Error ? error.message : 'Unable to create trip.',
      })
    }
  })

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Create Trip"
      description="Starts as Draft. Dispatch it once ready."
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={createTrip.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="trip-form" isLoading={createTrip.isPending}>
            Create trip
          </Button>
        </>
      }
    >
      <form id="trip-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Source" required error={errors.source?.message} {...register('source')} />
          <Input
            label="Destination"
            required
            error={errors.destination?.message}
            {...register('destination')}
          />
        </div>
        <Select
          label="Vehicle"
          required
          placeholder="Select a vehicle"
          options={vehicleOptions(vehicles)}
          error={errors.vehicleId?.message}
          {...register('vehicleId')}
        />
        <Select
          label="Driver"
          required
          placeholder="Select a driver"
          options={driverOptions(drivers)}
          error={errors.driverId?.message}
          {...register('driverId')}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cargo Weight (kg)"
            type="number"
            required
            error={errors.cargoWeightKg?.message}
            {...register('cargoWeightKg')}
          />
          <Input
            label="Planned Distance (km)"
            type="number"
            required
            error={errors.plannedDistanceKm?.message}
            {...register('plannedDistanceKm')}
          />
        </div>
        {errors.root?.message && (
          <p role="alert" className="rounded-md bg-danger-surface px-3 py-2 text-sm text-danger">
            {errors.root.message}
          </p>
        )}
      </form>
    </Dialog>
  )
}
