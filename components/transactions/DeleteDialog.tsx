'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionId: string
  description: string
  onSuccess: () => void
}

export function DeleteDialog({
  open,
  onOpenChange,
  transactionId,
  description,
  onSuccess,
}: DeleteDialogProps) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('transactions').delete().eq('id', transactionId)
    setLoading(false)
    onSuccess()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm rounded-2xl border border-border/60 shadow-2xl shadow-black/10 p-0 gap-0 overflow-hidden">
        {/* Danger header */}
        <div className="px-6 pt-6 pb-5 border-b border-border/40 bg-destructive/4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-base font-semibold">
              <div className="w-8 h-8 rounded-xl bg-destructive/12 border border-destructive/20 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-destructive" />
              </div>
              Excluir transação
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground/90">Ação irreversível</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Você está prestes a excluir permanentemente{' '}
                <span className="font-semibold text-foreground">&ldquo;{description}&rdquo;</span>.
                Essa ação não poderá ser desfeita.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 h-10 rounded-xl border-border/60 text-sm"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 h-10 rounded-xl text-sm font-semibold shadow-lg shadow-destructive/20 gap-2"
            >
              {loading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Excluindo...</>
              ) : (
                <><Trash2 className="w-3.5 h-3.5" /> Excluir</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
