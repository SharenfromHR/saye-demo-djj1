"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Info, ChevronDown } from "lucide-react";


const formatMoney = (n: number, ccy = "GBP") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: ccy,
    maximumFractionDigits: 2,
  }).format(n);

function computeMaturity(contractStartISO: string, termMonths: number, missedPayments = 0): Date {
  const start = new Date(contractStartISO);
  const y = start.getFullYear();
  const m = start.getMonth();
  // Always use the 1st of the month so adding months behaves nicely
  return new Date(y, m + termMonths + missedPayments, 1);
}

type PlanStatus = "invite" | "live";

type PlanConfig = {
  grantName: string;
  inviteOpen: string; // ISO datetime-local string
  inviteClose: string;
  grantDate: string; // ISO date string
  contractStart: string; // ISO date string
  optionPrice: number;
  bonusRate: number;
  minMonthly: number; // minimum monthly contribution allowed in invite
  maxMonthly: number; // maximum monthly contribution allowed in invite
  termYears: 3 | 5;
  ticker: string;
  exchange: string;
  termMonths: number; // 36 or 60 typically
  // Below are really contract-level in real life, but for the mock they sit on the plan
  monthlyContribution: number; // illustrative contribution for example contract
  missedPayments: number;
  status: PlanStatus;
  paused: boolean;
};

const CURRENT_PRICE_GBP = 1.4;
const TICKER = "DJJ";
const COMPANY = "DJJ Ltd";

interface EnrollmentState {
  amount: number;
  accepted: boolean;
  read: boolean;
  hasApplied: boolean;
}

