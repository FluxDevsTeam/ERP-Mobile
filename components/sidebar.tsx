import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { 
  LayoutGrid, 
  Tag, 
  Box, 
  Warehouse, 
  Truck, 
  BarChart4, 
  Settings, 
  LogOut,
  Cloud,
  ChevronRight 
} from 'lucide-react-native';
import { useRouter, usePathname, Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { logoutUser } from '../api/login';
import { useUserStore } from '../store/userStore';

const MENU_ITEMS = [
  { name: 'Dashboard', icon: LayoutGrid, route: '/dashboard' },
  { name: 'Point of Sale', icon: Tag, route: '/pos' },
  { name: 'Inventory', icon: Box, route: '/inventory' },
  { name: 'Warehouse', icon: Warehouse, route: '/warehouse' },
  { name: 'Suppliers', icon: Truck, route: '/suppliers' },
  { name: 'Analytics', icon: BarChart4, route: '/analytics' },
];

export default function Sidebar(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const logout = useUserStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Log Out", 
        style: "destructive",
        onPress: async () => {
           await logoutUser();
           logout();
           router.replace('/login');
        }
      }
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      
      {/* 1. Header Area - Handles Top Safe Area */}
      <View 
        style={{ paddingTop: insets.top + 10, paddingBottom: 24 }} 
        className="px-6 border-b border-slate-50"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-[#F5F3FF] rounded-xl items-center justify-center mr-3 border border-indigo-50">
            <Cloud size={22} color="#5841D8" fill="#F5F3FF" />
          </View>
          <View>
            <Text className="text-xl font-bold text-[#0F172A] tracking-tight">Fluxdevs</Text>
            <Text className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Workspace</Text>
          </View>
        </View>
      </View>

      {/* 2. Scrollable Menu Items */}
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xs font-bold text-[#94A3B8] mb-4 ml-2 uppercase tracking-wider">Main Menu</Text>
        
        <View className="gap-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.route;
            return (
              <TouchableOpacity 
                key={item.name}
                onPress={() => router.push(item.route as Href)}
                activeOpacity={0.7}
                className={`flex-row items-center py-3.5 px-4 rounded-xl ${
                  isActive ? 'bg-[#F5F3FF]' : 'bg-transparent'
                }`}
              >
                <item.icon 
                  size={20} 
                  color={isActive ? '#5841D8' : '#64748B'} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <Text 
                  className={`ml-3 text-[15px] ${
                    isActive ? 'text-[#5841D8] font-bold' : 'text-[#334155] font-medium'
                  }`}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* 3. Footer Area - Handles Bottom Safe Area */}
      <View 
        style={{ paddingBottom: Math.max(insets.bottom, 20) }} 
        className="px-4 pt-4 border-t border-slate-100 bg-white"
      >
        <Text className="text-xs font-bold text-[#94A3B8] mb-3 ml-2 uppercase tracking-wider">Preferences</Text>

        <TouchableOpacity 
          onPress={() => router.push('/settings' as Href)}
          className="bg-[#F8FAFC] flex-row items-center justify-between p-3.5 rounded-xl border border-slate-100 mb-3"
        >
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-white rounded-lg items-center justify-center border border-slate-100 mr-3">
               <Settings size={18} color="#64748B" />
            </View>
            <Text className="text-[#334155] font-semibold text-sm">Settings</Text>
          </View>
          <ChevronRight size={16} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleLogout}
          className="flex-row items-center justify-center py-3 rounded-xl active:bg-red-50"
        >
          <LogOut size={18} color="#EF4444" />
          <Text className="ml-2 text-[#EF4444] font-bold text-sm">Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}