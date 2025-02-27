<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-white">Raid Buffs & Debuffs</h1>

    <UButton @click="openAddBuffModal" class="mb-4 mr-2" color="green"
      >Add New Buff</UButton
    >
    <UButton @click="openAddDebuffModal" class="mb-4" color="red"
      >Add New Debuff</UButton
    >

    <UTabs
      :items="[
        { label: 'Buffs', slot: 'buffs' },
        { label: 'Debuffs', slot: 'debuffs' },
      ]"
    >
      <template #buffs>
        <div class="mt-4">
          <UCard v-if="isLoadingBuffs">
            <div class="flex justify-center py-4">
              <UIcon
                name="i-heroicons-arrow-path"
                class="text-4xl animate-spin"
              />
            </div>
          </UCard>

          <div
            v-else-if="buffs.length === 0"
            class="text-center py-6 border border-gray-700 rounded-lg"
          >
            <UIcon
              name="i-heroicons-sparkles"
              class="text-4xl mb-2 text-gray-400"
            />
            <p class="text-gray-400">No raid buffs found</p>
            <UButton color="green" class="mt-4" @click="openAddBuffModal"
              >Add First Buff</UButton
            >
          </div>

          <div v-else class="space-y-4">
            <UCard v-for="buff in buffs" :key="buff.id" class="mb-4">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h2 class="text-lg font-semibold">{{ buff.name }}</h2>
                  <p class="text-sm text-gray-400">{{ buff.description }}</p>
                  <div class="mt-2 text-sm text-gray-300">
                    <strong>Spells:</strong> {{ buff.spells }}
                  </div>
                </div>
                <div class="flex space-x-2">
                  <UButton
                    color="blue"
                    icon="i-heroicons-pencil"
                    size="sm"
                    @click="editBuff(buff)"
                  />
                  <UButton
                    color="red"
                    icon="i-heroicons-trash"
                    size="sm"
                    @click="deleteBuff(buff.id)"
                  />
                </div>
              </div>

              <div class="mt-3 pt-3 border-t border-gray-700">
                <h3 class="text-sm font-medium mb-2">Provided by:</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div
                    v-for="provider in buff.providers"
                    :key="provider.id"
                    class="text-sm flex items-center"
                  >
                    <span
                      v-if="provider.provider_type === 'class'"
                      :style="{ color: getClassColor(provider.class_id) }"
                    >
                      {{ getClassName(provider.class_id) }}
                    </span>
                    <span
                      v-else-if="provider.provider_type === 'spec'"
                      :style="{ color: getClassColorBySpec(provider.spec_id) }"
                    >
                      {{ getSpecName(provider.spec_id) }}
                      {{ getClassNameBySpec(provider.spec_id) }}
                    </span>
                    <span v-else-if="provider.provider_type === 'pet'">
                      {{ provider.pet_name }}
                      <span
                        v-if="provider.class_id"
                        class="text-xs ml-1"
                        :style="{ color: getClassColor(provider.class_id) }"
                      >
                        ({{ getClassName(provider.class_id) }} Pet)
                      </span>
                      <span v-else class="text-xs ml-1">(Pet)</span>
                    </span>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </template>

      <template #debuffs>
        <div class="mt-4">
          <UCard v-if="isLoadingDebuffs">
            <div class="flex justify-center py-4">
              <UIcon
                name="i-heroicons-arrow-path"
                class="text-4xl animate-spin"
              />
            </div>
          </UCard>

          <div
            v-else-if="debuffs.length === 0"
            class="text-center py-6 border border-gray-700 rounded-lg"
          >
            <UIcon
              name="i-heroicons-sparkles"
              class="text-4xl mb-2 text-gray-400"
            />
            <p class="text-gray-400">No raid debuffs found</p>
            <UButton color="red" class="mt-4" @click="openAddDebuffModal"
              >Add First Debuff</UButton
            >
          </div>

          <div v-else class="space-y-4">
            <UCard v-for="debuff in debuffs" :key="debuff.id" class="mb-4">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h2 class="text-lg font-semibold">{{ debuff.name }}</h2>
                  <p class="text-sm text-gray-400">{{ debuff.description }}</p>
                  <div class="mt-2 text-sm text-gray-300">
                    <strong>Spells:</strong> {{ debuff.spells }}
                  </div>
                </div>
                <div class="flex space-x-2">
                  <UButton
                    color="blue"
                    icon="i-heroicons-pencil"
                    size="sm"
                    @click="editDebuff(debuff)"
                  />
                  <UButton
                    color="red"
                    icon="i-heroicons-trash"
                    size="sm"
                    @click="deleteDebuff(debuff.id)"
                  />
                </div>
              </div>

              <div class="mt-3 pt-3 border-t border-gray-700">
                <h3 class="text-sm font-medium mb-2">Provided by:</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div
                    v-for="provider in debuff.providers"
                    :key="provider.id"
                    class="text-sm flex items-center"
                  >
                    <span
                      v-if="provider.provider_type === 'class'"
                      :style="{ color: getClassColor(provider.class_id) }"
                    >
                      {{ getClassName(provider.class_id) }}
                    </span>
                    <span
                      v-else-if="provider.provider_type === 'spec'"
                      :style="{ color: getClassColorBySpec(provider.spec_id) }"
                    >
                      {{ getSpecName(provider.spec_id) }}
                      {{ getClassNameBySpec(provider.spec_id) }}
                    </span>
                    <span v-else-if="provider.provider_type === 'pet'">
                      {{ provider.pet_name }}
                      <span
                        v-if="provider.class_id"
                        class="text-xs ml-1"
                        :style="{ color: getClassColor(provider.class_id) }"
                      >
                        ({{ getClassName(provider.class_id) }} Pet)
                      </span>
                      <span v-else class="text-xs ml-1">(Pet)</span>
                    </span>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </template>
    </UTabs>

    <!-- Buff Modal -->
    <UModal v-model="isBuffModalOpen" :ui="{ width: 'md:max-w-2xl' }">
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">
              {{ isEditMode ? "Edit Buff" : "Add New Buff" }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="isBuffModalOpen = false"
            />
          </div>
        </template>

        <UForm :state="buffForm" @submit="saveBuff">
          <div class="grid grid-cols-1 gap-4">
            <UFormGroup label="Name" name="name">
              <UInput
                v-model="buffForm.name"
                placeholder="e.g. Strength & Agility"
              />
            </UFormGroup>

            <UFormGroup label="Description" name="description">
              <UTextarea
                v-model="buffForm.description"
                placeholder="Description of the buff"
              />
            </UFormGroup>

            <UFormGroup label="Spells" name="spells">
              <UTextarea
                v-model="buffForm.spells"
                placeholder="e.g. Battle Shout, Horn of Winter, etc."
              />
            </UFormGroup>

            <UFormGroup label="Icon" name="icon">
              <UInput
                v-model="buffForm.icon"
                placeholder="Icon URL (optional)"
              />
            </UFormGroup>

            <div>
              <div class="flex justify-between mb-2">
                <h4 class="font-medium">Providers</h4>
                <UButton
                  color="green"
                  size="xs"
                  @click="addProvider"
                  icon="i-heroicons-plus"
                  >Add Provider</UButton
                >
              </div>

              <div
                v-for="(provider, index) in buffForm.providers"
                :key="index"
                class="flex items-center gap-2 mb-2 p-2 border border-gray-700 rounded"
              >
                <USelect
                  v-model="provider.provider_type"
                  :options="[
                    { label: 'Class', value: 'class' },
                    { label: 'Spec', value: 'spec' },
                    { label: 'Pet', value: 'pet' },
                  ]"
                  placeholder="Provider Type"
                  class="w-28"
                />

                <USelect
                  v-if="provider.provider_type === 'class'"
                  v-model="provider.class_id"
                  :options="classOptions"
                  placeholder="Select class"
                  class="flex-1"
                />

                <USelect
                  v-if="provider.provider_type === 'spec'"
                  v-model="provider.spec_id"
                  :options="specOptions"
                  placeholder="Select spec"
                  class="flex-1"
                />

                <UInput
                  v-if="provider.provider_type === 'pet'"
                  v-model="provider.pet_name"
                  placeholder="Pet name"
                  class="flex-1"
                />

                <USelect
                  v-if="provider.provider_type === 'pet'"
                  v-model="provider.class_id"
                  :options="classOptions"
                  placeholder="Pet owner class"
                  class="flex-1"
                />

                <UButton
                  color="red"
                  size="xs"
                  icon="i-heroicons-trash"
                  @click="removeProvider(index)"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-4">
            <UButton type="button" color="gray" @click="isBuffModalOpen = false"
              >Cancel</UButton
            >
            <UButton type="submit" color="primary" :loading="isSubmitting"
              >Save</UButton
            >
          </div>
        </UForm>
      </UCard>
    </UModal>

    <!-- Debuff Modal -->
    <UModal v-model="isDebuffModalOpen" :ui="{ width: 'md:max-w-2xl' }">
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">
              {{ isEditMode ? "Edit Debuff" : "Add New Debuff" }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="isDebuffModalOpen = false"
            />
          </div>
        </template>

        <UForm :state="debuffForm" @submit="saveDebuff">
          <div class="grid grid-cols-1 gap-4">
            <UFormGroup label="Name" name="name">
              <UInput
                v-model="debuffForm.name"
                placeholder="e.g. Armor Reduction"
              />
            </UFormGroup>

            <UFormGroup label="Description" name="description">
              <UTextarea
                v-model="debuffForm.description"
                placeholder="Description of the debuff"
              />
            </UFormGroup>

            <UFormGroup label="Spells" name="spells">
              <UTextarea
                v-model="debuffForm.spells"
                placeholder="e.g. Sunder Armor, Expose Armor, etc."
              />
            </UFormGroup>

            <UFormGroup label="Icon" name="icon">
              <UInput
                v-model="debuffForm.icon"
                placeholder="Icon URL (optional)"
              />
            </UFormGroup>

            <div>
              <div class="flex justify-between mb-2">
                <h4 class="font-medium">Providers</h4>
                <UButton
                  color="green"
                  size="xs"
                  @click="addDebuffProvider"
                  icon="i-heroicons-plus"
                  >Add Provider</UButton
                >
              </div>

              <div
                v-for="(provider, index) in debuffForm.providers"
                :key="index"
                class="flex items-center gap-2 mb-2 p-2 border border-gray-700 rounded"
              >
                <USelect
                  v-model="provider.provider_type"
                  :options="[
                    { label: 'Class', value: 'class' },
                    { label: 'Spec', value: 'spec' },
                    { label: 'Pet', value: 'pet' },
                  ]"
                  placeholder="Provider Type"
                  class="w-28"
                />

                <USelect
                  v-if="provider.provider_type === 'class'"
                  v-model="provider.class_id"
                  :options="classOptions"
                  placeholder="Select class"
                  class="flex-1"
                />

                <USelect
                  v-if="provider.provider_type === 'spec'"
                  v-model="provider.spec_id"
                  :options="specOptions"
                  placeholder="Select spec"
                  class="flex-1"
                />

                <UInput
                  v-if="provider.provider_type === 'pet'"
                  v-model="provider.pet_name"
                  placeholder="Pet name"
                  class="flex-1"
                />

                <USelect
                  v-if="provider.provider_type === 'pet'"
                  v-model="provider.class_id"
                  :options="classOptions"
                  placeholder="Pet owner class"
                  class="flex-1"
                />

                <UButton
                  color="red"
                  size="xs"
                  icon="i-heroicons-trash"
                  @click="removeDebuffProvider(index)"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-4">
            <UButton
              type="button"
              color="gray"
              @click="isDebuffModalOpen = false"
              >Cancel</UButton
            >
            <UButton type="submit" color="primary" :loading="isSubmitting"
              >Save</UButton
            >
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { useSupabaseClient } from "#imports";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

