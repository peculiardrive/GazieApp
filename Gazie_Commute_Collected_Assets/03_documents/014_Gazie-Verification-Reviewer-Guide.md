# Gazie Commute — Verification Reviewer Guide

**Purpose:** A consistent, fast rubric for reviewing user documents at the `pending_review → verified` step, so approvals don't depend on memory or mood, and don't become a bottleneck as sign-ups grow.

---

## 1. What gets submitted, by user type

**All users (rider + driver):**
- Government-issued ID
- Proof of address

**Drivers additionally:**
- Driver's licence
- Single vehicle's details (plate number, make/model, colour)

### Acceptable government-issued ID
- National ID Card / NIN slip
- International passport
- Driver's licence (also satisfies the driver-specific licence requirement if it's the same document)
- Voter's card (PVC)

### Acceptable proof of address
- Utility bill (AEDC, water corporation) — dated within the **last 3 months**
- Bank statement — dated within the **last 3 months**
- Tenancy agreement or signed rent receipt — current, not expired

---

## 2. The review checklist (run in this order)

1. **Name match** — Does the name on the ID match the name on the proof of address and the sign-up profile? Minor variations (middle name omitted, "Mohammed" vs "Muhammed") are fine. A different name entirely is not, unless a reasonable explanation is visible (e.g., spouse on a shared utility bill, address doc under a parent/landlord's name).
2. **Photo/document legibility** — Is the image clear enough to read every field? Not cropped, not blurry, not obscured by glare or a finger.
3. **Document validity** — Not expired. For NIN/voter's card there's usually no expiry; for passport and driver's licence, check the date.
4. **Address recency** — Utility bill or bank statement must be dated within 3 months of submission. Tenancy agreements just need to be currently active.
5. **Driver-specific:**
   - Licence class allows them to drive the vehicle type listed
   - Licence not expired
   - Vehicle details entered (plate, make/model, colour) are plausible and complete — no proof of ownership required for pilot, but flag obvious mismatches (e.g., plate number format doesn't look Nigerian-standard)
6. **Phone number consistency** — Matches the number used to sign up (helps catch shared/borrowed accounts).

If all six pass → **Approve.**
If one or two minor issues (blurry image, missing doc, address >3 months old) → **Request resubmission.**
If identity looks fabricated or mismatched → **Reject.**

---

## 3. Red flags — slow down and look closer

- Inconsistent fonts, spacing, or alignment on the ID itself (sign of editing)
- Name spelled differently across the two documents in a way that isn't a reasonable variant
- Proof of address that's an obvious screenshot of a screenshot (recompression artefacts, cut-off edges)
- Same proof-of-address document reused across multiple different sign-ups (different names, same bill) — worth a mental note if you start recognizing repeat documents
- Driver's licence photo doesn't visually match a National ID photo submitted by the same person (if you're able to compare)
- Vehicle details that seem inconsistent with what's typical (e.g., commercial-only plate format on a personal ride post) — not disqualifying alone, just worth a second look

None of these are individually damning — Nigerians very commonly have addresses under a landlord's or parent's name, and phone cameras produce imperfect scans. Use judgement; the bar is "reasonably confident this is a real person who is who they say they are," not forensic certainty.

---

## 4. Decision → WhatsApp/email message templates

**✅ Approved**
> Hi [Name], your Gazie Commute verification is complete ✅ You now have full access to post/request rides and view match contact details. Welcome aboard!

**🔄 Resubmission needed — blurry image**
> Hi [Name], thanks for submitting your documents. Your [ID / proof of address] photo came through too blurry for us to verify — could you retake it in good lighting, flat (not at an angle), with all four corners visible? Reply here with the new photo and we'll review right away.

**🔄 Resubmission needed — address doc too old**
> Hi [Name], your proof of address is dated more than 3 months ago, so we can't use it for verification. Could you send a more recent utility bill, bank statement, or tenancy agreement? Thanks for your patience.

**🔄 Resubmission needed — name mismatch**
> Hi [Name], the name on your [document] doesn't quite match what's on your profile / other document. If there's a simple explanation (e.g., it's a family member's utility bill), just let us know here — otherwise please send a document that matches your registered name.

**🔄 Resubmission needed — missing document**
> Hi [Name], we received your [ID / proof of address] but are still missing your [missing doc]. Once you send that, we'll complete your verification.

**❌ Rejected**
> Hi [Name], we're unable to verify your account with the documents provided. If you believe this is an error, reply here and we can take another look — otherwise you're welcome to resubmit with clearer documents.

---

## 5. Turnaround target

During pilot, aim for **same-day review** (within 12–24 hours of submission). At low volume this is a real trust signal — commuters deciding whether to trust a new platform will notice if verification is instant vs. if it drags for days. As volume grows, consider setting fixed review windows (e.g., twice a day) so it stays sustainable rather than reviewing ad hoc all day.

---

## 6. Simple tracking log (for a spreadsheet or Notion table)

| Name | Phone | User type | Docs submitted | Date submitted | Status | Date reviewed | Notes |
|---|---|---|---|---|---|---|---|

Statuses to use: `pending_review`, `resubmission_requested`, `verified`, `rejected`. This gives you a running record if a dispute comes up later, and lets you spot patterns (e.g., a lot of resubmissions for the same reason might mean the upload instructions in-app need to be clearer).

---

## 7. When this stops scaling

This manual, one-person review process works fine at pilot volume. Flag for later: once daily sign-ups regularly exceed what you can review same-day, worth revisiting — either a lightweight pre-screening script (image resolution/blur detection before it even reaches you) or bringing on a part-time reviewer once revenue allows it. Not needed yet, just worth having in the back of your mind.
