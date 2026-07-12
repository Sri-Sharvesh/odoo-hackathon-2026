import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useCreateFuelLog, useUpdateFuelLog } from '@/hooks/useFuelLogs'
import { ApiError } from '@/services/api/errors'
import type { Option } from '@/types/common'
import type { FuelLog } from '@/types/fuelLog'
import type { Vehicle } from '@/types/vehicle'

const numberField = () =>
  z.coerce
    .number()
    .refine((v) => !Number.isNaN(v), { message: 'Enter a valid number' })
    .min(0, 'Cannot be negative')

const fuelLogFormSchema = z.object({
  vehicleId: z.string().min(1, 'Select a vehicle'),
  liters: numberField().refine((v) => v > 0, { message: 'Must be greater than 0' }),
  cost: numberField(),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
})

type FuelLogFormInput = z.input<typeof fuelLogFormSchema>
type FuelLogFormOutput = z.output<typeof fuelLogFormSchema>

const emptyValues: FuelLogFormInput = { vehicleId: '', liters: 0, cost: 0, date: '', notes: '' }

function vehicleOptions(vehicles: Vehicle[]): Option[] {
  return vehicles.map((v) => ({ label: `${v.registrationNumber} — ${v.model}`, value: v.id }))
}

export interface FuelLogFormDialogProps {
  open: boolean
  onClose: () => void
  vehicles: Vehicle[]
  fuelLog?: FuelLog
}

export function FuelLogFormDialog({ open, onClose, vehicles, fuelLog }: FuelLogFormDialogProps) {
  const isEditing = Boolean(fuelLog)
  const createFuelLog = useCreateFuelLog()
  const updateFuelLog = useUpdateFuelLog()
  const isSaving = createFuelLog.isPending || updateFuelLog.isPending

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FuelLogFormInput, unknown, FuelLogFormOutput>({
    resolver: zodResolver(fuelLogFormSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    reset(
      fuelLog
        ? {
            vehicleId: fuelLog.vehicleId,
            liters: fuelLog.liters,
            cost: fuelLog.cost,
            date: fuelLog.date,
            notes: fuelLog.notes ?? '',
          }
        : emptyValues,
    )
  }, [open, fuelLog, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing && fuelLog) {
        await updateFuelLog.mutateAsync({ id: fuelLog.id, input: values })
      } else {
        await createFuelLog.mutateAsync(values)
      }
      onClose()
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof FuelLogFormInput, { message })
        }
        return
      }
      setError('root', {
        message: error instanceof Error ? error.message : 'Unable to save fuel log.',
      })
    }
  })

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Fuel Log' : 'Add Fuel Log'}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form="fuel-log-form" isLoading={isSaving}>
            {isEditing ? 'Save changes' : 'Add fuel log'}
          </Button>
        </>
      }
    >
      <form id="fuel-log-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        <Select
          label="Vehicle"
          required
          placeholder="Select a vehicle"
          options={vehicleOptions(vehicles)}
          error={errors.vehicleId?.message}
          {...register('vehicleId')}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Liters"
            type="number"
            required
            error={errors.liters?.message}
            {...register('liters')}
          />
          <Input
            label="Cost ($)"
            type="number"
            required
            error={errors.cost?.message}
            {...register('cost')}
          />
        </div>
        <Input label="Date" type="date" required error={errors.date?.message} {...register('date')} />
        <Input label="Notes (optional)" {...register('notes')} />
        {errors.root?.message && (
          <p role="alert" className="rounded-md bg-danger-surface px-3 py-2 text-sm text-danger">
            {errors.root.message}
          </p>
        )}
      </form>
    </Dialog>
  )
}
