# TDD Cases

每條案例對應 SPEC 的 FR 編號，供 review 產出覆蓋矩陣。

| ID | 對應 FR | Given | When | Then | Mock Data | Priority |
|---|---|---|---|---|---|---|
| TC-01 | FR-XX | valid role and query | call API | returns 200 and response envelope | normal | Must |
| TC-02 | FR-XX | no matching data | call API | returns 200 with empty list | empty | Must |
| TC-03 | FR-XX | invalid date range | call API | returns 400 VALIDATION_ERROR | validation | Must |
| TC-04 | FR-XX | no permission | call API | returns 403 FORBIDDEN | permission | Must |
| TC-05 | FR-XX | boundary page size | call API | returns correct pagination | boundary | Should |
| TC-06 | FR-XX | existing response shape | call API | envelope unchanged | normal | Must |
