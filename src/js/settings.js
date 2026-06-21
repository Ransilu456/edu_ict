import UserService from './user-service.js';

const LANG_DICT = {
  en: {
    title: "Settings & Progress Sync",
    subtitle: "Configure your study options and back up or synchronize your learning progress.",
    profileTitle: "User Profile",
    profileSub: "Set your display name",
    usernameLabel: "Student Name / Alias",
    mediumTitle: "Learning Medium",
    mediumSub: "Choose your A/L study language",
    syncTitle: "Data Synchronisation",
    syncSub: "Transfer progress between phone and computer — no cloud required",
    exportLabel: "Export Progress Code",
    importLabel: "Import Progress Code",
    dangerTitle: "Danger Zone",
    dangerSub: "Actions that permanently erase your learning achievements",
    saveBtn: "Save",
    copyBtn: "Copy Sync Code",
    importBtn: "Import & Overwrite",
    resetBtn: "Reset Everything",
    alertSave: "Profile saved successfully!",
    alertCopy: "Sync code copied to clipboard!",
    alertImportSuccess: "Progress successfully imported and synced!",
    alertImportError: "Invalid sync code.",
    alertResetConfirm: "Are you absolutely sure you want to reset all progress? This cannot be undone.",
    interfaceModeTitle: "Interface Theme",
    interfaceModeSub: "Select learning layout style",
    classicModeLabel: "Classic Mode (Gamified)",
    proModeLabel: "Professional Mode (Academic)",
    bilingualSuffix: ""
  },
  si: {
    title: "සැකසුම් සහ ප්‍රගති සමමුහුර්තකරණය (Settings & Sync)",
    subtitle: "ඔබගේ අධ්‍යයන විකල්ප සකසන්න සහ ඔබගේ ඉගෙනුම් ප්‍රගතිය සුරකින්න හෝ සමමුහුර්ත කරන්න.",
    profileTitle: "පරිශීලක පැතිකඩ (User Profile)",
    profileSub: "ඔබගේ නම සකසන්න",
    usernameLabel: "ශිෂ්‍යයාගේ නම / අන්වර්ථ නාමය (Student Name)",
    mediumTitle: "ඉගෙනුම් මාධ්‍යය (Learning Medium)",
    mediumSub: "ඔබගේ උ/පෙළ ඉගෙනුම් භාෂාව තෝරන්න",
    syncTitle: "දත්ත සමමුහුර්තකරණය (Data Synchronisation)",
    syncSub: "ජංගම දුරකථනය සහ පරිගණකය අතර ප්‍රගතිය හුවමාරු කරගන්න",
    exportLabel: "ප්‍රගති කේතය අපනයනය කරන්න (Export Code)",
    importLabel: "ප්‍රගති කේතය ආනයනය කරන්න (Import Code)",
    dangerTitle: "අන්තරාදායක කලාපය (Danger Zone)",
    dangerSub: "ඔබගේ ඉගෙනුම් ජයග්‍රහණ ස්ථිරවම මකා දමන ක්‍රියා",
    saveBtn: "සුරකින්න",
    copyBtn: "සමමුහුර්ත කේතය පිටපත් කරන්න",
    importBtn: "ආනයනය කර ප්‍රතිස්ථාපනය කරන්න",
    resetBtn: "සියල්ල මුල සිට ආරම්භ කරන්න",
    alertSave: "පැතිකඩ සාර්ථකව සුරකින ලදී!",
    alertCopy: "සමමුහුර්ත කේතය පසුපතට පිටපත් කරන ලදී!",
    alertImportSuccess: "ප්‍රගතිය සාර්ථකව ආනයනය කර සමමුහුර්ත කරන ලදී!",
    alertImportError: "වලංගු නොවන සමමුහුර්ත කේතයකි.",
    alertResetConfirm: "ඔබට සියලු ප්‍රගතිය මකා දැමීමට අවශ්‍ය බව සහතිකද? මෙය ආපසු හැරවිය නොහැක.",
    interfaceModeTitle: "අතුරුමුහුණත් තේමාව (Interface Theme)",
    interfaceModeSub: "ඉගෙනුම් පිරිසැලසුම් විලාසය තෝරන්න",
    classicModeLabel: "ක්ලැසික් ප්‍රකාරය (Classic Mode)",
    proModeLabel: "වෘත්තීය ප්‍රකාරය (Professional Mode)",
    bilingualSuffix: " (Sinhala Medium)"
  }
};

