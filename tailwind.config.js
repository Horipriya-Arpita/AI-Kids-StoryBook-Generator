/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/theme");

module.exports = {
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

// // // tailwind.config.js
// // const {heroui} = require("@heroui/theme");

// // /** @type {import('tailwindcss').Config} */
// // module.exports = {
// //
//   content: [
//     "//",
//     "./node_modules/@heroui/theme/dist/components/(button|input|modal|ripple|spinner|form).js"
//   ],
// //   theme: {
// //     extend: {},
// //   },
// //   darkMode: "class",
// //   plugins: [heroui()],
// // };

// /** @type {import('tailwindcss').Config} */
// const { heroui } = require("@heroui/theme");

// module.exports = {
//   content: [
//     "./pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./app/**/*.{js,ts,jsx,tsx,mdx}",
//     "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
//     "./node_modules/@heroui/theme/dist/components/(button|input|ripple|spinner|form).js", // Keep the HeroUI paths
//   ],
//   theme: {
//     extend: {
//       colors: {
//         primary: {
//           DEFAULT: "#5253a3",
//         },
//       },
//     },
//   },
//   darkMode: "class",
//   plugins: [
//     heroui({
//       themes: {
//         light: {
//           layout: {},
//           colors: {
//             primary: {
//               DEFAULT: "#5253a3",
//             },
//           },
//         },
//         dark: {
//           layout: {},
//           colors: {},
//         },
//       },
//     }),
//   ],
// };
