"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SAYEConfig({ onUpdate }) {
  const [config, setConfig] = useState({
    inviteOpen: "",
    inviteClose: "",
    grantDate: "",
    contractStart: "",
    optionPrice: "",
    bonusRate: "",
    interestRate: "",
    term: "3",
    ticker: "",
    welcomeText: "",
  });

  const update = (field: string, value: string) => {
    const next = { ...config, [field]: value };
    setConfig(next);
    onUpdate?.(next); // sends data upstream to /saye page
  };

  return (
    <Card className="w-full border border-neutral-300 shadow-sm">
      <CardContent className="space-y-6 p-6">

        {/* Invite Window */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Invite Window</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="datetime-local"
              value={config.inviteOpen}
              onChange={(e) => update("inviteOpen", e.target.value)}
              placeholder="Open date/time"
            />
            <Input
              type="datetime-local"
              value={config.inviteClose}
              onChange={(e) => update("inviteClose", e.target.value)}
              placeholder="Close date/time"
            />
          </div>
        </section>

        {/* Core Dates */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Key Dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="date"
              value={config.grantDate}
              onChange={(e) => update("grantDate", e.target.value)}
              placeholder="Grant date"
            />
            <Input
              type="date"
              value={config.contractStart}
              onChange={(e) => update("contractStart", e.target.value)}
              placeholder="Contract start"
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="term"
                  value="3"
                  checked={config.term === "3"}
                  onChange={() => update("term", "3")}
                />
                3 Years
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="term"
                  value="5"
                  checked={config.term === "5"}
                  onChange={() => update("term", "5")}
                />
                5 Years
              </label>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="number"
              step="0.01"
              value={config.optionPrice}
              onChange={(e) => update("optionPrice", e.target.value)}
              placeholder="Option Price"
            />
            <Input
              type="number"
              step="0.01"
              value={config.bonusRate}
              onChange={(e) => update("bonusRate", e.target.value)}
              placeholder="Bonus %"
            />
            <Input
              type="number"
              step="0.01"
              value={config.interestRate}
              onChange={(e) => update("interestRate", e.target.value)}
              placeholder="Interest %"
            />
          </div>
        </section>

        {/* Ticker */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Ticker</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              value={config.ticker}
              onChange={(e) => update("ticker", e.target.value)}
              placeholder="e.g. NAS or AAPL"
            />
            <div className="p-2 text-sm border rounded bg-neutral-50">
              * Auto-pull share price feed on save
            </div>
          </div>
        </section>

        {/* Welcome wording */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Welcome Wording</h2>
          <textarea
            className="w-full border rounded p-3 text-sm bg-white"
            rows={4}
            value={config.welcomeText}
            onChange={(e) => update("welcomeText", e.target.value)}
            placeholder="Paste welcome message or enrolment text..."
          />
        </section>

        <Button className="w-full mt-4">Save Config</Button>
      </CardContent>
    </Card>
  );
}
