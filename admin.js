'use strict';

(() => {
  const STORAGE_KEY = 'asa-menu-admin-v1';
  const CONTACTS_STORAGE_KEY = 'asa-menu-contacts-v1';
  const CATEGORIES_STORAGE_KEY = 'asa-menu-categories-v1';
  const ADMIN_PASSWORD_STORAGE_KEY = 'asa-menu-admin-password-v1';

  const DEFAULT_CONTACTS = {
    address: 'Xorazm viloyati Yangibozor \ntumani It park',
    mapUrl: '',
    phones: ['+998.77.740.03.28'],
    callPhone: '+998.77.740.03.28',
    hours: 'Har kuni: 10:30 dan - 23:00 gacha ishlaymiz',
    hoursNote: 'sizni kutib qolamiz !🫡',
    instagram: '',
    telegram: ''
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const shell = $('#adminShell');
  if (!shell) return;

  const confirmModalId = 'asa-admin-confirm-modal';
  const confirmModalStyleId = 'asa-admin-confirm-modal-style';

  function ensureConfirmModal() {
    let modal = document.getElementById(confirmModalId);
    if (modal) return modal;

    const style = document.getElementById(confirmModalStyleId);
    if (!style) {
      const css = document.createElement('style');
      css.id = confirmModalStyleId;
      css.textContent = `
        .asa-admin-confirm-overlay {
          position: fixed;
          inset: 0;
          display: none;
          align-items: center;
          justify-content: center;
          background: rgba(3, 10, 11, 0.72);
          padding: 20px;
          z-index: 9999;
        }
        .asa-admin-confirm-overlay.open {
          display: flex;
        }
        .asa-admin-confirm-modal {
          width: min(420px, 100%);
          background: #0c1e1f;
          border: 1px solid rgba(117, 209, 179, 0.35);
          border-radius: 14px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.42);
          padding: 22px 20px 18px;
          color: #f7f5e8;
        }
        .asa-admin-confirm-header {
          margin-bottom: 12px;
        }
        .asa-admin-confirm-header h3 {
          margin: 0;
          font-size: 20px;
          color: #75d1b3;
          font-family: 'Cinzel', serif;
        }
        .asa-admin-confirm-message {
          margin: 0;
          font-size: 15px;
          line-height: 1.6;
          color: #f7f5e8;
        }
        .asa-admin-confirm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        .asa-admin-confirm-btn {
          border: 1px solid rgba(117, 209, 179, 0.35);
          border-radius: 8px;
          padding: 10px 18px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
        }
        .asa-admin-confirm-btn:hover {
          transform: translateY(-1px);
        }
        .asa-admin-confirm-cancel {
          background: transparent;
          color: #dfeee9;
        }
        .asa-admin-confirm-cancel:hover {
          border-color: rgba(255, 255, 255, 0.45);
          background: rgba(255, 255, 255, 0.06);
        }
        .asa-admin-confirm-ok {
          background: #16918c;
          color: #061b1d;
          border-color: #16918c;
        }
        .asa-admin-confirm-ok:hover {
          background: #75d1b3;
          border-color: #75d1b3;
        }
      `;
      document.head.appendChild(css);
    }

    modal = document.createElement('div');
    modal.id = confirmModalId;
    modal.className = 'asa-admin-confirm-overlay';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="asa-admin-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="asaAdminConfirmTitle">
        <div class="asa-admin-confirm-header">
          <h3 id="asaAdminConfirmTitle">Tasdiqlash</h3>
        </div>
        <p class="asa-admin-confirm-message"></p>
        <div class="asa-admin-confirm-actions">
          <button type="button" class="asa-admin-confirm-btn asa-admin-confirm-cancel">Yo‘q</button>
          <button type="button" class="asa-admin-confirm-btn asa-admin-confirm-ok">Ha</button>
        </div>
      </div>
    `;
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      }
    });
    document.body.appendChild(modal);
    return modal;
  }

  function showConfirmDialog({ title = 'Tasdiqlash', message = '', confirmText = 'Ha', cancelText = 'Yo‘q', onConfirm = null } = {}) {
    const modal = ensureConfirmModal();
    const titleNode = $('.asa-admin-confirm-header h3', modal);
    const messageNode = $('.asa-admin-confirm-message', modal);
    const okBtn = $('.asa-admin-confirm-ok', modal);
    const cancelBtn = $('.asa-admin-confirm-cancel', modal);

    titleNode.textContent = title;
    messageNode.textContent = message;
    okBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;

    const close = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    };

    const finish = (result) => {
      close();
      if (result && typeof onConfirm === 'function') onConfirm();
    };

    okBtn.onclick = () => finish(true);
    cancelBtn.onclick = () => finish(false);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  const listView = $('#adminListView');
  const form = $('#adminForm');
  const catForm = $('#adminCategoryForm');
  const itemsContainer = $('#adminItems');
  const categorySelect = $('#adminCategory');
  const subcategorySelect = $('#adminSubcategory');
  const subcategoryWrapper = $('#subcategoryWrapper');
  const status = $('#adminStatus');
  const login = $('#adminLogin');
  const loginForm = $('#adminLoginForm');

  // Tab tugmalari va bo'limlari
  const tabItemsBtn = $('#tabItemsBtn');
  const tabContactsBtn = $('#tabContactsBtn');
  const tabSettingsBtn = $('#tabSettingsBtn');
  const sectionItems = $('#adminSectionItems');
  const sectionContacts = $('#adminSectionContacts');
  const sectionSettings = $('#adminSectionSettings');
  const contactForm = $('#adminContactForm');
  const phonesList = $('#adminPhonesList');
  const addPhoneBtn = $('#adminAddPhoneBtn');
  const contactResetBtn = $('#contactResetBtn');
  const settingsForm = $('#adminSettingsForm');
  const settingsCurrentPassword = $('#settingsCurrentPassword');
  const settingsNewPassword = $('#settingsNewPassword');
  const settingsConfirmPassword = $('#settingsConfirmPassword');
  const settingsResetPasswordBtn = $('#settingsResetPasswordBtn');

  // Bo'lim (button) qo'shish elementlari
  const addCatBtn = $('#adminAddCatBtn');
  const cancelCatBtn = $('#cancelCatBtn');
  const catFiltersContainer = $('#adminCatFilters');
  const catsManageContainer = $('#adminCatsManage');
  const customCatsList = $('#adminCustomCatsList');
  const catNameInput = $('#catNameInput');
  const catDescInput = $('#catDescInput');
  const catSubcategoriesInput = $('#catSubcategoriesInput');
  const hasKgCalcCheckbox = $('#adminHasKgCalc');
  const halfKgPriceField = $('#adminHalfKgPriceField');
  const halfKgPriceInput = $('#adminHalfKgPrice');
  const adminImageInput = $('#adminImage');
  const adminImageGallery = $('#adminImageGallery');
  const adminImageCamera = $('#adminImageCamera');
  const adminImageStatus = $('#adminImageStatus');
  let selectedAdminImage = '';

  let records = [];
  let editingId = null;
  let categoryOptions = [];
  let currentContactPhones = [];
  let customCategories = [];
  let deletedItemIds = [];
  let selectedFilterCat = 'all';
  let customDropdownOutsideHandlerBound = false;

  // ===================== MAXSUS BO'LIMLAR (CATEGORIES) =====================
  function loadCustomCategories() {
    try {
      const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveCustomCategories(cats) {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(cats));
      customCategories = cats;
      applyCustomCategoriesToSite();
      categoryOptions = getCategoryOptions();
      populateCategorySelect();
      renderCategoryFilters();
      renderCustomCatsManage();
      return true;
    } catch (e) {
      status.textContent = 'Bo‘limni saqlashda xatolik: ' + e.message;
      return false;
    }
  }

  function applyCustomCategoriesToSite() {
    const tabsContainer = $('.tabs');
    const menuWrap = $('.menu-wrap');
    if (!tabsContainer || !menuWrap) return;
    if (!customDropdownOutsideHandlerBound) {
      document.addEventListener('click', event => {
        if (event.target instanceof Element && event.target.closest('.tab-drop')) return;
        $$('.tab-drop.custom-tab-drop').forEach(drop => {
          drop.classList.remove('open');
          drop.querySelector('.tab')?.setAttribute('aria-expanded', 'false');
        });
      });
      customDropdownOutsideHandlerBound = true;
    }

    // Avvalgi maxsus tablar va guruhlarni tozalash
    $$('.tab-drop.custom-tab-drop', tabsContainer).forEach(drop => drop.remove());
    $$('.tab.custom-tab', tabsContainer).forEach(t => t.remove());
    $$('.menu-group.custom-group', menuWrap).forEach(g => g.remove());

    customCategories.forEach(cat => {
      const subcategories = Array.isArray(cat.subcategories)
        ? cat.subcategories.filter(item => item && typeof item.id === 'string' && typeof item.name === 'string' && item.name.trim())
        : [];
      let tabContainer = tabsContainer;
      if (subcategories.length) {
        tabContainer = document.createElement('div');
        tabContainer.className = 'tab-drop custom-tab-drop';
      }

      const tabBtn = document.createElement('button');
      tabBtn.className = 'tab custom-tab';
      tabBtn.dataset.cat = cat.id;
      tabBtn.textContent = cat.name;
      if (subcategories.length) {
        tabBtn.setAttribute('aria-haspopup', 'true');
        tabBtn.setAttribute('aria-expanded', 'false');
        const caret = document.createElement('span');
        caret.className = 'tab-caret';
        tabBtn.append(caret);
      }

      if (subcategories.length) {
        const tabMenu = document.createElement('div');
        tabMenu.className = 'tab-menu';
        tabMenu.setAttribute('role', 'menu');
        subcategories.forEach(subcategory => {
          const option = document.createElement('button');
          option.className = 'tab-opt';
          option.dataset.sub = subcategory.id;
          option.setAttribute('role', 'menuitem');
          option.textContent = subcategory.name;
          tabMenu.append(option);
        });
        tabContainer.append(tabBtn, tabMenu);
        tabsContainer.append(tabContainer);
      } else {
        tabsContainer.append(tabBtn);
      }

      const groupDiv = document.createElement('div');
      groupDiv.className = 'menu-group custom-group';
      groupDiv.dataset.cat = cat.id;
      if (cat.desc) {
        const descP = document.createElement('p');
        descP.className = 'cat-desc';
        descP.textContent = cat.desc;
        groupDiv.append(descP);
      }
      subcategories.forEach((subcategory, index) => {
        const subGroup = document.createElement('div');
        subGroup.className = 'sub-group' + (index === 0 ? ' active' : '');
        subGroup.dataset.sub = subcategory.id;
        const heading = document.createElement('div');
        heading.className = 'sub-head';
        const title = document.createElement('h3');
        title.textContent = subcategory.name;
        heading.append(title);
        subGroup.append(heading);
        groupDiv.append(subGroup);
      });
      menuWrap.append(groupDiv);
    });
  }

  function getAdminPassword() {
    try {
      const saved = localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY);
      return saved && saved.trim() ? saved.trim() : 'ASA03';
    } catch (error) {
      return 'ASA03';
    }
  }

  function setAdminPassword(nextPassword) {
    const password = String(nextPassword || '').trim();
    if (!password) return false;
    try {
      localStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, password);
      return true;
    } catch (error) {
      status.textContent = 'Parolni saqlab bo‘lmadi: ' + error.message;
      return false;
    }
  }

  function renderCategoryFilters() {
    if (!catFiltersContainer) return;
    catFiltersContainer.replaceChildren();

    // "Barchasi" tugmasi
    const allBtn = document.createElement('button');
    allBtn.className = 'admin-cat-pill' + (selectedFilterCat === 'all' ? ' active' : '');
    allBtn.type = 'button';
    allBtn.textContent = 'Barchasi (' + records.length + ')';
    allBtn.addEventListener('click', () => {
      selectedFilterCat = 'all';
      renderCategoryFilters();
      renderList();
    });
    catFiltersContainer.append(allBtn);

    categoryOptions.forEach(opt => {
      const count = records.filter(r => r.category === opt.value).length;
      const btn = document.createElement('button');
      btn.className = 'admin-cat-pill' + (selectedFilterCat === opt.value ? ' active' : '');
      btn.type = 'button';
      btn.textContent = opt.label + (count > 0 ? ' (' + count + ')' : '');
      btn.addEventListener('click', () => {
        selectedFilterCat = opt.value;
        renderCategoryFilters();
        renderList();
      });
      catFiltersContainer.append(btn);
    });
  }

  function renderCustomCatsManage() {
    if (!catsManageContainer || !customCatsList) return;
    if (!customCategories.length) {
      catsManageContainer.hidden = true;
      return;
    }

    catsManageContainer.hidden = false;
    customCatsList.replaceChildren();

    customCategories.forEach(cat => {
      const badge = document.createElement('div');
      badge.className = 'admin-cat-badge';
      const name = document.createElement('span');
      name.textContent = cat.name;

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'admin-cat-badge-del';
      delBtn.title = 'Ushbu bo‘lim tugmasini o‘chirish';
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', () => {
        const dishCount = records.filter(r => r.category === cat.id).length;
        const msg = dishCount > 0
          ? '“' + cat.name + '” bo‘limida ' + dishCount + ' ta taom bor. Bo‘lim o‘chirilsa, uning taomlari ham o‘chiriladi. Rozimisiz?'
          : '“' + cat.name + '” bo‘limi menyudan o‘chirilsinmi?';

        showConfirmDialog({
          title: 'Tasdiqlash',
          message: msg,
          onConfirm: () => {
            const nextCats = customCategories.filter(c => c.id !== cat.id);
            const nextRecords = records.filter(r => r.category !== cat.id);
            saveCustomCategories(nextCats);
            persist(nextRecords);
            if (selectedFilterCat === cat.id) selectedFilterCat = 'all';
            renderCategoryFilters();
            renderList();
          }
        });
      });

      badge.append(name, delBtn);
      customCatsList.append(badge);
    });
  }

  // ===================== KATEGORIYALAR OPTSIYALARI =====================
  function getCategoryOptions() {
    return $$('.menu-group').map(group => {
      const tab = $$('.tab').find(button => button.dataset.cat === group.dataset.cat);
      return {
        value: group.dataset.cat,
        label: tab ? tab.textContent.trim().replace(/\s+/g, ' ') : group.dataset.cat,
        group
      };
    });
  }

  function getSubcategoryOptions(category) {
    const option = categoryOptions.find(item => item.value === category);
    if (!option) return [];
    return $$('.sub-group', option.group).map(group => {
      const dropdown = $$('.tab-drop').find(drop => drop.querySelector('.tab')?.dataset.cat === category);
      const tabOption = dropdown && $$('.tab-opt', dropdown).find(button => button.dataset.sub === group.dataset.sub);
      const heading = $('.sub-head h3', group);
      return {
        value: group.dataset.sub,
        label: tabOption ? tabOption.textContent.trim() : heading?.textContent.trim() || group.dataset.sub
      };
    });
  }

  function categoryLabel(category) {
    return categoryOptions.find(item => item.value === category)?.label || category;
  }

  function locationLabel(record) {
    const subcategory = getSubcategoryOptions(record.category).find(item => item.value === record.subcategory);
    return categoryLabel(record.category) + (subcategory ? ' · ' + subcategory.label : '');
  }

  function populateCategorySelect() {
    if (!categorySelect) return;
    categorySelect.replaceChildren();
    categoryOptions.forEach(item => {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      categorySelect.append(option);
    });
  }

  function populateSubcategories(category, selected = '') {
    if (!subcategorySelect) return;
    subcategorySelect.replaceChildren();
    const options = getSubcategoryOptions(category);
    if (!options.length) {
      if (subcategoryWrapper) subcategoryWrapper.hidden = true;
      subcategorySelect.disabled = true;
      return;
    }
    if (subcategoryWrapper) subcategoryWrapper.hidden = false;
    subcategorySelect.disabled = false;
    options.forEach(item => {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      subcategorySelect.append(option);
    });
    if (options.some(item => item.value === selected)) subcategorySelect.value = selected;
  }

  function itemDetails(element, id) {
    const group = element.closest('.menu-group');
    const subGroup = element.closest('.sub-group');
    const name = $('.mi-name', element)?.textContent.trim() || '';
    const priceText = $('.mi-price', element)?.textContent || '';
    const price = Number(priceText.replace(/[^\d]/g, '')) || 0;
    const hasKgCalc = Boolean($('.mi-kg-calc', element));
    const priceElement = $('.mi-price', element);
    const storedHalfKgPrice = priceElement?.dataset.halfKgPrice;
    const halfKgPriceText = ($('.mi-kg-result', element)?.textContent || '').split('Jami:')[1] || '';
    const parsedHalfKgPrice = storedHalfKgPrice !== undefined
      ? Number(storedHalfKgPrice)
      : halfKgPriceText.trim() ? Number(halfKgPriceText.replace(/[^\d]/g, '')) : undefined;
    const imgEl = $('.mi-thumb img', element);
    const rawImage = imgEl?.getAttribute('src') || '';
    const isPlaceholder = !rawImage || rawImage === 'rasm/asa-menu.svg' || rawImage.includes('asa-menu.svg') || imgEl?.classList.contains('is-placeholder-logo');
    return {
      id,
      category: group?.dataset.cat || '',
      subcategory: subGroup?.dataset.sub || '',
      name,
      price,
      hasKgCalc,
      halfKgPrice: Number.isSafeInteger(parsedHalfKgPrice) ? parsedHalfKgPrice : undefined,
      image: isPlaceholder ? '' : rawImage,
      description: $('.mi-desc', element)?.textContent.trim() || ''
    };
  }

  function isRecord(value) {
    if (!value || typeof value !== 'object') return false;
    if (typeof value.id !== 'string' || !value.id.trim() || value.id.length > 120) return false;
    if (typeof value.category !== 'string') return false;
    if (typeof value.name !== 'string' || !value.name.trim() || value.name.length > 100) return false;
    if (!Number.isSafeInteger(value.price) || value.price < 0) return false;
    if (value.halfKgPrice !== undefined && (!Number.isSafeInteger(value.halfKgPrice) || value.halfKgPrice < 0)) return false;
    if (typeof value.image !== 'string' || !isValidImage(value.image)) return false;
    return typeof value.description === 'string' && value.description.length <= 300;
  }

  function isValidImage(image) {
    if (image.length <= 500 && (!image || !/^[a-z][a-z\d+.-]*:/i.test(image) || /^https?:\/\//i.test(image))) {
      return true;
    }
    return image.length <= 1400000 &&
      /^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(image);
  }

  function readBackup(raw) {
    const parsed = JSON.parse(raw);
    if (!parsed || (parsed.version !== 1 && parsed.version !== 2 && parsed.version !== 3) ||
      !Array.isArray(parsed.records) || parsed.records.length > 5000 || !parsed.records.every(isRecord)) {
      throw new Error('Zaxira nusxa formati noto‘g‘ri yoki unda yaroqsiz taom bor.');
    }
    if (parsed.deletedItemIds !== undefined &&
      (!Array.isArray(parsed.deletedItemIds) || parsed.deletedItemIds.length > 5000 ||
        !parsed.deletedItemIds.every(id => typeof id === 'string' && id.length > 0 && id.length <= 120))) {
      throw new Error('Zaxira nusxadagi o‘chirilgan taomlar ro‘yxati noto‘g‘ri.');
    }
    const ids = new Set(parsed.records.map(record => record.id));
    if (ids.size !== parsed.records.length) {
      throw new Error('Zaxira nusxada takrorlangan taom identifikatori bor.');
    }
    return parsed;
  }

  function updateImage(element, record) {
    let thumb = $('.mi-thumb', element);
    let image = thumb && $('img', thumb);
    if (record.image) {
      if (!thumb) {
        thumb = document.createElement('div');
        thumb.className = 'mi-thumb';
        element.prepend(thumb);
      }
      if (!image) {
        image = document.createElement('img');
        image.loading = 'lazy';
        thumb.append(image);
      }
      image.src = record.image;
      image.alt = record.name + ' taomi rasmi';
      image.classList.remove('is-placeholder-logo');
      image.onerror = () => {
        image.onerror = null;
        image.src = 'rasm/asa-menu.svg';
        image.alt = 'ASA MENU';
        image.classList.add('is-placeholder-logo');
      };
      element.classList.add('has-thumb');
      thumb.classList.remove('mi-thumb-placeholder');
    } else if (record.category === 'ichimlik') {
      thumb?.remove();
      element.classList.remove('has-thumb');
    } else {
      if (!thumb) {
        thumb = document.createElement('div');
        thumb.className = 'mi-thumb';
        thumb.setAttribute('role', 'img');
        thumb.setAttribute('aria-label', record.name || 'Taom rasmi uchun joy');
        element.prepend(thumb);
      }
      if (!image) {
        image = document.createElement('img');
        image.loading = 'lazy';
        thumb.append(image);
      }
      image.onerror = null;
      image.src = 'rasm/asa-menu.svg';
      image.alt = 'ASA MENU';
      image.classList.add('is-placeholder-logo');
      thumb.classList.remove('mi-thumb-placeholder');
      element.classList.add('has-thumb');
    }
  }

  function setupKgCalculator(button, item, pricePerKg, fixedHalfKgPrice) {
    if (!button) return;
    let weightLabel = button.parentElement?.querySelector('.mi-weight-label');
    if (!weightLabel) {
      weightLabel = document.createElement('span');
      weightLabel.className = 'mi-weight-label';
      weightLabel.textContent = '1.0 kg';
      button.before(weightLabel);
    }

    button.textContent = '0.5 kg';
    let controls = button.parentElement?.querySelector('.mi-kg-controls');
    if (!controls) {
      controls = document.createElement('div');
      controls.className = 'mi-kg-controls';
      controls.hidden = true;
      const result = document.createElement('span');
      result.className = 'mi-kg-result';
      result.setAttribute('aria-live', 'polite');
      controls.append(result);
      button.parentElement?.append(controls);
    }

    const halfKg = Number.isSafeInteger(fixedHalfKgPrice) && fixedHalfKgPrice >= 0
      ? fixedHalfKgPrice
      : Math.round(pricePerKg / 2);
    $('.mi-kg-result', controls).textContent = '0.5 kg · Jami: ' +
      new Intl.NumberFormat('uz-UZ').format(halfKg) + " so'm";
    if (button.dataset.kgInitialized === 'true') return;
    button.dataset.kgInitialized = 'true';
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      controls.hidden = !controls.hidden;
      item.classList.toggle('kg-calc-open', !controls.hidden);
      button.setAttribute('aria-expanded', String(!controls.hidden));
    });
  }

  function updateElement(element, record) {
    element.dataset.adminId = record.id;
    const nameElement = $('.mi-name', element);
    if (nameElement) nameElement.textContent = record.name;
    else {
      const nameWrap = document.createElement('div');
      nameWrap.className = 'mi-name-wrap';
      const name = document.createElement('span');
      name.className = 'mi-name';
      name.textContent = record.name;
      nameWrap.append(name);
      const leader = document.createElement('span');
      leader.className = 'mi-leader';
      const priceWrap = document.createElement('div');
      priceWrap.className = 'mi-price-actions';
      const price = document.createElement('span');
      price.className = 'mi-price';
      priceWrap.append(price);
      element.append(nameWrap, leader, priceWrap);
    }

    let nameWrap = $('.mi-name-wrap', element);
    let description = $('.mi-desc', element);
    if (record.description) {
      if (!description) {
        description = document.createElement('span');
        description.className = 'mi-desc';
        nameWrap.append(description);
      }
      description.textContent = record.description;
    } else {
      description?.remove();
    }

    let priceElement = $('.mi-price', element);
    if (priceElement) {
      priceElement.textContent = record.price.toLocaleString('de-DE') + " so'm";
      if (record.hasKgCalc) {
        priceElement.dataset.pricePerKg = String(record.price);
        const halfKgPrice = Number.isSafeInteger(record.halfKgPrice) && record.halfKgPrice >= 0
          ? record.halfKgPrice
          : Math.round(record.price / 2);
        priceElement.dataset.halfKgPrice = String(halfKgPrice);
        let calcBtn = element.querySelector('.mi-kg-calc');
        if (!calcBtn) {
          let priceActions = element.querySelector('.mi-price-actions');
          if (!priceActions) {
            priceActions = document.createElement('div');
            priceActions.className = 'mi-price-actions';
            priceElement.after(priceActions);
            priceActions.append(priceElement);
          }
          calcBtn = document.createElement('button');
          calcBtn.className = 'mi-kg-calc';
          calcBtn.type = 'button';
          priceActions.append(calcBtn);
        }
        setupKgCalculator(calcBtn, element, record.price, halfKgPrice);
      } else {
        delete priceElement.dataset.pricePerKg;
        delete priceElement.dataset.halfKgPrice;
        element.querySelector('.mi-weight-label')?.remove();
        element.querySelector('.mi-kg-calc')?.remove();
        element.querySelector('.mi-kg-controls')?.remove();
      }
    }
    updateImage(element, record);
  }

  function createElement(record) {
    const element = document.createElement('div');
    element.className = 'menu-item';
    const nameWrap = document.createElement('div');
    nameWrap.className = 'mi-name-wrap';
    const name = document.createElement('span');
    name.className = 'mi-name';
    name.textContent = record.name;
    nameWrap.append(name);
    const leader = document.createElement('span');
    leader.className = 'mi-leader';
    const priceActions = document.createElement('div');
    priceActions.className = 'mi-price-actions';
    const price = document.createElement('span');
    price.className = 'mi-price';
    priceActions.append(price);
    element.append(nameWrap, leader, priceActions);
    updateElement(element, record);
    return element;
  }

  function targetFor(record) {
    const option = categoryOptions.find(item => item.value === record.category);
    if (!option) return null;
    if (record.subcategory) {
      return $$('.sub-group', option.group).find(group => group.dataset.sub === record.subcategory) || option.group;
    }
    return option.group;
  }

  function applyRecords() {
    const currentElements = $$('.menu-group .menu-item');
    const elementsById = new Map(currentElements.map(element => [element.dataset.adminId, element]));
    currentElements.forEach(element => element.remove());

    records.forEach(record => {
      let element = elementsById.get(record.id);
      if (!element) element = createElement(record);
      updateElement(element, record);
      const target = targetFor(record);
      if (target) target.append(element);
    });
  }

  function sanitizeRecords(nextRecords) {
    const seen = new Set();
    return nextRecords.filter(record => {
      if (!record || typeof record !== 'object' || typeof record.id !== 'string' || !record.id.trim()) return false;
      if (seen.has(record.id)) return false;
      seen.add(record.id);
      return true;
    });
  }

  function persist(nextRecords) {
    return persistWithDeletedItems(nextRecords, deletedItemIds);
  }

  function persistWithDeletedItems(nextRecords, nextDeletedItemIds) {
    const cleanRecords = sanitizeRecords(nextRecords);
    const cleanDeletedItemIds = Array.from(new Set(nextDeletedItemIds));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 3,
        records: cleanRecords,
        deletedItemIds: cleanDeletedItemIds
      }));
      records = cleanRecords;
      deletedItemIds = cleanDeletedItemIds;
      applyRecords();
      renderCategoryFilters();
      renderList();
      status.textContent = 'O‘zgarishlar shu brauzerda saqlandi.';
      return true;
    } catch (error) {
      status.textContent = 'Saqlab bo‘lmadi: ' + error.message;
      return false;
    }
  }

  function renderList() {
    const query = $('#adminSearch').value.trim().toLocaleLowerCase();
    itemsContainer.replaceChildren();

    let visibleRecords = records;
    if (selectedFilterCat !== 'all') {
      visibleRecords = visibleRecords.filter(r => r.category === selectedFilterCat);
    }

    if (query) {
      visibleRecords = visibleRecords.filter(record =>
        (record.name + ' ' + locationLabel(record)).toLocaleLowerCase().includes(query));
    }

    if (!visibleRecords.length) {
      const empty = document.createElement('p');
      empty.className = 'admin-note';
      empty.textContent = query || selectedFilterCat !== 'all'
        ? 'Tanlangan toifada yoki qidiruv bo‘yicha taom topilmadi.'
        : 'Menyuda hozircha taom yo‘q.';
      itemsContainer.append(empty);
      return;
    }

    visibleRecords.forEach(record => {
      const row = document.createElement('div');
      row.className = 'admin-item-row';

      const thumb = document.createElement('div');
      thumb.className = 'admin-item-thumb';
      const img = document.createElement('img');
      img.loading = 'lazy';
      if (record.image) {
        img.src = record.image;
        img.alt = record.name;
        img.onerror = () => {
          img.onerror = null;
          img.src = 'rasm/asa-menu.svg';
          img.classList.add('placeholder-logo');
        };
      } else {
        img.src = 'rasm/asa-menu.svg';
        img.alt = 'ASA MENU';
        img.classList.add('placeholder-logo');
      }
      thumb.append(img);

      const info = document.createElement('div');
      info.className = 'admin-item-info';
      const name = document.createElement('strong');
      name.textContent = record.name;
      const detail = document.createElement('span');
      const kgPrice = record.hasKgCalc
        ? ' · 0.5 kg: ' + (Number.isSafeInteger(record.halfKgPrice) ? record.halfKgPrice : Math.round(record.price / 2)).toLocaleString('de-DE') + " so'm"
        : '';
      const kgBadge = record.hasKgCalc ? ' · [0.5 kg tugmali]' + kgPrice : '';
      detail.textContent = locationLabel(record) + ' · ' + record.price.toLocaleString('de-DE') + " so'm" + kgBadge;
      info.append(name, detail);

      const actions = document.createElement('div');
      actions.className = 'admin-item-actions';
      const edit = document.createElement('button');
      edit.className = 'admin-btn';
      edit.type = 'button';
      edit.textContent = 'Tahrirlash';
      edit.addEventListener('click', () => openForm(record));

      const remove = document.createElement('button');
      remove.className = 'admin-btn admin-btn-danger';
      remove.type = 'button';
      remove.textContent = 'O‘chirish';
      remove.addEventListener('click', () => {
        showConfirmDialog({
          title: 'Taomni o‘chirish',
          message: '“' + record.name + '” menyudan o‘chirilsinmi?',
          onConfirm: () => {
            persistWithDeletedItems(
              records.filter(item => item.id !== record.id),
              [...deletedItemIds, record.id]
            );
          }
        });
      });

      actions.append(edit, remove);
      row.append(thumb, info, actions);
      itemsContainer.append(row);
    });
  }

  function openForm(record = null) {
    editingId = record?.id || null;
    $('#adminFormTitle').textContent = record ? 'Taomni tahrirlash' : 'Yangi taom';
    categorySelect.value = record?.category || (selectedFilterCat !== 'all' ? selectedFilterCat : (categoryOptions[0]?.value || ''));
    populateSubcategories(categorySelect.value, record?.subcategory || '');
    $('#adminName').value = record?.name || '';
    $('#adminPrice').value = record ? String(record.price) : '';
    if (hasKgCalcCheckbox) hasKgCalcCheckbox.checked = Boolean(record?.hasKgCalc);
    halfKgPriceInput.value = record?.hasKgCalc
      ? String(Number.isSafeInteger(record.halfKgPrice) ? record.halfKgPrice : Math.round(record.price / 2))
      : '';
    halfKgPriceField.hidden = !record?.hasKgCalc;
    halfKgPriceInput.required = Boolean(record?.hasKgCalc);
    selectedAdminImage = record?.image?.startsWith('data:image/') ? record.image : '';
    adminImageInput.value = selectedAdminImage ? '' : (record?.image || '');
    adminImageStatus.textContent = selectedAdminImage
      ? 'Saqlangan rasm tanlangan. Yangi rasm yuklashingiz yoki tozalashingiz mumkin.'
      : 'Rasm hajmi 1 MB gacha bo‘lishi kerak.';
    adminImageGallery.value = '';
    adminImageCamera.value = '';
    $('#adminDescription').value = record?.description || '';

    listView.hidden = true;
    if (catForm) catForm.hidden = true;
    form.hidden = false;
    status.textContent = '';
    $('#adminName').focus();
  }

  function closeForm() {
    form.hidden = true;
    if (catForm) catForm.hidden = true;
    listView.hidden = false;
    editingId = null;
    form.reset();
    selectedAdminImage = '';
    adminImageStatus.textContent = 'Rasm hajmi 1 MB gacha bo‘lishi kerak.';
    halfKgPriceField.hidden = true;
    halfKgPriceInput.required = false;
  }

  function handleAdminImageFile(input) {
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        status.textContent = 'JPG, PNG, WEBP yoki GIF formatidagi rasmni tanlang.';
        input.value = '';
        return;
      }
      if (file.size > 1024 * 1024) {
        status.textContent = 'Rasm hajmi 1 MB dan oshmasligi kerak.';
        input.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string' || !isValidImage(reader.result)) {
          status.textContent = 'Tanlangan rasm turi qo‘llab-quvvatlanmaydi.';
          return;
        }
        selectedAdminImage = reader.result;
        adminImageInput.value = '';
        adminImageStatus.textContent = file.name + ' tanlandi.';
        status.textContent = '';
      };
      reader.onerror = () => {
        status.textContent = 'Rasmni o‘qib bo‘lmadi.';
      };
      reader.readAsDataURL(file);
    });
  }

  $('#adminImageGalleryBtn')?.addEventListener('click', () => adminImageGallery.click());
  $('#adminImageCameraBtn')?.addEventListener('click', () => adminImageCamera.click());
  $('#adminImageClearBtn')?.addEventListener('click', () => {
    selectedAdminImage = '';
    adminImageInput.value = '';
    adminImageGallery.value = '';
    adminImageCamera.value = '';
    adminImageStatus.textContent = 'Rasm olib tashlanadi. Rasm hajmi 1 MB gacha bo‘lishi kerak.';
  });
  adminImageInput?.addEventListener('input', () => {
    if (adminImageInput.value) {
      selectedAdminImage = '';
      adminImageStatus.textContent = 'Rasm manzili kiritildi.';
    }
  });
  if (adminImageGallery && adminImageCamera) {
    handleAdminImageFile(adminImageGallery);
    handleAdminImageFile(adminImageCamera);
  }

  // ===================== YANGI BO'LIM QO'SHISH FORMASI =====================
  function openCategoryForm() {
    listView.hidden = true;
    form.hidden = true;
    if (catForm) catForm.hidden = false;
    status.textContent = '';
    catNameInput.value = '';
    catDescInput.value = '';
    catSubcategoriesInput.value = '';
    catNameInput.focus();
  }

  function closeCategoryForm() {
    if (catForm) catForm.hidden = true;
    listView.hidden = false;
    catNameInput.value = '';
    catDescInput.value = '';
  }

  // ===================== ALOQA VA SOZLAMALAR MANTIQI =====================
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function cleanPhone(phone) {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '');
  }

  function loadContacts() {
    try {
      const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
      if (!raw) return { ...DEFAULT_CONTACTS };
      const parsed = JSON.parse(raw);
      const phones = Array.isArray(parsed.phones) && parsed.phones.length > 0
        ? parsed.phones
        : [...DEFAULT_CONTACTS.phones];
      return {
        address: typeof parsed.address === 'string' && parsed.address.trim() ? parsed.address : DEFAULT_CONTACTS.address,
        mapUrl: typeof parsed.mapUrl === 'string' ? parsed.mapUrl : DEFAULT_CONTACTS.mapUrl,
        phones,
        callPhone: typeof parsed.callPhone === 'string' && parsed.callPhone.trim()
          ? parsed.callPhone
          : phones[0] || DEFAULT_CONTACTS.callPhone,
        hours: typeof parsed.hours === 'string' && parsed.hours.trim() ? parsed.hours : DEFAULT_CONTACTS.hours,
        hoursNote: typeof parsed.hoursNote === 'string' ? parsed.hoursNote : DEFAULT_CONTACTS.hoursNote,
        instagram: typeof parsed.instagram === 'string' ? parsed.instagram : DEFAULT_CONTACTS.instagram,
        telegram: typeof parsed.telegram === 'string' ? parsed.telegram : DEFAULT_CONTACTS.telegram
      };
    } catch (e) {
      return { ...DEFAULT_CONTACTS };
    }
  }

  function applyContacts(contacts = loadContacts()) {
    const siteAddress = $('#siteAddress');
    if (siteAddress) {
      siteAddress.innerHTML = escapeHtml(contacts.address).replace(/\n/g, '<br>');
    }

    const siteMapLink = $('#siteMapLink');
    if (siteMapLink) {
      const url = (contacts.mapUrl || '').trim();
      if (url) {
        siteMapLink.href = url;
        siteMapLink.style.display = 'inline-flex';
      } else {
        siteMapLink.style.display = 'none';
      }
    }

    const sitePhones = $('#sitePhones');
    if (sitePhones) {
      sitePhones.replaceChildren();
      const phones = contacts.phones && contacts.phones.length ? contacts.phones : DEFAULT_CONTACTS.phones;
      phones.forEach(phone => {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = 'tel:' + cleanPhone(phone);
        a.textContent = phone;
        a.style.color = 'inherit';
        a.style.textDecoration = 'none';
        p.append(a);
        sitePhones.append(p);
      });
    }

    const siteHours = $('#siteHours');
    if (siteHours) {
      const noteHtml = contacts.hoursNote
        ? '<br><span id="siteHoursNote">' + escapeHtml(contacts.hoursNote) + '</span>'
        : '';
      siteHours.innerHTML = escapeHtml(contacts.hours) + noteHtml;
    }

    const siteInstagramLink = $('#siteInstagramLink');
    if (siteInstagramLink) {
      let insta = (contacts.instagram || '').trim();
      if (insta) {
        if (!insta.startsWith('http://') && !insta.startsWith('https://')) {
          insta = 'https://www.instagram.com/' + insta.replace(/^@/, '') + '/';
        }
        siteInstagramLink.href = insta;
      } else {
        siteInstagramLink.href = 'https://www.instagram.com/';
      }
    }

    const siteTelegramLink = $('#siteTelegramLink');
    if (siteTelegramLink) {
      let tg = (contacts.telegram || '').trim();
      if (tg) {
        if (!tg.startsWith('http://') && !tg.startsWith('https://')) {
          tg = 'https://t.me/' + tg.replace(/^@/, '');
        }
        siteTelegramLink.href = tg;
      } else {
        siteTelegramLink.href = 'https://t.me/';
      }
    }

    const siteCallLink = $('#siteCallLink');
    if (siteCallLink) {
      const callPhone = contacts.callPhone || (contacts.phones && contacts.phones[0]) || DEFAULT_CONTACTS.callPhone;
      siteCallLink.href = 'tel:' + cleanPhone(callPhone);
    }
  }

  function renderPhoneInputs(phones) {
    if (!phonesList) return;
    phonesList.replaceChildren();
    currentContactPhones = phones && phones.length ? [...phones] : [''];

    currentContactPhones.forEach((phone, index) => {
      const row = document.createElement('div');
      row.className = 'admin-phone-row';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'admin-phone-input';
      input.value = phone;
      input.placeholder = '+998 90 123 45 67';
      input.required = true;
      input.addEventListener('input', () => {
        currentContactPhones[index] = input.value;
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'admin-phone-del';
      delBtn.title = 'Ushbu telefon raqamini o‘chirish';
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', () => {
        if (currentContactPhones.length <= 1) {
          currentContactPhones = [''];
          renderPhoneInputs(currentContactPhones);
          return;
        }
        currentContactPhones.splice(index, 1);
        renderPhoneInputs(currentContactPhones);
      });

      row.append(input, delBtn);
      phonesList.append(row);
    });
  }

  function populateContactForm() {
    const contacts = loadContacts();
    const addrInput = $('#contactInputAddress');
    const mapInput = $('#contactInputMapUrl');
    const callPhoneInput = $('#contactInputCallPhone');
    const hoursInput = $('#contactInputHours');
    const hoursNoteInput = $('#contactInputHoursNote');
    const instaInput = $('#contactInputInstagram');
    const tgInput = $('#contactInputTelegram');

    if (addrInput) addrInput.value = contacts.address;
    if (mapInput) mapInput.value = contacts.mapUrl || '';
    if (callPhoneInput) callPhoneInput.value = contacts.callPhone || contacts.phones[0] || DEFAULT_CONTACTS.callPhone;
    if (hoursInput) hoursInput.value = contacts.hours;
    if (hoursNoteInput) hoursNoteInput.value = contacts.hoursNote || '';
    if (instaInput) instaInput.value = contacts.instagram || '';
    if (tgInput) tgInput.value = contacts.telegram || '';

    renderPhoneInputs(contacts.phones);
  }

  function switchTab(targetTab) {
    const isItems = targetTab === 'items';
    const isContacts = targetTab === 'contacts';
    const isSettings = targetTab === 'settings';

    tabItemsBtn?.classList.toggle('active', isItems);
    tabItemsBtn?.setAttribute('aria-selected', String(isItems));
    tabContactsBtn?.classList.toggle('active', isContacts);
    tabContactsBtn?.setAttribute('aria-selected', String(isContacts));
    tabSettingsBtn?.classList.toggle('active', isSettings);
    tabSettingsBtn?.setAttribute('aria-selected', String(isSettings));

    if (sectionItems) sectionItems.hidden = !isItems;
    if (sectionContacts) sectionContacts.hidden = !isContacts;
    if (sectionSettings) sectionSettings.hidden = !isSettings;

    status.textContent = '';

    if (isItems) {
      $('#adminSearch')?.focus();
    } else if (isContacts) {
      populateContactForm();
      $('#contactInputAddress')?.focus();
    } else if (isSettings) {
      settingsForm?.reset();
      settingsCurrentPassword?.focus();
    }
  }

  // ===================== EKSPORT / IMPORT =====================
  function exportBackup() {
    const contacts = loadContacts();
    const backupData = {
      version: 3,
      records,
      deletedItemIds,
      contacts,
      customCategories,
      exportedAt: new Date().toISOString()
    };
    const backup = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(backup);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'asa-menu-zaxira.json';
    link.click();
    URL.revokeObjectURL(url);
    status.textContent = 'Zaxira nusxa (taomlar, bo‘limlar va aloqa) muvaffaqiyatli yuklab olindi.';
  }

  function importBackup(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      status.textContent = 'Fayl hajmi 5 MB dan oshmasligi kerak.';
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      try {
        const parsed = readBackup(String(reader.result));
        if (Array.isArray(parsed.customCategories)) {
          saveCustomCategories(parsed.customCategories);
        }
        if (persistWithDeletedItems(parsed.records, parsed.deletedItemIds || [])) {
          if (parsed.contacts && typeof parsed.contacts === 'object') {
            localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(parsed.contacts));
            applyContacts(parsed.contacts);
            populateContactForm();
          }
          status.textContent = 'Menyu, bo‘limlar va aloqa ma’lumotlari zaxira nusxadan tiklandi.';
        }
      } catch (error) {
        status.textContent = 'Import amalga oshmadi: ' + error.message;
      }
    });
    reader.addEventListener('error', () => {
      status.textContent = 'Faylni o‘qib bo‘lmadi.';
    });
    reader.readAsText(file);
  }

  // ===================== BOSHLANG'ICH ISHGA TUSHIRISH =====================
  function initialize() {
    // 1. Aloqa ma'lumotlarini sahifaga qo'llash
    applyContacts();

    // 2. Maxsus bo'limlarni (buttonlarni) yuklash va saytga qo'shish
    customCategories = loadCustomCategories();
    applyCustomCategoriesToSite();

    // 3. Kategoriya va taomlarni tayyorlash
    categoryOptions = getCategoryOptions();
    populateCategorySelect();

    function loadSavedRecords() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === null) return null;
        const parsed = readBackup(saved);
        return {
          records: sanitizeRecords(parsed.records),
          deletedItemIds: parsed.deletedItemIds || []
        };
      } catch (error) {
        status.textContent = 'Saqlangan menyuni yuklab bo‘lmadi: ' + error.message;
        return null;
      }
    }

    const savedRecords = loadSavedRecords();
    if (savedRecords) {
      deletedItemIds = savedRecords.deletedItemIds;
      const deletedIds = new Set(deletedItemIds);
      records = savedRecords.records.filter(record => !deletedIds.has(record.id));
      applyRecords();
    } else {
      const elements = $$('.menu-group .menu-item');
      elements.forEach((element, index) => {
        const id = 'html-item-' + index;
        element.dataset.adminId = id;
      });
      deletedItemIds = [];
      records = elements.map((element, index) => itemDetails(element, 'html-item-' + index));
      persistWithDeletedItems(records, deletedItemIds);
    }

    renderCategoryFilters();
    renderCustomCatsManage();
    renderList();

    // ===================== ADMIN PANEL KIRISH / CHIQISH =====================
    const showLogin = (locked = false) => {
      login.hidden = false;
      login.classList.toggle('is-locked', locked);
      $('#adminLoginLock').hidden = !locked;
      $('#adminLoginTitle').textContent = locked ? 'Admin panel qulflandi' : 'Admin panelga kirish';
      $('#adminLoginSubmit').textContent = locked ? 'Qayta ochish' : 'Kirish';
      $('#adminPassword').value = '';
      $('#adminLoginError').textContent = '';
      $('#adminPassword').focus();
    };
    const closeLogin = () => {
      login.hidden = true;
      login.classList.remove('is-locked');
      $('#adminLoginLock').hidden = true;
      $('#adminLoginTitle').textContent = 'Admin panelga kirish';
      $('#adminLoginSubmit').textContent = 'Kirish';
      loginForm.reset();
    };
    const ADMIN_IDLE_TIMEOUT = 15000;
    let adminIdleTimer = null;
    const closeAdminPanel = () => {
      shell.hidden = true;
      shell.classList.remove('is-locking');
      document.body.style.overflow = '';
      clearTimeout(adminIdleTimer);
      closeForm();
    };
    const lockAdminForInactivity = () => {
      if (shell.hidden || shell.classList.contains('is-locking')) return;
      adminIdleTimer = null;
      shell.classList.add('is-locking');
      setTimeout(() => {
        if (!shell.classList.contains('is-locking')) return;
        closeAdminPanel();
        showLogin(true);
      }, 350);
    };
    const resetAdminIdleTimer = () => {
      clearTimeout(adminIdleTimer);
      if (!shell.hidden && !shell.classList.contains('is-locking')) {
        adminIdleTimer = setTimeout(lockAdminForInactivity, ADMIN_IDLE_TIMEOUT);
      }
    };
    const openAdmin = () => {
      closeLogin();
      shell.hidden = false;
      document.body.style.overflow = 'hidden';
      resetAdminIdleTimer();
      switchTab('items');
    };

    $('#brandLogoToggle')?.addEventListener('click', () => {
      const adminButton = $('#brandAdminLaunch');
      adminButton.hidden = !adminButton.hidden;
      $('#brandLogoToggle').setAttribute('aria-expanded', String(!adminButton.hidden));
      if (!adminButton.hidden) adminButton.focus();
    });

    document.addEventListener('click', event => {
      if (event.target instanceof Element && event.target.closest('.brand-admin-menu')) return;
      const adminButton = $('#brandAdminLaunch');
      if (adminButton) adminButton.hidden = true;
      $('#brandLogoToggle')?.setAttribute('aria-expanded', 'false');
    });

    $('#adminLaunch')?.addEventListener('click', showLogin);
    $('#brandAdminLaunch')?.addEventListener('click', showLogin);

    loginForm?.addEventListener('submit', event => {
      event.preventDefault();
      const password = $('#adminPassword').value.trim();
      if (password.length < 5 || password.length > 20) {
        $('#adminLoginError').textContent = 'Parol 5 dan 20 tagacha belgidan iborat bo‘lishi kerak.';
        return;
      }
      if (password !== getAdminPassword()) {
        $('#adminLoginError').textContent = 'Parol noto‘g‘ri. Qaytadan urinib ko‘ring.';
        $('#adminPassword').select();
        return;
      }
      openAdmin();
    });

    $('#adminLoginCancel')?.addEventListener('click', closeLogin);
    $$('[data-login-close]', login).forEach(button => button.addEventListener('click', closeLogin));

    $('#adminBackBtn')?.addEventListener('click', () => {
      if (form && !form.hidden) {
        closeForm();
        return;
      }
      if (catForm && !catForm.hidden) {
        closeCategoryForm();
        return;
      }
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      closeAdminPanel();
    });

    $$('[data-admin-close]', shell).forEach(button => button.addEventListener('click', closeAdminPanel));

    // ===================== TABLAR HODISALARI =====================
    tabItemsBtn?.addEventListener('click', () => switchTab('items'));
    tabContactsBtn?.addEventListener('click', () => switchTab('contacts'));
    tabSettingsBtn?.addEventListener('click', () => switchTab('settings'));

    // ===================== TAOMLAR BO'LIMI HODISALARI =====================
    $('#adminAdd')?.addEventListener('click', () => openForm());
    $('#adminCancel')?.addEventListener('click', closeForm);
    $('#adminSearch')?.addEventListener('input', renderList);
    $('#adminExport')?.addEventListener('click', exportBackup);
    $('#adminImport')?.addEventListener('click', () => $('#adminImportFile').click());
    $('#adminImportFile')?.addEventListener('change', event => {
      importBackup(event.target.files[0]);
      event.target.value = '';
    });
    categorySelect?.addEventListener('change', () => populateSubcategories(categorySelect.value));
    hasKgCalcCheckbox?.addEventListener('change', () => {
      const enabled = hasKgCalcCheckbox.checked;
      halfKgPriceField.hidden = !enabled;
      halfKgPriceInput.required = enabled;
      if (!enabled) halfKgPriceInput.value = '';
    });

    // Yangi bo'lim (button) qo'shish
    addCatBtn?.addEventListener('click', openCategoryForm);
    cancelCatBtn?.addEventListener('click', closeCategoryForm);

    catForm?.addEventListener('submit', event => {
      event.preventDefault();
      const name = catNameInput.value.trim();
      const desc = catDescInput.value.trim();
      const subcategoryNames = catSubcategoriesInput.value.split(',')
        .map(item => item.trim())
        .filter((item, index, values) => item && values.findIndex(value => value.toLocaleLowerCase() === item.toLocaleLowerCase()) === index);

      if (!name) {
        status.textContent = 'Iltimos, yangi bo‘lim nomini kiriting.';
        return;
      }
      if (subcategoryNames.some(item => item.length > 50)) {
        status.textContent = 'Ichki bo‘lim nomi 50 belgidan oshmasligi kerak.';
        return;
      }
      if (subcategoryNames.length > 20) {
        status.textContent = 'Bitta bo‘limga ko‘pi bilan 20 ta ichki bo‘lim qo‘shish mumkin.';
        return;
      }

      // ID generatsiya qilish
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const catId = 'cat-' + (slug || Date.now().toString(36));

      if (categoryOptions.some(opt => opt.value === catId || opt.label.toLowerCase() === name.toLowerCase())) {
        status.textContent = 'Bunday nomli bo‘lim allaqachon mavjud!';
        return;
      }

      const subcategories = subcategoryNames.map((subName, index) => ({
        id: 'sub-' + (index + 1),
        name: subName
      }));
      const nextCats = [...customCategories, { id: catId, name, desc, subcategories }];
      if (saveCustomCategories(nextCats)) {
        closeCategoryForm();
        status.textContent = '“' + name + '” bo‘limi (button) menyuga muvaffaqiyatli qo‘shildi!';
      }
    });

    form?.addEventListener('submit', event => {
      event.preventDefault();
      const name = $('#adminName').value.trim();
      const price = Number($('#adminPrice').value);
      const image = selectedAdminImage || adminImageInput.value.trim();
      const hasKgCalc = Boolean(hasKgCalcCheckbox?.checked);
      const halfKgPrice = Number(halfKgPriceInput?.value);

      if (!name || !Number.isSafeInteger(price) || price < 0 ||
        (hasKgCalc && (!Number.isSafeInteger(halfKgPrice) || halfKgPrice < 0)) ||
        !isValidImage(image)) {
        status.textContent = hasKgCalc
          ? 'Taom nomi, narx, 0.5 kg narxi yoki rasm manzilini tekshiring.'
          : 'Taom nomi, narx yoki rasm manzilini tekshiring.';
        return;
      }

      const record = {
        id: editingId || 'admin-item-' + (
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString(36) + Math.random().toString(36).slice(2)
        ),
        category: categorySelect.value,
        subcategory: subcategorySelect ? subcategorySelect.value : '',
        name,
        price,
        hasKgCalc,
        halfKgPrice: hasKgCalc ? halfKgPrice : undefined,
        image,
        description: $('#adminDescription').value.trim()
      };

      const next = editingId
        ? records.map(item => item.id === editingId ? record : item)
        : [...records, record];
      if (persist(next)) closeForm();
    });

    // ===================== ALOQA BO'LIMI HODISALARI =====================
    addPhoneBtn?.addEventListener('click', () => {
      currentContactPhones.push('');
      renderPhoneInputs(currentContactPhones);
      const inputs = $$('.admin-phone-input');
      inputs[inputs.length - 1]?.focus();
    });

    contactForm?.addEventListener('submit', event => {
      event.preventDefault();
      const address = $('#contactInputAddress').value.trim();
      const mapUrl = $('#contactInputMapUrl').value.trim();
      const callPhone = $('#contactInputCallPhone').value.trim();
      const hours = $('#contactInputHours').value.trim();
      const hoursNote = $('#contactInputHoursNote').value.trim();
      const instagram = $('#contactInputInstagram').value.trim();
      const telegram = $('#contactInputTelegram').value.trim();

      const phoneInputs = $$('.admin-phone-input', phonesList);
      const collectedPhones = phoneInputs
        .map(input => input.value.trim())
        .filter(val => val.length > 0);

      if (!address) {
        status.textContent = 'Iltimos, manzilni kiriting.';
        return;
      }
      if (collectedPhones.length === 0) {
        status.textContent = 'Kamida bitta telefon raqami kiritilishi kerak.';
        return;
      }
      if (!callPhone) {
        status.textContent = 'Telefon belgisi uchun raqamni kiriting.';
        return;
      }
      if (!hours) {
        status.textContent = 'Iltimos, ish vaqtini kiriting.';
        return;
      }

      const nextContacts = {
        address,
        mapUrl,
        phones: collectedPhones,
        callPhone,
        hours,
        hoursNote,
        instagram,
        telegram
      };

      try {
        localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(nextContacts));
        applyContacts(nextContacts);
        status.textContent = 'Aloqa ma’lumotlari muvaffaqiyatli saqlandi va saytda yangilandi!';
      } catch (err) {
        status.textContent = 'Saqlashda xatolik: ' + err.message;
      }
    });

    contactResetBtn?.addEventListener('click', () => {
      showConfirmDialog({
        title: 'Tasdiqlash',
        message: 'Barcha aloqa ma’lumotlarini dastlabki holatga qaytarishni xohlaysizmi?',
        onConfirm: () => {
          try {
            localStorage.removeItem(CONTACTS_STORAGE_KEY);
            applyContacts(DEFAULT_CONTACTS);
            populateContactForm();
            status.textContent = 'Aloqa ma’lumotlari dastlabki holatga qaytarildi.';
          } catch (err) {
            status.textContent = 'Qaytarishda xatolik: ' + err.message;
          }
        }
      });
    });

    settingsResetPasswordBtn?.addEventListener('click', () => {
      settingsForm?.reset();
      status.textContent = '';
      settingsCurrentPassword?.focus();
    });

    settingsForm?.addEventListener('submit', event => {
      event.preventDefault();

      const current = (settingsCurrentPassword?.value || '').trim();
      const next = (settingsNewPassword?.value || '').trim();
      const confirmed = (settingsConfirmPassword?.value || '').trim();

      if (!current || !next || !confirmed) {
        status.textContent = 'Iltimos, barcha maydonlarni to‘ldiring.';
        return;
      }

      if (current !== getAdminPassword()) {
        status.textContent = 'Hozirgi parol noto‘g‘ri.';
        settingsCurrentPassword?.select();
        return;
      }

      if (next.length < 5 || next.length > 20) {
        status.textContent = 'Yangi parol 5 dan 20 tagacha belgidan iborat bo‘lishi kerak.';
        settingsNewPassword?.select();
        return;
      }

      if (next !== confirmed) {
        status.textContent = 'Yangi parollar mos kelmadi.';
        settingsConfirmPassword?.select();
        return;
      }

      if (next === current) {
        status.textContent = 'Yangi parol eski parol bilan bir xil bo‘lishi mumkin emas.';
        settingsNewPassword?.select();
        return;
      }

      if (setAdminPassword(next)) {
        settingsForm.reset();
        status.textContent = 'Parol muvaffaqiyatli o‘zgartirildi!';
      }
    });

    // ===================== GLOBAL HODISALAR =====================
    ['pointermove', 'pointerdown', 'keydown', 'input', 'change', 'wheel', 'focusin'].forEach(eventName => {
      document.addEventListener(eventName, () => {
        if (!shell.hidden) resetAdminIdleTimer();
      }, { passive: true });
    });

    document.addEventListener('keydown', event => {
      const confirmModal = document.getElementById(confirmModalId);
      if (event.key === 'Escape' && confirmModal && confirmModal.classList.contains('open')) {
        confirmModal.classList.remove('open');
        confirmModal.setAttribute('aria-hidden', 'true');
        return;
      }
      if (event.key === 'Escape' && !login.hidden) closeLogin();
      if (event.key === 'Escape' && !shell.hidden) {
        closeAdminPanel();
      }
    });

    window.addEventListener('storage', event => {
      if (event.key === STORAGE_KEY && event.newValue !== null) {
        try {
          const parsed = readBackup(event.newValue);
          deletedItemIds = parsed.deletedItemIds || [];
          const deletedIds = new Set(deletedItemIds);
          records = parsed.records.filter(record => !deletedIds.has(record.id));
          applyRecords();
          renderList();
          status.textContent = 'Menyu boshqa oynadagi o‘zgarish bilan yangilandi.';
        } catch (error) {
          status.textContent = 'Boshqa oynadan kelgan menyu yaroqsiz: ' + error.message;
        }
      }
      if (event.key === CATEGORIES_STORAGE_KEY) {
        customCategories = loadCustomCategories();
        applyCustomCategoriesToSite();
        categoryOptions = getCategoryOptions();
        populateCategorySelect();
        renderCategoryFilters();
        renderCustomCatsManage();
      }
      if (event.key === CONTACTS_STORAGE_KEY) {
        applyContacts();
        if (!shell.hidden && !sectionContacts.hidden) {
          populateContactForm();
        }
      }
    });
  }

  window.addEventListener('DOMContentLoaded', initialize);
})();
