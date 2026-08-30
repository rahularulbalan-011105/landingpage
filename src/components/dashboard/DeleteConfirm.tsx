import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Project } from "@/lib/projects";

export function DeleteConfirm({
  project,
  open,
  onOpenChange,
  onConfirm,
}: {
  project: Project | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="comic-outline border-ink bg-background">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl font-extrabold text-foreground">
            Delete “{project?.title || "this robot"}”?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-text-secondary">
            This permanently deletes the project and its share links. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-2 border-ink font-bold">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="comic-btn border-ink bg-destructive font-bold text-white hover:bg-destructive"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