export default function SAYEPage() {
const [view, setView] = useState<
  "participant" | "config" | "reports" | "imports"
>("participant");
  const [sayeMenuOpen, setSayeMenuOpen] = useState(true);
  const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
  const [planConfigs, setPlanConfigs] = useState<PlanConfig[]>([
    {
      grantName: "2024 SAYE Plan",
      inviteOpen: "2024-02-01T09:00",
      inviteClose: "2024-02-29T17:00",
      grantDate: "2024-03-01",
      contractStart: "2024-03-01",
      optionPrice: 1.0,
      bonusRate: 0,
      minMonthly: 10,
      maxMonthly: 500,
      termYears: 3,
      ticker: TICKER,
      exchange: "LSE",
      termMonths: 36,
      monthlyContribution: 150,
      missedPayments: 0,
      status: "live",
      paused: false,
    },
    {
      grantName: "2025 SAYE Plan",
      inviteOpen: "2025-02-01T09:00",
      inviteClose: "2025-02-28T17:00",
      grantDate: "2025-03-01",
      contractStart: "2025-03-01",
      optionPrice: 1.8,
      bonusRate: 0,
      minMonthly: 10,
      maxMonthly: 500,
      termYears: 3,
      ticker: TICKER,
      exchange: "LSE",
      termMonths: 36,
      monthlyContribution: 100,
      missedPayments: 1,
      status: "live",
      paused: false,
    },
  ]);

  const [modal, setModal] = useState<{
    type: null | "pause" | "unpause" | "cancel";
    planIdx: number | null;
  }>({ type: null, planIdx: null });

  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [enrolment, setEnrolment] = useState<EnrollmentState | null>(null);

  const enriched = useMemo(() => {
    const now = new Date();

    const livePlans = planConfigs
      .map((p, configIndex) => ({ ...p, configIndex }))
      .filter((p) => p.status === "live");

    return livePlans
      .map((p) => {
        const start = new Date(p.contractStart);
        const monthsSinceStart = Math.max(
          0,
          (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
        );
        const savingsAmount = Math.max(0, p.monthlyContribution * (monthsSinceStart - p.missedPayments));
        const optionsGranted = (p.monthlyContribution * p.termMonths) / p.optionPrice;
        const maturityDate = computeMaturity(p.contractStart, p.termMonths, p.missedPayments);
        const estimatedGain = Math.max(0, (CURRENT_PRICE_GBP - p.optionPrice) * optionsGranted);
        return {
          ...p,
          monthsSinceStart,
          savingsAmount,
          optionsGranted,
          maturityDate,
          estimatedGain,
        };
      })
      .sort((a, b) => new Date(a.contractStart).getTime() - new Date(b.contractStart).getTime());
  }, [planConfigs]);

  const buildSchedules = (p: (typeof enriched)[number]) => {
    const start = new Date(p.contractStart);
    const now = new Date();
    const lastCompleted = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    type H = { label: string; date: string; amount: number; status: "paid" | "missed" };
    type U = { label: string; date: string; amount: number; isLast?: boolean };

    const history: H[] = [];
    const upcoming: U[] = [];

    const completedMonths: Date[] = [];
    for (
      let d = new Date(start.getFullYear(), start.getMonth(), 1);
      d <= lastCompleted;
      d = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    ) {
      completedMonths.push(new Date(d));
    }

    const missedSet = new Set<string>();
    for (let i = 0; i < (p.missedPayments || 0); i++) {
      const md = completedMonths[completedMonths.length - 1 - i];
      if (md) missedSet.add(`${md.getFullYear()}:${md.getMonth()}`);
    }

    for (const d of completedMonths) {
      const label = d.toLocaleString(undefined, { month: "long", year: "numeric" });
      const date = new Date(d.getFullYear(), d.getMonth(), 10).toLocaleDateString();
      const key = `${d.getFullYear()}:${d.getMonth()}`;
      const isMissed = missedSet.has(key);
      history.push({ label, date, amount: p.monthlyContribution, status: isMissed ? "missed" : "paid" });
    }

    const maturityMonthStart = new Date(p.maturityDate.getFullYear(), p.maturityDate.getMonth(), 1);
    for (
      let d = new Date(now.getFullYear(), now.getMonth(), 10);
      d < maturityMonthStart;
      d = new Date(d.getFullYear(), d.getMonth() + 1, 10)
    ) {
      upcoming.push({
        label: d.toLocaleString(undefined, { month: "long", year: "numeric" }),
        date: d.toLocaleDateString(),
        amount: p.monthlyContribution,
      });
    }
    if (upcoming.length) upcoming[upcoming.length - 1].isLast = true;

    return { history, upcoming };
  };

  const totalMonthly = enriched.reduce((sum, p) => sum + p.monthlyContribution, 0);
  const CAP = 500;
  const capClasses =
    totalMonthly > CAP
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : totalMonthly >= CAP * 0.8
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-emerald-50 text-emerald-700 ring-emerald-200";

  const nowForInvites = new Date();
  const openInvites = planConfigs.filter((p) => {
    if (p.status !== "invite") return false;
    const open = new Date(p.inviteOpen);
    const close = new Date(p.inviteClose);
    return open <= nowForInvites && nowForInvites <= close;
  });

  const activeInvite = openInvites[0] || null;
  const minInviteMonthly =
    openInvites.length > 0 ? Math.min(...openInvites.map((p) => p.minMonthly || 0)) : null;
  const maxInviteMonthly =
    openInvites.length > 0 ? Math.max(...openInvites.map((p) => p.maxMonthly || 0)) : null;

  const hasApplied = !!enrolment?.hasApplied && !!activeInvite;

  const openPause = (idx: number) => setModal({ type: "pause", planIdx: idx });
  const openUnpause = (idx: number) => setModal({ type: "unpause", planIdx: idx });
  const openCancel = (idx: number) => setModal({ type: "cancel", planIdx: idx });
  const closeModal = () => setModal({ type: null, planIdx: null });

  const confirmModal = () => {
    const idx = modal.planIdx;
    if (idx == null) return closeModal();
    const plan = enriched[idx];
    if (!plan) return closeModal();

    if (modal.type === "pause") {
      setPlanConfigs((prev) =>
        prev.map((cfg, i) => (i === plan.configIndex ? { ...cfg, paused: true } : cfg))
      );
    } else if (modal.type === "unpause") {
      setPlanConfigs((prev) =>
        prev.map((cfg, i) => (i === plan.configIndex ? { ...cfg, paused: false } : cfg))
      );
    } else if (modal.type === "cancel") {
      alert(`Cancel & refund requested for ${plan.grantName}. You will lose the right to exercise options.`);
    }
    closeModal();
  };

  const toggleInvitePanel = () => {
    if (!activeInvite) return;
    setShowInvitePanel((prev) => {
      const next = !prev;
      if (next && !enrolment) {
        const mid = (activeInvite.minMonthly + activeInvite.maxMonthly) / 2;
        setEnrolment({ amount: mid, accepted: false, read: false, hasApplied: false });
      }
      return next;
    });
  };

  const handleConfirmEnrolment = () => {
    if (!activeInvite || !enrolment) return;
    setEnrolment((prev) => (prev ? { ...prev, hasApplied: true } : prev));
  };

  const canConfirmEnrolment = (() => {
    if (!activeInvite || !enrolment) return false;
    if (!enrolment.accepted || !enrolment.read) return false;
    if (enrolment.amount < activeInvite.minMonthly || enrolment.amount > activeInvite.maxMonthly) return false;
    return true;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-10">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-60 shrink-0">
            <nav className="sticky top-6 space-y-1 text-sm">
              {["Dashboard", "My portfolio", "My orders", "Documents", "Simulations"].map((label) => (
                <div
                  key={label}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-white/60 cursor-default"
                >
                  {label}
                </div>
              ))}

             <div className="space-y-1">
  <button
    type="button"
    onClick={() => setSayeMenuOpen((o) => !o)}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition ${
      view === "participant" ||
      view === "config" ||
      view === "reports" ||
      view === "imports"
        ? "bg-white shadow-sm ring-1 ring-slate-200 text-slate-900"
        : "text-slate-600 hover:bg-white/60"
    }`}
  >
    <span>SAYE</span>
    <ChevronDown
      className={`h-4 w-4 transition-transform ${
        sayeMenuOpen ? "rotate-180 text-emerald-600" : "text-slate-400"
      }`}
    />
  </button>
  {sayeMenuOpen && (
    <div className="ml-6 space-y-1">
      <button
        type="button"
        onClick={() => setView("participant")}
        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${
          view === "participant"
            ? "bg-slate-900 text-white"
            : "text-slate-600 hover:bg-white/70"
        }`}
      >
        Participant view
      </button>
      <button
        type="button"
        onClick={() => setView("config")}
        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${
          view === "config"
            ? "bg-slate-900 text-white"
            : "text-slate-600 hover:bg-white/70"
        }`}
      >
        Configuration
      </button>
      <button
        type="button"
        onClick={() => setView("reports")}
        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${
          view === "reports"
            ? "bg-slate-900 text-white"
            : "text-slate-600 hover:bg-white/70"
        }`}
      >
        Reports
      </button>
      <button
        type="button"
        onClick={() => setView("imports")}
        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${
          view === "imports"
            ? "bg-slate-900 text-white"
            : "text-slate-600 hover:bg-white/70"
        }`}
      >
        Imports
      </button>
    </div>
  )}
</div>


              <div className="px-3 py-2 rounded-xl text-slate-600 hover:bg:white/60 cursor-default">
                Support
              </div>
            </nav>

            <div className="mt-6 p-4 rounded-2xl shadow-sm ring-1 ring-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                  DJJ
                </div>
                <div className="text-sm font-medium text-slate-808">{COMPANY}</div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-semibold text-slate-900">£{CURRENT_PRICE_GBP.toFixed(2)}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {TICKER} • Latest date {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {view === "participant" && (
              <div className="space-y-5">
                {openInvites.length > 0 && activeInvite && (
                  <Card className="rounded-2xl border-none shadow-sm mb-1 bg-emerald-50/70 ring-1 ring-emerald-100">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="text-xs text-emerald-900">
                        <div className="font-semibold flex items-center gap-2 mb-1">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                            NEW
                          </span>
                          <span>New SAYE invitation available</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{activeInvite.grantName}</span>
                          <span className="text-[11px] text-emerald-800">
                            Apply by {new Date(activeInvite.inviteClose).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Button className="h-8 px-3 text-xs" onClick={toggleInvitePanel}>
                          {hasApplied ? "Amend application" : "Apply for SAYE"}
                        </Button>
                        {minInviteMonthly != null && maxInviteMonthly != null && (
                          <span className="text-[10px] text-emerald-800">
                            You can choose between £{minInviteMonthly} and £{maxInviteMonthly} per month during
                            enrolment.
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {showInvitePanel && activeInvite && enrolment && (
                  <Card className="rounded-2xl border-none shadow-sm">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                            Enrolment • {activeInvite.grantName}
                          </p>
                          <h2 className="text-base font-semibold text-slate-900">Step 1 · Introduction</h2>
                        </div>
                        {hasApplied && (
                          <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                            You have applied for £{enrolment.amount.toFixed(2)} per month
                          </span>
                        )}
                      </div>

                      <div className="rounded-xl overflow-hidden border border-slate-100 h-56 bg-slate-100">
                        <img
                          src="https://images.pexels.com/photos/912050/pexels-photo-912050.jpeg?auto=compress&cs=tinysrgb&w=1200"
                          alt="Airplane flying above the clouds"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <p className="text-sm text-slate-700">
                        You&apos;ve been invited to join your company&apos;s Save As You Earn (SAYE) plan. Save a fixed
                        amount from your net pay each month and, at maturity, you can use your savings to buy shares
                        at the fixed option price – or simply take your cash back.
                      </p>

                      <div className="border-t border-slate-100 pt-4 space-y-3">
                        <h3 className="text-sm font-semibold text-slate-900">Step 2 · Choose monthly amount</h3>
                        <p className="text-xs text-slate-500">
                          Choose any whole pound amount between £{activeInvite.minMonthly} and £{activeInvite.maxMonthly}.
                        </p>
                        <div className="flex flex-wrap items-end gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">Monthly savings (£)</label>
                            <input
                              type="number"
                              min={activeInvite.minMonthly}
                              max={activeInvite.maxMonthly}
                              step={1}
                              className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                              value={enrolment.amount}
                              onChange={(e) => {
                                const v = Number(e.target.value) || 0;
                                setEnrolment((prev) => (prev ? { ...prev, amount: v } : prev));
                              }}
                            />
                          </div>
                          <div className="text-xs text-slate-500">
                            <div>
                              Option price: <span className="font-medium">{formatMoney(activeInvite.optionPrice)}</span>
                            </div>
                            <div>
                              Indicative options if you complete the plan:&nbsp;
                              <span className="font-medium">
                                {Math.round(
                                  (enrolment.amount * activeInvite.termMonths) / activeInvite.optionPrice
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-4 space-y-3">
                        <h3 className="text-sm font-semibold text-slate-900">Step 3 · Confirm & apply</h3>
                        <p className="text-xs text-slate-500">
                          Tick both boxes to confirm you&apos;ve read the documents and understand how deductions will
                          work.
                        </p>
                        <div className="space-y-2 text-xs text-slate-700">
                          <label className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              className="mt-0.5"
                              checked={enrolment.read}
                              onChange={(e) =>
                                setEnrolment((prev) => (prev ? { ...prev, read: e.target.checked } : prev))
                              }
                            />
                            <span>
                              I confirm I&apos;ve read the{" "}
                              <a href="#" className="text-indigo-600 hover:underline">
                                SAYE plan rules
                              </a>{" "}
                              and the{" "}
                              <a href="#" className="text-indigo-600 hover:underline">
                                Key Information Document
                              </a>
                              .
                            </span>
                          </label>
                          <label className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              className="mt-0.5"
                              checked={enrolment.accepted}
                              onChange={(e) =>
                                setEnrolment((prev) => (prev ? { ...prev, accepted: e.target.checked } : prev))
                              }
                            />
                            <span>
                              I understand my chosen amount will be deducted from my net pay each month for the full
                              term of the plan unless I change or cancel my participation in line with the plan rules.
                            </span>
                          </label>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="text-[11px] text-slate-500">
                            You can amend your application any time while the invite window is open.
                          </div>
                          <Button
                            className="h-8 px-4 text-xs"
                            disabled={!canConfirmEnrolment}
                            onClick={handleConfirmEnrolment}
                          >
                            {hasApplied ? "Update application" : "Confirm enrolment"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="rounded-2xl border-none shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <h1 className="text-xl font-semibold tracking-tight">Save As You Earn (SAYE)</h1>
                      <div className="flex gap-4 text-xs text-slate-500">
                        <a href="#" className="hover:underline">
                          Plan Rules
                        </a>
                        <a href="#" className="hover:underline">
                          FAQ
                        </a>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Info className="h-4 w-4" />
                        <span>Missed payments extend the maturity by one month each. 13 missed = plan lapses.</span>
                      </div>
                      <div className="font-medium">
                        <span
                          className={`inline-flex items-center rounded-full ring-1 px-2.5 py-1 ${capClasses}`}
                        >
                          Total monthly: £{totalMonthly} / £500
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-none shadow-sm">
                  <CardContent className="p-0 overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-white">
                        <tr>
                          <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 py-2 px-3">
                            Plan
                          </th>
                          <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 py-2 px-3">
                            Start date
                          </th>
                          <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 py-2 px-3">
                            Maturity
                          </th>
                          <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 py-2 px-3">
                            Opt px
                          </th>
                          <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 py-2 px-3">
                            Optns
                          </th>
                          <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 py-2 px-3">
                            Missed
                          </th>
                          <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 py-2 px-3">
  <div className="flex items-center gap-1 relative group">
    Estimated gain
    <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold cursor-default">
      i
    </span>
    <div
      className="
        absolute left-1/2 -translate-x-1/2 top-full mt-1
        hidden group-hover:block
        whitespace-nowrap
        bg-slate-900 text-white text-xs px-2 py-1 rounded-md shadow-lg
        z-50
      "
    >
      (Current price – option price) × options granted. 
    </div>
  </div>
</th>

                          <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 py-2 px-3">
                            Saved
                          </th>
                          <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 py-2 px-3">
                            £/mo
                          </th>
                          <th className="text-right text-xs font-semibold uppercase tracking-wider text-slate-500 py-2 px-3">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-slate-50/50">
                        {enriched.map((p, idx) => {
                          const isOpen = !!openRows[idx];
                          const { history, upcoming } = buildSchedules(p);
                          return (
                            <React.Fragment key={idx}>
                              <tr className={`hover:bg-white/70 ${isOpen ? "bg-white/60" : ""}`}>
                                <td className="py-2 px-3 text-sm font-medium text-slate-800">
                                  <button
                                    className="flex items-center gap-1 underline-offset-2 hover:underline cursor-pointer text-left"
                                    onClick={() => setOpenRows((r) => ({ ...r, [idx]: !r[idx] }))}
                                    aria-expanded={isOpen}
                                    title="View schedule"
                                  >
                                    <ChevronDown
                                      className={`h-4 w-4 transition-transform ${
                                        isOpen ? "rotate-180 text-emerald-600" : "text-slate-400"
                                      }`}
                                    />
                                    {p.grantName}
                                  </button>
                                </td>
                                <td className="py-2 px-3 text-sm text-slate-700">
                                  {new Date(p.contractStart).toLocaleDateString()}
                                </td>
                                <td className="py-2 px-3 text-sm text-slate-700">
                                  {p.maturityDate.toLocaleDateString()}
                                </td>
                                <td className="py-2 px-3 text-sm text-slate-700">{formatMoney(p.optionPrice)}</td>
                                <td className="py-2 px-3 text-sm text-slate-700">
                                  {Math.round(p.optionsGranted).toLocaleString()}
                                </td>
                                <td className="py-2 px-3 text-sm text-slate-700">{p.missedPayments}</td>
                                <td
                                  className={`py-2 px-3 text-sm font-medium ${
                                    p.estimatedGain > 0 ? "text-emerald-700" : "text-slate-400"
                                  }`}
                                >
                                  {formatMoney(p.estimatedGain)}
                                </td>
                                <td className="py-2 px-3 text-sm text-slate-700">{formatMoney(p.savingsAmount)}</td>
                                <td className="py-2 px-3 text-sm text-slate-700">
                                  {formatMoney(p.monthlyContribution)}
                                </td>
                                <td className="py-2 px-3 text-sm whitespace-nowrap text-right">
                                  <div className="inline-flex items-center gap-2">
                                    {p.paused ? (
                                      <Button
                                        variant="outline"
                                        className="h-8 px-2 text-xs"
                                        onClick={() => openUnpause(idx)}
                                      >
                                        Unpause
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="outline"
                                        className="h-8 px-2 text-xs"
                                        onClick={() => openPause(idx)}
                                      >
                                        Pause
                                      </Button>
                                    )}
                                    <Button
                                      variant="secondary"
                                      className="h-8 px-2 text-xs"
                                      onClick={() => openCancel(idx)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                              {isOpen && (
                                <tr className="bg-white">
                                  <td colSpan={10} className="px-3 py-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <div className="text-xs font-semibold text-slate-700 mb-2">
                                          History of contributions
                                        </div>
                                        <div className="max-h-64 overflow-auto rounded-md ring-1 ring-slate-100">
                                          <div className="sticky top-0 bg-slate-50/80 backdrop-blur px-2 py-1 text-[11px] text-slate-500 font-medium [display:grid] [grid-template-columns:1fr_auto_auto] items-center">
                                            <span>Month</span>
                                            <span>Date</span>
                                            <span className="text-right">Amount</span>
                                          </div>
                                          {history.length === 0 && (
                                            <div className="px-2 py-2 text-sm text-slate-500">
                                              No contributions yet.
                                            </div>
                                          )}
                                          {history.map((row, i) => (
                                            <div
                                              key={i}
                                              className={`px-2 py-1.5 [display:grid] [grid-template-columns:1fr_auto_auto] items-center gap-2 ${
                                                row.status === "missed" ? "bg-amber-50" : "hover:bg-slate-50"
                                              }`}
                                            >
                                              <span className="text-sm text-slate-700">{row.label}</span>
                                              <span className="text-xs text-slate-500">{row.date}</span>
                                              <span
                                                className={`text-sm font-medium tabular-nums text-right ${
                                                  row.status === "missed" ? "text-amber-700" : "text-slate-900"
                                                }`}
                                              >
                                                {row.status === "missed" ? "Missed" : formatMoney(row.amount)}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs font-semibold text-slate-700 mb-2">
                                          Upcoming payments
                                        </div>
                                        <div className="max-h-64 overflow-auto rounded-md ring-1 ring-slate-100">
                                          <div className="sticky top-0 bg-slate-50/80 backdrop-blur px-2 py-1 text-[11px] text-slate-500 font-medium [display:grid] [grid-template-columns:1fr_auto_auto] items-center">
                                            <span>Month</span>
                                            <span>Date</span>
                                            <span className="text-right">Amount</span>
                                          </div>
                                          {upcoming.map((row, i) => (
                                            <div
                                              key={i}
                                              className="px-2 py-1.5 hover:bg-slate-50 [display:grid] [grid-template-columns:1fr_auto_auto] items-center gap-2"
                                            >
                                              <span className="text-sm text-slate-700">{row.label}</span>
                                              <span className="text-xs text-slate-500 flex items-center justify-start gap-2">
                                                {row.isLast && (
                                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200 whitespace-nowrap">
                                                    Last payment
                                                  </span>
                                                )}
                                                {row.date}
                                              </span>
                                              <span className="text-sm font-medium tabular-nums text-right inline-flex items-center justify-end gap-2">
                                                {formatMoney(row.amount)}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            )}

            {view === "config" && (
              <SAYEConfigView planConfigs={planConfigs} setPlanConfigs={setPlanConfigs} />
            )}
             {view === "reports" && (
    <SAYEReportsView plans={enriched} planConfigs={planConfigs} />
  )}

  {view === "imports" && (
    <SAYEImportsView planConfigs={planConfigs} />
  )}
          </main>
        </div>
      </div>

      <Modal
        open={modal.type === "pause"}
        title="Pause your SAYE contributions"
        tone="neutral"
        onClose={closeModal}
        onConfirm={confirmModal}
        confirmLabel="Confirm pause"
      >
        <ul className="list-disc pl-5 space-y-2">
          <li>Your monthly contributions will stop from the next eligible payroll cut-off.</li>
          <li>
            You will need to <strong>manually unpause</strong> when you want contributions to resume.
          </li>
          <li>
            Paused months are counted as missed payments and each missed payment moves your maturity back by one
            month.
          </li>
        </ul>
      </Modal>

      <Modal
        open={modal.type === "unpause"}
        title="Unpause your SAYE contributions"
        tone="neutral"
        onClose={closeModal}
        onConfirm={confirmModal}
        confirmLabel="Confirm unpause"
      >
        <ul className="list-disc pl-5 space-y-2">
          <li>Monthly contributions will resume from the next eligible payroll cut-off.</li>
          <li>Missed months during the pause remain missed and still delay your maturity date.</li>
        </ul>
      </Modal>

      <Modal
        open={modal.type === "cancel"}
        title="Cancel plan & refund savings"
        tone="warning"
        onClose={closeModal}
        onConfirm={confirmModal}
        confirmLabel="I understand — cancel plan"
      >
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Once cancelled, you <strong>lose the right to your SAYE options</strong>. This cannot be undone.
          </li>
          <li>Your saved contributions will be refunded in line with plan rules (usually the next payroll cycle).</li>
          <li>Any future contributions will stop immediately.</li>
        </ul>
      </Modal>
    </div>
  );
}
type ReportKey = "summary" | "missed" | "maturity" | "cap";

function SAYEReportsView({
  plans,
  planConfigs,
}: {
  plans: any[];
  planConfigs: PlanConfig[];
}) {
  const [activeReport, setActiveReport] = useState<ReportKey>("summary");

  const totalMonthly = plans.reduce(
    (sum: number, p: any) => sum + (p.monthlyContribution || 0),
    0
  );
  const CAP = 500;

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                SAYE reports
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Run quick, pre-configured reports over your SAYE contracts and
                offerings.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeReport === "summary" ? "default" : "outline"}
              className="h-8 px-3 text-xs"
              onClick={() => setActiveReport("summary")}
            >
              Active contracts
            </Button>
            <Button
              variant={activeReport === "missed" ? "default" : "outline"}
              className="h-8 px-3 text-xs"
              onClick={() => setActiveReport("missed")}
            >
              Missed payments
            </Button>
            <Button
              variant={activeReport === "maturity" ? "default" : "outline"}
              className="h-8 px-3 text-xs"
              onClick={() => setActiveReport("maturity")}
            >
              Maturity calendar
            </Button>
            <Button
              variant={activeReport === "cap" ? "default" : "outline"}
              className="h-8 px-3 text-xs"
              onClick={() => setActiveReport("cap")}
            >
              Contribution cap usage
            </Button>
          </div>
        </CardContent>
      </Card>

      {activeReport === "summary" && (
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold mb-3">
              Active contracts summary
            </h2>
            <div className="overflow-auto rounded-xl ring-1 ring-slate-100">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Plan
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Start date
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Maturity
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      £/mo
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Saved
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Options
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Est. gain
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {plans.map((p: any, i: number) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-xs font-medium text-slate-800">
                        {p.grantName}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-700">
                        {new Date(p.contractStart).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-700">
                        {p.maturityDate.toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-700">
                        {formatMoney(p.monthlyContribution)}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-700">
                        {formatMoney(p.savingsAmount)}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-700">
                        {Math.round(p.optionsGranted).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-xs font-medium text-emerald-700">
                        {formatMoney(p.estimatedGain)}
                      </td>
                    </tr>
                  ))}
                  {plans.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-4 text-xs text-slate-500 text-center"
                      >
                        No live SAYE contracts.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeReport === "missed" && (
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold mb-3">
              Missed payments and maturity impact
            </h2>
            <div className="overflow-auto rounded-xl ring-1 ring-slate-100">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Plan
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Missed payments
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Current maturity
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {plans
                    .filter((p: any) => (p.missedPayments || 0) > 0)
                    .map((p: any, i: number) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-xs font-medium text-slate-800">
                          {p.grantName}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-700">
                          {p.missedPayments}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-700">
                          {p.maturityDate.toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-700">
                          Each missed payment pushes maturity back by one month.
                        </td>
                      </tr>
                    ))}
                  {plans.filter((p: any) => (p.missedPayments || 0) > 0).length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-4 text-xs text-slate-500 text-center"
                      >
                        No missed payments across active contracts.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeReport === "maturity" && (
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold mb-3">
              Maturity calendar (live plans)
            </h2>
            <div className="overflow-auto rounded-xl ring-1 ring-slate-100">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Plan
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Maturity date
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Term
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      £/mo
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Saved (to date)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {plans
                    .slice()
                    .sort(
                      (a: any, b: any) =>
                        a.maturityDate.getTime() - b.maturityDate.getTime()
                    )
                    .map((p: any, i: number) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-xs font-medium text-slate-800">
                          {p.grantName}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-700">
                          {p.maturityDate.toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-700">
                          {p.termYears} years
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-700">
                          {formatMoney(p.monthlyContribution)}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-700">
                          {formatMoney(p.savingsAmount)}
                        </td>
                      </tr>
                    ))}
                  {plans.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-4 text-xs text-slate-500 text-center"
                      >
                        No live SAYE plans.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeReport === "cap" && (
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-sm font-semibold">
              Contribution cap usage (per employee)
            </h2>
            <p className="text-xs text-slate-500">
              This demo assumes a £{CAP.toFixed(0)} per-month SAYE cap per
              employee across all contracts.
            </p>
            <div className="flex items-center justify-between text-sm">
              <div>
                <div className="text-xs text-slate-500 mb-1">
                  Total current monthly across live plans
                </div>
                <div className="text-base font-semibold">
                  {formatMoney(totalMonthly)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">
                  Cap utilisation
                </div>
                <div className="text-base font-semibold">
                  {Math.round((totalMonthly / CAP) * 100)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SAYEImportsView({ planConfigs }: { planConfigs: PlanConfig[] }) {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setStatus(
      "File loaded into the demo UI. In a real system this would be validated and queued for import."
    );
  };

  const selectedPlan = planConfigs[selectedPlanIndex];

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                SAYE imports
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Load contribution files against a specific SAYE plan to update
                savings positions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                Target SAYE plan
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={selectedPlanIndex}
                onChange={(e) =>
                  setSelectedPlanIndex(Number(e.target.value) || 0)
                }
              >
                {planConfigs.map((p, i) => (
                  <option key={i} value={i}>
                    {p.grantName} ({p.termYears}y, opt px {formatMoney(
                      p.optionPrice
                    )}
                    )
                  </option>
                ))}
              </select>
              {selectedPlan && (
                <p className="text-[11px] text-slate-500">
                  Invite window:{" "}
                  {new Date(selectedPlan.inviteOpen).toLocaleString()} –{" "}
                  {new Date(selectedPlan.inviteClose).toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                Contribution file (.csv)
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium hover:file:bg-slate-50"
              />
              <p className="text-[11px] text-slate-500">
                Expected columns (demo): employee ID, name, payroll month,
                amount, currency.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-slate-500">
              This is a front-end demo only – no data is stored or sent
              anywhere.
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-8 px-3 text-xs"
                disabled={!fileName}
                onClick={() =>
                  setStatus(
                    "Validation complete (demo). No issues detected in the sample file."
                  )
                }
              >
                Validate file
              </Button>
              <Button
                className="h-8 px-3 text-xs"
                disabled={!fileName}
                onClick={() =>
                  setStatus(
                    "Import simulated. In a real system this would push contributions into the plan ledger."
                  )
                }
              >
                Import contributions
              </Button>
            </div>
          </div>

          {status && (
            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
              <div className="font-medium mb-0.5">
                {fileName ? fileName : "No file selected"}
              </div>
              <div>{status}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  tone?: "neutral" | "warning";
}

function Modal({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
  tone = "neutral",
}: ModalProps) {
  if (!open) return null;
  const toneClasses =
    tone === "warning"
      ? "ring-1 ring-rose-200 bg-rose-50 text-rose-900"
      : "ring-1 ring-slate-200 bg-white text-slate-900";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full max-w-lg rounded-2xl shadow-lg ${toneClasses}`}
      >
        <div className="p-5">
          <h2 className="text-lg font-semibold mb-2">{title}</h2>
          <div className="text-sm leading-relaxed">{children}</div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" className="h-9 px-3 text-sm" onClick={onClose}>
              Cancel
            </Button>
            <Button className="h-9 px-3 text-sm" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
type SAYEConfigViewProps = {
  planConfigs: PlanConfig[];
  setPlanConfigs: React.Dispatch<React.SetStateAction<PlanConfig[]>>;
};

function SAYEConfigView({ planConfigs, setPlanConfigs }: SAYEConfigViewProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<PlanConfig | null>(null);

  const openEdit = (index: number) => {
    const source = planConfigs[index];
    if (!source) return;
    setEditingIndex(index);
    setDraft({ ...source });
    setEditorOpen(true);
  };

  const openNew = () => {
    const baseYear = new Date().getFullYear() + 1;
    const yearStr = String(baseYear);
    const newDraft: PlanConfig = {
      grantName: `${yearStr} SAYE Plan`,
      inviteOpen: `${yearStr}-02-01T09:00`,
      inviteClose: `${yearStr}-02-28T17:00`,
      grantDate: `${yearStr}-03-01`,
      contractStart: `${yearStr}-03-01`,
      optionPrice: 1.0,
      bonusRate: 0,
      minMonthly: 10,
      maxMonthly: 500,
      termYears: 3,
      ticker: TICKER,
      exchange: "LSE",
      termMonths: 36,
      monthlyContribution: 0,
      missedPayments: 0,
      status: "invite",
      paused: false,
    };
    setEditingIndex(null);
    setDraft(newDraft);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingIndex(null);
    setDraft(null);
  };

  const saveDraft = () => {
    if (!draft) return;
    if (editingIndex == null) {
      setPlanConfigs((prev) => [...prev, draft]);
    } else {
      setPlanConfigs((prev) => prev.map((p, i) => (i === editingIndex ? draft : p)));
    }
    closeEditor();
  };

  // *** FIXED: use a normal function instead of a generic arrow in TSX ***
  function updateDraft<K extends keyof PlanConfig>(field: K, value: PlanConfig[K]) {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  const createContractsForPlan = (index: number) => {
    setPlanConfigs((prev) =>
      prev.map((p, i) => {
        if (i !== index) return p;
        const midMonthly = (p.minMonthly + p.maxMonthly) / 2;
        return {
          ...p,
          status: "live" as PlanStatus,
          monthlyContribution: midMonthly,
        };
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-full bg-slate-100 p-1 flex max-w-xl mb-4">
        <button className="flex-1 text-xs font-medium px-4 py-2 rounded-full bg-white shadow-sm">
          Plan overview
        </button>
        <button className="flex-1 text-xs font-medium px-4 py-2 rounded-full text-slate-500">
          Participants
        </button>
      </div>

      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">SAYE plan configuration</h1>
              <p className="text-xs text-slate-500 mt-1">
                View all SAYE offerings. Edit a plan or create a new one to push contracts to the participant
                view.
              </p>
            </div>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Existing SAYE plans & offerings
              </h2>
              <Button className="h-8 px-3 text-xs" onClick={openNew}>
                New plan
              </Button>
            </div>
            <p className="text-[11px] text-slate-500">
              Plans marked <span className="font-semibold">Live</span> appear in the participant view. Draft
              invitations stay hidden until you create contracts.
            </p>

            <div className="overflow-auto rounded-xl ring-1 ring-slate-100">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Plan</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Status</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Invite window</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Grant date</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Contract start</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Opt price</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Min £/mo</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Max £/mo</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-500">Term</th>
                    <th className="text-right px-3 py-2 font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {planConfigs.map((p, i) => (
                    <tr key={i} className="align-middle">
                      <td className="px-3 py-2 text-xs font-medium text-slate-800">{p.grantName}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            p.status === "live"
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                          }`}
                        >
                          {p.status === "live" ? "Live" : "Invite"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-700">
                        {new Date(p.inviteOpen).toLocaleString()} —
                        <br />
                        {new Date(p.inviteClose).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-700">
                        {new Date(p.grantDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-700">
                        {new Date(p.contractStart).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-700">{formatMoney(p.optionPrice)}</td>
                      <td className="px-3 py-2 text-xs text-slate-700">{formatMoney(p.minMonthly)}</td>
                      <td className="px-3 py-2 text-xs text-slate-700">{formatMoney(p.maxMonthly)}</td>
                      <td className="px-3 py-2 text-xs text-slate-700">{p.termYears} years</td>
                      <td className="px-3 py-2 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="outline"
                            className="h-7 px-2 text-[11px]"
                            onClick={() => openEdit(i)}
                          >
                            Edit
                          </Button>
                          {p.status === "invite" ? (
                            <Button
                              className="h-7 px-2 text-[11px]"
                              onClick={() => createContractsForPlan(i)}
                            >
                              Create contracts
                            </Button>
                          ) : (
                            <span className="text-[11px] text-slate-500">Already live</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </CardContent>
      </Card>

      <Modal
        open={editorOpen && !!draft}
        title={editingIndex == null ? "Create new SAYE plan" : "Edit SAYE plan"}
        tone="neutral"
        onClose={closeEditor}
        onConfirm={saveDraft}
        confirmLabel={editingIndex == null ? "Save & add plan" : "Save changes"}
      >
        {draft && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Plan name</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={draft.grantName}
                  onChange={(e) => updateDraft("grantName", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Bonus / interest rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={draft.bonusRate}
                  onChange={(e) => updateDraft("bonusRate", Number(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Invite window opens</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={draft.inviteOpen}
                  onChange={(e) => updateDraft("inviteOpen", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Invite window closes</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={draft.inviteClose}
                  onChange={(e) => updateDraft("inviteClose", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Grant date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={draft.grantDate}
                  onChange={(e) => updateDraft("grantDate", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Contract start date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={draft.contractStart}
                  onChange={(e) => updateDraft("contractStart", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Option price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={draft.optionPrice}
                  onChange={(e) => updateDraft("optionPrice", Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Minimum monthly (£)</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={draft.minMonthly}
                  onChange={(e) => updateDraft("minMonthly", Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Maximum monthly (£)</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={draft.maxMonthly}
                  onChange={(e) => updateDraft("maxMonthly", Number(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-slate-600">Term</label>
                <div className="flex gap-3 text-xs">
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="radio"
                      name="termYears"
                      checked={draft.termYears === 3}
                      onChange={() => {
                        updateDraft("termYears", 3);
                        updateDraft("termMonths", 36);
                      }}
                    />
                    <span>3 years</span>
                  </label>
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="radio"
                      name="termYears"
                      checked={draft.termYears === 5}
                      onChange={() => {
                        updateDraft("termYears", 5);
                        updateDraft("termMonths", 60);
                      }}
                    />
                    <span>5 years</span>
                  </label>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Status</label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={draft.status}
                  onChange={(e) => updateDraft("status", e.target.value as PlanStatus)}
                >
                  <option value="invite">Invite</option>
                  <option value="live">Live</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Ticker</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={draft.ticker}
                  onChange={(e) => updateDraft("ticker", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Exchange</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={draft.exchange}
                  onChange={(e) => updateDraft("exchange", e.target.value)}
                />
              </div>
              <div className="flex items-center text-[11px] text-slate-500">
                <span>
                  These settings control the live price feed and indicative gain shown in the participant view.
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
