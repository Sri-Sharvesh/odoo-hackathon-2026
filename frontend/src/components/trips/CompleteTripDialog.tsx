import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { useCompleteTrip } from '@/hooks/useTrips'
import type { Trip } from '@/types/trip'

const numberField = () =>
  z.coerce
    .number()
    .refine((v) => !Number.isNaN(v), { message: 'Enter a valid number' })
    .min(0, 'Cannot be negative')

const completeFormSchema = z.object({
  finalOdometerKm: numberField(),
  fuelConsumedLiters: numberField(),
})

type CompleteFormInput = z.input<typeof completeFormSchema>
type CompleteFormOutput = z.output<typeof completeFormSchema>

export interface CompleteTripDialogProps {
  trip: Trip | null
  onClose: () => void
}

/** Captures final odometer + fuel consumed, then marks the trip Completed and
 *  restores the vehicle/driver to Available (per the mandatory business rules). */
export function CompleteTripDialog({ trip, onClose }: CompleteTripDialogProps) {
  const completeTrip = useCompleteTrip()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteFormInput, unknown, CompleteFormOutput>({
    resolver: zodResolver(completeFormSchema),
    defaultValues: { finalOdometerKm: 0, fuelConsumedLiters: 0 },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!trip) return
    await completeTrip.mutateAsync({ id: trip.id, input: values })
    onClose()
  })

  return (
    <Dialog
      open={trip !== null}
      onClose={onClose}
      title="Complete Trip"
      description={trip ? `${trip.source} → ${trip.destination}` : undefined}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={completeTrip.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="complete-trip-form" isLoading={completeTrip.isPending}>
            Mark completed
          </Button>
        </>
      }
    >
      <form id="complete-trip-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Final Odometer (km)"
          type="number"
          required
          error={errors.finalOdometerKm?.message}
          {...register('finalOdometerKm')}
        />
        <Input
          label="Fuel Consumed (liters)"
          type="number"
          required
          error={errors.fuelConsumedLiters?.message}
          {...register('fuelConsumedLiters')}
        />
      </form>
    </Dialog>
  )
}
