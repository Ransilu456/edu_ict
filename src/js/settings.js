export const TRANSLATIONS = {
  en: {
    /* ── Header / Nav ── */
    nav_home: "Home",
    nav_course: "Course",
    nav_explorer: "Explorer",
    nav_sandbox: "Sandbox",
    nav_subnetting: "Subnetting",
    nav_signal: "Signal Lab",
    nav_settings: "Settings",
    nav_subnet_short: "Subnet",
    nav_signal_short: "Signal",

    mode_classic: "Classic",
    mode_pro: "Pro",
    xp_label: "XP",

    btn_run: "Run",
    btn_clear: "Clear",
    btn_save: "Save",
    btn_load: "Load",
    btn_export: "Export",
    btn_import: "Import",
    btn_theory: "Theory Guide",
    btn_gate_box: "Gate: Box",

    /* ── Home Hero ── */
    hero_badge: "A/L ICT Interactive Platform",
    hero_title1: "Master Digital Logic",
    hero_title2: "One Gate at a Time",
    hero_subtitle: "From transistors to full adders — learn, simulate, and quiz yourself with interactive circuits and visualizations",
    hero_start: "Start Learning",
    hero_sandbox: "Open Sandbox",
    hero_xp_label: "XP Earned",
    hero_lesson_label: "Current Lesson",
    hero_pct_label: "Complete",

    /* ── Home Activity Strip ── */
    stat_sessions: "Sessions",
    stat_streak: "Day Streak",
    stat_lastactive: "Last Active",

    /* ── Home Features ── */
    features_title: "Everything you need to ace A/L ICT",

    feat_course_title: "Guided Course",
    feat_course_desc: "Step through 9 interactive lessons from binary to full adders with instant quiz feedback",
    feat_course_tag1: "9 Lessons",
    feat_course_tag2: "+10 XP each",

    feat_sandbox_title: "Sandbox Builder",
    feat_sandbox_desc: "Drag-and-drop logic gates to build custom circuits. Simulate flip-flops, adders, and more in real time",
    feat_sandbox_tag1: "15 Components",
    feat_sandbox_tag2: "Live Sim",

    feat_explorer_title: "Gate Explorer",
    feat_explorer_desc: "Inspect any logic gate's truth table, transistor-level schematic, and boolean expression",
    feat_explorer_tag1: "Truth Tables",
    feat_explorer_tag2: "Transistors",

    feat_subnet_title: "Subnetting Master",
    feat_subnet_desc: "CIDR visualizer, subnet block explorer, IP calculator, wildcard masks — plus a timed challenge quiz",
    feat_subnet_tag1: "CIDR & Masks",
    feat_subnet_tag2: "IP Calculator",

    feat_signal_title: "Signal Encoding Lab",
    feat_signal_desc: "Visualise ASK, FSK, PSK, NRZ-L, Manchester on live canvas. Encode/decode bits, calculate channel capacity",
    feat_signal_tag1: "Analog & Digital",
    feat_signal_tag2: "Shannon's Law",

    feat_progress_title: "Your Progress",
    feat_progress_desc: "Start the course to earn XP and track your progress!",

    /* ── Toolbox ── */
    toolbox_title: "Toolbox",
    toolbox_desc: "Drag onto canvas or click to place. Connect by clicking output → input port.",
    toolbox_inputs: "Inputs",
    toolbox_gates: "Logic Gates",
    toolbox_outputs: "Outputs",
    toolbox_compound: "Compound Circuits",
    toolbox_advanced: "Advanced",
    toolbox_electricity: "Electricity",
    toolbox_templates: "Templates",
    toolbox_template_hint: "Drag to drop anywhere on canvas, or click to load template.",

    tool_toggle: "Toggle Switch",
    tool_clock: "Clock Signal",
    tool_and: "AND Gate",
    tool_or: "OR Gate",
    tool_not: "NOT Gate",
    tool_nand: "NAND Gate",
    tool_nor: "NOR Gate",
    tool_xor: "XOR Gate",
    tool_xnor: "XNOR Gate",
    tool_led: "LED Light",
    tool_half_adder: "Half Adder",
    tool_full_adder: "Full Adder",
    tool_d_flop: "D Flip-Flop",
    tool_seven_seg: "7-Seg Display",
    tool_text_label: "Text Label",
    tool_battery: "Battery",
    tool_resistor: "Resistor",
    tool_bulb: "Bulb",
    tool_switch: "Switch",
    tool_ammeter: "Ammeter",
    tool_voltmeter: "Voltmeter",
    tool_motor: "Electric Motor",
    tool_fuse: "Fuse",
    tool_led_elec: "LED",
    tool_junction: "Wire Junction",
    tool_transistor: "NPN Transistor",

    /* ── Templates ── */
    tpl_not_name: "NOT Inverter",
    tpl_not_desc: "Switch → NOT → LED",
    tpl_and_name: "AND Gate Test",
    tpl_and_desc: "2 switches → AND → LED",
    tpl_xor_name: "XOR Parity",
    tpl_xor_desc: "3-bit parity checker",
    tpl_sr_name: "SR Latch",
    tpl_sr_desc: "NAND feedback latch",
    tpl_ha_name: "Half Adder",
    tpl_ha_desc: "S + Carry logic",
    tpl_fa_name: "Full Adder",
    tpl_fa_desc: "Gate-level 3-bit adder",
    tpl_nand_name: "NAND → AND",
    tpl_nand_desc: "Universal NAND gate demo",
    tpl_dff_name: "1-Bit Register",
    tpl_dff_desc: "D Flip-Flop rising clock",
    tpl_dec_name: "7-Seg Decoder",
    tpl_dec_desc: "4-bit hex display tester",
    tpl_divider: "A/L Physics — Electricity",
    tpl_ohm_name: "Ohm's Law",
    tpl_ohm_desc: "V=IR with ammeter",
    tpl_vdiv_name: "Voltage Divider",
    tpl_vdiv_desc: "Vout = Vin × R2/(R1+R2)",
    tpl_bulb_name: "Simple Circuit",
    tpl_bulb_desc: "Battery → resistor → bulb",
    tpl_trans_name: "Transistor Switch",
    tpl_trans_desc: "NPN + base switch → LED",
    tpl_tc_name: "Transistor Load",
    tpl_tc_desc: "Transistor-controlled bulb",

    /* ── Subnetting View ── */
    sn_badge: "A/L ICT Networking",
    sn_title: "Subnetting Master",
    sn_subtitle: "Learn the mental math patterns to solve network subnetting questions instantly.",

    sn_cidr_title: "Interactive CIDR Visualizer",
    sn_cidr_sub: "Class A / B / C Support",
    sn_cidr_desc: "Drag the slider — see binary bits, subnet mask, and block sizes update live.",
    sn_mask: "Subnet Mask",
    sn_magic: "Block Size (Magic #)",
    sn_subnets_oct: "Subnets in Octet",
    sn_hosts: "Usable Hosts",

    sn_ip_title: "IP Subnet Block Finder",
    sn_ip_sub: "Type an IP to locate its subnet block",
    sn_ip_btn: "Locate Subnet",
    sn_block_head: "Subnet Blocks for /",

    sn_cheat_title: "CIDR Reference Cheat Table",
    sn_cheat_sub: "Dynamic for the active Class block",
    sn_col_cidr: "CIDR",
    sn_col_mask: "Subnet Mask",
    sn_col_hosts: "Usable Hosts",
    sn_col_block: "Block Size",

    sn_trick_title: "The Mental Subnetting Trick",
    sn_trick_sub: "4 steps to instant answers",
    sn_step1_title: "Find the Magic Octet",
    sn_step1_desc: "Divide CIDR by 8 → which octet has the boundary?\nClass A (/8–/15) → 2nd octet | Class B (/16–/23) → 3rd | Class C (/24–/30) → 4th",
    sn_step2_title: "Find Subnet & Host Bits",
    sn_step2_desc: "Subnet bits = CIDR − class boundary. Host bits = 8 − subnet bits.\nE.g. /18 (Class B): subnet bits = 18 − 16 = 2, host bits = 8 − 2 = 6",
    sn_step3_title: "Block Size (Magic Number)",
    sn_step3_desc: "Magic = 2^host bits. For 6 host bits → 2^6 = 64.\nSubnets increment by 64: .0, .64, .128, .192",
    sn_step4_title: "Usable Hosts",
    sn_step4_desc: "Formula: 2^(32 − CIDR) − 2. Subtract 2 for Network & Broadcast addresses.",

    sn_formula_title: "Formula Quick Reference",
    sn_formula_sub: "A/L ICT key subnetting formulas",
    sn_f_block: "Block Size",
    sn_f_hosts: "Usable Hosts",
    sn_f_subnets: "Subnets",
    sn_f_net: "Network Addr",

    sn_quiz_title: "Subnet Mental Trainer",
    sn_quiz_sub: "Interactive 5-Question Challenge",
    sn_quiz_desc: "Master the mental tricks to solve subnetting questions instantly.",
    sn_quiz_btn: "Start Subnetting Challenge ➔",

    /* ── Signal Encoding View ── */
    enc_badge: "A/L ICT Networking",
    enc_title: "Signal Encoding Lab",
    enc_subtitle: "Visualise ASK, FSK, PSK, NRZ-L/I, RZ, Manchester, AMI & Pseudoternary. Toggle bits — see waveforms update live.",

    enc_tab_analog: "Analog Encoding",
    enc_tab_digital: "Digital Line Codes",
    enc_tab_decoder: "Decoder Tool",
    enc_tab_theory: "Theory & Reference",
    enc_tab_quiz: "Quiz",

    enc_analog_title: "Analog Signal Encoding",
    enc_analog_sub: "Toggle bits → see ASK, FSK & PSK modulate a carrier wave",
    enc_bits_label: "Binary Data Bits (click to toggle)",
    enc_carrier: "Carrier Frequency",
    enc_ask_amp: "ASK Amplitude",
    enc_fsk_mult: "FSK Freq Multiplier",

    enc_digital_title: "Digital Line Coding Schemes",
    enc_digital_sub: "NRZ-L, NRZ-I, RZ, AMI — click bits to update",
    enc_bits_label2: "Binary Data Bits",

    enc_decoder_title: "Signal Decoder",
    enc_decoder_sub: "Paste encoded bits → choose scheme → decode",
    enc_input_label: "Encoded Bit String",
    enc_decode_btn: "Decode →",
    enc_clear_btn: "Clear",
    enc_decoded_out: "Decoded Output",
    enc_encode_title: "Encode Data Bits",
    enc_encode_sub: "Type raw bits → select scheme → see encoded output",
    enc_raw_label: "Raw Data Bits",
    enc_encoded_out: "Encoded Output",

    enc_theory_title: "Theory Reference — Signal Encoding",
    enc_theory_sub: "Key concepts for A/L ICT Paper 2",
    enc_term_head: "Key Terminology",
    enc_scheme_head: "Scheme Comparison",
    enc_bw_title: "Bandwidth & Channel Capacity Calculator",
    enc_bw_sub: "Nyquist & Shannon formula trainer",
    enc_bw_label: "Bandwidth (Hz)",
    enc_snr_label: "SNR (Signal-to-Noise Ratio)",
    enc_m_label: "Signal Levels (M)",
    enc_calc_btn: "Calculate Capacity",

    enc_quiz_title: "Signal Encoding Quiz",
    enc_quiz_sub: "Interactive 5-Question Challenge",
    enc_quiz_desc: "Test your A/L ICT knowledge of Analog/Digital line coding and formulas.",
    enc_quiz_btn: "Start Signal Quiz ➔",

    /* ── Settings ── */
    settings_title: "Settings & Progress",
    settings_subtitle: "Configure your study options and back up learning progress.",
    profile_title: "User Profile",
    profile_sub: "Set your display name",
    username_label: "Student Name / Alias",
    medium_title: "Learning Medium",
    medium_sub: "Choose your A/L study language",
    mode_title: "Interface Theme",
    mode_sub: "Select learning layout style",
    classic_label: "Classic Mode (Gamified)",
    pro_label: "Professional Mode (Academic)",
    sync_title: "Data Sync",
    sync_sub: "Transfer progress between devices",
    export_label: "Export Code",
    import_label: "Import Code",
    danger_title: "Danger Zone",
    danger_sub: "Irreversible actions",
    danger_reset_title: "Reset all progress",
    danger_reset_desc: "All XP, keys, and lesson data will be lost",

    btn_save_profile: "Save",
    btn_copy_code: "Copy Code",
    btn_import_code: "Import",
    btn_reset: "Reset",

    alert_saved: "Profile saved successfully!",
    alert_copied: "Sync code copied to clipboard!",
    alert_import_ok: "Progress successfully imported and synced!",
    alert_import_err: "Invalid sync code.",
    alert_reset_confirm: "Are you absolutely sure you want to reset all progress? This cannot be undone.",

    /* ── Course / Quiz ── */
    course_back: "← Back",
    check_answer: "Check Answer",
    lesson_loading: "Loading Lesson…",
    lesson_wait: "Please wait while the course materials load…",

    /* ── Modals ── */
    modal_completed: "Course Completed!",
    modal_completed_msg: "Incredible! You have mastered Digital Logic and Networking fundamentals. Try building your own circuits in the Sandbox!",
    modal_open_sandbox: "Open Sandbox Canvas",
    modal_close: "Close",

    /* ── Footer ── */
    footer_text: "© 2026 LogicQuest. Developed by Keshan Ransilu.",

    /* ── Sandbox Theory Panel ── */
    theory_panel_title: "Circuit Guide & Theory",
    theory_panel_empty: "Select or drag a template circuit to view theory and challenges here!",

    /* ── Sandbox Modals ── */
    save_modal_title: "Save Circuit",
    save_placeholder: "Enter circuit name…",
    btn_cancel: "Cancel",
    load_modal_title: "Load Circuit",
    btn_close: "Close",

    /* ── Kids Mode Labels ── */
    kids_label: "Kids Mode (Playful)",
    kids_energy_label: "⚡ ENERGY (XP)",
    kids_goal_label: "🎓 LESSON GOAL",
    kids_grid_lang: "Language",
    kids_grid_theme: "Theme Mode",
    kids_grid_sfx: "Sound FX",
    kids_grid_alerts: "Interface",
    kids_backup_label: "Backup My Progress",
  },

  /* ════════════════════════════════════════════════════════════
     SINHALA TRANSLATIONS
     ════════════════════════════════════════════════════════════ */
  si: {
    /* ── Header / Nav ── */
    nav_home: "මුල් පිටුව",
    nav_course: "පාඨමාලාව",
    nav_explorer: "ගේට් ගවේෂකය",
    nav_sandbox: "සෑන්ඩ්බොක්ස්",
    nav_subnetting: "සබ්නෙටිං",
    nav_signal: "සංඥා රසායනාගාරය",
    nav_settings: "සැකසුම්",
    nav_subnet_short: "සබ්නෙට්",
    nav_signal_short: "සංඥා",

    mode_classic: "සම්භාව්‍ය",
    mode_pro: "වෘත්තීය",
    xp_label: "XP",

    btn_run: "ධාවනය",
    btn_clear: "හිස් කරන්න",
    btn_save: "සුරකින්න",
    btn_load: "පූරණය",
    btn_export: "අපනයනය",
    btn_import: "ආනයනය",
    btn_theory: "න්‍යාය මාර්ගෝපදේශය",
    btn_gate_box: "ගේට්: කොටුව",

    /* ── Home Hero ── */
    hero_badge: "A/L ICT අන්තර්ක්‍රියාකාරී වේදිකාව",
    hero_title1: "ඩිජිටල් තර්කනය ප්‍රගුණ කරන්න",
    hero_title2: "එක් ගේට්ටුවක් බැගින්",
    hero_subtitle: "ට්‍රාන්සිස්ටරයේ සිට සම්පූර්ණ ඇඩරය දක්වා — අන්තර්ක්‍රියාකාරී පරිපථ සහ දෘශ්‍යකරණ සමඟ ඉගෙනන්න, අනුකරණය කරන්න, සහ ප්‍රශ්නෝත්තර ගන්න",
    hero_start: "ඉගෙනීම ආරම්භ කරන්න",
    hero_sandbox: "සෑන්ඩ්බොක්ස් විවෘත කරන්න",
    hero_xp_label: "ලබාගත් XP",
    hero_lesson_label: "වත්මන් පාඩම",
    hero_pct_label: "සම්පූර්ණ",

    /* ── Home Activity Strip ── */
    stat_sessions: "සැසි",
    stat_streak: "දින ශ්‍රේණිය",
    stat_lastactive: "අවසන් සක්‍රිය",

    /* ── Home Features ── */
    features_title: "A/L ICT සාර්ථකව සම්පූර්ණ කිරීමට අවශ්‍ය සියල්ල",

    feat_course_title: "මාර්ගෝපදේශ පාඨමාලාව",
    feat_course_desc: "ද්විමය සිට සම්පූර්ණ ඇඩරය දක්වා 9 අන්තර්ක්‍රියාකාරී පාඩම් හරහා ගොස් ක්ෂණික ප්‍රශ්නෝත්තර ප්‍රතිපෝෂණය ලබාගන්න",
    feat_course_tag1: "පාඩම් 9ක්",
    feat_course_tag2: "එක් පාඩමකට +10 XP",

    feat_sandbox_title: "සෑන්ඩ්බොක්ස් නිර්මාතෘ",
    feat_sandbox_desc: "අභිරුචි පරිපථ ගොඩනැගීමට ලොජික් ගේට් අදින්න. ෆ්ලිප්-ෆ්ලොප්, ඇඩර් සහ තවත් දේ සැබෑ කාලයේදී අනුකරණය කරන්න",
    feat_sandbox_tag1: "සංරචක 15ක්",
    feat_sandbox_tag2: "සජීවී අනුකරණය",

    feat_explorer_title: "ගේට් ගවේෂකය",
    feat_explorer_desc: "ඕනෑම ලොජික් ගේට්ටුවක සත්‍ය වගුව, ට්‍රාන්සිස්ටර් මට්ටමේ සැලැස්ම සහ බූලියන් ප්‍රකාශනය පරීක්ෂා කරන්න",
    feat_explorer_tag1: "සත්‍ය වගු",
    feat_explorer_tag2: "ට්‍රාන්සිස්ටර්",

    feat_subnet_title: "සබ්නෙටිං ප්‍රමුඛ",
    feat_subnet_desc: "CIDR දෘශ්‍යකාරකය, සබ්නෙට් බ්ලොක් ගවේෂකය, IP කැල්කියුලේටරය, wildcard ආවරණ — කාලය නිශ්චිත challenge ප්‍රශ්නෝත්තරය සමඟ",
    feat_subnet_tag1: "CIDR සහ ආවරණ",
    feat_subnet_tag2: "IP කැල්කියුලේටරය",

    feat_signal_title: "සංඥා කේතාංකන රසායනාගාරය",
    feat_signal_desc: "ASK, FSK, PSK, NRZ-L, Manchester සජීවී canvas හි දෘශ්‍යකරණය කරන්න. bits කේතගත/විකේතගත කරන්න, නාලිකා ධාරිතාව ගණනය කරන්න",
    feat_signal_tag1: "ප්‍රතිසදෘශ සහ ඩිජිටල්",
    feat_signal_tag2: "Shannon නියාව",

    feat_progress_title: "ඔබගේ ප්‍රගතිය",
    feat_progress_desc: "XP උපයා ඔබේ ප්‍රගතිය නිරීක්ෂණය කිරීමට පාඨමාලාව ආරම්භ කරන්න!",

    /* ── Toolbox ── */
    toolbox_title: "මෙවලම් පෙට්ටිය",
    toolbox_desc: "Canvas මත ඇදගෙන ඒ හෝ සිටීමට ක්ලික් කරන්න. ප්‍රතිදාන → ආදාන port ක්ලික් කිරීමෙන් සම්බන්ධ කරන්න.",
    toolbox_inputs: "ආදාන",
    toolbox_gates: "ලොජික් ගේට්",
    toolbox_outputs: "ප්‍රතිදාන",
    toolbox_compound: "සංයෝජිත පරිපථ",
    toolbox_advanced: "උසස්",
    toolbox_electricity: "විදුලිය",
    toolbox_templates: "සැකිලි",
    toolbox_template_hint: "Canvas ඕනෑම තැනකට ඇදගෙන ඒ, හෝ සැකිල්ල පූරණය කිරීමට ක්ලික් කරන්න.",

    tool_toggle: "ටොගල් ස්විච්",
    tool_clock: "ඔරලෝසු සංඥාව",
    tool_and: "AND ගේට්",
    tool_or: "OR ගේට්",
    tool_not: "NOT ගේට්",
    tool_nand: "NAND ගේට්",
    tool_nor: "NOR ගේට්",
    tool_xor: "XOR ගේට්",
    tool_xnor: "XNOR ගේට්",
    tool_led: "LED බල්බය",
    tool_half_adder: "අර්ධ ඇඩරය",
    tool_full_adder: "සම්පූර්ණ ඇඩරය",
    tool_d_flop: "D ෆ්ලිප්-ෆ්ලොප්",
    tool_seven_seg: "7-කොටස් ප්‍රදර්ශනය",
    tool_text_label: "පෙළ ලේබලය",
    tool_battery: "බැටරිය",
    tool_resistor: "රෙසිස්ටරය",
    tool_bulb: "බල්බය",
    tool_switch: "ස්විච්",
    tool_ammeter: "ඇම්මීටරය",
    tool_voltmeter: "වෝල්ට්මීටරය",
    tool_motor: "විදුලි මෝටරය",
    tool_fuse: "ෆ්‍යූස්",
    tool_led_elec: "LED",
    tool_junction: "රැහැන් සන්ධිය",
    tool_transistor: "NPN ට්‍රාන්සිස්ටරය",

    /* ── Templates ── */
    tpl_not_name: "NOT ප්‍රතිලෝමකය",
    tpl_not_desc: "ස්විච් → NOT → LED",
    tpl_and_name: "AND ගේට් පරීක්ෂාව",
    tpl_and_desc: "ස්විච් 2ක් → AND → LED",
    tpl_xor_name: "XOR සමතා",
    tpl_xor_desc: "bit 3ක් සමතා පරීක්ෂකය",
    tpl_sr_name: "SR ලැච්",
    tpl_sr_desc: "NAND ප්‍රතිපෝෂණ ලැච්",
    tpl_ha_name: "අර්ධ ඇඩරය",
    tpl_ha_desc: "S + Carry තර්කනය",
    tpl_fa_name: "සම්පූර්ණ ඇඩරය",
    tpl_fa_desc: "ගේට් මට්ටමේ bit 3 ඇඩරය",
    tpl_nand_name: "NAND → AND",
    tpl_nand_desc: "විශ්වීය NAND ගේට් නිරූපණය",
    tpl_dff_name: "bit 1 ලේඛිකාව",
    tpl_dff_desc: "D ෆ්ලිප්-ෆ්ලොප් නැගීම් ඔරලෝසුව",
    tpl_dec_name: "7-කොටස් විකේතකය",
    tpl_dec_desc: "bit 4 hex ප්‍රදර්ශන පරීක්ෂකය",
    tpl_divider: "A/L භෞතික විද්‍යාව — විදුලිය",
    tpl_ohm_name: "ඕම් නීතිය",
    tpl_ohm_desc: "V=IR ඇම්මීටරය සමඟ",
    tpl_vdiv_name: "වෝල්ටීය බෙදෙකය",
    tpl_vdiv_desc: "Vout = Vin × R2/(R1+R2)",
    tpl_bulb_name: "සරල පරිපථය",
    tpl_bulb_desc: "බැටරිය → රෙසිස්ටරය → බල්බය",
    tpl_trans_name: "ට්‍රාන්සිස්ටර් ස්විච්",
    tpl_trans_desc: "NPN + base ස්විච් → LED",
    tpl_tc_name: "ට්‍රාන්සිස්ටර් බරය",
    tpl_tc_desc: "ට්‍රාන්සිස්ටර් පාලිත බල්බය",

    /* ── Subnetting View ── */
    sn_badge: "A/L ICT ජාලකරණය",
    sn_title: "සබ්නෙටිං ප්‍රමුඛ",
    sn_subtitle: "ජාල සබ්නෙටිං ප්‍රශ්න ක්ෂණිකව විසඳීමට මානසික ගණිත රටා ඉගෙනන්න.",

    sn_cidr_title: "අන්තර්ක්‍රියාකාරී CIDR දෘශ්‍යකාරකය",
    sn_cidr_sub: "Class A / B / C සහාය",
    sn_cidr_desc: "ස්ලයිඩරය ඇදගෙන ඒ — ද්විමය bits, සබ්නෙට් ආවරණ සහ block ප්‍රමාණ සජීවීව යාවත්කාලීන වනු දකින්න.",
    sn_mask: "සබ්නෙට් ආවරණය",
    sn_magic: "Block ප්‍රමාණය (Magic #)",
    sn_subnets_oct: "Octet හි සබ්නෙට්",
    sn_hosts: "භාවිත කළ හැකි Hosts",

    sn_ip_title: "IP සබ්නෙට් Block සොයෙකය",
    sn_ip_sub: "ඒ IP ලිපිනය ටයිප් කර ඒකේ සබ්නෙට් block හොයාගන්න",
    sn_ip_btn: "සබ්නෙට් සොයන්න",
    sn_block_head: "/ සඳහා සබ්නෙට් Blocks",

    sn_cheat_title: "CIDR යොමු කුසලාන වගුව",
    sn_cheat_sub: "සක්‍රිය Class block සඳහා ගතිකව",
    sn_col_cidr: "CIDR",
    sn_col_mask: "සබ්නෙට් ආවරණය",
    sn_col_hosts: "භාවිත Hosts",
    sn_col_block: "Block ප්‍රමාණය",

    sn_trick_title: "මානසික සබ්නෙටිං උපක්‍රමය",
    sn_trick_sub: "ක්ෂණික පිළිතුරු සඳහා පියවර 4ක්",
    sn_step1_title: "Magic Octet සොයන්න",
    sn_step1_desc: "CIDR 8 න් බෙදන්න → සීමාව ඇත්තේ කුමන octet හිද?\nClass A (/8–/15) → 2 වන octet | Class B (/16–/23) → 3 වන | Class C (/24–/30) → 4 වන",
    sn_step2_title: "සබ්නෙට් සහ Host Bits සොයන්න",
    sn_step2_desc: "සබ්නෙට් bits = CIDR − class සීමාව. Host bits = 8 − සබ්නෙට් bits.\nඋදා: /18 (Class B): සබ්නෙට් bits = 18 − 16 = 2, host bits = 8 − 2 = 6",
    sn_step3_title: "Block ප්‍රමාණය (Magic සංඛ්‍යාව)",
    sn_step3_desc: "Magic = 2^host bits. Host bits 6 ක් සඳහා → 2^6 = 64.\nසබ්නෙට් 64 බැගින් ඉහළ යයි: .0, .64, .128, .192",
    sn_step4_title: "භාවිත Hosts",
    sn_step4_desc: "සූත්‍රය: 2^(32 − CIDR) − 2. ජාල සහ broadcast ලිපිනය සඳහා 2 ක් අඩු කරන්න.",

    sn_formula_title: "සූත්‍ර ඉක්මන් යොමු",
    sn_formula_sub: "A/L ICT ප්‍රධාන සබ්නෙටිං සූත්‍ර",
    sn_f_block: "Block ප්‍රමාණය",
    sn_f_hosts: "භාවිත Hosts",
    sn_f_subnets: "සබ්නෙට්",
    sn_f_net: "ජාල ලිපිනය",

    sn_quiz_title: "සබ්නෙට් මානසික පුහුණුකරු",
    sn_quiz_sub: "අන්තර්ක්‍රියාකාරී ප්‍රශ්න 5ක් Challenge",
    sn_quiz_desc: "සබ්නෙටිං ප්‍රශ්න ක්ෂණිකව විසඳීමට මානසික උපක්‍රම ප්‍රගුණ කරන්න.",
    sn_quiz_btn: "සබ්නෙටිං Challenge ආරම්භ කරන්න ➔",

    enc_badge: "A/L ICT ජාලකරණය",
    enc_title: "සංඥා කේතාංකන රසායනාගාරය",
    enc_subtitle: "ASK, FSK, PSK, NRZ-L/I, RZ, Manchester, AMI සහ Pseudoternary දෘශ්‍යකරණය කරන්න. Bits ටොගල් කරන්න — waveforms සජීවීව යාවත්කාලීන වේ.",

    enc_tab_analog: "ප්‍රතිසදෘශ කේතාංකනය",
    enc_tab_digital: "ඩිජිටල් රේඛා කේත",
    enc_tab_decoder: "විකේතක මෙවලම",
    enc_tab_theory: "න්‍යාය සහ යොමු",
    enc_tab_quiz: "ප්‍රශ්නෝත්තරය",

    enc_analog_title: "ප්‍රතිසදෘශ සංඥා කේතාංකනය",
    enc_analog_sub: "Bits ටොගල් කරන්න → ASK, FSK සහ PSK carrier wave මොඩියුලේට් කරනු දකින්න",
    enc_bits_label: "ද්විමය දත්ත Bits (ටොගල් කිරීමට ක්ලික් කරන්න)",
    enc_carrier: "Carrier සංඛ්‍යාතය",
    enc_ask_amp: "ASK පරාසය",
    enc_fsk_mult: "FSK සංඛ්‍යාත ගුණකය",

    enc_digital_title: "ඩිජිටල් රේඛා කේතාංකන ක්‍රම",
    enc_digital_sub: "NRZ-L, NRZ-I, RZ, AMI — bits ක්ලික් කර යාවත්කාලීන කරන්න",
    enc_bits_label2: "ද්විමය දත්ත Bits",

    enc_decoder_title: "සංඥා විකේතකය",
    enc_decoder_sub: "කේතාංකිත bits ඇලවීම → ක්‍රමය තෝරන්න → විකේතගත කරන්න",
    enc_input_label: "කේතාංකිත Bit තන්තුව",
    enc_decode_btn: "විකේතගත කරන්න →",
    enc_clear_btn: "හිස් කරන්න",
    enc_decoded_out: "විකේතගත ප්‍රතිදානය",
    enc_encode_title: "දත්ත Bits කේතාංකනය",
    enc_encode_sub: "Raw bits ටයිප් කරන්න → ක්‍රමය තෝරන්න → කේතාංකිත ප්‍රතිදානය දකින්න",
    enc_raw_label: "Raw දත්ත Bits",
    enc_encoded_out: "කේතාංකිත ප්‍රතිදානය",

    enc_theory_title: "න්‍යාය යොමු — සංඥා කේතාංකනය",
    enc_theory_sub: "A/L ICT Paper 2 සඳහා ප්‍රධාන සංකල්ප",
    enc_term_head: "ප්‍රධාන යෙදුම්",
    enc_scheme_head: "ක්‍රම සංසන්දනය",
    enc_bw_title: "කලාපය සහ නාලිකා ධාරිතා කැල්කියුලේටරය",
    enc_bw_sub: "Nyquist සහ Shannon සූත්‍ර පුහුණුකරු",
    enc_bw_label: "කලාපය (Hz)",
    enc_snr_label: "SNR (සංඥා-ශබ්ද අනුපාතය)",
    enc_m_label: "සංඥා මට්ටම් (M)",
    enc_calc_btn: "ධාරිතාව ගණනය කරන්න",

    enc_quiz_title: "සංඥා කේතාංකන ප්‍රශ්නෝත්තරය",
    enc_quiz_sub: "අන්තර්ක්‍රියාකාරී ප්‍රශ්න 5ක් Challenge",
    enc_quiz_desc: "ප්‍රතිසදෘශ/ඩිජිටල් රේඛා කේතාංකනය සහ සූත්‍ර පිළිබඳ ඔබේ A/L ICT දැනුම පරීක්ෂා කරන්න.",
    enc_quiz_btn: "සංඥා ප්‍රශ්නෝත්තරය ආරම්භ කරන්න ➔",

    settings_title: "සැකසුම් සහ ප්‍රගතිය",
    settings_subtitle: "ඔබගේ අධ්‍යයන විකල්ප සකසා ඉගෙනුම් ප්‍රගතිය backup කරන්න.",
    profile_title: "පරිශීලක පැතිකඩ",
    profile_sub: "ඔබගේ නම සකසන්න",
    username_label: "ශිෂ්‍යයාගේ නම / අන්වර්ථ නාමය",
    medium_title: "ඉගෙනුම් මාධ්‍යය",
    medium_sub: "ඔබගේ A/L ඉගෙනුම් භාෂාව තෝරන්න",
    mode_title: "අතුරුමුහුණත් තේමාව",
    mode_sub: "ඉගෙනුම් පිරිසැලසුම් විලාසය තෝරන්න",
    classic_label: "සම්භාව්‍ය ප්‍රකාරය (ක්‍රීඩා ආකාරය)",
    pro_label: "වෘත්තීය ප්‍රකාරය (අධ්‍යයන)",
    sync_title: "දත්ත සමමුහුර්තකරණය",
    sync_sub: "උපාංග අතර ප්‍රගතිය හුවමාරු කරගන්න",
    export_label: "අපනයන කේතය",
    import_label: "ආනයන කේතය",
    danger_title: "අන්තරාදායක කලාපය",
    danger_sub: "ආපසු හැරවිය නොහැකි ක්‍රියා",
    danger_reset_title: "සියලු ප්‍රගතිය නැවත සකසන්න",
    danger_reset_desc: "සියලු XP, යතුරු සහ පාඩම් දත්ත නැති වේ",

    btn_save_profile: "සුරකින්න",
    btn_copy_code: "කේතය පිටපත් කරන්න",
    btn_import_code: "ආනයනය",
    btn_reset: "නැවත සකසන්න",

    alert_saved: "පැතිකඩ සාර්ථකව සුරකින ලදී!",
    alert_copied: "සමමුහුර්ත කේතය clipboard ට පිටපත් කරන ලදී!",
    alert_import_ok: "ප්‍රගතිය සාර්ථකව ආනයනය කර සමමුහුර්ත කරන ලදී!",
    alert_import_err: "වලංගු නොවන සමමුහුර්ත කේතයකි.",
    alert_reset_confirm: "ඔබට සියලු ප්‍රගතිය මකා දැමීමට අවශ්‍ය බව සහතිකද? මෙය ආපසු හැරවිය නොහැක.",

    course_back: "← ආපසු",
    check_answer: "පිළිතුර පරීක්ෂා කරන්න",
    lesson_loading: "පාඩම පූරණය වෙමින්…",
    lesson_wait: "පාඨමාලා ද්‍රව්‍ය පූරණය වෙන තුරු රැඳී සිටින්න…",

    modal_completed: "පාඨමාලාව සම්පූර්ණ කළා!",
    modal_completed_msg: "ස්තූතියි! ඔබ ඩිජිටල් තර්කනය සහ ජාලකරණ මූලධර්ම ප්‍රගුණ කළා. Sandbox හි ඔබගේම පරිපථ ගොඩනඟා බලන්න!",
    modal_open_sandbox: "Sandbox Canvas විවෘත කරන්න",
    modal_close: "වසා දමන්න",

    footer_text: "© 2026 LogicQuest. Keshan Ransilu විසින් සංවර්ධිතයි.",

    theory_panel_title: "පරිපථ මාර්ගෝපදේශය සහ න්‍යාය",
    theory_panel_empty: "න්‍යාය සහ challenges ​බැලීමට සැකිල්ලක් තෝරන්න හෝ canvas ට ඇදගෙන ඒ!",

    save_modal_title: "පරිපථය සුරකින්න",
    save_placeholder: "පරිපථ නමක් ඇතුළත් කරන්න…",
    btn_cancel: "අවලංගු කරන්න",
    load_modal_title: "පරිපථය පූරණය කරන්න",
    btn_close: "වසා දමන්න",

    kids_label: "ළමා ප්‍රකාරය (ක්‍රීඩාශීලී)",
    kids_energy_label: "⚡ ශක්තිය (XP)",
    kids_goal_label: "🎓 පාඩම් ඉලක්කය",
    kids_grid_lang: "භාෂාව",
    kids_grid_theme: "තේමා ප්‍රකාරය",
    kids_grid_sfx: "ශබ්ද FX",
    kids_grid_alerts: "අතුරුමුහුණත",
    kids_backup_label: "මගේ ප්‍රගතිය backup කරන්න",
  }
};

export function getCurrentLang() {
  return localStorage.getItem('logicQuest_medium') || 'en';
}

export function t(key) {
  const lang = getCurrentLang();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return dict[key] ?? TRANSLATIONS.en[key] ?? key;
}

const NOTO_SINHALA = "'Noto Sans Sinhala', sans-serif";

export function applyLanguage(lang) {
  lang = lang || getCurrentLang();
  localStorage.setItem('logicQuest_medium', lang);

  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  document.documentElement.lang = lang === 'si' ? 'si' : 'en';

  if (lang === 'si') {
    document.documentElement.style.setProperty('--font-sans', NOTO_SINHALA);
    document.documentElement.style.setProperty('--font-header', NOTO_SINHALA);
  } else {
    document.documentElement.style.removeProperty('--font-sans');
    document.documentElement.style.removeProperty('--font-header');
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key] !== undefined) el.placeholder = dict[key];
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    if (dict[key] !== undefined) el.title = dict[key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  window.dispatchEvent(new CustomEvent('lq:langchange', { detail: { lang } }));
}

export function initSettingsView() {

};

export default { t, applyLanguage, getCurrentLang, TRANSLATIONS, initSettingsView };