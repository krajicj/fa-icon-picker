/*!
 * @author Jan Krajíc
 * 
 * FA Icon picker by @krajicj - https://github.com/krajicj
 * License - MIT
 * Copyright 2022
 */

function IconPicker(options = {}) {
  //Make context of this function visible in all code
  let _this = this;
  let _options = {};
  let _activeCategory = "";
  let _filterText = "";
  let _allIcons = [];
  let _actualIcons = [];
  let _actualIconLimit = 50;
  let _elInput;
  let _pickerModal;
  let _pickerWrapper;

  //Set options
  setOptions(options);

  //Set options or the default ones
  function setOptions(options) {
    _options = {
      iconConfig: options.iconConfig,
      withIconPrefix: options.withIconPrefix || false,
      iconPrefix: options.iconPrefix || "fa-",
      iconType: options.iconType || "fas",
      allCategoryLabel: options.allCategoryLabel || "All categories",
      showMoreLabel: options.showMoreLabel || "Show more",
      searchPlaceholder: options.searchPlaceholder || "Search for icons",
      labelField: options.labelField || "label",
      iconLimit: options.iconLimit || 50,
      iconLimitStep: options.iconLimitStep || 25,
    };
  }

  /**
   * Create icon picker
   *
   * @param {*} el input element to bind icon picker
   * @returns
   */
  this.iconPicker = async (el) => {
    if (!el) {
      throw "No element passed";
    }
    //Do not bind if already binded
    if (el.classList.contains("ip-binded")) {
      return;
    }

    //Store input element to class property
    _elInput = el;

    //Load config if not exist
    if (_options.iconConfig === undefined) {
      const configOk = await initConfig();
      if (!configOk) return;
    }

    //Hide input
    _elInput.style.display = "none";
    _elInput.classList.add("ip-binded");

    //Create picker wrapper
    const pickerWrapper = document.createElement("div");
    pickerWrapper.classList.add("ip-wrapper");

    //Create picker btn
    const pickerBtn = document.createElement("a");
    pickerBtn.classList = "ip-picker-btn btn btn-primary";
    const pickerBtnInner = document.createElement("i");
    pickerBtnInner.classList.add("ip-picker-icon");
    pickerBtn.appendChild(pickerBtnInner);

    //Bind open picker function
    pickerBtn.addEventListener("click", () => {
      openPicker(pickerWrapper);
    });

    //Insert picker wrapper to the dom
    _elInput.parentNode.insertBefore(pickerWrapper, _elInput.nextSibling);

    //Store picker wrapper to the property
    _pickerWrapper = pickerWrapper;

    //Insert input and icon to the wrapper
    _pickerWrapper.appendChild(_elInput);
    _pickerWrapper.appendChild(pickerBtn);

    //Set btn icon if input has some def value
    setPickerBtnIcon();

    //Create modal for the picker
    createModal();

    //Create picker controls like switch category btn
    createControls();

    //Create categories
    createCategories();

    //Show icons
    showIcons();
  };

  /************** MAIN LOGIC FUNCTION *************/

  /**
   * Open modal with picker
   */
  function openPicker() {
    $(_pickerModal).modal("show");
  }

  /**
   * Set icon from the input to the picker open button
   * Using this for init and for set icon after picker select
   */
  function setPickerBtnIcon() {
    const pickerBtnInner = _pickerWrapper.querySelector(".ip-picker-icon");

    if (_elInput.value) {
      if (_options.withIconPrefix) {
        pickerBtnInner.classList = `ip-picker-icon ${_elInput.value}`;
      } else {
        pickerBtnInner.classList = `ip-picker-icon ${_options.iconType} ${_options.iconPrefix}${_elInput.value}`;
      }
    }
  }

  /**
   * Handler called after icon was selected
   * This function close picker and set icon to the input and show icon in the btn
   *
   * @param {*} event select icon event
   */
  function handleSelectIcon(event) {
    const icon = event.target.closest(".ip-icon-wrapper").dataset.icon;
    if (_options.withIconPrefix) {
      _elInput.value = `${_options.iconType} ${_options.iconPrefix}${icon}`;
    } else {
      _elInput.value = icon;
    }
    $(event.target.closest(".ip-icons-modal")).modal("hide");
    setPickerBtnIcon();
  }

  /**
   * This methods get actual filterd icons and show then in the picker
   */
  function showIcons() {
    _actualIconLimit = _options.iconLimit;
    //Pick right icon set
    _actualIcons =
      _activeCategory !== ""
        ? _options.iconConfig[_activeCategory].icons
        : _allIcons;

    //Filter icons by search input
    _actualIcons = filterItems(_actualIcons, _filterText);

    //Icons place
    const iconsDiv = _pickerModal.querySelector(".ip-icons");

    //Clear old icons
    iconsDiv.innerHTML = "";

    //Use icon limit
    _actualIcons.slice(0, _actualIconLimit).forEach((icon) => {
      iconsDiv.appendChild(getIconEl(icon));
    });

    //Bind select function to the icons
    bindSelectIcon();

    //Add show more btn
    addShowMoreBtn();
  }

  /**
   * This function load more icons if exist after click to show more
   */
  function showMoreIcons() {
    const iconsDiv = _pickerModal.querySelector(".ip-icons");

    const newLimit = _actualIconLimit + _options.iconLimitStep;

    _actualIcons.slice(_actualIconLimit, newLimit).forEach((icon) => {
      iconsDiv.appendChild(getIconEl(icon));
    });

    _actualIconLimit = newLimit;

    //Bind select function to the icons
    bindSelectIcon();

    //Add show more btn if need
    addShowMoreBtn();
  }

  /******* CREATING DOM ELEMENTS ***********/

  /**
   * Create categories from the config file and add them to the dom
   */
  function createCategories() {
    const categoriesDiv = _pickerModal.querySelector(".ip-categories");
    categoriesDiv.classList.add("ip-closed");
    //All categories item
    categoriesDiv.appendChild(
      getCatEl("archive", "", _options.allCategoryLabel)
    );
    for (const [key, category] of Object.entries(_options.iconConfig)) {
      //Add to the allicons
      _allIcons.push(...category.icons);
      //Add first icon from category as category icon @TODO
      categoriesDiv.appendChild(
        getCatEl(category.icons[0], key, category[_options.labelField])
      );
    }

    //Bind switching categories
    bindCategoriesSwitch();
  }

  /**
   * Create controls of the picker:
   * - category select btn
   */
  function createControls() {
    const controlDiv = _pickerModal.querySelector(".ip-controls");

    //Create btn
    const catSwitchBtn = document.createElement("button");
    catSwitchBtn.classList.add("ip-cat-switch-btn");
    catSwitchBtn.classList.add("btn");
    catSwitchBtn.classList.add("btn-primary");

    //Create icon
    const btnIcon = document.createElement("i");
    btnIcon.classList.add("ip-cat-switch-icon");
    btnIcon.classList.add(_options.iconType);
    btnIcon.classList.add(_options.iconPrefix + getCatIcon());

    //Create text
    const btnText = document.createElement("span");
    btnText.classList.add("ip-cat-switch-text");
    btnText.innerText = getCatLabel();

    //Append all to the dom
    catSwitchBtn.appendChild(btnIcon);
    catSwitchBtn.appendChild(btnText);
    controlDiv.appendChild(catSwitchBtn);

    //Bind click function
    catSwitchBtn.addEventListener("click", () => {
      toggleCatSelect();
    });
  }

  /**
   * Create modal template and add it to the dom
   */
  function createModal() {
    const modal = `
          <div class="modal fade ip-icons-modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
              <div class="modal-dialog modal-lg">
                  <div class="modal-content ip-content">
                      <button type="button" class="close ip-close-btn" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                      </button>
                      <div class="ip-search-bar">
                          <input type="text" placeholder=" &#xF002; ${_options.searchPlaceholder}" class="ip-search-input">
                      </div>
                      <div class="ip-icons-content">
                          <div class="ip-controls"></div>
                          <div class="ip-categories"></div>
                          <div class="ip-icons"></div>
                      </div>
                  </div>
              </div>
          </div>
        `;

    //Create modal element
    _pickerModal = createElementFromHTML(modal);
    //Place it to the end of the body
    document.querySelector("body").appendChild(_pickerModal);

    //Bind search input
    bindFilterInput();
  }

  /**
   * Create show more button if need
   */
  function addShowMoreBtn() {
    const iconsDiv = _pickerModal.querySelector(".ip-icons");
    const oldBtn = _pickerModal.querySelector(".ip-show-more-btn-wrapper");
    //remove old btn
    if (oldBtn) oldBtn.remove();

    //If limit is smaller than icons length then add btn
    if (_actualIcons.length > _actualIconLimit) {
      const showMoreBtnWrapper = document.createElement("div");
      showMoreBtnWrapper.classList.add("ip-show-more-btn-wrapper");
      const showMoreBtn = document.createElement("button");
      showMoreBtnWrapper.appendChild(showMoreBtn);
      showMoreBtn.classList = "btn btn-primary ip-show-more-btn";
      showMoreBtn.innerText = _options.showMoreLabel;
      iconsDiv.appendChild(showMoreBtnWrapper);

      //Bind btn function
      showMoreBtn.addEventListener("click", () => {
        showMoreIcons();
      });
    }
  }

  /********** DOM MANIPULATION *********/

  /**
   * Show or hide category select section
   */
  function toggleCatSelect() {
    const catDiv = _pickerModal.querySelector(".ip-categories");
    if (catDiv.classList.contains("ip-closed")) {
      catDiv.classList.remove("ip-closed");
    } else {
      catDiv.classList.add("ip-closed");
    }
  }

  /******** BINDING ACTIONS  ********/

  /**
   * Bind categories items to change icon category
   */
  function bindCategoriesSwitch() {
    const categories = _pickerModal.querySelectorAll(".ip-icon-category-item");
    categories.forEach((category) => {
      category.addEventListener("click", (e) => {
        _activeCategory = category.dataset.category;

        //Change cat btn icon
        const catIconEl = _pickerModal.querySelector(".ip-cat-switch-icon");
        catIconEl.classList = "ip-cat-switch-icon";
        catIconEl.classList.add(_options.iconType);
        catIconEl.classList.add(_options.iconPrefix + getCatIcon());

        //Change cat btn text
        const catTextEl = _pickerModal.querySelector(".ip-cat-switch-text");
        catTextEl.innerText = getCatLabel();

        //Hide cat select
        toggleCatSelect();

        //Show icons with new category
        showIcons();
      });
    });
  }

  /**
   * Bind icons with select handler function
   */
  function bindSelectIcon() {
    const icons = _pickerModal.querySelectorAll(".ip-icon-wrapper");

    icons.forEach((icon) => {
      //Unbind
      icon.removeEventListener("click", handleSelectIcon, true);
      //bind
      icon.addEventListener("click", handleSelectIcon, true);
    });
  }

  /**
   * Bind filter input
   */
  function bindFilterInput() {
    const inputFilter = _pickerModal.querySelector(".ip-search-input");
    inputFilter.addEventListener("keyup", (e) => {
      _filterText = e.target.value;
      showIcons();
    });
  }

  /***** GET HELPERS *****/

  /**
   * Return category label
   *
   * @returns Active category label
   */
  function getCatLabel() {
    return _activeCategory === ""
      ? _options.allCategoryLabel
      : _options.iconConfig[_activeCategory][_options.labelField];
  }

  /**
   * Returns icon for the active category
   *
   * @returns active category main icon
   */
  function getCatIcon() {
    return _activeCategory === ""
      ? "archive"
      : _options.iconConfig[_activeCategory].icons[0];
  }

  /**
   * Create icon element from passed icon
   *
   * @param {string} icon icon name
   * @returns icon element
   */
  function getIconEl(icon) {
    const iconWrapper = document.createElement("div");
    iconWrapper.classList.add("ip-icon-wrapper");
    iconWrapper.dataset.icon = icon;
    const iconEl = document.createElement("i");
    iconEl.classList.add(_options.iconType);
    iconEl.classList.add(_options.iconPrefix + icon);
    iconWrapper.appendChild(iconEl);
    return iconWrapper;
  }

  /**
   *
   * Create category element from passed icon, category and label
   *
   * @param {string} icon  icon for the element
   * @param {string} category category key
   * @param {string} label category label for the element
   * @returns
   */
  function getCatEl(icon, category, label) {
    const catDiv = document.createElement("div");
    catDiv.classList.add("ip-icon-category-item");
    catDiv.dataset.category = category;

    iconEl = document.createElement("i");
    iconEl.classList.add(_options.iconType);
    iconEl.classList.add(_options.iconPrefix + icon);
    catDiv.appendChild(iconEl);
    const catSpan = document.createElement("span");
    catSpan.classList.add("ip-category-name");
    catSpan.innerText = label;
    catDiv.appendChild(catSpan);
    return catDiv;
  }

  /****  CONFIG LOAD AND INIT *****/

  /**
   * Load config from file
   * @param {string} url of the config file
   * @returns return json config
   */
  async function loadConfig(url) {
    const response = await fetch(url);
    const config = await response.json();
    return config;
  }

  /**
   * Init config for the picker
   *
   * @returns true if config loaded, false otherwise
   */
  async function initConfig() {
    const configUlr = _elInput.dataset.configUrl || _options.configUlr;
    if (configUlr === undefined) {
      return false;
    } else {
      _options.iconConfig = await loadConfig(configUlr);
    }

    return true;
  }

  /*** UTILS ***/

  /**
   * Filter array
   */
  function filterItems(arr, query) {
    return arr.filter(function (el) {
      return el.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
  }

  /**
   * Create html element from string
   *
   * @param {string} htmlString
   * @returns html element
   */
  function createElementFromHTML(htmlString) {
    var div = document.createElement("div");
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
  }
}
