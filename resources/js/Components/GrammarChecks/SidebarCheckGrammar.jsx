// import React from "react";
// import {
//   Check,
//   X,
//   AlertCircle,
//   CheckCircle2,
//   RotateCcw,
// } from "lucide-react";

// export default function SidebarCheckGrammar({ text = "", onReplace }) {
//   const corrections = [
//     { error: "helo", suggestion: "hello" },
//     { error: "wld", suggestion: "world" },
//     { error: "teh", suggestion: "the" },
//     { error: "recieve", suggestion: "receive" },
//     { error: "adress", suggestion: "address" },
//     { error: "definately", suggestion: "definitely" },
//     { error: "occured", suggestion: "occurred" },
//     { error: "seperate", suggestion: "separate" },
//     { error: "untill", suggestion: "until" },
//     { error: "wich", suggestion: "which" },
//     { error: "becuase", suggestion: "because" },
//     { error: "thier", suggestion: "their" },
//   ];

//   const foundCorrections = corrections.filter((c) =>
//     text.toLowerCase().includes(c.error)
//   );

//   return (
//     <div className="w-80 flex flex-col">
//       {/* Sidebar Container */}
//       <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg transition-all duration-300 h-[75vh] flex flex-col overflow-hidden">
//         {/* Header */}
//         <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
//           <h3 className="text-lg font-bold text-slate-800 mb-2">Grammar Check</h3>
//           <div className="flex items-center gap-2">
//             {foundCorrections.length > 0 ? (
//               <>
//                 <AlertCircle className="w-4 h-4 text-amber-500" />
//                 <span className="text-sm text-slate-600 font-medium">
//                   {foundCorrections.length} issue
//                   {foundCorrections.length > 1 ? "s" : ""} found
//                 </span>
//               </>
//             ) : (
//               <>
//                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
//                 <span className="text-sm text-slate-600 font-medium">
//                   No issues detected
//                 </span>
//               </>
//             )}
//           </div>
//         </div>

//         {/* Corrections List */}
//         <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 hide-scrollbar">
//           {foundCorrections.length > 0 ? (
//             foundCorrections.map((c) => (
//               <div
//                 key={c.error}
//                 className="group border border-slate-200 rounded-xl p-4 bg-white hover:bg-slate-50 transition-all duration-200 shadow-sm"
//               >
//                 {/* Error Display */}
//                 <div className="mb-3">
//                   <div className="flex items-center gap-2 mb-1">
//                     <AlertCircle className="w-4 h-4 text-red-500" />
//                     <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
//                       Spelling Error
//                     </span>
//                   </div>
//                   <p className="text-sm text-slate-700">
//                     <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md font-mono font-medium">
//                       {c.error}
//                     </span>
//                     <span className="mx-2 text-slate-400">→</span>
//                     <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md font-mono font-medium">
//                       {c.suggestion}
//                     </span>
//                   </p>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex gap-2">
//                   <button
//                     className="flex items-center gap-1 flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
//                     onClick={() => {
//                       if (onReplace) {
//                         const newText = text.replace(
//                           new RegExp(c.error, "gi"),
//                           c.suggestion
//                         );
//                         onReplace(newText);
//                       }
//                     }}
//                   >
//                     <Check size={16} /> Accept
//                   </button>
//                   <button className="flex items-center gap-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm">
//                     <X size={16} /> Dismiss
//                   </button>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="flex flex-col items-center justify-center h-full text-center py-8">
//               <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
//                 <CheckCircle2 className="w-8 h-8 text-emerald-600" />
//               </div>
//               <h4 className="text-lg font-semibold text-slate-800 mb-1">
//                 Great job!
//               </h4>
//               <p className="text-sm text-slate-500 leading-relaxed max-w-xs mb-4">
//                 No grammar or spelling issues detected in your text.
//               </p>
//               <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm shadow-md">
//                 <RotateCcw size={16} /> Re-check Text
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Footer Stats */}
//         {foundCorrections.length > 0 && (
//           <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
//             <div className="flex items-center justify-between text-xs text-slate-500">
//               <span>
//                 {foundCorrections.length} correction
//                 {foundCorrections.length > 1 ? "s" : ""} available
//               </span>
//               <span className="flex items-center gap-1 text-emerald-600 font-medium">
//                 <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
//                 Ready to fix
//               </span>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
