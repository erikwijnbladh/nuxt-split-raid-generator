<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-white">WoW Specializations</h1>

    <div class="mb-6 flex justify-between items-center">
      <div class="flex gap-4 items-center">
        <UButton color="primary" @click="openSpecForm(null)">
          Add New Spec
        </UButton>

        <USelect
          v-model="classFilter"
          :options="classOptions"
          placeholder="Filter by class"
          class="w-64"
        />
      </div>

      <UButton to="/admin/wow-data" color="gray" variant="soft">
        Back to WoW Data
      </UButton>
    </div>

    <UCard>
      <UTable :columns="columns" :rows="filteredSpecs" :loading="loading">
        <template #class-data="{ row }">
          <div class="flex items-center">
            <div
              v-if="getClassColor(row.class_id)"
              class="w-4 h-4 rounded-full mr-2"
              :style="{ backgroundColor: getClassColor(row.class_id) }"
            ></div>
            <span>{{ getClassName(row.class_id) }}</span>
          </div>
        </template>

        <template #role-data="{ row }">
          <UBadge :color="getRoleBadgeColor(row.role)">
            {{ formatRole(row.role) }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton
              color="primary"
              variant="soft"
              size="sm"
              @click="openSpecForm(row)"
            >
              Edit
            </UButton>
            <UButton
              color="red"
              variant="soft"
              size="sm"
              @click="confirmDelete(row)"
            >
              Delete
            </UButton>
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Spec Form Modal -->
    <UModal v-model="showSpecForm">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingSpec ? "Edit Specialization" : "Add New Specialization" }}
          </h3>
        </template>

        <UForm :state="specForm" @submit="saveSpec">
          <UFormGroup label="Class" name="class_id">
            <USelect
              v-model="specForm.class_id"
              :options="classOptions"
              placeholder="Select class"
            />
          </UFormGroup>

          <UFormGroup label="Specialization Name" name="name">
            <UInput v-model="specForm.name" placeholder="e.g. Frost" />
          </UFormGroup>

          <UFormGroup label="Role" name="role">
            <USelect
              v-model="specForm.role"
              :options="roleOptions"
              placeholder="Select role"
            />
          </UFormGroup>

          <UFormGroup label="Icon" name="icon">
            <UInput
              v-model="specForm.icon"
              placeholder="Icon class or URL"
              help="e.g. i-heroicons-shield"
            />
          </UFormGroup>

          <div class="flex justify-end gap-2 mt-4">
            <UButton color="gray" @click="showSpecForm = false">Cancel</UButton>
            <UButton type="submit" color="primary" :loading="formLoading">
              Save
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="showDeleteConfirmation">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Confirm Deletion</h3>
        </template>

        <p>
          Are you sure you want to delete the specialization
          <span class="font-semibold">{{ specToDelete?.name }}</span
          >?
        </p>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="gray" @click="showDeleteConfirmation = false">
              Cancel
            </UButton>
            <UButton color="red" :loading="deleteLoading" @click="deleteSpec">
              Delete
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

const supabase = useSupabaseClient();
const toast = useToast();

// Table columns
const columns = [
  { key: "class", label: "Class" },
  { key: "name", label: "Specialization" },
  { key: "role", label: "Role" },
  { key: "actions", label: "Actions" },
];

// State
const loading = ref(false);
const specs = ref([]);
const classes = ref([]);
const classFilter = ref("");
const showSpecForm = ref(false);
const showDeleteConfirmation = ref(false);
const formLoading = ref(false);
const deleteLoading = ref(false);
const editingSpec = ref(null);
const specToDelete = ref(null);

const specForm = reactive({
  class_id: "",
  name: "",
  role: "",
  icon: "",
});

const classOptions = computed(() => {
  return [
    { label: "All Classes", value: "" },
    ...classes.value.map((c) => ({
      label: c.name,
      value: c.id,
    })),
  ];
});

const filteredSpecs = computed(() => {
  if (!classFilter.value) return specs.value;
  return specs.value.filter((spec) => spec.class_id === classFilter.value);
});

