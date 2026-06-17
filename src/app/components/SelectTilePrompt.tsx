interface SelectTilePromptProps {
  tileColor: string;
}

export function SelectTilePrompt({ tileColor }: SelectTilePromptProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col items-center text-center gap-2">
      <div
        className="w-8 h-8 rounded-sm shrink-0"
        style={{ backgroundColor: tileColor }}
      />
      <p className="text-sm font-semibold text-gray-700">
        Select a colored tile on the map to get started
      </p>
      <p className="text-xs text-gray-500">
        Use the search box to navigate to a specific location
      </p>
    </div>
  );
}
