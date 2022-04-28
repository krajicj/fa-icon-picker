# This is parser for the font awesome icons pack

### This script filters the category file to remove icons which are not present in the current version and type (solid,duotone etc)

### All available icons are in the icons.yaml

### Output file is used for the icon picker

1. You have to convert yaml metadata files to the json (https://jsonformatter.org/yaml-to-json)

2. Convert categories yaml and icons yaml from the downloaded web version of font awesome, files are in dir metadata

3. Move files to this folder and change the sources in the parser.js then run the script with node (you have to be in this folder to run it)