// Get Supabase client
const supabase = useSupabaseClient();

// State
const buffs = ref([]);
const debuffs = ref([]);
const isLoadingBuffs = ref(true);
const isLoadingDebuffs = ref(true);
const isBuffModalOpen = ref(false);
const isDebuffModalOpen = ref(false);
const isEditMode = ref(false);
const isSubmitting = ref(false);
const editingId = ref(null);

// Form states
const buffForm = reactive({
  name: "",
  description: "",
  spells: "",
  icon: "",
  providers: [],
});

const debuffForm = reactive({
  name: "",
  description: "",
  spells: "",
  icon: "",
  providers: [],
});

// State for classes and specs
const classes = ref([]);
const specs = ref([]);

// Fetch classes and specs
async function fetchClassesAndSpecs() {
  try {
    // Get classes
    const { data: classData, error: classError } = await supabase
      .from("wow_classes")
      .select("*")
      .order("name");

    if (classError) throw classError;
    classes.value = classData || [];

    // Get specs
    const { data: specData, error: specError } = await supabase
      .from("wow_specs")
      .select("*")
      .order("name");

    if (specError) throw specError;
    specs.value = specData || [];
  } catch (error) {
    console.error("Failed to fetch classes and specs:", error);
  }
}

// Create options for select dropdowns
const classOptions = computed(() => {
  return (
    classes.value?.map((cls) => ({
      label: cls.name,
      value: cls.id,
    })) || []
  );
});

