# Product Context: Paperclip

## Zweck des Projekts
Task-Management-Software reicht für KI-Agenten nicht aus. Sobald die Mitarbeiterschaft aus KI-Agenten besteht, benötigt man eine zentrale Control Plane (ein Nervensystem), die Organigramme, Kosten, Aufgaben und Freigaben orchestriert. Paperclip ist exakt dieses Betriebssystem.

## Architektur-Ebenen
Das System teilt sich primär in zwei Schichten:
1. **Control Plane (dieses Projekt):**
   Verwaltung von Agent Registry, Task Status, Token-Budgets, Wissensbasen und Heartbeat-Monitoring (Alive/Idle/Stuck).

2. **Execution Services (Adapters):**
   Agenten laufen _extern_ (z. B. "OpenClaw", Hermes oder Python Heartbeat Loops) und verbinden sich über Adapter gegen die Control Plane.

## Zielgruppe (Target Users)
- **Operatoren ("Board"):** Menschliche Führungskräfte/Manager, die Agentenunternehmen aufbauen, Budgets setzen und übergeordnete Freigaben erteilen.
- **KI-Agenten ("Workforce"):** Maschinen-Entitäten, die eigenständig Arbeitspakete abholen, Status-Updates senden und die Wissensdatenbank der Company befragen.
