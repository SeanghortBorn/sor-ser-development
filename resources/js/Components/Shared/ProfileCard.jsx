import React from "react";
import { LAYOUT_CONSTANTS } from "@/constants/layout";

export default function ProfileCard({ user, className = "", actions = null }) {
    if (!user) return null;

    const roleName = (user.roles_list && user.roles_list[0]?.name) || (user.roles && user.roles[0]?.name) || "User";

    return (
        <div className={`bg-white border border-gray-200 ${LAYOUT_CONSTANTS.ROUNDED.LARGE} p-4 text-pretty ${className}`}>
            <div className="flex items-start gap-3">
                <img
                    src={"/images/person-icon.svg"}
                    className="h-12 w-12 rounded-full"
                    alt="User avatar"
                />
                <div className="flex-1 min-w-0 pr-1">
                    <div className="text-sm font-bold text-gray-900 break-words">{user.name}</div>
                    <div className="text-xs text-gray-600 break-words">{user.email}</div>
                    <div className="text-xs text-blue-600 font-semibold break-words">{roleName}</div>
                </div>
            </div>

            {/* Additional info like on home */}
            <div className="mt-4 grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Age</span>
                    <span className="text-xs font-medium text-gray-800 break-words">{user.age ?? "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Education Level</span>
                    <span className="text-xs font-medium text-gray-800 break-words">{user.education_level ?? "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Khmer Writing Experience</span>
                    <span className="text-xs font-medium text-gray-800 break-words">{user.khmer_experience ?? "N/A"}</span>
                </div>
            </div>

            {actions && <div className="mt-4">{actions}</div>}
        </div>
    );
}
