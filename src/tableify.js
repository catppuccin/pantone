import {markdownTable} from 'markdown-table'
import comparimage from './image.js'
// import markdown table


function tableify(data) {
  // generate a table for each theme
  let tables = []
  for (var key in data) {
    // format
    // ctp name | pantone code | pantone name
    let colorlist = [["Comparison (pantone on the right)", "Catppuccin Color Name", "Pantone Code", "Pantone Color Name"]]
    for (var key2 in data[key]) {

	  let imagepath = comparimage(key, key2, data[key][key2]["hex"], data[key][key2]["pantone"]["hex"])
      let speclist = ["![](" + imagepath + ")" ,key2, "`" + data[key][key2]["pantone"]["pantone"] + "`", data[key][key2]["pantone"]["name"]]
      colorlist.push(speclist)
    }

    tables.push(markdownTable(colorlist))
  }
  return tables
}

export default tableify
