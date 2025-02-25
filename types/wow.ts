export interface Player {
  id: string;
  name: string;
  note?: string;
}

export interface Character {
  id: string;
  name: string;
  playerId: string;
  class: WoWClass;
  spec: string;
  role: "Tank" | "Healer" | "DPS";
  isMain?: boolean;
}

export type WoWClass =
  | "Death Knight"
  | "Druid"
  | "Hunter"
  | "Mage"
  | "Paladin"
  | "Priest"
  | "Rogue"
  | "Shaman"
  | "Warlock"
  | "Warrior";

export const WOW_CLASSES: WoWClass[] = [
  "Death Knight",
  "Druid",
  "Hunter",
  "Mage",
  "Paladin",
  "Priest",
  "Rogue",
  "Shaman",
  "Warlock",
  "Warrior",
];

// Display name mapping - these are what the user sees
export const CLASS_SPECS: Record<WoWClass, string[]> = {
  "Death Knight": ["Blood", "Frost", "Unholy"],
  Druid: ["Balance", "Feral", "Guardian", "Restoration"],
  Hunter: ["Beast Mastery", "Marksmanship", "Survival"],
  Mage: ["Arcane", "Fire", "Frost"],
  Paladin: ["Holy", "Protection", "Retribution"],
  Priest: ["Discipline", "Holy", "Shadow"],
  Rogue: ["Assassination", "Combat", "Subtlety"],
  Shaman: ["Elemental", "Enhancement", "Restoration"],
  Warlock: ["Affliction", "Demonology", "Destruction"],
  Warrior: ["Arms", "Fury", "Protection"],
};

export const CLASS_COLORS: Record<WoWClass, string> = {
  "Death Knight": "#C41E3A",
  Druid: "#FF7C0A",
  Hunter: "#AAD372",
  Mage: "#3FC7EB",
  Paladin: "#F48CBA",
  Priest: "#FFFFFF",
  Rogue: "#FFF468",
  Shaman: "#0070DD",
  Warlock: "#8788EE",
  Warrior: "#C69B6D",
};

// Simplified approach - direct mapping of class and spec to role
export const CLASS_SPEC_ROLES: Record<
  WoWClass,
  Record<string, "Tank" | "Healer" | "DPS">
> = {
  "Death Knight": {
    Blood: "Tank",
    Frost: "DPS",
    Unholy: "DPS",
  },
  Druid: {
    Balance: "DPS",
    Feral: "DPS",
    Guardian: "Tank",
    Restoration: "Healer",
  },
  Hunter: {
    "Beast Mastery": "DPS",
    Marksmanship: "DPS",
    Survival: "DPS",
  },
  Mage: {
    Arcane: "DPS",
    Fire: "DPS",
    Frost: "DPS",
  },
  Paladin: {
    Holy: "Healer",
    Protection: "Tank",
    Retribution: "DPS",
  },
  Priest: {
    Discipline: "Healer",
    Holy: "Healer",
    Shadow: "DPS",
  },
  Rogue: {
    Assassination: "DPS",
    Combat: "DPS",
    Subtlety: "DPS",
  },
  Shaman: {
    Elemental: "DPS",
    Enhancement: "DPS",
    Restoration: "Healer",
  },
  Warlock: {
    Affliction: "DPS",
    Demonology: "DPS",
    Destruction: "DPS",
  },
  Warrior: {
    Arms: "DPS",
    Fury: "DPS",
    Protection: "Tank",
  },
};

// Helper function to get the unique spec key
export function getSpecKey(className: WoWClass, specName: string): string {
  // For specs that are unique across classes, just return the name
  const uniqueSpecs = [
    "Balance",
    "Feral",
    "Guardian",
    "Beast Mastery",
    "Marksmanship",
    "Survival",
    "Arcane",
    "Fire",
    "Retribution",
    "Discipline",
    "Shadow",
    "Assassination",
    "Combat",
    "Subtlety",
    "Elemental",
    "Enhancement",
    "Affliction",
    "Demonology",
    "Destruction",
    "Arms",
    "Fury",
  ];

  if (uniqueSpecs.includes(specName)) return specName;

  // For duplicated spec names, append the class
  switch (specName) {
    case "Frost":
      return className === "Death Knight" ? "Frost_DeathKnight" : "Frost_Mage";
    case "Holy":
      return className === "Paladin" ? "Holy_Paladin" : "Holy_Priest";
    case "Protection":
      return className === "Paladin"
        ? "Protection_Paladin"
        : "Protection_Warrior";
    case "Restoration":
      return className === "Druid" ? "Restoration_Druid" : "Restoration_Shaman";
    default:
      return specName;
  }
}
