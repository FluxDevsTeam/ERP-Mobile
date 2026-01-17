import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Plus, Pencil, Trash2, X, Building2, MapPin, MoreVertical } from 'lucide-react-native';
import PaginationControl from './PaginationControl';

// APIs
import { getTenants, deleteTenant, updateTenant, Tenant } from '../../api/tenant';
import { getBranches, Branch } from '../../api/branch';
import { useUserStore } from '../../store/userStore';

export default function TenantBranchTab() {
  const user = useUserStore((state) => state.user);

  // --- DATA STATE ---
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  
  // Loading & Pagination
  const [isTenantsRefreshing, setIsTenantsRefreshing] = useState(false);
  const [isBranchesRefreshing, setIsBranchesRefreshing] = useState(false);
  const [tenantPage, setTenantPage] = useState(1);
  const [branchPage, setBranchPage] = useState(1);
  const [tenantMeta, setTenantMeta] = useState<any>(null);
  const [branchMeta, setBranchMeta] = useState<any>(null);

  // Edit State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchTenantsData(tenantPage); }, [tenantPage]);
  useEffect(() => { fetchBranchesData(branchPage); }, [branchPage]);

  // --- FETCHERS ---
  const fetchTenantsData = async (page: number) => {
    setIsTenantsRefreshing(true);
    const res = await getTenants(page);
    setIsTenantsRefreshing(false);
    if (res.success && res.data) {
      setTenants(res.data);
      if (res.meta) setTenantMeta(res.meta);
    }
  };

  const fetchBranchesData = async (page: number) => {
    setIsBranchesRefreshing(true);
    const res = await getBranches(page);
    setIsBranchesRefreshing(false);
    if (res.success && res.data) {
      setBranches(res.data);
      if (res.meta) setBranchMeta(res.meta);
    }
  };

  // Actions
  const handleDeleteTenant = (id: string, name: string) => { /* ... (Same logic as before) ... */ };
  const openEditModal = (tenant: Tenant) => { 
    setEditingTenant(tenant); 
    setEditName(tenant.name); 
    setEditModalVisible(true); 
  };
  const handleSaveEdit = async () => { 
    if (!editingTenant || !editName.trim()) return;
    setIsSaving(true);
    const res = await updateTenant(editingTenant.id, { name: editName });
    setIsSaving(false);
    if (res.success) {
      setEditModalVisible(false);
      fetchTenantsData(tenantPage);
    }
  };

  // --- DESIGN: Tenant Card ---
  const renderTenantCard = (tenant: Tenant) => (
    <View key={tenant.id} className="bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-row flex-1 mr-4">
          {/* Icon Box */}
          <View className="w-12 h-12 bg-indigo-50 rounded-xl items-center justify-center mr-4">
            <Building2 size={20} color="#5841D8" />
          </View>
          
          {/* Info */}
          <View className="flex-1">
            <Text className="text-base font-bold text-[#0F172A] mb-1">{tenant.name}</Text>
            <Text className="text-xs text-[#64748B] mb-2">{user?.email || "No email"}</Text> 
            
            {/* Industry Badge */}
            <View className="bg-slate-100 self-start px-2.5 py-1 rounded-md">
              <Text className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">
                {tenant.industry}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row gap-1">
          <TouchableOpacity onPress={() => openEditModal(tenant)} className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center border border-slate-100">
            <Pencil size={14} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity className="w-8 h-8 rounded-full bg-red-50 items-center justify-center border border-red-100">
            <Trash2 size={14} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // --- DESIGN: Branch Card ---
  const renderBranchCard = (branch: Branch) => (
    <View key={branch.id} className="bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-row flex-1 mr-4">
          {/* Icon Box */}
          <View className="w-12 h-12 bg-emerald-50 rounded-xl items-center justify-center mr-4">
            <MapPin size={20} color="#10B981" />
          </View>
          
          {/* Info */}
          <View className="flex-1">
            <Text className="text-base font-bold text-[#0F172A] mb-1">{branch.name || "Main Branch"}</Text>
            <Text className="text-sm text-[#64748B] mb-1">{branch.location || "Headquarters"}</Text>
            <Text className="text-[10px] text-[#94A3B8]">
              Added: {branch.created_at ? new Date(branch.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row gap-1">
          <TouchableOpacity className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center border border-slate-100">
            <Pencil size={14} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity className="w-8 h-8 rounded-full bg-red-50 items-center justify-center border border-red-100">
            <Trash2 size={14} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View>
      {/* --- TENANTS SECTION --- */}
      <View className="mb-8">
        <View className="flex-row items-end justify-between mb-4 px-1">
          <View>
            <Text className="text-lg font-bold text-[#0F172A]">Tenant Management</Text>
            <Text className="text-xs text-[#64748B] mt-0.5">Manage your workspace tenants</Text>
          </View>
          <TouchableOpacity className="bg-[#0F172A] px-4 py-2 rounded-lg flex-row items-center shadow-sm">
            <Plus size={14} color="white" className="mr-1.5" />
            <Text className="text-white font-bold text-xs">Add New</Text>
          </TouchableOpacity>
        </View>

        {isTenantsRefreshing && tenants.length === 0 ? (
          <ActivityIndicator color="#5841D8" className="py-10" />
        ) : tenants.length === 0 ? (
          <View className="bg-white p-8 rounded-2xl items-center border border-slate-100 border-dashed">
            <Text className="text-slate-400 mb-2">No tenants found</Text>
          </View>
        ) : (
          tenants.map(renderTenantCard)
        )}

        <PaginationControl 
          currentPage={tenantPage}
          hasNext={!!tenantMeta?.next}
          hasPrev={!!tenantMeta?.previous}
          totalCount={tenantMeta?.count}
          onNext={() => setTenantPage(p => p + 1)}
          onPrev={() => setTenantPage(p => Math.max(1, p - 1))}
        />
      </View>

      {/* --- BRANCHES SECTION --- */}
      <View className="mb-6">
        <View className="flex-row items-end justify-between mb-4 px-1">
          <View>
            <Text className="text-lg font-bold text-[#0F172A]">Branch Management</Text>
            <Text className="text-xs text-[#64748B] mt-0.5">Locations & outlets</Text>
          </View>
          <TouchableOpacity className="bg-white border border-slate-200 px-4 py-2 rounded-lg flex-row items-center">
            <Plus size={14} color="#0F172A" className="mr-1.5" />
            <Text className="text-[#0F172A] font-bold text-xs">Create Branch</Text>
          </TouchableOpacity>
        </View>

        {isBranchesRefreshing && branches.length === 0 ? (
          <ActivityIndicator color="#5841D8" className="py-10" />
        ) : branches.length === 0 ? (
          <View className="bg-white p-8 rounded-2xl items-center border border-slate-100 border-dashed">
            <Text className="text-slate-400 mb-2">No branches found</Text>
          </View>
        ) : (
          branches.map(renderBranchCard)
        )}

        <PaginationControl 
          currentPage={branchPage}
          hasNext={!!branchMeta?.next}
          hasPrev={!!branchMeta?.previous}
          totalCount={branchMeta?.count}
          onNext={() => setBranchPage(p => p + 1)}
          onPrev={() => setBranchPage(p => Math.max(1, p - 1))}
        />
      </View>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-[#0F172A]">Edit Tenant</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} className="p-1 bg-slate-100 rounded-full">
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text className="text-[#334155] font-medium mb-2">Tenant Name</Text>
            <TextInput value={editName} onChangeText={setEditName} className="h-12 border border-slate-300 rounded-xl px-4 text-base text-[#0F172A] bg-white mb-6"/>
            <TouchableOpacity onPress={handleSaveEdit} disabled={isSaving} className={`bg-[#5841D8] h-12 rounded-xl items-center justify-center ${isSaving ? 'opacity-70' : ''}`}>
              {isSaving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}