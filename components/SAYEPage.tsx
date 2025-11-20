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
};

type PlanStatus = "live" | "matured" | "lapsed" | "cancelled";

type SAYEPlan = {
  id: string;
  participantId: string;
  grantName: string;
  grantDate: string;
  contractStart: string;
  termMonths: number;
  monthlyContribution: number;
  totalSaved: number;
  optionPrice: number;
  currentSharePrice: number;
  optionsGranted: number;
  status: PlanStatus;
  missedPayments: number;
  pauseMonths: number;
  payrollId?: string;
  entity?: string;
};

type InviteConfig = {
  id: string;
  name: string;
  grantName: string;
  grantDate: string;
  contractStart: string;
  termMonths: number;
  optionPrice: number;
  minMonthly: number;
  maxMonthly: number;
  maxTotalMonthly: number;
  inviteWindowOpen: string;
  inviteWindowClose: string;
  currency: string;
  interestRate?: number;
  bonusRate?: number;
};

type EnrolmentState = {
  amount: number;
  accepted: boolean;
  read: boolean;
  hasApplied: boolean;
};

type SAYEHistoryPoint = {
  monthIndex: number;
  label: string;
  savings: number;
  options: number;
  isMaturity?: boolean;
  missed?: boolean;
};

type PlanConfigTab = "timeline" | "limits" | "participants";
type ViewMode = "dashboard" | "participant" | "config" | "reports" | "imports";

const mockParticipants: Participant[] = [
  {
    id: "P001",
    name: "Alice Example",
    employeeId: "100123",
    email: "alice@example.com",
    location: "UK",
    currency: "GBP",
    entity: "UK Ltd",
    country: "United Kingdom",
  },
  {
    id: "P002",
    name: "Bill Ding",
    employeeId: "100456",
    email: "bill.ding@example.com",
    location: "UK",
    currency: "GBP",
    entity: "UK Ltd",
    country: "United Kingdom",
  },
  {
    id: "P003",
    name: "Charlie Shares",
    employeeId: "200789",
    email: "charlie@example.com",
    location: "Norway",
    currency: "NOK",
    entity: "Norway AS",
    country: "Norway",
  },
];

const mockPlans: SAYEPlan[] = [
  {
    id: "SAYE001",
    participantId: "P001",
    grantName: "2022 SAYE Plan",
    grantDate: "2022-10-01",
    contractStart: "2022-11-01",
    termMonths: 36,
    monthlyContribution: 150,
    totalSaved: 150 * 24,
    optionPrice: 2.5,
    currentSharePrice: 3.8,
    optionsGranted: Math.round((150 * 36) / 2.5),
    status: "live",
    missedPayments: 0,
    pauseMonths: 0,
    entity: "UK Ltd",
  },
  {
    id: "SAYE002",
    participantId: "P001",
    grantName: "2023 SAYE Plan",
    grantDate: "2023-09-01",
    contractStart: "2023-10-01",
    termMonths: 60,
    monthlyContribution: 200,
    totalSaved: 200 * 12,
    optionPrice: 2.0,
    currentSharePrice: 3.8,
    optionsGranted: Math.round((200 * 60) / 2.0),
    status: "live",
    missedPayments: 1,
    pauseMonths: 0,
    entity: "UK Ltd",
  },
  {
    id: "SAYE003",
    participantId: "P002",
    grantName: "2022 SAYE Plan",
    grantDate: "2022-10-01",
    contractStart: "2022-11-01",
    termMonths: 36,
    monthlyContribution: 500,
    totalSaved: 500 * 24,
    optionPrice: 2.5,
    currentSharePrice: 3.8,
    optionsGranted: Math.round((500 * 36) / 2.5),
    status: "live",
    missedPayments: 0,
    pauseMonths: 0,
    entity: "UK Ltd",
  },
  {
    id: "SAYE004",
    participantId: "P001",
    grantName: "2020 SAYE Plan",
    grantDate: "2020-09-01",
    contractStart: "2020-10-01",
    termMonths: 36,
    monthlyContribution: 75,
    totalSaved: 75 * 36,
    optionPrice: 1.8,
    currentSharePrice: 3.8,
    optionsGranted: Math.round((75 * 36) / 1.8),
    status: "matured",
    missedPayments: 3,
    pauseMonths: 2,
    entity: "UK Ltd",
  },
];

const mockInvites: InviteConfig[] = [
  {
    id: "INV2024UK",
    name: "2024 SAYE UK invite",
    grantName: "2024 SAYE Plan",
    grantDate: "2024-09-01",
    contractStart: "2024-10-01",
    termMonths: 36,
    optionPrice: 3.0,
    minMonthly: 10,
    maxMonthly: 500,
    maxTotalMonthly: 500,
    inviteWindowOpen: "2024-09-15T09:00:00",
    inviteWindowClose: "2024-10-15T17:00:00",
    currency: "GBP",
    interestRate: 0.02,
  },
];

type PlanConfig = {
  id: string;
  name: string;
  grantName: string;
  grantDate: string;
  contractStart: string;
  termMonths: number;
  optionPrice: number;
  pauseAllowed: boolean;
  maxPauseMonths: number;
  maxMissedPayments: number;
  bonusRate?: number;
  interestRate?: number;
  inviteWindowOpen: string;
  inviteWindowClose: string;
  currency: string;
  maxTotalMonthly: number;
};

