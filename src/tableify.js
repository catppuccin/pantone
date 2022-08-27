import {markdownTable} from 'markdown-table'
// import markdown table


function tableify(data) {
  // generate a table for each theme
  let tables = []
  for (var key in data) {
    // format
    // ctp name | pantone code | pantone name
    let colorlist = [["Catppuccin Color Name", "Pantone Code", "Pantone Color Name"]]
    for (var key2 in data[key]) {
      let speclist = [key2, "`" + data[key][key2]["pantone"] + "`", data[key][key2]["name"]]
      colorlist.push(speclist)
    }

    tables.push(markdownTable(colorlist))
  }
  return tables
}

export default tableify
