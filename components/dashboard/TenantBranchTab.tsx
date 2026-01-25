import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  Globe,
  MapPin,
  Pencil,
  Plus,
  Trash2, X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, // NEW
  Modal,
  Platform, // NEW
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import PaginationControl from './PaginationControl';

// APIs
import {
  Branch,
  checkBranchName,
  createBranch,
  deleteBranch, // NEW
  getBranches,
  updateBranch // NEW
} from '../../api/branch';
import {
  createTenant,
  deleteTenant,
  getTenants,
  Tenant,
  updateTenant
} from '../../api/tenant';
import { useUserStore } from '../../store/userStore';

const INDUSTRIES = [
  { name: "Basic", icon: "📦", color: "#64748B" },
  { name: "Finance", icon: "💰", color: "#10B981" },
  { name: "Technology", icon: "💻", color: "#3B82F6" },
  { name: "Healthcare", icon: "🏥", color: "#EF4444" },
  { name: "Retail", icon: "🛒", color: "#F59E0B" },
  { name: "Education", icon: "📚", color: "#8B5CF6" },
  { name: "Construction", icon: "🏗️", color: "#F97316" },
  { name: "Other", icon: "✨", color: "#6366F1" },
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
  const [editBranchModalVisible, setEditBranchModalVisible] = useState(false); // NEW
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null); // NEW
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
    Alert.alert("Delete Workspace", `Are you sure you want to delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          const res = await deleteTenant(id);
          if (res.success) fetchTenantsData(1);
          else Alert.alert("Error", res.message);
        }
      }
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
    if (res.success) { setAddModalVisible(false); Alert.alert("Success", "Workspace created"); fetchTenantsData(1); }
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
      fetchBranchesData(1);
    } else {
      Alert.alert("Error", res.message);
    }
  };

  // --- NEW BRANCH ACTIONS ---
  const handleDeleteBranch = (id: string, name: string) => {
    Alert.alert("Delete Branch", `Are you sure you want to delete "${name || 'this branch'}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          const res = await deleteBranch(id);
          if (res.success) fetchBranchesData(1);
          else Alert.alert("Error", res.message);
        }
      }
    ]);
  };

  const openEditBranchModal = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchName(branch.name || '');
    setBranchLocation(branch.location || '');
    setBranchNameAvailable(null); // Reset availability check
    setEditBranchModalVisible(true);
  };

  const handleUpdateBranch = async () => {
    if (!editingBranch || !branchName.trim()) return;

    setIsSaving(true);
    const res = await updateBranch(editingBranch.id, { name: branchName, location: branchLocation });
    setIsSaving(false);

    if (res.success) {
      setEditBranchModalVisible(false);
      Alert.alert("Success", "Branch updated successfully");
      fetchBranchesData(branchPage);
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

  const getIndustryConfig = (industryName: string) => {
    return INDUSTRIES.find(i => i.name === industryName) || INDUSTRIES[0];
  };

  // --- RENDERERS ---
  const renderTenantCard = (tenant: Tenant) => {
    const industry = getIndustryConfig(tenant.industry);
    return (
      <View key={tenant.id} className="bg-white rounded-2xl mb-6 border border-slate-100 shadow-sm overflow-hidden">
        {/* Gradient Top Bar */}
        <View className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" style={{ backgroundColor: '#5841D8' }} />

        <View className="p-6">
          <View className="flex-row items-start justify-between">
            <View className="flex-row flex-1 mr-4">
              {/* Icon with gradient background */}
              <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: '#F5F3FF' }}>
                <Building2 size={24} color="#5841D8" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-[#0F172A] mb-1">{tenant.name}</Text>
                <View className="flex-row items-center mb-2">
                  <Globe size={12} color="#94A3B8" />
                  <Text className="text-xs text-[#64748B] ml-1">{user?.email}</Text>
                </View>
                {/* Industry Badge */}
                <View className="flex-row items-center self-start px-3 py-1.5 rounded-full" style={{ backgroundColor: '#F1F5F9' }}>
                  <Text className="mr-1.5">{industry.icon}</Text>
                  <Text className="text-xs font-semibold" style={{ color: industry.color }}>{tenant.industry}</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => openEditModal(tenant)}
                className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center border border-slate-100"
              >
                <Pencil size={16} color="#64748B" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteTenant(tenant.id, tenant.name)}
                className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center border border-red-100"
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderBranchCard = (branch: Branch) => (
    <View key={branch.id} className="bg-white rounded-2xl mb-6 border border-slate-100 shadow-sm overflow-hidden">
      {/* Gradient Top Bar */}
      <View className="h-1.5" style={{ backgroundColor: '#10B981' }} />

      <View className="p-6">
        <View className="flex-row items-start justify-between">
          <View className="flex-row flex-1 mr-4">
            {/* Icon */}
            <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: '#ECFDF5' }}>
              <MapPin size={24} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-[#0F172A] mb-1">{branch.name || "Main Branch"}</Text>
              <View className="flex-row items-center mb-2">
                <MapPin size={12} color="#94A3B8" />
                <Text className="text-sm text-[#64748B] ml-1">{branch.location || "Headquarters"}</Text>
              </View>
              {/* Date Badge */}
              <View className="flex-row items-center">
                <Calendar size={12} color="#94A3B8" />
                <Text className="text-xs text-[#94A3B8] ml-1">
                  Added: {branch.created_at ? new Date(branch.created_at).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => openEditBranchModal(branch)}
              className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center border border-slate-100"
            >
              <Pencil size={16} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteBranch(branch.id, branch.name || 'Branch')}
              className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center border border-red-100"
            >
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View>
      {/* TENANTS SECTION */}
      <View className="mb-10">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-indigo-100 rounded-xl items-center justify-center mr-3">
              <Building2 size={20} color="#5841D8" />
            </View>
            <View>
              <Text className="text-lg font-bold text-[#0F172A]">Workspaces</Text>
              <Text className="text-xs text-[#64748B]">{tenantMeta?.count || tenants.length} total</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={openAddModal}
            className="bg-[#5841D8] px-4 py-2.5 rounded-xl flex-row items-center shadow-sm"
          >
            <Plus size={16} color="white" />
            <Text className="text-white font-bold text-sm ml-1.5">Add New</Text>
          </TouchableOpacity>
        </View>

        {isTenantsRefreshing && tenants.length === 0 ? (
          <View className="bg-white rounded-2xl p-12 items-center border border-slate-100">
            <ActivityIndicator color="#5841D8" size="large" />
            <Text className="text-slate-400 mt-3">Loading workspaces...</Text>
          </View>
        ) : tenants.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center border border-slate-100 border-dashed">
            <View className="w-16 h-16 bg-slate-50 rounded-2xl items-center justify-center mb-4">
              <Building2 size={28} color="#CBD5E1" />
            </View>
            <Text className="text-slate-400 font-medium mb-1">No workspaces yet</Text>
            <Text className="text-slate-300 text-sm">Create your first workspace to get started</Text>
          </View>
        ) : (
          tenants.map(renderTenantCard)
        )}

        {tenants.length > 0 && (
          <PaginationControl
            currentPage={tenantPage}
            hasNext={!!tenantMeta?.next}
            hasPrev={!!tenantMeta?.previous}
            totalCount={tenantMeta?.count}
            onNext={() => setTenantPage(p => p + 1)}
            onPrev={() => setTenantPage(p => Math.max(1, p - 1))}
          />
        )}
      </View>

      {/* BRANCHES SECTION */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-emerald-100 rounded-xl items-center justify-center mr-3">
              <MapPin size={20} color="#10B981" />
            </View>
            <View>
              <Text className="text-lg font-bold text-[#0F172A]">Branches</Text>
              <Text className="text-xs text-[#64748B]">{branchMeta?.count || branches.length} locations</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={openCreateBranchModal}
            className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex-row items-center"
          >
            <Plus size={16} color="#0F172A" />
            <Text className="text-[#0F172A] font-bold text-sm ml-1.5">Add Branch</Text>
          </TouchableOpacity>
        </View>

        {isBranchesRefreshing && branches.length === 0 ? (
          <View className="bg-white rounded-2xl p-12 items-center border border-slate-100">
            <ActivityIndicator color="#10B981" size="large" />
            <Text className="text-slate-400 mt-3">Loading branches...</Text>
          </View>
        ) : branches.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center border border-slate-100 border-dashed">
            <View className="w-16 h-16 bg-slate-50 rounded-2xl items-center justify-center mb-4">
              <MapPin size={28} color="#CBD5E1" />
            </View>
            <Text className="text-slate-400 font-medium mb-1">No branches yet</Text>
            <Text className="text-slate-300 text-sm">Add your first branch location</Text>
          </View>
        ) : (
          branches.map(renderBranchCard)
        )}

        {branches.length > 0 && (
          <PaginationControl
            currentPage={branchPage}
            hasNext={!!branchMeta?.next}
            hasPrev={!!branchMeta?.previous}
            totalCount={branchMeta?.count}
            onNext={() => setBranchPage(p => p + 1)}
            onPrev={() => setBranchPage(p => Math.max(1, p - 1))}
          />
        )}
      </View>

      {/* MODAL: ADD TENANT */}
      <Modal visible={addModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-5">
          <View className="bg-white w-full rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <View className="bg-[#5841D8] px-6 py-5 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                  <Building2 size={20} color="white" />
                </View>
                <Text className="text-xl font-bold text-white">New Workspace</Text>
              </View>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} className="p-2 bg-white/20 rounded-full">
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View className="p-6">
              <Text className="text-[#334155] font-semibold mb-2">Company Name</Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Ex. Global Ventures"
                placeholderTextColor="#94A3B8"
                className="h-14 border border-slate-200 rounded-xl px-4 text-base text-[#0F172A] bg-slate-50 mb-5"
              />

              <Text className="text-[#334155] font-semibold mb-2">Industry</Text>
              <TouchableOpacity
                onPress={() => openIndustryPicker('add')}
                className="h-14 border border-slate-200 rounded-xl px-4 flex-row items-center justify-between bg-slate-50 mb-6"
              >
                <View className="flex-row items-center">
                  <Text className="mr-2">{getIndustryConfig(newIndustry).icon}</Text>
                  <Text className="text-[#0F172A] text-base font-medium">{newIndustry}</Text>
                </View>
                <ChevronDown size={20} color="#64748B" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateTenant}
                disabled={isSaving}
                className={`bg-[#5841D8] h-14 rounded-xl items-center justify-center flex-row ${isSaving ? 'opacity-70' : ''}`}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Plus size={20} color="white" />
                    <Text className="text-white font-bold text-base ml-2">Create Workspace</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: CREATE BRANCH */}
      <Modal visible={createBranchModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View className="flex-1 bg-black/60 justify-center items-center px-5">
            <View className="bg-white w-full rounded-3xl overflow-hidden shadow-2xl">
              {/* Header */}
              <View className="bg-[#10B981] px-6 py-5 flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                    <MapPin size={20} color="white" />
                  </View>
                  <Text className="text-xl font-bold text-white">New Branch</Text>
                </View>
                <TouchableOpacity onPress={() => setCreateBranchModalVisible(false)} className="p-2 bg-white/20 rounded-full">
                  <X size={20} color="white" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View className="p-6">
                {/* Branch Name Input */}
                <Text className="text-[#334155] font-semibold mb-2">Branch Name</Text>
                <View className="relative mb-5">
                  <TextInput
                    value={branchName}
                    onChangeText={setBranchName}
                    placeholder="Ex. Lekki Outlet"
                    placeholderTextColor="#94A3B8"
                    className={`h-14 border rounded-xl px-4 text-base text-[#0F172A] bg-slate-50 pr-12 ${branchNameAvailable === false ? 'border-red-400' :
                      branchNameAvailable === true ? 'border-emerald-400' : 'border-slate-200'
                      }`}
                  />
                  {checkingBranchName && (
                    <View className="absolute right-4 top-4">
                      <ActivityIndicator color="#10B981" size="small" />
                    </View>
                  )}
                  {!checkingBranchName && branchNameAvailable === true && (
                    <View className="absolute right-4 top-4">
                      <CheckCircle size={20} color="#10B981" />
                    </View>
                  )}
                  {!checkingBranchName && branchNameAvailable === false && (
                    <View className="absolute right-4 top-4">
                      <AlertCircle size={20} color="#EF4444" />
                    </View>
                  )}
                </View>

                {/* Location Input */}
                <Text className="text-[#334155] font-semibold mb-2">Location</Text>
                <TextInput
                  value={branchLocation}
                  onChangeText={setBranchLocation}
                  placeholder="Ex. 12 Admiralty Way, Lagos"
                  placeholderTextColor="#94A3B8"
                  className="h-14 border border-slate-200 rounded-xl px-4 text-base text-[#0F172A] bg-slate-50 mb-2"
                />

                {/* Availability Text */}
                <View className="h-6 mb-4">
                  {branchName.length > 2 && !checkingBranchName && branchNameAvailable === true && (
                    <Text className="text-emerald-500 text-sm font-medium">✓ Branch name is available</Text>
                  )}
                  {branchName.length > 2 && !checkingBranchName && branchNameAvailable === false && (
                    <Text className="text-red-500 text-sm font-medium">✗ Name already taken in this location</Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleCreateBranch}
                  disabled={isSaving || checkingBranchName}
                  className={`bg-red-700 h-14 rounded-xl items-center justify-center flex-row ${isSaving ? 'opacity-70' : ''}`}
                >
                  {isSaving ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Plus size={20} color="white" />
                      <Text className="text-white font-bold text-base text-red-800 ml-2">Create Branch</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL: EDIT BRANCH */}
      <Modal visible={editBranchModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-5">
          <View className="bg-white w-full rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <View className="bg-[#0F172A] px-6 py-5 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                  <Pencil size={20} color="white" />
                </View>
                <Text className="text-xl font-bold text-white">Edit Branch</Text>
              </View>
              <TouchableOpacity onPress={() => setEditBranchModalVisible(false)} className="p-2 bg-white/20 rounded-full">
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View className="p-6">
              <Text className="text-[#334155] font-semibold mb-2">Branch Name</Text>
              <TextInput
                value={branchName}
                onChangeText={setBranchName}
                className="h-14 border border-slate-200 rounded-xl px-4 text-base text-[#0F172A] bg-slate-50 mb-5"
              />

              <Text className="text-[#334155] font-semibold mb-2">Location</Text>
              <TextInput
                value={branchLocation}
                onChangeText={setBranchLocation}
                className="h-14 border border-slate-200 rounded-xl px-4 text-base text-[#0F172A] bg-slate-50 mb-6"
              />

              <TouchableOpacity
                onPress={handleUpdateBranch}
                disabled={isSaving}
                className={`bg-[#10B981] h-14 rounded-xl items-center justify-center flex-row ${isSaving ? 'opacity-70' : ''}`}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Check size={20} color="white" />
                    <Text className="text-white font-bold text-base ml-2">Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: EDIT TENANT */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-5">
          <View className="bg-white w-full rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <View className="bg-[#0F172A] px-6 py-5 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                  <Pencil size={20} color="white" />
                </View>
                <Text className="text-xl font-bold text-white">Edit Workspace</Text>
              </View>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} className="p-2 bg-white/20 rounded-full">
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View className="p-6">
              <Text className="text-[#334155] font-semibold mb-2">Workspace Name</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                className="h-14 border border-slate-200 rounded-xl px-4 text-base text-[#0F172A] bg-slate-50 mb-5"
              />

              <Text className="text-[#334155] font-semibold mb-2">Industry</Text>
              <TouchableOpacity
                onPress={() => openIndustryPicker('edit')}
                className="h-14 border border-slate-200 rounded-xl px-4 flex-row items-center justify-between bg-slate-50 mb-6"
              >
                <View className="flex-row items-center">
                  <Text className="mr-2">{getIndustryConfig(editIndustry).icon}</Text>
                  <Text className="text-[#0F172A] text-base font-medium">{editIndustry}</Text>
                </View>
                <ChevronDown size={20} color="#64748B" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveEdit}
                disabled={isSaving}
                className={`bg-[#5841D8] h-14 rounded-xl items-center justify-center flex-row ${isSaving ? 'opacity-70' : ''}`}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Check size={20} color="white" />
                    <Text className="text-white font-bold text-base ml-2">Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* INDUSTRY PICKER */}
      <Modal visible={industryPickerVisible} transparent animationType="slide">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setIndustryPickerVisible(false)}
        >
          <View className="bg-white rounded-t-3xl">
            {/* Header */}
            <View className="flex-row justify-between items-center px-6 py-5 border-b border-slate-100">
              <Text className="text-xl font-bold text-[#0F172A]">Select Industry</Text>
              <TouchableOpacity onPress={() => setIndustryPickerVisible(false)} className="p-2 bg-slate-100 rounded-full">
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Options */}
            <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
              <View className="p-4 gap-2">
                {INDUSTRIES.map((item) => {
                  const isSelected = pickerMode === 'add' ? newIndustry === item.name : editIndustry === item.name;
                  return (
                    <TouchableOpacity
                      key={item.name}
                      onPress={() => handleSelectIndustry(item.name)}
                      className={`p-4 rounded-xl flex-row justify-between items-center ${isSelected ? 'bg-indigo-50 border-2 border-indigo-200' : 'bg-slate-50 border-2 border-transparent'
                        }`}
                    >
                      <View className="flex-row items-center">
                        <Text className="text-2xl mr-3">{item.icon}</Text>
                        <Text className={`text-base font-medium ${isSelected ? 'text-indigo-700' : 'text-[#334155]'}`}>
                          {item.name}
                        </Text>
                      </View>
                      {isSelected && <Check size={20} color="#5841D8" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}