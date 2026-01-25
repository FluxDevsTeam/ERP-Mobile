import { logoutUser } from '@/api/login';
import { useUserStore } from '@/store/userStore';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Building, Cloud, CreditCard, DollarSign, Home, LogOut, Users } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Sidebar(props: any) {
  const { user, logout } = useUserStore();

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      logout();
      router.replace('/login');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <DrawerContentScrollView {...props} scrollEnabled={false} contentContainerStyle={{ paddingBottom: 0 }}>
        {/* Header Section */}
        <View className="items-center py-8 border-b border-slate-100">
          <View className="w-20 h-20 bg-gradient-to-br from-[#5841D8] to-[#7C3AED] rounded-full items-center justify-center mb-4 shadow-md shadow-indigo-200">
            <Cloud size={48} color="white" strokeWidth={1.5} />
          </View>
          <Text className="text-xl font-bold text-[#0F172A] mb-1">{user?.tenant_name || 'Your Company'}</Text>
          <Text className="text-sm text-[#64748B]">{user?.email || 'user@example.com'}</Text>
        </View>

        {/* Navigation Items */}
        <View className="px-4 mt-4">
          <TouchableOpacity
            className="flex-row items-center py-4 px-3 rounded-lg hover:bg-slate-50 active:bg-slate-100"
            onPress={() => {
              props.navigation.closeDrawer();
              router.push({ pathname: '/dashboard', params: { tab: 'tenants' } });
            }}
          >
            <Home size={20} color="#5841D8" className="mr-4" />
            <Text className="text-base font-medium text-[#334155]">Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-4 px-3 rounded-lg hover:bg-slate-50 active:bg-slate-100"
            onPress={() => {
              props.navigation.closeDrawer();
              router.push({ pathname: '/dashboard', params: { tab: 'users' } });
            }}
          >
            <Users size={20} color="#5841D8" className="mr-4" />
            <Text className="text-base font-medium text-[#334155]">User Management</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-4 px-3 rounded-lg hover:bg-slate-50 active:bg-slate-100"
            onPress={() => {
              props.navigation.closeDrawer();
              router.push({ pathname: '/dashboard', params: { tab: 'tenants' } });
            }}
          >
            <Building size={20} color="#5841D8" className="mr-4" />
            <Text className="text-base font-medium text-[#334155]">Tenant & Branches</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-4 px-3 rounded-lg hover:bg-slate-50 active:bg-slate-100"
            onPress={() => {
              props.navigation.closeDrawer();
              router.push({ pathname: '/dashboard', params: { tab: 'subscription' } });
            }}
          >
            <CreditCard size={20} color="#5841D8" className="mr-4" />
            <Text className="text-base font-medium text-[#334155]">Subscription</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-4 px-3 rounded-lg hover:bg-slate-50 active:bg-slate-100"
            onPress={() => {
              props.navigation.closeDrawer();
              router.push({ pathname: '/dashboard', params: { tab: 'payments' } });
            }}
          >
            <DollarSign size={20} color="#5841D8" className="mr-4" />
            <Text className="text-base font-medium text-[#334155]">Payments</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      {/* Footer Logout */}
      <View className="border-t border-slate-100 px-4 py-6">
        <TouchableOpacity
          className="flex-row items-center py-3 px-3 rounded-lg active:bg-slate-100"
          onPress={handleLogout}
        >
          <LogOut size={20} color="#EF4444" className="mr-4" />
          <Text className="text-base font-medium text-[#EF4444]">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}