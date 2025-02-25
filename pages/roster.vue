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
          :options="['All Classes', ...WOW_CLASSES]"
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
                :loading="isSubmitting"
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
                :options="WOW_CLASSES"
                placeholder="Select class"
              />
            </UFormGroup>

            <UFormGroup label="Specialization" name="spec">
              <USelect
                v-model="characterForm.spec"
                :options="
                  characterForm.class ? CLASS_SPECS[characterForm.class] : []
                "
                placeholder="Select specialization"
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

    <!-- Loading state -->
    <UCard v-if="isLoading" class="text-center py-6">
      <UIcon
        name="i-heroicons-arrow-path"
        class="text-4xl mb-2 text-gray-400 animate-spin"
      />
      <p class="text-gray-400">Loading roster data...</p>
    </UCard>

    <!-- Empty state -->
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
            <h3 class="text-lg font-semibold truncate">{{ player.name }}</h3>
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
            :class="{ 'border-l-2 border-l-amber-500': char.isMain }"
          >
            <div class="flex flex-col">
              <div class="flex justify-between items-start">
                <span class="font-bold text-sm truncate">{{ char.name }}</span>
                <UBadge v-if="char.isMain" color="amber" size="xs" class="ml-1">
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
  WOW_CLASSES,
  CLASS_SPECS,
  CLASS_COLORS,
  CLASS_SPEC_ROLES,
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
const isLoading = ref(false);
const isSubmitting = ref(false);

// Form state
const playerForm = reactive({
  name: "",
  note: "",
});

const characterForm = reactive({
  playerId: "",
  name: "",
  class: "",
  spec: "",
  isMain: false,
});

// Filters
const classFilter = ref("All Classes");
const roleFilter = ref("All Roles");

// Computed properties
const canAddCharacter = computed(() => {
  return (
    characterForm.playerId &&
    characterForm.name &&
    characterForm.class &&
    characterForm.spec
  );
});

// Helper functions to get characters for a player
function getPlayerCharacters(playerId) {
  return characters.value.filter((char) => char.playerId === playerId);
}

function getFilteredPlayerCharacters(playerId) {
  let result = getPlayerCharacters(playerId);

  if (classFilter.value !== "All Classes") {
    result = result.filter((char) => char.class === classFilter.value);
  }

  if (roleFilter.value !== "All Roles") {
    result = result.filter((char) => char.role === roleFilter.value);
  }

  return result;
}

// Methods
function openAddPlayerForm() {
  isAddingCharacter.value = false;
  showAddForm.value = true;
}

function openAddCharacterForm(playerId = null) {
  if (players.value.length === 0) {
    return toast.add({
      title: "No Players",
      description: "Please add a player first before adding characters.",
      color: "amber",
      icon: "i-heroicons-exclamation-triangle",
      timeout: 3000,
    });
  }

  isAddingCharacter.value = true;

  // Reset the form first
  characterForm.playerId = "";
  characterForm.name = "";
  characterForm.class = "";
  characterForm.spec = "";
  characterForm.isMain = false;

  if (playerId) {
    characterForm.playerId = playerId;
  } else if (players.value.length === 1) {
    // Auto-select the only player
    characterForm.playerId = players.value[0].id;
  }

  showAddForm.value = true;
}

async function addPlayer() {
  if (!playerForm.name) return;

  try {
    isSubmitting.value = true;

    const newPlayerId = uuidv4();

    const { error } = await supabase.from("players").insert({
      id: newPlayerId,
      user_id: user.value.id,
      name: playerForm.name,
      note: playerForm.note || null,
    });

    if (error) throw error;

    // Add to local state after successful DB insertion
    players.value.push({
      id: newPlayerId,
      name: playerForm.name,
      note: playerForm.note || "",
    });

    // Reset form
    playerForm.name = "";
    playerForm.note = "";

    // Close modal
    showAddForm.value = false;

    toast.add({
      title: "Player Added",
      description: `${playerForm.name} has been added to your roster.`,
      color: "green",
      icon: "i-heroicons-check-circle",
      timeout: 3000,
    });
  } catch (error) {
    toast.add({
      title: "Error",
      description: `Failed to add player: ${error.message}`,
      color: "red",
      timeout: 5000,
    });
  } finally {
    isSubmitting.value = false;
  }
}

