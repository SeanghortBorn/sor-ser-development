import { Link } from "@inertiajs/react";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumb(props) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-4 transition-all duration-200 hover:shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">{props?.header}</h1>
                            <p className="text-sm text-gray-500">Manage and monitor your {props?.header?.toLowerCase()}</p>
                        </div>
                        <div>
                            <ol className="flex items-center gap-2 text-sm">
                                {props?.links && (
                                    props?.links.map((item, k) => {
                                        const isLast = k === props.links.length - 1;
                                        return(
                                            <li key={k} className="flex items-center gap-2">
                                                {k > 0 && (
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                )}
                                                {item?.url ? 
                                                    <Link 
                                                        href={route('dashboard')} 
                                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                                                    >
                                                        {k === 0 && <Home className="w-4 h-4" />}
                                                        {item?.title}
                                                    </Link>
                                                : 
                                                    <span className="text-gray-600 font-semibold">{item?.title}</span>
                                                }
                                            </li>
                                        )
                                    })
                                )}
                            </ol>
                        </div>
                    </div>
                </div>
    );
}