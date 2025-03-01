<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-white">Raid Roster</h1>

    <div class="flex justify-between items-center mb-4">
      <div>
        <UButton
          color="primary"
          icon="i-heroicons-plus"
          @click="openAddPlayerForm"
          :loading="isLoading"
        >
          Add Player
        </UButton>
        <UButton
          v-if="players.length > 0"
          color="red"
          variant="soft"
          icon="i-heroicons-trash"
          class="ml-2"
          @click="clearAllData"
          :loading="isLoading"
        />
      </div>

      <div class="flex flex-wrap gap-2">
        <USelect
          v-model="classFilter"
          :options="classFilterOptions"
          placeholder="Filter by class"
          size="sm"
          class="w-36"
        />
        <USelect
          v-model="roleFilter"
          :options="['All Roles', 'Tank', 'Healer', 'DPS']"
          placeholder="Filter by role"
          size="sm"
          class="w-32"
        />
      </div>
    </div>

    <!-- Add Player/Character Form Modal -->
    <UModal v-model="showAddForm" :overlay="true">
      <UCard class="max-w-xl w-full">
        <template #header>
          <h2 class="text-xl font-bold">
            {{ isAddingCharacter ? "Add Character" : "Add Player" }}
          </h2>
        </template>

        <!-- Add Player Form -->
        <div v-if="!isAddingCharacter">
          <UForm :state="playerForm" @submit="addPlayer">
            <UFormGroup label="Player Name" name="name">
              <UInput
                v-model="playerForm.name"
                placeholder="Enter player name"
              />
            </UFormGroup>

            <UFormGroup label="Notes" name="notes">
              <UInput
                v-model="playerForm.note"
                placeholder="Optional notes about this player"
              />
            </UFormGroup>

            <div class="mt-6 flex flex-row justify-between">
              <UButton
                type="submit"
                color="primary"
                :disabled="!playerForm.name"
                :loading="isSubmitting || isLoading"
              >
                Add Player
              </UButton>
              <UButton @click="showAddForm = false" color="gray">
                Cancel
              </UButton>
            </div>
          </UForm>
        </div>

        <!-- Add Character Form -->
        <div v-else>
          <UForm :state="characterForm" @submit="addCharacter">
            <UFormGroup
              v-if="!characterForm.playerId"
              label="Player"
              name="playerId"
            >
              <USelect
                v-model="characterForm.playerId"
                :options="players.map((p) => ({ label: p.name, value: p.id }))"
                placeholder="Select player"
              />
            </UFormGroup>

            <UFormGroup label="Character Name" name="name">
              <UInput
                v-model="characterForm.name"
                placeholder="Enter character name"
              />
            </UFormGroup>

            <UFormGroup label="Class" name="class">
              <USelect
                v-model="characterForm.class"
                :options="classFilterOptions.slice(1)"
                placeholder="Select class"
              />
            </UFormGroup>

            <UFormGroup label="Specialization" name="spec">
              <USelect
                v-model="characterForm.spec"
                :options="specOptions"
                placeholder="Select spec"
                :disabled="!characterForm.class"
              />
            </UFormGroup>

            <UFormGroup name="isMain" class="mt-2">
              <UCheckbox
                v-model="characterForm.isMain"
                label="Main Character"
              />
            </UFormGroup>

            <div class="mt-6 flex flex-row justify-between">
              <UButton
                type="submit"
                color="primary"
                :disabled="!canAddCharacter"
                :loading="isSubmitting"
              >
                Add Character
              </UButton>
              <UButton @click="showAddForm = false" color="gray">
                Cancel
              </UButton>
            </div>
          </UForm>
        </div>
      </UCard>
    </UModal>

    <!-- Loading state - this needs to be first in the condition sequence -->
    <UCard v-if="isLoading" class="text-center py-6">
      <UIcon
        name="i-heroicons-arrow-path"
        class="text-4xl mb-2 text-gray-400 animate-spin"
      />
      <p class="text-gray-400">Loading roster data...</p>
    </UCard>

    <!-- Empty state - only show this when we're done loading and there are no players -->
    <UCard v-else-if="players.length === 0" class="text-center py-6">
      <UIcon
        name="i-heroicons-user-group"
        class="text-4xl mb-2 text-gray-400"
      />
      <p class="text-gray-400">No players added yet</p>
      <UButton color="primary" class="mt-4" @click="openAddPlayerForm">
        Add Your First Player
      </UButton>
    </UCard>

    <!-- Player cards with their characters -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="player in players" :key="player.id" class="h-full">
        <div class="flex justify-between items-center mb-3">
          <div class="overflow-hidden">
            <h3 class="text-lg font-semibold truncate">
              <div class="flex flex-row gap-1">
                {{ player.name }}
                <UBadge
                  :color="player.active === false ? 'red' : 'green'"
                  size="sm"
                  class="ml-1"
                >
                  {{ player.active === false ? "Inactive" : "Active" }}
                </UBadge>
                <UTooltip text="Toggle active status" class="my-auto">
                  <UToggle
                    v-model="player.active"
                    color="primary"
                    size="sm"
                    @change="togglePlayerActive(player)"
                    :loading="activeLoadingStates[player.id]"
                  />
                </UTooltip>
              </div>
            </h3>
            <p v-if="player.note" class="text-xs text-gray-400 truncate mt-0.5">
              {{ player.note }}
            </p>
          </div>
          <div class="flex gap-1">
            <UButton
              color="primary"
              variant="soft"
              icon="i-heroicons-plus"
              size="xs"
              @click="openAddCharacterForm(player.id)"
              :disabled="isLoading"
            />
            <UButton
              color="red"
              variant="ghost"
              icon="i-heroicons-trash"
              size="xs"
              @click="deletePlayer(player)"
              :disabled="isLoading"
            />
          </div>
        </div>

        <div
          v-if="getPlayerCharacters(player.id).length === 0"
          class="text-center py-3 bg-gray-800 bg-opacity-50 rounded-lg"
        >
          <p class="text-sm text-gray-400">No characters</p>
          <UButton
            color="primary"
            size="xs"
            class="mt-1"
            @click="openAddCharacterForm(player.id)"
          >
            Add Character
          </UButton>
        </div>

        <div v-else class="grid grid-cols-2 gap-2">
          <div
            v-for="char in getFilteredPlayerCharacters(player.id)"
            :key="char.id"
            class="p-2 rounded-lg border border-gray-700 relative"
            :class="{ 'border-l-2 border-l-amber-500': char.is_main }"
          >
            <div class="flex flex-col">
              <div class="flex justify-between items-start">
                <span class="font-bold text-sm truncate">{{ char.name }}</span>
                <UBadge
                  v-if="char.is_main"
                  color="amber"
                  size="xs"
                  class="ml-1"
                >
                  M
                </UBadge>
              </div>

              <div class="flex items-center mt-1 text-xs">
                <span
                  :style="{ color: CLASS_COLORS[char.class] }"
                  class="font-medium truncate"
                >
                  {{ char.class }}
                </span>
                <span class="text-gray-400 ml-1 truncate"
                  >• {{ char.spec }}</span
                >
              </div>
            </div>

            <div class="flex justify-between items-center mt-1.5">
              <UBadge :color="getRoleBadgeColor(char.role)" size="xs">
                {{ char.role }}
              </UBadge>

              <UButton
                color="red"
                variant="ghost"
                icon="i-heroicons-trash"
                size="2xs"
                class="h-5 w-5"
                @click="deleteCharacter(char)"
                :disabled="isLoading"
              />
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
import {
  CLASS_COLORS,
  CLASS_SPEC_ROLES,
  WOW_CLASSES,
  CLASS_SPECS,
} from "~/types/wow";