async function addCharacter() {
  if (!canAddCharacter.value) return;

  try {
    isSubmitting.value = true;

    const newCharacterId = uuidv4();
    const role = CLASS_SPEC_ROLES[characterForm.class][characterForm.spec];

    // If this is marked as main, unmark other characters from the same player in DB
    if (characterForm.isMain) {
      const { error: updateError } = await supabase
        .from("characters")
        .update({ is_main: false })
        .eq("player_id", characterForm.playerId);

      if (updateError) throw updateError;

      // Also update in local state
      characters.value.forEach((char) => {
        if (char.playerId === characterForm.playerId) {
          char.isMain = false;
        }
      });
    }

    // Insert new character
    const { error } = await supabase.from("characters").insert({
      id: newCharacterId,
      player_id: characterForm.playerId,
      name: characterForm.name,
      class: characterForm.class,
      spec: characterForm.spec,
      role: role,
      is_main: characterForm.isMain,
    });

    if (error) throw error;

    // Add to local state after successful DB insertion
    const newCharacter = {
      id: newCharacterId,
      playerId: characterForm.playerId,
      name: characterForm.name,
      class: characterForm.class,
      spec: characterForm.spec,
      role,
      isMain: characterForm.isMain,
    };

    characters.value.push(newCharacter);

    // Reset form
    characterForm.playerId = "";
    characterForm.name = "";
    characterForm.class = "";
    characterForm.spec = "";
    characterForm.isMain = false;

    // Close modal
    showAddForm.value = false;

    toast.add({
      title: "Character Added",
      description: `${newCharacter.name} (${newCharacter.class} - ${newCharacter.spec}) has been added to your roster.`,
      color: "green",
      icon: "i-heroicons-check-circle",
      timeout: 3000,
    });
  } catch (error) {
    toast.add({
      title: "Error",
      description: `Failed to add character: ${error.message}`,
      color: "red",
      timeout: 5000,
    });
  } finally {
    isSubmitting.value = false;
  }
}

async function deletePlayer(player) {
  if (
    confirm(
      `Are you sure you want to delete ${player.name}? This will also delete all of their characters.`
    )
  ) {
    try {
      isLoading.value = true;

      // First delete all characters associated with this player
      const { error: charError } = await supabase
        .from("characters")
        .delete()
        .eq("player_id", player.id);

      if (charError) throw charError;

      // Then delete the player
      const { error } = await supabase
        .from("players")
        .delete()
        .eq("id", player.id)
        .eq("user_id", user.value.id); // Safety check

      if (error) throw error;

      // Update local state
      players.value = players.value.filter((p) => p.id !== player.id);
      characters.value = characters.value.filter(
        (c) => c.playerId !== player.id
      );

      toast.add({
        title: "Player Deleted",
        description: `${player.name} and all their characters have been removed.`,
        color: "red",
        icon: "i-heroicons-trash",
        timeout: 3000,
      });
    } catch (error) {
      toast.add({
        title: "Error",
        description: `Failed to delete player: ${error.message}`,
        color: "red",
        timeout: 5000,
      });
    } finally {
      isLoading.value = false;
    }
  }
}

async function deleteCharacter(character) {
  if (confirm(`Are you sure you want to delete ${character.name}?`)) {
    try {
      isLoading.value = true;

      const { error } = await supabase
        .from("characters")
        .delete()
        .eq("id", character.id);

      if (error) throw error;

      // Update local state
      characters.value = characters.value.filter((c) => c.id !== character.id);

      toast.add({
        title: "Character Deleted",
        description: `${character.name} has been removed.`,
        color: "red",
        icon: "i-heroicons-trash",
        timeout: 3000,
      });
    } catch (error) {
      toast.add({
        title: "Error",
        description: `Failed to delete character: ${error.message}`,
        color: "red",
        timeout: 5000,
      });
    } finally {
      isLoading.value = false;
    }
  }
}

async function clearAllData() {
  if (
    confirm(
      "Are you sure you want to delete all players and characters? This cannot be undone."
    )
  ) {
    try {
      isLoading.value = true;

      // Delete all characters for this user's players
      const { error: charError } = await supabase
        .from("characters")
        .delete()
        .in(
          "player_id",
          players.value.map((p) => p.id)
        );

      if (charError) throw charError;

      // Delete all players for this user
      const { error } = await supabase
        .from("players")
        .delete()
        .eq("user_id", user.value.id);

      if (error) throw error;

      // Clear local state
      players.value = [];
      characters.value = [];

      toast.add({
        title: "Roster Cleared",
        description: "All players and characters have been removed.",
        color: "red",
        icon: "i-heroicons-trash",
        timeout: 3000,
      });
    } catch (error) {
      toast.add({
        title: "Error",
        description: `Failed to clear roster: ${error.message}`,
        color: "red",
        timeout: 5000,
      });
    } finally {
      isLoading.value = false;
    }
  }
}

function getPlayerName(playerId) {
  const player = players.value.find((p) => p.id === playerId);
  return player ? player.name : "Unknown";
}

function getPlayerCharacterCount(playerId) {
  return characters.value.filter((c) => c.playerId === playerId).length;
}

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

async function loadData() {
  if (!user.value) return;

  try {
    isLoading.value = true;

    // Load players
    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("user_id", user.value.id);

    if (playerError) throw playerError;

    // Map DB fields to our local data structure
    players.value = playerData.map((p) => ({
      id: p.id,
      name: p.name,
      note: p.note || "",
    }));

    // If we have players, load their characters
    if (players.value.length > 0) {
      const { data: characterData, error: characterError } = await supabase
        .from("characters")
        .select("*")
        .in(
          "player_id",
          players.value.map((p) => p.id)
        );

      if (characterError) throw characterError;

      // Map DB fields to our local data structure
      characters.value = characterData.map((c) => ({
        id: c.id,
        playerId: c.player_id,
        name: c.name,
        class: c.class,
        spec: c.spec,
        role: c.role,
        isMain: c.is_main,
      }));
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
</script>