const specOptions = computed(() => {
  return (
    specs.value?.map((spec) => ({
      label: `${spec.name} ${getClassNameById(spec.class_id)}`,
      value: spec.id,
    })) || []
  );
});

// Helper functions to get class/spec info
function getClassName(classId) {
  const cls = classes.value?.find((c) => c.id === classId);
  return cls ? cls.name : "Unknown Class";
}

function getClassColor(classId) {
  const cls = classes.value?.find((c) => c.id === classId);
  return cls ? cls.color : "#ffffff";
}

function getClassNameById(classId) {
  const cls = classes.value?.find((c) => c.id === classId);
  return cls ? cls.name : "Unknown";
}

function getSpecName(specId) {
  const spec = specs.value?.find((s) => s.id === specId);
  return spec ? spec.name : "Unknown Spec";
}

function getClassNameBySpec(specId) {
  const spec = specs.value?.find((s) => s.id === specId);
  if (!spec) return "Unknown";
  return getClassNameById(spec.class_id);
}

function getClassColorBySpec(specId) {
  const spec = specs.value?.find((s) => s.id === specId);
  if (!spec) return "#ffffff";

  const cls = classes.value?.find((c) => c.id === spec.class_id);
  return cls ? cls.color : "#ffffff";
}

// Fetch data
async function fetchBuffs() {
  isLoadingBuffs.value = true;
  try {
    const { data, error } = await supabase
      .from("wow_buffs")
      .select(
        `
        *,
        providers:wow_buff_providers(
          id,
          provider_type,
          class_id,
          spec_id,
          pet_name
        )
      `
      )
      .order("name");

    if (error) throw error;
    buffs.value = data || [];
  } catch (error) {
    console.error("Failed to fetch buffs:", error);
  } finally {
    isLoadingBuffs.value = false;
  }
}

