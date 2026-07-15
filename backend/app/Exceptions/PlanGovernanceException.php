<?php

namespace App\Exceptions;

use RuntimeException;

class PlanGovernanceException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly string $errorCode,
        public readonly array $details,
        public readonly int $status = 422,
    ) {
        parent::__construct($message);
    }
}
