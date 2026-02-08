export const Stat = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex flex-col items-end">
        <p className="text-[10px] text-white/50">{label}</p>
        <p className="text-[12px] font-semibold">{value}</p>
    </div>
);