const roleOptions = [
  { label: "Tank", value: "tank" },
  { label: "Healer", value: "healer" },
  { label: "Melee DPS", value: "melee_dps" },
  { label: "Ranged DPS", value: "ranged_dps" },
];

// Get class name from ID
function getClassName(classId) {
  const classObj = classes.value.find((c) => c.id === classId);
  return classObj ? classObj.name : "Unknown";
}

// Get class color from ID
function getClassColor(classId) {
  const classObj = classes.value.find((c) => c.id === classId);
  return classObj ? classObj.color : "#CCCCCC";
}

// Format role for display
function formatRole(role) {
  if (role === "tank") return "Tank";
  if (role === "healer") return "Healer";
  if (role === "melee_dps") return "Melee DPS";
  if (role === "ranged_dps") return "Ranged DPS";
  return role;
}

// Get role badge color
function getRoleBadgeColor(role) {
  if (role === "tank") return "blue";
  if (role === "healer") return "green";
  if (role === "melee_dps" || role === "ranged_dps") return "red";
  return "gray";
}

// Load classes and specs
async function loadData() {
  try {
    loading.value = true;

    // Load classes
    const { data: classData, error: classError } = await supabase
      .from("wow_classes")
      .select("*")
      .order("name");

    if (classError) throw classError;
    classes.value = classData;

    // Load specs
    const { data: specData, error: specError } = await supabase
      .from("wow_specs")
      .select("*")
      .order("name");

    if (specError) throw specError;
    specs.value = specData;
  } catch (error) {
    toast.add({
      title: "Error",
      description: error.message,
      color: "red",
    });
    console.error("Error loading data:", error);
  } finally {
    loading.value = false;
  }
}

// Open spec form
function openSpecForm(specData) {
  editingSpec.value = specData;

  if (specData) {
    // Edit existing spec
    specForm.class_id = specData.class_id;
    specForm.name = specData.name;
    specForm.role = specData.role;
    specForm.icon = specData.icon || "";
  } else {
    // Add new spec
    specForm.class_id = classFilter.value || "";
    specForm.name = "";
    specForm.role = "";
    specForm.icon = "";
  }

  showSpecForm.value = true;
}

// Save spec
async function saveSpec() {
  try {
    formLoading.value = true;

    const specData = {
      class_id: specForm.class_id,
      name: specForm.name,
      role: specForm.role,
      icon: specForm.icon,
      updated_at: new Date().toISOString(),
    };

    if (editingSpec.value) {
      // Update existing spec
      const { error } = await supabase
        .from("wow_specs")
        .update(specData)
        .eq("id", editingSpec.value.id);

      if (error) throw error;

      toast.add({
        title: "Specialization Updated",
        description: `${specForm.name} has been updated`,
        color: "green",
      });
    } else {
      // Insert new spec
      const { error } = await supabase.from("wow_specs").insert([
        {
          ...specData,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast.add({
        title: "Specialization Added",
        description: `${specForm.name} has been added`,
        color: "green",
      });
    }

    showSpecForm.value = false;
    loadData();
  } catch (error) {
    toast.add({
      title: "Error",
      description: error.message,
      color: "red",
    });
    console.error("Error saving specialization:", error);
  } finally {
    formLoading.value = false;
  }
}

// Confirm spec deletion
function confirmDelete(specData) {
  specToDelete.value = specData;
  showDeleteConfirmation.value = true;
}

// Delete spec
async function deleteSpec() {
  try {
    deleteLoading.value = true;

    const { error } = await supabase
      .from("wow_specs")
      .delete()
      .eq("id", specToDelete.value.id);

    if (error) throw error;

    toast.add({
      title: "Specialization Deleted",
      description: `${specToDelete.value.name} has been deleted`,
      color: "green",
    });

    showDeleteConfirmation.value = false;
    loadData();
  } catch (error) {
    toast.add({
      title: "Error",
      description: error.message,
      color: "red",
    });
    console.error("Error deleting specialization:", error);
  } finally {
    deleteLoading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>
