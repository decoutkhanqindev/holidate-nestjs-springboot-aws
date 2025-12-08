"use client";

interface PoliciesSectionProps {
    checkInTime: string;
    checkOutTime: string;
    allowsPayAtHotel: boolean;
    selectedDocumentIds: Set<string>;
    cancellationPolicyId: string;
    reschedulePolicyId: string;
    cancellationPolicies: Array<{ id: string; name: string; description?: string }>;
    reschedulePolicies: Array<{ id: string; name: string; description?: string }>;
    identificationDocuments: Array<{ id: string; name: string }>;
    onCheckInTimeChange: (time: string) => void;
    onCheckOutTimeChange: (time: string) => void;
    onAllowsPayAtHotelChange: (value: boolean) => void;
    onSelectedDocumentIdsChange: (ids: Set<string>) => void;
    onCancellationPolicyIdChange: (id: string) => void;
    onReschedulePolicyIdChange: (id: string) => void;
}

export default function PoliciesSection({
    checkInTime,
    checkOutTime,
    allowsPayAtHotel,
    selectedDocumentIds,
    cancellationPolicyId,
    reschedulePolicyId,
    cancellationPolicies,
    reschedulePolicies,
    identificationDocuments,
    onCheckInTimeChange,
    onCheckOutTimeChange,
    onAllowsPayAtHotelChange,
    onSelectedDocumentIdsChange,
    onCancellationPolicyIdChange,
    onReschedulePolicyIdChange,
}: PoliciesSectionProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Chính sách</h3>
            </div>
            <div className="space-y-6">
                {/* Check-in/Check-out Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700 mb-2">
                            Giờ nhận phòng <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            id="checkInTime"
                            value={checkInTime}
                            onChange={(e) => onCheckInTimeChange(e.target.value)}
                            required
                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                        />
                    </div>
                    <div>
                        <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700 mb-2">
                            Giờ trả phòng <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            id="checkOutTime"
                            value={checkOutTime}
                            onChange={(e) => onCheckOutTimeChange(e.target.value)}
                            required
                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                        />
                    </div>
                </div>

                {/* Allows Pay at Hotel */}
                <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={allowsPayAtHotel}
                            onChange={(e) => onAllowsPayAtHotelChange(e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-5 h-5"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Cho phép thanh toán tại khách sạn
                        </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-8">
                        Khách hàng có thể thanh toán trực tiếp tại khách sạn khi check-in
                    </p>
                </div>

                {/* Required Identification Documents */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giấy tờ tùy thân yêu cầu
                    </label>
                    {identificationDocuments.length > 0 ? (
                        <div className="border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                            <div className="space-y-2">
                                {identificationDocuments.map((doc) => (
                                    <label
                                        key={doc.id}
                                        className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-50 border border-gray-200"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedDocumentIds.has(doc.id)}
                                            onChange={(e) => {
                                                const newSet = new Set(selectedDocumentIds);
                                                if (e.target.checked) {
                                                    newSet.add(doc.id);
                                                } else {
                                                    newSet.delete(doc.id);
                                                }
                                                onSelectedDocumentIdsChange(newSet);
                                            }}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700 flex-1">{doc.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Đang tải danh sách giấy tờ...</p>
                    )}
                </div>

                {/* Cancellation Policy - Chọn từ danh sách */}
                <div>
                    <label htmlFor="cancellationPolicy" className="block text-sm font-medium text-gray-700 mb-2">
                        Chính sách hủy phòng
                    </label>
                    {cancellationPolicies.length > 0 ? (
                        <select
                            id="cancellationPolicy"
                            value={cancellationPolicyId}
                            onChange={(e) => onCancellationPolicyIdChange(e.target.value)}
                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                        >
                            <option value="">-- Chọn chính sách hủy phòng --</option>
                            {cancellationPolicies.map((policy) => (
                                <option key={policy.id} value={policy.id}>
                                    {policy.name} {policy.description && `- ${policy.description}`}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <p className="text-sm text-gray-500">Đang tải danh sách chính sách hủy phòng...</p>
                    )}
                </div>

                {/* Reschedule Policy - Chọn từ danh sách */}
                <div>
                    <label htmlFor="reschedulePolicy" className="block text-sm font-medium text-gray-700 mb-2">
                        Chính sách đổi lịch
                    </label>
                    {reschedulePolicies.length > 0 ? (
                        <select
                            id="reschedulePolicy"
                            value={reschedulePolicyId}
                            onChange={(e) => onReschedulePolicyIdChange(e.target.value)}
                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                        >
                            <option value="">-- Chọn chính sách đổi lịch --</option>
                            {reschedulePolicies.map((policy) => (
                                <option key={policy.id} value={policy.id}>
                                    {policy.name} {policy.description && `- ${policy.description}`}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <p className="text-sm text-gray-500">Đang tải danh sách chính sách đổi lịch...</p>
                    )}
                </div>
            </div>
        </div>
    );
}



























