import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useCreateMaintenance } from '@/hooks/useMaintenance'
import { ApiError } from '@/services/api/errors'
import type { Option } from '@/types/common'
import { VehicleStatus } from '@/types/enums'
import type { Vehicle } from '@/types/vehicle'
import { vehicleStatusMeta } from '@/utils/statusPresentation'

const numberField = () =>
  z.coerce
    .number()
    .refine((v) => !Number.isNaN(v), { message: 'Enter a valid number' })
    .min(0, 'Cannot be negative')

const maintenanceFormSchema = z.object({
  vehicleId: z.string().min(1, 'Select a vehicle'),
  description: z.string().trim().min(1, 'Description is required'),
  cost: numberField(),
  scheduledDate: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
})

type MaintenanceFormInput = z.input<typeof maintenanceFormSchema>
type MaintenanceFormOutput = z.output<typeof maintenanceFormSchema>

const emptyValues: MaintenanceFormInput = {
  vehicleId: '',
  description: '',
  cost: 0,
  scheduledDate: '',
  notes: '',
}

function vehicleOptions(vehicles: Vehicle[]): Option[] {
  return vehicles.map((v) => {
    const eligible = v.status === VehicleStatus.Available
    const reason = eligible ? '' : ` (${vehicleStatusMeta[v.status].label})`
    return {
      label: `${v.registrationNumber} — ${v.model}${reason}`,
      value: v.id,
      disabled: !eligible,
    }
  })
}

export interface MaintenanceFormDialogProps {
  open: boolean
  onClose: () => void
  vehicles: Vehicle[]
}

/** Creates an Open maintenance record; the linked vehicle is set to In Shop and
 *  removed from the dispatch pool until the record is closed. */
export function MaintenanceFormDialog({ open, onClose, vehicles }: MaintenanceFormDialogProps) {
  const createMaintenance = useCreateMaintenance()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<MaintenanceFormInput, unknown, MaintenanceFormOutput>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (open) reset(emptyValues)
  }, [open, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createMaintenance.mutateAsync(values)
      onClose()
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof MaintenanceFormInput, { message })
        }
        return
      }
      setError('root', {
        message: error instanceof Error ? error.message : 'Unable to create maintenance record.',
      })
    }
  })

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Create Maintenance Record"
      description="The vehicle moves to In Shop and is removed from dispatch until closed."
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={createMaintenance.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="maintenance-form" isLoading={createMaintenance.isPending}>
            Create record
          </Button>
        </>
      }
    >
      <form id="maintenance-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        <Select
          label="Vehicle"
          required
          placeholder="Select a vehicle"
          options={vehicleOptions(vehicles)}
          error={errors.vehicleId?.message}
          {...register('vehicleId')}
        />
        <Input
          label="Description"
          required
          placeholder="e.g. Oil Change"
          error={errors.description?.message}
          {...register('description')}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cost ($)"
            type="number"
            required
            error={errors.cost?.message}
            {...register('cost')}
          />
          <Input
            label="Scheduled Date"
            type="date"
            required
            error={errors.scheduledDate?.message}
            {...register('scheduledDate')}
          />
        </div>
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
