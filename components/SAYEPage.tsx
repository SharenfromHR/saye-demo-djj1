"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Info, ChevronDown } from "lucide-react";

type Participant = {
  id: string;
  name: string;
  employeeId?: string;
  email?: string;
  location?: string;
  currency?: string;
  entity?: string;
  country?: string;
  grantDate?: string;
  termYears?: number;
  monthlyContribution?: number;
  status?: string;
  contracts?: any[];
  [key: string]: any;
};

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
  
const [participants, setParticipants] = useState<Participant[]>([
  {
    id: "P001",
    name: "Anita Spreadsheet",
    employeeId: "100123",
    email: "anita.spreadsheet@example.com",
    location: "UK",
    currency: "GBP",
    contracts: [
      {
        grantName: "2024 SAYE Plan",
        monthlyContribution: 250,
        missedPayments: 0,
      },
      {
        grantName: "2025 SAYE Plan",
        monthlyContribution: 250,
        missedPayments: 1,
      },
    ],
  },
  {
    id: "P002",
    name: "Bill Ding",
    employeeId: "100456",
    email: "bill.ding@example.com",
    location: "UK",
    currency: "GBP",
    contracts: [
      {
        grantName: "2024 SAYE Plan",
        monthlyContribution: 500,
        missedPayments: 0,
      },
      {
        grantName: "2025 SAYE Plan",
        monthlyContribution: 0,
        missedPayments: 0,
      },
    ],
  },
  {
    id: "P003",
    name: "Sal Monella",
    employeeId: "100789",
    email: "sal.monella@example.com",
    location: "UK",
    currency: "GBP",
    contracts: [
      {
        grantName: "2024 SAYE Plan",
        monthlyContribution: 300,
        missedPayments: 2,
      },
      {
        grantName: "2025 SAYE Plan",
        monthlyContribution: 0,
        missedPayments: 0,
      },
    ],
  },
  {
    id: "P004",
    name: "Lara Byte",
    employeeId: "100990",
    email: "lara.byte@example.com",
    location: "UK",
    currency: "GBP",
    contracts: [
      {
        grantName: "2024 SAYE Plan",
        monthlyContribution: 200,
        missedPayments: 0,
      },
      {
        grantName: "2025 SAYE Plan",
        monthlyContribution: 100,
        missedPayments: 0,
      },
    ],
  },
  {
    id: "P005",
    name: "Ola Nordmann",
    employeeId: "101111",
    email: "ola.nordmann@example.com",
    location: "UK",
    currency: "GBP",
    contracts: [
      {
        grantName: "2024 SAYE Plan",
        monthlyContribution: 0,
        missedPayments: 0,
      },
      {
        grantName: "2025 SAYE Plan",
        monthlyContribution: 500,
        missedPayments: 0,
      },
    ],
  },
  {
    id: "P006",
    name: "Penny Wise",
    employeeId: "101222",
    email: "penny.wise@example.com",
    location: "UK",
    currency: "GBP",
    contracts: [
      {
        grantName: "2024 SAYE Plan",
        monthlyContribution: 125,
        missedPayments: 3,
      },
      {
        grantName: "2025 SAYE Plan",
        monthlyContribution: 125,
        missedPayments: 0,
      },
    ],
  },
  {
    id: "P007",
    name: "Hugh Mann",
    employeeId: "101333",
    email: "hugh.mann@example.com",
    location: "UK",
    currency: "GBP",
    contracts: [
      {
        grantName: "2024 SAYE Plan",
        monthlyContribution: 400,
        missedPayments: 0,
      },
      {
        grantName: "2025 SAYE Plan",
        monthlyContribution: 100,
        missedPayments: 0,
      },
    ],
  },
  {
    id: "P008",
    name: "Chris P. Bacon",
    employeeId: "101444",
    email: "chris.bacon@example.com",
    location: "UK",
    currency: "GBP",
    contracts: [
      {
        grantName: "2024 SAYE Plan",
        monthlyContribution: 50,
        missedPayments: 0,
      },
      {
        grantName: "2025 SAYE Plan",
        monthlyContribution: 50,
        missedPayments: 0,
      },
    ],
  },
]);
  
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [configTab, setConfigTab] = useState<"plans" | "participants">("plans");

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
          (now.getFullYear() - start.getFullYear()) * 12 +
            (now.getMonth() - start.getMonth())
        );
        const savingsAmount = Math.max(
          0,
          p.monthlyContribution * (monthsSinceStart - p.missedPayments)
        );
        const optionsGranted =
          (p.monthlyContribution * p.termMonths) / p.optionPrice;
        const maturityDate = computeMaturity(
          p.contractStart,
          p.termMonths,
          p.missedPayments
        );
        const estimatedGain = Math.max(
          0,
          (CURRENT_PRICE_GBP - p.optionPrice) * optionsGranted
        );
        return {
          ...p,
          monthsSinceStart,
          savingsAmount,
          optionsGranted,
          maturityDate,
          estimatedGain,
        };
      })
      .sort(
        (a, b) =>
          new Date(a.contractStart).getTime() -
          new Date(b.contractStart).getTime()
      );
  }, [planConfigs]);

  const visiblePlans = useMemo(() => {
    // No participant selected – show all live plans
    if (!selectedParticipant) return enriched;

    const contracts = Array.isArray(selectedParticipant.contracts)
      ? selectedParticipant.contracts
      : [];

    // Participant has no enrolments – show nothing
    if (contracts.length === 0) {
      return [] as typeof enriched;
    }

    const result: typeof enriched = [];

    for (const c of contracts) {
      if (!c || typeof c !== "object") continue;

      const grantName = (c as any).grantName as string | undefined;
      if (!grantName) continue;

      const base = enriched.find((p) => p.grantName === grantName);
      if (!base) continue;

      const monthlyContribution =
        (c as any).monthlyContribution ?? base.monthlyContribution;
      const missedPayments =
        (c as any).missedPayments ?? base.missedPayments ?? 0;

      const savingsAmount = Math.max(
        0,
        monthlyContribution * (base.monthsSinceStart - missedPayments)
      );
      const optionsGranted =
        (monthlyContribution * base.termMonths) / base.optionPrice;
      const maturityDate = computeMaturity(
        base.contractStart,
        base.termMonths,
        missedPayments
      );
      const estimatedGain = Math.max(
        0,
        (CURRENT_PRICE_GBP - base.optionPrice) * optionsGranted
      );

      result.push({
        ...base,
        monthlyContribution,
        missedPayments,
        savingsAmount,
        optionsGranted,
        maturityDate,
        estimatedGain,
      });
    }

    return result.sort(
      (a, b) =>
        new Date(a.contractStart).getTime() -
        new Date(b.contractStart).getTime()
    );
  }, [enriched, selectedParticipant]);

  // 500 GBP monthly SAYE cap across all active plans for the selected participant
  const totalMonthly = visiblePlans.reduce(
    (sum, p) => sum + (p.monthlyContribution || 0),
    0
  );

  const CAP = 500;

  const capClasses =
    totalMonthly > CAP
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : totalMonthly >= CAP * 0.8
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-emerald-50 text-emerald-700 ring-emerald-200";

  const remainingCap = selectedParticipant
    ? Math.max(0, CAP - totalMonthly)
    : CAP;

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

  const handleOpenParticipantFromConfig = (participant: Participant) => {
    setSelectedParticipant(participant);
    setView("participant");
  };

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

      // If they open the panel for the first time, pre-fill with a mid value
      if (next && !enrolment && activeInvite) {
        const mid =
          (activeInvite.minMonthly + activeInvite.maxMonthly) / 2;

        setEnrolment({
          amount: mid,
          accepted: false,
          read: false,
          hasApplied: false,
        });
      }

      return next;
    });
  };