definePageMeta({
  middleware: "auth",
});

// Get Supabase client and user
const supabase = useSupabaseClient();
const user = useSupabaseUser();

// State
const players = ref([]);
const characters = ref([]);
const toast = useToast();
const showAddForm = ref(false);
const isAddingCharacter = ref(false);
const isLoading = ref(true);
const isSubmitting = ref(false);
const classFilter = ref("All Classes");
const roleFilter = ref("All Roles");
const activeLoadingStates = ref({}); // To track loading state for active toggles

// Form state
const playerForm = reactive({
  name: "",
  note: "",
});

const characterForm = reactive({
  name: "",
  class: "",
  spec: "",
  isMain: false,
});

// New state for WoW data
const dbWowClasses = ref([]);
const dbWowSpecs = ref([]);

// Fetch WoW data from the database on page load
async function fetchWowData(setLoadingState = true) {
  try {
    if (setLoadingState) isLoading.value = true;

    // Get classes
    const { data: classData, error: classError } = await supabase
      .from("wow_classes")
      .select("*")
      .order("name");

    if (classError) throw classError;
    dbWowClasses.value = classData;

    // Get specs
    const { data: specData, error: specError } = await supabase
      .from("wow_specs")
      .select("*, wow_classes(name)")
      .order("name");

    if (specError) throw specError;
    dbWowSpecs.value = specData;
  } catch (error) {
    console.error("Error fetching WoW data:", error);
    toast.add({
      title: "Error",
      description: "Failed to load WoW data",
      color: "red",
    });
  } finally {
    if (setLoadingState) isLoading.value = false;
  }
}