let settingsInitialized = false;

export function initSettingsView() {
  const usernameInput = document.getElementById('settings-username-input');
  if (!usernameInput || settingsInitialized) return;
  settingsInitialized = true;
  const currentMedium = localStorage.getItem('logicQuest_medium') || 'en';
  const currentName = localStorage.getItem('logicQuest_username') || 'A/L Student';

  usernameInput.value = currentName;
  const radios = document.getElementsByName('settings-medium');
  radios.forEach(radio => {
    if (radio.value === currentMedium) {
      radio.checked = true;
    }
    radio.addEventListener('change', () => {
      const selected = radio.value;
      localStorage.setItem('logicQuest_medium', selected);
      applyLanguage(selected);
      if (window.playSound) window.playSound('click');
    });
  });

  // Interface Mode radio settings init
  const currentMode = localStorage.getItem('logicQuest_interfaceMode') || 'classic';
  const modeRadios = document.getElementsByName('settings-interface-mode');
  modeRadios.forEach(radio => {
    if (radio.value === currentMode) {
      radio.checked = true;
    }
    radio.addEventListener('change', () => {
      const selected = radio.value;
      if (window.playSound) window.playSound('click');
      if (window.setInterfaceMode) {
        window.setInterfaceMode(selected);
      } else {
        localStorage.setItem('logicQuest_interfaceMode', selected);
      }
    });
  });
  document.getElementById('settings-save-profile-btn')?.addEventListener('click', () => {
    const newName = usernameInput.value.trim() || 'A/L Student';
    localStorage.setItem('logicQuest_username', newName);
    const activeLang = localStorage.getItem('logicQuest_medium') || 'en';
    window.showToast(LANG_DICT[activeLang].alertSave);
    if (window.playSound) window.playSound('success');
  });
  updateExportCode();
  document.getElementById('settings-copy-code-btn')?.addEventListener('click', () => {
    const exportArea = document.getElementById('settings-export-code');
    if (exportArea) {
      exportArea.select();
      navigator.clipboard.writeText(exportArea.value).then(() => {
        const activeLang = localStorage.getItem('logicQuest_medium') || 'en';
        window.showToast(LANG_DICT[activeLang].alertCopy);
        if (window.playSound) window.playSound('success');
      });
    }
  });
  document.getElementById('settings-import-code-btn')?.addEventListener('click', async () => {
    const importInput = document.getElementById('settings-import-code');
    const code = importInput ? importInput.value.trim() : '';
    const activeLang = localStorage.getItem('logicQuest_medium') || 'en';

    if (!code) return;

    try {
      const decodedStr = atob(code);
      const parsed = JSON.parse(decodedStr);

      if (parsed && parsed.user_id) {
        localStorage.setItem('logicQuest_state', decodedStr);
        if (parsed.username) {
          localStorage.setItem('logicQuest_username', parsed.username);
          usernameInput.value = parsed.username;
        }
        if (parsed.medium) {
          localStorage.setItem('logicQuest_medium', parsed.medium);
          const activeRadio = Array.from(radios).find(r => r.value === parsed.medium);
          if (activeRadio) activeRadio.checked = true;
          applyLanguage(parsed.medium);
        }
        await UserService.refresh();
        if (window.updateXPDisplay) window.updateXPDisplay();
        if (window.syncCompletionState) window.syncCompletionState();
        if (window.syncCourseProgression) window.syncCourseProgression();
        
        updateExportCode();
        if (importInput) importInput.value = '';

        window.showToast(LANG_DICT[activeLang].alertImportSuccess);
        if (window.playSound) window.playSound('success');
      } else {
        throw new Error();
      }
    } catch (e) {
      window.showAlert(LANG_DICT[activeLang].alertImportError, 'Error');
      if (window.playSound) window.playSound('error');
    }
  });
  document.getElementById('settings-reset-btn')?.addEventListener('click', async () => {
    const activeLang = localStorage.getItem('logicQuest_medium') || 'en';
    window.showConfirm(LANG_DICT[activeLang].alertResetConfirm, async (result) => {
      if (result) {
        await UserService.reset();
        localStorage.removeItem('logicQuest_username');
        localStorage.removeItem('logicQuest_medium');
        usernameInput.value = 'A/L Student';
        const enRadio = Array.from(radios).find(r => r.value === 'en');
        if (enRadio) enRadio.checked = true;
        applyLanguage('en');
        updateExportCode();
        if (window.updateXPDisplay) window.updateXPDisplay();
        if (window.playSound) window.playSound('success');
        location.reload();
      }
    });
  });
  // Stats grid was removed from HTML to clean up the interface
  applyLanguage(currentMedium);
}

