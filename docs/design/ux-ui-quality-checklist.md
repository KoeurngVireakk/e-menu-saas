# MenuDIGI UX/UI Quality Checklist

## Spacing

- Use consistent page rhythm: compact controls, roomy sections, and no crowded dense panels.
- Keep mobile padding intentional: 16px minimum on customer flows, 24px+ on admin desktop panels.
- Avoid nested cards unless the inner card is a real repeated item, modal, or framed tool.

## Typography

- Use Inter, "Noto Sans Khmer", system-ui, sans-serif.
- Reserve large display type for landing and page-level headings.
- Keep labels short, direct, and scannable.
- Khmer copy must have enough line height and should not be forced into tiny badges.

## Buttons

- Primary buttons are for the next best action.
- Secondary buttons are for safe alternatives.
- Destructive actions need explicit wording and confirmation.
- Icon buttons require accessible labels.
- Loading buttons must show busy state and avoid duplicate submissions.

## Cards

- Cards should clarify state or group related actions.
- Use white cards, thin slate borders, and restrained shadows.
- Empty cards must include next action or guidance.

## Drawers

- Drawers need accessible titles, dialog semantics, and sticky footer actions.
- Create/edit forms should stay drawer-based and list-first.
- Long forms need section grouping, validation guidance, and clear save/cancel actions.
- Unsaved-change protection is a future enhancement unless tracked form dirtiness is available.

## Tables

- Keep tables scannable with strong row identity, status badges, and clear row actions.
- Use filter/search toolbars above the table.
- No-results states should offer clear filter reset.
- Mobile tables should have card/grid alternatives when possible.

## Mobile

- Customer ordering must prioritize product choice, cart visibility, and checkout confidence.
- Tap targets should be large enough for one-handed use.
- Sticky bars must not hide critical form fields.
- Avoid tiny scroll traps inside cart/order summaries.

## Empty States

- Empty states should explain what happened and the next useful action.
- First-time setup should guide owners toward shop, branch, category, product, table QR, and test order steps.
- Do not show fake metrics or fake completion.

## Error States

- Errors should state the problem and give retry or recovery actions.
- Offline states must clearly disable ordering when submit would fail.
- Payment proof warnings should explain what the restaurant will review.

## Bilingual UX

- Shared labels should come from i18n.
- Do not translate backend product names unless backend translations are supplied.
- Language toggles must be visible in landing, auth, admin shell, and public menu.

## Accessibility

- Dialogs need role, modal semantics, and readable titles.
- Forms need labels and readable validation messages.
- Realtime status must include text, not color alone.
- Keyboard navigation must work for command/search and modal close.
- Focus rings should be visible on interactive controls.

## Animation

- Use 150ms-300ms for controls and 300ms-500ms for larger page/section transitions.
- Prefer ease-out transitions.
- Avoid excessive bounce.
- Motion must not be required to understand state.

## Performance

- Keep route lazy loading.
- Keep charts lazy and out of landing/public bundles.
- Do not import Echo/Pusher globally.
- Do not import SweetAlert2 into landing/public code.
- Preserve Vite manual chunk strategy and avoid large chunk warnings.
