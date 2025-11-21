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

  return null;
}
