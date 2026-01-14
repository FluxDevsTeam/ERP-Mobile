import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  Pencil, 
  Trash2, 
  Calendar, 
  Cloud,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react-native';
import { Stack } from 'expo-router';
import "../global.css"; 

// --- MOCK DATA ---
const TABS = ["User Management", "Tenant & Branches", "Subscription", "Payments"];

const TENANTS = [
  { id: '1', name: 'Raji Hakeem', email: 'raji@gmail.com', industry: 'Finance' },
];

const BRANCHES = [
  { id: '1', name: 'Zoom Link', location: 'Lagos, Nigeria', created: 'Dec. 12th, 2025' },
];

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState("Tenant & Branches");
  const [searchQuery, setSearchQuery] = useState('');

  // --- RENDER HELPERS ---

  // Desktop Table Row converted to Mobile Card
  const renderTenantCard = (tenant: typeof TENANTS[0]) => (
    <View key={tenant.id} className="bg-white p-4 border border-slate-100 rounded-xl mb-3 shadow-sm shadow-slate-100 flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-base font-bold text-[#0F172A] mb-0.5">{tenant.name}</Text>
        <Text className="text-sm text-[#64748B] mb-2">{tenant.email}</Text>
        <View className="bg-indigo-50 self-start px-2.5 py-1 rounded-md">
          <Text className="text-xs font-semibold text-[#5841D8]">{tenant.industry}</Text>
        </View>
      </View>
      <View className="flex-row items-center gap-x-4">
        <TouchableOpacity className="p-2">
          <Pencil size={18} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2">
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBranchCard = (branch: typeof BRANCHES[0]) => (
    <View key={branch.id} className="bg-white p-4 border border-slate-100 rounded-xl mb-3 shadow-sm shadow-slate-100 flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-base font-bold text-[#0F172A] mb-0.5">{branch.name}</Text>
        <Text className="text-sm text-[#64748B] mb-1">{branch.location}</Text>
        <Text className="text-xs text-[#94A3B8]">Created: {branch.created}</Text>
      </View>
      <View className="flex-row items-center gap-x-4">
        <TouchableOpacity className="p-2">
          <Pencil size={18} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2">
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-slate-100">
      <Text className="text-sm text-[#64748B]">Page 1 of 10</Text>
      <TouchableOpacity className="border border-slate-300 rounded-lg px-4 py-1.5 flex-row items-center">
        <Text className="text-sm font-semibold text-[#334155] mr-1">Next</Text>
        <ChevronRight size={16} color="#334155" />
      </TouchableOpacity>
    </View>
  );

  // --- MAIN RENDER ---
  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* --- MOBILE HEADER --- */}
      <View className="bg-white px-6 py-3 flex-row items-center justify-between border-b border-slate-100 z-10">
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4">
            <Menu size={24} color="#0F172A" />
          </TouchableOpacity>
          <View className="w-8 h-8 bg-[#F5F3FF] rounded-lg items-center justify-center mr-2">
            <Cloud size={16} color="#5841D8" />
          </View>
          <Text className="text-lg font-bold text-[#0F172A]">Fluxdevs</Text>
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4 relative">
            <Bell size={20} color="#64748B" />
            <View className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </TouchableOpacity>
          <Image 
            source={{ uri: 'https://i.pravatar.cc/100?img=11' }} 
            className="w-8 h-8 rounded-full"
          />
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
        {/* --- SEARCH & DATE BAR --- */}
        <View className="flex-row gap-x-3 mb-6">
          <View className="flex-1 h-11 bg-white border border-slate-200 rounded-xl px-3 flex-row items-center">
            <Search size={18} color="#94A3B8" />
            <TextInput 
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search Tenants" 
              placeholderTextColor="#94A3B8"
              className="flex-1 ml-2 text-sm text-[#0F172A]"
            />
          </View>
          <View className="h-11 bg-white border border-slate-200 rounded-xl px-3 flex-row items-center justify-center">
            <Calendar size={16} color="#64748B" className="mr-2" />
            <Text className="text-xs font-medium text-[#64748B]">14 Jan, 2026</Text>
          </View>
        </View>

        {/* --- SCROLLABLE TABS --- */}
        <View className="-mx-6 px-6 mb-8">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity 
                  key={tab} 
                  onPress={() => setActiveTab(tab)}
                  className={`mr-6 pb-2 border-b-2 ${isActive ? 'border-[#5841D8]' : 'border-transparent'}`}
                >
                  <Text className={`font-semibold ${isActive ? 'text-[#5841D8]' : 'text-[#64748B]'}`}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* --- SECTION 1: TENANT MANAGEMENT --- */}
        <View className="bg-white rounded-2xl p-5 mb-8 shadow-sm shadow-slate-100">
          <View className="flex-row items-start justify-between mb-5">
            <View className="flex-1 mr-4">
              <Text className="text-lg font-bold text-[#0F172A]">Tenant Management</Text>
              <Text className="text-xs text-[#64748B] mt-1">Manage your organization branches and locations</Text>
            </View>
            <TouchableOpacity className="bg-[#5841D8] px-4 h-10 rounded-lg flex-row items-center justify-center">
              <Plus size={16} color="white" className="mr-1" />
              <Text className="text-white font-bold text-sm">Add Tenants</Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          {TENANTS.map(renderTenantCard)}

          {/* Pagination */}
          {renderPagination()}
        </View>

        {/* --- SECTION 2: BRANCH MANAGEMENT --- */}
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm shadow-slate-100">
          <View className="flex-row items-start justify-between mb-5">
            <View className="flex-1 mr-4">
              <Text className="text-lg font-bold text-[#0F172A]">Branch Management</Text>
              <Text className="text-xs text-[#64748B] mt-1">Manage your organization branches and locations</Text>
            </View>
            <TouchableOpacity className="bg-[#5841D8] px-4 h-10 rounded-lg flex-row items-center justify-center">
              <Plus size={16} color="white" className="mr-1" />
              <Text className="text-white font-bold text-sm">Create Branch</Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          {BRANCHES.map(renderBranchCard)}

          {/* Pagination */}
          {renderPagination()}
        </View>

      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}