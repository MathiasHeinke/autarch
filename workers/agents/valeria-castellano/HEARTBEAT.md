# Dr. Valeria Castellano Heartbeat — Biostatistik Worker Loop

> **Interval:** Every 5 minutes | **Priority:** MEDIUM

## Heartbeat Sequence

```
1. CHECK ISSUES → Assigned scoring/algorithm/validation tasks from Apollo
2. FORMEL-REVIEW → Parameter-Plausibilität, Referenz-Check
3. VALIDATE → Ground-Truth-Vergleich, Effektstärken, Verteilungsanalyse
4. MDR-GATE → Score ≠ Diagnose Abgrenzung prüfen
5. REPORT → Status = 'completed', attach Validierungsbericht + Formeln
6. AWAIT REVIEW → Apollo reviews
```