const handleConfirmEnrolment = () => {
  if (!activeInvite || !enrolment) return;

  setEnrolment((prev) =>
    prev ? { ...prev, hasApplied: true } : prev
  );
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-10">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-60 shrink-0">
            <nav className="sticky top-6 space-y-3 text-sm">
              {/* Static menu section */}
              <div className="space-y-1">
                {["Dashboard", "My portfolio", "My orders", "Documents", "Simulations"].map(
                  (label) => (
                    <div
                      key={label}
                      className="px-3 py-2 rounded-xl text-slate-600 hover:bg-white/60 cursor-default"
                    >
                      {label}
                    </div>
                  )
                )}
              </div>

              {/* SAYE view switcher */}
              <div className="space-y-1 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setView("participant")}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs ${
                    view === "participant"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-white/70"
                  }`}
                >
                  SAYE – participant
                </button>

                <button
                  type="button"
                  onClick={() => setView("config")}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs ${
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
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs ${
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
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs ${
                    view === "imports"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg:white/70"
                  }`}
                >
                  Imports
                </button>
              </div>

              {/* Price card */}
              <div className="mt-6 p-4 rounded-2xl shadow-sm ring-1 ring-slate-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                    {TICKER}
                  </div>
                  <div className="text-sm font-medium text-slate-900">{COMPANY}</div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-semibold text-slate-900">
                    £{CURRENT_PRICE_GBP.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {TICKER} • Latest date {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 space-y-4">
            {/* PARTICIPANT VIEW */}
            {view === "participant" && (
              <Card className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-6 space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-lg font-semibold tracking-tight">
                        SAYE participant view
                      </h1>
                      <p className="text-xs text-slate-500 mt-1">
                        Global monthly cap £{GLOBAL_CAP.toFixed(0)} across all live plans. Remaining
                        headroom £{remainingCap.toFixed(2)}.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-[11px]">
                      <Info className="h-3.5 w-3.5" />
                      <span>500 cap check live</span>
                    </div>
                  </div>

                  {activeInvite ? (
                    <div className="space-y-4">
                      {/* Active invite summary */}
                      <div className="text-xs text-slate-600">
                        Active invite:{" "}
                        <span className="font-semibold">{activeInvite.grantName}</span> · window{" "}
                        {new Date(activeInvite.inviteOpen).toLocaleString()} –{" "}
                        {new Date(activeInvite.inviteClose).toLocaleString()}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        {/* Amount input */}
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600">
                            Monthly savings (£)
                          </label>
                          <input
                            type="number"
                            min={activeInvite.minMonthly}
                            max={activeInvite.maxMonthly}
                            step={1}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={enrolment?.amount ?? activeInvite.minMonthly}
                            onChange={(e) => {
                              const v = Number(e.target.value) || 0;
                              setEnrolment((prev) =>
                                prev
                                  ? { ...prev, amount: v }
                                  : {
                                      amount: v,
                                      accepted: false,
                                      read: false,
                                      hasApplied: false,
                                    }
                              );
                            }}
                          />
                          <p className="text-[11px] text-slate-500">
                            Allowed range £{activeInvite.minMonthly} – £{activeInvite.maxMonthly}.
                            Remaining global cap £{remainingCap.toFixed(2)}.
                          </p>
                        </div>

                        {/* Checkboxes */}
                        <div className="space-y-2 text-xs">
                          <label className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              className="mt-0.5"
                              checked={!!enrolment?.read}
                              onChange={(e) =>
                                setEnrolment((prev) =>
                                  prev
                                    ? { ...prev, read: e.target.checked }
                                    : {
                                        amount: activeInvite.minMonthly,
                                        accepted: false,
                                        read: e.target.checked,
                                        hasApplied: false,
                                      }
                                )
                              }
                            />
                            <span>
                              I confirm I have read the invitation documents and understand how the
                              plan works.
                            </span>
                          </label>

                          <label className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              className="mt-0.5"
                              checked={!!enrolment?.accepted}
                              onChange={(e) =>
                                setEnrolment((prev) =>
                                  prev
                                    ? { ...prev, accepted: e.target.checked }
                                    : {
                                        amount: activeInvite.minMonthly,
                                        accepted: e.target.checked,
                                        read: false,
                                        hasApplied: false,
                                      }
                                )
                              }
                            />
                            <span>
                              I understand my chosen amount will be deducted from my net pay each
                              month for the full term, unless I change or cancel in line with plan
                              rules.
                            </span>
                          </label>
                        </div>

                        {/* Cap explanation + button */}
                        <div className="space-y-2 text-xs">
                          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                            <div className="font-medium text-slate-700 mb-1">
                              Monthly cap check
                            </div>
                            <p className="text-[11px] text-slate-500">
                              We total all live contributions (including this invite). If it would
                              push you above £{GLOBAL_CAP.toFixed(0)}, we block the application.
                            </p>
                          </div>

                          <Button
                            className="h-8 px-4 text-xs w-full"
                            disabled={
                              !(
                                activeInvite &&
                                enrolment &&
                                enrolment.accepted &&
                                enrolment.read &&
                                enrolment.amount >= activeInvite.minMonthly &&
                                enrolment.amount <= activeInvite.maxMonthly &&
                                enrolment.amount <= remainingCap
                              )
                            }
                            onClick={handleConfirmEnrolment}
                          >
                            {hasApplied ? "Update application" : "Confirm enrolment"}
                          </Button>

                          {enrolment && enrolment.amount > remainingCap && (
                            <p className="text-[11px] text-red-600">
                              This amount would push you over the £{GLOBAL_CAP.toFixed(0)} monthly
                              cap. Reduce your savings here or in another plan to stay within the
                              limit.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      No active SAYE invites right now. When an invite is open, you&apos;ll be able
                      to choose a monthly amount and we&apos;ll run the 500 cap check automatically.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* CONFIG VIEW – placeholder for now */}
            {view === "config" && (
              <Card className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-6 space-y-3 text-sm">
                  <h2 className="text-base font-semibold tracking-tight">Configuration view</h2>
                  <p className="text-xs text-slate-500">
                    The underlying planConfigs and participants logic is still in this file – we
                    can wire the full config UI back in next step. For now this is just a safe,
                    compiling placeholder.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* REPORTS VIEW – placeholder */}
            {view === "reports" && (
              <Card className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-6 space-y-3 text-sm">
                  <h2 className="text-base font-semibold tracking-tight">Reports view</h2>
                  <p className="text-xs text-slate-500">
                    Placeholder – we&apos;ll reattach the detailed reports once the base layout is
                    stable.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* IMPORTS VIEW – placeholder */}
            {view === "imports" && (
              <Card className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-6 space-y-3 text-sm">
                  <h2 className="text-base font-semibold tracking-tight">Imports view</h2>
                  <p className="text-xs text-slate-500">
                    Placeholder for SAYE imports. The 500 cap logic and participant view are already
                    wired – this keeps the rest simple while we stabilise the page.
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