const initialPlanConfigs: PlanConfig[] = [
  {
    id: "CFG2024UK",
    name: "2024 SAYE UK",
    grantName: "2024 SAYE Plan",
    grantDate: "2024-09-01",
    contractStart: "2024-10-01",
    termMonths: 36,
    optionPrice: 3.0,
    pauseAllowed: true,
    maxPauseMonths: 12,
    maxMissedPayments: 12,
    bonusRate: 0,
    interestRate: 0.02,
    inviteWindowOpen: "2024-09-15T09:00",
    inviteWindowClose: "2024-10-15T17:00",
    currency: "GBP",
    maxTotalMonthly: 500,
  },
];

function computeSAYEHistory(plan: SAYEPlan): SAYEHistoryPoint[] {
  const points: SAYEHistoryPoint[] = [];
  let savings = 0;
  let options = 0;

  for (let m = 0; m <= plan.termMonths; m++) {
    const label = m === 0 ? "Grant" : `Month ${m}`;

    const missed = m <= plan.missedPayments;
    const contribution = missed ? 0 : plan.monthlyContribution;
    savings += contribution;
    if (!missed) {
      options += contribution / plan.optionPrice;
    }

    points.push({
      monthIndex: m,
      label,
      savings,
      options,
      isMaturity: m === plan.termMonths,
      missed,
    });
  }

  return points;
}

function formatMoney(value: number, currency: string = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusBadge(status: PlanStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case "live":
      return {
        label: "Live",
        className:
          "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200",
      };
    case "matured":
      return {
        label: "Matured",
        className:
          "inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-inset ring-sky-200",
      };
    case "lapsed":
      return {
        label: "Lapsed",
        className:
          "inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 ring-1 ring-inset ring-rose-200",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className:
          "inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200",
      };
    default:
      return {
        label: status,
        className:
          "inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200",
      };
  }
}

type SAYEConfigViewProps = {
  planConfigs: PlanConfig[];
  setPlanConfigs: React.Dispatch<React.SetStateAction<PlanConfig[]>>;
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  tab: PlanConfigTab;
  setTab: (tab: PlanConfigTab) => void;
  onSelectParticipant: (p: Participant) => void;
};

