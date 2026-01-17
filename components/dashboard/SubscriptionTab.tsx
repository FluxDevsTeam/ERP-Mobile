import { CreditCard, Gift, ShieldCheck } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

// API Imports
import {
  getBillingPlans,
  getUserSubscriptions,
  Plan,
  Subscription,
} from "../../api/billing";

export default function SubscriptionTab() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<
    "monthly" | "annual" | "quarterly"
  >("monthly");
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{
    count: number;
    next: string | null;
    previous: string | null;
  } | null>(null);

  useEffect(() => {
    fetchSubs(page);
    fetchPlans();
  }, []);
  useEffect(() => {
    fetchSubs(page);
  }, [page]);

  const fetchSubs = async (pageNumber: number) => {
    setLoadingSubs(true);
    const result = await getUserSubscriptions(pageNumber);
    setLoadingSubs(false);
    if (result.success && result.data) {
      setSubscriptions(result.data);
      if (result.meta) setMeta(result.meta);
    }
  };

  const fetchPlans = async () => {
    setLoadingPlans(true);
    const result = await getBillingPlans();
    setLoadingPlans(false);
    if (result.success && result.data) setPlans(result.data);
  };

  const handleFreeTrial = async () => {
    /* ... keep existing logic ... */
  };
  const handleSubscribe = async (plan: Plan) => {
    /* ... keep existing logic ... */
  };

  // --- FILTER HELPERS ---
  const filteredPlans = plans.filter((p) => p.billing_period === billingCycle);

  // --- RENDER HELPERS ---
  const renderActiveSubscription = (sub: Subscription) => {
    const isTrial = sub.status === "trial";

    return (
      <View
        key={sub.id}
        className="bg-[#0F172A] rounded-2xl p-6 mb-4 shadow-lg shadow-indigo-200"
      >
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">
              Current Plan
            </Text>
            <Text className="text-white text-2xl font-bold">
              {sub.plan.name}
            </Text>
          </View>
          <View
            className={`px-3 py-1.5 rounded-full ${isTrial ? "bg-indigo-500/20" : "bg-green-500/20"}`}
          >
            <Text
              className={`text-xs font-bold capitalize ${isTrial ? "text-indigo-300" : "text-green-400"}`}
            >
              {sub.status}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-x-6 mb-6">
          <View>
            <Text className="text-slate-400 text-[10px] mb-1">BILLING</Text>
            <Text className="text-white font-semibold text-sm capitalize">
              {sub.plan.billing_period}
            </Text>
          </View>
          <View>
            <Text className="text-slate-400 text-[10px] mb-1">PRICE</Text>
            <Text className="text-white font-semibold text-sm">
              ₦{parseFloat(sub.plan.price).toLocaleString()}
            </Text>
          </View>
          <View>
            <Text className="text-slate-400 text-[10px] mb-1">EXPIRES</Text>
            <Text className="text-white font-semibold text-sm">
              {new Date(sub.end_date).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View className="pt-4 border-t border-slate-700 flex-row items-center">
          <ShieldCheck size={14} color="#94A3B8" className="mr-2" />
          <Text className="text-slate-400 text-xs">Auto-renew is enabled</Text>
        </View>
      </View>
    );
  };

  return (
    <View className="pb-10">
      {/* 1. SUBSCRIPTIONS HEADER */}
      <View className="mb-8">
        <Text className="text-lg font-bold text-[#0F172A] mb-4">
          Your Subscription
        </Text>

        {loadingSubs ? (
          <ActivityIndicator color="#5841D8" className="py-10" />
        ) : (
          <View>
            {subscriptions.length === 0 ? (
              <View className="bg-white border border-slate-200 border-dashed rounded-xl p-8 items-center justify-center">
                <CreditCard size={32} color="#CBD5E1" className="mb-3" />
                <Text className="text-slate-400 font-medium">
                  No active subscription
                </Text>
              </View>
            ) : (
              // Only show active/trial subs in the big card, others in list below if needed
              subscriptions
                .filter((s) => s.status !== "canceled")
                .map(renderActiveSubscription)
            )}
          </View>
        )}
      </View>

      {/* 2. PLANS HEADER & TOGGLE */}
      <View className="flex-row items-end justify-between mb-4">
        <View>
          <Text className="text-lg font-bold text-[#0F172A]">
            Available Plans
          </Text>
          <Text className="text-xs text-[#64748B] mt-0.5">
            Upgrade your workspace
          </Text>
        </View>
      </View>

      {/* Free Trial Banner */}
      <View className="bg-gradient-to-r from-indigo-50 to-white bg-[#F5F3FF] rounded-xl mb-6 border border-indigo-100 flex-row items-center justify-between px-5 py-8">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Gift size={14} color="#5841D8" className="mr-2" />
            <Text className="text-[#5841D8] font-bold text-xs uppercase">
              Limited Offer
            </Text>
          </View>
          <Text className="text-[#0F172A] font-bold text-base">
            Start 14-day Free Trial
          </Text>
          <Text className="text-[#64748B] text-[10px] mt-1">
            Full access. No credit card required.
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleFreeTrial}
          disabled={!!processingId}
          className="bg-white border border-indigo-100 px-4 py-2 rounded-lg shadow-sm"
        >
          {processingId === "TRIAL_BANNER" ? (
            <ActivityIndicator size="small" color="#5841D8" />
          ) : (
            <Text className="text-[#5841D8] font-bold text-xs">Activate</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Toggle */}
      <View className="bg-slate-100 p-1 rounded-xl flex-row mb-6">
        {["monthly", "quarterly", "annual"].map((cycle) => (
          <TouchableOpacity
            key={cycle}
            onPress={() => setBillingCycle(cycle as any)}
            className={`flex-1 py-2 rounded-lg items-center ${billingCycle === cycle ? "bg-white shadow-sm" : "bg-transparent"}`}
          >
            <Text
              className={`font-semibold text-xs capitalize ${billingCycle === cycle ? "text-[#0F172A]" : "text-slate-500"}`}
            >
              {cycle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* PLANS LIST */}
      {loadingPlans ? (
        <ActivityIndicator color="#5841D8" />
      ) : (
        <View>
          {filteredPlans.length === 0 ? (
            <Text className="text-center text-slate-400 py-8">
              No plans available.
            </Text>
          ) : (
            filteredPlans.map((plan) => (
              <View
                key={plan.id}
                className="bg-white border border-slate-100 rounded-2xl p-5 mb-4 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View>
                    <Text className="text-[#0F172A] font-bold text-lg">
                      {plan.name}
                    </Text>
                    <Text className="text-[#64748B] text-xs">
                      {plan.description}
                    </Text>
                  </View>
                  <Text className="text-xl font-bold text-[#0F172A]">
                    ₦{parseFloat(plan.price).toLocaleString()}
                    <Text className="text-xs text-[#94A3B8] font-normal">
                      /{plan.billing_period}
                    </Text>
                  </Text>
                </View>

                {/* Mini Features */}
                <View className="flex-row flex-wrap gap-2 mb-5">
                  <View className="bg-slate-50 px-2 py-1 rounded text-[10px]">
                    <Text className="text-xs text-slate-600">
                      {plan.max_users} Users
                    </Text>
                  </View>
                  <View className="bg-slate-50 px-2 py-1 rounded text-[10px]">
                    <Text className="text-xs text-slate-600">
                      {plan.max_branches} Branches
                    </Text>
                  </View>
                  <View className="bg-slate-50 px-2 py-1 rounded text-[10px]">
                    <Text className="text-xs text-slate-600">
                      {plan.industry}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleSubscribe(plan)}
                  disabled={!!processingId}
                  className={`py-3 rounded-xl flex-row items-center justify-center bg-[#0F172A] active:opacity-90 ${processingId && processingId !== plan.id ? "opacity-50" : ""}`}
                >
                  {processingId === plan.id ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="font-bold text-white text-sm">
                      Subscribe Now
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}
