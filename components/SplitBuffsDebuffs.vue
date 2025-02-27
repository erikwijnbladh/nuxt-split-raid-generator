<template>
  <div>
    <UAccordion
      :items="[
        {
          label: `Raid Buffs & Debuffs ${coverageSummary}`,
          icon: 'i-heroicons-sparkles',
          defaultOpen: false,
          slot: 'buffs-debuffs',
        },
      ]"
      color="amber"
      variant="soft"
      class="mt-4"
    >
      <template #buffs-debuffs>
        <div v-if="isLoading" class="flex justify-center py-4">
          <UIcon name="i-heroicons-arrow-path" class="text-xl animate-spin" />
        </div>
        <div v-else>
          <!-- Coverage Summary -->
          <div class="mb-4 p-3 bg-gray-800 rounded-md">
            <div class="flex items-center gap-2 text-sm">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span class="text-gray-300">Covered: {{ coveredCount }}</span>
              </div>
              <div class="flex items-center ml-4">
                <div class="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span class="text-gray-300">Missing: {{ missingCount }}</span>
              </div>
            </div>
          </div>

          <!-- Buffs and Debuffs Grid -->
          <div
            class="bg-opacity-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <!-- Buffs Section -->
            <div class="rounded-md bg-gray-800 p-3">
              <h4 class="font-medium text-sm mb-2 text-gray-300">
                Raid Buffs
                <span class="text-xs ml-2 text-gray-400">
                  ({{ buffsCoveredCount }}/{{ buffs.length }} covered)
                </span>
              </h4>
              <div
                v-if="buffs.length === 0"
                class="text-center py-2 text-gray-400 text-sm"
              >
                No raid buffs data available
              </div>
              <div v-else class="grid grid-cols-2 gap-2">
                <div
                  v-for="buff in buffs"
                  :key="buff.id"
                  class="flex items-center p-1.5 rounded-md transition-colors"
                  :class="
                    isCovered(buff, 'buff')
                      ? 'bg-green-900 bg-opacity-30'
                      : 'bg-red-900 bg-opacity-30'
                  "
                >
                  <div
                    class="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    :class="
                      isCovered(buff, 'buff') ? 'bg-green-500' : 'bg-red-500'
                    "
                  ></div>

                  <UPopover
                    mode="hover"
                    :ui="{ width: 'md:max-w-md' }"
                    :popper="{ placement: 'right', arrow: true }"
                  >
                    <span
                      class="hover:underline truncate"
                      :class="
                        isCovered(buff, 'buff') ? 'text-white' : 'text-gray-400'
                      "
                    >
                      {{ buff.name }}
                    </span>

                    <template #panel>
                      <div class="p-4">
                        <div class="flex items-start mb-3">
                          <div v-if="buff.icon" class="mr-3 flex-shrink-0">
                            <img
                              :src="buff.icon"
                              alt="Buff Icon"
                              class="w-10 h-10 rounded"
                            />
                          </div>
                          <div>
                            <h3 class="font-bold text-base">
                              {{ buff.name }}
                            </h3>
                            <p
                              v-if="buff.description"
                              class="text-sm text-gray-300 mt-1"
                            >
                              {{ buff.description }}
                            </p>
                          </div>
                        </div>

                        <div v-if="buff.spells" class="mb-4">
                          <h4
                            class="text-xs font-semibold uppercase text-gray-400 mb-1"
                          >
                            Spells
                          </h4>
                          <p class="text-sm">{{ buff.spells }}</p>
                        </div>

                        <div class="mb-2">
                          <h4
                            class="text-xs font-semibold uppercase text-gray-400 mb-1"
                          >
                            Provided by
                          </h4>
                          <ul class="text-sm space-y-1.5">
                            <!-- Class providers -->
                            <template
                              v-for="(group, className) in getGroupedProviders(
                                buff,
                                'class'
                              )"
                              :key="className"
                            >
                              <li class="flex items-center">
                                <div
                                  class="w-2.5 h-2.5 rounded-full mr-2"
                                  :style="{ backgroundColor: group.color }"
                                ></div>
                                <span :style="{ color: group.color }">{{
                                  className
                                }}</span>
                              </li>
                            </template>

                            <!-- Spec providers - grouped by class -->
                            <template
                              v-for="(
                                classGroup, className
                              ) in getGroupedProviders(buff, 'spec')"
                              :key="'spec-' + className"
                            >
                              <li class="ml-4">
                                <div class="flex items-baseline">
                                  <span class="text-xs text-gray-400 mr-1"
                                    >Specs:</span
                                  >
                                  <span>{{ classGroup.specs.join(", ") }}</span>
                                </div>
                              </li>
                            </template>

                            <!-- Pet providers -->
                            <template v-if="hasPetProviders(buff)">
                              <li class="font-medium mt-1">Pets:</li>
                              <li
                                v-for="pet in getPetProviders(buff)"
                                :key="pet"
                                class="ml-4"
                              >
                                {{ pet }}
                              </li>
                            </template>
                          </ul>
                        </div>

                        <div
                          class="mt-4 pt-2 border-t border-gray-700 text-xs text-gray-400"
                        >
                          <div class="flex items-center">
                            <div
                              class="w-2.5 h-2.5 rounded-full mr-1.5"
                              :class="
                                isCovered(buff, 'buff')
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                              "
                            ></div>
                            <span>{{
                              isCovered(buff, "buff")
                                ? "Covered in this raid"
                                : "Not covered in this raid"
                            }}</span>
                          </div>
                        </div>
                      </div>
                    </template>
                  </UPopover>
                </div>
              </div>
            </div>

            <!-- Debuffs Section -->
            <div class="rounded-md bg-gray-800 p-3">
              <h4 class="font-medium text-sm mb-2 text-gray-300">
                Raid Debuffs
                <span class="text-xs ml-2 text-gray-400">
                  ({{ debuffsCoveredCount }}/{{ debuffs.length }} covered)
                </span>
              </h4>
              <div
                v-if="debuffs.length === 0"
                class="text-center py-2 text-gray-400 text-sm"
              >
                No raid debuffs data available
              </div>
              <div v-else class="grid grid-cols-2 gap-2">
                <div
                  v-for="debuff in debuffs"
                  :key="debuff.id"
                  class="flex items-center p-1.5 rounded-md transition-colors"
                  :class="
                    isCovered(debuff, 'debuff')
                      ? 'bg-green-900 bg-opacity-30'
                      : 'bg-red-900 bg-opacity-30'
                  "
                >
                  <div
                    class="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    :class="
                      isCovered(debuff, 'debuff')
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    "
                  ></div>

                  <UPopover
                    mode="hover"
                    :ui="{ width: 'md:max-w-md' }"
                    :popper="{ placement: 'right', arrow: true }"
                  >
                    <span
                      class="hover:underline truncate"
                      :class="
                        isCovered(debuff, 'debuff')
                          ? 'text-white'
                          : 'text-gray-400'
                      "
                    >
                      {{ debuff.name }}
                    </span>

                    <template #panel>
                      <div class="p-4">
                        <div class="flex items-start mb-3">
                          <div v-if="debuff.icon" class="mr-3 flex-shrink-0">
                            <img
                              :src="debuff.icon"
                              alt="Debuff Icon"
                              class="w-10 h-10 rounded"
                            />
                          </div>
                          <div>
                            <h3 class="font-bold text-base">
                              {{ debuff.name }}
                            </h3>
                            <p
                              v-if="debuff.description"
                              class="text-sm text-gray-300 mt-1"
                            >
                              {{ debuff.description }}
                            </p>
                          </div>
                        </div>

                        <div v-if="debuff.spells" class="mb-4">
                          <h4
                            class="text-xs font-semibold uppercase text-gray-400 mb-1"
                          >
                            Spells
                          </h4>
                          <p class="text-sm">{{ debuff.spells }}</p>
                        </div>

                        <div class="mb-2">
                          <h4
                            class="text-xs font-semibold uppercase text-gray-400 mb-1"
                          >
                            Provided by
                          </h4>
                          <ul class="text-sm space-y-1.5">
                            <!-- Class providers -->
                            <template
                              v-for="(group, className) in getGroupedProviders(
                                debuff,
                                'debuff'
                              )"
                              :key="className"
                            >
                              <li class="flex items-center">
                                <div
                                  class="w-2.5 h-2.5 rounded-full mr-2"
                                  :style="{ backgroundColor: group.color }"
                                ></div>
                                <span :style="{ color: group.color }">{{
                                  className
                                }}</span>
                              </li>
                            </template>

                            <!-- Spec providers - grouped by class -->
                            <template
                              v-for="(
                                classGroup, className
                              ) in getGroupedProviders(debuff, 'spec')"
                              :key="'spec-' + className"
                            >
                              <li class="ml-4">
                                <div class="flex items-baseline">
                                  <span class="text-xs text-gray-400 mr-1"
                                    >Specs:</span
                                  >
                                  <span>{{ classGroup.specs.join(", ") }}</span>
                                </div>
                              </li>
                            </template>

                            <!-- Pet providers -->
                            <template v-if="hasPetProviders(debuff)">
                              <li class="font-medium mt-1">Pets:</li>
                              <li
                                v-for="pet in getPetProviders(debuff)"
                                :key="pet"
                                class="ml-4"
                              >
                                {{ pet }}
                              </li>
                            </template>
                          </ul>
                        </div>

                        <div
                          class="mt-4 pt-2 border-t border-gray-700 text-xs text-gray-400"
                        >
                          <div class="flex items-center">
                            <div
                              class="w-2.5 h-2.5 rounded-full mr-1.5"
                              :class="
                                isCovered(debuff, 'debuff')
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                              "
                            ></div>
                            <span>{{
                              isCovered(debuff, "debuff")
                                ? "Covered in this raid"
                                : "Not covered in this raid"
                            }}</span>
                          </div>
                        </div>
                      </div>
                    </template>
                  </UPopover>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UAccordion>
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useSupabaseClient } from "#imports";

