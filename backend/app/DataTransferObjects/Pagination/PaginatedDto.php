<?php

declare(strict_types=1);

namespace App\DataTransferObjects\Pagination;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Generic paginated container with the exact JSON shape produced by Laravel's
 * default LengthAwarePaginator serialization. Built from a LengthAwarePaginator
 * with the items already mapped to DTOs.
 *
 * @template T
 */
final readonly class PaginatedDto implements \JsonSerializable
{
    /**
     * @param  list<T>  $items
     * @param  list<array{url: ?string, label: string, active: bool}>  $links
     */
    public function __construct(
        public array $items,
        public int $currentPage,
        public int $perPage,
        public int $total,
        public int $lastPage,
        public ?int $from,
        public ?int $to,
        public ?string $firstPageUrl,
        public ?string $lastPageUrl,
        public ?string $nextPageUrl,
        public ?string $prevPageUrl,
        public string $path,
        public array $links,
    ) {}

    /**
     * @template TItem
     * @param  LengthAwarePaginator<int, mixed>  $paginator
     * @param  callable(mixed): TItem  $mapper
     * @return self<TItem>
     */
    public static function fromPaginator(LengthAwarePaginator $paginator, callable $mapper): self
    {
        $items = array_values(array_map($mapper, $paginator->items()));

        return new self(
            items: $items,
            currentPage: $paginator->currentPage(),
            perPage: $paginator->perPage(),
            total: $paginator->total(),
            lastPage: $paginator->lastPage(),
            from: $paginator->firstItem(),
            to: $paginator->lastItem(),
            firstPageUrl: $paginator->url(1),
            lastPageUrl: $paginator->url($paginator->lastPage()),
            nextPageUrl: $paginator->nextPageUrl(),
            prevPageUrl: $paginator->previousPageUrl(),
            path: $paginator->path() ?? '',
            links: $paginator->linkCollection()->toArray(),
        );
    }

    public function jsonSerialize(): array
    {
        return [
            'current_page'   => $this->currentPage,
            'data'           => $this->items,
            'first_page_url' => $this->firstPageUrl,
            'from'           => $this->from,
            'last_page'      => $this->lastPage,
            'last_page_url'  => $this->lastPageUrl,
            'links'          => $this->links,
            'next_page_url'  => $this->nextPageUrl,
            'path'           => $this->path,
            'per_page'       => $this->perPage,
            'prev_page_url'  => $this->prevPageUrl,
            'to'             => $this->to,
            'total'          => $this->total,
        ];
    }
}
