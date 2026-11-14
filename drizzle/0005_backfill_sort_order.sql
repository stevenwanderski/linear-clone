-- Give existing issues distinct positions (their number) so drag-and-drop can place cards between them.
-- Before this, every issue had sort_order 0 and the list fell back to ordering by number, so nothing moves.
UPDATE "issues" SET "sort_order" = "number" WHERE "sort_order" = 0;
