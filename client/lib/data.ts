export interface Module {
  id: string;
  label: string;
  value: string;
  icon: string;
  description: string;
  color: string;
}

export const MODULES: Module[] = [
  {
    id: "1",
    label: "Smart Door Lock",
    value: "door-lock",
    icon: "🔐",
    description: "Automatic door unlocking system",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "2",
    label: "Smart Fan",
    value: "smart-fan",
    icon: "🌀",
    description: "Temperature-based fan speed control",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "3",
    label: "Smart Lights",
    value: "smart-lights",
    icon: "💡",
    description: "Automatic lights based on time and presence",
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "4",
    label: "Smart Windows",
    value: "smart-windows",
    icon: "☀️",
    description: "Weather-based automatic window control",
    color: "from-teal-500 to-cyan-500",
  },
];
