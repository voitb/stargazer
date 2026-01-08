# phase 1

1. swipable-container.test.tsx
we need to make sure the tests we have correct with [text](apps/lunamark/packages/ui/CLAUDE.md) [text](apps/lunamark/packages/ui/IMPLEMENTATION.md) [text](apps/lunamark/packages/ui/DESIGN_DECISIONS.md) [text](apps/lunamark/packages/ui/COMPONENT_ARCHITECTURE.md)

2. package/ui/components
we need to have consistency how the index exprots are done (separate type exports, separate component exports)

3. unify the pattern of the components, variants and hooks
we need to unify the way we have created the components, variants and hooks in package/ui, we need to create the rule how the components should be created and how the variants should be created and how the hooks should be created, we need to make sure we use that pattern in every package/ui component + index file + we use VariantProps<typeof x> to import the variants from the variants file

4. validate tests in the package/ui/hooks
make sure that our hooks' tests follow the same pattern as the components and variants tests

5. validate tests in the package/ui/components
make sure that our components' tests follow the same pattern as the components and variants tests

6. card components and other
please use everywhere where it's possible the "@/" pattern

7. validate ref passing props
we need to validate if we need to destruct the props from ref and it won't work with spreading props with ref inside

8. dialog-context
remove the not needed spacings (context props), dialog.tsx

9. usave of VariantProps<typeof x>
check if everything that has variants uses this

10. validate dropdown-item
why we have this ugly context passing? why are we doing something like this? how to improve it?

11. validate dropdown overall implementation
as titled, we are redundantly passing omti of children and other, please verify it

12. validate context pattern
`<${componentName}> must be used within a <DropdownSub> provider` validate if we need thhis kind of pattern when we don't have other compoennts idk, and why we have context like this if we don't have the compount components lol

13. add useMemo rule
write the useMemo rule to our markdowns, that when we have the context and we pass data to it we could use useCallabck and useMemo not to rerender values everytime

14. remove all empty variants
if for example apps/lunamark/packages/ui/components/dropdown/dropdown.variants.ts doesn't have the variants but only inline styling, remove it. 

15. remove redundant code
apps/lunamark/packages/ui/components/icons/icon.variants.ts the variants that are redundant + not user

16. validate if we should use data-slot
for readers and others - we could remove it possibly (but not sure because we have it in the ui library for developers) because lunamark is local (or self deployable) only, aria-* etc

17. instaed of hardcoding the types use
ToggleGroupItemVariantProps["size"]; <- use the types like this to have it passed from the variant not hardcoding

18. toggle-group
improve the implementation, I don't get that big chunk of the tenary, same thing in use-toggle-group, why that shit logic like this + useCallbacks (or is it because of using in context)?

19. validate theme implementation
apps/lunamark/packages/ui/hooks/theme/use-theme/use-theme.ts check if the implementation is correct or could be imrpoved, maybe split into utils or anything

# phase 2
20. review the lunamark components in the future, not essential for now

# phase 3
21. review the actions
review packages/action/action.yml if we have all the needed things there, how do we pass the gemini api key, are there any other useful things that should be handled

22. packages/action/package.json
review if we have the latest versions of the deps

23. packages/action/src/format.ts
review if there is possibly bettter way to handle that, without emojis possibly (or maybe others do it like this), maybe ascii emojis anyhow available

24. packages/action/src/github/client.ts
improve typing (as unknown as string wtf)

25. packages/action/src/index.ts
validate action implementation

26. packages/action/tsup.config.ts
why are we using this config? why cjs?

27. packages/cli/src/commands/discover.test.ts
validate tests on best practices

28. packages/cli/src/commands/discover.ts
validate implementation + why so many logs + why inlined everything -> process.exit(0); check if there is a better way to handle this

29. packages/cli/src/commands/init.ts
some parts use logger, some use console.logs -> unify everything, consider if logger is needed, if other apps like this use this solution, validate implementation

30. packages/cli/src/commands/ 
overall validations of the commands implementation

31. create rules for the implementation
create rules to follow by the ai agents

32. packages/cli/src/commands/review.ts
review how others does "help" commands, if those infos are split or how it should be done

33. packages/cli/src/index.tsx
verify cli config + everall, because I don't aggree with importing as ".js" files, why this does? Validathe if it can be done better, check if it will work on every system (linux, windows, macos)

34. packages/cli/src/logger.ts
validate logger existence validation

35. packages/cli/src/output/markdown.ts
redundant with anything I previously mentioned (icons and other stuff)

36. packages/cli/src/output/terminal.ts
validate implemnetaion

37. packages/cli/src/tui/app.tsx
split the app file gracefully, create rules of how we should be handling that app, separated utils file, hooks, separated components, validate the Conxtext provider 

38. overall tui validation, folder sturcture
validate

39. improve tui ui look

40. packages/cli/src/tui/components/review-view.tsx
split 

41. packages/cli/src/tui/components/session-list.tsx
validate implementation 

42. packages/cli/src/tui/hooks/use-review.ts 
reviewrite to one status instead of multiple states, validate the implementation further, remove callbacks

43. packages/cli/src/tui/screens/api-key-setup-screen.tsx
validate if we should have a separate hook for api key

44. packages/cli/src/tui/screens/chat-screen.tsx
create utils, remove usecallbacks, improve the chat screen + add input for chat like experience

45. packages/cli/src/tui/screens/home-screen.tsx
what even is this??

46. packages/cli/src/tui/screens/model-select-screen.tsx
find better way to access the models (research how others do this), extract to the separated const file + utils + hooks

47. packages/cli/src/tui/screens/settings-screen.tsx 
move those settings into separated file, utils + hooks

48. packages/cli/src/tui/state/app-context.tsx
move those things into separated file, utils + hooks, improve statues?

49. packages/cli/src/tui/storage/api-key-store.ts
move those things into separated file, utils + hooks

50. overall validation

# phase 4
51. add streaming of the message

52. improve ui
