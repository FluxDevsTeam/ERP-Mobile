import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { getUserSubscriptions, Subscription } from '../../api/billing';
import PaginationControl from './PaginationControl';

export default function SubscriptionTab() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{ count: number, next: string | null, previous: string | null } | null>(null);

  useEffect(() => {
    loadData(page);
  }, [page]);

  const loadData = async (pageNumber: number) => {
    setLoading(true);
    const result = await getUserSubscriptions(pageNumber);
    setLoading(false);

    if (result.success && result.data) {
      setSubscriptions(result.data);
      if (result.meta) setMeta(result.meta);
    }
  };

  const renderStatusBadge = (status: string) => {
    const styles: any = {
      active: 'bg-green-100 text-green-700',
      trial: 'bg-blue-100 text-blue-700',
      canceled: 'bg-red-100 text-red-700',
      suspended: 'bg-orange-100 text-orange-700',
    };
    const styleClass = styles[status] || 'bg-slate-100 text-slate-700';

    return (
      <View className={`px-2.5 py-1 rounded-full self-start ${styleClass.split(' ')[0]}`}>
        <Text className={`text-xs font-bold capitalize ${styleClass.split(' ')[1]}`}>
          {status}
        </Text>
      </View>
    );
  };

  return (
    <View>
      <View className="mb-4">
        <Text className="text-lg font-bold text-[#0F172A]">Subscription History</Text>
        <Text className="text-xs text-[#64748B]">View all your past and current subscriptions</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#5841D8" className="my-10" />
      ) : (
        <View className="bg-white rounded-2xl p-4 shadow-sm shadow-slate-100">
          {subscriptions.length === 0 ? (
            <Text className="text-center text-slate-400 py-4">No subscriptions found</Text>
          ) : (
            subscriptions.map((sub) => (
              <View key={sub.id} className="border-b border-slate-100 py-4 last:border-0">
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="text-base font-bold text-[#0F172A]">{sub.plan.name}</Text>
                    <Text className="text-xs text-[#64748B]">₦{parseFloat(sub.plan.price).toLocaleString()} / {sub.plan.billing_period}</Text>
                  </View>
                  {renderStatusBadge(sub.status)}
                </View>

                <View className="flex-row gap-x-4 mt-1">
                  <View className="flex-row items-center">
                    <Calendar size={12} color="#64748B" className="mr-1" />
                    <Text className="text-xs text-[#64748B]">
                      Start: {new Date(sub.start_date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <CheckCircle2 size={12} color="#64748B" className="mr-1" />
                    <Text className="text-xs text-[#64748B]">
                      End: {new Date(sub.end_date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}

          {/* Pagination */}
          <PaginationControl 
            currentPage={page}
            hasNext={!!meta?.next}
            hasPrev={!!meta?.previous}
            totalCount={meta?.count}
            onNext={() => setPage(p => p + 1)}
            onPrev={() => setPage(p => Math.max(1, p - 1))}
          />
        </View>
      )}
    </View>
  );
}