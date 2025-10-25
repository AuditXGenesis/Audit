# Proof-of-Audit (PoA)

## What is PoA?
A **verifiable, on-chain attestation** that a contract version has been audited to a declared standard and risk posture.

## PoA Lifecycle
1) **Submit** contract address + metadata
2) **Analyze** (AI + human verification)
3) **Report** findings, severities, recommendations
4) **Remediate** fixes by project team, rescan/verify
5) **Attest** final status → **PoA badge** emitted on-chain
6) **Publish** to the **AuditX Registry**

## Badge Levels
- **Green:** No critical/high risks; verified mitigations for medium/low
- **Amber:** Medium/high remain; proceed with caution
- **Red:** Critical present; unsafe

## Minimal On-Chain Schema (illustrative JSON)
```json
{
  "contract": "0xabc...123",
  "chainId": 1,
  "commit": "git:deadbeef",
  "reportHash": "ipfs://bafy...cid",
  "badge": "green",
  "timestamp": 1730000000,
  "scope": {
    "solc": "0.8.24",
    "loc": 7500,
    "files": 28
  }
}