function SAYEConfigView({
  planConfigs,
  setPlanConfigs,
  participants,
  setParticipants,
  tab,
  setTab,
  onSelectParticipant,
}: SAYEConfigViewProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<PlanConfig | null>(null);

  const handleConfigChange = (id: string, updates: Partial<PlanConfig>) => {
    setPlanConfigs((prev) =>
      prev.map((cfg) => (cfg.id === id ? { ...cfg, ...updates } : cfg))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            SAYE configuration
          </h2>
          <p className="text-xs text-slate-500">
            Configure invite windows, limits and participant rules for each
            SAYE grant.
          </p>
        </div>
        <div className="inline-flex gap-2 rounded-full bg-slate-100 p-1 text-xs">
          {["timeline", "limits", "participants"].map((key) => {
            const keyTyped = key as PlanConfigTab;
            return (
              <button
                key={key}
                onClick={() => setTab(keyTyped)}
                className={`rounded-full px-3 py-1 transition ${
                  tab === keyTyped
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {keyTyped === "timeline" && "Timeline"}
                {keyTyped === "limits" && "Limits"}
                {keyTyped === "participants" && "Participants"}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "timeline" && (
        <div className="space-y-3">
          {planConfigs.map((cfg) => (
            <Card
              key={cfg.id}
              className="border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {cfg.name}
                      </h3>
                      <span className="text-[11px] rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                        {cfg.currency}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Grant date {cfg.grantDate}, contract start{" "}
                      {cfg.contractStart}, {cfg.termMonths}-month term.
                    </p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-600">
                      <div>
                        Invite window:{" "}
                        <span className="font-medium">
                          {cfg.inviteWindowOpen.replace("T", " ")}
                        </span>{" "}
                        →{" "}
                        <span className="font-medium">
                          {cfg.inviteWindowClose.replace("T", " ")}
                        </span>
                      </div>
                      <div>
                        Option price:{" "}
                        <span className="font-medium">
                          {formatMoney(cfg.optionPrice, cfg.currency)}
                        </span>
                      </div>
                      <div>
                        Term:{" "}
                        <span className="font-medium">
                          {cfg.termMonths} months
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="h-7 px-3 text-xs"
                    onClick={() => alert("Export summary coming soon")}
                  >
                    Export summary
                  </Button>
                </div>
                
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500">
                          Closes
                        </span>
                        <input
                          type="datetime-local"
                          value={cfg.inviteWindowClose}
                          onChange={(e) =>
                            handleConfigChange(cfg.id, {
                              inviteWindowClose: e.target.value,
                            })
                          }
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                        />
                      </label>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-800">
                        Limits & gains
                      </h4>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500">
                          Option price ({cfg.currency})
                        </span>
                        <input
                          type="number"
                          value={cfg.optionPrice}
                          onChange={(e) =>
                            handleConfigChange(cfg.id, {
                              optionPrice: Number(e.target.value) || 0,
                            })
                          }
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] text-slate-500">
                            Max total monthly ({cfg.currency})
                          </span>
                          <input
                            type="number"
                            value={cfg.maxTotalMonthly}
                            onChange={(e) =>
                              handleConfigChange(cfg.id, {
                                maxTotalMonthly: Number(e.target.value) || 0,
                              })
                            }
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] text-slate-500">
                            Interest rate (%)
                          </span>
                          <input
                            type="number"
                            value={(cfg.interestRate ?? 0) * 100}
                            onChange={(e) =>
                              handleConfigChange(cfg.id, {
                                interestRate:
                                  (Number(e.target.value) || 0) / 100,
                              })
                            }
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                          />
                        </label>
                      </div>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500">
                          Bonus rate (% of savings)
                        </span>
                        <input
                          type="number"
                          value={(cfg.bonusRate ?? 0) * 100}
                          onChange={(e) =>
                            handleConfigChange(cfg.id, {
                              bonusRate: (Number(e.target.value) || 0) / 100,
                            })
                          }
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                        />
                      </label>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-800">
                        Pause & lapse rules
                      </h4>
                      <label className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500">
                          Allow pause?
                        </span>
                        <input
                          type="checkbox"
                          checked={cfg.pauseAllowed}
                          onChange={(e) =>
                            handleConfigChange(cfg.id, {
                              pauseAllowed: e.target.checked,
                            })
                          }
                          className="h-3 w-3 rounded border-slate-300 text-indigo-600"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] text-slate-500">
                            Max pause months
                          </span>
                          <input
                            type="number"
                            value={cfg.maxPauseMonths}
                            onChange={(e) =>
                              handleConfigChange(cfg.id, {
                                maxPauseMonths: Number(e.target.value) || 0,
                              })
                            }
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] text-slate-500">
                            Max missed payments
                          </span>
                          <input
                            type="number"
                            value={cfg.maxMissedPayments}
                            onChange={(e) =>
                              handleConfigChange(cfg.id, {
                                maxMissedPayments: Number(e.target.value) || 0,
                              })
                            }
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "limits" && (
        <div className="space-y-3 text-xs">
          <p className="text-slate-500">
            UK Schedule 3 plans must respect HMRC limits. Use this view to
            sanity-check config before launch.
          </p>
          <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Plan</th>
                <th className="px-3 py-2 text-left">Currency</th>
                <th className="px-3 py-2 text-right">Max total monthly</th>
                <th className="px-3 py-2 text-right">Term</th>
                <th className="px-3 py-2 text-right">HMRC ok?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {planConfigs.map((cfg) => {
                const hmrcCompliant =
                  cfg.currency === "GBP" &&
                  cfg.maxTotalMonthly <= 500 &&
                  (cfg.termMonths === 36 || cfg.termMonths === 60);
                return (
                  <tr key={cfg.id} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-900">
                        {cfg.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {cfg.grantName}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {cfg.currency}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatMoney(cfg.maxTotalMonthly, cfg.currency)}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600">
                      {cfg.termMonths} months
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ring-1 ring-inset ${
                          hmrcCompliant
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-amber-50 text-amber-700 ring-amber-200"
                        }`}
                      >
                        {hmrcCompliant ? "Within limits" : "Check limits"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "participants" && (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <p className="text-slate-500">
              View participants and their current SAYE contributions compared to
              plan limits.
            </p>
            <span className="text-[11px] rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">
              Demo data
            </span>
          </div>

          <table className="min-w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Participant</th>
                <th className="px-3 py-2 text-left">Employee ID</th>
                <th className="px-3 py-2 text-left">Location</th>
                <th className="px-3 py-2 text-right">Current monthly</th>
                <th className="px-3 py-2 text-right">Currency</th>
                <th className="px-3 py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {participants.map((p) => {
                const participantPlans = mockPlans.filter(
                  (pl) => pl.participantId === p.id && pl.status === "live"
                );
                const totalMonthly = participantPlans.reduce(
                  (sum, pl) => sum + pl.monthlyContribution,
                  0
                );
                const overCap = totalMonthly > 500;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => onSelectParticipant(p)}
                        className="text-indigo-600 hover:underline"
                      >
                        {p.name}
                      </button>
                      <div className="text-[11px] text-slate-500">
                        {p.email}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {p.employeeId}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {p.location}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatMoney(totalMonthly, p.currency || "GBP")}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600">
                      {p.currency || "GBP"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ring-1 ring-inset ${
                          overCap
                            ? "bg-rose-50 text-rose-700 ring-rose-200"
                            : totalMonthly >= 400
                            ? "bg-amber-50 text-amber-700 ring-amber-200"
                            : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        }`}
                      >
                        {overCap ? "Over cap" : "Within cap"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type SAYEReportsViewProps = {
  plans: SAYEPlan[];
  planConfigs: PlanConfig[];
};

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
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plans.map((p: any, i: number) => {
                    const cfg = planConfigs.find(
                      (c) => c.grantName === p.grantName
                    );
                    const maturity = cfg
                      ? calculateMaturity(cfg, new Date(cfg.grantDate))
                      : null;
                    return (
                      <tr key={i} className="hover:bg-slate-50/60">
                        <td className="px-3 py-2 font-medium text-slate-800">
                          {p.grantName}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {cfg
                            ? new Date(cfg.contractStart).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {maturity
                            ? maturity.maturityDate.toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {formatMoney(p.monthlyContribution)}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {formatMoney(p.savedToDate || 0)}
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-[11px] text-slate-500">
              Total monthly: {formatMoney(totalMonthly)} (vs cap {formatMoney(
                CAP
              )}
              )
            </div>
          </CardContent>
        </Card>
      )}

      {activeReport === "missed" && (
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold mb-3">
              Participants with missed payments
            </h2>
            <div className="overflow-auto rounded-xl ring-1 ring-slate-100">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Participant
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Plan
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Missed payments
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plans
                    .filter((p: any) => p.missedPayments && p.missedPayments > 0)
                    .map((p: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/60">
                        <td className="px-3 py-2 text-slate-800">
                          {p.participantName}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {p.grantName}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {p.missedPayments}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              In a live system you&apos;d drill into missed payments per month,
              override rules, and generate participant letters.
            </p>
          </CardContent>
        </Card>
      )}

      {activeReport === "maturity" && (
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold mb-3">
              Maturity calendar (by grant)
            </h2>
            <div className="space-y-3">
              {planConfigs.map((cfg, i) => {
                const maturity = calculateMaturity(
                  cfg,
                  new Date(cfg.grantDate)
                );
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs"
                  >
                    <div>
                      <div className="font-medium text-slate-900">
                        {cfg.grantName}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Contract start:{" "}
                        {new Date(cfg.contractStart).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">
                        {maturity.maturityDate.toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {maturity.termMonths} months ·{" "}
                        {maturity.remainingMonths} remaining
                      </div>
                    </div>
                  </div>
                );
              })}
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
              In the UK, SAYE contributions are typically capped at £500/month
              per employee across all SAYE contracts. This view gives HR &amp;
              payroll a quick sense-check of who&apos;s close to or over the
              limit in the configured demo data.
            </p>
            <div className="overflow-auto rounded-xl ring-1 ring-slate-100">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Participant
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Total £/mo
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Cap
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Array.from(
                    plans.reduce((map, p: any) => {
                      const key = p.participantName || p.participantId || "N/A";
                      const current = map.get(key) || 0;
                      return map.set(
                        key,
                        current + (p.monthlyContribution || 0)
                      );
                    }, new Map<string, number>())
                  ).map(([name, total], i) => {
                    const ratio = total / CAP;
                    const status =
                      ratio > 1
                        ? "Above cap"
                        : ratio > 0.8
                        ? "Near cap"
                        : "Comfortable";
                    const badgeClass =
                      status === "Above cap"
                        ? "bg-rose-50 text-rose-700 ring-rose-100"
                        : status === "Near cap"
                        ? "bg-amber-50 text-amber-700 ring-amber-100"
                        : "bg-emerald-50 text-emerald-700 ring-emerald-100";

                    return (
                      <tr key={i} className="hover:bg-slate-50/60">
                        <td className="px-3 py-2 text-slate-800">{name}</td>
                        <td className="px-3 py-2 text-slate-600">
                          {formatMoney(total)}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {formatMoney(CAP)}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
                              badgeClass
                            )}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SAYEImportsView({ planConfigs }: SAYEImportsViewProps) {
  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Imports & files
          </h2>
          <p className="text-xs text-slate-500">
            Simple demo view for savings carrier / payroll files.
          </p>
        </div>
        <Button variant="outline" className="h-8 px-3 text-xs">
          Download templates
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Payroll deduction file
            </h3>
            <p className="text-xs text-slate-500">
              Template showing how monthly deductions should be sent to Optio.
            </p>
            <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
              <li>One line per participant, per month.</li>
              <li>Must match internal ID and entity shown in the portal.</li>
              <li>
                Use positive values only. Refunds handled via adjustment file.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Savings carrier file
            </h3>
            <p className="text-xs text-slate-500">
              High-level view of what Optio expects from savings carrier
              extracts.
            </p>
            <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
              <li>Transaction date, amount, currency, participant ID.</li>
              <li>Separate files per client entity.</li>
              <li>Reconciliation report available per period.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SAYEPage() {
  const [participants] = useState<Participant[]>(mockParticipants);
  const [plans] = useState<SAYEPlan[]>(mockPlans);
  const [planConfigs, setPlanConfigs] =
    useState<PlanConfig[]>(initialPlanConfigs);
  const [view, setView] = useState<ViewMode>("dashboard");
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(mockParticipants[0]);
  const [configTab, setConfigTab] = useState<PlanConfigTab>("timeline");
  const [showModal, setShowModal] = useState(false);
  const [modalPlan, setModalPlan] = useState<SAYEPlan | null>(null);
  const [modalAction, setModalAction] = useState<"pause" | "cancel" | null>(
    null
  );
  const [modalChoice, setModalChoice] = useState<string | null>(null);

  const [activeInvite] = useState<InviteConfig | null>(mockInvites[0] ?? null);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [enrolment, setEnrolment] = useState<EnrolmentState | null>(null);

  const visiblePlans = useMemo(() => {
    if (!selectedParticipant) return [];
    return plans.filter((p) => p.participantId === selectedParticipant.id);
  }, [plans, selectedParticipant]);

  const totalMonthly = visiblePlans.reduce(
    (sum, p) => sum + p.monthlyContribution,
    0
  );
  const CAP = 500;
  const remainingAllowance = Math.max(0, CAP - totalMonthly);

  const capClasses =
    totalMonthly > CAP
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : totalMonthly >= CAP * 0.8
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-emerald-50 text-emerald-700 ring-emerald-200";

  const selectedParticipantName = selectedParticipant?.name ?? "Participant";

  const enriched = useMemo(
    () =>
      visiblePlans.map((p) => {
        const history = computeSAYEHistory(p);
        const maturityPoint = history.find((h) => h.isMaturity);
        const monthsSinceStart = history.length - 1;
        const maturityDate = new Date(p.contractStart);
        maturityDate.setMonth(maturityDate.getMonth() + p.termMonths);

        const optionsGranted = maturityPoint?.options ?? p.optionsGranted;
        const savingsAmount = maturityPoint?.savings ?? p.totalSaved;
        const currentValue = optionsGranted * p.currentSharePrice;
        const exerciseGain = optionsGranted * (p.currentSharePrice - p.optionPrice);
        const cashAlt = savingsAmount;
        const estimatedGain = Math.max(exerciseGain, cashAlt);

        return {
          ...p,
          monthsSinceStart,
          savingsAmount,
          optionsGranted,
          maturityDate,
          estimatedGain,
          currentValue,
          exerciseGain,
          cashAlt,
        };
      }),
    [visiblePlans]
  );

  const openModal = (plan: SAYEPlan, action: "pause" | "cancel") => {
    setModalPlan(plan);
    setModalAction(action);
    setModalChoice(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalPlan(null);
    setModalAction(null);
    setModalChoice(null);
  };

  const handleConfirmModal = () => {
    if (!modalPlan || !modalAction || !modalChoice) {
      return;
    }

    if (modalAction === "pause") {
      alert(
        `Pause requested for ${modalPlan.grantName} (${modalChoice} months). This is a demo only.`
      );
    } else if (modalAction === "cancel") {
      alert(
        `Cancel & refund requested for ${modalPlan.grantName}. You will lose the right to exercise options.`
      );
    }
    closeModal();
  };

  const toggleInvitePanel = () => {
    if (!activeInvite) return;

    setShowInvitePanel((prev) => {
      const next = !prev;

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

  const minMonthly = activeInvite?.minMonthly ?? 0;

  const effectiveInviteMax =
    activeInvite ? Math.min(activeInvite.maxMonthly, remainingAllowance) : 0;

  const canConfirmEnrolment = !!(
    activeInvite &&
    enrolment &&
    enrolment.accepted &&
    enrolment.read &&
    remainingAllowance >= minMonthly &&
    enrolment.amount >= minMonthly &&
    enrolment.amount <= effectiveInviteMax
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-10">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-60 shrink-0">
            <nav className="sticky top-6 space-y-1 text-sm">
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
              <div className="mt-4 space-y-1">
                <button
                  onClick={() => setView("dashboard")}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                    view === "dashboard"
                      ? "bg-slate-900 text-slate-50 shadow-sm"
                      : "bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Participant view (demo)
                </button>
                <button
                  onClick={() => setView("config")}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                    view === "config"
                      ? "bg-slate-900 text-slate-50 shadow-sm"
                      : "bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Config / limits
                </button>
                <button
                  onClick={() => setView("reports")}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                    view === "reports"
                      ? "bg-slate-900 text-slate-50 shadow-sm"
                      : "bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Reports
                </button>
                <button
                  onClick={() => setView("imports")}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                    view === "imports"
                      ? "bg-slate-900 text-slate-50 shadow-sm"
                      : "bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Imports (demo)
                </button>
              </div>

              <div className="mt-6 space-y-3 rounded-2xl bg-slate-900 px-3 py-3 text-slate-50 shadow-sm">
                <div className="text-xs font-medium text-slate-300">
                  Demo participant selector
                </div>
                <div className="space-y-1">
                  {participants.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedParticipant(p);
                        setView("dashboard");
                      }}
                      className={`w-full rounded-lg px-2 py-1 text-left text-xs ${
                        selectedParticipant?.id === p.id
                          ? "bg-slate-700 text-slate-50"
                          : "text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      <div className="font-medium">{p.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {p.employeeId} · {p.location}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 space-y-4">
            {view === "dashboard" && selectedParticipant && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-semibold text-slate-900">
                      Hi {selectedParticipantName}, here&apos;s your SAYE
                      snapshot
                    </h1>
                    <p className="text-xs text-slate-500">
                      This is a demo view showing how Optio could present
                      participant-level SAYE details, with HMRC cap logic
                      built-in.
                    </p>
                  </div>
                  <div
                    className={`inline-flex flex-col rounded-2xl px-3 py-2 text-xs ring-1 ring-inset ${capClasses}`}
                  >
                    <span className="text-[11px] uppercase tracking-wide">
                      Total live monthly savings
                    </span>
                    <span className="text-sm font-semibold">
                      {formatMoney(totalMonthly, selectedParticipant.currency)}
                    </span>
                    <span className="text-[11px]">
                      Overall cap: {formatMoney(CAP, selectedParticipant.currency)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-slate-200 shadow-sm md:col-span-2">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Live SAYE plans
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            {selectedParticipantName} currently has{" "}
                            <span className="font-semibold">
                              {visiblePlans.filter(
                                (p) => p.status === "live"
                              ).length}
                            </span>{" "}
                            live contracts.
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="h-7 px-3 text-xs"
                          onClick={() =>
                            alert("In a real build this would export a CSV summary.")
                          }
                        >
                          Export summary
                        </Button>
                      </div>

                      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <table className="min-w-full text-xs">
                          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                            <tr>
                              <th className="px-3 py-2 text-left">Grant</th>
                              <th className="px-3 py-2 text-right">
                                Monthly
                              </th>
                              <th className="px-3 py-2 text-right">
                                Term
                              </th>
                              <th className="px-3 py-2 text-right">
                                Options @ grant
                              </th>
                              <th className="px-3 py-2 text-right">
                                Status
                              </th>
                              <th className="px-3 py-2 text-right">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {enriched.map((plan) => {
                              const badge = getStatusBadge(plan.status);
                              return (
                                <tr
                                  key={plan.id}
                                  className="hover:bg-slate-50/80"
                                >
                                  <td className="px-3 py-2">
                                    <div className="font-medium text-slate-900">
                                      {plan.grantName}
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                      Contract start{" "}
                                      {plan.contractStart} ·{" "}
                                      {plan.termMonths} months
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-right tabular-nums">
                                    {formatMoney(
                                      plan.monthlyContribution,
                                      selectedParticipant.currency
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-right text-slate-600">
                                    {plan.termMonths} months
                                  </td>
                                  <td className="px-3 py-2 text-right tabular-nums">
                                    {plan.optionsGranted.toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <span className={badge.className}>
                                      {badge.label}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {plan.status === "live" ? (
                                      <div className="inline-flex gap-1">
                                        <Button
                                          className="h-6 px-2 text-[11px]"
                                          variant="outline"
                                          className="text-[11px]"
                                          onClick={() =>
                                            openModal(plan, "pause")
                                          }
                                        >
                                          Pause
                                        </Button>
                                        <Button
                                          className="h-6 px-2 text-[11px]"
                                          variant="outline"
                                          className="text-[11px]"
                                          onClick={() =>
                                            openModal(plan, "cancel")
                                          }
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    ) : (
                                      <span className="text-[11px] text-slate-400">
                                        No actions
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Plan rules (demo)
                          </div>
                          <p className="text-xs text-slate-600">
                            UK SAYE: £500 overall cap, 3 or 5 year terms.
                          </p>
                        </div>
                      </div>

                      <ul className="space-y-2 text-xs text-slate-600">
                        <li className="flex gap-2">
                          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>
                            Maximum total monthly savings across all SAYE plans:
                            <span className="font-semibold">
                              {" "}
                              £500 per month
                            </span>
                            .
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-sky-500" />
                          <span>
                            If a participant is already at £500 across live
                            plans, new invites must be prevented or capped down
                            to remaining headroom.
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                          <span>
                            Missed payments extend the maturity by one month
                            each. 13 missed leads to lapse.
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Current position (demo)
                          </div>
                          <p className="text-xs text-slate-600">
                            Based on grant terms vs today&apos;s share price.
                          </p>
                        </div>
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
                          Not investment advice
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">
                            Total saved at maturity (demo)
                          </span>
                          <span className="font-semibold text-slate-900">
                            {formatMoney(
                              enriched.reduce(
                                (sum, p) => sum + p.savingsAmount,
                                0
                              ),
                              selectedParticipant.currency
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">
                            Total options (grant terms)
                          </span>
                          <span className="font-semibold text-slate-900">
                            {enriched
                              .reduce(
                                (sum, p) => sum + p.optionsGranted,
                                0
                              )
                              .toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">
                            Illustrative gain (higher of cash vs exercise)
                          </span>
                          <span className="font-semibold text-emerald-700">
                            {formatMoney(
                              enriched.reduce(
                                (sum, p) => sum + p.estimatedGain,
                                0
                              ),
                              selectedParticipant.currency
                            )}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-sm md:col-span-2">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Change my savings
                          </div>
                          <p className="text-xs text-slate-600">
                            This is a demo of how savings changes could be
                            presented – not wired to live backend.
                          </p>
                        </div>
                        <Button
                          className="h-8 px-3 text-xs"
                          variant="outline"
                          className="text-xs"
                          onClick={() =>
                            alert("In a real build this would open change flow.")
                          }
                        >
                          Start change request
                        </Button>
                      </div>
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-4 text-xs text-slate-500">
                        In a production build, this block would show a live
                        journey for pausing, reducing or increasing savings,
                        wired into Optio&apos;s API and your savings carrier.
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {activeInvite && (
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Invite · {activeInvite.name}
                          </div>
                          <p className="text-xs text-slate-600">
                            Demo of how an invite panel could respect overall
                            £500 caps and per-plan limits.
                          </p>
                        </div>
                        <Button
                          className="h-8 px-3 text-xs"
                          onClick={toggleInvitePanel}
                        >
                          {showInvitePanel ? "Hide invite" : "View invite"}
                        </Button>
                      </div>

                      {showInvitePanel && enrolment && (
                        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr),minmax(0,1.4fr)]">
                          <div className="space-y-3">
                            <div className="rounded-xl border border-slate-200 bg-white p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="text-sm font-semibold text-slate-900">
                                    2024 SAYE Plan – {activeInvite.termMonths / 12}-year
                                    contract
                                  </h3>
                                  <p className="text-xs text-slate-500">
                                    Save from your net pay each month. At maturity, use
                                    savings to buy shares at £
                                    {activeInvite.optionPrice.toFixed(2)} or take cash.
                                  </p>
                                </div>
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                  Demo only
                                </span>
                              </div>

                              <div className="mt-3 grid gap-3 text-xs md:grid-cols-2">
                                <div className="space-y-1">
                                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                                    Invite window
                                  </div>
                                  <div className="font-medium text-slate-900">
                                    {activeInvite.inviteWindowOpen.replace(
                                      "T",
                                      " "
                                    )}{" "}
                                    →{" "}
                                    {activeInvite.inviteWindowClose.replace(
                                      "T",
                                      " "
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500">
                                    All elections must be received before the
                                    invite closes.
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                                    Key details
                                  </div>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                                    <div>
                                      Option price:{" "}
                                      <span className="font-medium">
                                        {formatMoney(
                                          activeInvite.optionPrice,
                                          selectedParticipant.currency
                                        )}
                                      </span>
                                    </div>
                                    <div>
                                      Term:{" "}
                                      <span className="font-medium">
                                        {activeInvite.termMonths / 12} years
                                      </span>
                                    </div>
                                    <div>
                                      Min / max monthly:{" "}
                                      <span className="font-medium">
                                        {formatMoney(
                                          activeInvite.minMonthly,
                                          selectedParticipant.currency
                                        )}{" "}
                                        –{" "}
                                        {formatMoney(
                                          activeInvite.maxMonthly,
                                          selectedParticipant.currency
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <h3 className="text-sm font-semibold text-slate-900">
                                    Step 1 · Check overall cap
                                  </h3>
                                  <p className="text-xs text-slate-500">
                                    You can&apos;t exceed £500 per month across all
                                    live SAYE plans.
                                  </p>
                                </div>
                                <div
                                  className={`rounded-full px-3 py-1 text-[11px] ring-1 ring-inset ${
                                    totalMonthly > CAP
                                      ? "bg-rose-50 text-rose-700 ring-rose-200"
                                      : totalMonthly >= CAP * 0.8
                                      ? "bg-amber-50 text-amber-700 ring-amber-200"
                                      : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                  }`}
                                >
                                  Currently saving:{" "}
                                  <span className="font-semibold">
                                    {formatMoney(
                                      totalMonthly,
                                      selectedParticipant.currency
                                    )}
                                  </span>
                                </div>
                              </div>

                              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                You have{" "}
                                <span className="font-semibold">
                                  {formatMoney(
                                    remainingAllowance,
                                    selectedParticipant.currency
                                  )}{" "}
                                  of headroom
                                </span>{" "}
                                before you reach the £500 overall cap.
                              </div>

                              <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-slate-900">
                                  Step 2 · Choose monthly amount
                                </h3>
                                {remainingAllowance < activeInvite.minMonthly ? (
                                  <p className="text-xs text-slate-500">
                                    You&apos;re already contributing £
                                    {totalMonthly.toFixed(0)} per month across live
                                    SAYE plans, which is the maximum allowed (£
                                    {CAP}). To join this invite you&apos;d need to
                                    reduce another contribution.
                                  </p>
                                ) : (
                                  <p className="text-xs text-slate-500">
                                    Choose any whole pound amount between £
                                    {activeInvite.minMonthly} and £
                                    {Math.min(
                                      activeInvite.maxMonthly,
                                      remainingAllowance
                                    )}
                                    . You currently contribute £
                                    {totalMonthly.toFixed(0)} per month across live
                                    plans (overall cap £{CAP}).
                                  </p>
                                )}
                                <div className="flex flex-wrap items-end gap-4">
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">
                                      Monthly savings (£)
                                    </label>
                                    <input
                                      type="number"
                                      min={activeInvite.minMonthly}
                                      max={Math.min(
                                        activeInvite.maxMonthly,
                                        remainingAllowance ||
                                          activeInvite.maxMonthly
                                      )}
                                      step={1}
                                      className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                      value={enrolment.amount}
                                      onChange={(e) => {
                                        let v = Number(e.target.value) || 0;
                                        const maxAllowed = Math.min(
                                          activeInvite.maxMonthly,
                                          remainingAllowance
                                        );
                                        v = Math.min(v, maxAllowed);
                                        setEnrolment((prev) =>
                                          prev ? { ...prev, amount: v } : prev
                                        );
                                      }}
                                    />
                                    <div className="text-[11px] text-slate-500">
                                      Remaining headroom:{" "}
                                      <span className="font-medium">
                                        {formatMoney(
                                          remainingAllowance,
                                          selectedParticipant.currency
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex-1 space-y-1 text-xs">
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-600">
                                        Total savings over{" "}
                                        {activeInvite.termMonths / 12} years
                                      </span>
                                      <span className="font-semibold text-slate-900">
                                        {formatMoney(
                                          enrolment.amount *
                                            activeInvite.termMonths,
                                          selectedParticipant.currency
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-600">
                                        Indicative options at maturity
                                      </span>
                                      <span className="font-semibold text-slate-900">
                                        {Math.round(
                                          (enrolment.amount *
                                            activeInvite.termMonths) /
                                            activeInvite.optionPrice
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="border-t border-slate-100 pt-4 space-y-3">
                                <h3 className="text-sm font-semibold text-slate-900">
                                  Step 3 · Confirm & apply
                                </h3>
                                <p className="text-xs text-slate-500">
                                  Tick both boxes to confirm you&apos;ve read the
                                  documents and understand how deductions will
                                  work.
                                </p>
                                <div className="space-y-2 text-xs text-slate-700">
                                  <label className="flex items-start gap-2">
                                    <input
                                      type="checkbox"
                                      className="mt-0.5"
                                      checked={enrolment.read}
                                      onChange={(e) =>
                                        setEnrolment((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                read: e.target.checked,
                                              }
                                            : prev
                                        )
                                      }
                                    />
                                    <span>
                                      I confirm I&apos;ve read the{" "}
                                      <a
                                        href="#"
                                        className="text-indigo-600 hover:underline"
                                      >
                                        SAYE plan rules
                                      </a>{" "}
                                      and{" "}
                                      <a
                                        href="#"
                                        className="text-indigo-600 hover:underline"
                                      >
                                        Key features document
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
                                        setEnrolment((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                accepted: e.target.checked,
                                              }
                                            : prev
                                        )
                                      }
                                    />
                                    <span>
                                      I understand that deductions will be taken
                                      from my net pay each month and that I can
                                      pause or stop in line with the plan rules.
                                    </span>
                                  </label>
                                </div>

                                <div className="flex items-center justify-between gap-3 pt-1">
                                  <Button
                                    className="h-8 px-3 text-xs"
                                    className="text-xs"
                                    disabled={!canConfirmEnrolment}
                                    onClick={handleConfirmEnrolment}
                                  >
                                    {enrolment.hasApplied
                                      ? "Election captured (demo only)"
                                      : "Submit my election (demo)"}
                                  </Button>
                                  <div className="text-[11px] text-slate-500">
                                    This is a static demo – no real elections are
                                    being submitted.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 text-xs">
                            <h3 className="text-sm font-semibold text-slate-900">
                              What happens next?
                            </h3>
                            <p className="text-slate-600">
                              In a production build, once you confirm your
                              election we would:
                            </p>
                            <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                              <li>
                                Store your election in Optio&apos;s database and
                                surface it to HR/payroll.
                              </li>
                              <li>
                                Include your chosen amount in the payroll
                                deduction file.
                              </li>
                              <li>
                                Sync your live savings with the savings carrier
                                and portal views.
                              </li>
                            </ol>
                            <div className="mt-2 flex gap-4 text-[11px] text-slate-500">
                              <div>
                                <div className="font-semibold text-slate-700">
                                  Who to contact
                                </div>
                                <p>
                                  In a real rollout, contact details for HR or
                                  the plan administrator would appear here.
                                </p>
                              </div>
                              <div>
                                <div className="font-semibold text-slate-700">
                                  Documents
                                </div>
                                <div className="flex flex-col gap-1">
                                  <a href="#" className="hover:underline">
                                    Plan Rules
                                  </a>
                                  <a href="#" className="hover:underline">
                                    FAQ
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 text-slate-500">
                                <Info className="h-4 w-4" />
                                <span>
                                  Missed payments extend the maturity by one
                                  month each. 13 missed = plan lapses.
                                </span>
                              </div>
                              <div className="font-medium">
                                <span className="text-slate-500">
                                  Current share price (demo):{" "}
                                </span>
                                <span className="text-slate-900">
                                  {formatMoney(
                                    enriched[0]?.currentSharePrice ?? 3.8,
                                    selectedParticipant.currency
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {showModal && modalPlan && modalAction && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-sm font-semibold text-slate-900">
                            {modalAction === "pause"
                              ? "Pause contributions"
                              : "Cancel & refund"}
                          </h2>
                          <p className="mt-1 text-xs text-slate-500">
                            {modalAction === "pause"
                              ? "For demo purposes, pick how long you'd like to pause. In a real build this would update the carrier file."
                              : "For demo purposes, choose to cancel and refund your savings. In a real build this would be routed via HR / the savings carrier."}
                          </p>
                        </div>
                        <button
                          className="text-slate-400 hover:text-slate-600"
                          onClick={closeModal}
                        >
                          ✕
                        </button>
                      </div>

                      <div className="mt-3 space-y-2 text-xs text-slate-700">
                        {modalAction === "pause" ? (
                          <>
                            <p>
                              <span className="font-medium">
                                {modalPlan.grantName}
                              </span>{" "}
                              – monthly savings of{" "}
                              <span className="font-medium">
                                {formatMoney(
                                  modalPlan.monthlyContribution,
                                  selectedParticipant.currency
                                )}
                              </span>
                              .
                            </p>
                            <p>
                              Choose how many months you&apos;d like to pause
                              your savings for:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {[1, 3, 6, 12].map((m) => (
                                <button
                                  key={m}
                                  onClick={() =>
                                    setModalChoice(`${m} months`)
                                  }
                                  className={`rounded-full px-3 py-1 text-xs ring-1 ring-inset ${
                                    modalChoice === `${m} months`
                                      ? "bg-slate-900 text-white ring-slate-900"
                                      : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  {m} month{m > 1 ? "s" : ""}
                                </button>
                              ))}
                            </div>
                            <p className="text-[11px] text-slate-500">
                              In a real SAYE, pausing would extend your maturity
                              date. Too many missed payments may cause the plan
                              to lapse.
                            </p>
                          </>
                        ) : (
                          <>
                            <p>
                              You&apos;re asking to{" "}
                              <span className="font-medium">
                                cancel & refund
                              </span>{" "}
                              your{" "}
                              <span className="font-medium">
                                {modalPlan.grantName}
                              </span>{" "}
                              savings.
                            </p>
                            <p>
                              In a live flow, we&apos;d confirm your identity,
                              show you an estimate of your refund and highlight
                              any tax impact before sending this to HR /
                              payroll.
                            </p>
                            <p className="text-[11px] text-slate-500">
                              For this demo, we&apos;ll just show a confirmation
                              message.
                            </p>
                            <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-800 ring-1 ring-inset ring-amber-200">
                              Cancelling will usually mean you lose the right to
                              buy shares at the option price – you&apos;ll just
                              receive your savings back (subject to the plan
                              rules).
                            </div>
                          </>
                        )}
                      </div>

                      <div className="mt-4 flex justify-end gap-2 text-xs">
                        <Button
                          variant="outline"
                          className="h-8 px-3 text-xs"
                          onClick={closeModal}
                        >
                          Close
                        </Button>
                        <Button
                          className="h-8 px-3 text-xs"
                          disabled={!modalChoice && modalAction === "pause"}
                          onClick={handleConfirmModal}
                        >
                          Confirm (demo)
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {view === "config" && (
              <SAYEConfigView
                planConfigs={planConfigs}
                setPlanConfigs={setPlanConfigs}
                participants={participants}
                setParticipants={() => {}}
                tab={configTab}
                setTab={setConfigTab}
                onSelectParticipant={(p) => {
                  setSelectedParticipant(p);
                  setView("dashboard");
                }}
              />
            )}

            {view === "reports" && (
              <SAYEReportsView plans={plans} planConfigs={planConfigs} />
            )}

            {view === "imports" && (
              <SAYEImportsView planConfigs={planConfigs} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
