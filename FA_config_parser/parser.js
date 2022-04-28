/*!
 * @author Jan Krajíc
 * 
 * FA Icon picker by @krajicj - https://github.com/krajicj
 * License - MIT
 * Copyright 2022
 */

const fs = require("fs").promises;

//FILTER FOR SPECIFIC ICON TYPE
const usedType = "solid";

//CATEGORY JSON FILE
const CATEGORY_FILE_PATH = "./fa6-categories-free.json";

//ICON JSON FILE
const ICON_FILE_PATH = "./fa6-icons-free.json";

function removeByteOrderMark(str) {
  return str.replace(/^\ufeff/g, "");
}

async function sanitizeCategories() {
  const categoriesRaw = await fs.readFile(CATEGORY_FILE_PATH, "utf8");
  const categories = JSON.parse(removeByteOrderMark(categoriesRaw));

  const iconsRaw = await fs.readFile(ICON_FILE_PATH, "utf8");
  const icons = JSON.parse(removeByteOrderMark(iconsRaw));

  for (const [key, category] of Object.entries(categories)) {
    // console.log(`------ ${key} --------`);
    let index = category.icons.length - 1;
    while (index >= 0) {
      //   console.log(category.icons[index]);
      if (icons[category.icons[index]].styles.includes(usedType) === false) {
        // console.log(category.icons[index]);
        category.icons.splice(index, 1);
      }
      index = index - 1;
    }
  }

  await fs.writeFile(
    `fa-categories-icons-${usedType}.json`,
    JSON.stringify(categories)
  );
}

sanitizeCategories();
