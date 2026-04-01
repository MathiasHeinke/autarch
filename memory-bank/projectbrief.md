# Project Brief: Paperclip (Autarch)

## The Objective
Paperclip ist eine "Control Plane" (Kontrollinstanz) für KI-Agenten-Unternehmen. 
Das Ziel ist es, die grundlegende Infrastruktur (das "Betriebssystem") bereitzustellen, auf der autonome KI-Firmen arbeiten. Das Projekt ermöglicht die Mitarbeiterverwaltung (für Agenten), Task-Zuweisung, Kostenkontrolle (Token-Budgets), Wissensdatenbanken und die Orchestrierung der Zielhierarchie.

## Core Directives
- **Company-Scoped Architecture:** Jede Domänen-Entität und Ressource MUSS strikt auf das jeweilige Unternehmen (`company`) begrenzt sein.
- **Strict Role Separation:** "Board Access" ist der menschliche Operator (Vollzugriff), während "Agent Access" über eingeschränkte, gehashte Bearer API-Keys läuft.
- **Control-Plane Invariants:** 
  - Single-assignee Task Modell.
  - Generelle Atomarität beim Checkout von Issues.
  - Hard-Stops bei Budgetüberschreitungen.
  - Zwingendes Activity Logging bei allen Mutationsoperationen.
