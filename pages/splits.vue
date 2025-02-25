<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-white">Raid Splits</h1>

    <!-- Split controls -->
    <div class="flex justify-between items-center mb-4">
      <UButton
        color="primary"
        icon="i-heroicons-plus"
        @click="addSplitGroup"
        :loading="loadingStates.addingSplit"
      >
        Add Split Group
      </UButton>
    </div>

    <!-- Empty state -->
    <UCard v-if="splits.length === 0 && !isLoading" class="text-center py-6">
      <UIcon
        name="i-heroicons-user-group"
        class="text-4xl mb-2 text-gray-400"
      />
      <p class="text-gray-400">No raid splits created yet</p>
      <UButton color="primary" class="mt-4" @click="addSplitGroup">
        Create Your First Split
      </UButton>
    </UCard>

    <!-- Loading state -->
    <UCard v-else-if="isLoading" class="text-center py-6">
      <UIcon
        name="i-heroicons-arrow-path"
        class="text-4xl mb-2 text-gray-400 animate-spin"
      />
      <p class="text-gray-400">Loading splits data...</p>
    </UCard>

    <!-- Split groups -->
    <div v-if="!isLoading" class="space-y-6">
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
const isLoading = ref(false);
const players = ref([]);
const characters = ref([]);
const splits = ref([]);
const characterSearch = ref("");
const classFilter = ref("All Classes");
const roleFilter = ref("All Roles");

// Add to state section
const loadingStates = reactive({
  addingSplitCharacter: null, // Will store character ID when adding
  removingCharacter: null, // Will store character ID when removing
  addingSplit: false,
  deletingSplit: null, // Will store split index when deleting
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
