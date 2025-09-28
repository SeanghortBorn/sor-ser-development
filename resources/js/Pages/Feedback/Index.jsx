import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumb from "@/Components/Breadcrumb";
import Pagination from "@/Components/Pagination";
import { Head, usePage } from "@inertiajs/react";

// NEW: helper to parse feedback
function parseFeedback(raw) {
    if (!raw) return { type: 'plain', raw };
    // Try JSON
    try {
        const json = JSON.parse(raw);
        if (json && (json.type === 'grammar_feedback' || json.type === 'grammar')) {
            return {
                type: 'grammar',
                error: json.error || '',
                suggestion: json.suggestion || json.replacement || '',
                text: json.text || json.message || '',
                checker_id: json.checker_id || json.checkerId || null,
                timestamp: json.timestamp || null,
                raw,
            };
        }
    } catch (e) {}
    // Pattern: Issue with word "wld" (suggested: "world") - rest of message
    const re = /^Issue with word "(.+?)" \(suggested: "(.+?)"\) -\s*(.*)$/i;
    const m = raw.match(re);
    if (m) {
        return {
            type: 'grammar',
            error: m[1],
            suggestion: m[2],
            text: m[3],
            checker_id: null,
            timestamp: null,
            raw,
        };
    }
    return { type: 'plain', raw };
}

// NEW: component to render message cell
function FeedbackMessageCell({ message }) {
    const data = parseFeedback(message);
    if (data.type !== 'grammar') return <span className="whitespace-pre-wrap break-words">{data.raw}</span>;
    return (
        <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded bg-blue-100 text-blue-700 uppercase tracking-wide">Grammar</span>
                {data.checker_id && (
                    <span className="text-[11px] text-slate-500">Doc #{data.checker_id}</span>
                )}
                {data.timestamp && (
                    <span className="text-[11px] text-slate-400">{new Date(data.timestamp).toLocaleString()}</span>
                )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded font-mono text-xs font-medium">{data.error}</span>
                <span className="text-slate-400 text-xs">→</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded font-mono text-xs font-medium">{data.suggestion || '—'}</span>
            </div>
            {data.text && (
                <div className="text-slate-700 text-xs bg-slate-50 border border-slate-200 rounded p-2 leading-relaxed">
                    {data.text}
                </div>
            )}
            {!data.text && (
                <div className="text-slate-400 text-xs italic">No extra explanation provided.</div>
            )}
            <details className="text-[11px] text-slate-400 cursor-pointer select-none">
                <summary className="outline-none focus:ring-0">Raw</summary>
                <pre className="mt-1 p-2 bg-slate-900 text-slate-200 rounded overflow-x-auto text-[10px] leading-snug max-h-40">{message}</pre>
            </details>
        </div>
    );
}

export default function FeedbackPage() {
    const { feedbacks } = usePage().props;
    const headWeb = "User Feedback List";
    const linksBreadcrumb = [
        { title: "Home", url: "/" },
        { title: headWeb, url: "" },
    ];

    return (
        <AdminLayout
            breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}
        >
            <Head title={headWeb} />
            <section className="content">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card card-outline card-info">
                            <div className="card-header">
                                <h3 className="card-title">User Feedback</h3>
                            </div>
                            <div className="card-body table-responsive p-0">
                                <table className="table table-hover text-nowrap align-middle">
                                    <thead>
                                        <tr>
                                            <th style={{width:'70px'}}>#ID</th>
                                            <th style={{width:'160px'}}>User</th>
                                            <th>Message</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {feedbacks.data.length > 0 ? (
                                            feedbacks.data.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.id}</td>
                                                    <td>
                                                        {item.user ? (
                                                            <span className="text-sm font-medium text-slate-700">{item.user.name}</span>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">Unknown</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <FeedbackMessageCell message={item.message} />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3}>No feedback found!</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="card-footer clearfix">
                                <Pagination links={feedbacks.links} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}