"use client"

import { Plus, ArrowUpRight, ArrowDownLeft, Gift, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { type WalletTransaction, formatCurrency, formatRelativeTime } from "@/lib/mock-data"

interface WalletScreenProps {
  balance: number
  transactions: WalletTransaction[]
  onAddFunds: () => void
  onTransactionClick: (transaction: WalletTransaction) => void
}

export function WalletScreen({ balance, transactions, onAddFunds, onTransactionClick }: WalletScreenProps) {
  const isLowBalance = balance < 200

  const getTransactionIcon = (type: WalletTransaction["type"]) => {
    switch (type) {
      case "recharge":
        return <ArrowDownLeft className="w-4 h-4" />
      case "debit":
        return <ArrowUpRight className="w-4 h-4" />
      case "refund":
        return <ArrowDownLeft className="w-4 h-4" />
      case "gift":
        return <Gift className="w-4 h-4" />
    }
  }

  const getTransactionColor = (type: WalletTransaction["type"]) => {
    switch (type) {
      case "recharge":
      case "refund":
        return "text-[#22C55E] bg-[#22C55E]/10"
      case "debit":
        return "text-foreground bg-muted"
      case "gift":
        return "text-primary bg-primary/10"
    }
  }

  const getTransactionSign = (type: WalletTransaction["type"]) => {
    switch (type) {
      case "recharge":
      case "refund":
      case "gift":
        return "+"
      case "debit":
        return "-"
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Balance Card */}
      <div className="p-4">
        <div className="bg-foreground text-background rounded-2xl p-6">
          <p className="text-sm opacity-75 mb-1">Available Balance</p>
          <p className="text-4xl font-bold tracking-tight mb-6">
            {balance.toLocaleString()} <span className="text-lg font-medium opacity-75">XAF</span>
          </p>
          
          <Button
            onClick={onAddFunds}
            className="w-full bg-background text-foreground hover:bg-background/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Funds
          </Button>
        </div>
      </div>

      {/* Low Balance Warning */}
      {isLowBalance && (
        <div className="mx-4 mb-4 p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Low balance</p>
            <p className="text-xs text-muted-foreground">Top up to continue buying bundles</p>
          </div>
          <Button size="sm" variant="ghost" onClick={onAddFunds} className="text-[#F59E0B]">
            Top Up
          </Button>
        </div>
      )}

      {/* Transactions */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Transaction History</h2>
        
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <img src="/walletempty.png" alt="Wallet vide" className="w-32 h-32 object-contain mb-4 opacity-80" />
            <p className="text-muted-foreground text-center">Aucune transaction pour l'instant</p>
            <p className="text-xs text-muted-foreground/70 text-center mt-1">Rechargez votre wallet pour commencer</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.map((transaction) => (
              <button
                key={transaction.id}
                onClick={() => onTransactionClick(transaction)}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors text-left active:scale-[0.99]"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  getTransactionColor(transaction.type)
                )}>
                  {getTransactionIcon(transaction.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{transaction.description}</p>
                    {transaction.type === "gift" && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-xs">FREE</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatRelativeTime(transaction.created_at)}</span>
                    {transaction.payment_method && (
                      <>
                        <span>&middot;</span>
                        <span>{transaction.payment_method}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={cn(
                    "text-sm font-semibold",
                    (transaction.type === "recharge" || transaction.type === "refund") && "text-[#22C55E]",
                    transaction.type === "debit" && "text-foreground",
                    transaction.type === "gift" && "text-primary"
                  )}>
                    {getTransactionSign(transaction.type)}
                    {transaction.type === "gift" 
                      ? "30 min" 
                      : formatCurrency(transaction.type === "recharge" ? transaction.net_xaf : transaction.amount_xaf)
                    }
                  </p>
                  {transaction.fee_xaf > 0 && (
                    <p className="text-xs text-muted-foreground">Fee: {formatCurrency(transaction.fee_xaf)}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
