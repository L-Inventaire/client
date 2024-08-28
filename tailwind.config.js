const defaultTheme = require("tailwindcss/defaultTheme");

let shades = [];
[
  "wood",
  "slate",
  "red",
  "orange",
  "green",
  "blue",
  "yellow",
  "rose",
  "purple",
].map((color) => {
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => {
    shades.push(`bg-${color}-${shade}`);
    shades.push(`border-${color}-${shade}`);
    shades.push(`text-${color}-${shade}`);
    shades.push(`dark:bg-${color}-${shade}`);
    shades.push(`dark:border-${color}-${shade}`);
    shades.push(`dark:text-${color}-${shade}`);
  });
});

module.exports = {
  content: ["./src/**/*.{html,js,ts,tsx}"],
  darkMode: "selector",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.07)",
      },
      fontSize: {
        xxs: "9px",
        xs: "11px",
        sm: "12px",
        base: "13px",
        lg: "15px",
        xl: "24px",
      },
      borderRadius: {
        DEFAULT: "5px",
        md: "5px",
        lg: "10px",
        xl: "24px",
      },
      colors: {
        slate: {
          DEFAULT: "#EDEDED",
          25: "#F9F9F9",
          50: "#EDEDED",
          100: "#E0E0E0",
          200: "#C6C6C6",
          300: "#ACACA5",
          400: "#92928C",
          500: "#767673",
          600: "#575753",
          700: "#393935",
          800: "#20201E",
          900: "#11110F",
          950: "#050505",
          990: "#000000",
        },
      },
    },
  },
  safelist: [
    ...Array.from(Array(15)).map((_, a) => "z-[" + (a + 1) + "0]"),
    "w-10",
    "h-10",
    "w-12",
    "h-12",
    "w-14",
    "h-14",
    "w-28",
    "h-28",
    "w-32",
    "h-32",
    "w-10",
    "h-10",
    "z-10",
    "z-20",
    "z-30",
    "z-40",
    "z-50",
    "pl-9",
    "transition-all",
    "bg-gradient-to-r",
    "from-current",
    "to-blue-600",
    "bg-red-100",
    "border-indigo-800",
    "bg-blue-50",
    "text-blue-500",
    "text-indigo-800",
    "border-green-800",
    "bg-green-50",
    "text-green-600",
    "text-green-800",
    "border-red-800",
    "bg-red-50",
    "text-red-600",
    "text-red-800",
    "border-orange-800",
    "bg-orange-50",
    "text-orange-500",
    "text-orange-600",
    "text-orange-800",
    "border-gray-800",
    "bg-gray-50",
    "text-gray-600",
    "text-gray-800",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-blue-400",
    "bg-slate-500",
    "bg-slate-200",
    "text-slate-900",
    "max-w-md",
    "bg-blue-400",
    "bg-emerald-500",
    "bg-purple-500",
    "min-w-full",
    ...shades,
  ],
  plugins: [require("@tailwindcss/forms")],
};
