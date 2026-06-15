<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @mixin Model
 * @method HasMany translations()
 */
trait HasLocalizedFields
{
    public function translationFor(?string $locale): mixed
    {
        $locale = $this->normalizeLocale($locale);

        if ($this->relationLoaded('translations')) {
            return $this->getRelation('translations')->firstWhere('locale', $locale);
        }

        return $this->translations()->where('locale', $locale)->first();
    }

    public function localizedName(?string $locale): string
    {
        return $this->translationFor($locale)?->name ?: (string) $this->getAttribute('name');
    }

    public function localizedDescription(?string $locale): ?string
    {
        return $this->translationFor($locale)?->description
            ?? $this->getAttribute('description');
    }

    public function localizedAddress(?string $locale): ?string
    {
        return $this->translationFor($locale)?->address
            ?? $this->getAttribute('address');
    }

    private function normalizeLocale(?string $locale): string
    {
        return in_array($locale, ['en', 'km'], true) ? $locale : 'en';
    }
}
