import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { LICENSE_CATEGORY_OPTIONS } from '@/constants/licenseCategories'
import { useCreateDriver, useUpdateDriver } from '@/hooks/useDrivers'
import { ApiError } from '@/services/api/errors'
import type { Driver } from '@/types/driver'

const driverFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  licenseNumber: z.string().trim().min(1, 'License number is required'),
  licenseCategory: z.string().min(1, 'Select a licence category'),
  licenseExpiry: z.string().min(1, 'Licence expiry date is required'),
  contactNumber: z.string().trim().min(7, 'Enter a valid contact number'),
  safetyScore: z.coerce
    .number()
    .refine((v) => !Number.isNaN(v), { message: 'Enter a valid number' })
    .min(0, '0–100')
    .max(100, '0–100'),
})

type DriverFormInput = z.input<typeof driverFormSchema>
type DriverFormOutput = z.output<typeof driverFormSchema>

const emptyValues: DriverFormInput = {
  name: '',
  licenseNumber: '',
  licenseCategory: '',
  licenseExpiry: '',
  contactNumber: '',
  safetyScore: 100,
}

export interface DriverFormDialogProps {
  open: boolean
  onClose: () => void
  driver?: Driver
}

export function DriverFormDialog({ open, onClose, driver }: DriverFormDialogProps) {
  const isEditing = Boolean(driver)
  const createDriver = useCreateDriver()
  const updateDriver = useUpdateDriver()
  const isSaving = createDriver.isPending || updateDriver.isPending

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<DriverFormInput, unknown, DriverFormOutput>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    reset(
      driver
        ? {
            name: driver.name,
            licenseNumber: driver.licenseNumber,
            licenseCategory: driver.licenseCategory,
            licenseExpiry: driver.licenseExpiry,
            contactNumber: driver.contactNumber,
            safetyScore: driver.safetyScore,
          }
        : emptyValues,
    )
  }, [open, driver, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing && driver) {
        await updateDriver.mutateAsync({ id: driver.id, input: values })
      } else {
        await createDriver.mutateAsync(values)
      }
      onClose()
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof DriverFormInput, { message })
        }
        return
      }
      setError('root', {
        message: error instanceof Error ? error.message : 'Unable to save driver.',
      })
    }
  })

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Driver' : 'Add Driver'}
      description={
        isEditing
          ? `Update details for ${driver?.name}.`
          : 'Register a new driver. They start as Available.'
      }
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form="driver-form" isLoading={isSaving}>
            {isEditing ? 'Save changes' : 'Add driver'}
          </Button>
        </>
      }
    >
      <form id="driver-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input label="Name" required error={errors.name?.message} {...register('name')} />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="License Number"
            required
            error={errors.licenseNumber?.message}
            {...register('licenseNumber')}
          />
          <Select
            label="License Category"
            required
            placeholder="Select category"
            options={LICENSE_CATEGORY_OPTIONS}
            error={errors.licenseCategory?.message}
            {...register('licenseCategory')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="License Expiry"
            type="date"
            required
            error={errors.licenseExpiry?.message}
            {...register('licenseExpiry')}
          />
          <Input
            label="Contact Number"
            required
            error={errors.contactNumber?.message}
            {...register('contactNumber')}
          />
        </div>
        <Input
          label="Safety Score (0–100)"
          type="number"
          required
          error={errors.safetyScore?.message}
          {...register('safetyScore')}
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
