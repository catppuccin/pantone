import { flavorEntries } from "@catppuccin/palette";
import { Buffer } from "node:buffer";
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const root = path.dirname(fileURLToPath(import.meta.url));

const updateReadme = (
  readme: string,
  newContent: string,
  options: {
    section?: string;
    preamble?: string;
    markers?: {
      start: string;
      end: string;
    };
  } = {}
): string => {
  const {
    section = "",
    preamble = "<!-- the following section is auto-generated, do not edit -->",
    markers = {
      start: `<!-- AUTOGEN${
        section !== "" ? `:${section.toUpperCase()}` : ""
      } START -->`,
      end: `<!-- AUTOGEN${
        section !== "" ? `:${section.toUpperCase()}` : ""
      } END -->`,
    },
  } = options;
  const wrapped = [markers.start, preamble, newContent, markers.end].join("\n");

  Object.values(markers).map((m) => {
    if (!readme.includes(m)) {
      throw new Error(`Marker ${m} not found in README.md`);
    }
  });

  const pre = readme.split(markers.start)[0];
  const end = readme.split(markers.end)[1];
  return pre + wrapped + end;
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
        .then(async (data) => {
          const imagePath = path.join(
            root,
            `../assets/${flavorName}/${colorName}-compare.webp`
          );
          await writeFile(imagePath, data);
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
    await readFile(path.join(root, "mappings.json"), { encoding: "utf8" })
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

const generateTable = (pantoneColors: PantoneColors) => {
  return Object.entries(pantoneColors)
    .map(([flavorName, flavor]) => {
      const tableHeader = [
        "| Catppuccin Color | Pantone Color | Comparison |",
        "| --- | --- | --- |",
      ].join("\n");

      const tableRows = Object.entries(flavor.colors)
        .map(([colorName, color]) => {
          const pantoneInfo = `${color.pantone.name} (\`${color.pantone.tcx}\` / \`${color.pantone.hex}\`)`;
          const imageLink = `![](./assets/${flavorName}/${colorName}-compare.webp)`;
          return `| ${color.name} | ${pantoneInfo} | ${imageLink} |`;
        })
        .join("\n");

      return [
        "<details>",
        `<summary>${flavor.emoji} ${flavor.name}</summary>`,
        "",
        tableHeader,
        tableRows,
        "",
        "</details>",
      ].join("\n");
    })
    .join("\n");
};

const pantoneColors = await getPantoneColors();
generateImages(pantoneColors);
const pantoneTable = generateTable(pantoneColors);
const readmePath = path.join(root, "../README.md");
let readmeContent = await readFile(readmePath, "utf-8");
try {
  readmeContent = updateReadme(readmeContent, pantoneTable);
} catch (err) {
  console.error("Failed to update README", err);
} finally {
  await writeFile(readmePath, readmeContent);
}
