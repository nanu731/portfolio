# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Narayan splits the audience between college admissions readers and sports
analytics hiring readers. Both have limited time. Admissions readers may need
plain explanations of analytical terms; hiring readers need concrete methods
and supported findings.

## Product Purpose

Narayan Lekhi presents sports analytics projects with the question, method,
findings and analysis code. The blog carries notes and works in progress.

## Operating Context

Visitors can read project pages, inspect shot charts, search NBA players across
five seasons, change relocation settings and compare two players. The site uses
Astro and plain CSS. Analysis code lives in separate repositories. R plots use
SVG; the spatial explorer fetches versioned JSON on player selection.

## Capabilities and Constraints

The existing spatial explorer offers 2021-22 through 2025-26, six relocation
settings from 0% through 25%, and three court views. Comparison shares season,
relocation and view controls. Missing or unsupported estimates remain
unavailable with their reasons. Neither explorer makes a head-to-head claim.

The two content collections have separate schemas. Projects carry question,
dataset, method, repository and seasons; blog posts carry publication dates.
An empty collection has no dummy entries or filler cards. The old zone chart
remains preserved; its future remains undecided.

Narayan requires approval before dependencies, file reorganization or deletion.
This branch must not be pushed or deployed during the refinement task.

## Brand Commitments

Use the name Narayan Lekhi in the minimal header and the supplied GitHub link.
Keep factual copy and the established visual identity. Narayan supplies personal
content, results and claims; missing copy receives an obvious TODO marker.
Project writing opens with the question and reports partial or negative results.

## Evidence on Hand

The published NBA analysis, version-four five-season spatial export, existing
components and supplied AGENTS.md provide the current evidence. The independent
UI critique is saved under .impeccable/critique. Historical launch instructions
specified empty collections; the current repository contains a published NBA
project. Future work must inspect publication state rather than erase that work.

## Product Principles

- Explain the analytical question and method with concrete language.
- Preserve uncertainty and distinguish missing analysis from missing estimates.
- Let visitors inspect one player or compare two with the existing data.
- Derive claims from Narayan's content and verified exports.

## Accessibility & Inclusion

Preserve keyboard operation, visible focus, reduced-motion behavior and chart
shape cues. Check mobile reflow and enlarged text. Programmatic checks do not
establish physical touch, speech-control or screen-reader speech behavior.
