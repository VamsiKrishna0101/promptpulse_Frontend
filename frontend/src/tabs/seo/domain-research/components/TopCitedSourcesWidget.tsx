export function TopCitedSourcesWidget() {
    return (
        <div className="flex flex-col w-full">
            <h3 className="text-[16px] font-bold text-slate-900 mb-6 flex items-center gap-2">
                Top Cited Sources
                <img 
                    src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" 
                    alt="US Flag" 
                    className="h-3 w-4 object-cover rounded-[1px] border border-slate-200" 
                />
            </h3>
            
            <div className="flex-1 flex items-center justify-center text-[13px] text-slate-400 py-4">
                We have no data to show.
            </div>
        </div>
    )
}
