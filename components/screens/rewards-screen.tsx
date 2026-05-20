"use client"

import { ArrowLeft, Copy, Share2, Gift, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface RewardsScreenProps {
  onBack: () => void
  referralCode: string
  friendsSignedUp: number
  friendsPurchased: number
  giftMinutes: number
  onShare: () => void
  onCopyCode: () => void
}

export function RewardsScreen({ 
  onBack, 
  referralCode, 
  friendsSignedUp, 
  friendsPurchased, 
  giftMinutes,
  onShare,
  onCopyCode 
}: RewardsScreenProps) {
  const progressToNextReward = (friendsPurchased % 10) / 10 * 100
  const friendsNeeded = 10 - (friendsPurchased % 10)
  const totalRewardsEarned = Math.floor(friendsPurchased / 10)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 h-14 px-4 border-b border-border safe-area-inset-top">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Rewards</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Gift Balance Card */}
        <div className="p-4">
          <div className="bg-primary text-primary-foreground rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-75">Free Minutes Available</p>
                <p className="text-3xl font-bold">{giftMinutes} min</p>
              </div>
            </div>
            <p className="text-sm opacity-75">Use these for free connectivity at any K-Zone.</p>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="px-4 pb-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-base font-semibold text-foreground mb-1">Your Referral Code</h2>
            <p className="text-sm text-muted-foreground mb-4">Share with friends and earn 30 free minutes for every 10 who purchase.</p>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-muted rounded-xl p-4">
                <p className="text-2xl font-bold text-foreground text-center tracking-widest">{referralCode}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={onCopyCode}
                className="h-14 w-14 shrink-0"
              >
                <Copy className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={onShare} className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share via WhatsApp
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="px-4 pb-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">Progress to Next Reward</h2>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <Progress value={progressToNextReward} className="h-3" />
              </div>
              <span className="text-sm font-medium text-foreground">{friendsPurchased % 10}/10</span>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              {friendsNeeded === 10 
                ? "Invite friends to start earning rewards!" 
                : `${friendsNeeded} more friend${friendsNeeded > 1 ? 's' : ''} need to purchase to earn 30 free minutes.`}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted rounded-xl p-3 text-center">
                <Users className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{friendsSignedUp}</p>
                <p className="text-xs text-muted-foreground">Signed up</p>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <Gift className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{friendsPurchased}</p>
                <p className="text-xs text-muted-foreground">Purchased</p>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{totalRewardsEarned * 30}</p>
                <p className="text-xs text-muted-foreground">Min earned</p>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="px-4 pb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">How it works</h2>
          <div className="flex flex-col gap-3">
            {[
              { step: 1, text: "Share your referral code with friends" },
              { step: 2, text: "Friends sign up using your code" },
              { step: 3, text: "When 10 friends make their first purchase, you earn 30 free minutes" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                  {item.step}
                </span>
                <p className="text-sm text-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
