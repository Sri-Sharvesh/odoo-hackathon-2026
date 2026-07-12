import { UserCircle } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/ModulePlaceholder'

export default function UserProfilePage() {
  return (
    <ModulePlaceholder
      icon={UserCircle}
      title="User Profile"
      description="Your account details and preferences."
      note="Will let the signed-in user view and update their profile and change their password."
    />
  )
}
