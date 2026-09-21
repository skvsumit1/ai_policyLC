/* ─── shared API + helpers ─────────────────────────────────────────── */
const API = {
  BASE: '/api',
  headers() {
    const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return { 'Content-Type': 'application/json', 'x-user-id': u.id || '' };
  },
  async get(path) {
    const r = await fetch(this.BASE + path, { headers: this.headers() });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Request failed');
    return d;
  },
  async post(path, body) {
    const r = await fetch(this.BASE + path, { method: 'POST', headers: this.headers(), body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Request failed');
    return d;
  },
  async patch(path, body) {
    const r = await fetch(this.BASE + path, { method: 'PATCH', headers: this.headers(), body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Request failed');
    return d;
  }
};

function getUser() { return JSON.parse(localStorage.getItem('currentUser') || 'null'); }

function requireLogin(redirect = 'login.html') {
  if (!getUser()) window.location.href = redirect;
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

/* ─── display helpers ──────────────────────────────────────────────── */
const STATUS_COLOR = {
  Active: 'success', Draft: 'secondary', Lapsed: 'danger',
  Cancelled: 'dark', Pending_Renewal: 'warning',
  Paid: 'success', Unpaid: 'warning', Overdue: 'danger',
  Pending: 'info', Under_Review: 'primary', Adjudicated: 'secondary',
  Approved: 'success', Denied: 'danger'
};

function badge(status) {
  const c = STATUS_COLOR[status] || 'secondary';
  return `<span class="badge bg-${c}">${status.replace(/_/g, ' ')}</span>`;
}

function fmt$(n) {
  if (n === null || n === undefined) return '—';
  return '$' + parseFloat(n).toFixed(2);
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast align-items-center text-bg-${type} border-0 show position-fixed bottom-0 end-0 m-3`;
  el.style.zIndex = 9999;
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div>
    <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.closest('.toast').remove()"></button></div>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

/* ─── Learning Mode ─────────────────────────────────────────── */
const GLOSSARY = {
  cdt_code:            'CDT Code — Current Dental Terminology procedure code published by the ADA. All codes start with "D" (e.g. D0120 = periodic oral evaluation, D2392 = 3-surface composite filling).',
  cpt_code:            'CPT Code — Current Procedural Terminology code (AMA). Used when billing medical insurance for dental procedures that have medical necessity (e.g. oral surgery, implants).',
  icd10:               'ICD-10 — International Classification of Diseases, 10th revision. A diagnosis code explaining WHY the procedure was needed (e.g. K05.31 = chronic periodontitis, K01.1 = impacted teeth). Required on medical claims.',
  npi:                 'NPI — National Provider Identifier. A unique 10-digit number assigned to every licensed US healthcare provider, required by HIPAA on all insurance billing transactions.',
  coverage_tier:       'Coverage Tier — Service category that determines the coinsurance rate. Preventive (100%), Basic/fillings (70–80%), Major/crowns (40–60%), Orthodontic/braces (50%, lifetime max). Each tier may have its own waiting period.',
  preventive:          'Preventive Tier — Cleanings, X-rays, and oral exams. Covered at 100% by most plans with no deductible required. Designed to catch problems early and keep overall claim costs down.',
  basic:               'Basic Tier — Fillings, simple extractions, and root canals. Typically covered at 70–80% after the deductible. A 3–6 month waiting period usually applies for new policies.',
  major:               'Major Tier — Crowns, bridges, implants, dentures, and periodontal surgery. Covered at 40–60%. Often requires a 6–12 month waiting period and prior authorization.',
  orthodontic:         'Orthodontic Tier — Braces and aligners. Typically covered at 50% up to a separate lifetime maximum (e.g. $1,500). Usually carries a 12-month waiting period.',
  annual_max:          'Annual Maximum — The most the plan will pay toward covered dental services in one benefit year. Once exhausted, you pay 100% out-of-pocket for the rest of the year.',
  deductible:          'Deductible — The fixed amount you pay out-of-pocket before insurance starts covering costs. Typically applies only to Basic and Major services — Preventive care usually bypasses the deductible.',
  waiting_period:      'Waiting Period — A mandatory period after policy activation before certain procedure categories are covered. Prevents enrolling solely to immediately use benefits for a known condition.',
  allowed_amount:      'Allowed Amount (UCR) — The maximum the insurer considers a reasonable charge for a covered procedure in your area. If your provider bills more, you owe the difference ("balance billing").',
  patient_responsibility: 'Patient Responsibility — What you owe after the plan pays: includes any unmet deductible, your co-insurance percentage, and any charges above the allowed amount.',
  adjudication:        'Adjudication — Formal review in which the insurer checks eligibility, applies the deductible, calculates coinsurance, verifies the annual maximum, and determines the exact payment amount.',
  pending:             'Pending — The claim has been received and is queued for the adjudication review process. No payment decision has been made yet.',
  under_review:        'Under Review — The claim is actively being evaluated by an adjudicator. May require additional documentation or prior authorization verification before a decision is made.',
  premium:             'Premium — The periodic (monthly) payment to keep your policy active. Owed regardless of dental visits. Missing a payment starts a grace period; continued non-payment lapses coverage.',
  billing_period:      'Billing Period — The specific time range (e.g. one calendar month) that a premium invoice covers. Paying by the due date keeps your coverage active for that period.',
  remaining_benefit:   'Remaining Benefit — Annual Maximum minus total approved claim payouts so far this year. Decreases with each approved claim and resets to the full annual maximum at renewal.',
  effective_date:      'Effective Date — The date your policy coverage officially begins. Dental services rendered before this date are not covered, even if billed later.',
  expiration_date:     'Expiration Date — The date your current policy term ends. Coverage lapses unless renewed. The carrier typically issues a renewal offer before this date.',
  grace_period:        'Grace Period — A short window (typically 30 days) after a missed premium payment during which coverage technically remains active. If payment is not received, the policy lapses.',
  eob:                 'EOB (Explanation of Benefits) — A statement issued after adjudication showing what was charged, what was allowed, what the plan paid, and what you owe. It is NOT a bill.',
  prior_auth:          'Prior Authorization — Pre-approval from the insurer required before certain expensive procedures (e.g. crowns, implants, periodontal surgery) will be covered. Does not guarantee final payment.',
  ucr:                 'UCR (Usual, Customary & Reasonable) — The benchmark fee the payer considers reasonable for a specific procedure in your region. This is the ceiling for the allowed amount.',
  coinsurance:         'Coinsurance — The percentage of the allowed amount the patient pays after the deductible is met. Example: an 80% plan means the insurer pays 80% and you pay 20%.',
  lapse:               'Lapse — Termination of coverage due to non-payment after the grace period expires. Claims for services dated after the lapse are denied. A lapsed policy may be reinstatable within a set window.',
  cob:                 'COB (Coordination of Benefits) — Rules determining which plan pays first (primary) and which covers remaining costs (secondary) when a patient has two insurance plans.',
  ppo:                 'PPO (Preferred Provider Organization) — Flexible plan letting you see any licensed dentist. In-network providers offer lower costs via pre-negotiated fee schedules; out-of-network providers may balance-bill you.',
  hmo:                 'HMO (Health Maintenance Organization) — Managed care plan requiring in-network providers and a Primary Care Dentist selection. Lower premiums but strictly no out-of-network coverage.',
  epo:                 'EPO (Exclusive Provider Organization) — Like an HMO but no referrals needed. Strictly no out-of-network coverage; services from non-network providers are fully out-of-pocket.',
  tricare:             'TRICARE — Federal dental program for active military, veterans, and their families. Providers must be registered with TRICARE; specialist care requires a referral from a TRICARE physician.',
  medicare_advantage:  'Medicare Advantage (Part C) — Commercial Medicare plans offered by private carriers in a PPO/HMO structure. Often includes dental coverage following standard commercial plan rules.',

  /* ── Billing Process ── */
  invoice_generation:  'Invoice Generation — At the start of each billing cycle, the system automatically creates an invoice for the upcoming premium period, recording the amount owed, due date, and billing period. The invoice enters a delivery queue and a creation timestamp is logged for audit.',
  billing_cycle:       'Billing Cycle — The recurring interval (monthly, quarterly, or annually) at which the insurer generates and sends a new premium invoice. The anchor date is fixed at policy issuance. Most individual dental plans bill monthly.',
  premium_calculation: 'Premium Calculation — Your premium is actuarially priced at policy issuance using your age band, plan tier (PPO/HMO/EPO), coverage levels, geographic rating area, and group vs. individual enrollment status. It is fixed for the full policy term unless you change coverage.',
  invoice_export:      'Invoice Export & Delivery — Once generated, invoices are packaged as a PDF and/or EDI 810 transaction and sent to the policyholder via the member portal, email, or paper mail. A delivery timestamp is logged to start the payment window clock and create a traceable audit trail.',
  dunning:             'Dunning Process — A structured sequence of escalating payment-reminder notices sent when a premium invoice remains unpaid past its due date. Typical schedule: Day 1 past due → email reminder; Day 15 → written notice; Day 30 → final warning of impending lapse. Persistent non-payment is referred to collections.',
  payment_posting:     'Payment Posting — The internal step where a received payment is matched to its open invoice and recorded in the billing ledger. Posting triggers the status change from "Unpaid" to "Paid," reduces accounts receivable, and stamps a paidDate timestamp on the invoice record.',
  reconciliation:      'Reconciliation — A periodic audit (daily or monthly) where finance staff match every payment in the bank feed against open invoices in the billing system. Discrepancies — short pays, duplicate payments, unmatched credits — are flagged for manual resolution before books are closed.',
  aging:               'Invoice Aging — Categorizes outstanding invoices by how long they have been unpaid: 0–30, 31–60, 61–90, and 90+ days. The Aging Report is used by finance to prioritize collections, assess credit risk, and calculate bad-debt reserves for potential write-offs.',
  edi_810:             'EDI 810 (Invoice Transaction) — The HIPAA-compliant electronic format for transmitting invoice data to large group employers or third-party administrators (TPAs). It encodes the billing period, premium amount, subscriber list, and remittance instructions in ASC X12 segments.',
  remittance:          'Remittance — The formal transfer of premium payment from the policyholder (or employer) to the insurer, accompanied by a remittance advice document listing which invoices the payment covers. Timely remittance is required to maintain the policy in force.',
  write_off:           'Write-Off — A formal accounting action where the insurer removes an uncollectable premium balance from accounts receivable after exhausting the dunning process. The amount is transferred to a bad-debt expense account and the account may be referred to a collections agency.',

  /* ── Premium Calculations ── */
  annualized_premium:  'Annualized Premium — Your monthly premium multiplied by 12, representing the total policy cost if you pay monthly for a full year. Used as the baseline when comparing billing frequency options and projecting your annual insurance expense.',
  daily_rate:          'Daily Rate — Annual premium ÷ 365. Used to prorate charges for partial billing periods (e.g., if a policy activates on the 15th of a month, only the remaining days of that month are billed). Formula: Annual Premium ÷ 365 = Daily Rate.',
  billing_frequency:   'Billing Frequency — How often you pay your premium: Monthly (12 payments), Quarterly (4 payments), Semi-Annual (2 payments), or Annual (1 payment). Paying less frequently earns a discount (typically 1–5%) because the insurer receives funds earlier and reduces collections processing overhead.',
  ytd_premium:         'YTD Premium — Total premium payments made from the start of the current policy year through today. Compare against benefit used to gauge how much value you\'ve extracted from your coverage so far.',
  coverage_efficiency: 'Coverage Efficiency Ratio — Dollar value of claims the plan has covered ÷ total premiums you\'ve paid YTD. A ratio ≥ 1.0x means the plan has paid out at least as much as you\'ve contributed — you\'ve broken even. Higher = better value received.',
  break_even:          'Break-Even Point — The number of months of premium payments needed for cumulative premiums to equal the Annual Maximum benefit. Formula: Annual Maximum ÷ Monthly Premium = Break-Even Months. Reaching it means you could theoretically recoup a full year of maximum benefit from that point forward.',
};

function learnIcon(term) {
  const def = GLOSSARY[term];
  return def ? `<span class="learn-icon">i<span class="learn-tip">${def}</span></span>` : '';
}

function initLearningMode() {
  const nav = document.querySelector('.navbar .ms-auto');
  if (!nav) return;
  const on = localStorage.getItem('learningMode') === 'true';
  const wrap = document.createElement('div');
  wrap.className = 'd-flex align-items-center gap-2';
  wrap.innerHTML = `
    <label class="text-white-50 small mb-0 d-none d-md-inline" for="learning-toggle" style="cursor:pointer;white-space:nowrap">Learning Mode</label>
    <div class="form-check form-switch mb-0">
      <input class="form-check-input" type="checkbox" id="learning-toggle" role="switch" style="cursor:pointer">
    </div>`;
  nav.prepend(wrap);
  document.querySelectorAll('[data-learn]').forEach(el => {
    const def = GLOSSARY[el.dataset.learn];
    if (def) el.innerHTML = `i<span class="learn-tip">${def}</span>`;
  });
  document.getElementById('learning-toggle').checked = on;
  applyLearningMode(on);
  document.getElementById('learning-toggle').addEventListener('change', function () {
    localStorage.setItem('learningMode', this.checked);
    applyLearningMode(this.checked);
  });
}

function applyLearningMode(on) {
  document.body.classList.toggle('learning-mode', on);
}

initLearningMode();
