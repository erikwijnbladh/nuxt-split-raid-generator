<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-white">Raid Splits</h1>

    <!-- Split controls -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex gap-2">
        <UButton
          color="primary"
          icon="i-heroicons-plus"
          @click="addSplitGroup"
          :loading="loadingStates.addingSplit"
        >
          Add Split Group
        </UButton>
        <UButton
          v-if="splits.length > 0"
          color="primary"
          icon="i-heroicons-bolt"
          variant="soft"
          @click="openBalanceModal"
          :loading="loadingStates.balancingSplits"
        >
          Auto-Balance Groups
        </UButton>
      </div>
    </div>

    <!-- Add a modal for balancing options -->
    <UModal v-model="showBalanceModal" :overlay="true">
      <UCard class="max-w-xl w-full">
        <template #header>
          <h2 class="text-xl font-bold">Auto-Balance Raid Groups</h2>
        </template>

        <div class="p-4">
          <p class="text-sm text-gray-400 mb-4">
            This will redistribute characters across your split groups for
            optimal coverage of buffs/debuffs and role distribution.
          </p>

          <UFormGroup label="Balance Configuration" name="balanceSettings">
            <div class="space-y-2">
              <UCheckbox
                v-model="balanceSettings.prioritizeBuffs"
                label="Prioritize buff/debuff coverage"
              />
              <UCheckbox
                v-model="balanceSettings.distributeRoles"
                label="Distribute roles evenly (tanks, healers, DPS)"
              />
              <UCheckbox
                v-model="balanceSettings.maintainMains"
                label="Keep main characters in their current groups"
              />
              <UCheckbox
                v-model="balanceSettings.balanceTokens"
                label="Balance armor token distribution"
              />
            </div>
          </UFormGroup>

          <div class="mt-4 pt-4 border-t border-gray-700">
            <div class="flex justify-between">
              <UButton @click="showBalanceModal = false"> Cancel </UButton>
              <UButton
                color="primary"
                @click="balanceRaidGroups"
                :loading="loadingStates.balancingSplits"
              >
                Balance Groups
              </UButton>
            </div>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Loading state -->
    <UCard v-if="isLoading" class="text-center py-6">
      <UIcon
        name="i-heroicons-arrow-path"
        class="text-4xl mb-2 text-gray-400 animate-spin"
      />
      <p class="text-gray-400">Loading splits data...</p>
    </UCard>

    <!-- Empty state -->
    <UCard v-else-if="splits.length === 0" class="text-center py-6">
      <UIcon
        name="i-heroicons-user-group"
        class="text-4xl mb-2 text-gray-400"
      />
      <p class="text-gray-400">No raid splits created yet</p>
      <UButton color="primary" class="mt-4" @click="addSplitGroup">
        Create Your First Split
      </UButton>
    </UCard>

    <!-- Split groups -->
    <div v-else class="space-y-6">
      <div
        v-for="(split, splitIndex) in splits"
        :key="splitIndex"
        class="border border-gray-700 rounded-lg p-4"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-white">
            Split Group {{ splitIndex + 1 }}
          </h2>
          <div class="flex gap-2">
            <UButton
              color="red"
              variant="soft"
              icon="i-heroicons-trash"
              @click="deleteSplitGroup(splitIndex)"
              :loading="loadingStates.deletingSplit === splitIndex"
            />
          </div>
        </div>

        <div class="bg-gray-800 bg-opacity-50 rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-semibold">
              Characters ({{ split.characters.length }}/10)
            </h3>
          </div>

          <!-- Characters in split -->
          <TransitionGroup
            name="character-list"
            tag="div"
            class="grid grid-cols-1 md:grid-cols-2 gap-2"
          >
            <div
              v-for="(char, charIndex) in split.characters"
              :key="char.id"
              class="flex justify-between items-center p-2 rounded-lg border border-gray-700 character-item"
              :class="{ 'border-l-2 border-l-amber-500': char.is_main }"
            >
              <div class="flex items-center">
                <div
                  class="w-3 h-3 rounded-full mr-2"
                  :style="{ backgroundColor: CLASS_COLORS[char.class] }"
                ></div>
                <span
                  class="font-medium"
                  :style="{ color: CLASS_COLORS[char.class] }"
                >
                  {{ char.name }}
                </span>
                <UBadge
                  v-if="char.is_main"
                  color="amber"
                  size="xs"
                  class="ml-1"
                >
                  M
                </UBadge>
                <span class="text-xs text-gray-400 ml-2">
                  {{ char.spec }} {{ char.class }}
                </span>
                <span class="text-xs text-gray-500 ml-2">
                  ({{ getPlayerName(char.player_id) }})
                </span>
              </div>
              <UButton
                size="xs"
                color="red"
                variant="ghost"
                icon="i-heroicons-trash"
                @click="removeCharacterFromSplit(splitIndex, char.id)"
              />
            </div>
          </TransitionGroup>

          <!-- Empty state for split -->
          <div
            v-if="split.characters.length === 0"
            class="text-center p-4 text-gray-400 text-sm"
          >
            No characters in this split group
          </div>
        </div>
        <!-- Accordion for split stats -->
        <UAccordion
          :items="[
            {
              label: `Miscellaneous`,
              icon: 'i-heroicons-information-circle',
              defaultOpen: false,
              slot: 'split-stats-' + splitIndex,
            },
          ]"
          color="primary"
          variant="soft"
          class="mt-4"
        >
          <template #[`split-stats-${splitIndex}`]>
            <div
              class="bg-opacity-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <!-- Token distribution -->
              <div class="rounded-md bg-gray-800 p-3">
                <h4 class="font-medium text-sm mb-2 text-gray-300">
                  Token Distribution
                </h4>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <div class="flex items-center">
                      <div
                        class="w-3 h-3 rounded-full mr-2"
                        style="background-color: #10b981"
                      ></div>
                      <span>Protector</span>
                    </div>
                    <span class="font-semibold">{{
                      getTokenCount(split, "Protector")
                    }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <div class="flex items-center">
                      <div
                        class="w-3 h-3 rounded-full mr-2"
                        style="background-color: #8b5cf6"
                      ></div>
                      <span>Vanquisher</span>
                    </div>
                    <span class="font-semibold">{{
                      getTokenCount(split, "Vanquisher")
                    }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <div class="flex items-center">
                      <div
                        class="w-3 h-3 rounded-full mr-2"
                        style="background-color: #eab308"
                      ></div>
                      <span>Conqueror</span>
                    </div>
                    <span class="font-semibold">{{
                      getTokenCount(split, "Conqueror")
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Main/Alt distribution -->
              <div class="rounded-md bg-gray-800 p-3">
                <h4 class="font-medium text-sm mb-2 text-gray-300">
                  Main/Alt Distribution
                </h4>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <div class="flex items-center">
                      <UBadge color="amber" size="xs" class="mr-2">M</UBadge>
                      <span>Mains</span>
                    </div>
                    <span class="font-semibold">{{
                      getMainsCount(split)
                    }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <div class="flex items-center">
                      <UBadge color="gray" size="xs" class="mr-2">A</UBadge>
                      <span>Alts</span>
                    </div>
                    <span class="font-semibold">{{
                      split.characters.length - getMainsCount(split)
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Role distribution -->
              <div class="rounded-md bg-gray-800 p-3">
                <h4 class="font-medium text-sm mb-2 text-gray-300">
                  Role Distribution
                </h4>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <div class="flex items-center">
                      <UBadge color="blue" size="xs" class="mr-2">T</UBadge>
                      <span>Tanks</span>
                    </div>
                    <span class="font-semibold">{{
                      getRoleCount(split, "Tank")
                    }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <div class="flex items-center">
                      <UBadge color="green" size="xs" class="mr-2">H</UBadge>
                      <span>Healers</span>
                    </div>
                    <span class="font-semibold">{{
                      getRoleCount(split, "Healer")
                    }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <div class="flex items-center">
                      <UBadge color="red" size="xs" class="mr-2">D</UBadge>
                      <span>DPS</span>
                    </div>
                    <span class="font-semibold">{{
                      getRoleCount(split, "DPS")
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </UAccordion>

        <!-- Buffs and Debuffs -->
        <SplitBuffsDebuffs :characters="split.characters" />
      </div>
    </div>
    <!-- Characters pool section -->
    <UCard v-if="availableCharacters.length > 0 && !isLoading" class="mt-6">
      <template #header>
        <h2 class="text-lg font-semibold">Available Characters</h2>
      </template>

      <div>
        <div class="flex justify-between items-center mb-2">
          <UInput
            v-model="characterSearch"
            placeholder="Search characters..."
            icon="i-heroicons-magnifying-glass"
            class="max-w-sm"
          />
          <div class="flex gap-2">
            <USelect
              v-model="classFilter"
              :options="classFilterOptions"
              placeholder="Filter by class"
              size="sm"
              class="w-40"
            />
            <USelect
              v-model="roleFilter"
              :options="['All Roles', 'Tank', 'Healer', 'DPS']"
              placeholder="Filter by role"
              size="sm"
              class="w-36"
            />
          </div>
        </div>

        <UTable :columns="characterColumns" :rows="filteredAvailableCharacters">
          <template #name-data="{ row }">
            <div class="flex items-center">
              <span class="font-medium">{{ row.name }}</span>
              <UBadge v-if="row.is_main" color="amber" size="xs" class="ml-1">
                M
              </UBadge>
            </div>
          </template>
          <template #player-data="{ row }">
            {{ getPlayerName(row.player_id) }}
          </template>

          <template #class-data="{ row }">
            <div class="flex items-center">
              <div
                class="w-3 h-3 rounded-full mr-2"
                :style="{ backgroundColor: CLASS_COLORS[row.class] }"
              ></div>
              <span :style="{ color: CLASS_COLORS[row.class] }">{{
                row.class
              }}</span>
            </div>
          </template>

          <template #role-data="{ row }">
            <UBadge :color="getRoleBadgeColor(row.role)">
              {{ row.role }}
            </UBadge>
          </template>

          <template #actions-data="{ row }">
            <UPopover :popper="{ placement: 'bottom-end' }">
              <UButton
                color="primary"
                variant="soft"
                size="sm"
                icon="i-heroicons-plus"
              >
                Add to Split
              </UButton>

              <template #panel>
                <div class="p-4 w-64">
                  <h3 class="font-medium mb-2">Add to Split Group</h3>
                  <div class="space-y-2">
                    <div
                      v-if="splits.length === 0"
                      class="text-sm text-gray-500"
                    >
                      No split groups available. Create one first.
                    </div>
                    <UButton
                      v-for="(split, index) in splits"
                      :key="index"
                      block
                      color="gray"
                      variant="ghost"
                      class="justify-start"
                      @click="addCharacterToSplit(row, index)"
                      :loading="loadingStates.addingSplitCharacter === row.id"
                      :disabled="
                        split.characters.length >= 10 ||
                        split.characters.some(
                          (c) => c.player_id === row.player_id
                        )
                      "
                    >
                      Split Group {{ index + 1 }}
                      <span class="ml-auto text-gray-500 text-xs">
                        {{ split.characters.length }}/10
                      </span>
                    </UButton>
                  </div>
                </div>
              </template>
            </UPopover>
          </template>
        </UTable>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { CLASS_COLORS } from "~/types/wow";

definePageMeta({
  middleware: "auth",
});

// State
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const toast = useToast();
const isLoading = ref(true);
const players = ref([]);
const characters = ref([]);
const splits = ref([]);
const numberOfSplits = ref(2);
const characterSearch = ref("");
const classFilter = ref("All Classes");
const roleFilter = ref("All Roles");
const showBalanceModal = ref(false);
const balanceSettings = reactive({
  prioritizeBuffs: true,
  distributeRoles: true,
  maintainMains: true,
  balanceTokens: false,
});
const targetCharPerSplit = ref(25);
const isBalancing = ref(false);
const validationResults = ref([]);
const buffDebuffData = ref([]); // Store buff/debuff data for validation

// Add to state section
const loadingStates = reactive({
  addingSplitCharacter: null, // Will store character ID when adding
  removingCharacter: null, // Will store character ID when removing
  addingSplit: false,
  deletingSplit: null, // Will store split index when deleting
  balancingSplits: false,
});

// Character table columns
const characterColumns = [
  { key: "name", label: "Character Name" },
  { key: "player", label: "Player" },
  { key: "class", label: "Class" },
  { key: "spec", label: "Spec" },
  { key: "role", label: "Role" },
  { key: "actions", label: "Actions" },
];

// Token distribution mappings
const TOKEN_CLASS_MAPPINGS = {
  Protector: [10, 3, 8], // Warrior, Hunter, Shaman
  Vanquisher: [7, 1, 4, 2], // Rogue, Death Knight, Mage, Druid
  Conqueror: [5, 6, 9], // Paladin, Priest, Warlock
};

// Get all characters that are in any split
const charactersInSplits = computed(() => {
  const usedCharacterIds = new Set();

  splits.value.forEach((split) => {
    split.characters.forEach((char) => {
      usedCharacterIds.add(char.id);
    });
  });

  return usedCharacterIds;
});

// Get all characters available to add to splits (not already in splits)
const availableCharacters = computed(() => {
  return characters.value.filter(
    (char) => !charactersInSplits.value.has(char.id)
  );
});

// Get filtered characters for the available characters table
const filteredAvailableCharacters = computed(() => {
  let filtered = availableCharacters.value;

  // Apply search filter
  if (characterSearch.value) {
    const search = characterSearch.value.toLowerCase();
    filtered = filtered.filter(
      (char) =>
        char.name.toLowerCase().includes(search) ||
        getPlayerName(char.player_id).toLowerCase().includes(search)
    );
  }

  // Apply class filter
  if (classFilter.value !== "All Classes") {
    filtered = filtered.filter((char) => char.class === classFilter.value);
  }

  // Apply role filter
  if (roleFilter.value !== "All Roles") {
    filtered = filtered.filter((char) => char.role === roleFilter.value);
  }

  return filtered;
});

// Computed class options for filters
const classFilterOptions = computed(() => {
  const classes = ["All Classes"];

  // Add unique classes from characters
  const uniqueClasses = [
    ...new Set(characters.value.map((char) => char.class)),
  ];
  return classes.concat(uniqueClasses.sort());
});

// Get player name from ID
function getPlayerName(playerId) {
  const player = players.value.find((p) => p.id === playerId);
  return player ? player.name : "Unknown";
}

// Remove character from split
async function removeCharacterFromSplit(splitIndex, charId) {
  const split = splits.value[splitIndex];
  if (!split) return;

  try {
    // Set loading state for this specific character
    loadingStates.removingCharacter = charId;

    // Get character for optimistic update
    const characterToRemove = split.characters.find((c) => c.id === charId);

    // Optimistically update UI first
    split.characters = split.characters.filter((c) => c.id !== charId);

    // Then update the database
    const { error } = await supabase
      .from("split_characters")
      .delete()
      .eq("split_id", split.id)
      .eq("character_id", charId);

    if (error) {
      // If there's an error, revert the optimistic update
      if (characterToRemove) {
        split.characters.push(characterToRemove);
      }
      throw error;
    }
  } catch (error) {
    toast.add({
      title: "Error",
      description: `Failed to remove character: ${error.message}`,
      color: "red",
    });
  } finally {
    loadingStates.removingCharacter = null;
  }
}

// Add a new split group
async function addSplitGroup() {
  try {
    // Set the specific loading state
    loadingStates.addingSplit = true;

    const newSplit = {
      name: `Split ${splits.value.length + 1}`,
      user_id: user.value.id,
    };

    // Optimistically add to local state first with a temporary ID
    const tempId = `temp-${Date.now()}`;
    const tempSplit = {
      id: tempId,
      ...newSplit,
      characters: [],
    };

    splits.value.push(tempSplit);

    // Then update the database
    const { data, error } = await supabase
      .from("splits")
      .insert(newSplit)
      .select()
      .single();

    if (error) {
      // If there's an error, remove the temporary split
      splits.value = splits.value.filter((s) => s.id !== tempId);
      throw error;
    }

    // Update the temporary split with the real data
    const index = splits.value.findIndex((s) => s.id === tempId);
    if (index !== -1) {
      splits.value[index] = {
        ...data,
        characters: [],
      };
    }

    toast.add({
      title: "Split group created",
      description: `Created split group ${newSplit.name}`,
      color: "green",
    });
  } catch (error) {
    toast.add({
      title: "Error",
      description: `Failed to create split group: ${error.message}`,
      color: "red",
    });
  } finally {
    loadingStates.addingSplit = false;
  }
}

// Delete a split group
async function deleteSplitGroup(splitIndex) {
  const split = splits.value[splitIndex];
  if (!split) return;

  if (
    !confirm(`Are you sure you want to delete Split Group ${splitIndex + 1}?`)
  ) {
    return;
  }

  try {
    // Set the specific loading state
    loadingStates.deletingSplit = splitIndex;

    // Store split for potential rollback
    const splitToDelete = splits.value[splitIndex];

    // Optimistically update UI first
    splits.value.splice(splitIndex, 1);

    // Then update the database
    const { error } = await supabase.from("splits").delete().eq("id", split.id);

    if (error) {
      // If there's an error, revert the optimistic update
      splits.value.splice(splitIndex, 0, splitToDelete);
      throw error;
    }

    toast.add({
      title: "Split group deleted",
      description: "Split group has been deleted",
      color: "green",
    });
  } catch (error) {
    toast.add({
      title: "Error",
      description: `Failed to delete split group: ${error.message}`,
      color: "red",
    });
  } finally {
    loadingStates.deletingSplit = null;
  }
}

// Add character to a split
async function addCharacterToSplit(character, splitIndex) {
  const split = splits.value[splitIndex];
  if (!split) return;

  // Check if this split already has 10 characters
  if (split.characters.length >= 10) {
    toast.add({
      title: "Cannot add character",
      description: "This split already has 10 characters",
      color: "red",
    });
    return;
  }

  // Check if the character's player is already in this split
  const playerAlreadyUsed = split.characters.some(
    (char) => char.player_id === character.player_id
  );

  if (playerAlreadyUsed) {
    toast.add({
      title: "Cannot add character",
      description: `${getPlayerName(
        character.player_id
      )} already has a character in this split`,
      color: "red",
    });
    return;
  }

  try {
    // Set loading state for this specific character
    loadingStates.addingSplitCharacter = character.id;

    // Optimistically update UI first
    const characterCopy = { ...character };
    split.characters.push(characterCopy);

    // Then update the database
    const { error } = await supabase.from("split_characters").insert({
      split_id: split.id,
      character_id: character.id,
    });

    if (error) {
      // If there's an error, revert the optimistic update
      split.characters = split.characters.filter((c) => c.id !== character.id);
      throw error;
    }
  } catch (error) {
    toast.add({
      title: "Error",
      description: `Failed to add character: ${error.message}`,
      color: "red",
    });
  } finally {
    loadingStates.addingSplitCharacter = null;
  }
}

// Get role badge color
function getRoleBadgeColor(role) {
  switch (role) {
    case "Tank":
      return "blue";
    case "Healer":
      return "green";
    case "DPS":
      return "red";
    default:
      return "gray";
  }
}

// Get token counts
function getTokenCount(split, tokenName) {
  if (!split || !split.characters || split.characters.length === 0) return 0;

  // Get class IDs for this token
  const tokenClassIds = TOKEN_CLASS_MAPPINGS[tokenName];
  if (!tokenClassIds) return 0;

  // Map class names to IDs for comparison
  const classIdMap = {
    Warrior: 10,
    Hunter: 3,
    Shaman: 8,
    Rogue: 7,
    "Death Knight": 1,
    Mage: 4,
    Druid: 2,
    Paladin: 5,
    Priest: 6,
    Warlock: 9,
  };

  // Count characters with matching class IDs
  return split.characters.filter((char) =>
    tokenClassIds.includes(classIdMap[char.class])
  ).length;
}

// Get count of main characters in a split
function getMainsCount(split) {
  if (!split || !split.characters) return 0;
  return split.characters.filter((char) => char.is_main).length;
}

// Get count of characters with a specific role
function getRoleCount(split, role) {
  if (!split || !split.characters) return 0;
  return split.characters.filter((char) => char.role === role).length;
}

// Load data function
async function loadData() {
  try {
    isLoading.value = true;

    // Load players
    const { data: playersData, error: playersError } = await supabase
      .from("players")
      .select("*")
      .eq("user_id", user.value.id)
      .order("name");

    if (playersError) throw playersError;
    players.value = playersData || [];

    // Load characters if we have players
    if (players.value.length > 0) {
      const playerIds = players.value.map((player) => player.id);

      const { data: charactersData, error: charactersError } = await supabase
        .from("characters")
        .select("*")
        .in("player_id", playerIds)
        .order("name");

      if (charactersError) throw charactersError;
      characters.value = charactersData || [];
    } else {
      characters.value = [];
    }

    // Load splits
    const { data: splitsData, error: splitsError } = await supabase
      .from("splits")
      .select("*")
      .eq("user_id", user.value.id)
      .order("created_at");

    if (splitsError) throw splitsError;

    // Initialize splits with empty characters arrays
    const initializedSplits = (splitsData || []).map((split) => ({
      ...split,
      characters: [],
    }));

    splits.value = initializedSplits;

    // If we have splits, load their characters
    if (splits.value.length > 0) {
      const splitIds = splits.value.map((split) => split.id);

      // Get split_characters entries
      const { data: splitCharData, error: splitCharError } = await supabase
        .from("split_characters")
        .select("split_id, character_id")
        .in("split_id", splitIds);

      if (splitCharError) throw splitCharError;

      // Assign characters to their splits
      if (splitCharData && splitCharData.length > 0) {
        splitCharData.forEach((entry) => {
          const split = splits.value.find((s) => s.id === entry.split_id);
          const character = characters.value.find(
            (c) => c.id === entry.character_id
          );

          if (split && character) {
            split.characters.push(character);
          }
        });
      }
    }

    // Initialize an empty split if there are none and we have characters
    if (splits.value.length === 0 && characters.value.length > 0) {
      addSplitGroup();
    }
  } catch (error) {
    toast.add({
      title: "Error",
      description: `Failed to load data: ${error.message}`,
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
}

// Load data on component mount
onMounted(() => {
  loadData();
});

// Add function to open the balance modal
function openBalanceModal() {
  showBalanceModal.value = true;
}

// Update the balanceRaidGroups function to prioritize buff/debuff coverage before stacking same classes or specs. Add an explicit step to check for missing buffs and ensure they're covered before adding duplicate classes/specs.
async function balanceRaidGroups() {
  try {
    loadingStates.balancingSplits = true;

    // Skip if no splits
    if (splits.value.length === 0) {
      toast.add({
        title: "No splits to balance",
        description: "Create at least one split first",
        color: "amber",
      });
      return;
    }

    // Make a copy of the current splits to restore if needed
    const splitsCopy = JSON.parse(JSON.stringify(splits.value));

    // Collect all characters from all splits and available characters
    let allCharacters = [];
    splits.value.forEach((split) => {
      allCharacters = allCharacters.concat(split.characters);
    });
    allCharacters = [...allCharacters, ...availableCharacters.value];

    // If no characters, we can't balance
    if (allCharacters.length === 0) {
      toast.add({
        title: "No characters to balance",
        description: "Add characters to your roster first",
        color: "amber",
      });
      return;
    }

    console.log(`Total characters to distribute: ${allCharacters.length}`);

    // Reset all splits
    splits.value.forEach((split) => {
      split.characters = [];
    });

    // Get buff and debuff data for coverage checking
    const { data: buffData, error: buffError } = await supabase
      .from("wow_buffs")
      .select(
        "*,providers:wow_buff_providers(provider_type,class_id,spec_id,pet_name)"
      )
      .order("name");

    const { data: debuffData, error: debuffError } = await supabase
      .from("wow_debuffs")
      .select(
        "*,providers:wow_debuff_providers(provider_type,class_id,spec_id,pet_name)"
      )
      .order("name");

    if (buffError || debuffError) {
      throw new Error("Failed to load buff/debuff data");
    }

    const buffs = buffData || [];
    const debuffs = debuffData || [];
    const allItems = [...buffs, ...debuffs];

    // Store buff/debuff data globally for validation
    buffDebuffData.value = allItems;

    // Create a mapping of buff names to characters that can provide them
    const buffProviders = {};

    // Process all buffs and find characters that can provide each buff
    for (const buff of buffs) {
      buffProviders[buff.name] = allCharacters.filter((char) =>
        canProvideBuffOrDebuff(char, buff)
      );
    }

    // Process all debuffs as well
    for (const debuff of debuffs) {
      buffProviders[debuff.name] = allCharacters.filter((char) =>
        canProvideBuffOrDebuff(char, debuff)
      );
    }

    // Create a map of important buffs/debuffs to prioritize
    const importantBuffs = {};
    allItems.forEach((item) => {
      // Skip less important buffs like minor stat increases
      if (item.name.includes("Minor") || item.name.includes("Small")) {
        return;
      }
      importantBuffs[item.name] = {
        providers: buffProviders[item.name] || [],
        covered: new Array(splits.value.length).fill(false),
      };
    });

    // Categorize characters by role, class and spec
    const categorizedCharacters = {
      tanks: {
        bloodDK: allCharacters.filter(
          (c) =>
            c.role === "Tank" &&
            c.class === "Death Knight" &&
            c.spec === "Blood"
        ),
        other: allCharacters.filter(
          (c) =>
            c.role === "Tank" &&
            !(c.class === "Death Knight" && c.spec === "Blood")
        ),
      },
      healers: {},
      damageBuffProviders: {
        retPaladins: allCharacters.filter(
          (c) => c.class === "Paladin" && c.spec === "Retribution"
        ),
        arcaneMages: allCharacters.filter(
          (c) => c.class === "Mage" && c.spec === "Arcane"
        ),
      },
      hunters: allCharacters.filter((c) => c.class === "Hunter"),
      dps: allCharacters.filter(
        (c) =>
          c.role === "DPS" &&
          !(c.class === "Paladin" && c.spec === "Retribution") &&
          !(c.class === "Mage" && c.spec === "Arcane") &&
          !(c.class === "Hunter")
      ),
    };

    // Group healers by class
    const healerClasses = ["Priest", "Paladin", "Shaman", "Druid", "Monk"];
    healerClasses.forEach((className) => {
      categorizedCharacters.healers[className] = allCharacters.filter(
        (c) => c.role === "Healer" && c.class === className
      );
    });

    // Organize characters by main status
    const mainCharacters = allCharacters.filter((c) => c.is_main);
    const nonMainCharacters = allCharacters.filter((c) => !c.is_main);

    // Initialize tracking for balanced distribution
    const assignedCharacters = new Set();
    const playerAssignments = {}; // player_id -> split indices they're in
    const splitStats = splits.value.map((_) => ({
      tanks: 0,
      healers: 0,
      dps: 0,
      mains: 0,
      totalChars: 0,
      players: new Set(),
      healerClasses: new Set(),
      hasDamageBuff: false,
      hunters: 0,
      classCount: {}, // Track count of each class in the split
      specCount: {}, // Track count of each spec in the split
      coveredBuffs: new Set(), // Track which buffs are covered in this split
    }));

    // Helper function to check if a character can be added to a split
    function canAddCharacterToSplit(character, splitIndex) {
      if (assignedCharacters.has(character.id)) return false;
      if (splitStats[splitIndex].totalChars >= 10) return false;
      if (splitStats[splitIndex].players.has(character.player_id)) return false;

      // Additional role-specific checks
      if (character.role === "Tank" && splitStats[splitIndex].tanks >= 2)
        return false;
      if (character.role === "Healer" && splitStats[splitIndex].healers >= 2)
        return false;
      if (
        character.role === "Healer" &&
        splitStats[splitIndex].healerClasses.has(character.class)
      )
        return false;

      // Check if this is a hunter and we already have one in this split
      if (character.class === "Hunter" && splitStats[splitIndex].hunters >= 1)
        return false;

      return true;
    }

    // Helper function to add a character to a split
    function addCharacterToSplit(character, splitIndex) {
      const split = splits.value[splitIndex];
      const stats = splitStats[splitIndex];

      // Add character to split
      split.characters.push(character);
      assignedCharacters.add(character.id);

      // Update tracking stats
      stats.totalChars++;
      stats.players.add(character.player_id);
      if (character.is_main) stats.mains++;

      // Update role-specific tracking
      if (character.role === "Tank") stats.tanks++;
      else if (character.role === "Healer") {
        stats.healers++;
        stats.healerClasses.add(character.class);
      } else stats.dps++;

      // Track damage buff providers
      if (
        (character.class === "Paladin" && character.spec === "Retribution") ||
        (character.class === "Mage" && character.spec === "Arcane")
      ) {
        stats.hasDamageBuff = true;
      }

      // Track hunters
      if (character.class === "Hunter") {
        stats.hunters++;
      }

      // Track class and spec counts
      stats.classCount[character.class] =
        (stats.classCount[character.class] || 0) + 1;
      const specKey = `${character.class}-${character.spec}`;
      stats.specCount[specKey] = (stats.specCount[specKey] || 0) + 1;

      // Update buffs covered by this character
      for (const buffName in importantBuffs) {
        const buff = importantBuffs[buffName];
        if (buff.providers.some((p) => p.id === character.id)) {
          importantBuffs[buffName].covered[splitIndex] = true;
          stats.coveredBuffs.add(buffName);
        }
      }

      // Track player assignment to splits
      if (!playerAssignments[character.player_id]) {
        playerAssignments[character.player_id] = [];
      }
      playerAssignments[character.player_id].push(splitIndex);
    }

    // STEP 1: Assign Blood DK tanks (one per split)
    console.log("STEP 1: Assigning Blood DK tanks");
    splits.value.forEach((split, index) => {
      const availableDKs = categorizedCharacters.tanks.bloodDK.filter((dk) =>
        canAddCharacterToSplit(dk, index)
      );

      if (availableDKs.length > 0) {
        // Prefer mains over non-mains
        availableDKs.sort((a, b) => b.is_main - a.is_main);
        addCharacterToSplit(availableDKs[0], index);
      } else {
        console.warn(`Could not find a Blood DK tank for split ${index + 1}`);
      }
    });

    // STEP 2: Assign second tanks of different class
    console.log("STEP 2: Assigning second tanks");
    splits.value.forEach((split, index) => {
      if (splitStats[index].tanks < 2) {
        const availableTanks = categorizedCharacters.tanks.other.filter(
          (tank) => canAddCharacterToSplit(tank, index)
        );

        if (availableTanks.length > 0) {
          // Prefer mains over non-mains
          availableTanks.sort((a, b) => b.is_main - a.is_main);
          addCharacterToSplit(availableTanks[0], index);
        } else {
          console.warn(`Could not find a second tank for split ${index + 1}`);
        }
      }
    });

    // STEP 3: Assign healers (two of different classes per split)
    console.log("STEP 3: Assigning healers");
    splits.value.forEach((split, index) => {
      while (splitStats[index].healers < 2) {
        let healerAssigned = false;

        // Try each healer class that isn't already in this split
        for (const className of healerClasses) {
          if (splitStats[index].healerClasses.has(className)) continue;

          const availableHealers =
            categorizedCharacters.healers[className]?.filter((healer) =>
              canAddCharacterToSplit(healer, index)
            ) || [];

          if (availableHealers.length > 0) {
            // Prefer mains over non-mains
            availableHealers.sort((a, b) => b.is_main - a.is_main);
            addCharacterToSplit(availableHealers[0], index);
            healerAssigned = true;
            break;
          }
        }

        if (!healerAssigned) {
          console.warn(
            `Could not assign healer ${
              splitStats[index].healers + 1
            } for split ${index + 1}`
          );
          break;
        }
      }
    });

    // STEP 4: Assign Ret Paladins or Arcane Mages for damage buff
    console.log("STEP 4: Assigning damage buff providers");
    splits.value.forEach((split, index) => {
      if (!splitStats[index].hasDamageBuff) {
        // Try Ret Paladins first
        let availableBuffProviders =
          categorizedCharacters.damageBuffProviders.retPaladins.filter((char) =>
            canAddCharacterToSplit(char, index)
          );

        // If no Ret Paladins, try Arcane Mages
        if (availableBuffProviders.length === 0) {
          availableBuffProviders =
            categorizedCharacters.damageBuffProviders.arcaneMages.filter(
              (char) => canAddCharacterToSplit(char, index)
            );
        }

        if (availableBuffProviders.length > 0) {
          // Prefer mains over non-mains
          availableBuffProviders.sort((a, b) => b.is_main - a.is_main);
          addCharacterToSplit(availableBuffProviders[0], index);
        } else {
          console.warn(
            `Could not assign damage buff provider for split ${index + 1}`
          );
        }
      }
    });

    // STEP 4.5: Assign exactly one Hunter to each split (high priority)
    console.log("STEP 4.5: Assigning Hunters (high priority)");
    splits.value.forEach((split, index) => {
      // Skip if this split already has a hunter (from previous steps)
      if (splitStats[index].hunters === 0) {
        const availableHunters = categorizedCharacters.hunters.filter(
          (hunter) => canAddCharacterToSplit(hunter, index)
        );

        if (availableHunters.length > 0) {
          // Prefer mains over non-mains
          availableHunters.sort((a, b) => b.is_main - a.is_main);
          addCharacterToSplit(availableHunters[0], index);
        } else {
          console.warn(`Could not assign a Hunter to split ${index + 1}`);
        }
      } else {
        console.log(`Split ${index + 1} already has a Hunter assigned`);
      }
    });

    // STEP 5: Fill missing buff coverage - NEW STEP FOR BUFF PRIORITIZATION
    console.log("STEP 5: Prioritizing buff coverage");

    // First, find remaining missing buffs for each split
    splits.value.forEach((split, index) => {
      // Skip splits that are already full
      if (splitStats[index].totalChars >= 10) return;

      console.log(`Checking missing buffs for Split ${index + 1}`);

      // Find missing important buffs for this split
      const missingBuffs = Object.entries(importantBuffs)
        .filter(([buffName, buff]) => !buff.covered[index])
        .map(([buffName, buff]) => ({
          name: buffName,
          providers: buff.providers.filter(
            (p) =>
              !assignedCharacters.has(p.id) && canAddCharacterToSplit(p, index)
          ),
        }))
        .filter((buff) => buff.providers.length > 0)
        .sort((a, b) => a.providers.length - b.providers.length); // Sort by rarity (fewest providers first)

      if (missingBuffs.length === 0) {
        console.log(
          `No missing buffs with available providers for Split ${index + 1}`
        );
        return;
      }

      // Try to cover as many missing buffs as possible
      const assignedForBuffs = new Set();
      for (const missingBuff of missingBuffs) {
        // Skip if we've reached the limit
        if (splitStats[index].totalChars >= 10) break;

        // Find characters that provide this buff
        // Prioritize characters that:
        // 1. Are not already assigned for another buff
        // 2. Provide multiple missing buffs
        // 3. Are of a class/spec not already in the split
        // 4. Are mains (if all else is equal)
        const providers = missingBuff.providers
          .filter((p) => !assignedForBuffs.has(p.id))
          .map((p) => {
            // Calculate how many missing buffs this character provides
            const buffsCovered = Object.entries(importantBuffs).filter(
              ([buffName, buff]) =>
                !buff.covered[index] &&
                buff.providers.some((provider) => provider.id === p.id)
            ).length;

            // Check if this class/spec would be a duplicate
            const isDuplicateClass = splitStats[index].classCount[p.class] > 0;
            const isDuplicateSpec =
              splitStats[index].specCount[`${p.class}-${p.spec}`] > 0;

            return {
              character: p,
              buffsCovered,
              isDuplicateClass,
              isDuplicateSpec,
              isMain: p.is_main,
            };
          })
          .sort((a, b) => {
            // First prioritize by number of missing buffs covered
            if (b.buffsCovered !== a.buffsCovered)
              return b.buffsCovered - a.buffsCovered;

            // Then prioritize non-duplicate classes
            if (a.isDuplicateClass !== b.isDuplicateClass)
              return a.isDuplicateClass ? 1 : -1;

            // Then prioritize non-duplicate specs
            if (a.isDuplicateSpec !== b.isDuplicateSpec)
              return a.isDuplicateSpec ? 1 : -1;

            // Finally prioritize mains
            return b.isMain - a.isMain;
          });

        if (providers.length > 0) {
          const selectedProvider = providers[0].character;
          console.log(
            `Adding ${selectedProvider.name} (${selectedProvider.spec} ${selectedProvider.class}) to cover ${missingBuff.name}`
          );
          addCharacterToSplit(selectedProvider, index);
          assignedForBuffs.add(selectedProvider.id);
        }
      }
    });

    // STEP 6: Distribute remaining DPS with a focus on mains
    console.log("STEP 6: Distributing remaining characters");

    // Sort all remaining DPS characters by main status
    const remainingDps = categorizedCharacters.dps.filter(
      (char) => !assignedCharacters.has(char.id)
    );

    // First, try to assign main characters evenly
    const mainDps = remainingDps.filter((char) => char.is_main);
    mainDps.sort((a, b) => a.player_id.localeCompare(b.player_id)); // Group by player

    while (mainDps.length > 0) {
      // Find the split with the fewest mains
      const splitWithFewestMains = splitStats
        .map((stats, index) => ({ index, mains: stats.mains }))
        .filter((s) => splitStats[s.index].totalChars < 10)
        .sort((a, b) => a.mains - b.mains)[0];

      if (!splitWithFewestMains) break;

      // Find a main DPS that can be added to this split
      // First try to find characters that don't duplicate classes/specs
      const splitIndex = splitWithFewestMains.index;
      const nonDuplicateChars = mainDps.filter(
        (char) =>
          canAddCharacterToSplit(char, splitIndex) &&
          !(splitStats[splitIndex].classCount[char.class] > 0)
      );

      if (nonDuplicateChars.length > 0) {
        addCharacterToSplit(nonDuplicateChars[0], splitIndex);
        mainDps.splice(mainDps.indexOf(nonDuplicateChars[0]), 1);
      } else {
        // If no non-duplicate classes, find any valid main
        const charIndex = mainDps.findIndex((char) =>
          canAddCharacterToSplit(char, splitWithFewestMains.index)
        );

        if (charIndex >= 0) {
          addCharacterToSplit(mainDps[charIndex], splitWithFewestMains.index);
          mainDps.splice(charIndex, 1);
        } else {
          break; // No more main DPS that can be assigned
        }
      }
    }

    // Then, fill remaining spots with non-main DPS
    const nonMainDps = remainingDps.filter(
      (char) => !char.is_main && !assignedCharacters.has(char.id)
    );
    nonMainDps.sort((a, b) => a.player_id.localeCompare(b.player_id)); // Group by player

    splits.value.forEach((split, index) => {
      while (splitStats[index].totalChars < 10) {
        // First try to add characters of classes not yet in the split
        const nonDuplicateChars = nonMainDps.filter(
          (char) =>
            canAddCharacterToSplit(char, index) &&
            !(splitStats[index].classCount[char.class] > 0)
        );

        if (nonDuplicateChars.length > 0) {
          addCharacterToSplit(nonDuplicateChars[0], index);
          nonMainDps.splice(nonMainDps.indexOf(nonDuplicateChars[0]), 1);
        } else {
          // If no non-duplicate classes available, try any valid character
          const charIndex = nonMainDps.findIndex((char) =>
            canAddCharacterToSplit(char, index)
          );

          if (charIndex >= 0) {
            addCharacterToSplit(nonMainDps[charIndex], index);
            nonMainDps.splice(charIndex, 1);
          } else {
            break; // No more characters can be assigned to this split
          }
        }
      }
    });

    // STEP 7: Final pass - try to fill any remaining spots with any character
    console.log("STEP 7: Final pass to fill empty spots");
    const remainingChars = allCharacters.filter(
      (char) => !assignedCharacters.has(char.id)
    );

    splits.value.forEach((split, index) => {
      while (splitStats[index].totalChars < 10) {
        const charIndex = remainingChars.findIndex((char) =>
          canAddCharacterToSplit(char, index)
        );

        if (charIndex >= 0) {
          addCharacterToSplit(remainingChars[charIndex], index);
          remainingChars.splice(charIndex, 1);
        } else {
          break; // No more characters can be assigned to this split
        }
      }
    });

    // Validate the splits
    const validationResults = await validateSplits();

    // Now save the changes to the database
    const updatePromises = [];

    // First delete all existing mappings
    for (const split of splitsCopy) {
      updatePromises.push(
        supabase.from("split_characters").delete().eq("split_id", split.id)
      );
    }

    // Wait for all deletes to complete
    await Promise.all(updatePromises);
    updatePromises.length = 0;

    // Now insert the new mappings
    for (const split of splits.value) {
      for (const character of split.characters) {
        updatePromises.push(
          supabase.from("split_characters").insert({
            split_id: split.id,
            character_id: character.id,
          })
        );
      }
    }

    // Wait for all inserts to complete
    const results = await Promise.all(updatePromises);

    // Check for errors
    const saveErrors = results.filter((r) => r.error);
    if (saveErrors.length > 0) {
      // Restore the original splits
      splits.value = splitsCopy;
      throw new Error(`${saveErrors.length} errors occurred while saving`);
    }

    // Calculate summary statistics
    const totalAssigned = splits.value.reduce(
      (sum, split) => sum + split.characters.length,
      0
    );
    const totalMainsAssigned = splits.value.reduce(
      (sum, split) => sum + split.characters.filter((c) => c.is_main).length,
      0
    );
    const totalNonMainsAssigned = totalAssigned - totalMainsAssigned;

    // Count how many splits meet all requirements
    const validSplitCount = validationResults.splitValidation.filter(
      (validation) => !validation.issues.some((issue) => issue.type === "error")
    ).length;

    // Show summary message
    let successMessage = `${totalAssigned} characters distributed (${totalMainsAssigned} mains, ${totalNonMainsAssigned} alts)`;
    if (validSplitCount === splits.value.length) {
      successMessage += " with all requirements met";
      toast.add({
        title: "Raid groups balanced",
        description: successMessage,
        color: "green",
      });
    } else {
      toast.add({
        title: "Some requirements not met",
        description: `${validSplitCount}/${splits.value.length} splits meet all requirements. Check validation results for details.`,
        color: "amber",
        timeout: 8000,
      });
    }

    // Display distribution stats for each split
    splits.value.forEach((split, index) => {
      console.log(
        `Split ${index + 1}: ${split.characters.length} characters, ${
          splitStats[index].mains
        } mains, ${split.characters.length - splitStats[index].mains} alts`
      );
      console.log(
        `  Roles: ${splitStats[index].tanks} tanks, ${splitStats[index].healers} healers, ${splitStats[index].dps} dps`
      );
      console.log(
        `  Has damage buff: ${splitStats[index].hasDamageBuff ? "Yes" : "No"}`
      );
    });

    showBalanceModal.value = false;
  } catch (error) {
    toast.add({
      title: "Error",
      description: `Failed to balance groups: ${error.message}`,
      color: "red",
    });

    // Reload data to ensure consistency
    await loadData();
  } finally {
    loadingStates.balancingSplits = false;
  }
}

// Helper function to get armor type by class
function armorsByClass(className) {
  if (["Warrior", "Paladin", "Death Knight"].includes(className)) {
    return "plate";
  } else if (["Hunter", "Shaman"].includes(className)) {
    return "mail";
  } else if (["Rogue", "Druid"].includes(className)) {
    return "leather";
  } else if (["Priest", "Mage", "Warlock"].includes(className)) {
    return "cloth";
  }

  return "unknown";
}

// Helper function to check if a character can provide a specific buff/debuff
async function canProvideBuffOrDebuff(character, item, splitIndex) {
  if (typeof item === "string" && typeof splitIndex === "number") {
    // In this case, item is a buff name and splitIndex is the split index
    // Find the buff object from buffDebuffData
    const buffName = item;
    const buffObj = buffDebuffData.value.find((b) => b.name === buffName);

    if (!buffObj) {
      console.warn(`Buff "${buffName}" not found in buff data`);
      return false;
    }

    // Now check if the character can provide this buff
    return canProvideBuffOrDebuff(character, buffObj);
  }

  if (!item.providers || item.providers.length === 0) return false;

  // Get character class and spec IDs
  const characterClassId = getClassIdByName(character.class);
  const characterSpecId = getSpecIdByNameAndClassId(
    character.spec,
    characterClassId
  );

  // Check if this character matches any provider
  return item.providers.some((provider) => {
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

    // For pets, check if the character has the right class
    if (provider.provider_type === "pet") {
      if (provider.class_id && provider.class_id === characterClassId) {
        return true;
      } else if (provider.pet_name) {
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
      return false;
    }

    return false;
  });
}

// Helper function to check if a buff/debuff is covered in a split
async function isBuffCoveredInSplit(buff, splitOrCharacters) {
  // Case 1: buff is a string (buff name) and splitOrCharacters is a number (split index)
  if (typeof buff === "string" && typeof splitOrCharacters === "number") {
    const splitIndex = splitOrCharacters;
    const buffName = buff;

    // Make sure the split index is valid
    if (splitIndex < 0 || splitIndex >= splits.value.length) {
      return false;
    }

    const characters = splits.value[splitIndex].characters;

    // Check if any character in this split can provide the buff
    for (const character of characters) {
      for (const buffObj of buffDebuffData.value) {
        if (
          buffObj.name === buffName &&
          (await canProvideBuffOrDebuff(character, buffObj))
        ) {
          return true;
        }
      }
    }

    return false;
  }

  // Case 2: buff is an object and splitOrCharacters is an array of characters
  const characters = splitOrCharacters;
  if (!characters || characters.length === 0) return false;

  // Get the providers for this buff/debuff
  const providers = buff.providers || [];
  if (providers.length === 0) return false;

  // Check if any character in the split can provide this buff/debuff
  for (const character of characters) {
    // Get character class and spec IDs
    const characterClassId = getClassIdByName(character.class);
    const characterSpecId = getSpecIdByNameAndClassId(
      character.spec,
      characterClassId
    );

    // Check if any provider matches this character
    for (const provider of providers) {
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

      // For pets, check if the character has the right class
      if (provider.provider_type === "pet") {
        if (provider.class_id && provider.class_id === characterClassId) {
          return true;
        } else if (provider.pet_name) {
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
    }
  }

  return false;
}

// Helper function to find a character providing a specific buff/debuff
function findCharProviding(item, characters) {
  for (const character of characters) {
    // Get character class and spec IDs
    const characterClassId = getClassIdByName(character.class);
    const characterSpecId = getSpecIdByNameAndClassId(
      character.spec,
      characterClassId
    );

    // Check if this character can provide the buff/debuff
    for (const provider of item.providers || []) {
      if (
        provider.provider_type === "class" &&
        provider.class_id === characterClassId
      ) {
        return character;
      }

      if (
        provider.provider_type === "spec" &&
        provider.spec_id === characterSpecId
      ) {
        return character;
      }

      // For pets, check if the character has the right class
      if (provider.provider_type === "pet") {
        if (provider.class_id && provider.class_id === characterClassId) {
          return character;
        } else if (provider.pet_name) {
          if (
            provider.pet_name.startsWith("Hunter:") &&
            character.class === "Hunter"
          ) {
            return character;
          }
          if (
            provider.pet_name.startsWith("Warlock:") &&
            character.class === "Warlock"
          ) {
            return character;
          }
        }
      }
    }
  }
  return null;
}

// Helper function to balance armor tokens across splits
function balanceArmorTokens() {
  // Skip if no splits
  if (splits.value.length <= 1) return;

  // This is a simplified version that just tries to balance tokens
  // In a real implementation, would need to do token swaps between splits

  // For each split, count token distribution
  const tokenCounts = splits.value.map((split) => {
    return {
      Protector: getTokenCount(split, "Protector"),
      Vanquisher: getTokenCount(split, "Vanquisher"),
      Conqueror: getTokenCount(split, "Conqueror"),
    };
  });

  // Calculate average tokens per split
  const totalChars = splits.value.reduce(
    (sum, split) => sum + split.characters.length,
    0
  );
  const charsPerSplit = Math.floor(totalChars / splits.value.length);

  // For now, just log token distribution to help manually balance
  console.log("Token distribution after auto-balance:", tokenCounts);

  // TODO: Implement token balancing algorithm if needed
}

// Helper function to get class ID by name
function getClassIdByName(className) {
  // This is a simplified version - in the real implementation,
  // this should use the actual class data from the database
  const classMap = {
    Warrior: 10,
    Paladin: 5,
    Hunter: 3,
    Rogue: 7,
    Priest: 6,
    "Death Knight": 1,
    Shaman: 8,
    Mage: 4,
    Warlock: 9,
    Druid: 2,
  };

  return classMap[className] || null;
}

// Helper function to get spec ID by name and class ID
function getSpecIdByNameAndClassId(specName, classId) {
  // This is a simplified version - in the real implementation,
  // this should look up the spec ID from the database

  // For now, we'll return a placeholder value
  // The actual implementation would need spec IDs from the database
  return 0; // Placeholder
}

async function validateSplits() {
  const splitValidation = await Promise.all(
    splits.value.map(async (split, index) => {
      const issues = [];

      // Count players in this split to check for duplicates
      const playersInSplit = {};
      for (const char of split.characters) {
        if (!playersInSplit[char.player_id]) {
          playersInSplit[char.player_id] = [];
        }
        playersInSplit[char.player_id].push(char.name);
      }

      // Check for players with multiple characters in the same split
      for (const playerId in playersInSplit) {
        if (playersInSplit[playerId].length > 1) {
          issues.push({
            type: "warning",
            message: `Player ${playerId} has multiple characters in this split: ${playersInSplit[
              playerId
            ].join(", ")}`,
          });
        }
      }

      // Check for hunters in split (must have exactly one)
      const huntersInSplit = split.characters.filter(
        (char) => char.class === "Hunter"
      );
      if (huntersInSplit.length === 0) {
        issues.push({
          type: "error",
          message: `No Hunter in this split - each split requires one Hunter`,
        });
      } else if (huntersInSplit.length > 1) {
        issues.push({
          type: "warning",
          message: `Split has ${huntersInSplit.length} hunters: ${huntersInSplit
            .map((h) => h.name)
            .join(", ")}. Only 1 hunter per split is recommended.`,
        });
      } else {
        issues.push({
          type: "success",
          message: `Has 1 Hunter: ${huntersInSplit[0].name}`,
        });
      }

      // Check tanks
      const tanks = split.characters.filter((c) => c.role === "Tank");
      if (tanks.length < 2) {
        issues.push({
          type: "error",
          message: `Only ${tanks.length} tanks - needs at least 2`,
        });
      } else if (tanks.length > 2) {
        issues.push({
          type: "warning",
          message: `${tanks.length} tanks - ideal is 2`,
        });
      }

      // Check for Blood DK tank
      const hasBloodDK = tanks.some(
        (c) => c.class === "Death Knight" && c.spec === "Blood"
      );
      if (!hasBloodDK) {
        issues.push({
          type: "error",
          message: `No Blood Death Knight tank`,
        });
      }

      // Check healers
      const healers = split.characters.filter((c) => c.role === "Healer");
      if (healers.length < 2) {
        issues.push({
          type: "error",
          message: `Only ${healers.length} healers - needs at least 2`,
        });
      } else if (healers.length > 2) {
        issues.push({
          type: "warning",
          message: `${healers.length} healers - ideal is 2`,
        });
      }

      // Check that healers are of different classes
      const healerClasses = healers.map((c) => c.class);
      const uniqueHealerClasses = new Set(healerClasses);
      if (uniqueHealerClasses.size < healerClasses.length) {
        issues.push({
          type: "error",
          message: `Has healers of the same class`,
        });
      }

      // Check for Ret Paladin or Arcane Mage
      const hasRetPaladin = split.characters.some(
        (c) => c.class === "Paladin" && c.spec === "Retribution"
      );
      const hasArcaneMage = split.characters.some(
        (c) => c.class === "Mage" && c.spec === "Arcane"
      );

      if (!hasRetPaladin && !hasArcaneMage) {
        issues.push({
          type: "error",
          message: `No Retribution Paladin or Arcane Mage for damage buff`,
        });
      } else {
        issues.push({
          type: "success",
          message: `Damage buff covered by ${
            hasRetPaladin ? "Retribution Paladin" : "Arcane Mage"
          }`,
        });
      }

      // Check for buffs
      if (typeof buffProviders !== "undefined") {
        for (const buffName of Object.keys(buffProviders)) {
          // Skip damage buffs as we check specifically for Ret Paladin/Arcane Mage above
          if (
            buffName.includes("5% Damage") ||
            buffName.includes("Damage Increase")
          ) {
            continue;
          }

          const hasBuffCovered = await isBuffCoveredInSplit(buffName, index);
          if (!hasBuffCovered) {
            issues.push({
              type: "warning",
              message: `Missing buff: ${buffName}`,
            });
          } else {
            issues.push({
              type: "success",
              message: `Buff ${buffName} is covered`,
            });
          }
        }
      } else {
        // If buffProviders isn't defined, do a basic check for important buffs
        issues.push({
          type: "info",
          message:
            "Detailed buff coverage validation skipped - run balance first",
        });
      }

      return {
        split_id: index + 1,
        issues: issues,
      };
    })
  );

  validationResults.value = splitValidation;

  // Print warnings for invalid splits
  splitValidation.forEach((result) => {
    const errorIssues = result.issues.filter((issue) => issue.type === "error");
    if (errorIssues.length > 0) {
      console.warn(`Split ${result.split_id} has errors:
        ${errorIssues.map((issue) => issue.message).join(", ")}`);
    }
  });

  // Count how many splits meet all requirements
  const validSplitCount = splitValidation.filter(
    (validation) => !validation.issues.some((issue) => issue.type === "error")
  ).length;

  return {
    totalSplits: splits.value.length,
    validSplits: validSplitCount,
    splitValidation,
  };
}
</script>

<style scoped>
.character-list-enter-active,
.character-list-leave-active {
  transition: all 0.2s ease;
}
.character-list-enter-from,
.character-list-leave-to {
  opacity: 0;
}

.character-item {
  transition: all 0.2s ease;
}

.split-list-enter-active,
.split-list-leave-active {
  transition: all 0.2s ease;
}
.split-list-enter-from,
.split-list-leave-to {
  opacity: 0;
}

.split-item {
  transition: all 0.2s ease;
}

.accordion :deep(.u-accordion-item .u-accordion-item__button) {
  border-radius: 0.5rem;
  background-color: rgba(31, 41, 55, 0.5);
}

.accordion :deep(.u-accordion-item .u-accordion-item__button:hover) {
  background-color: rgba(31, 41, 55, 0.7);
}
</style>
