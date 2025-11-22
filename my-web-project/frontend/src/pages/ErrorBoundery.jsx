import React from 'react';
class ErrorBoundary extends React.Component {
    state={hasError: false}
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.log("ErrorBoundary caught an error", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-screen">
                    <h1 className="text-2xl font-bold">Something went wrong.</h1>
                    <p className="text-gray-500">Please try again later.</p>
                </div>
            );
        }

        return this.props.children;
    }
}
export default ErrorBoundary;