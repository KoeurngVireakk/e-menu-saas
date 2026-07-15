import { Component } from "react";
import { Button, Card } from "./ui";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error("Frontend render error", { error, errorInfo });
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isAdmin = window.location.pathname.startsWith("/admin");
    const homePath = isAdmin ? "/admin" : "/";
    const homeLabel = isAdmin ? "Go back admin" : "Go back home";

    return (
      <div className="min-h-screen bg-slate-100 p-4 text-left text-slate-900">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center">
          <Card className="w-full border-rose-200 p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-rose-600">Application error</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">MenuDIGI could not load this screen</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The page could not be displayed. Reload the page or return to a stable area and try again.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button" variant="danger" onClick={() => window.location.reload()}>
                Reload page
              </Button>
              <Button as="a" href={homePath} variant="secondary">
                {homeLabel}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }
}