const canAddPlayer = computed(() => playerForm.name.trim() !== "");

const canAddCharacter = computed(
  () =>
    characterForm.name.trim() !== "" &&
    characterForm.class !== "" &&
    characterForm.spec !== ""
);

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

// Get player characters
function getPlayerCharacters(playerId) {
  return characters.value.filter((c) => c.player_id === playerId);
}

// Get filtered player characters
function getFilteredPlayerCharacters(playerId) {
  // Filter characters by player ID
  let filtered = getPlayerCharacters(playerId);

  // Apply class filter if set
  if (classFilter.value !== "All Classes") {
    filtered = filtered.filter((c) => c.class === classFilter.value);
  }

  // Apply role filter if set
  if (roleFilter.value !== "All Roles") {
    filtered = filtered.filter((c) => c.role === roleFilter.value);
  }

  return filtered;
}

// Delete player
async function deletePlayer(player) {
  try {
    if (
      !confirm(
        `Are you sure you want to delete ${player.name} and all their characters?`
      )
    ) {
      return;
    }

    isLoading.value = true;

    // First delete all characters for this player
    const playerChars = getPlayerCharacters(player.id);
    for (const char of playerChars) {
      await deleteCharacter(char, false); // false = don't reload data yet
    }

    // Then delete the player
    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", player.id);

    if (error) throw error;

    toast.add({
      title: "Player Deleted",
      description: `${player.name} has been deleted`,
      color: "green",
    });

    await loadData();
  } catch (error) {
    toast.add({
      title: "Error",
      description: error.message,
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
}

// Delete character
async function deleteCharacter(character, reload = true) {
  try {
    if (
      reload &&
      !confirm(`Are you sure you want to delete ${character.name}?`)
    ) {
      return;
    }

    if (reload) isLoading.value = true;

    const { error } = await supabase
      .from("characters")
      .delete()
      .eq("id", character.id);

    if (error) throw error;

    if (reload) {
      toast.add({
        title: "Character Deleted",
        description: `${character.name} has been deleted`,
        color: "green",
      });

      await loadData();
    }
  } catch (error) {
    if (reload) {
      toast.add({
        title: "Error",
        description: error.message,
        color: "red",
      });
    }
  } finally {
    if (reload) isLoading.value = false;
  }
}

// Add Player
async function addPlayer() {
  try {
    isSubmitting.value = true;

    const { error } = await supabase.from("players").insert([
      {
        id: uuidv4(),
        name: playerForm.name.trim(),
        note: playerForm.note.trim() || null,
        user_id: user.value.id,
        active: true, // New players are active by default
      },
    ]);

    if (error) throw error;

    toast.add({
      title: "Player Added",
      description: `${playerForm.name} has been added to your roster`,
      color: "green",
    });

    showAddForm.value = false;
    await loadData();
  } catch (error) {
    toast.add({
      title: "Error",
      description: `Failed to add player: ${error.message}`,
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
}

// Add Character
async function addCharacter() {
  try {
    isSubmitting.value = true;

    // Get role from spec
    const role = getCharacterRole(characterForm.class, characterForm.spec);

    const { error } = await supabase.from("characters").insert([
      {
        id: uuidv4(),
        name: characterForm.name.trim(),
        class: characterForm.class,
        spec: characterForm.spec,
        role: role,
        is_main: characterForm.isMain,
        player_id: characterForm.playerId,
      },
    ]);

    if (error) throw error;

    toast.add({
      title: "Character Added",
      description: `${characterForm.name} has been added`,
      color: "green",
    });

    showAddForm.value = false;
    await loadData();
  } catch (error) {
    toast.add({
      title: "Error",
      description: `Failed to add character: ${error.message}`,
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
}

// Handle form submission
function handleFormSubmit() {
  if (isAddingCharacter.value) {
    addCharacter();
  } else {
    addPlayer();
  }
}

// Confirm and clear all data
async function clearAllData() {
  if (
    !confirm(
      "Are you sure you want to delete ALL players and characters? This cannot be undone."
    )
  ) {
    return;
  }

  try {
    isLoading.value = true;

    // Get the player IDs for the current user
    const { data: playerData, error: playerQueryError } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", user.value.id);

    if (playerQueryError) throw playerQueryError;

    const playerIds = playerData.map((player) => player.id);

    // Only try to delete characters if we have players
    if (playerIds.length > 0) {
      // Delete all characters for these players
      const { error: charError } = await supabase
        .from("characters")
        .delete()
        .in("player_id", playerIds);

      if (charError) throw charError;
    }

    // Delete all players
    const { error: playerError } = await supabase
      .from("players")
      .delete()
      .eq("user_id", user.value.id);

    if (playerError) throw playerError;

    toast.add({
      title: "Data Cleared",
      description: "All players and characters have been deleted",
      color: "green",
    });

    await loadData();
  } catch (error) {
    toast.add({
      title: "Error",
      description: error.message,
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
}

// Functions for opening forms
function openAddPlayerForm() {
  isAddingCharacter.value = false;
  playerForm.name = "";
  playerForm.note = "";
  showAddForm.value = true;
}

function openAddCharacterForm(playerId) {
  isAddingCharacter.value = true;
  characterForm.name = "";
  characterForm.class = "";
  characterForm.spec = "";
  characterForm.isMain = false;
  characterForm.playerId = playerId;
  showAddForm.value = true;
}

// Computed class options for filters
const classFilterOptions = computed(() => {
  // Use the DB classes if available, otherwise fall back to the static import
  if (dbWowClasses.value && dbWowClasses.value.length > 0) {
    return ["All Classes", ...dbWowClasses.value.map((c) => c.name)];
  }
  return ["All Classes", ...WOW_CLASSES];
});

// Computed spec options that depend on selected class
const specOptions = computed(() => {
  if (!characterForm.class) return [];

  // Use DB specs if available
  if (dbWowSpecs.value && dbWowSpecs.value.length > 0) {
    const classId = dbWowClasses.value.find(
      (c) => c.name === characterForm.class
    )?.id;
    if (classId) {
      return dbWowSpecs.value
        .filter((spec) => spec.class_id === classId)
        .map((spec) => spec.name);
    }
  }

  // Fall back to static data
  return CLASS_SPECS[characterForm.class] || [];
});

// Get character role from class and spec
function getCharacterRole(charClass, charSpec) {
  if (!charClass || !charSpec) return "DPS";
  return CLASS_SPEC_ROLES[charClass]?.[charSpec] || "DPS";
}

// Get color for class
function getClassColor(className) {
  return CLASS_COLORS[className] || "#FFFFFF";
}

// Update your loadData function to also fetch player data
async function loadData() {
  try {
    isLoading.value = true;

    // Load everything sequentially to avoid race conditions
    await fetchWowData(false); // Pass false to prevent fetchWowData from modifying isLoading

    // Then load players data for the current user
    const { data: playersData, error: playersError } = await supabase
      .from("players")
      .select("*")
      .eq("user_id", user.value.id)
      .order("name");

    if (playersError) throw playersError;
    players.value = playersData || [];

    // If we have players, load their characters
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
  } catch (error) {
    toast.add({
      title: "Error",
      description: `Failed to load roster data: ${error.message}`,
      color: "red",
      timeout: 5000,
    });
  } finally {
    isLoading.value = false;
  }
}

// Load data on page mount
onMounted(() => {
  loadData();
});

// Reset character spec when class changes
watch(
  () => characterForm.class,
  (newClass) => {
    characterForm.spec = "";
  }
);

// Add function to toggle player active status
async function togglePlayerActive(player) {
  try {
    // Set loading state for this specific player
    activeLoadingStates.value[player.id] = true;

    // Update the player in the database
    const { error } = await supabase
      .from("players")
      .update({ active: player.active })
      .eq("id", player.id);

    if (error) throw error;

    toast.add({
      title: player.active ? "Player Activated" : "Player Deactivated",
      description: `${player.name} is now ${
        player.active ? "active" : "inactive"
      }`,
      color: "green",
    });
  } catch (error) {
    // Revert the change on error
    player.active = !player.active;

    toast.add({
      title: "Error",
      description: `Failed to update player status: ${error.message}`,
      color: "red",
    });
  } finally {
    activeLoadingStates.value[player.id] = false;
  }
}
</script>
