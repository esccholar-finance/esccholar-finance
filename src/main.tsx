import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import "./index.css";

const DashboardPage = lazy(() =>
  import("./pages/dashboard/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);

const TransactionsPage = lazy(() =>
  import("./pages/transactions/TransactionsPage").then((module) => ({
    default: module.TransactionsPage,
  })),
);

const CategoriesPage = lazy(() =>
  import("./pages/categories/CategoriesPage").then((module) => ({
    default: module.CategoriesPage,
  })),
);

const AcademiesPage = lazy(() =>
  import("./pages/academies/AcademiesPage").then((module) => ({
    default: module.AcademiesPage,
  })),
);

const AcademyDetailsPage = lazy(() =>
  import("./pages/academies/AcademyDetailsPage").then((module) => ({
    default: module.AcademyDetailsPage,
  })),
);

const ReportsPage = lazy(() =>
  import("./pages/reports/ReportsPage").then((module) => ({
    default: module.ReportsPage,
  })),
);

const ReceiptPage = lazy(() =>
  import("./pages/receipts/ReceiptPage").then((module) => ({
    default: module.ReceiptPage,
  })),
);

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        Loading...
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<DashboardPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="academies" element={<AcademiesPage />} />
            <Route
              path="academies/:id"
              element={<AcademyDetailsPage />}
            />
            <Route path="reports" element={<ReportsPage />} />
            <Route
              path="receipts/:paymentId"
              element={<ReceiptPage />}
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
);
