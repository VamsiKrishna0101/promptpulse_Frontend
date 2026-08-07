export function DistributionByCountryWidget() {
    return (
        <div className="flex flex-col h-full w-full">
            <h3 className="text-[15px] font-bold text-slate-900 mb-2">
                Distribution by Country
            </h3>
            
            <div className="w-full">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-200/60">
                            <th className="py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Countries</th>
                            <th className="py-2.5 text-right text-[11px] font-medium text-slate-500 uppercase tracking-wider">Visibility</th>
                            <th className="py-2.5 text-right text-[11px] font-medium text-slate-500 flex items-center justify-end gap-1 uppercase tracking-wider">
                                Mentions <span className="text-slate-300">↕</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr className="group">
                            <td className="py-3">
                                <span className="text-[13px] text-slate-700">Worldwide</span>
                            </td>
                            <td className="py-3 text-right">
                                <span className="text-[13px] text-slate-900">0</span>
                            </td>
                            <td className="py-3 text-right">
                                <span className="text-[13px] text-blue-600">0</span>
                            </td>
                        </tr>
                        <tr className="group">
                            <td className="py-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[14px]">🇦🇪</span>
                                    <span className="text-[13px] text-slate-700">AE</span>
                                </div>
                            </td>
                            <td className="py-3 text-right">
                                <span className="text-[13px] text-slate-900">0</span>
                            </td>
                            <td className="py-3 text-right">
                                <span className="text-[13px] text-blue-600">0</span>
                            </td>
                        </tr>
                        <tr className="group">
                            <td className="py-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[14px]">🇦🇷</span>
                                    <span className="text-[13px] text-slate-700">AR</span>
                                </div>
                            </td>
                            <td className="py-3 text-right">
                                <span className="text-[13px] text-slate-900">0</span>
                            </td>
                            <td className="py-3 text-right">
                                <span className="text-[13px] text-blue-600">0</span>
                            </td>
                        </tr>
                        <tr className="group">
                            <td className="py-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[14px]">🇦🇹</span>
                                    <span className="text-[13px] text-slate-700">AT</span>
                                </div>
                            </td>
                            <td className="py-3 text-right">
                                <span className="text-[13px] text-slate-900">0</span>
                            </td>
                            <td className="py-3 text-right">
                                <span className="text-[13px] text-blue-600">0</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
