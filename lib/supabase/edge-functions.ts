"use client"

import { supabase } from "./client"

async function invoke<T>(name: string, body: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body })
  if (error) {
    const message = (error as { message?: string }).message || `Edge function ${name} failed`
    throw new Error(message)
  }
  if (!data) throw new Error(`Edge function ${name} returned no data`)
  return data
}

// --- purchase-bundle ----------------------------------------------------------

export interface PurchaseBundleResponse {
  bundle_id: string
  new_balance_xaf?: number
  message?: string
}
export function purchaseBundleFn(
  plan_id: string,
  idempotency_key?: string,
  opts?: { ap_id?: string; user_lat?: number; user_lng?: number; gps_accuracy_m?: number },
) {
  return invoke<PurchaseBundleResponse>("purchase-bundle", {
    plan_id,
    idempotency_key,
    ap_id: opts?.ap_id,
    user_lat: opts?.user_lat,
    user_lng: opts?.user_lng,
    gps_accuracy_m: opts?.gps_accuracy_m,
  })
}

// --- start-segment ------------------------------------------------------------

export interface StartSegmentResponse {
  segment_id: string
  started_at: string
  scheduled_end: string
  remaining_minutes: number
  mikrotik_user_name?: string
  message?: string
}
export function startSegmentFn(
  bundle_id: string,
  ap_id: string,
  opts?: { mac_address?: string; user_lat?: number; user_lng?: number; gps_accuracy_m?: number },
) {
  return invoke<StartSegmentResponse>("start-segment", {
    bundle_id,
    ap_id,
    mac_address: opts?.mac_address,
    user_lat: opts?.user_lat,
    user_lng: opts?.user_lng,
    gps_accuracy_m: opts?.gps_accuracy_m,
  })
}

// --- end-segment --------------------------------------------------------------

export interface EndSegmentResponse {
  segment_id: string
  time_used_minutes: number
  remaining_minutes: number
  bundle_status: "active" | "exhausted" | string
  message?: string
}
export function endSegmentFn(segment_id: string) {
  return invoke<EndSegmentResponse>("end-segment", { segment_id })
}

// --- initiate-recharge --------------------------------------------------------

export interface InitiateRechargeResponse {
  transaction_id: string
  reference: string
  aggregator_ref: string
  amount_xaf: number
  total_charged_xaf: number
  fee_xaf: number
  message?: string
}
export function initiateRechargeFn(amount_xaf: number, payment_method: "momo" | "om", phone_number: string) {
  return invoke<InitiateRechargeResponse>("initiate-recharge", {
    amount_xaf,
    payment_method,
    phone_number,
  })
}
