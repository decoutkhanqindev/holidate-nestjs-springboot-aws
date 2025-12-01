interface LoadingSpinnerProps {
    message?: string;
}

export default function LoadingSpinner({ message = "Đang tải..." }: LoadingSpinnerProps) {
    return (
        <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-600">{message}</p>
        </div>
    );
}

