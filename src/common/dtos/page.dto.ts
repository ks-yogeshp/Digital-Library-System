import { ApiProperty } from '@nestjs/swagger';

import { PageLinksDto } from './page-links.dto';
import { PageMetaDto } from './page-meta.dto';

export class PageDto<T> {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  readonly data: T[];

  @ApiProperty({ type: () => PageMetaDto })
  readonly meta: PageMetaDto;

  @ApiProperty({ type: () => PageLinksDto })
  readonly links: PageLinksDto;

  constructor(data: T[], page: number, limit: number, count: number, url: URL) {
    this.data = data;
    this.meta = new PageMetaDto(page, limit, count);
    this.links = new PageLinksDto(url, this.meta.totalPages, this.meta.currentPage);
  }
}
