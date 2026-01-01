import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useFileWatcher } from '@/hooks/useFileWatcher'

import appCss from '@/styles.css?url'

/**
 * Root route with QueryClient context for TanStack Query integration
 */
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Lunamark',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootComponent,
})

function RootComponent() {
  const { queryClient } = Route.useRouteContext()

  return (
    <QueryClientProvider client={queryClient}>
      <FileWatcherProvider>
        <RootDocument>
          <Outlet />
        </RootDocument>
      </FileWatcherProvider>
    </QueryClientProvider>
  )
}

/**
 * Wrapper component that enables real-time file watching
 * Must be inside QueryClientProvider since it uses useQueryClient
 */
function FileWatcherProvider({ children }: { children: React.ReactNode }) {
  // Enable file watching for real-time sync with external editors
  useFileWatcher({ enabled: true, debounceMs: 200 })
  return <>{children}</>
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
