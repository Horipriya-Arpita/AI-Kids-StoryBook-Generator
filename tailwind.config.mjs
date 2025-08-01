/** @type {import('tailwindcss').Config} */
import { heroui } from "@heroui/theme";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5253a3",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          layout: {},
          colors: {
            primary: {
              DEFAULT: "#5253a3",
            },
          },
        },
        dark: {
          layout: {},
          colors: {},
        },
      },
    }),
  ],
};


// /** @type {import('tailwindcss').Config} */
// const {heroui} = require("@heroui/theme");

// export default {
//   content: [
//     "./pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./app/**/*.{js,ts,jsx,tsx,mdx}",
//     "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         // background: "var(--background)",
//         // foreground: "var(--foreground)",
//       },
//     },
//     darkMode: "class",
//   },
//   plugins: [
//     heroui({
//     themes: {
//       light: {
//         layout: {},
//         colors: {
//           primary: {
//             DEFAULT: "#5253a3"
//           }
//         }
//       },
//       dark: {
//         layout: {},
//         colors: {}
//       },
//     }
//   }
//   )],
// };