function updateExportCode() {
  const exportArea = document.getElementById('settings-export-code');
  if (!exportArea) return;

  const rawState = localStorage.getItem('logicQuest_state') || '{}';
  try {
    const parsed = JSON.parse(rawState);
    parsed.username = localStorage.getItem('logicQuest_username') || 'A/L Student';
    parsed.medium = localStorage.getItem('logicQuest_medium') || 'en';
    const stringified = JSON.stringify(parsed);
    exportArea.value = btoa(stringified);
  } catch(e) {
    exportArea.value = btoa(rawState);
  }
}

function applyLanguage(lang) {
  const dict = LANG_DICT[lang];
  if (!dict) return;
  const setHtml = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

  setText('settings-title', dict.title);
  setText('settings-subtitle', dict.subtitle);
  setText('settings-card-profile-title', dict.profileTitle);
  setText('settings-card-profile-sub', dict.profileSub);
  setText('settings-label-username', dict.usernameLabel);
  setText('settings-card-medium-title', dict.mediumTitle);
  setText('settings-card-medium-sub', dict.mediumSub);
  setText('settings-card-sync-title', dict.syncTitle);
  setText('settings-card-sync-sub', dict.syncSub);
  setText('settings-label-export', dict.exportLabel);
  setText('settings-label-import', dict.importLabel);
  setText('settings-card-danger-title', dict.dangerTitle);
  setText('settings-card-danger-sub', dict.dangerSub);

  // Localization for Interface Mode selectors
  setText('settings-card-mode-title', dict.interfaceModeTitle);
  setText('settings-card-mode-sub', dict.interfaceModeSub);
  setText('settings-mode-classic-label', dict.classicModeLabel);
  setText('settings-mode-pro-label', dict.proModeLabel);

  const saveBtn = document.getElementById('settings-save-profile-btn');
  if (saveBtn) saveBtn.textContent = dict.saveBtn;

  const copyBtn = document.getElementById('settings-copy-code-btn');
  if (copyBtn) {
    copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:6px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>${dict.copyBtn}`;
  }

  const importBtn = document.getElementById('settings-import-code-btn');
  if (importBtn) {
    importBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>${dict.importBtn}`;
  }

  const resetBtn = document.getElementById('settings-reset-btn');
  if (resetBtn) {
    resetBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:6px"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>${dict.resetBtn}`;
  }
  const subnetTitle = document.querySelector('.subnetting-view .util-view-title');
  if (subnetTitle) {
    if (lang === 'si') subnetTitle.innerHTML = 'සබ්නෙටින් මාස්ටර් <span style="font-size:1.2rem; opacity:0.8; font-weight:normal">(Subnetting Master)</span>';
    else subnetTitle.textContent = 'Subnetting Master';
  }

  const signalTitle = document.querySelector('.encoder-view .util-view-title');
  if (signalTitle) {
    if (lang === 'si') signalTitle.innerHTML = 'සංඥා කේතන විද්‍යාගාරය <span style="font-size:1.2rem; opacity:0.8; font-weight:normal">(Signal Encoding Lab)</span>';
    else signalTitle.textContent = 'Signal Encoding Lab';
  }
}
window.initSettingsView = initSettingsView;