async function fetchDebuffs() {
  isLoadingDebuffs.value = true;
  try {
    const { data, error } = await supabase
      .from("wow_debuffs")
      .select(
        `
        *,
        providers:wow_debuff_providers(
          id,
          provider_type,
          class_id,
          spec_id,
          pet_name
        )
      `
      )
      .order("name");

    if (error) throw error;
    debuffs.value = data || [];
  } catch (error) {
    console.error("Failed to fetch debuffs:", error);
  } finally {
    isLoadingDebuffs.value = false;
  }
}

// Modal actions
function openAddBuffModal() {
  isEditMode.value = false;
  editingId.value = null;
  Object.assign(buffForm, {
    name: "",
    description: "",
    spells: "",
    icon: "",
    providers: [],
  });
  isBuffModalOpen.value = true;
}

function openAddDebuffModal() {
  isEditMode.value = false;
  editingId.value = null;
  Object.assign(debuffForm, {
    name: "",
    description: "",
    spells: "",
    icon: "",
    providers: [],
  });
  isDebuffModalOpen.value = true;
}

function editBuff(buff) {
  isEditMode.value = true;
  editingId.value = buff.id;
  Object.assign(buffForm, {
    name: buff.name,
    description: buff.description,
    spells: buff.spells,
    icon: buff.icon,
    providers: [...(buff.providers || [])],
  });
  isBuffModalOpen.value = true;
}

function editDebuff(debuff) {
  isEditMode.value = true;
  editingId.value = debuff.id;
  Object.assign(debuffForm, {
    name: debuff.name,
    description: debuff.description,
    spells: debuff.spells,
    icon: debuff.icon,
    providers: [...(debuff.providers || [])],
  });
  isDebuffModalOpen.value = true;
}

// Provider management
function addProvider() {
  buffForm.providers.push({
    provider_type: "class",
    class_id: null,
    spec_id: null,
    pet_name: "",
  });
}

function removeProvider(index) {
  buffForm.providers.splice(index, 1);
}

function addDebuffProvider() {
  debuffForm.providers.push({
    provider_type: "class",
    class_id: null,
    spec_id: null,
    pet_name: "",
  });
}

