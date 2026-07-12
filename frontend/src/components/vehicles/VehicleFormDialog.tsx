import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { VEHICLE_TYPE_OPTIONS } from '@/constants/vehicleTypes'
import { useCreateVehicle, useUpdateVehicle } from '@/hooks/useVehicles'
import { ApiError } from '@/services/api/errors'
import type { Vehicle } from '@/types/vehicle'

const numberField = (message: string) =>
  z.coerce
    .number()
    .refine((value) => !Number.isNaN(value), { message: 'Enter a valid number' })
    .min(0, message)

const vehicleFormSchema = z.object({
  registrationNumber: z
    .string()
    .trim()
    .min(1, 'Registration number is required')
    .max(20, 'Keep it under 20 characters'),
  model: z.string().trim().min(1, 'Vehicle name/model is required'),
  type: z.string().min(1, 'Select a vehicle type'),
  maxLoadCapacityKg: numberField('Cannot be negative').refine((value) => value > 0, {
    message: 'Must be greater than 0',
  }),
  odometerKm: numberField('Cannot be negative'),
  acquisitionCost: numberField('Cannot be negative'),
})

// RHF sees the pre-coercion "input" shape (numeric fields arrive as unknown/string from
// the DOM); the resolver's "output" shape is what the submit handler actually receives,
// with the coercion already applied to real numbers.
type VehicleFormInput = z.input<typeof vehicleFormSchema>
type VehicleFormOutput = z.output<typeof vehicleFormSchema>

const emptyValues: VehicleFormInput = {
  registrationNumber: '',
  model: '',
  type: '',
  maxLoadCapacityKg: 0,
  odometerKm: 0,
  acquisitionCost: 0,
}

export interface VehicleFormDialogProps {
  open: boolean
  onClose: () => void
  vehicle?: Vehicle
}

/**
 * Create/edit dialog for a vehicle. Registration-number uniqueness is enforced by
 * the service; a 409 response is mapped back onto the field via `setError`.
 */
export function VehicleFormDialog({ open, onClose, vehicle }: VehicleFormDialogProps) {
  const isEditing = Boolean(vehicle)
  const createVehicle = useCreateVehicle()
  const updateVehicle = useUpdateVehicle()
  const isSaving = createVehicle.isPending || updateVehicle.isPending

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<VehicleFormInput, unknown, VehicleFormOutput>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    reset(
      vehicle
        ? {
            registrationNumber: vehicle.registrationNumber,
            model: vehicle.model,
            type: vehicle.type,
            maxLoadCapacityKg: vehicle.maxLoadCapacityKg,
            odometerKm: vehicle.odometerKm,
            acquisitionCost: vehicle.acquisitionCost,
          }
        : emptyValues,
    )
  }, [open, vehicle, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing && vehicle) {
        await updateVehicle.mutateAsync({ id: vehicle.id, input: values })
      } else {
        await createVehicle.mutateAsync(values)
      }
      onClose()
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof VehicleFormInput, { message })
        }
        return
      }
      setError('root', {
        message: error instanceof Error ? error.message : 'Unable to save vehicle.',
      })
    }
  })

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Vehicle' : 'Add Vehicle'}
      description={
        isEditing
          ? `Update details for ${vehicle?.registrationNumber}.`
          : 'Register a new vehicle. It starts as Available.'
      }
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form="vehicle-form" isLoading={isSaving}>
            {isEditing ? 'Save changes' : 'Add vehicle'}
          </Button>
        </>
      }
    >
      <form id="vehicle-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Registration Number"
          required
          error={errors.registrationNumber?.message}
          {...register('registrationNumber')}
        />
        <Input
          label="Vehicle Name / Model"
          required
          error={errors.model?.message}
          {...register('model')}
        />
        <Select
          label="Type"
          required
          placeholder="Select a type"
          options={VEHICLE_TYPE_OPTIONS}
          error={errors.type?.message}
          {...register('type')}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Max Load Capacity (kg)"
            type="number"
            required
            error={errors.maxLoadCapacityKg?.message}
            {...register('maxLoadCapacityKg')}
          />
          <Input
            label="Odometer (km)"
            type="number"
            required
            error={errors.odometerKm?.message}
            {...register('odometerKm')}
          />
        </div>
        <Input
          label="Acquisition Cost ($)"
          type="number"
          required
          error={errors.acquisitionCost?.message}
          {...register('acquisitionCost')}
        />
        {errors.root?.message && (
          <p role="alert" className="rounded-md bg-danger-surface px-3 py-2 text-sm text-danger">
            {errors.root.message}
          </p>
        )}
      </form>
    </Dialog>
  )
}
