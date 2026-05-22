"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { createRule } from "./actions";
import { RuleForm, emptyFormState } from "./RuleForm";

interface AddRuleButtonProps {
  nextSortOrder: number;
}

export function AddRuleButton({ nextSortOrder }: AddRuleButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Добавить правило
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white border-gray-200 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              Новое правило
            </DialogTitle>
          </DialogHeader>
          {open && (
            <RuleForm
              initial={{ ...emptyFormState, sort_order: nextSortOrder }}
              submitLabel="Добавить"
              onSubmit={createRule}
              onCancel={() => setOpen(false)}
              onSuccess={() => {
                setOpen(false);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
