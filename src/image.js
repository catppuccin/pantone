import fs from "fs";
import sharp from "sharp";

function comparimage(flavor, colorname, colorhex, pantonehex) {

	const svg = `
<svg width="100" height="100">
  <rect x="0" y="0" width="50" height="100" style="fill:${colorhex}" />
  <rect x="50" y="0" width="50" height="100" style="fill:${pantonehex}" />
</svg>`;

	sharp(Buffer.from(svg))
		.png()
		.toBuffer()
		.then((data) => {
			fs.writeFileSync('../assets/' + flavor + "-" + colorname + "-compare.png", data);
		})
		.catch((err) => {
			console.log(err);
		});
}

export default comparimage
