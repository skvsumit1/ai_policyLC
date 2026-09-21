# Dental Insurance Policy, Billing & Claims Management System
## Core Concepts — Developer Onboarding Guide

> **Audience:** Fresh graduates joining the team. This document explains the domain from first principles — what dental insurance *is*, how a policy *lives and dies*, and how money moves through the system. Read this before touching any code.

---

## Table of Contents
1. [What is Dental Insurance?](#1-what-is-dental-insurance)
2. [The Policy Lifecycle](#2-the-policy-lifecycle)
3. [Key Policy Terms](#3-key-policy-terms)
4. [Dental Plan Types](#4-dental-plan-types)
5. [Provider Concepts](#5-provider-concepts)
6. [Coding Systems](#6-coding-systems)
7. [Claims Processing](#7-claims-processing)
8. [Coordination of Benefits (COB)](#8-coordination-of-benefits-cob)
9. [Billing & Revenue Cycle Management](#9-billing--revenue-cycle-management)
10. [Clinical Documentation](#10-clinical-documentation)
11. [Key Glossary](#11-key-glossary)
12. [Identified Gaps & Open Questions](#12-identified-gaps--open-questions)

---

## 1. What is Dental Insurance?

Dental insurance is a contract between a **policyholder** (the person or their employer) and an **insurance carrier**. The policyholder pays a regular **premium** to maintain coverage. In return, the carrier agrees to pay a portion of covered dental procedure costs.

Unlike health insurance (which covers catastrophic events), dental insurance is primarily designed for **routine preventive care** and has hard caps (annual maximums) on what the plan will pay each year.

**Three parties are always involved:**
| Party | Role |
|---|---|
| **Policyholder / Member** | The insured individual. Pays premiums; receives benefits. |
| **Provider** | The dentist or dental practice. Performs procedures; files claims. |
| **Payer / Carrier** | The insurance company. Collects premiums; pays claims. |

---

## 2. The Policy Lifecycle

A policy does not spring into existence and stay there forever. It passes through defined stages. Understanding these stages is critical — **the status of a policy controls what actions are allowed** (e.g., you cannot approve a claim against a lapsed policy).

```
Application → Underwriting → [Draft] → [Active] → [Pending_Renewal]
                                            ↓               ↓
                                        [Lapsed]      [Active again]
                                            ↓
                                     [Cancelled]
```

### Stage 1: Application & Quoting
- A prospective policyholder fills out an application requesting coverage.
- The system generates a **quote** — an estimated premium based on the plan selected.
- No coverage exists yet. No claims can be filed.
- **System state:** No policy record yet, or a record in pre-quote status.

### Stage 2: Underwriting
- The insurer evaluates the applicant's risk profile to decide if, and at what premium, to offer coverage.
- For individual dental plans, underwriting is often minimal (dental has low catastrophic risk).
- For group plans, the employer's group demographics may be evaluated.
- **Result:** Accept, reject, or modify terms.

### Stage 3: Policy Issuance — `Draft`
- If underwriting approves, a policy record is created.
- The policy is in **Draft** status: terms are set, but coverage has NOT started.
- The policyholder must pay the first premium to activate.
- **System state:** `status = "Draft"`. No claims allowed.

### Stage 4: Active Policy — `Active`
- The first premium is received, and the carrier formally binds (activates) coverage.
- An **effective date** and **expiration date** are set (typically 1 year).
- A **waiting period** may apply for certain procedure types (e.g., no major restorative work for first 6 months).
- **System state:** `status = "Active"`. Claims CAN be submitted.

### Stage 5: Renewal — `Pending_Renewal`
- As the policy nears its expiration date, the carrier issues a renewal offer.
- The policyholder may accept (policy resets for another year) or decline.
- Premium rates may change at renewal based on claims history or market conditions.
- **System state:** `status = "Pending_Renewal"`.

### Stage 6: Lapse — `Lapsed`
- If a premium payment is **missed**, a **grace period** begins (typically 30 days).
- If the premium is still not paid by the end of the grace period, the policy **lapses**.
- **Coverage is suspended.** Claims for services rendered after the lapse date are denied.
- **System state:** `status = "Lapsed"`. Claims CANNOT be submitted.
- A lapsed policy may be **reinstated** if the policyholder pays overdue premiums within an allowed window.

### Stage 7: Cancellation — `Cancelled`
- Either party may cancel the policy before its expiration date.
- **Policyholder-initiated:** Voluntary termination.
- **Carrier-initiated:** Due to fraud, non-payment beyond reinstatement window, or material misrepresentation.
- **System state:** `status = "Cancelled"`. Terminal state — cannot be reactivated.

### Stage 8: Claims (Filed During Active Period)
- Claims are filed by the provider (or patient) for services rendered while the policy was Active.
- A claim has its own sub-lifecycle: `Submitted → Under_Review → Adjudicated → Approved / Denied`.
- See Section 7 for the full claims lifecycle.

---

## 3. Key Policy Terms

### Annual Maximum Benefit
The most an insurer will pay toward covered dental services **per calendar year** (or per policy year). Once exhausted, the policyholder pays 100% out-of-pocket for the rest of the year.

**Example:** Annual max = $2,000. After $2,000 in approved claims, all further claims that year are denied or patient-responsible.

### Deductible
The amount the policyholder must pay **out of pocket** before the insurer starts paying. Deductibles typically apply only to Basic and Major services, **not** to Preventive services.

**Example:** Deductible = $100. The first $100 of Basic/Major claims is patient responsibility.

### Premium
The regular payment (monthly, quarterly, or annually) made to keep the policy active. If premiums stop, the policy lapses.

### Waiting Period
A mandatory period after policy activation during which certain categories of procedures are **not covered**. Designed to prevent people from purchasing insurance only when they know they need expensive work.

| Coverage Tier | Typical Waiting Period |
|---|---|
| Preventive | None |
| Basic Restorative | 3–6 months |
| Major Restorative | 6–12 months |
| Orthodontics | 12 months |

### Coverage Tiers
Dental procedures are grouped into tiers, and each tier has a different **coinsurance** rate (how much the insurer pays after the deductible):

| Tier | Example Procedures | Typical Insurer Coverage |
|---|---|---|
| **Preventive** | Cleanings, X-rays, oral exams | 100% |
| **Basic** | Fillings, extractions, root canals | 70–80% |
| **Major** | Crowns, bridges, implants, dentures | 40–60% |
| **Orthodontic** | Braces, aligners | 50% (lifetime max) |

### Remaining Benefit
`remainingBenefit = annualMaximum - (total approved claims paid this year)`

This number decreases with every approved claim and resets at policy renewal.

### Copay / Coinsurance
- **Copay:** A fixed dollar amount paid by the patient per visit (common in HMO plans).
- **Coinsurance:** A percentage of the allowed amount the patient is responsible for (common in PPO plans).

---

## 4. Dental Plan Types

### PPO — Preferred Provider Organization
- Members can see **any** licensed dentist (in-network or out-of-network).
- **In-network:** Dentist has agreed to discounted fee schedules. Lower out-of-pocket cost.
- **Out-of-network:** Dentist bills their full UCR (Usual, Customary & Reasonable) fee. Patient pays the difference between UCR and the allowed amount.
- Most flexible plan type. Most common in the US.

### HMO — Health Maintenance Organization
- Coverage **only for in-network providers**.
- Requires selection of a **Primary Care Dentist (PCD)**.
- Lower premiums, but less flexibility.
- **Gap Exception / Single Case Agreement:** If no in-network provider exists within a set radius (e.g., 10 miles), the member can request approval to see an out-of-network provider at in-network benefit levels.

### EPO — Exclusive Provider Organization
- Similar to HMO but no referrals required.
- Strictly **no out-of-network coverage**. No gap exceptions.
- Services from non-network providers are fully out-of-pocket.

### TRICARE (Military/Veterans)
- Federal program for active military, veterans, and their families.
- Dental providers must be **registered** with TRICARE (no fee-discounted contract required).
- Medical referrals from a TRICARE physician are required for specialist care.

### Medicare
- **Traditional Medicare (Parts A & B):** Covers dental only in very limited circumstances (e.g., dental work required before heart surgery). Minimal standalone dental benefit.
- **Medicare Advantage (Part C):** Offered by commercial carriers (PPO/HMO structure). Often includes dental coverage following commercial plan rules.

### Medicaid
- State-run program for low-income individuals.
- Requires formal contracting between the dental provider and the state.
- Adult dental coverage varies significantly by state — some states offer only emergency extractions.

---

## 5. Provider Concepts

### National Provider Identifier (NPI)
A unique 10-digit identifier assigned to every healthcare provider in the US.
- **Type 1 NPI:** Assigned to individual practitioners (e.g., Dr. Jane Smith, DDS).
- **Type 2 NPI (Org/Group NPI):** Assigned to organizations or practices. Required when a practice bills medical insurance — the payer needs to know which legal entity is receiving payment.

### Credentialing vs. In-Network Contracting
These are **two separate processes** often confused with each other:

| | Credentialing | In-Network Contracting |
|---|---|---|
| **What it is** | Verifying the provider's license, education, malpractice history | Signing a fee-schedule agreement to become a network provider |
| **When required** | Before any claims can be paid | Only if the provider wants in-network status |
| **Effect** | Payer recognizes the provider identity | Payer pays at contracted (discounted) rates |

A dentist can be **credentialed but out-of-network**: they bill their full UCR rate, and the payer pays the allowed amount — leaving the patient responsible for the "balance billed" difference.

### UCR — Usual, Customary & Reasonable
The fee that the payer determines is "reasonable" for a specific procedure in a specific geographic area. This is the ceiling for what the payer will consider, regardless of what the provider charges.

---

## 6. Coding Systems

Medical and dental claims use standardized codes to describe **what was done** and **why it was done**. Choosing the right code directly impacts whether a claim is paid or denied.

### CDT Codes (Current Dental Terminology)
Published by the American Dental Association (ADA). All dental procedure codes begin with `D`:

| Code | Description |
|---|---|
| D0120 | Periodic oral evaluation |
| D1110 | Adult prophylaxis (cleaning) |
| D2392 | Posterior composite filling (3 surfaces) |
| D4341 | Periodontal scaling & root planing (SRP) |
| D7210 | Surgical extraction |
| D6010 | Implant placement |

### CPT Codes (Current Procedural Terminology)
Published by the American Medical Association (AMA). Used when billing **medical insurance** for dental procedures with medical necessity.

**Cross-Coding** maps dental CDT codes to CPT equivalents:
| CDT Code | Dental Procedure | CPT Equivalent |
|---|---|---|
| D7210 | Surgical extraction | No direct code → use `41899` (unlisted) |
| D6010 | Implant placement (single) | `21248` |
| D6010 | Implant placement (multiple) | `21249` |
| D7310 | Bone graft (maxillary) | `21210` |
| D7310 | Bone graft (mandibular) | `21215` |

**Modifier 52** is added when a service is reduced (e.g., bone graft material was not harvested from the patient directly).

### ICD-10 Codes (International Classification of Diseases, 10th Revision)
Diagnosis codes that explain **why** the procedure was performed. Required on every medical claim.

| ICD-10 Code | Diagnosis |
|---|---|
| K05.31 | Chronic periodontitis, generalized |
| K01.1 | Impacted teeth |
| G47.33 | Obstructive Sleep Apnea |
| S02.5XXA | Fracture of tooth, initial encounter |
| K08.409 | Partial edentulism (tooth loss), unspecified |

**Critical rule:** Codes must be fully extended (no "unspecified" codes where a specific code exists). Incomplete ICD-10 codes are the #1 cause of medical claim rejections.

---

## 7. Claims Processing

### What is a Claim?
A **claim** is a formal request submitted to the insurer for payment after a covered dental service is performed. The provider (dentist) typically submits claims on the patient's behalf.

### Claim Lifecycle

```
[Service Rendered]
       ↓
   [Submitted]   ← Provider submits claim (CDT code, date of service, charges)
       ↓
 [Under_Review]  ← Payer verifies policy status, eligibility, waiting periods
       ↓
 [Adjudicated]   ← Payer applies deductible, coinsurance, annual max
       ↓
[Approved]  or  [Denied]
```

### Adjudication Logic (How a Claim is Calculated)
1. **Eligibility check:** Is the policy Active on the date of service? If not → Deny.
2. **Waiting period check:** Is the procedure covered yet based on effective date? If not → Deny.
3. **Annual maximum check:** Is there remaining benefit? If exhausted → Deny.
4. **Deductible application:** If deductible not met, apply charged amount first to deductible.
5. **Coinsurance calculation:** Apply the coverage tier percentage to the remaining allowed amount.
6. **Payer pays** the calculated amount. Patient is responsible for the remainder.

**Example:**
- Procedure: Root canal (Basic tier, 80% coverage)
- Charged: $900
- Allowed (UCR): $800
- Deductible remaining: $100
- After deductible: $800 - $100 = $700 applicable
- Payer pays: $700 × 80% = $560
- Patient responsibility: $100 (deductible) + $140 (coinsurance) = $240

### Explanation of Benefits (EOB)
After adjudication, the payer sends an **EOB** to both the provider and the member. It shows:
- What was charged
- What was allowed (UCR)
- What the payer paid
- What the patient owes
- Why anything was denied

The EOB is **not a bill** — it is an informational statement.

### Prior Authorization (Pre-Auth)
For expensive or non-routine procedures (e.g., implants, crowns, periodontal surgery), the payer may require **pre-authorization** before treatment. The provider submits:
- Proposed CDT/CPT codes
- Supporting ICD-10 diagnosis codes
- Clinical documentation (X-rays, SOAP notes)

The payer reviews and either approves, modifies, or denies the planned treatment. Pre-auth does not guarantee payment — final payment depends on what was actually performed.

### Claim Denial Reasons (Common)
| Reason | Explanation |
|---|---|
| Policy not active | Service date falls after lapse/cancellation |
| Waiting period | Procedure not yet covered under the waiting period rules |
| Annual max exceeded | No remaining benefit for the year |
| Missing documentation | Required X-rays, notes, or codes are absent |
| Non-covered service | Procedure explicitly excluded from the plan |
| Duplicate claim | Same service, same date already processed |

---

## 8. Coordination of Benefits (COB)

When a patient has **two insurance plans** (e.g., covered under their own plan AND a spouse's plan), COB rules determine which plan pays first.

### Primary vs. Secondary
- **Primary payer:** Pays first, up to its benefit limits.
- **Secondary payer:** Pays after the primary, often covering the patient's remaining out-of-pocket balance.

### Medical as Primary, Dental as Secondary
This is a key strategy in the dental industry. When a dental procedure has **medical necessity** (the "why" is a diagnosable medical condition), it should be billed to **medical insurance first**:

| Condition | Dental Procedure | Bill Medical First? |
|---|---|---|
| Severe periodontal disease (K05.31) | Scaling & Root Planing (D4341) | Yes |
| Obstructive Sleep Apnea (G47.33) | Oral appliance therapy | Yes |
| Tooth fracture / trauma | Extraction or crown | Yes |
| Full bony impacted molar (K01.1) | Surgical extraction (D7210) | Yes |

**Why this matters:** Medical plans typically have higher deductibles but **much higher or unlimited** annual maximums. Billing medical first preserves the patient's dental annual maximum for other services.

After medical pays, any remaining balance is billed to dental insurance as secondary.

---

## 9. Billing & Revenue Cycle Management

### Premium Invoice Lifecycle
Every active policy generates periodic invoices (monthly, quarterly, or annually):

```
[Invoice Created] → [Unpaid] → [Paid]
                        ↓
                    [Overdue]  (if payment missed past due date)
                        ↓
                  [Policy Lapsed] (if overdue too long — triggers grace period)
```

### Invoice Fields
- **invoiceNumber:** Unique identifier
- **policyID:** Which policy this premium invoice belongs to
- **amount:** Premium due
- **status:** Unpaid / Paid / Overdue
- **dueDate:** When payment is expected
- **paidDate:** When payment was actually received (null if unpaid)
- **billingPeriod:** The coverage period this invoice covers

### CMS-1500 / HCFA 1500 Form
The standard paper (or electronic HIPAA 837P) form for submitting **medical** claims. Required fields include:
- Provider NPI (Type 1 and Type 2)
- Patient demographics
- Diagnosis codes (ICD-10)
- Procedure codes (CPT)
- Date of service, place of service
- ICD-10 code set indicator box

Dental claims submitted to dental insurers use the **ADA Dental Claim Form** instead.

### Revenue Cycle Management (RCM) Modules
The full billing workflow in a dental practice involves:

| Module | Purpose |
|---|---|
| **Insurance Verification & Benefit Tracking** | Verify active coverage, deductible status, remaining benefit before treatment |
| **Prior Authorization Engine** | Submit and track pre-auth requests |
| **Cross-Coding & CMS-1500 Generator** | Map CDT → CPT, build medical claim forms |
| **Secondary Dental Claims & COB** | Bill dental insurance after medical pays |
| **Aging, Denial Management & Rejection Tracker** | Track unpaid/denied claims and follow up |
| **Patient Statement & Co-pay Billing** | Bill patients for their out-of-pocket responsibility |
| **EFT & Deposit Reconciliation** | Match electronic payments to claims |

---

## 10. Clinical Documentation

Medical claims require **proof of medical necessity** — you must document not just *what* was done, but *why it was medically required*. The industry standard is the **SOAP note**:

### SOAP Note Structure
| Section | Contents |
|---|---|
| **S — Subjective** | Patient's chief complaint, reported symptoms, pain level (0–10), accident/trauma history, relevant medical history |
| **O — Objective** | Quantifiable clinical findings: probing depths, tooth mobility, radiographic evidence, photos |
| **A — Assessment** | Clinical diagnosis, explicitly citing ICD-10 codes |
| **P — Plan** | Proposed procedures (CDT/CPT codes), expected outcomes, follow-up schedule |

### Required Documentation Attachments
Depending on the procedure, claims may require:
- Written radiology reports (bitewing X-rays, periapical X-rays, CBCT scans)
- Intraoral and extraoral clinical photographs
- Signed Informed Consent forms
- Sleep study readings/prescriptions (for oral appliance therapy)
- Accident or trauma reports
- Specialist referral letters (for TRICARE)

---

## 11. Key Glossary

| Term | Definition |
|---|---|
| **Annual Maximum** | The maximum dollar amount an insurer will pay per policy year |
| **Adjudication** | The process of evaluating a claim and determining payer vs. patient responsibility |
| **Allowed Amount** | The payer's maximum approved rate for a procedure (UCR ceiling) |
| **Balance Billing** | When an out-of-network provider bills the patient for the difference between their fee and the insurer's allowed amount |
| **Binding** | The act of formally activating a policy after underwriting approval and first premium payment |
| **CDT Code** | Current Dental Terminology procedure code (starts with 'D') |
| **COB** | Coordination of Benefits — rules for when a patient has two insurance plans |
| **Coinsurance** | The percentage of the allowed amount the patient pays after the deductible |
| **Copay** | A fixed dollar amount the patient pays per visit (common in HMOs) |
| **CPT Code** | Current Procedural Terminology — medical procedure codes used for medical claims |
| **Deductible** | Amount the patient pays out-of-pocket before insurance kicks in |
| **EOB** | Explanation of Benefits — statement showing how a claim was processed |
| **Effective Date** | The date coverage begins |
| **Expiration Date** | The date coverage ends (unless renewed) |
| **Grace Period** | A window after a missed payment during which coverage is still technically active |
| **ICD-10** | International Classification of Diseases diagnosis code system |
| **In-Network** | A provider who has signed a contract with the insurer at discounted rates |
| **Lapse** | Termination of coverage due to non-payment |
| **Medical Necessity** | Documentation that a procedure was required for a legitimate health reason |
| **NPI** | National Provider Identifier — a unique 10-digit healthcare provider ID |
| **Out-of-Network** | A provider with no contracted rate with the insurer; patient pays the difference |
| **Policyholder** | The individual who holds the insurance contract |
| **Premium** | The periodic payment to maintain insurance coverage |
| **Prior Authorization** | Pre-approval required before certain procedures will be covered |
| **Remaining Benefit** | Annual maximum minus total approved claim payouts for the year |
| **Underwriting** | The insurer's process of evaluating risk before issuing a policy |
| **UCR** | Usual, Customary & Reasonable — the payer's benchmark fee for a procedure in a region |
| **VOB** | Verification of Benefits — confirming a patient's coverage details before treatment |
| **Waiting Period** | Time after policy activation before certain coverage tiers become active |

---

## 12. Identified Gaps & Open Questions

The following concepts are referenced in the domain but are **not yet fully modeled** in the current system. Flagged for the team to address:

| Gap | Description | Priority |
|---|---|---|
| **Grace Period Tracking** | System currently jumps from Unpaid → Lapsed. A grace period timer (typically 30 days) should sit between these states. | High |
| **Reinstatement Workflow** | There is no defined path to reinstate a lapsed policy in the current lifecycle states. | High |
| **Waiting Period Enforcement** | Waiting period end dates are stored but no claim validation logic checks them during submission. | High |
| **Annual Maximum Tracking** | `remainingBenefit` is a stored field but not automatically decremented when claims are approved. | High |
| **Deductible Tracking** | `deductibleMet` is stored but not applied during claim adjudication in the current skeleton. | Medium |
| **Prior Authorization Workflow** | No pre-auth request entity or approval flow exists yet. | Medium |
| **EOB Generation** | No formal EOB document is generated after adjudication. | Medium |
| **Multi-payer COB** | System assumes one payer per claim. No secondary claim workflow exists. | Medium |
| **CMS-1500 Form Generator** | Cross-coding (CDT → CPT) and form generation are not yet implemented. | Low (future) |
| **EFT / Payment Reconciliation** | No payment processing or reconciliation engine. | Low (future) |
| **Audit Trail / Change History** | No event log tracking who changed what and when on policies or claims. | Medium |
| **Group vs. Individual Policies** | Current model assumes individual policies. Employer-group policy structures (dependents, group billing) are not modeled. | Low (future) |
