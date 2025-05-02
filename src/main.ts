import { flavorEntries } from "@catppuccin/palette";
import { Buffer } from "node:buffer";
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";

type PantoneColors = {
  [flavor: string]: {
    name: string;
    emoji: string;
    colors: {
      [color: string]: {
        name: string;
        hex: string;
        pantone: {
          name: string;
          hex: string;
          tcx: string;
        };
      };
    };
  };
};

const generateImages = (colors: PantoneColors) => {
  Object.entries(colors).forEach(([flavorName, flavor]) => {
    Object.entries(flavor.colors).forEach(([colorName, color]) => {
      const svg = `<svg width="100" height="100">
          <rect x="0" y="0" width="50" height="100" style="fill:${color.hex}" />
          <rect x="50" y="0" width="50" height="100" style="fill:${color.pantone.hex}" />
        </svg>`;
      sharp(Buffer.from(svg))
        .webp()
        .toBuffer()
        .then((data) => {
          writeFileSync(`assets/${flavorName}/${colorName}-compare.webp`, data);
        })
        .catch((err) => {
          console.error(
            `Error generating image for ${flavorName}-${colorName}:`,
            err
          );
        });
    });
  });
};

const getPantoneColors = async (): Promise<PantoneColors> => {
  const pantoneMappings = JSON.parse(
    await readFile("src/mappings.json", { encoding: "utf8" })
  );
  return Object.fromEntries(
    flavorEntries.map(([flavorName, flavor]) => [
      flavorName,
      {
        name: flavor.name,
        emoji: flavor.emoji,
        colors: Object.fromEntries(
          flavor.colorEntries.map(([colorName, color]) => [
            colorName,
            {
              name: color.name,
              hex: color.hex,
              pantone: {
                name: pantoneMappings[flavorName]["colors"][colorName]["name"],
                hex: pantoneMappings[flavorName]["colors"][colorName][
                  "pantone"
                ],
                tcx: pantoneMappings[flavorName]["colors"][colorName]["tcx"],
              },
            },
          ])
        ),
      },
    ])
  );
};

const generateReadme = (pantoneColors: PantoneColors) => {
  const readmeData = Object.entries(pantoneColors).reduce(
    (acc, [flavorName, flavor]) => {
      const tableHeader = `| Catppuccin Color | Pantone Color | Comparision |
| --- | --- | --- |`;

      const table = Object.entries(flavor.colors).reduce(
        (acc, [colorName, color]) => {
          return (
            acc +
            `| ${color.name} | ${color.pantone.name} (\`${color.pantone.tcx}\` / \`${color.pantone.hex}\`) | ![](./assets/${flavorName}/${colorName}-compare.webp) |\n`
          );
        },
        ""
      );

      return (
        acc +
        `\n<details>
<summary>${flavor.emoji}${flavor.name}</summary>

${[tableHeader, table].join("\n")}
</details>`
      );
    },
    ""
  );

  console.log(readmeData);
};

const pantoneColors = await getPantoneColors();
generateImages(pantoneColors);
generateReadme(pantoneColors);
