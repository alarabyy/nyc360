import { TestBed } from '@angular/core/testing';

import { CommunityPost } from './community-post';

describe('CommunityPost', () => {
  let service: CommunityPost;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommunityPost);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