function removeDebuffProvider(index) {
  debuffForm.providers.splice(index, 1);
}

// Save data
async function saveBuff() {
  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      // Update existing buff
      const { error: buffError } = await supabase
        .from("wow_buffs")
        .update({
          name: buffForm.name,
          description: buffForm.description,
          spells: buffForm.spells,
          icon: buffForm.icon,
          updated_at: new Date(),
        })
        .eq("id", editingId.value);

      if (buffError) throw buffError;

      // Delete existing providers
      const { error: deleteProvidersError } = await supabase
        .from("wow_buff_providers")
        .delete()
        .eq("buff_id", editingId.value);

      if (deleteProvidersError) throw deleteProvidersError;
    } else {
      // Insert new buff
      const { data, error: buffError } = await supabase
        .from("wow_buffs")
        .insert({
          name: buffForm.name,
          description: buffForm.description,
          spells: buffForm.spells,
          icon: buffForm.icon,
        })
        .select("id")
        .single();

      if (buffError) throw buffError;
      editingId.value = data.id;
    }

    // Add providers if there are any
    if (buffForm.providers.length > 0) {
      const providers = buffForm.providers.map((provider) => ({
        buff_id: editingId.value,
        provider_type: provider.provider_type,
        class_id: provider.class_id,
        spec_id: provider.spec_id,
        pet_name: provider.pet_name,
      }));

      const { error: providersError } = await supabase
        .from("wow_buff_providers")
        .insert(providers);

      if (providersError) throw providersError;
    }

    await fetchBuffs();
    isBuffModalOpen.value = false;
  } catch (error) {
    console.error("Failed to save buff:", error);
  } finally {
    isSubmitting.value = false;
  }
}

async function saveDebuff() {
  isSubmitting.value = true;
  try {
    if (isEditMode.value) {
      // Update existing debuff
      const { error: debuffError } = await supabase
        .from("wow_debuffs")
        .update({
          name: debuffForm.name,
          description: debuffForm.description,
          spells: debuffForm.spells,
          icon: debuffForm.icon,
          updated_at: new Date(),
        })
        .eq("id", editingId.value);

      if (debuffError) throw debuffError;

      // Delete existing providers
      const { error: deleteProvidersError } = await supabase
        .from("wow_debuff_providers")
        .delete()
        .eq("debuff_id", editingId.value);

      if (deleteProvidersError) throw deleteProvidersError;
    } else {
      // Insert new debuff
      const { data, error: debuffError } = await supabase
        .from("wow_debuffs")
        .insert({
          name: debuffForm.name,
          description: debuffForm.description,
          spells: debuffForm.spells,
          icon: debuffForm.icon,
        })
        .select("id")
        .single();

      if (debuffError) throw debuffError;
      editingId.value = data.id;
    }

    // Add providers if there are any
    if (debuffForm.providers.length > 0) {
      const providers = debuffForm.providers.map((provider) => ({
        debuff_id: editingId.value,
        provider_type: provider.provider_type,
        class_id: provider.class_id,
        spec_id: provider.spec_id,
        pet_name: provider.pet_name,
      }));

      const { error: providersError } = await supabase
        .from("wow_debuff_providers")
        .insert(providers);

      if (providersError) throw providersError;
    }

    await fetchDebuffs();
    isDebuffModalOpen.value = false;
  } catch (error) {
    console.error("Failed to save debuff:", error);
  } finally {
    isSubmitting.value = false;
  }
}

// Delete actions
async function deleteBuff(id) {
  if (!confirm("Are you sure you want to delete this buff?")) return;

  try {
    // Delete buff (providers will be deleted via CASCADE)
    const { error } = await supabase.from("wow_buffs").delete().eq("id", id);

    if (error) throw error;

    await fetchBuffs();
  } catch (error) {
    console.error("Failed to delete buff:", error);
  }
}

async function deleteDebuff(id) {
  if (!confirm("Are you sure you want to delete this debuff?")) return;

  try {
    // Delete debuff (providers will be deleted via CASCADE)
    const { error } = await supabase.from("wow_debuffs").delete().eq("id", id);

    if (error) throw error;

    await fetchDebuffs();
  } catch (error) {
    console.error("Failed to delete debuff:", error);
  }
}

// Load data on mount
onMounted(() => {
  fetchBuffs();
  fetchDebuffs();
  fetchClassesAndSpecs();
});
</script>
