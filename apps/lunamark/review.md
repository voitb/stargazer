# improvements of the implementation

## move kanban components to one file / other components

@ui/components/kanban - we don't want to have the bounded components if those aren't corelated, we would like to have them as a separated parts of the components - if those are related, it should be put into the one file - just like shadcn does this and we would have to recall the names of these where we want to

## review the src/components 

We need to review the src/components in apps/lunamark to make sure those aren't duplicates (or not used components) of the package/ui for the kanban package library ui. If those are used, we would like to create the library of the kanban build like components, and those should be put into the library ui (packages/ui) so we can have them later extended as separated library for other developers

## bring back SelectItem component for Select

From packages/ui we have the Select component, I'd like to bring back the SelectItem component if user doesn't want to use the native options inside the Select but custom Select dropdown + items

## remove duplicate selectable-button

We are reexporting in the selectable-button the toggle-button component - we don't want this, we want to remove it and use the togglebutton where it's needed instead to prevent duplications and unused files

## create routing hook

for /Users/voitz/Projects/gemini-hackathon/apps/lunamark/src/routes/index.tsx we would like to create the custom hook that would handle that logic that we currently have as the routing logic so we can have clear separation of the code (this task needs to be researched with websearch and context7 to align best practices from the react documentation)

## put styles of the select into correct file

/Users/voitz/Projects/gemini-hackathon/apps/lunamark/src/styles.css has inline styles of the select that could be seprated and imported into the main file instead, same goes for the dropdown, and other. Review it and separate it properly (same for data-header, wtf is this atually), have the custom scrollbar as separated component / class to be included

## mark doen tasks 
mark done tasks in /Users/voitz/Projects/gemini-hackathon/apps/lunamark/tasks + add the voitb github as the implementer

## review the cli implementation

as title, remove the unneeded comments, clear up the implementation, preventing overengineering but serving the clear purpose

## write tests for cli

create a possible tests for the cli implementation (if it's possible)

## create the ui for the cli (later)

create the ui for the cli so we can navigate through this, just like cli coding tools like claude code, open router or other, to check the status of the review, have the info about the review inside that tool

## add ui in web for the cli (later)

create the ui for the web to use

## validate core exports

export { reviewDiff } from './review/review';
export type { ReviewOptions } from './review/review';
export type { ReviewResult, Issue, Severity, Decision } from './review/schemas';

not sure if it's correct and shouldn't be moved from the review/review to like "core" and "types" or anything better 

## avatar selectable to use button from the packages/ui

consider if we should use the button from our library into the avatar instead

## improve button's svg loader

make separated loader as svg so it can be reusable for the people also as component

## checkbox implementation validation

validate the implementation of the checkbox - i'm not sure about the implementation of the indeterminate dataState, the useEffect needance (read "you might not need an effect" from react docs)

## combobox clearance

combobox.test.tsx clear the comments, maybe we could put configureAxe as reusable accross all the components that need that, review combobox implementation ( const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeIndexRef = useRef<number | null>(null);
  activeIndexRef.current = activeIndex; i'm not sure with that implementation, multiple useControllableStates, multiple usages of the useRefs), I think it could be written more properly and state of the art, we might not need useCallback because of the no performance problems (reconsider, same for memo, but for the context we need that memo to avoid rerenders, validate with websearch and context7) + reconsider if that combobox shouldn't have renderprops pattern. Reconsider if combobox input shouldn't be taken from our package/ui. It's really big component which I don't really like, maybe it's overengineered or not done with state of the art or overall bad - maybe we don't need it at all?

## dialog clearance

We might not need useCallbacks there, there is no performance concern, we would like to add prop that on click outside the dialog would close it dialog if set 

## dropdown clearance

function setup(jsx: React.ReactElement) {
	return {
		user: userEvent.setup(),
		...render(jsx),
	};
} <- validate if it's needed, maybe we could put it as global function, maybe we need to add this to other components also

reconsider the tests based on best practices and instructions.md + design.md

same as combobox reconsider it's implementation

## reconsider merging filter components

reconsider if we should merge filter-group into filter-bar or anyhow else, to follow shadcn pattern (or patterns like we have in avatar)

## form-field

split form-field component into smaller parts of the form, description, error components, correct implementation for the form wrapper if it's needed, possible easy connection of the components with the inputs / other components

## clearance column-container
/Users/voitz/Projects/gemini-hackathon/apps/lunamark/packages/ui/components/kanban/ <- as previously, put those components into the same file for the grouping + clear the comments that aren't needed, same for column-header, drop-indicator, droppable-zone, empty-state and others that needed. If those could be reused - move them to separated components in packages/ui, if not, then put them with the correct naming into one file grouping 

/Users/voitz/Projects/gemini-hackathon/apps/lunamark/packages/ui/components/kanban/index.ts <- remove those comments 

## multi-select-chip.test.tsx remove not needed tests

consolidate the tests of the multi-select-chip to only needed and that human would really test

revalidate overall component implementation if it's corect, reusing needed components or should be rewritten with exisitng componenst, overall check implementation 

## use client Issue

not all components has "use client". we need to research if it's needed for the implementations like nextjs, to include it if we always would need to have it, we would need to websearch and context7 the best practice for that and put it into all the components of the library

## popover implementation validation

we need to validate the popover implementation, reuse from the ui package components if needed, put the CloseIcon or others into the separated component for the other developers, validate the implementation, validate if we could use it in other places, add tests

## select add tests and validate

add tests, validate and add the SelectItem for custom implementation of select

## stat-pill

add tests, validate implementation

## textarea

add tests 

## toggle

add tests, reconsider moving togglebutton into the toggle for the grouping, reconsider using ui button, same for toggle group, put toggle-group.context inside the toggle-group (or toggle if moved), reconsider toggle-group implementation

## tooltip

add tests, put context inside the tooltip, validate the implementation

## use-controllable-state, use-exit-animation clearance

remove the unnecessary comments 

## use-focus-trap

function setup(jsx: React.ReactElement) {
	return {
		user: userEvent.setup(),
		...render(jsx),
	};
}
reusable, tests are too long, do not need those overengineering

remove the unnecessary comments, review the implementation 

## use-theme

overengineered tests, remove the unnecessary comments, review the implementation

## /Users/voitz/Projects/gemini-hackathon/apps/lunamark/packages/ui/index.ts

remove unnecessary comments

## /Users/voitz/Projects/gemini-hackathon/apps/lunamark/packages/ui/tokens/ + /Users/voitz/Projects/gemini-hackathon/apps/lunamark/packages/ui/utils/create-context.ts

validate if it's used and the correctness of the implementation

## /Users/voitz/Projects/gemini-hackathon/apps/lunamark/src/components/header/header-logo.tsx

create as resuable component for the packages/ui for lunamark for other developers, validate implementation

## /Users/voitz/Projects/gemini-hackathon/apps/lunamark/src/components/task-preview-dialog/task-dialog-content.tsx

validate implementation, and the same of other /Users/voitz/Projects/gemini-hackathon/apps/lunamark/src/components/ or possible movable to packages/ui + validate /Users/voitz/Projects/gemini-hackathon/apps/lunamark/src/components/task-preview-dialog/task-preview-dialog.tsx 

## validate vitests setup
/Users/voitz/Projects/gemini-hackathon/apps/lunamark/vitest.setup.ts

## validate review implementation
/Users/voitz/Projects/gemini-hackathon/packages/cli/src/commands/review.ts

## validate termianl implementation
/Users/voitz/Projects/gemini-hackathon/packages/cli/src/output/terminal.ts
