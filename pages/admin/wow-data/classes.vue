<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-white">WoW Classes</h1>

    <div class="mb-6 flex justify-between">
      <UButton color="primary" @click="openClassForm(null)">
        Add New Class
      </UButton>
      <UButton to="/admin/wow-data" color="gray" variant="soft">
        Back to WoW Data
      </UButton>
    </div>

    <UCard>
      <UTable :columns="columns" :rows="classes" :loading="loading">
        <template #name-data="{ row }">
          <div class="flex items-center">
            <div
              v-if="row.color"
              class="w-4 h-4 rounded-full mr-2"
              :style="{ backgroundColor: row.color }"
            ></div>
            <span>{{ row.name }}</span>
          </div>
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton
              color="primary"
              variant="soft"
              size="sm"
              @click="openClassForm(row)"
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

    <!-- Class Form Modal -->
    <UModal v-model="showClassForm">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingClass ? "Edit Class" : "Add New Class" }}
          </h3>
        </template>

        <UForm :state="classForm" @submit="saveClass">
          <UFormGroup label="Class Name" name="name">
            <UInput v-model="classForm.name" placeholder="e.g. Warrior" />
          </UFormGroup>

          <UFormGroup label="Class Color" name="color">
            <UInput v-model="classForm.color" type="color" />
          </UFormGroup>

          <UFormGroup label="Icon" name="icon">
            <UInput
              v-model="classForm.icon"
              placeholder="Icon class or URL"
              help="e.g. i-heroicons-shield"
            />
          </UFormGroup>

          <div class="flex justify-end gap-2 mt-4">
            <UButton color="gray" @click="showClassForm = false"
              >Cancel</UButton
            >
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
          Are you sure you want to delete the class
          <span class="font-semibold">{{ classToDelete?.name }}</span
          >? This will also delete all specs associated with this class.
        </p>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="gray" @click="showDeleteConfirmation = false">
              Cancel
            </UButton>
            <UButton color="red" :loading="deleteLoading" @click="deleteClass">
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
  { key: "name", label: "Class Name" },
  { key: "color", label: "Color" },
  { key: "icon", label: "Icon" },
  { key: "actions", label: "Actions" },
];

// State
const loading = ref(false);
const classes = ref([]);
const showClassForm = ref(false);
const showDeleteConfirmation = ref(false);
const formLoading = ref(false);
const deleteLoading = ref(false);
const editingClass = ref(null);
const classToDelete = ref(null);

const classForm = reactive({
  name: "",
  color: "#ffffff",
  icon: "",
});

// Load classes
async function loadClasses() {
  try {
    loading.value = true;

    const { data, error } = await supabase
      .from("wow_classes")
      .select("*")
      .order("name");

    if (error) throw error;

    classes.value = data;
  } catch (error) {
    toast.add({
      title: "Error",
      description: error.message,
      color: "red",
    });
    console.error("Error loading classes:", error);
  } finally {
    loading.value = false;
  }
}

// Open class form
function openClassForm(classData) {
  editingClass.value = classData;

  if (classData) {
    // Edit existing class
    classForm.name = classData.name;
    classForm.color = classData.color;
    classForm.icon = classData.icon || "";
  } else {
    // Add new class
    classForm.name = "";
    classForm.color = "#ffffff";
    classForm.icon = "";
  }

  showClassForm.value = true;
}

// Save class
async function saveClass() {
  try {
    formLoading.value = true;

    const classData = {
      name: classForm.name,
      color: classForm.color,
      icon: classForm.icon,
      updated_at: new Date().toISOString(),
    };

    if (editingClass.value) {
      // Update existing class
      const { error } = await supabase
        .from("wow_classes")
        .update(classData)
        .eq("id", editingClass.value.id);

      if (error) throw error;

      toast.add({
        title: "Class Updated",
        description: `${classForm.name} has been updated`,
        color: "green",
      });
    } else {
      // Insert new class
      const { error } = await supabase.from("wow_classes").insert([
        {
          ...classData,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast.add({
        title: "Class Added",
        description: `${classForm.name} has been added`,
        color: "green",
      });
    }

    showClassForm.value = false;
    loadClasses();
  } catch (error) {
    toast.add({
      title: "Error",
      description: error.message,
      color: "red",
    });
    console.error("Error saving class:", error);
  } finally {
    formLoading.value = false;
  }
}

// Confirm class deletion
function confirmDelete(classData) {
  classToDelete.value = classData;
  showDeleteConfirmation.value = true;
}

// Delete class
async function deleteClass() {
  try {
    deleteLoading.value = true;

    const { error } = await supabase
      .from("wow_classes")
      .delete()
      .eq("id", classToDelete.value.id);

    if (error) throw error;

    toast.add({
      title: "Class Deleted",
      description: `${classToDelete.value.name} has been deleted`,
      color: "green",
    });

    showDeleteConfirmation.value = false;
    loadClasses();
  } catch (error) {
    toast.add({
      title: "Error",
      description: error.message,
      color: "red",
    });
    console.error("Error deleting class:", error);
  } finally {
    deleteLoading.value = false;
  }
}

onMounted(() => {
  loadClasses();
});
</script>
