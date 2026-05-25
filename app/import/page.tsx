import { createClient } from '@/lib/supabase/server'
import { ImportClient } from '@/components/import/ImportClient'

export default async function ImportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <ImportClient userId={user!.id} />
}
