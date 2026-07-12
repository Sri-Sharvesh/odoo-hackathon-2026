import { ShieldCheck } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/ModulePlaceholder'

export default function RoleManagementPage() {
  return (
    <ModulePlaceholder
      icon={ShieldCheck}
      title="Role Management"
      description="Manage roles and permissions for platform users."
      note="Will provide a role/permission matrix; UI gating will read from the authenticated user's role."
    />
  )
}
