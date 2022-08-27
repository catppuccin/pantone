import pant from "nearest-pantone"
import themes from "./themeparser.js"
import tableify from "./tableify.js"
import markdowngen from "./markdowngen.js"
// import the pantone library and the theme

let pantoneColors = {}
// initialize the pantone color object


// loop through each flavor
//   loop through each color
//     call the generator.add() function!




for (var key in themes) {
  console.log(key)
  pantoneColors[key] = {}
  for (var key2 in themes[key]) {
    let hex = themes[key][key2]["hex"];
    let themename = key;
    let color = key2;

    let pantone = pant.getClosestColor(hex)
    pantoneColors[themename][color] = pantone
  }
}

pantoneColors["mocha"]["crust"] = {pantone:"?-7547", hex: "#1A2732", name:"mirage"}
// set the crust color on mocha, which for some reason doesn't exist in the pantone module i am using


let tables = tableify(pantoneColors)

let latte = markdowngen('latte', tables[0])
let frappe = markdowngen('frappe', tables[1])
let macchiato = markdowngen('macchiato', tables[2])
let mocha = markdowngen("mocha", tables[3])

console.log(latte, frappe, macchiato, mocha)


