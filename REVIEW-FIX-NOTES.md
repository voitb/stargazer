1. swipable-container.test.tsx
we need to make sure the tests we have correct with [text](apps/lunamark/packages/ui/CLAUDE.md) [text](apps/lunamark/packages/ui/IMPLEMENTATION.md) [text](apps/lunamark/packages/ui/DESIGN_DECISIONS.md) [text](apps/lunamark/packages/ui/COMPONENT_ARCHITECTURE.md)

2. package/ui/components
we need to have consistency how the index exprots are done (separate type exports, separate component exports)

3. unify the pattern of the components, variants and hooks
we need to unify the way we have created the components, variants and hooks in package/ui, we need to create the rule how the components should be created and how the variants should be created and how the hooks should be created, we need to make sure we use that pattern in every package/ui component + index file + we use VariantProps<typeof x> to import the variants from the variants file

4. 