import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput 
} from 'react-native';
import { Plus, Pencil, Trash2, X } from 'lucide-react-native';
import PaginationControl from './PaginationControl';

// APIs
import { 
  getTenants, 
  deleteTenant, 
  updateTenant, 
  Tenant 
} from '../../api/tenant';
import { getBranches, Branch } from '../../api/branch';
import { useUserStore } from '../../store/userStore';

export default function TenantBranchTab() {
  const user = useUserStore((state) => state.user);

  // --- DATA STATE ---
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  
  // Loading & Pagination
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [tenantPage, setTenantPage] = useState(1);
  const [branchPage, setBranchPage] = useState(1);
  const [tenantMeta, setTenantMeta] = useState<any>(null);
  const [branchMeta, setBranchMeta] = useState<any>(null);

  // --- EDIT STATE ---
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchTenantsData(tenantPage);
  }, [tenantPage]);

  useEffect(() => {
    fetchBranchesData(branchPage);
  }, [branchPage]);

  // --- API CALLS ---
  const fetchTenantsData = async (page: number) => {
    setLoadingTenants(true);
    const res = await getTenants(page);
    setLoadingTenants(false);
    if (res.success && res.data) {
      setTenants(res.data);
      if (res.meta) setTenantMeta(res.meta);
    }
  };

  const fetchBranchesData = async (page: number) => {
    setLoadingBranches(true);
    const res = await getBranches(page);
    setLoadingBranches(false);
    if (res.success && res.data) {
      setBranches(res.data);
      if (res.meta) setBranchMeta(res.meta);
    }
  };

  // --- ACTIONS ---

  // 1. DELETE ACTION
  const handleDeleteTenant = (id: string, name: string) => {
    Alert.alert(
      "Delete Tenant",
      `Are you sure you want to delete "${name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            const res = await deleteTenant(id);
            if (res.success) {
              fetchTenantsData(tenantPage); // Refresh list
            } else {
              Alert.alert("Error", res.message);
            }
          }
        }
      ]
    );
  };

  // 2. EDIT SETUP
  const openEditModal = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setEditName(tenant.name);
    setEditModalVisible(true);
  };

  // 3. SAVE EDIT
  const handleSaveEdit = async () => {
    if (!editingTenant || !editName.trim()) return;

    setIsSaving(true);
    const res = await updateTenant(editingTenant.id, { name: editName });
    setIsSaving(false);

    if (res.success) {
      setEditModalVisible(false);
      fetchTenantsData(tenantPage); // Refresh list
    } else {
      Alert.alert("Error", res.message);
    }
  };

  // --- RENDER CARD HELPERS ---
  const renderTenantCard = (tenant: Tenant) => (
    <View key={tenant.id} className="bg-white p-4 border border-slate-100 rounded-xl mb-3 shadow-sm shadow-slate-100 flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-base font-bold text-[#0F172A] mb-0.5">{tenant.name}</Text>
        <Text className="text-sm text-[#64748B] mb-2">{user?.email || "No email"}</Text> 
        <View className="bg-indigo-50 self-start px-2.5 py-1 rounded-md mt-1">
          <Text className="text-xs font-semibold text-[#5841D8]">{tenant.industry}</Text>
        </View>
      </View>
      <View className="flex-row items-center gap-x-4">
        {/* EDIT BUTTON */}
        <TouchableOpacity onPress={() => openEditModal(tenant)} className="p-2">
          <Pencil size={18} color="#64748B" />
        </TouchableOpacity>
        
        {/* DELETE BUTTON */}
        <TouchableOpacity onPress={() => handleDeleteTenant(tenant.id, tenant.name)} className="p-2">
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBranchCard = (branch: Branch) => (
    <View key={branch.id} className="bg-white p-4 border border-slate-100 rounded-xl mb-3 shadow-sm shadow-slate-100 flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-base font-bold text-[#0F172A] mb-0.5">{branch.name || "Branch Name"}</Text>
        <Text className="text-sm text-[#64748B] mb-1">{branch.location || "Lagos, Nigeria"}</Text>
        <Text className="text-xs text-[#94A3B8]">
          Created: {branch.created_at ? new Date(branch.created_at).toLocaleDateString() : 'N/A'}
        </Text>
      </View>
      <View className="flex-row items-center gap-x-4">
        <TouchableOpacity className="p-2"><Pencil size={18} color="#64748B" /></TouchableOpacity>
        <TouchableOpacity className="p-2"><Trash2 size={18} color="#EF4444" /></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View>
      {/* --- TENANTS SECTION --- */}
      <View className="bg-white rounded-2xl p-5 mb-8 shadow-sm shadow-slate-100">
        <View className="flex-row items-start justify-between mb-5">
          <View className="flex-1 mr-4">
            <Text className="text-lg font-bold text-[#0F172A]">Tenant Management</Text>
            <Text className="text-xs text-[#64748B] mt-1">Manage your organization branches and locations</Text>
          </View>
          <TouchableOpacity className="bg-[#5841D8] px-4 h-10 rounded-lg flex-row items-center justify-center">
            <Plus size={16} color="white" className="mr-1" />
            <Text className="text-white font-bold text-sm">Add</Text>
          </TouchableOpacity>
        </View>

        {loadingTenants ? (
          <ActivityIndicator color="#5841D8" className="py-4" />
        ) : tenants.length === 0 ? (
          <Text className="text-center text-slate-400 py-4">No tenants found</Text>
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
      <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm shadow-slate-100">
        <View className="flex-row items-start justify-between mb-5">
          <View className="flex-1 mr-4">
            <Text className="text-lg font-bold text-[#0F172A]">Branch Management</Text>
            <Text className="text-xs text-[#64748B] mt-1">Manage locations</Text>
          </View>
          <TouchableOpacity className="bg-[#5841D8] px-4 h-10 rounded-lg flex-row items-center justify-center">
            <Plus size={16} color="white" className="mr-1" />
            <Text className="text-white font-bold text-sm">Create</Text>
          </TouchableOpacity>
        </View>

        {loadingBranches ? (
          <ActivityIndicator color="#5841D8" className="py-4" />
        ) : branches.length === 0 ? (
          <Text className="text-center text-slate-400 py-4">No branches found</Text>
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

      {/* --- EDIT TENANT MODAL --- */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-[#0F172A]">Edit Tenant</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text className="text-[#334155] font-medium mb-2">Tenant Name</Text>
            <TextInput 
              value={editName}
              onChangeText={setEditName}
              className="h-12 border border-slate-300 rounded-xl px-4 text-base text-[#0F172A] bg-white mb-6"
            />

            <TouchableOpacity 
              onPress={handleSaveEdit}
              disabled={isSaving}
              className={`bg-[#5841D8] h-12 rounded-xl items-center justify-center ${isSaving ? 'opacity-70' : ''}`}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}