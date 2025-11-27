"use client";

import React, { useEffect, useMemo, useState } from "react";
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

type EnrollmentRecord = {
  id: string;
  participantId: string;
  participantName: string;
  employeeId?: string;
  email?: string;
  entity?: string;
  country?: string;
  grantName: string;
  amount: number;
  appliedAt: string; // ISO datetime string
  inviteOpen: string;
  inviteClose: string;
};

const formatMoney = (n: number, ccy = "GBP") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: ccy,
    maximumFractionDigits: 2,
  }).format(n);

type PlanScheduleSource = {
  contractStart: string;
  maturityDate: Date;
  monthlyContribution: number;
  missedPayments?: number;
};

function buildScheduleForPlan(p: PlanScheduleSource) {
  const start = new Date(p.contractStart);
  const now = new Date();
  const lastCompleted = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  type H = {
    label: string;
    date: string;
    amount: number;
    status: "paid" | "missed";
  };
  type U = { label: string; date: string; amount: number; isLast?: boolean };

  const history: H[] = [];
  const upcoming: U[] = [];

  // HISTORY: from contract start up to last completed month
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
    const label = d.toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    });
const date = formatDdMmYyyy(new Date(d.getFullYear(), d.getMonth(), 10));

    const key = `${d.getFullYear()}:${d.getMonth()}`;
    const isMissed = missedSet.has(key);
    history.push({
      label,
      date,
      amount: p.monthlyContribution,
      status: isMissed ? "missed" : "paid",
    });
  }

  // First day of maturity month
  const maturityMonthStart = new Date(
    p.maturityDate.getFullYear(),
    p.maturityDate.getMonth(),
    1
  );

  // First deduction is the month BEFORE contract start
  const contractStart = new Date(p.contractStart);
  const firstDeduction = new Date(
    contractStart.getFullYear(),
    contractStart.getMonth() - 1,
    10
  );

  const nowMonthStart = new Date(now.getFullYear(), now.getMonth(), 10);
  const upcomingStart = new Date(
    Math.max(firstDeduction.getTime(), nowMonthStart.getTime())
  );

  for (
    let d = new Date(upcomingStart);
    d < maturityMonthStart;
    d = new Date(d.getFullYear(), d.getMonth() + 1, 10)
  ) {
    upcoming.push({
      label: d.toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      }),
      date: formatDdMmYyyy(d),
      amount: p.monthlyContribution,
    });
  }

  if (upcoming.length) {
    upcoming[upcoming.length - 1].isLast = true;
  }

  return { history, upcoming };
}

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
>("config");
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

const [enrolmentRecords, setEnrolmentRecords] = useState<EnrollmentRecord[]>(
  []
);

const [enrolmentConfirmation, setEnrolmentConfirmation] = useState<
  { grantName: string; amount: number; contractStart: string } | null
>(null);

const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [configTab, setConfigTab] = useState<"plans" | "participants">("plans");

  const [modal, setModal] = useState<{
    type: null | "pause" | "unpause" | "cancel";
    planIdx: number | null;
  }>({ type: null, planIdx: null });

  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [enrolment, setEnrolment] = useState<EnrollmentState | null>(null);

  useEffect(() => {
    setShowInvitePanel(false);
    setEnrolment(null);
  }, [selectedParticipant]);

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

    // If this participant is not contributing to this plan, hide it from their view
    if (!monthlyContribution || monthlyContribution <= 0) {
      continue;
    }

    const missedPayments =
      (c as any).missedPayments ?? base.missedPayments ?? 0

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

