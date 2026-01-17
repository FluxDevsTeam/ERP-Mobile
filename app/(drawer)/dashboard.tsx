import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StatusBar,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { 
  Menu, Search, Bell, Calendar, Cloud 
} from 'lucide-react-native';
import { Stack, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import "../../global.css"; 

// Stores
import { useUserStore } from '../../store/userStore';

// Components
import TenantBranchTab from '../../components/dashboard/TenantBranchTab'; // <--- NEW
import SubscriptionTab from '../../components/dashboard/SubscriptionTab';

const TABS = ["User Management", "Tenant & Branches", "Subscription", "Payments"];

export default function DashboardScreen() {
  const navigation = useNavigation();
  const user = useUserStore((state) => state.user);
  
  const [activeTab, setActiveTab] = useState("Tenant & Branches");
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View className="bg-white px-6 py-3 flex-row items-center justify-between border-b border-slate-100 z-10">
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4" onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Menu size={24} color="#0F172A" />
          </TouchableOpacity>
          <View className="w-8 h-8 bg-[#F5F3FF] rounded-lg items-center justify-center mr-2"><Cloud size={16} color="#5841D8" /></View>
          <Text className="text-lg font-bold text-[#0F172A]">Fluxdevs</Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4 relative">
            <Bell size={20} color="#64748B" />
            <View className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </TouchableOpacity>
          <View className="w-8 h-8 bg-slate-200 rounded-full items-center justify-center overflow-hidden">
             <Text className="font-bold text-slate-600">{user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40}}
        extraScrollHeight={140}
        enableAutomaticScroll
      >
        {/* SEARCH & DATE */}
        <View className="flex-row gap-x-3 mb-6">
          <View className="flex-1 h-11 bg-white border border-slate-200 rounded-xl px-3 flex-row items-center">
            <Search size={18} color="#94A3B8" />
            <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search..." placeholderTextColor="#94A3B8" className="flex-1 ml-2 text-sm text-[#0F172A]" />
          </View>
          <View className="h-11 bg-white border border-slate-200 rounded-xl px-3 flex-row items-center justify-center">
            <Calendar size={16} color="#64748B" className="mr-2" />
            <Text className="text-xs font-medium text-[#64748B]">14 Jan, 2026</Text>
          </View>
        </View>

        {/* TABS */}
        <View className="-mx-6 px-6 mb-8">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className={`mr-6 pb-2 border-b-2 ${isActive ? 'border-[#5841D8]' : 'border-transparent'}`}>
                  <Text className={`font-semibold ${isActive ? 'text-[#5841D8]' : 'text-[#64748B]'}`}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* --- DYNAMIC CONTENT --- */}
        
        {/* 1. TENANT & BRANCHES TAB */}
        {activeTab === "Tenant & Branches" && <TenantBranchTab />}

        {/* 2. SUBSCRIPTION TAB */}
        {activeTab === "Subscription" && <SubscriptionTab />}

        {/* 3. PLACEHOLDER FOR OTHERS */}
        {!["Tenant & Branches", "Subscription"].includes(activeTab) && (
          <View className="items-center mt-10">
            <Text className="text-slate-400">Content for {activeTab} coming soon...</Text>
          </View>
        )}

      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}