const props = defineProps({
  characters: {
    type: Array,
    required: true,
  },
});

// State
const buffs = ref([]);
const debuffs = ref([]);
const isLoading = ref(true);
const classes = ref([]);
const specs = ref([]);

// Get Supabase client
const supabase = useSupabaseClient();

// Fetch data on component mount
onMounted(async () => {
  await fetchData();
});

async function fetchData() {
  try {
    isLoading.value = true;

    // Load classes
    const { data: classData, error: classError } = await supabase
      .from("wow_classes")
      .select("*")
      .order("name");

    if (classError) throw classError;
    classes.value = classData || [];

    // Load specs
    const { data: specData, error: specError } = await supabase
      .from("wow_specs")
      .select("*")
      .order("name");

    if (specError) throw specError;
    specs.value = specData || [];

    // Load buffs with their providers
    const { data: buffData, error: buffError } = await supabase
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

    if (buffError) throw buffError;
    buffs.value = buffData || [];

    // Load debuffs with their providers
    const { data: debuffData, error: debuffError } = await supabase
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

    if (debuffError) throw debuffError;
    debuffs.value = debuffData || [];
  } catch (error) {
    console.error("Error fetching buff/debuff data:", error);
  } finally {
    isLoading.value = false;
  }
}

// Helper functions for provider organization in popovers
function getGroupedProviders(item, type) {
  const providers = item.providers || [];
  const result = {};

  // Group class providers
  providers
    .filter((p) => p.provider_type === "class")
    .forEach((provider) => {
      const className = getClassName(provider.class_id);
      const classColor = getClassColor(provider.class_id);

      if (!result[className]) {
        result[className] = {
          color: classColor,
          count: 0,
        };
      }

      result[className].count++;
    });

  // Group spec providers by class
  const specGroups = {};
  providers
    .filter((p) => p.provider_type === "spec")
    .forEach((provider) => {
      const specName = getSpecName(provider.spec_id);
      const className = getClassNameBySpec(provider.spec_id);

      if (!specGroups[className]) {
        specGroups[className] = {
          specs: [],
          color: getClassColorBySpec(provider.spec_id),
        };
      }

      specGroups[className].specs.push(specName);
    });

  return type === "class" ? result : specGroups;
}

