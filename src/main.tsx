/*
 * @Description: Copyright (c) ydfk. All rights reserved
 * @Author: ydfk
 * @Date: 2025-03-11 10:49:14
 * @LastEditors: ydfk
 * @LastEditTime: 2025-03-11 11:00:10
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./styles/globals.css";
import App from "./App";
import Unauthorized from "./components/error/unauthorized";
import { Dashboard } from "./pages/dashboard";
import { NodeManagement } from "./pages/node-management";
import { RuleManagement } from "./pages/rule-management";
import { SubscriptionManagement } from "./pages/subscription-management";
import { UserManagement } from "./pages/user-management";
import { Settings } from "./pages/settings";
import { NotFound } from "./pages/not-found";

// 创建路由
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "nodes",
        element: <NodeManagement />,
      },
      {
        path: "rules",
        element: <RuleManagement />,
      },
      {
        path: "subscriptions",
        element: <SubscriptionManagement />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ]
  },
  {
    path: "/401",
    element: <Unauthorized />,
  },
  {
    path: "*",
    element: <NotFound />,
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