function SAYEImportsView({
  planConfigs,
  participants,
  setParticipants,
}: {
  planConfigs: PlanConfig[];
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
}) {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<{
    totalRows: number;
    updated: number;
    unmatched: number;
  } | null>(null);

  type ParsedRow = {
    employeeId: string;
    amount: number;
    planYear: string;
    deductionDateIso: string;
  };

  // dd-mm-yyyy -> yyyy-mm-dd (ISO)
  const parseDdMmYyyy = (value: string): string | null => {
    const trimmed = value.trim();
    const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(trimmed);
    if (!m) return null;
    const day = Number(m[1]);
    const month = Number(m[2]) - 1;
    const year = Number(m[3]);
    const d = new Date(year, month, day);
    if (
      d.getFullYear() !== year ||
      d.getMonth() !== month ||
      d.getDate() !== day
    ) {
      return null;
    }
    return d.toISOString().slice(0, 10); // yyyy-mm-dd
  };

  const parseContributionCsv = (
    raw: string
  ): { rows: ParsedRow[]; error: string | null } => {
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length <= 1) {
      return { rows: [], error: "No data rows found in the CSV." };
    }

    const headerCells = lines[0]
      .split(",")
      .map((h) => h.trim().toLowerCase());

    const empIdx = headerCells.indexOf("employeeid");
    const amtIdx = headerCells.indexOf("amount");
    const yearIdx = headerCells.indexOf("planyear");
    const dateIdx = headerCells.indexOf("deductiondate");

    if (empIdx === -1 || amtIdx === -1 || yearIdx === -1 || dateIdx === -1) {
      return {
        rows: [],
        error:
          "Unexpected header. Expected: employeeId,amount,planYear,deductionDate (dd-mm-yyyy)",
      };
    }

    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(",");
      if (cells.length < headerCells.length) continue;

      const employeeId = cells[empIdx]?.trim();
      const amtRaw = cells[amtIdx]?.trim();
      const yearRaw = cells[yearIdx]?.trim();
      const dateRaw = cells[dateIdx]?.trim();

      if (!employeeId || !amtRaw || !yearRaw || !dateRaw) continue;

      const amount = Number(amtRaw);
      if (!Number.isFinite(amount)) {
        return {
          rows: [],
          error: `Row ${i + 1}: amount "${amtRaw}" is not a valid number.`,
        };
      }

      const iso = parseDdMmYyyy(dateRaw);
      if (!iso) {
        return {
          rows: [],
          error: `Row ${i + 1}: deductionDate "${dateRaw}" is not a valid dd-mm-yyyy date.`,
        };
      }

      rows.push({
        employeeId,
        amount,
        planYear: yearRaw,
        deductionDateIso: iso,
      });
    }

    return { rows, error: null };
  };

  const selectedPlan = planConfigs[selectedPlanIndex];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStatus("File loaded. Click Validate to check the contents.");
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = () => {
      setFileContent(String(reader.result || ""));
    };
    reader.readAsText(file);
  };

  const handleValidate = () => {
    if (!fileContent) {
      setStatus("No file content to validate.");
      setImportSummary(null);
      return;
    }
    const { rows, error } = parseContributionCsv(fileContent);
    if (error) {
      setStatus(error);
      setImportSummary(null);
      return;
    }
    setStatus(`Validation complete. ${rows.length} row(s) ready to import.`);
    setImportSummary({
      totalRows: rows.length,
      updated: 0,
      unmatched: 0,
    });
  };

  const handleImport = () => {
    if (!fileContent) {
      setStatus("No file content to import.");
      return;
    }

    const { rows, error } = parseContributionCsv(fileContent);
    if (error) {
      setStatus(error);
      return;
    }

    if (rows.length === 0) {
      setStatus("There are no valid rows to import.");
      return;
    }

    const targetPlan = selectedPlan;
    if (!targetPlan) {
      setStatus("No plan selected.");
      return;
    }

    let updatedCount = 0;

    const updatedParticipants = participants.map((p) => {
      const matches = rows.filter((r) => r.employeeId === p.employeeId);
      if (matches.length === 0) {
        return p;
      }

      updatedCount++;

      const existingContracts = Array.isArray(p.contracts) ? p.contracts : [];
      const existingForPlan = existingContracts.find(
        (c) => (c as any).grantName === targetPlan.grantName
      );

      const previousHistory: any[] =
        (existingForPlan as any)?.importedHistory ?? [];

      const newHistoryEntries = matches.map((m) => ({
        amount: m.amount,
        planYear: m.planYear,
        deductionDateIso: m.deductionDateIso,
      }));

      const mergedHistory = [...previousHistory, ...newHistoryEntries];

      const monthlyContribution =
        (existingForPlan as any)?.monthlyContribution ??
        targetPlan.monthlyContribution;
      const missedPayments =
        (existingForPlan as any)?.missedPayments ??
        targetPlan.missedPayments ??
        0;

      const replacementContract = {
        ...(existingForPlan || {}),
        grantName: targetPlan.grantName,
        monthlyContribution,
        missedPayments,
        importedHistory: mergedHistory,
      };

      const otherContracts = existingContracts.filter(
        (c) => (c as any).grantName !== targetPlan.grantName
      );

      return {
        ...p,
        contracts: [...otherContracts, replacementContract],
      };
    });

    const knownIds = new Set(participants.map((p) => p.employeeId));
    const unmatchedCount = rows.filter(
      (r) => !knownIds.has(r.employeeId)
    ).length;

    setParticipants(updatedParticipants);
    setStatus(
      `Import complete. Updated ${updatedCount} participant(s). ${unmatchedCount} row(s) did not match any participant.`
    );
    setImportSummary({
      totalRows: rows.length,
      updated: updatedCount,
      unmatched: unmatchedCount,
    });
  };

  return (
    <Card className="rounded-2xl border-none shadow-sm">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">SAYE imports</h2>
            <p className="text-xs text-slate-500">
              Upload a CSV of monthly contributions and apply them to a specific
              grant.
            </p>
          </div>
          <select
            className="border rounded-md px-2 py-1 text-xs"
            value={selectedPlanIndex}
            onChange={(e) => setSelectedPlanIndex(Number(e.target.value))}
          >
            {planConfigs.map((p, idx) => (
              <option key={p.grantName + idx} value={idx}>
                {p.grantName || `Plan ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <label className="inline-flex items-center gap-2 text-xs">
              <span className="inline-flex items-center justify-center rounded-full border px-2 py-1 text-[11px] font-medium cursor-pointer">
                Choose CSV
              </span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {fileName && (
              <span className="text-xs text-slate-500 truncate">
                {fileName}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-500">
            Expected columns (in this order):{" "}
            <span className="font-medium">
              employeeId, amount, planYear, deductionDate
            </span>{" "}
            where <span className="font-mono">deductionDate</span> is{" "}
            <span className="font-mono">dd-mm-yyyy</span>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleValidate}
            disabled={!fileContent}
          >
            Validate
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleImport}
            disabled={!fileContent}
          >
            Import
          </Button>
        </div>

        {status && (
          <div className="text-[11px] text-slate-600 bg-slate-50 rounded-md px-3 py-2">
            {status}
          </div>
        )}

        {importSummary && (
          <div className="text-[11px] text-slate-600">
            Total rows: {importSummary.totalRows} · Updated participants:{" "}
            {importSummary.updated} · Unmatched rows:{" "}
            {importSummary.unmatched}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
