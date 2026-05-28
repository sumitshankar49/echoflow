'use client';

import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { COLOR_PALETTES } from '@/shared/theme/color-palette';
import { useColorPalette } from '@/shared/theme/color-palette-provider';

export function ColorPalettePicker() {
  const { palette, setPalette } = useColorPalette();

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Color Combination
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {COLOR_PALETTES.map((colorPalette) => {
          const isSelected = colorPalette.id === palette;

          return (
            <Button
              key={colorPalette.id}
              type="button"
              variant="outline"
              onClick={() => setPalette(colorPalette.id)}
              className={`h-11 justify-between border-border text-foreground hover:bg-accent hover:text-accent-foreground ${isSelected ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : 'bg-background/40'}`}
              aria-label={`Use ${colorPalette.label} palette`}
              aria-pressed={isSelected}
            >
              <span className="inline-flex items-center gap-2">
                <span
                  className={`h-4 w-4 rounded-full bg-gradient-to-br ${colorPalette.swatchClassName}`}
                  aria-hidden="true"
                />
                {colorPalette.label}
              </span>
              {isSelected ? <CheckCircle2 className="h-4 w-4" /> : null}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
