<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-white">Armor Tokens</h1>

    <div class="mb-6 flex justify-between">
      <UButton color="primary" @click="openTokenForm(null)">
        Add New Token
      </UButton>
      <UButton to="/admin/wow-data" color="gray" variant="soft">
        Back to WoW Data
      </UButton>
    </div>

    <UCard>
      <UTable :columns="columns" :rows="tokens" :loading="loading">
        <template #name-data="{ row }">
          <div class="flex items-center">
            <div
              class="w-4 h-4 rounded-full mr-2"
              :style="{ backgroundColor: getTokenColor(row.name) }"
            ></div>
            <span>{{ row.name }}</span>
          </div>
        </template>

        <template #classes-data="{ row }">
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="classId in row.class_ids"
              :key="classId"
              :style="{ backgroundColor: getClassColor(classId) }"
              class="text-white"
            >
              {{ getClassName(classId) }}
            </UBadge>
          </div>
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton
              color="primary"
              variant="soft"
              size="sm"
              @click="openTokenForm(row)"
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

    <!-- Token Form Modal -->
    <UModal v-model="showTokenForm">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingToken ? "Edit Token" : "Add New Token" }}
          </h3>
        </template>

        <UForm :state="tokenForm" @submit="saveToken">
          <UFormGroup label="Token Name" name="name">
            <UInput v-model="tokenForm.name" placeholder="e.g. Protector" />
          </UFormGroup>

          <UFormGroup label="Classes" name="class_ids">
            <USelectMenu
              v-model="tokenForm.class_ids"
              :options="classOptions"
              multiple
              placeholder="Select classes for this token"
            >
              <template #option="{ option }">
                <div class="flex items-center">
                  <div
                    class="w-3 h-3 rounded-full mr-2"
                    :style="{ backgroundColor: option.color }"
                  ></div>
                  <span>{{ option.label }}</span>
                </div>
              </template>
            </USelectMenu>
          </UFormGroup>

          <div class="mt-4">
            <UButton type="submit" color="primary" block :loading="formLoading">
              {{ editingToken ? "Update Token" : "Add Token" }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="showDeleteConfirmation">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-red-500">Delete Token</h3>
        </template>

        <p>
          Are you sure you want to delete the token
          <strong>{{ tokenToDelete?.name }}</strong
          >? This action cannot be undone.
        </p>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="gray" @click="showDeleteConfirmation = false">
              Cancel
            </UButton>
            <UButton color="red" :loading="deleteLoading" @click="deleteToken">
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
  { key: "name", label: "Token Name" },
  { key: "classes", label: "Classes" },
  { key: "actions", label: "Actions" },
];

// State
const loading = ref(false);
const tokens = ref([]);
const classes = ref([]);
const showTokenForm = ref(false);
const showDeleteConfirmation = ref(false);
const formLoading = ref(false);
const deleteLoading = ref(false);
const editingToken = ref(null);
const tokenToDelete = ref(null);

const tokenForm = reactive({
  name: "",
  class_ids: [],
});

const classOptions = computed(() => {
  return classes.value.map((c) => ({
    label: c.name,
    value: c.id,
    color: c.color,
  }));
});

// Token colors - consistent with the roster page
function getTokenColor(tokenName) {
  switch (tokenName) {
    case "Protector":
      return "#10b981"; // emerald-500
    case "Vanquisher":
      return "#8b5cf6"; // purple-500
    case "Conqueror":
      return "#eab308"; // yellow-500
    default:
      return "#6b7280"; // gray-500
  }
}

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

// Load tokens and classes
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

    // Load tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from("wow_armor_tokens")
      .select("*")
      .order("name");

    if (tokenError) throw tokenError;
    tokens.value = tokenData || [];
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

// Open token form
function openTokenForm(tokenData) {
  editingToken.value = tokenData;

  if (tokenData) {
    // Edit existing token
    tokenForm.name = tokenData.name;
    tokenForm.class_ids = tokenData.class_ids || [];
  } else {
    // Add new token
    tokenForm.name = "";
    tokenForm.class_ids = [];
  }

  showTokenForm.value = true;
}

// Save token
async function saveToken() {
  try {
    formLoading.value = true;

    // Extract just the integer IDs from the selected options
    const classIds = Array.isArray(tokenForm.class_ids)
      ? tokenForm.class_ids.map((option) =>
          typeof option === "object" ? option.value : option
        )
      : [];

    const tokenData = {
      name: tokenForm.name.trim(),
      class_ids: classIds,
      updated_at: new Date().toISOString(),
    };

    if (editingToken.value) {
      // Update existing token
      const { error } = await supabase
        .from("wow_armor_tokens")
        .update(tokenData)
        .eq("id", editingToken.value.id);

      if (error) throw error;

      toast.add({
        title: "Token Updated",
        description: `${tokenForm.name} has been updated`,
        color: "green",
      });
    } else {
      // Insert new token
      const { error } = await supabase.from("wow_armor_tokens").insert([
        {
          ...tokenData,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast.add({
        title: "Token Added",
        description: `${tokenForm.name} has been added`,
        color: "green",
      });
    }

    showTokenForm.value = false;
    await loadData();
  } catch (error) {
    toast.add({
      title: "Error",
      description: error.message,
      color: "red",
    });
  } finally {
    formLoading.value = false;
  }
}

// Confirm delete
function confirmDelete(token) {
  tokenToDelete.value = token;
  showDeleteConfirmation.value = true;
}

// Delete token
async function deleteToken() {
  try {
    deleteLoading.value = true;

    const { error } = await supabase
      .from("wow_armor_tokens")
      .delete()
      .eq("id", tokenToDelete.value.id);

    if (error) throw error;

    toast.add({
      title: "Token Deleted",
      description: `${tokenToDelete.value.name} has been deleted`,
      color: "green",
    });

    showDeleteConfirmation.value = false;
    await loadData();
  } catch (error) {
    toast.add({
      title: "Error",
      description: error.message,
      color: "red",
    });
  } finally {
    deleteLoading.value = false;
  }
}

// Load data on mount
onMounted(() => {
  loadData();
});
</script>
