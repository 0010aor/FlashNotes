import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
// import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <Suspense>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </Suspense>
  ),
})
