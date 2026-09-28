import { Menu, Wallet, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";

interface TopbarProps {
  onMenu: () => void;
}

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/transactions": "Transactions",
  "/categories": "Categories",
  "/academies": "Academies",
  "/reports": "Reports",
};

export function Topbar({ onMenu }: TopbarProps) {
  const location = useLocation();
  const title = titles[location.pathname] ?? "Finance";

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={21} />
        </button>

        <div>
          <h1 className="text-lg font-semibold text-slate-950">{title}</h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            E-Sccholar Finance Management
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:flex">
          <Wallet size={17} />
          Financial Year
          <ChevronDown size={15} />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
          A
        </div>
      </div>
    </header>
  );
}
