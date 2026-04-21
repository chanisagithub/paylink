import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { linkCopy } from "@/lib/constants/copy";

type BrandingPanelProps = {
  slugValue: string;
  isActive: boolean;
  brandColor: string;
  slugError?: string;
  onSlugChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onActiveChange: (checked: boolean) => void;
};

export function BrandingPanel({
  slugValue,
  isActive,
  brandColor,
  slugError,
  onSlugChange,
  onColorChange,
  onActiveChange,
}: BrandingPanelProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="link-slug">{linkCopy.form.fields.slug.label}</Label>
        <Input
          id="link-slug"
          value={slugValue}
          onChange={(event) => onSlugChange(event.target.value)}
          placeholder={linkCopy.form.fields.slug.placeholder}
        />
        {slugError ? <p className="text-sm text-rose-400">{slugError}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="link-brand-color">{linkCopy.form.fields.brandColor.label}</Label>
        <div className="flex items-center gap-3">
          <Input
            id="link-brand-color"
            type="color"
            value={brandColor}
            className="h-11 w-16 cursor-pointer rounded-xl p-1"
            onChange={(event) => onColorChange(event.target.value)}
          />
          <Input value={brandColor} onChange={(event) => onColorChange(event.target.value)} />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
        <div>
          <p className="text-sm font-medium text-white">
            {linkCopy.form.fields.isActive.label}
          </p>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={onActiveChange}
          className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-zinc-600"
        />
      </div>
    </div>
  );
}
