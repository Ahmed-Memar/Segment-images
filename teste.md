Ensures secure JWT signature verification.

"none" or unsupported algorithms break security.
Strong algorithms are preferred; RS* is legacy.

Must be present.

Allowed: HS*, PS*, ES* (256/384/512)
RS* (256/384/512) → WARNING

"none" and unsupported → ERROR

Preferred: PS*, ES*
Recommended: HS* (with strong secret)