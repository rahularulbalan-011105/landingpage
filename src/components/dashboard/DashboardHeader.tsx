import { useNavigate } from "@tanstack/react-router";
import { LogOut, Plus, User as UserIcon } from "lucide-react";
import logo from "@/assets/constructa-logo.jpeg";
import { useAuth, displayName, initials } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/loaders";

export function DashboardHeader({
  onNewProject,
  creating,
}: {
  onNewProject: () => void;
  creating?: boolean;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Constructa"
            className="h-[52px] w-auto -rotate-3 object-contain"
          />
          <div className="hidden sm:block">
            <div className="font-display text-lg font-extrabold leading-none text-foreground">
              Dashboard
            </div>
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-tertiary">
              My robots
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onNewProject}
            disabled={creating}
            className="comic-btn inline-flex items-center justify-center gap-2 bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed"
          >
            {creating ? (
              <Spinner className="h-4 w-4 border-white/40 border-t-white" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Account menu"
                className="comic-outline-sm flex h-11 w-11 items-center justify-center bg-surface-1 font-display text-sm font-extrabold text-foreground transition-transform hover:-translate-y-0.5"
              >
                {initials(user)}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="font-bold text-foreground">{displayName(user)}</span>
                <span className="truncate text-xs font-normal text-text-tertiary">
                  {user?.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="gap-2">
                <UserIcon className="h-4 w-4" /> Signed in
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
                <LogOut className="h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
