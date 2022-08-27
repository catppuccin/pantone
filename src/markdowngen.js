const emoji = {latte:"🌻 ", frappe:"🪴 ", macchiato:"🌺 ", mocha:"🌿 "}

function gen(name, contents) {
	const themeName = name
	const themeEmoji = emoji[themeName]

	let mark = `
	<details>
		<summary>${themeEmoji}${themeName}</summary>
		${contents}
	</details>
	`
	return mark
}

export default gen
