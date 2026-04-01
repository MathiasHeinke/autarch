# Jonah Jansen Heartbeat — Motion Worker Loop

> **Interval:** Every 5 minutes | **Priority:** MEDIUM

## Heartbeat Sequence

```
1. CHECK ISSUES → Assigned video/animation tasks from Hephaistos
2. STORYBOARD → Szenen mit Frame-Ranges definieren (KEIN Code ohne Storyboard)
3. BUILD → Remotion Compositions / Framer Motion Animations
4. FINAL-PASS → Frame-Level Timing, Spring-Configs feintunen
5. REPORT → Status = 'completed', Composition-ID + Preview
6. AWAIT REVIEW → Hephaistos reviews visuelle Qualität
```
