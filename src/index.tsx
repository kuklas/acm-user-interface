import React from "react";
import ReactDOM from "react-dom/client";
import App from '@app/index';
import { ImpersonationProvider } from '@app/contexts/ImpersonationContext';
import { UseCaseProvider } from '@app/contexts/UseCaseContext';

const root = ReactDOM.createRoot(document.getElementById("root") as Element);

root.render(
  <React.StrictMode>
    <UseCaseProvider>
      <ImpersonationProvider>
        <App />
      </ImpersonationProvider>
    </UseCaseProvider>
  </React.StrictMode>
)