function hasPetProviders(item) {
  return (item.providers || []).some((p) => p.provider_type === "pet");
}

function getPetProviders(item) {
  return (item.providers || [])
    .filter((p) => p.provider_type === "pet")
    .map((p) => p.pet_name);
}

// Computed properties for coverage statistics
const buffsCoveredCount = computed(() => {
  return buffs.value.filter((buff) => isCovered(buff, "buff")).length;
});

const debuffsCoveredCount = computed(() => {
  return debuffs.value.filter((debuff) => isCovered(debuff, "debuff")).length;
});

const coveredCount = computed(() => {
  return buffsCoveredCount.value + debuffsCoveredCount.value;
});

const totalCount = computed(() => {
  return buffs.value.length + debuffs.value.length;
});

const missingCount = computed(() => {
  return totalCount.value - coveredCount.value;
});

const coverageSummary = computed(() => {
  if (isLoading.value) return "";
  return `(${coveredCount.value}/${totalCount.value} covered)`;
});

// Check if a buff/debuff is covered by the characters in the split
function isCovered(item, type) {
  if (!props.characters || props.characters.length === 0) return false;

  // Get the providers for this buff/debuff
  const providers = item.providers || [];
  if (providers.length === 0) return false;

  // Check if any character in the split can provide this buff/debuff
  return props.characters.some((character) => {
    // Get character class and spec IDs
    const characterClassId = getClassIdByName(character.class);
    const characterSpecId = getSpecIdByNameAndClass(
      character.spec,
      characterClassId
    );

    // Check if any provider matches this character
    return providers.some((provider) => {
      if (
        provider.provider_type === "class" &&
        provider.class_id === characterClassId
      ) {
        return true;
      }

      if (
        provider.provider_type === "spec" &&
        provider.spec_id === characterSpecId
      ) {
        return true;
      }

      // For pets, we'd need to know which pets the character has
      // Check if the pet belongs to the character's class
      if (provider.provider_type === "pet") {
        // First try using class_id if it exists
        if (provider.class_id && provider.class_id === characterClassId) {
          return true;
        }
        // Fallback to the name prefix approach for backward compatibility
        else if (provider.pet_name) {
          if (
            provider.pet_name.startsWith("Hunter:") &&
            character.class === "Hunter"
          ) {
            return true;
          }
          if (
            provider.pet_name.startsWith("Warlock:") &&
            character.class === "Warlock"
          ) {
            return true;
          }
        }
      }

      return false;
    });
  });
}

// Helper functions to get class/spec IDs by name
function getClassIdByName(className) {
  const cls = classes.value.find((c) => c.name === className);
  return cls ? cls.id : null;
}

function getSpecIdByNameAndClass(specName, classId) {
  const spec = specs.value.find(
    (s) => s.name === specName && s.class_id === classId
  );
  return spec ? spec.id : null;
}

// Helper functions to get class/spec info
function getClassName(classId) {
  const cls = classes.value.find((c) => c.id === classId);
  return cls ? cls.name : "Unknown Class";
}

function getSpecName(specId) {
  const spec = specs.value.find((s) => s.id === specId);
  return spec ? spec.name : "Unknown Spec";
}

function getClassNameBySpec(specId) {
  const spec = specs.value.find((s) => s.id === specId);
  if (!spec) return "Unknown";
  return getClassName(spec.class_id);
}

function getClassColor(classId) {
  const cls = classes.value.find((c) => c.id === classId);
  return cls?.color || "#ffffff";
}

function getClassColorBySpec(specId) {
  const spec = specs.value.find((s) => s.id === specId);
  if (!spec) return "#ffffff";
  return getClassColor(spec.class_id);
}
</script>
