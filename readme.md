# Font Awesome icon picker

by Jan Krajíc

### How to use

1. Download your FA web pack from https://fontawesome.com/download use FREE or buy PRO

2. Import your FA styles to your page see example index.html

3. Use FA config parser to get file with categories for the picker

4. Usage

```
//Input to pick icon
<input  type="text" class="icon-picker-my" value="dog" data-config-url="./../fa6-categories-free-solid.json">

//Create parser
const iconPicker = new IconPicker();

//Bind to the input
iconPicker.iconPicker(document.querySelector('.icon-picker-my'));

```

5. Configuration

```
const config = {
    iconConfig: "", //Path to the icon categories json or use data-config-url dataset
    withIconPrefix: false, //Store in input icon name and prefix (fa-dog | dog)
    iconPrefix: "fa-", //Use icon prefix if you do not store it
    iconType: "fas", //Icon types to show in picker (solid are default)
    allCategoryLabel: "All categories", //Translation or customization
    showMoreLabel: "Show more", //Translation or customization
    searchPlaceholder: "Search for icons", //Translation or customization
    labelField: "label",
    iconLimit: 50,
    iconLimitStep: 25,
}

//Create picker
const iconPicker = new IconPicker(config);

```
