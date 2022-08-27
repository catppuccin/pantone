import fs from 'fs';
const filedata = fs.readFileSync('./themes.json', {encoding:'utf8', flag:'r'});
// read the themes.json file that contains the catppuccin colors

const themes = JSON.parse(filedata);
// parse the file data to allow for easier manipulation


export default themes
