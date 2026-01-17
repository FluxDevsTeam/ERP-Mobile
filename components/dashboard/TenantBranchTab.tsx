import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, ScrollView 
} from 'react-native';
import { Plus, Pencil, Trash2, X, Building2, MapPin, ChevronDown, Check } from 'lucide-react-native';
import PaginationControl from './PaginationControl';

// APIs
import { 
  getTenants, 
  deleteTenant, 
  updateTenant, 
  createTenant, 
  Tenant 
} from '../../api/tenant';
import { 
  getBranches, 
  createBranch, 
  checkBranchName, 
  Branch 
} from '../../api/branch';
import { useUserStore } from '../../store/userStore';

const INDUSTRIES = [
  "Basic", "Finance", "Technology", "Healthcare", "Retail", "Education", "Construction", "Other"
];

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

  // --- TENANT MODAL STATES ---
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editName, setEditName] = useState('');
  const [editIndustry, setEditIndustry] = useState('');
  
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIndustry, setNewIndustry] = useState('Basic');

  // --- BRANCH MODAL STATES ---
  const [createBranchModalVisible, setCreateBranchModalVisible] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchLocation, setBranchLocation] = useState('');
  const [branchNameAvailable, setBranchNameAvailable] = useState<boolean | null>(null);
  const [checkingBranchName, setCheckingBranchName] = useState(false);

  // Industry Picker
  const [industryPickerVisible, setIndustryPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'add' | 'edit'>('add');

  const [isSaving, setIsSaving] = useState(false);

  // --- INITIAL LOAD ---
  useEffect(() => { fetchTenantsData(tenantPage); }, [tenantPage]);
  useEffect(() => { fetchBranchesData(branchPage); }, [branchPage]);

  // --- BRANCH NAME CHECK EFFECT ---
  useEffect(() => {
    if (!branchName || !branchLocation) {
      setBranchNameAvailable(null);
      return;
    }
    setBranchNameAvailable(null);

    const delayDebounceFn = setTimeout(async () => {
      if (branchName.length > 2) {
        setCheckingBranchName(true);
        const result = await checkBranchName(branchName, branchLocation);
        setCheckingBranchName(false);
        setBranchNameAvailable(result.success);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [branchName, branchLocation]);

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

  // --- TENANT ACTIONS ---
  const handleDeleteTenant = (id: string, name: string) => {
    Alert.alert("Delete Tenant", `Are you sure you want to delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          const res = await deleteTenant(id);
          if (res.success) fetchTenantsData(1);
          else Alert.alert("Error", res.message);
      }}
    ]);
  };

  const openEditModal = (tenant: Tenant) => { 
    setEditingTenant(tenant); 
    setEditName(tenant.name); 
    setEditIndustry(tenant.industry);
    setEditModalVisible(true); 
  };

  const handleSaveEdit = async () => { 
    if (!editingTenant || !editName.trim()) return;
    setIsSaving(true);
    const res = await updateTenant(editingTenant.id, { name: editName, industry: editIndustry });
    setIsSaving(false);
    if (res.success) { setEditModalVisible(false); fetchTenantsData(tenantPage); }
    else Alert.alert("Error", res.message);
  };

  const openAddModal = () => { setNewName(''); setNewIndustry('Basic'); setAddModalVisible(true); };

  const handleCreateTenant = async () => {
    if (!newName.trim()) { Alert.alert("Required", "Please enter company name"); return; }
    setIsSaving(true);
    const res = await createTenant(newName, newIndustry);
    setIsSaving(false);
    if (res.success) { setAddModalVisible(false); Alert.alert("Success", "Tenant created"); fetchTenantsData(1); }
    else Alert.alert("Error", res.message);
  };

  // --- BRANCH ACTIONS ---
  const openCreateBranchModal = () => {
    setBranchName('');
    setBranchLocation('');
    setBranchNameAvailable(null);
    setCreateBranchModalVisible(true);
  };

  const handleCreateBranch = async () => {
    if (!branchName.trim() || !branchLocation.trim()) {
      Alert.alert("Required", "Please fill in all fields");
      return;
    }
    if (branchNameAvailable === false) {
      Alert.alert("Unavailable", "Branch name is taken in this location");
      return;
    }

    setIsSaving(true);
    const res = await createBranch(branchName, branchLocation);
    setIsSaving(false);

    if (res.success) {
      setCreateBranchModalVisible(false);
      Alert.alert("Success", "Branch created successfully");
      fetchBranchesData(1); // Refresh list
    } else {
      Alert.alert("Error", res.message);
    }
  };

  // --- HELPERS ---
  const openIndustryPicker = (mode: 'add' | 'edit') => { setPickerMode(mode); setIndustryPickerVisible(true); };
  const handleSelectIndustry = (industry: string) => {
    pickerMode === 'add' ? setNewIndustry(industry) : setEditIndustry(industry);
    setIndustryPickerVisible(false);
  };

  // --- RENDERERS ---
  const renderTenantCard = (tenant: Tenant) => (
    <View key={tenant.id} className="bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-row flex-1 mr-4">
          <View className="w-12 h-12 bg-indigo-50 rounded-xl items-center justify-center mr-4"><Building2 size={20} color="#5841D8" /></View>
          <View className="flex-1">
            <Text className="text-base font-bold text-[#0F172A] mb-1">{tenant.name}</Text>
            <Text className="text-xs text-[#64748B] mb-2">{user?.email}</Text> 
            <View className="bg-slate-100 self-start px-2.5 py-1 rounded-md"><Text className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">{tenant.industry}</Text></View>
          </View>
        </View>
        <View className="flex-row gap-1">
          <TouchableOpacity onPress={() => openEditModal(tenant)} className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center border border-slate-100"><Pencil size={14} color="#64748B" /></TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteTenant(tenant.id, tenant.name)} className="w-8 h-8 rounded-full bg-red-50 items-center justify-center border border-red-100"><Trash2 size={14} color="#EF4444" /></TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderBranchCard = (branch: Branch) => (
    <View key={branch.id} className="bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-row flex-1 mr-4">
          <View className="w-12 h-12 bg-emerald-50 rounded-xl items-center justify-center mr-4"><MapPin size={20} color="#10B981" /></View>
          <View className="flex-1">
            <Text className="text-base font-bold text-[#0F172A] mb-1">{branch.name || "Main Branch"}</Text>
            <Text className="text-sm text-[#64748B] mb-1">{branch.location || "Headquarters"}</Text>
            <Text className="text-[10px] text-[#94A3B8]">Added: {branch.created_at ? new Date(branch.created_at).toLocaleDateString() : 'N/A'}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View>
      {/* TENANTS SECTION */}
      <View className="mb-8">
        <View className="flex-row items-end justify-between mb-4 px-1">
          <View><Text className="text-lg font-bold text-[#0F172A]">Tenant Management</Text><Text className="text-xs text-[#64748B] mt-0.5">Manage your workspace tenants</Text></View>
          <TouchableOpacity onPress={openAddModal} className="bg-[#0F172A] px-4 py-2 rounded-lg flex-row items-center shadow-sm"><Plus size={14} color="white" className="mr-1.5" /><Text className="text-white font-bold text-xs">Add New</Text></TouchableOpacity>
        </View>
        {isTenantsRefreshing && tenants.length === 0 ? <ActivityIndicator color="#5841D8" className="py-10" /> : tenants.length === 0 ? <View className="bg-white p-8 rounded-2xl items-center border border-slate-100 border-dashed"><Text className="text-slate-400 mb-2">No tenants found</Text></View> : tenants.map(renderTenantCard)}
        <PaginationControl currentPage={tenantPage} hasNext={!!tenantMeta?.next} hasPrev={!!tenantMeta?.previous} totalCount={tenantMeta?.count} onNext={() => setTenantPage(p => p + 1)} onPrev={() => setTenantPage(p => Math.max(1, p - 1))} />
      </View>

      {/* BRANCHES SECTION */}
      <View className="mb-6">
        <View className="flex-row items-end justify-between mb-4 px-1">
          <View><Text className="text-lg font-bold text-[#0F172A]">Branch Management</Text><Text className="text-xs text-[#64748B] mt-0.5">Locations & outlets</Text></View>
          <TouchableOpacity onPress={openCreateBranchModal} className="bg-white border border-slate-200 px-4 py-2 rounded-lg flex-row items-center"><Plus size={14} color="#0F172A" className="mr-1.5" /><Text className="text-[#0F172A] font-bold text-xs">Create Branch</Text></TouchableOpacity>
        </View>
        {isBranchesRefreshing && branches.length === 0 ? <ActivityIndicator color="#5841D8" className="py-10" /> : branches.length === 0 ? <View className="bg-white p-8 rounded-2xl items-center border border-slate-100 border-dashed"><Text className="text-slate-400 mb-2">No branches found</Text></View> : branches.map(renderBranchCard)}
        <PaginationControl currentPage={branchPage} hasNext={!!branchMeta?.next} hasPrev={!!branchMeta?.previous} totalCount={branchMeta?.count} onNext={() => setBranchPage(p => p + 1)} onPrev={() => setBranchPage(p => Math.max(1, p - 1))} />
      </View>

      {/* MODAL: ADD TENANT */}
      <Modal visible={addModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-6"><Text className="text-xl font-bold text-[#0F172A]">Add New Tenant</Text><TouchableOpacity onPress={() => setAddModalVisible(false)} className="p-1 bg-slate-100 rounded-full"><X size={20} color="#64748B" /></TouchableOpacity></View>
            <Text className="text-[#334155] font-medium mb-2">Company Name</Text><TextInput value={newName} onChangeText={setNewName} placeholder="Ex. Global Ventures" placeholderTextColor="#94A3B8" className="h-12 border border-slate-300 rounded-xl px-4 text-base text-[#0F172A] bg-white mb-4"/>
            <Text className="text-[#334155] font-medium mb-2">Industry</Text><TouchableOpacity onPress={() => openIndustryPicker('add')} className="h-12 border border-slate-300 rounded-xl px-4 flex-row items-center justify-between bg-white mb-6"><Text className="text-[#0F172A] text-base">{newIndustry}</Text><ChevronDown size={20} color="#64748B" /></TouchableOpacity>
            <TouchableOpacity onPress={handleCreateTenant} disabled={isSaving} className={`bg-[#5841D8] h-12 rounded-xl items-center justify-center ${isSaving ? 'opacity-70' : ''}`}>{isSaving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Create Tenant</Text>}</TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: CREATE BRANCH */}
      <Modal visible={createBranchModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-[#0F172A]">Create Branch</Text>
              <TouchableOpacity onPress={() => setCreateBranchModalVisible(false)} className="p-1 bg-slate-100 rounded-full">
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            {/* Branch Name Input */}
            <Text className="text-[#334155] font-medium mb-2">Branch Name</Text>
            <View className="relative mb-4">
              <TextInput 
                value={branchName} 
                onChangeText={setBranchName} 
                placeholder="Ex. Lekki Outlet" 
                placeholderTextColor="#94A3B8"
                className={`h-12 border rounded-xl px-4 text-base text-[#0F172A] bg-white pr-10 ${branchNameAvailable === false ? 'border-red-500' : branchNameAvailable === true ? 'border-[#10B981]' : 'border-slate-300'}`}
              />
              {checkingBranchName && <View className="absolute right-3 top-3"><ActivityIndicator color="#5841D8" size="small" /></View>}
            </View>

            {/* Location Input */}
            <Text className="text-[#334155] font-medium mb-2">Location</Text>
            <TextInput 
              value={branchLocation} 
              onChangeText={setBranchLocation} 
              placeholder="Ex. 12 Admiralty Way, Lagos" 
              placeholderTextColor="#94A3B8"
              className="h-12 border border-slate-300 rounded-xl px-4 text-base text-[#0F172A] bg-white mb-2"
            />
            
            {/* Availability Text */}
            <View className="h-6 mb-4">
              {branchName.length > 2 && !checkingBranchName && branchNameAvailable === true && <Text className="text-[#10B981] text-xs">Branch name available</Text>}
              {branchName.length > 2 && !checkingBranchName && branchNameAvailable === false && <Text className="text-red-500 text-xs">Branch name already taken here</Text>}
            </View>

            <TouchableOpacity onPress={handleCreateBranch} disabled={isSaving || checkingBranchName} className={`bg-[#5841D8] h-12 rounded-xl items-center justify-center ${isSaving ? 'opacity-70' : ''}`}>
              {isSaving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Create Branch</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: EDIT TENANT */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-6"><Text className="text-xl font-bold text-[#0F172A]">Edit Tenant</Text><TouchableOpacity onPress={() => setEditModalVisible(false)} className="p-1 bg-slate-100 rounded-full"><X size={20} color="#64748B" /></TouchableOpacity></View>
            <Text className="text-[#334155] font-medium mb-2">Tenant Name</Text><TextInput value={editName} onChangeText={setEditName} className="h-12 border border-slate-300 rounded-xl px-4 text-base text-[#0F172A] bg-white mb-4"/>
            <Text className="text-[#334155] font-medium mb-2">Industry</Text><TouchableOpacity onPress={() => openIndustryPicker('edit')} className="h-12 border border-slate-300 rounded-xl px-4 flex-row items-center justify-between bg-white mb-6"><Text className="text-[#0F172A] text-base">{editIndustry}</Text><ChevronDown size={20} color="#64748B" /></TouchableOpacity>
            <TouchableOpacity onPress={handleSaveEdit} disabled={isSaving} className={`bg-[#5841D8] h-12 rounded-xl items-center justify-center ${isSaving ? 'opacity-70' : ''}`}>{isSaving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Save Changes</Text>}</TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SHARED INDUSTRY PICKER */}
      <Modal visible={industryPickerVisible} transparent animationType="slide">
        <TouchableOpacity className="flex-1 bg-black/50 justify-end" activeOpacity={1} onPress={() => setIndustryPickerVisible(false)}>
          <View className="bg-white rounded-t-3xl h-[50%] p-6">
            <View className="flex-row justify-between items-center mb-4"><Text className="text-xl font-bold text-[#0F172A]">Select Industry</Text><TouchableOpacity onPress={() => setIndustryPickerVisible(false)}><X size={24} color="#64748B" /></TouchableOpacity></View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {INDUSTRIES.map((item) => {
                const isSelected = pickerMode === 'add' ? newIndustry === item : editIndustry === item;
                return (<TouchableOpacity key={item} onPress={() => handleSelectIndustry(item)} className="py-4 border-b border-slate-100 flex-row justify-between items-center"><Text className={`text-lg ${isSelected ? 'text-[#5841D8] font-bold' : 'text-[#334155]'}`}>{item}</Text>{isSelected && <Check size={20} color="#5841D8" />}</TouchableOpacity>);
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}