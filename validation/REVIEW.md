# Concept 1 design review

## Reference and scope

Reference: the upper-left “Modern Enterprise (Clean, Professional)” panel supplied by the owner. The other three concepts were excluded. The approximately 750 × 474px panel was interpreted at 1440 × 912px desktop scale. The surrounding concept-board labels and gutters are presentation framing, not website content.

The implementation uses semantic HTML, responsive CSS and individually drawn inline SVG icons and connectors. No flattened mockup image, external font service, framework or production JavaScript is used.

## Visual comparison

Compared the rendered desktop capture with the supplied panel, then corrected headline width, navigation placement, primary-button width and connector endpoints.

- Desktop header: approximately 112px; hero ends at 758px; feature strip ends at 912px. These follow the reference panel proportions.
- Hero: left-aligned navy headline, compact open-source pill, subdued body copy and two outlined/blue actions. Right-hand six-card diagram retains the three/top, center/core, three/bottom arrangement.
- Diagram: lightly bordered white cards, blue outlined icons, fine vertical blue connectors with endpoint dots, and restrained center-card shadow.
- Background: white with a pale blue glow toward the diagram; four feature items with circular icon holders.
- Mobile: navigation stays visible, text precedes the six-card diagram, and the feature strip becomes two columns. All three architecture columns remain readable without horizontal scrolling.

## Deliberate and remaining differences

- Exact font and original vector assets were not supplied. Arial/Helvetica and hand-drawn SVG reproduce their character, but glyph shapes, logo geometry and icon details are approximations.
- Hero copy says “researches” and the bottom strip says “Read-only evidence approach” and “Support, exceptions and uncertainty.” These avoid unproven production capability and unconditional runtime/integration claims.
- Added anchored explanatory sections below the mockup area so every navigation item has a useful destination. The research status explicitly distinguishes bounded findings, synthetic positive-rule tests, and undemonstrated live positive control-effectiveness attestation.
- The original long-form background remains accessible, including its original GitHub and external reference links. The new landing page is the current research-status summary.
- This is a visual comparison, not a pixel-identical result. Rasterization, font metrics and small spacing differences remain.

## Checks

- Local HTTP server returned 200 for the site.
- Dependency-free static validation checks local files, fragment targets, unique IDs, one h1 per page and the explicit claim boundary.
- Browser checks cover five viewport widths, keyboard-focusable skip navigation, all fragment buttons/links, background round trip, reduced motion, horizontal overflow, script errors and failed local resources.
- Linked research document paths were verified against the current GitHub project tree. Original external reference URLs were preserved; their third-party availability is not controlled by this site.
- No compilation step exists: HTML/CSS/SVG are the release output. No framework or runtime dependency was introduced.

Research copy checked against the project’s current `ROADMAP.md` on 2026-10-09, including its historical-result and current-capability distinctions.
