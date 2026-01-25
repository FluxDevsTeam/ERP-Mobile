import { DrawerActions } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import {
  Bell,
  Building2,
  Calendar,
  ChevronRight,
  Cloud,
  CreditCard,
  Menu, Search,
  Sparkles,
  Users, Wallet
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import "../../global.css";

// Stores
import { useUserStore } from '../../store/userStore';

// Components
import SubscriptionTab from '../../components/dashboard/SubscriptionTab';
import TenantBranchTab from '../../components/dashboard/TenantBranchTab';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactElement;
  color: string;
  bgColor: string;
}

const TABS: TabConfig[] = [
  {
    id: "tenants",
    label: "Workspaces",
    icon: <Building2 size={18} />,
    color: "#5841D8",
    bgColor: "bg-indigo-50"
  },
  {
    id: "subscription",
    label: "Plans & Billing",
    icon: <CreditCard size={18} />,
    color: "#10B981",
    bgColor: "bg-emerald-50"
  },
  {
    id: "users",
    label: "Team",
    icon: <Users size={18} />,
    color: "#F59E0B",
    bgColor: "bg-amber-50"
  },
  {
    id: "payments",
    label: "Transactions",
    icon: <Wallet size={18} />,
    color: "#3B82F6",
    bgColor: "bg-blue-50"
  },
];

export default function DashboardScreen() {
  const navigation = useNavigation();
  const user = useUserStore((state) => state.user);
  const params = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState("tenants");
  const [searchQuery, setSearchQuery] = useState('');
  const [greeting, setGreeting] = useState('');

  // Handle Tab Navigation from Sidebar/Params
  useEffect(() => {
    if (params.tab && typeof params.tab === 'string') {
      setActiveTab(params.tab);
    }
  }, [params.tab]);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const activeTabConfig = TABS.find(t => t.id === activeTab);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* PREMIUM HEADER */}
      <View className="bg-white border-b border-slate-100 shadow-sm">
        {/* Top Row */}
        <View className="px-5 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="mr-3 w-10 h-10 bg-slate-50 rounded-xl items-center justify-center"
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <Menu size={20} color="#0F172A" />
            </TouchableOpacity>
            <View>
              <View className="flex-row items-center">
                <View className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg items-center justify-center mr-2">
                  <Cloud size={14} color="white" />
                </View>
                <Text className="text-lg font-bold text-[#0F172A]">{user?.tenant_name || 'Workspace'}</Text>
              </View>
              <Text className="text-xs text-slate-400 mt-0.5">{greeting}, {user?.first_name || 'there'}!</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center relative">
              <Bell size={18} color="#64748B" />
              <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl items-center justify-center">
              <Text className="font-bold text-white text-sm">
                {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Row */}
        <View className="px-5 pb-4 flex-row gap-3">
          <View className="flex-1 h-12 bg-slate-50 rounded-xl px-4 flex-row items-center">
            <Search size={18} color="#94A3B8" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search anything..."
              placeholderTextColor="#94A3B8"
              className="flex-1 ml-3 text-sm text-[#0F172A]"
            />
          </View>
          <TouchableOpacity className="h-12 bg-slate-50 rounded-xl px-4 flex-row items-center gap-2">
            <Calendar size={16} color="#64748B" />
            <Text className="text-sm font-medium text-[#64748B]">Today</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        extraScrollHeight={140}
        enableAutomaticScroll
      >
        {/* TAB NAVIGATION - Card Style */}
        <View className="px-5 pt-5 pb-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 rounded-2xl flex-row items-center gap-2 border ${isActive
                    ? 'bg-[#0F172A] border-[#0F172A]'
                    : 'bg-white border-slate-200'
                    }`}
                  style={{ minWidth: 120 }}
                >
                  <View className={`w-8 h-8 rounded-lg items-center justify-center ${isActive ? 'bg-white/20' : tab.bgColor}`}>
                    {React.cloneElement(tab.icon as React.ReactElement<{ color: string }>, {
                      color: isActive ? 'white' : tab.color
                    })}
                  </View>
                  <Text className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-slate-700'}`}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ACTIVE TAB INDICATOR */}
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className={`w-2 h-2 rounded-full`} style={{ backgroundColor: activeTabConfig?.color }} />
              <Text className="text-lg font-bold text-[#0F172A]">{activeTabConfig?.label}</Text>
            </View>
            <TouchableOpacity className="flex-row items-center gap-1">
              <Text className="text-sm font-medium text-indigo-600">View All</Text>
              <ChevronRight size={16} color="#5841D8" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-5 pt-2">
          {/* 1. WORKSPACES TAB */}
          <View style={{ display: activeTab === "tenants" ? 'flex' : 'none' }}>
            <TenantBranchTab />
          </View>

          {/* 2. SUBSCRIPTION TAB */}
          <View style={{ display: activeTab === "subscription" ? 'flex' : 'none' }}>
            <SubscriptionTab />
          </View>

          {/* 3. TEAM TAB (Coming Soon) */}
          <View style={{ display: activeTab === "users" ? 'flex' : 'none' }}>
            <View className="bg-white rounded-2xl p-8 items-center border border-slate-100 shadow-sm">
              <View className="w-20 h-20 bg-amber-50 rounded-2xl items-center justify-center mb-4">
                <Users size={36} color="#F59E0B" />
              </View>
              <Text className="text-xl font-bold text-[#0F172A] mb-2">Team Management</Text>
              <Text className="text-slate-400 text-center mb-6">
                Invite team members and manage user roles and permissions.
              </Text>
              <View className="flex-row items-center gap-1 bg-amber-50 px-4 py-2 rounded-full">
                <Sparkles size={14} color="#F59E0B" />
                <Text className="text-amber-700 font-semibold text-sm">Coming Soon</Text>
              </View>
            </View>
          </View>

          {/* 4. PAYMENTS TAB (Coming Soon) */}
          <View style={{ display: activeTab === "payments" ? 'flex' : 'none' }}>
            <View className="bg-white rounded-2xl p-8 items-center border border-slate-100 shadow-sm">
              <View className="w-20 h-20 bg-blue-50 rounded-2xl items-center justify-center mb-4">
                <Wallet size={36} color="#3B82F6" />
              </View>
              <Text className="text-xl font-bold text-[#0F172A] mb-2">Transaction History</Text>
              <Text className="text-slate-400 text-center mb-6">
                View all your payment history, invoices, and receipts.
              </Text>
              <View className="flex-row items-center gap-1 bg-blue-50 px-4 py-2 rounded-full">
                <Sparkles size={14} color="#3B82F6" />
                <Text className="text-blue-700 font-semibold text-sm">Coming Soon</Text>
              </View>
            </View>
          </View>
        </View>

      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}